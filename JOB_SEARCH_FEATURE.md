# Job Search Feature Documentation

## Overview

The Job Search feature enables users to search for jobs on LinkedIn, filter results, save interesting positions, and track their application status. This completes the job hunting workflow: **Resume → Cover Letter → Job Search → Track Applications**.

**Status:** ✅ MVP Complete (Mock Data Mode)
**Version:** 1.0.0
**Added:** 2025-12-10

---

## Architecture

### System Flow

```
User Input (Job Title)
    ↓
LinkedIn Scraper Service
    ↓
Job Listings Stored in Supabase
    ↓
JobSearchContext (State Management)
    ↓
UI Components (Filters, Cards, Dashboard)
    ↓
User Actions (Save, Track, Apply)
```

### Component Structure

```
src/
├── components/
│   ├── JobSearchBoard.jsx          # Main container (search bar, filters, grid)
│   ├── JobCard.jsx                 # Individual job card
│   ├── JobFilters.jsx              # Filter sidebar
│   ├── JobDetailsModal.jsx         # Job details popup
│   └── ApplicationDashboard.jsx    # Application tracking dashboard
│
├── context/
│   └── JobSearchContext.jsx        # State management (400+ lines)
│
├── services/
│   ├── jobSearchService.js         # Supabase CRUD operations
│   └── linkedInScraperService.js   # Mock/real scraping logic
│
└── types/
    └── jobSearchTypes.js           # Type definitions & utilities
```

---

## Database Schema

### Tables

#### 1. `job_listings` (Public, shared across users)

Stores all scraped LinkedIn job postings.

**Columns:**
- `id` (UUID, Primary Key)
- `job_url` (TEXT, UNIQUE) - LinkedIn job URL
- `linkedin_job_id` (TEXT) - Extracted job ID
- `job_title` (TEXT, NOT NULL)
- `company_name` (TEXT, NOT NULL)
- `location` (TEXT)
- `work_type` (TEXT) - Remote/Hybrid/On-site
- `employment_type` (TEXT) - Full-time/Part-time/Contract
- `experience_level` (TEXT)
- `job_description` (TEXT)
- `salary_range` (TEXT)
- `easy_apply` (BOOLEAN, DEFAULT false)
- `applicant_count` (INTEGER)
- `date_posted` (DATE)
- `scraped_at` (TIMESTAMPTZ, DEFAULT NOW())
- `last_updated` (TIMESTAMPTZ)
- `is_active` (BOOLEAN, DEFAULT true)

**Indexes:**
- `idx_job_listings_url` - Fast lookup by URL
- `idx_job_listings_title` - Search by title
- `idx_job_listings_filters` - Composite index for filtering

#### 2. `user_job_applications` (User-specific, RLS protected)

