/**
 * Job Search Service
 *
 * This service handles all Supabase database operations for the Job Search feature.
 * Includes CRUD operations for job listings, user applications, and search queries.
 *
 * Pattern: All functions validate inputs, handle errors, and return data directly (not { data, error } wrapper)
 */

import { supabase } from '../config/supabase.js';
import { APPLICATION_STATUS, DEFAULT_FILTERS } from '../types/jobSearchTypes.js';

// ============================================================================
// JOB LISTINGS (Public, shared across all users)
// ============================================================================

/**
 * Fetch job listings with filters
 * @param {Object} filters - Filter options (job_title, location, work_type, etc.)
 * @returns {Promise<Array>} - Array of job listings
 */
export const fetchJobListings = async (filters = DEFAULT_FILTERS) => {
  try {
    const {
      job_title,
      location,
      work_type,
      easy_apply_only,
      date_filter,
      employment_type,
      experience_level,
      limit = 50,
      offset = 0
    } = { ...DEFAULT_FILTERS, ...filters };

    // Build query
    let query = supabase
      .from('job_listings')
      .select('*')
      .eq('is_active', true)
      .order('date_posted', { ascending: false })
      .order('scraped_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (job_title && job_title.trim()) {
      query = query.ilike('job_title', `%${job_title.trim()}%`);
    }

    if (location && location.trim()) {
      query = query.ilike('location', `%${location.trim()}%`);
    }

    if (work_type) {
      query = query.eq('work_type', work_type);
    }

    if (easy_apply_only) {
      query = query.eq('easy_apply', true);
    }

    if (employment_type) {
      query = query.eq('employment_type', employment_type);
    }

    if (experience_level) {
      query = query.eq('experience_level', experience_level);
    }

    // Date filtering
    if (date_filter && date_filter !== 'all') {
      const now = new Date();
      let cutoffDate;

      switch (date_filter) {
        case 'day':
          cutoffDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          cutoffDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          cutoffDate = new Date(now.setDate(now.getDate() - 30));
          break;
        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
        query = query.gte('date_posted', cutoffDate.toISOString().split('T')[0]);
      }
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch job listings: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchJobListings:', error);
    throw error;
  }
};

/**
 * Fetch single job listing by ID
 * @param {string} jobId - Job listing UUID
 * @returns {Promise<Object>} - Job listing object
 */
export const fetchJobById = async (jobId) => {
  try {
    if (!jobId) throw new Error('Job ID is required');

    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw new Error(`Failed to fetch job: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchJobById:', error);
    throw error;
  }
};

/**
 * Fetch job listing by URL (check if already scraped)
 * @param {string} jobUrl - LinkedIn job URL
 * @returns {Promise<Object|null>} - Job listing or null if not found
 */
export const fetchJobByUrl = async (jobUrl) => {
  try {
    if (!jobUrl) throw new Error('Job URL is required');

    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('job_url', jobUrl)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch job by URL: ${error.message}`);
    return data; // Returns null if not found
  } catch (error) {
    console.error('Error in fetchJobByUrl:', error);
    throw error;
  }
};

/**
 * Create new job listing (bulk insert for scraped jobs)
 * @param {Array<Object>} jobsData - Array of job listing objects
 * @returns {Promise<Array>} - Created job listings
 */
export const createJobListings = async (jobsData) => {
  try {
    if (!jobsData || jobsData.length === 0) {
      throw new Error('Job data is required');
    }

    const { data, error } = await supabase
      .from('job_listings')
      .upsert(jobsData, {
        onConflict: 'job_url', // Update if URL already exists
        ignoreDuplicates: false
      })
      .select();

    if (error) throw new Error(`Failed to create job listings: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error in createJobListings:', error);
    throw error;
  }
};

/**
 * Update job listing (mark as inactive, update applicant count, etc.)
 * @param {string} jobId - Job listing UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated job listing
 */
export const updateJobListing = async (jobId, updates) => {
  try {
    if (!jobId) throw new Error('Job ID is required');

    const { data, error } = await supabase
      .from('job_listings')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update job listing: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in updateJobListing:', error);
    throw error;
  }
};

/**
 * Delete job listing
 * @param {string} jobId - Job listing UUID
 */
export const deleteJobListing = async (jobId) => {
  try {
    if (!jobId) throw new Error('Job ID is required');

    const { error } = await supabase
      .from('job_listings')
      .delete()
      .eq('id', jobId);

    if (error) throw new Error(`Failed to delete job listing: ${error.message}`);
  } catch (error) {
    console.error('Error in deleteJobListing:', error);
    throw error;
  }
};

/**
 * Call stored procedure to clean up old jobs
 */
export const cleanupOldJobs = async () => {
  try {
    const { error } = await supabase.rpc('cleanup_old_job_listings');

    if (error) throw new Error(`Failed to cleanup old jobs: ${error.message}`);
  } catch (error) {
    console.error('Error in cleanupOldJobs:', error);
    throw error;
  }
};

// ============================================================================
// USER JOB APPLICATIONS (User-specific, protected by RLS)
// ============================================================================

/**
 * Fetch all user's saved/applied jobs
 * @param {string} userId - User UUID
 * @param {Object} filters - Optional status filter
 * @returns {Promise<Array>} - Array of user job applications with job details
 */
export const fetchUserJobApplications = async (userId, filters = {}) => {
  try {
    if (!userId) throw new Error('User ID is required');

    let query = supabase
      .from('user_job_applications')
      .select(`
        *,
        job_listing:job_listings(*)
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    // Filter by status if provided
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch user job applications: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchUserJobApplications:', error);
    throw error;
  }
};

/**
 * Fetch single user job application
 * @param {string} applicationId - Application UUID
 * @returns {Promise<Object>} - User job application
 */
export const fetchUserJobApplication = async (applicationId) => {
  try {
    if (!applicationId) throw new Error('Application ID is required');

    const { data, error } = await supabase
      .from('user_job_applications')
      .select(`
        *,
        job_listing:job_listings(*)
      `)
      .eq('id', applicationId)
      .single();

    if (error) throw new Error(`Failed to fetch job application: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in fetchUserJobApplication:', error);
    throw error;
  }
};

/**
 * Check if user has already saved/applied to a job
 * @param {string} userId - User UUID
 * @param {string} jobListingId - Job listing UUID
 * @returns {Promise<Object|null>} - Existing application or null
 */
export const checkUserJobApplication = async (userId, jobListingId) => {
  try {
    if (!userId || !jobListingId) {
      throw new Error('User ID and Job Listing ID are required');
    }

    const { data, error } = await supabase
      .from('user_job_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('job_listing_id', jobListingId)
      .maybeSingle();

    if (error) throw new Error(`Failed to check job application: ${error.message}`);
    return data; // Returns null if not found
  } catch (error) {
    console.error('Error in checkUserJobApplication:', error);
    throw error;
  }
};

/**
 * Save job for user (create application)
 * @param {Object} applicationData - Application data
 * @returns {Promise<Object>} - Created application
 */
export const saveJobForUser = async (applicationData) => {
  try {
    const { user_id, job_listing_id, resume_id, notes } = applicationData;

    if (!user_id || !job_listing_id) {
      throw new Error('User ID and Job Listing ID are required');
    }

    // Check if already saved
    const existing = await checkUserJobApplication(user_id, job_listing_id);
    if (existing) {
      throw new Error('You have already saved this job');
    }

    const { data, error } = await supabase
      .from('user_job_applications')
      .insert([{
        user_id,
        job_listing_id,
        status: APPLICATION_STATUS.SAVED,
        resume_id: resume_id || null,
        notes: notes || ''
      }])
      .select(`
        *,
        job_listing:job_listings(*)
      `)
      .single();

    if (error) throw new Error(`Failed to save job: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in saveJobForUser:', error);
    throw error;
  }
};

/**
 * Update user job application (change status, add notes, etc.)
 * @param {string} applicationId - Application UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated application
 */
export const updateUserJobApplication = async (applicationId, updates) => {
  try {
    if (!applicationId) throw new Error('Application ID is required');

    // If status is being updated to 'applied', set applied_date
    if (updates.status === APPLICATION_STATUS.APPLIED && !updates.applied_date) {
      updates.applied_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('user_job_applications')
      .update(updates)
      .eq('id', applicationId)
      .select(`
        *,
        job_listing:job_listings(*)
      `)
      .single();

    if (error) throw new Error(`Failed to update job application: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in updateUserJobApplication:', error);
    throw error;
  }
};

/**
 * Delete user job application (unsave job)
 * @param {string} applicationId - Application UUID
 */
export const deleteUserJobApplication = async (applicationId) => {
  try {
    if (!applicationId) throw new Error('Application ID is required');

    const { error } = await supabase
      .from('user_job_applications')
      .delete()
      .eq('id', applicationId);

    if (error) throw new Error(`Failed to delete job application: ${error.message}`);
  } catch (error) {
    console.error('Error in deleteUserJobApplication:', error);
    throw error;
  }
};

/**
 * Get user's job application statistics
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} - Statistics object
 */
export const getUserJobStats = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .rpc('get_user_job_stats', { p_user_id: userId });

    if (error) throw new Error(`Failed to fetch job stats: ${error.message}`);
    return data?.[0] || {
      total_saved: 0,
      total_applied: 0,
      total_interviewing: 0,
      total_offers: 0,
      total_rejected: 0
    };
  } catch (error) {
    console.error('Error in getUserJobStats:', error);
    // Return default stats if RPC fails
    return {
      total_saved: 0,
      total_applied: 0,
      total_interviewing: 0,
      total_offers: 0,
      total_rejected: 0
    };
  }
};

// ============================================================================
// USER SEARCH QUERIES (Search history)
// ============================================================================

/**
 * Fetch user's search history
 * @param {string} userId - User UUID
 * @param {number} limit - Max results to return
 * @returns {Promise<Array>} - Array of search queries
 */
export const fetchUserSearchHistory = async (userId, limit = 10) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('user_search_queries')
      .select('*')
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch search history: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchUserSearchHistory:', error);
    throw error;
  }
};

/**
 * Save user's search query
 * @param {Object} queryData - Search query data
 * @returns {Promise<Object>} - Created search query
 */
export const saveUserSearchQuery = async (queryData) => {
  try {
    const { user_id, job_title, location, work_type, easy_apply_only, results_count } = queryData;

    if (!user_id || !job_title) {
      throw new Error('User ID and job title are required');
    }

    const { data, error } = await supabase
      .from('user_search_queries')
      .insert([{
        user_id,
        job_title,
        location: location || null,
        work_type: work_type || null,
        easy_apply_only: easy_apply_only || false,
        results_count: results_count || 0
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to save search query: ${error.message}`);
    return data;
  } catch (error) {
    console.error('Error in saveUserSearchQuery:', error);
    throw error;
  }
};

/**
 * Delete user's search history item
 * @param {string} queryId - Search query UUID
 */
export const deleteUserSearchQuery = async (queryId) => {
  try {
    if (!queryId) throw new Error('Query ID is required');

    const { error } = await supabase
      .from('user_search_queries')
      .delete()
      .eq('id', queryId);

    if (error) throw new Error(`Failed to delete search query: ${error.message}`);
  } catch (error) {
    console.error('Error in deleteUserSearchQuery:', error);
    throw error;
  }
};

/**
 * Clear all user's search history
 * @param {string} userId - User UUID
 */
export const clearUserSearchHistory = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const { error } = await supabase
      .from('user_search_queries')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to clear search history: ${error.message}`);
  } catch (error) {
    console.error('Error in clearUserSearchHistory:', error);
    throw error;
  }
};

// ============================================================================
// ADVANCED SEARCH (Using stored procedure)
// ============================================================================

/**
 * Search jobs using PostgreSQL stored procedure (optimized)
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} - Array of job listings
 */
export const searchJobsAdvanced = async (filters = DEFAULT_FILTERS) => {
  try {
    const {
      job_title,
      location,
      work_type,
      easy_apply_only,
      date_filter,
      limit = 50,
      offset = 0
    } = { ...DEFAULT_FILTERS, ...filters };

    const { data, error } = await supabase
      .rpc('search_jobs', {
        p_job_title: job_title || null,
        p_location: location || null,
        p_work_type: work_type || null,
        p_easy_apply_only: easy_apply_only || false,
        p_date_filter: date_filter || 'all',
        p_limit: limit,
        p_offset: offset
      });

    if (error) throw new Error(`Failed to search jobs: ${error.message}`);
    return data || [];
  } catch (error) {
    console.error('Error in searchJobsAdvanced:', error);
    // Fallback to regular fetch if RPC fails
    return await fetchJobListings(filters);
  }
};
