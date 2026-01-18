-- ============================================
-- Resume Folders & Version History Schema
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. RESUME FOLDERS TABLE
-- ============================================

-- Create resume_folders table
CREATE TABLE IF NOT EXISTS resume_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'New Folder',
  description TEXT,
  color VARCHAR(20) DEFAULT '#6366f1', -- Folder color for UI
  icon VARCHAR(50) DEFAULT 'folder', -- Icon name
  parent_folder_id UUID REFERENCES resume_folders(id) ON DELETE SET NULL, -- For nested folders
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for folders
CREATE INDEX IF NOT EXISTS resume_folders_user_id_idx ON resume_folders(user_id);
CREATE INDEX IF NOT EXISTS resume_folders_parent_idx ON resume_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS resume_folders_sort_idx ON resume_folders(user_id, sort_order);

-- ============================================
-- 2. MODIFY RESUMES TABLE
-- ============================================

-- Add folder_id column to resumes table
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES resume_folders(id) ON DELETE SET NULL;

-- Add is_archived column
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add archive date column
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Create index for folder queries
CREATE INDEX IF NOT EXISTS resumes_folder_id_idx ON resumes(folder_id);
CREATE INDEX IF NOT EXISTS resumes_archived_idx ON resumes(user_id, is_archived);

-- ============================================
-- 3. RESUME VERSIONS TABLE
-- ============================================

-- Create resume_versions table for version history
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  version_label VARCHAR(255), -- Optional label like "Before AI Improvement"
  resume_data JSONB NOT NULL,
  current_template VARCHAR(100),
  template_customization JSONB,
  change_type VARCHAR(50) DEFAULT 'manual_edit', -- 'manual_edit', 'ai_improvement', 'restore', 'duplicate', 'import'
  change_summary TEXT, -- Brief description of what changed
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique version numbers per resume
  CONSTRAINT unique_resume_version UNIQUE (resume_id, version_number)
);

-- Create indexes for version queries
CREATE INDEX IF NOT EXISTS resume_versions_resume_id_idx ON resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS resume_versions_user_id_idx ON resume_versions(user_id);
CREATE INDEX IF NOT EXISTS resume_versions_created_at_idx ON resume_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS resume_versions_number_idx ON resume_versions(resume_id, version_number DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE resume_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

-- Folder policies
CREATE POLICY "Users can view own folders"
  ON resume_folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders"
  ON resume_folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON resume_folders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON resume_folders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Version policies
CREATE POLICY "Users can view own versions"
  ON resume_versions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own versions"
  ON resume_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own versions"
  ON resume_versions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Note: Users cannot UPDATE versions (versions are immutable)

-- ============================================
-- 5. TRIGGER FUNCTIONS
-- ============================================

-- Update updated_at for folders
DROP TRIGGER IF EXISTS update_resume_folders_updated_at ON resume_folders;
CREATE TRIGGER update_resume_folders_updated_at
  BEFORE UPDATE ON resume_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create version on resume update
CREATE OR REPLACE FUNCTION create_resume_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
  change_desc TEXT;
BEGIN
  -- Only create version if resume_data actually changed
  IF OLD.resume_data IS DISTINCT FROM NEW.resume_data
     OR OLD.current_template IS DISTINCT FROM NEW.current_template
     OR OLD.template_customization IS DISTINCT FROM NEW.template_customization THEN

    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM resume_versions
    WHERE resume_id = OLD.id;

    -- Determine change type based on data comparison
    IF OLD.resume_data IS DISTINCT FROM NEW.resume_data THEN
      change_desc := 'Resume content updated';
    ELSIF OLD.current_template IS DISTINCT FROM NEW.current_template THEN
      change_desc := 'Template changed';
    ELSE
      change_desc := 'Template customization updated';
    END IF;

    -- Insert the OLD version into version history
    INSERT INTO resume_versions (
      resume_id,
      user_id,
      version_number,
      resume_data,
      current_template,
      template_customization,
      change_type,
      change_summary
    ) VALUES (
      OLD.id,
      OLD.user_id,
      next_version,
      OLD.resume_data,
      OLD.current_template,
      OLD.template_customization,
      'manual_edit',
      change_desc
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for version history
DROP TRIGGER IF EXISTS resume_version_trigger ON resumes;
CREATE TRIGGER resume_version_trigger
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION create_resume_version();

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to get version history for a resume
CREATE OR REPLACE FUNCTION get_resume_versions(p_resume_id UUID, p_user_id UUID)
RETURNS TABLE (
  id UUID,
  version_number INTEGER,
  version_label VARCHAR,
  change_type VARCHAR,
  change_summary TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rv.id,
    rv.version_number,
    rv.version_label,
    rv.change_type,
    rv.change_summary,
    rv.created_at
  FROM resume_versions rv
  WHERE rv.resume_id = p_resume_id
    AND rv.user_id = p_user_id
  ORDER BY rv.version_number DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a specific version
CREATE OR REPLACE FUNCTION restore_resume_version(
  p_version_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_resume_id UUID;
  v_version_data RECORD;
  v_result JSONB;
BEGIN
  -- Get the version data
  SELECT * INTO v_version_data
  FROM resume_versions
  WHERE id = p_version_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Version not found');
  END IF;

  -- Update the resume with version data
  UPDATE resumes
  SET
    resume_data = v_version_data.resume_data,
    current_template = v_version_data.current_template,
    template_customization = v_version_data.template_customization,
    updated_at = NOW()
  WHERE id = v_version_data.resume_id AND user_id = p_user_id;

  -- The trigger will automatically create a new version entry

  RETURN jsonb_build_object(
    'success', true,
    'resume_id', v_version_data.resume_id,
    'restored_version', v_version_data.version_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get folder tree for a user
CREATE OR REPLACE FUNCTION get_user_folder_tree(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  color VARCHAR,
  icon VARCHAR,
  parent_folder_id UUID,
  sort_order INTEGER,
  resume_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.description,
    f.color,
    f.icon,
    f.parent_folder_id,
    f.sort_order,
    COUNT(r.id) as resume_count,
    f.created_at,
    f.updated_at
  FROM resume_folders f
  LEFT JOIN resumes r ON r.folder_id = f.id AND r.is_archived = false
  WHERE f.user_id = p_user_id
  GROUP BY f.id
  ORDER BY f.sort_order, f.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. CREATE DEFAULT "All Resumes" VIEW
-- ============================================

-- This is handled in the application layer, not database
-- "All Resumes" = resumes where folder_id IS NULL
-- "Archived" = resumes where is_archived = true

-- ============================================
-- 8. MIGRATION FOR EXISTING DATA
-- ============================================

-- Create initial version for all existing resumes (run once)
-- This preserves the current state as version 1
INSERT INTO resume_versions (
  resume_id,
  user_id,
  version_number,
  resume_data,
  current_template,
  template_customization,
  change_type,
  change_summary
)
SELECT
  id,
  user_id,
  1,
  resume_data,
  current_template,
  template_customization,
  'import',
  'Initial version (migrated from existing data)'
FROM resumes
WHERE NOT EXISTS (
  SELECT 1 FROM resume_versions WHERE resume_versions.resume_id = resumes.id
);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- After running this SQL:
-- 1. Existing resumes will have folder_id = NULL (appears in "All Resumes")
-- 2. Existing resumes will have is_archived = false
-- 3. Each existing resume will have version 1 created
-- 4. Future updates will automatically create version history