Tracks user's saved jobs and application status.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK → auth.users)
- `job_listing_id` (UUID, FK → job_listings)
- `status` (TEXT, DEFAULT 'saved') - saved/applied/interviewing/offer/rejected
- `applied_date` (DATE)
- `resume_id` (UUID, FK → resumes)
- `resume_snapshot` (JSONB) - Frozen copy of resume used
- `cover_letter_text` (TEXT)
- `notes` (TEXT)
- `follow_up_date` (DATE)
- `interview_dates` (JSONB)
- `saved_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ)

**RLS Policies:**
- Users can only view/edit their own applications
- Unique constraint: `(user_id, job_listing_id)` prevents duplicates

#### 3. `user_search_queries` (Search history)

Stores user's job search history for quick access.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK → auth.users)
- `job_title` (TEXT, NOT NULL)
- `location` (TEXT)
- `work_type` (TEXT)
- `easy_apply_only` (BOOLEAN)
- `results_count` (INTEGER)
- `searched_at` (TIMESTAMPTZ, DEFAULT NOW())

---

## Feature Details

### 1. Job Search UI

**Component:** `JobSearchBoard.jsx`

**Layout:**
- Top: Search bar with job title input
- Left: Filters sidebar (collapsible)
- Right: Job cards grid
- Header: Stats + "My Applications" button

**Search Flow:**
1. User enters job title (e.g., "Product Manager")
2. Clicks "Find Job Openings" or presses Enter
3. System calls `searchLinkedInJobs(jobTitle, options)`
4. Loading spinner shows while scraping
5. Results appear in grid (50 jobs max)
6. Search is saved to history (if authenticated)

### 2. Filtering System

**Component:** `JobFilters.jsx`

**Available Filters:**
- ✅ **Easy Apply Only** - Toggle for jobs with Easy Apply
- ✅ **Date Posted** - Last 24h, Last week, Last month, All time
- ✅ **Work Type** - Remote, Hybrid, On-site
- ✅ **Employment Type** - Full-time, Part-time, Contract, Internship
- ✅ **Experience Level** - Internship, Entry, Associate, Mid-Senior, Director, Executive
- ✅ **Location** - Text input for city/state filtering

**Filter Logic:**
- Client-side filtering (instant, no database query)
- Filters combine with AND logic
- Results count updates in real-time
- "Clear All" button resets filters

### 3. Job Cards

**Component:** `JobCard.jsx`

**Displays:**
- Job title (with "NEW" badge if posted ≤3 days ago)
- Company name
- Location + Work type icons
- Badges: Easy Apply, Employment Type, Experience Level
- Applicant count (with competition indicator)
- Date posted (relative time: "2 days ago")
- Bookmark button (if authenticated)
- Application status badge (if saved)

**Interactions:**
- Click card → Open job details modal
- Click bookmark → Save job
- Hover → Blue border highlight

### 4. Job Details Modal

**Component:** `JobDetailsModal.jsx`

**Full-Screen Modal Showing:**
- Complete job information grid
- Full job description (HTML rendered)
- User actions section (if authenticated):
  - Application status dropdown
  - Notes textarea
  - Save/Update button
- "View on LinkedIn" button (opens in new tab)

**Actions:**
- Save job for later
- Update application status
- Add personal notes
- Track interview dates (future)

### 5. Application Dashboard

**Component:** `ApplicationDashboard.jsx`

**Stats Cards (Top):**
- 📌 Saved jobs count
- ✅ Applied jobs count
- 👥 Interviewing count
- 🎉 Offers count

**Filter Chips:**
- All, Saved, Applied, Interviewing, Offers

**Application List:**
- Job title (clickable → opens details)
- Company name
- Location + saved/applied dates
- Personal notes (yellow box)
- Actions:
  - Status dropdown (update status)
  - LinkedIn link
  - Delete button

---

## State Management

### JobSearchContext

**Provider:** `JobSearchContext.jsx` (400+ lines)
**Hook:** `useJobSearch()`

**State:**
```javascript
{
  // Job listings data
  jobListings: [],           // All fetched jobs
  filteredJobs: [],          // After client-side filtering
  selectedJob: null,         // Currently viewed job

  // User applications
  userJobApplications: [],   // User's saved/applied jobs
  jobStats: {                // Application statistics
    total_saved: 0,
    total_applied: 0,
    total_interviewing: 0,
    total_offers: 0,
    total_rejected: 0
  },

  // Search state
  searchFilters: {},         // Active filter values
  searchHistory: [],         // Recent searches
  isSearching: false,        // Loading state
  searchError: null,         // Error message

  // UI state
  loading: false,
  error: null,
  showJobDetails: false,
  showApplicationDashboard: false
}
```

**Methods:**
- `searchLinkedInJobs(jobTitle, options)` - Trigger scrape
- `fetchJobsWithFilters(filters)` - Fetch from DB
- `updateFilters(newFilters)` - Update active filters
- `saveJob(jobListingId, data)` - Save job for user
- `updateJobApplication(id, updates)` - Update status/notes
- `deleteJobApplication(id)` - Remove saved job

---

## Services

### jobSearchService.js

**CRUD Operations:**

```javascript
// Job Listings (Public)
fetchJobListings(filters)
fetchJobById(jobId)
fetchJobByUrl(jobUrl)
createJobListings(jobsData)  // Bulk insert
updateJobListing(jobId, updates)
deleteJobListing(jobId)

