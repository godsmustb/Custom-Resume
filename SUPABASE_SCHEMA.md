# Supabase Database Schema

This document describes the database schema for the Custom-Resume application using Supabase PostgreSQL.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned
4. Copy your project URL and anon key to `.env` file

### 2. Run SQL Migrations

Execute the following SQL in the Supabase SQL Editor to create the necessary tables and policies.

## Database Tables

### `resumes` Table

Stores all resume data for authenticated users.

```sql
-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'My Resume',
  resume_data JSONB NOT NULL,
  current_template VARCHAR(100),
  template_customization JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS resumes_updated_at_idx ON resumes(updated_at DESC);
```

### `user_profiles` Table

Stores additional user profile information.

```sql
-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Row Level Security (RLS) Policies

### Enable RLS

```sql
-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### Resumes Policies

```sql
-- Users can view their own resumes
CREATE POLICY "Users can view own resumes"
  ON resumes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own resumes
CREATE POLICY "Users can insert own resumes"
  ON resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own resumes
CREATE POLICY "Users can update own resumes"
  ON resumes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
  ON resumes
  FOR DELETE
  USING (auth.uid() = user_id);
```

### User Profiles Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Functions

### Update Updated_at Timestamp

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to resumes table
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_profiles table
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Data Structure

### Resume Data JSONB Schema

The `resume_data` column stores the following JSON structure:

```json
{
  "personal": {
    "name": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "about": "string",
  "experience": [
    {
      "id": "string",
      "title": "string",
      "company": "string",
      "date": "string",
      "description": ["string", "string", ...]
    }
  ],
  "education": [
    {
      "id": "string",
      "degree": "string",
      "school": "string",
      "date": "string",
      "details": "string"
    }
  ],
  "skills": [
    {
      "category": "string",
      "skills": ["string", "string", ...]
    }
  ],
  "certifications": [
    {
      "id": "string",
      "name": "string",
      "issuer": "string",
      "date": "string",
      "credentialId": "string",
      "credentialUrl": "string"
    }
  ],
  "jobDescription": "string"
}
```

### Template Customization JSONB Schema

```json
{
  "colorScheme": "string",
  "font": "string",
  "spacing": "string"
}
```

## Authentication Setup

### Enable Email Authentication

1. Go to Authentication → Providers in Supabase Dashboard
2. Enable Email provider
3. Configure email templates (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

### Enable Google OAuth (Optional)

1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## Migration Checklist

- [ ] Create Supabase project
- [ ] Copy project URL and anon key to `.env`
- [ ] Run table creation SQL
- [ ] Enable RLS on both tables
- [ ] Create RLS policies for resumes
- [ ] Create RLS policies for user_profiles
- [ ] Create trigger functions
- [ ] Set up email authentication
- [ ] (Optional) Set up Google OAuth
- [ ] Test authentication flow
- [ ] Test resume CRUD operations

## Environment Variables

Add these to your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Add these to GitHub Actions secrets for deployment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Usage Notes

### Automatic vs Manual Sync

The application uses a hybrid approach:

1. **localStorage**: Immediate saves for offline functionality
2. **Supabase**: Periodic syncs to cloud (when authenticated)
3. **Auto-merge**: On login, merges localStorage with cloud data

### Data Migration

When a user first signs up, their localStorage data is automatically migrated to Supabase. Subsequent updates sync to both localStorage and Supabase.

### Offline Support

The app works offline using localStorage. Changes made offline will sync to Supabase when the user comes back online and is authenticated.

## Troubleshooting

### Common Issues

**Issue**: "permission denied for table resumes"
- **Solution**: Make sure RLS policies are created correctly

**Issue**: "relation 'resumes' does not exist"
- **Solution**: Run the table creation SQL in Supabase SQL Editor

**Issue**: User profile not created on signup
- **Solution**: Check that the trigger `on_auth_user_created` exists

**Issue**: Updates not saving to Supabase
- **Solution**: Check browser console for errors, verify authentication

## Security Considerations

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Anon key is safe to expose in client-side code
- ✅ Supabase handles authentication securely
- ⚠️ Do NOT expose service role key in client-side code

## Performance Optimization

### Indexes

- `user_id` index for fast user-specific queries
- `updated_at` index for sorting by modification time

### Query Optimization

Use `.select()` with specific columns when possible:

```javascript
// Good - only select needed columns
const { data } = await supabase
  .from('resumes')
  .select('id, title, updated_at')
  .order('updated_at', { ascending: false })

// Avoid - selects everything including large JSONB
const { data } = await supabase
  .from('resumes')
  .select('*')
```

---

## Resume Folders & Version History (v2.0)

### Additional Tables for Folder Organization and Version History

See `FOLDER_VERSION_SCHEMA.sql` for the complete SQL migration script.

#### `resume_folders` Table

Organizes resumes into folders for better management.

```sql
CREATE TABLE IF NOT EXISTS resume_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'New Folder',
  description TEXT,
  color VARCHAR(20) DEFAULT '#6366f1',
  icon VARCHAR(50) DEFAULT 'folder',
  parent_folder_id UUID REFERENCES resume_folders(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `resume_versions` Table

Stores version history for each resume, enabling rollback and comparison.

```sql
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  version_label VARCHAR(255),
  resume_data JSONB NOT NULL,
  current_template VARCHAR(100),
  template_customization JSONB,
  change_type VARCHAR(50) DEFAULT 'manual_edit',
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_resume_version UNIQUE (resume_id, version_number)
);
```

#### Additional Columns on `resumes` Table

```sql
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES resume_folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
```

#### Version History Features

- **Automatic versioning**: Versions are created automatically when resume data changes
- **Manual snapshots**: Users can create labeled snapshots before major changes
- **Version restore**: Roll back to any previous version with one click
- **Version export**: Export any version as PDF or DOCX
- **Version comparison**: Compare two versions side-by-side (client-side diff)

#### Folder Features

- **Nested folders**: Support for parent-child folder relationships
- **Color coding**: Custom colors for folder organization
- **Archive support**: Move unused resumes to archive
- **Drag and drop**: Move resumes between folders easily

---

**Last Updated**: 2026-01-18
**Version**: 2.0.0
