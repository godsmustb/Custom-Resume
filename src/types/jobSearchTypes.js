/**
 * Job Search Feature - Type Definitions
 *
 * This file defines the data structures used throughout the Job Search feature.
 * While JavaScript doesn't enforce types, these JSDoc definitions provide IDE
 * autocomplete and documentation for developers.
 */

/**
 * @typedef {Object} JobListing
 * @property {string} id - UUID primary key
 * @property {string} job_url - LinkedIn job URL (unique identifier)
 * @property {string} linkedin_job_id - Extracted LinkedIn job ID
 * @property {string} job_title - Job title
 * @property {string} company_name - Company name
 * @property {string} location - Job location (city, state, remote)
 * @property {string} work_type - Remote, Hybrid, On-site
 * @property {string} employment_type - Full-time, Part-time, Contract, etc.
 * @property {string} experience_level - Entry level, Mid-Senior, etc.
 * @property {string} job_description - Full job description text/HTML
 * @property {string} salary_range - Salary range string
 * @property {boolean} easy_apply - True if Easy Apply is available
 * @property {number} applicant_count - Number of applicants
 * @property {string} date_posted - ISO date string (YYYY-MM-DD)
 * @property {string} scraped_at - ISO timestamp
 * @property {string} last_updated - ISO timestamp
 * @property {boolean} is_active - False if job is no longer available
 */

/**
 * @typedef {Object} UserJobApplication
 * @property {string} id - UUID primary key
 * @property {string} user_id - User ID (UUID)
 * @property {string} job_listing_id - Reference to job_listings.id
 * @property {string} status - Application status (saved, applied, etc.)
 * @property {string} applied_date - ISO date string when applied
 * @property {string} resume_id - UUID reference to resumes table
 * @property {Object} resume_snapshot - Frozen copy of resume data
 * @property {string} cover_letter_text - Cover letter used
 * @property {string} notes - User's personal notes
 * @property {string} follow_up_date - ISO date for follow-up reminder
 * @property {Array<InterviewEvent>} interview_dates - Array of interview events
 * @property {string} saved_at - ISO timestamp when saved
 * @property {string} updated_at - ISO timestamp of last update
 */

/**
 * @typedef {Object} InterviewEvent
 * @property {string} date - ISO timestamp of interview
 * @property {string} type - Interview type (phone, video, onsite, etc.)
 * @property {string} notes - Notes about the interview
 * @property {string} interviewer - Interviewer name (optional)
 */

/**
 * @typedef {Object} UserSearchQuery
 * @property {string} id - UUID primary key
 * @property {string} user_id - User ID (UUID)
 * @property {string} job_title - Searched job title
 * @property {string} location - Location filter
 * @property {string} work_type - Work type filter
 * @property {boolean} easy_apply_only - If only Easy Apply jobs searched
 * @property {number} results_count - Number of results found
 * @property {string} searched_at - ISO timestamp
 */

/**
 * @typedef {Object} JobSearchFilters
 * @property {string} job_title - Search by job title (partial match)
 * @property {string} location - Filter by location
 * @property {string} work_type - Filter by work type (Remote/Hybrid/On-site)
 * @property {boolean} easy_apply_only - Show only Easy Apply jobs
 * @property {string} date_filter - Filter by date (day/week/month/all)
 * @property {string} employment_type - Filter by employment type
 * @property {string} experience_level - Filter by experience level
 * @property {number} limit - Max results to return (default 50)
 * @property {number} offset - Pagination offset (default 0)
 */

/**
 * @typedef {Object} JobStatistics
 * @property {number} total_saved - Count of saved jobs
 * @property {number} total_applied - Count of applied jobs
 * @property {number} total_interviewing - Count of jobs in interview stage
 * @property {number} total_offers - Count of job offers
 * @property {number} total_rejected - Count of rejections
 */

/**
 * Application status enum
 */
export const APPLICATION_STATUS = {
  SAVED: 'saved',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

/**
 * Work type enum
 */
export const WORK_TYPE = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site'
};

/**
 * Employment type enum
 */
export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary'
};

/**
 * Experience level enum
 */
export const EXPERIENCE_LEVEL = {
  INTERNSHIP: 'Internship',
  ENTRY: 'Entry level',
  ASSOCIATE: 'Associate',
  MID_SENIOR: 'Mid-Senior level',
  DIRECTOR: 'Director',
  EXECUTIVE: 'Executive'
};

/**
 * Date filter enum
 */
export const DATE_FILTER = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  ALL: 'all'
};

/**
 * Interview type enum
 */
export const INTERVIEW_TYPE = {
  PHONE: 'phone',
  VIDEO: 'video',
  ONSITE: 'onsite',
  PANEL: 'panel',
  TECHNICAL: 'technical',
  HR: 'hr',
  FINAL: 'final'
};

/**
 * Default filter values
 */
export const DEFAULT_FILTERS = {
  job_title: '',
  location: '',
  work_type: '',
  easy_apply_only: false,
  date_filter: DATE_FILTER.ALL,
  employment_type: '',
  experience_level: '',
  limit: 50,
  offset: 0
};

/**
 * Default job application data
 */