// User Applications (RLS Protected)
fetchUserJobApplications(userId, filters)
checkUserJobApplication(userId, jobListingId)
saveJobForUser(applicationData)
updateUserJobApplication(applicationId, updates)
deleteUserJobApplication(applicationId)
getUserJobStats(userId)  // RPC call

// Search History
fetchUserSearchHistory(userId, limit)
saveUserSearchQuery(queryData)
deleteUserSearchQuery(queryId)
clearUserSearchHistory(userId)
```

**Pattern:**
- All functions validate inputs first
- Use try-catch for all async operations
- Return data directly (not `{ data, error }` wrapper)
- Log errors to console with context
- Throw descriptive error messages

### linkedInScraperService.js

**Current Implementation:** Mock Data Mode

```javascript
// Main function (auto-falls back to mock)
scrapeLinkedInJobsWithFallback(jobTitle, options)

// Mock scraper (for testing)
scrapeLinkedInJobsMock(jobTitle, options)
  - Generates 10-20 realistic jobs
  - Random company names (Google, Microsoft, etc.)
  - Random locations
  - Random applicant counts (0-200)
  - Date posted (last 30 days)
  - Easy Apply (50% of jobs)

// Future: Real scraper
scrapeLinkedInJobs(jobTitle, options)
  - Calls Supabase Edge Function
  - Edge Function uses Crawl4AI
  - Returns scraped job data
```

**Options:**
```javascript
{
  location: 'San Francisco, CA',
  workType: 'Remote',
  easyApplyOnly: false,
  maxResults: 50
}
```

---

## Type Definitions

### jobSearchTypes.js

**Enums:**
```javascript
APPLICATION_STATUS = {
  SAVED: 'saved',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
}

WORK_TYPE = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site'
}

