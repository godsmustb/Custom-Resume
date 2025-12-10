# Job Search Feature - Database Schema

This document contains the SQL migrations for the Job Search feature in the Custom Resume application.

## Overview

The Job Search feature enables users to:
- Search for jobs on LinkedIn by job title
- View scraped job listings with advanced filters
- Save jobs for later application
- Track application status manually
- View application analytics on dashboard

## Database Tables

### 1. `job_listings` - Stores all scraped job data (shared across users)
### 2. `user_job_applications` - Tracks user-specific saved jobs and application status
### 3. `user_search_queries` - Stores user's search history for quick access

---

## SQL Migrations

Run these SQL commands in your Supabase SQL Editor (Dashboard → SQL Editor → New Query).

### Step 1: Create Tables

```sql
-- ============================================================================
-- TABLE: job_listings
-- Description: Stores all scraped LinkedIn job listings (shared across users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Job Identifiers
  job_url TEXT UNIQUE NOT NULL,                    -- LinkedIn job URL (unique identifier)
  linkedin_job_id TEXT,                            -- Extracted LinkedIn job ID from URL

  -- Basic Job Info
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  work_type TEXT,                                  -- Remote, Hybrid, On-site
  employment_type TEXT,                            -- Full-time, Part-time, Contract, Internship
  experience_level TEXT,                           -- Entry level, Mid-Senior, Director, Executive

  -- Job Details
  job_description TEXT,                            -- Full job description HTML/text
  salary_range TEXT,                               -- e.g., "$80,000 - $120,000/year"

  -- Application Info
  easy_apply BOOLEAN DEFAULT false,                -- True if job has Easy Apply
  applicant_count INTEGER,                         -- Number of applicants (if visible)
  date_posted DATE,                                -- When job was posted

  -- Metadata
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,                  -- False if job is no longer available

  -- Indexes for performance
  CONSTRAINT job_listings_pkey PRIMARY KEY (id)
);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_job_listings_url ON job_listings(job_url);
CREATE INDEX IF NOT EXISTS idx_job_listings_title ON job_listings(job_title);
CREATE INDEX IF NOT EXISTS idx_job_listings_company ON job_listings(company_name);
CREATE INDEX IF NOT EXISTS idx_job_listings_location ON job_listings(location);
CREATE INDEX IF NOT EXISTS idx_job_listings_work_type ON job_listings(work_type);
CREATE INDEX IF NOT EXISTS idx_job_listings_easy_apply ON job_listings(easy_apply);
CREATE INDEX IF NOT EXISTS idx_job_listings_date_posted ON job_listings(date_posted DESC);
CREATE INDEX IF NOT EXISTS idx_job_listings_scraped_at ON job_listings(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_listings_active ON job_listings(is_active);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_job_listings_filters
  ON job_listings(date_posted DESC, easy_apply, work_type, is_active);


-- ============================================================================
-- TABLE: user_job_applications
-- Description: User-specific job tracking (saved jobs, application status)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_listing_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,

  -- Application Status
  status TEXT DEFAULT 'saved',                     -- saved, applied, interviewing, offer, rejected, withdrawn
  applied_date DATE,                               -- When user applied (if status = applied)

  -- Resume & Cover Letter Used
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  resume_snapshot JSONB,                           -- Frozen copy of resume data used for application
  cover_letter_text TEXT,                          -- Cover letter used (if any)

  -- User Notes & Tracking
  notes TEXT,                                      -- User's personal notes about this job
  follow_up_date DATE,                             -- Reminder date for follow-up
  interview_dates JSONB,                           -- Array of interview timestamps and notes

  -- Metadata
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT user_job_applications_pkey PRIMARY KEY (id),
  CONSTRAINT unique_user_job UNIQUE(user_id, job_listing_id)  -- Prevent duplicate saves
);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON user_job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_status ON user_job_applications(status);
CREATE INDEX IF NOT EXISTS idx_user_applications_saved_at ON user_job_applications(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_applications_applied_date ON user_job_applications(applied_date DESC);

-- Composite index for user dashboard queries
CREATE INDEX IF NOT EXISTS idx_user_applications_dashboard
  ON user_job_applications(user_id, status, saved_at DESC);


-- ============================================================================
-- TABLE: user_search_queries
-- Description: Stores user's job search history for quick re-search
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Search Parameters
  job_title TEXT NOT NULL,
  location TEXT,
  work_type TEXT,                                  -- Filter applied during search
  easy_apply_only BOOLEAN DEFAULT false,

  -- Results
  results_count INTEGER DEFAULT 0,                 -- Number of jobs found

  -- Metadata
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT user_search_queries_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_searches_user_id ON user_search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_searched_at ON user_search_queries(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_searches_job_title ON user_search_queries(job_title);
```

