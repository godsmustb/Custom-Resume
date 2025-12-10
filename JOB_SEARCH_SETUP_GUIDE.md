# Job Search Feature - Setup Guide

This guide will help you set up the Job Search feature for the Custom Resume application.

## Table of Contents
1. [Database Setup](#database-setup)
2. [Mock Data Mode (Recommended for MVP)](#mock-data-mode-recommended-for-mvp)
3. [Future: Real LinkedIn Scraping (Supabase Edge Function)](#future-real-linkedin-scraping-supabase-edge-function)
4. [Testing the Feature](#testing-the-feature)

---

## Database Setup

### Step 1: Run SQL Migrations

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com](https://supabase.com)
   - Select your project
   - Click on "SQL Editor" in the left sidebar

2. **Execute Schema File**
   - Open `JOB_SEARCH_SCHEMA.md`
   - Copy all SQL code from "Step 1: Create Tables"
   - Paste into SQL Editor
   - Click "Run"

3. **Create Triggers**
   - Copy SQL from "Step 2: Create Auto-Update Trigger"
   - Paste and run in SQL Editor

4. **Enable RLS Policies**
   - Copy SQL from "Step 3: Enable Row Level Security"
   - Paste and run in SQL Editor

5. **Create Helper Functions**
   - Copy SQL from "Step 4: Create Auto-Cleanup Function"
   - Copy SQL from "Step 5: Create Helper Functions"
   - Paste and run both in SQL Editor

### Step 2: Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('job_listings', 'user_job_applications', 'user_search_queries');
```

You should see 3 tables in the results.

---

## Mock Data Mode (Recommended for MVP)

The application is **currently configured to use mock data** for LinkedIn job scraping. This is perfect for development and MVP testing.

### How it Works

When a user searches for jobs:
1. User enters job title (e.g., "Product Manager")
2. System generates realistic mock job listings (10-20 jobs)
3. Mock jobs are saved to Supabase
4. User can filter, save, and track these jobs normally

### Testing with Mock Data

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Navigate to Job Search**
   - Click "Job Search" in the navigation
   - Enter a job title (e.g., "Software Engineer")
   - Click "Find Job Openings" or press Enter

3. **View Results**
   - You'll see 10-20 mock job listings
   - Each job has realistic data:
     * Company names (Google, Microsoft, Amazon, etc.)
     * Locations (San Francisco, New York, Remote, etc.)
     * Work types (Remote, Hybrid, On-site)
     * Easy Apply status
     * Applicant counts
     * Date posted (last 30 days)

4. **Test Features**
   - ✅ Filter jobs (Easy Apply, Date, Location, Work Type)
   - ✅ Save jobs (requires login)
   - ✅ View job details
   - ✅ Track application status
   - ✅ View "My Applications" dashboard

### Customizing Mock Data

Edit `src/services/linkedInScraperService.js` to customize mock data:

- Change company names (line 100)
- Change locations (line 103)
- Adjust number of jobs generated (line 112)
- Modify job descriptions (line 129)

---

## Future: Real LinkedIn Scraping (Supabase Edge Function)

⚠️ **NOT REQUIRED FOR MVP** - Mock data works for testing

When you're ready to implement real scraping, you'll need to:

### Option 1: Supabase Edge Functions (Recommended)

**Prerequisites:**
- Supabase CLI installed
- Deno runtime installed

**Steps:**

1. **Initialize Supabase Locally**
   ```bash
   supabase init
   ```

2. **Create Edge Function**
   ```bash
   supabase functions new scrape-linkedin-jobs
   ```

3. **Implement Scraper**

   Create `supabase/functions/scrape-linkedin-jobs/index.ts`:

   ```typescript
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }

   serve(async (req) => {
     // Handle CORS
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const { jobTitle, location, workType, easyApplyOnly, maxResults } = await req.json()

       // TODO: Implement Crawl4AI scraping here
       // For now, return empty array
       const jobs = []

       return new Response(
         JSON.stringify({ jobs, count: jobs.length }),
         {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 200,
         },
       )
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 400,
         },
       )
     }
   })
   ```

4. **Deploy Edge Function**
   ```bash
   supabase functions deploy scrape-linkedin-jobs
   ```

5. **Test Edge Function**
   ```bash
   curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/scrape-linkedin-jobs' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"jobTitle":"Software Engineer","maxResults":10}'
   ```

### Option 2: External Scraping Service

Use a third-party scraping API:
- [ScraperAPI](https://www.scraperapi.com/) - $49/month
- [Bright Data](https://brightdata.com/) - $500/month
- [Oxylabs](https://oxylabs.io/) - $99/month

### Option 3: Custom Backend Server

Create a separate Node.js/Python server with:
- Puppeteer or Playwright for browser automation
- Rotating proxy support
- Rate limiting
- Job queue (Redis/BullMQ)

---

## Testing the Feature

### End-to-End Test Plan

#### 1. **Search Functionality**
- [ ] Enter job title and click search
- [ ] Verify jobs appear in grid
- [ ] Test with different job titles
- [ ] Verify loading state shows during search

#### 2. **Filtering**
- [ ] Toggle "Easy Apply" filter
- [ ] Filter by date (24h, 7d, 30d)
- [ ] Filter by work type (Remote, Hybrid, On-site)
- [ ] Filter by employment type
- [ ] Filter by experience level
- [ ] Enter location and verify filtering

#### 3. **Job Cards**
- [ ] Click on job card
- [ ] Verify job details modal opens
- [ ] Check all job information displays correctly
- [ ] Click "View on LinkedIn" link
- [ ] Close modal

#### 4. **Save Jobs** (Requires Authentication)
- [ ] Sign in to account
- [ ] Click bookmark icon on job card
- [ ] Verify job is marked as saved
- [ ] Check job appears in "My Applications"

#### 5. **Application Tracking**
- [ ] Open "My Applications" dashboard
- [ ] Verify saved jobs appear
- [ ] Change application status (Saved → Applied)
- [ ] Add notes to a job
- [ ] Verify stats update (Saved, Applied counts)
- [ ] Delete a job from list

#### 6. **Persistence**
- [ ] Save multiple jobs
- [ ] Refresh page
- [ ] Verify saved jobs persist
- [ ] Sign out and sign back in
- [ ] Verify cloud sync works

#### 7. **Edge Cases**
- [ ] Search with empty job title (should show error)
- [ ] Search with no results (should show empty state)
- [ ] Try to save job while logged out (should prompt login)
- [ ] Test with very long job titles
- [ ] Test with special characters in search

---

## Troubleshooting

### Jobs Not Appearing

**Problem:** Search returns 0 results

**Solution:**
- Check browser console for errors
- Verify Supabase connection (check network tab)
- Confirm database tables exist
- Try refreshing the page

### Cannot Save Jobs

**Problem:** "You must be logged in to save jobs" error

**Solution:**
- Sign in to your account
- Check authentication status in user menu
- Verify Supabase auth is working

### Mock Jobs Not Saving to Database

**Problem:** Jobs appear but don't persist after refresh

**Solution:**
- Check Supabase connection in browser console
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Check RLS policies allow insert/select for job_listings table

### Filters Not Working

**Problem:** Filters don't filter jobs

**Solution:**
- Check browser console for errors
- Verify JobSearchContext is properly wrapped in App
- Clear browser cache and reload

---

## Current Feature Status

✅ **Implemented:**
- Job search UI with minimalistic modern design
- Mock LinkedIn job scraping (10-20 realistic jobs)
- Advanced filtering (Easy Apply, Date, Location, Work Type, etc.)
- Job details modal
- Save jobs (requires authentication)
- Application status tracking
- "My Applications" dashboard with stats
- Supabase database integration
- Cloud sync for authenticated users

❌ **Not Implemented (Future):**
- Real LinkedIn scraping (using Crawl4AI)
- Supabase Edge Function for scraping
- Auto-apply functionality
- Resume/cover letter suggestions per job
- AI job matching scores
- Email notifications for new jobs
- Job alerts/saved searches

---

## Next Steps

1. **Test the feature thoroughly** using mock data
2. **Gather user feedback** on UI/UX
3. **Decide if real scraping is needed** (mock data may be sufficient for MVP)
4. **If needed, implement Supabase Edge Function** for real scraping
5. **Add analytics** to track usage
6. **Consider monetization** (e.g., premium features for real scraping)

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs (Dashboard → Logs)
3. Open GitHub issue with detailed description
4. Include error messages and steps to reproduce

---

**Last Updated:** 2025-12-10
**Feature Version:** 1.0.0 (MVP with Mock Data)