DATE_FILTER = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  ALL: 'all'
}
```

**Utility Functions:**
```javascript
formatJobDate(dateString)           // "2 days ago"
getDaysSincePosted(dateString)      // 2
isJobFresh(dateString, maxDays)     // true/false
formatApplicantCount(count)         // "47 applicants"
getCompetitionLevel(count)          // "low"/"medium"/"high"
extractLinkedInJobId(url)           // "3876543210"
```

---

## User Flows

### Flow 1: Search for Jobs

```
1. User clicks "Job Search" tab
2. Enters "Software Engineer" in search bar
3. Presses Enter or clicks "Find Job Openings"
4. System generates mock jobs (or scrapes LinkedIn if Edge Function deployed)
5. 15 jobs appear in grid
6. User clicks "Easy Apply" filter
7. Grid updates to show only 8 Easy Apply jobs
```

### Flow 2: Save and Track Job

```
1. User sees interesting job card
2. Clicks bookmark icon
3. (If not logged in) → Prompted to sign in
4. (If logged in) → Job saved, bookmark fills in
5. User clicks "My Applications" button
6. Dashboard shows job in "Saved" section
7. User updates status to "Applied"
8. Stats update: Saved (4), Applied (1)
```

### Flow 3: View Job Details

```
1. User clicks on job card
2. Modal opens with full job details
3. User reads job description
4. User adds note: "Great company culture"
5. User clicks "Save Job"
6. Modal shows "Update Application" button
7. User clicks "View on LinkedIn" → Opens in new tab
```

---

## Current Limitations

### MVP Scope (Mock Data Mode)

✅ **Implemented:**
- Search UI with modern design
- Mock job generation (realistic data)
- Advanced filtering (all filters working)
- Save jobs (requires auth)
- Track application status
- Application dashboard
- Cloud sync via Supabase

❌ **Not Implemented:**
- Real LinkedIn scraping (Edge Function not deployed)
- Auto-apply functionality (too risky, violates LinkedIn ToS)
- Resume/cover letter matching per job
- AI job recommendations
- Email notifications
- Job alerts/saved searches

### Technical Limitations

**Mock Data:**
- Generates random data each search
- Same job URL won't persist across searches
- Limited to 50 jobs per search

**Filtering:**
- Client-side only (no server-side pagination)
- All jobs loaded at once (performance concern if >1000 jobs)

**Scraping:**
- No real LinkedIn data yet
- Edge Function needs deployment
- Requires proxy service for production

---

## Future Enhancements

### Phase 2: Real Scraping (Optional)

1. **Deploy Supabase Edge Function**
   - Implement Crawl4AI integration
   - Add rate limiting
   - Handle CAPTCHA detection
   - Log scraping errors

2. **Add Proxy Support**
   - Integrate rotating proxy service
   - Avoid IP bans
   - Cost: ~$50-100/month

3. **Job Deduplication**
   - Check job URL before inserting
   - Update applicant count daily
   - Mark inactive jobs after 30 days

### Phase 3: Advanced Features

1. **AI Job Matching**
   - Score jobs based on resume fit
   - Highlight matching skills
   - Suggest resume improvements per job

2. **Resume Customization**
   - One-click tailor resume to job
   - Generate job-specific cover letter
   - Save job-specific resume version

3. **Application Automation** (⚠️ Risky)
   - Chrome extension for LinkedIn
   - Pre-fill application forms
   - Track submissions automatically
   - Disclaimers required

4. **Notifications**
   - Email alerts for new jobs
   - Follow-up reminders
   - Interview scheduling

---

## Testing Guide

### Manual Testing Checklist

**Search:**
- [ ] Enter job title, click search
- [ ] Verify jobs appear
- [ ] Test with different titles
- [ ] Check loading state

**Filters:**
- [ ] Toggle Easy Apply
- [ ] Filter by date
- [ ] Filter by work type
- [ ] Filter by location
- [ ] Clear all filters

**Save Jobs:**
- [ ] Sign in
- [ ] Bookmark job
- [ ] View in dashboard
- [ ] Update status
- [ ] Add notes
- [ ] Delete job

**Persistence:**
- [ ] Save jobs
- [ ] Refresh page
- [ ] Verify jobs persist
- [ ] Sign out/in
- [ ] Check cloud sync

---

## Troubleshooting

### Common Issues

**Jobs not appearing:**
- Check browser console for errors
- Verify Supabase connection
- Run database migrations

**Cannot save jobs:**
- Ensure user is authenticated
- Check RLS policies in Supabase
- Verify `user_id` in applications table

**Filters not working:**
- Check JobSearchContext is wrapped
- Clear browser cache
- Verify filteredJobs state updates

---

## File Reference

### Created Files (Job Search Feature)

**Documentation:**
- `JOB_SEARCH_SCHEMA.md` - Database schema & SQL
- `JOB_SEARCH_SETUP_GUIDE.md` - Setup instructions
- `JOB_SEARCH_FEATURE.md` - This file

**Components:**
- `src/components/JobSearchBoard.jsx` + CSS
- `src/components/JobCard.jsx` + CSS
- `src/components/JobFilters.jsx` + CSS
- `src/components/JobDetailsModal.jsx` + CSS
- `src/components/ApplicationDashboard.jsx` + CSS

**Context & Services:**
- `src/context/JobSearchContext.jsx`
- `src/services/jobSearchService.js`
- `src/services/linkedInScraperService.js`
- `src/types/jobSearchTypes.js`

**Total:** ~5,000+ lines of new code

---

**Last Updated:** 2025-12-10
**Feature Version:** 1.0.0 (MVP)
**Status:** ✅ Production Ready (Mock Data)
