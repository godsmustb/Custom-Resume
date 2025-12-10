/**
 * LinkedIn Scraper Service
 *
 * This service handles LinkedIn job scraping via Supabase Edge Functions.
 * The actual scraping logic runs server-side using Crawl4AI to avoid CORS and rate limiting.
 *
 * Flow: User searches → This service calls Edge Function → Edge Function scrapes LinkedIn → Returns jobs
 */

import { supabase } from '../config/supabase.js';
import { createJobListings, fetchJobByUrl } from './jobSearchService.js';
import { extractLinkedInJobId } from '../types/jobSearchTypes.js';

/**
 * Scrape LinkedIn jobs by job title
 * @param {string} jobTitle - Job title to search for (e.g., "Product Manager")
 * @param {Object} options - Optional search parameters
 * @returns {Promise<Array>} - Array of scraped job listings
 */
export const scrapeLinkedInJobs = async (jobTitle, options = {}) => {
  try {
    if (!jobTitle || !jobTitle.trim()) {
      throw new Error('Job title is required');
    }

    const {
      location = '',
      workType = '',
      easyApplyOnly = false,
      maxResults = 50
    } = options;

    console.log('🔍 Starting LinkedIn job scrape:', {
      jobTitle,
      location,
      workType,
      easyApplyOnly,
      maxResults
    });

    // Call Supabase Edge Function for scraping
    // Edge Function endpoint: /functions/v1/scrape-linkedin-jobs
    const { data, error } = await supabase.functions.invoke('scrape-linkedin-jobs', {
      body: {
        jobTitle: jobTitle.trim(),
        location: location.trim(),
        workType,
        easyApplyOnly,
        maxResults
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`Failed to scrape LinkedIn jobs: ${error.message}`);
    }

    if (!data || !data.jobs) {
      console.warn('No jobs returned from Edge Function');
      return [];
    }

    console.log(`✅ Scraped ${data.jobs.length} jobs from LinkedIn`);

    // Store scraped jobs in Supabase
    const savedJobs = await saveScrapedJobs(data.jobs);

    return savedJobs;
  } catch (error) {
    console.error('Error in scrapeLinkedInJobs:', error);
    throw error;
  }
};

/**
 * Save scraped jobs to Supabase (avoiding duplicates)
 * @param {Array} scrapedJobs - Array of job objects from scraper
 * @returns {Promise<Array>} - Array of saved job listings
 */
const saveScrapedJobs = async (scrapedJobs) => {
  try {
    if (!scrapedJobs || scrapedJobs.length === 0) {
      return [];
    }

    // Transform scraped data to match our schema
    const jobsToSave = scrapedJobs.map(job => ({
      job_url: job.url,
      linkedin_job_id: job.jobId || extractLinkedInJobId(job.url),
      job_title: job.title,
      company_name: job.company,
      location: job.location || 'Remote',
      work_type: job.workType || 'Not specified',
      employment_type: job.employmentType || 'Full-time',
      experience_level: job.experienceLevel || 'Mid-Senior level',
      job_description: job.description || '',
      salary_range: job.salary || null,
      easy_apply: job.easyApply || false,
      applicant_count: job.applicantCount || 0,
      date_posted: job.datePosted || new Date().toISOString().split('T')[0],
      is_active: true
    }));

    // Use upsert to avoid duplicates (based on job_url)
    const savedJobs = await createJobListings(jobsToSave);

    console.log(`💾 Saved ${savedJobs.length} jobs to database`);

    return savedJobs;
  } catch (error) {
    console.error('Error saving scraped jobs:', error);
    throw error;
  }
};

/**
 * Mock LinkedIn scraper for testing (when Edge Function is not ready)
 * @param {string} jobTitle - Job title to search for
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Mock job listings
 */
export const scrapeLinkedInJobsMock = async (jobTitle, options = {}) => {
  console.warn('⚠️ Using MOCK LinkedIn scraper (Edge Function not deployed)');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const {
    location = 'United States',
    workType = 'Remote',
    easyApplyOnly = false,
    maxResults = 50
  } = options;

  // Generate mock jobs
  const mockCompanies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
    'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Stripe',
    'Salesforce', 'Oracle', 'Adobe', 'Intel', 'NVIDIA'
  ];

  const mockLocations = [
    'San Francisco, CA (Remote)',
    'New York, NY (Hybrid)',
    'Seattle, WA (On-site)',
    'Austin, TX (Remote)',
    'Boston, MA (Hybrid)',
    'Los Angeles, CA (Remote)',
    'Chicago, IL (Hybrid)',
    'Remote'
  ];

  const mockWorkTypes = ['Remote', 'Hybrid', 'On-site'];

  const count = Math.min(maxResults, Math.floor(Math.random() * 20) + 10);

  const mockJobs = Array.from({ length: count }, (_, i) => {
    const company = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
    const jobLocation = location || mockLocations[Math.floor(Math.random() * mockLocations.length)];
    const jobWorkType = workType || mockWorkTypes[Math.floor(Math.random() * mockWorkTypes.length)];
    const isEasyApply = easyApplyOnly ? true : Math.random() > 0.5;
    const applicantCount = Math.floor(Math.random() * 200);
    const daysAgo = Math.floor(Math.random() * 30);
    const datePosted = new Date();
    datePosted.setDate(datePosted.getDate() - daysAgo);

    return {
      url: `https://www.linkedin.com/jobs/view/${3000000000 + i}`,
      jobId: `${3000000000 + i}`,
      title: `${jobTitle} ${['Senior', 'Lead', 'Staff', ''][Math.floor(Math.random() * 4)]}`.trim(),
      company,
      location: jobLocation,
      workType: jobWorkType,
      employmentType: 'Full-time',
      experienceLevel: ['Entry level', 'Mid-Senior level', 'Director'][Math.floor(Math.random() * 3)],
      description: `
        <div>
          <p>We are seeking a talented ${jobTitle} to join our growing team at ${company}.</p>
          <p><strong>Responsibilities:</strong></p>
          <ul>
            <li>Lead cross-functional projects and drive product strategy</li>
            <li>Collaborate with engineering, design, and marketing teams</li>
            <li>Analyze market trends and customer feedback</li>
            <li>Define and track key performance metrics</li>
          </ul>
          <p><strong>Requirements:</strong></p>
          <ul>
            <li>5+ years of experience in product management or related field</li>
            <li>Strong analytical and problem-solving skills</li>
            <li>Excellent communication and leadership abilities</li>
            <li>Experience with Agile methodologies</li>
          </ul>
        </div>
      `,
      salary: Math.random() > 0.7 ? `$${Math.floor(Math.random() * 80) + 80}k - $${Math.floor(Math.random() * 100) + 120}k/year` : null,
      easyApply: isEasyApply,
      applicantCount,
      datePosted: datePosted.toISOString().split('T')[0]
    };
  });

  // Save mock jobs to database
  const savedJobs = await saveScrapedJobs(mockJobs);

  return savedJobs;
};