---

### Step 2: Create Auto-Update Trigger for `updated_at`

```sql
-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_job_applications
DROP TRIGGER IF EXISTS update_user_job_applications_updated_at ON user_job_applications;
CREATE TRIGGER update_user_job_applications_updated_at
  BEFORE UPDATE ON user_job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to job_listings
DROP TRIGGER IF EXISTS update_job_listings_updated_at ON job_listings;
CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Step 3: Enable Row Level Security (RLS)

```sql
-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on user-specific tables
ALTER TABLE user_job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_queries ENABLE ROW LEVEL SECURITY;

-- job_listings is public (no RLS) - all users can view all jobs


-- ============================================================================
-- RLS POLICIES: user_job_applications
-- ============================================================================

-- Users can view their own saved jobs/applications
CREATE POLICY "Users can view own job applications"
  ON user_job_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save jobs (create applications)
CREATE POLICY "Users can create own job applications"
  ON user_job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications
CREATE POLICY "Users can update own job applications"
  ON user_job_applications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved jobs
CREATE POLICY "Users can delete own job applications"
  ON user_job_applications
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================================
-- RLS POLICIES: user_search_queries
-- ============================================================================

-- Users can view their own search history
CREATE POLICY "Users can view own search queries"
  ON user_search_queries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create search history entries
CREATE POLICY "Users can create own search queries"
  ON user_search_queries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own search history
CREATE POLICY "Users can delete own search queries"
  ON user_search_queries
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

### Step 4: Create Auto-Cleanup Function (Delete Old Jobs)

```sql
-- ============================================================================
-- FUNCTION: Clean up jobs older than 30 days
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_job_listings()
RETURNS void AS $$
BEGIN
  -- Mark jobs older than 30 days as inactive
  UPDATE job_listings
  SET is_active = false
  WHERE date_posted < CURRENT_DATE - INTERVAL '30 days'
    AND is_active = true;

  -- Delete scraped jobs older than 60 days (with no user applications)
  DELETE FROM job_listings
  WHERE scraped_at < NOW() - INTERVAL '60 days'
    AND is_active = false
    AND NOT EXISTS (
      SELECT 1 FROM user_job_applications
      WHERE user_job_applications.job_listing_id = job_listings.id
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily (using pg_cron extension)
-- Note: pg_cron may not be available on Supabase free tier
-- Alternative: Call this function from a Supabase Edge Function or client-side

-- If pg_cron is available:
-- SELECT cron.schedule('cleanup-old-jobs', '0 2 * * *', 'SELECT cleanup_old_job_listings()');
```

---

### Step 5: Create Helper Functions