export const DEFAULT_JOB_APPLICATION = {
  status: APPLICATION_STATUS.SAVED,
  applied_date: null,
  resume_id: null,
  resume_snapshot: null,
  cover_letter_text: '',
  notes: '',
  follow_up_date: null,
  interview_dates: []
};

/**
 * Status display labels for UI
 */
export const STATUS_LABELS = {
  [APPLICATION_STATUS.SAVED]: 'Saved',
  [APPLICATION_STATUS.APPLIED]: 'Applied',
  [APPLICATION_STATUS.INTERVIEWING]: 'Interviewing',
  [APPLICATION_STATUS.OFFER]: 'Offer',
  [APPLICATION_STATUS.REJECTED]: 'Rejected',
  [APPLICATION_STATUS.WITHDRAWN]: 'Withdrawn'
};

/**
 * Status colors for UI badges
 */
export const STATUS_COLORS = {
  [APPLICATION_STATUS.SAVED]: '#6B7280',      // Gray
  [APPLICATION_STATUS.APPLIED]: '#3B82F6',    // Blue
  [APPLICATION_STATUS.INTERVIEWING]: '#F59E0B', // Amber
  [APPLICATION_STATUS.OFFER]: '#10B981',      // Green
  [APPLICATION_STATUS.REJECTED]: '#EF4444',   // Red
  [APPLICATION_STATUS.WITHDRAWN]: '#9CA3AF'   // Light Gray
};

/**
 * LinkedIn job URL pattern for validation
 */
export const LINKEDIN_JOB_URL_PATTERN = /^https:\/\/(www\.)?linkedin\.com\/jobs\/view\/\d+/;

/**
 * Extract LinkedIn job ID from URL
 * @param {string} url - LinkedIn job URL
 * @returns {string|null} - Job ID or null if invalid
 */
export function extractLinkedInJobId(url) {
  const match = url.match(/\/jobs\/view\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Validate LinkedIn job URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid LinkedIn job URL
 */
export function isValidLinkedInJobUrl(url) {
  return LINKEDIN_JOB_URL_PATTERN.test(url);
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date (e.g., "Dec 10, 2025")
 */
export function formatJobDate(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Calculate days since job was posted
 * @param {string} dateString - ISO date string
 * @returns {number} - Days since posted
 */
export function getDaysSincePosted(dateString) {
  if (!dateString) return 999;

  const posted = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - posted);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if job is fresh (posted within specified days)
 * @param {string} dateString - ISO date string
 * @param {number} maxDays - Maximum days to consider fresh (default 7)
 * @returns {boolean} - True if job is fresh
 */
export function isJobFresh(dateString, maxDays = 7) {
  return getDaysSincePosted(dateString) <= maxDays;
}

/**
 * Format applicant count for display
 * @param {number} count - Number of applicants
 * @returns {string} - Formatted count (e.g., "47 applicants", "100+ applicants")
 */
export function formatApplicantCount(count) {
  if (!count || count === 0) return 'No applicants yet';
  if (count === 1) return '1 applicant';
  if (count >= 100) return '100+ applicants';
  return `${count} applicants`;
}

/**
 * Get application competition level based on applicant count
 * @param {number} count - Number of applicants
 * @returns {string} - Competition level (low/medium/high)
 */
export function getCompetitionLevel(count) {
  if (!count || count < 10) return 'low';
  if (count < 50) return 'medium';
  return 'high';
}

/**
 * Parse job description to extract key info (basic implementation)
 * @param {string} description - Job description HTML/text
 * @returns {Object} - Parsed info (skills, requirements, etc.)
 */
export function parseJobDescription(description) {
  if (!description) return { skills: [], requirements: [] };

  // Strip HTML tags
  const text = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract skills (basic keyword matching)
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker',
    'Kubernetes', 'SQL', 'NoSQL', 'Agile', 'Scrum', 'Git', 'CI/CD'
  ];
  const skills = commonSkills.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return { skills, text };
}

/**
 * Generate job summary text for quick preview
 * @param {JobListing} job - Job listing object
 * @returns {string} - Summary text
 */
export function generateJobSummary(job) {
  const parts = [
    job.company_name,
    job.location,
    job.work_type,
    job.employment_type
  ].filter(Boolean);

  return parts.join(' • ');
}

/**
 * Sort jobs by specified criteria
 * @param {Array<JobListing>} jobs - Array of job listings
 * @param {string} sortBy - Sort criteria (date_posted, applicant_count, etc.)
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array<JobListing>} - Sorted jobs
 */
export function sortJobs(jobs, sortBy = 'date_posted', order = 'desc') {
  const sorted = [...jobs].sort((a, b) => {
    let compareA = a[sortBy];
    let compareB = b[sortBy];

    // Handle date comparisons
    if (sortBy === 'date_posted' || sortBy === 'scraped_at') {
      compareA = new Date(compareA || 0);
      compareB = new Date(compareB || 0);
    }

    // Handle number comparisons
    if (sortBy === 'applicant_count') {
      compareA = compareA || 0;
      compareB = compareB || 0;
    }

    if (order === 'asc') {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });

  return sorted;
}