/**
 * Check if Edge Function is deployed and working
 * @returns {Promise<boolean>} - True if Edge Function is available
 */
export const checkEdgeFunctionAvailable = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-linkedin-jobs', {
      body: { action: 'health_check' }
    });

    if (error) {
      console.warn('Edge Function not available:', error.message);
      return false;
    }

    return data?.status === 'ok';
  } catch (error) {
    console.warn('Edge Function not available:', error.message);
    return false;
  }
};

/**
 * Scrape LinkedIn jobs with automatic fallback to mock data
 * @param {string} jobTitle - Job title to search for
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Array of job listings
 */
export const scrapeLinkedInJobsWithFallback = async (jobTitle, options = {}) => {
  try {
    // Try real scraper first
    return await scrapeLinkedInJobs(jobTitle, options);
  } catch (error) {
    console.warn('Real scraper failed, falling back to mock data:', error.message);

    // Fallback to mock scraper
    return await scrapeLinkedInJobsMock(jobTitle, options);
  }
};

/**
 * Parse LinkedIn job URL to extract job ID
 * @param {string} url - LinkedIn job URL
 * @returns {Object} - Parsed job info
 */
export const parseLinkedInJobUrl = (url) => {
  try {
    const jobId = extractLinkedInJobId(url);

    if (!jobId) {
      throw new Error('Invalid LinkedIn job URL');
    }

    return {
      jobId,
      url,
      isValid: true
    };
  } catch (error) {
    return {
      jobId: null,
      url,
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Scrape single LinkedIn job by URL
 * @param {string} jobUrl - LinkedIn job URL
 * @returns {Promise<Object>} - Scraped job listing
 */
export const scrapeSingleLinkedInJob = async (jobUrl) => {
  try {
    // Validate URL
    const parsed = parseLinkedInJobUrl(jobUrl);
    if (!parsed.isValid) {
      throw new Error(parsed.error);
    }

    // Check if already scraped
    const existing = await fetchJobByUrl(jobUrl);
    if (existing) {
      console.log('Job already in database, returning existing data');
      return existing;
    }

    // Call Edge Function to scrape single job
    const { data, error } = await supabase.functions.invoke('scrape-linkedin-jobs', {
      body: {
        action: 'scrape_single',
        jobUrl
      }
    });

    if (error) {
      throw new Error(`Failed to scrape job: ${error.message}`);
    }

    if (!data || !data.job) {
      throw new Error('No job data returned');
    }

    // Save to database
    const [savedJob] = await saveScrapedJobs([data.job]);

    return savedJob;
  } catch (error) {
    console.error('Error in scrapeSingleLinkedInJob:', error);
    throw error;
  }
};