```sql
-- ============================================================================
-- FUNCTION: Get job application statistics for user
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_job_stats(p_user_id UUID)
RETURNS TABLE(
  total_saved BIGINT,
  total_applied BIGINT,
  total_interviewing BIGINT,
  total_offers BIGINT,
  total_rejected BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'saved') AS total_saved,
    COUNT(*) FILTER (WHERE status = 'applied') AS total_applied,
    COUNT(*) FILTER (WHERE status = 'interviewing') AS total_interviewing,
    COUNT(*) FILTER (WHERE status = 'offer') AS total_offers,
    COUNT(*) FILTER (WHERE status = 'rejected') AS total_rejected
  FROM user_job_applications
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FUNCTION: Search job listings with filters
-- ============================================================================

CREATE OR REPLACE FUNCTION search_jobs(
  p_job_title TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_work_type TEXT DEFAULT NULL,
  p_easy_apply_only BOOLEAN DEFAULT false,
  p_date_filter TEXT DEFAULT 'all', -- 'day', 'week', 'month', 'all'
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  job_url TEXT,
  job_title TEXT,
  company_name TEXT,
  location TEXT,
  work_type TEXT,
  employment_type TEXT,
  experience_level TEXT,
  job_description TEXT,
  salary_range TEXT,
  easy_apply BOOLEAN,
  applicant_count INTEGER,
  date_posted DATE,
  scraped_at TIMESTAMPTZ
) AS $$
DECLARE
  date_cutoff DATE;
BEGIN
  -- Calculate date cutoff based on filter
  CASE p_date_filter
    WHEN 'day' THEN date_cutoff := CURRENT_DATE - INTERVAL '1 day';
    WHEN 'week' THEN date_cutoff := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'month' THEN date_cutoff := CURRENT_DATE - INTERVAL '30 days';
    ELSE date_cutoff := '1970-01-01'::DATE;
  END CASE;

  RETURN QUERY
  SELECT
    jl.id,
    jl.job_url,
    jl.job_title,
    jl.company_name,
    jl.location,
    jl.work_type,
    jl.employment_type,
    jl.experience_level,
    jl.job_description,
    jl.salary_range,
    jl.easy_apply,
    jl.applicant_count,
    jl.date_posted,
    jl.scraped_at
  FROM job_listings jl
  WHERE is_active = true
    AND (p_job_title IS NULL OR jl.job_title ILIKE '%' || p_job_title || '%')
    AND (p_location IS NULL OR jl.location ILIKE '%' || p_location || '%')
    AND (p_work_type IS NULL OR jl.work_type = p_work_type)
    AND (p_easy_apply_only = false OR jl.easy_apply = true)
    AND jl.date_posted >= date_cutoff
  ORDER BY jl.date_posted DESC, jl.scraped_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

---

## Data Types & Enums

### Application Status Values
- `saved` - User saved job for later review
- `applied` - User has applied to this job
- `interviewing` - User has interview scheduled
- `offer` - User received offer
- `rejected` - Application rejected
- `withdrawn` - User withdrew application

### Work Type Values
- `Remote`
- `Hybrid`
- `On-site`

### Employment Type Values
- `Full-time`
- `Part-time`
- `Contract`
- `Internship`
- `Temporary`

### Experience Level Values
- `Internship`
- `Entry level`
- `Associate`
- `Mid-Senior level`
- `Director`
- `Executive`

---

## Usage Examples

### Insert a new job listing
```sql
INSERT INTO job_listings (
  job_url, job_title, company_name, location, work_type,
  easy_apply, applicant_count, date_posted
) VALUES (
  'https://www.linkedin.com/jobs/view/123456789',
  'Senior Product Manager',
  'Tech Corp',
  'San Francisco, CA (Remote)',
  'Remote',
  true,
  47,
  '2025-12-08'
);
```

### User saves a job
```sql
INSERT INTO user_job_applications (user_id, job_listing_id, status)
VALUES (
  'user-uuid-here',
  'job-listing-uuid-here',
  'saved'
);
```

### Update application status
```sql
UPDATE user_job_applications
SET status = 'applied', applied_date = CURRENT_DATE
WHERE id = 'application-uuid-here';
```

### Get user's job statistics
```sql
SELECT * FROM get_user_job_stats('user-uuid-here');
```

### Search jobs with filters
```sql
SELECT * FROM search_jobs(
  p_job_title := 'Product Manager',
  p_location := 'San Francisco',
  p_work_type := 'Remote',
  p_easy_apply_only := true,
  p_date_filter := 'week',
  p_limit := 50,
  p_offset := 0
);
```

---

## Testing the Schema

After running the migrations, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('job_listings', 'user_job_applications', 'user_search_queries');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_job_applications', 'user_search_queries');

-- View all policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('user_job_applications', 'user_search_queries');
```

---

## Maintenance

### Manual Cleanup (if pg_cron not available)
Run this periodically or trigger from a Supabase Edge Function:

```sql
SELECT cleanup_old_job_listings();
```

### Monitor Database Size
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('job_listings', 'user_job_applications', 'user_search_queries')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Security Notes

1. **job_listings** table has NO RLS - all jobs are public and visible to all users
2. **user_job_applications** has RLS - users only see their own saved jobs
3. **user_search_queries** has RLS - users only see their own search history
4. All foreign keys use `ON DELETE CASCADE` to automatically clean up when users/jobs are deleted
5. Unique constraint on `(user_id, job_listing_id)` prevents duplicate job saves

---

## Next Steps

After running these migrations:

1. ✅ Test schema by inserting sample data
2. ✅ Create `src/services/jobSearchService.js` for CRUD operations
3. ✅ Create `src/context/JobSearchContext.jsx` for state management
4. ✅ Build UI components to display job listings
5. ✅ Implement LinkedIn scraping (Supabase Edge Function + Crawl4AI)

---

**Schema Version:** 1.0.0
**Last Updated:** 2025-12-10
**Author:** Claude Code (AI Assistant)
