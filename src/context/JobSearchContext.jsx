/**
 * Job Search Context
 *
 * Manages global state for the Job Search feature including:
 * - Job listings from LinkedIn scraping
 * - User's saved/applied jobs
 * - Search filters and history
 * - Application tracking
 *
 * Pattern: Follows same structure as ResumeContext and CoverLetterContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as jobSearchService from '../services/jobSearchService';
import * as scraperService from '../services/linkedInScraperService';
import { DEFAULT_FILTERS, APPLICATION_STATUS } from '../types/jobSearchTypes';

const JobSearchContext = createContext();

/**
 * Hook to access Job Search context
 * @returns {Object} - Job search state and methods
 */
export const useJobSearch = () => {
  const context = useContext(JobSearchContext);
  if (!context) {
    throw new Error('useJobSearch must be used within JobSearchProvider');
  }
  return context;
};

/**
 * Job Search Provider Component
 */
export const JobSearchProvider = ({ children }) => {
  const { user } = useAuth();

  // ============================================================================
  // STATE
  // ============================================================================

  // Job listings state
  const [jobListings, setJobListings] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // User's saved/applied jobs
  const [userJobApplications, setUserJobApplications] = useState([]);
  const [jobStats, setJobStats] = useState({
    total_saved: 0,
    total_applied: 0,
    total_interviewing: 0,
    total_offers: 0,
    total_rejected: 0
  });

  // Search state
  const [searchFilters, setSearchFilters] = useState(DEFAULT_FILTERS);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationDashboard, setShowApplicationDashboard] = useState(false);

  // ============================================================================
  // FETCH DATA ON USER CHANGE
  // ============================================================================

  useEffect(() => {
    if (user) {
      fetchUserJobApplications();
      fetchUserJobStats();
      fetchUserSearchHistory();
    } else {
      // Clear user-specific data when logged out
      setUserJobApplications([]);
      setJobStats({
        total_saved: 0,
        total_applied: 0,
        total_interviewing: 0,
        total_offers: 0,
        total_rejected: 0
      });
      setSearchHistory([]);
    }
  }, [user]);

  // ============================================================================
  // JOB LISTINGS (Public jobs from scraping)
  // ============================================================================

  /**
   * Search LinkedIn for jobs
   * @param {string} jobTitle - Job title to search for
   * @param {Object} options - Search options (location, workType, etc.)
   */
  const searchLinkedInJobs = async (jobTitle, options = {}) => {
    try {
      setIsSearching(true);
      setSearchError(null);
      setError(null);

      console.log('🔍 Searching for:', jobTitle, options);

      // Use scraper service (with mock fallback)
      const scrapedJobs = await scraperService.scrapeLinkedInJobsWithFallback(
        jobTitle,
        options
      );

      setJobListings(scrapedJobs);
      setFilteredJobs(scrapedJobs);

      // Save search query if user is logged in
      if (user) {
        await saveSearchQuery({
          job_title: jobTitle,
          location: options.location,
          work_type: options.workType,
          easy_apply_only: options.easyApplyOnly,
          results_count: scrapedJobs.length
        });
      }

      return scrapedJobs;
    } catch (error) {
      console.error('Error searching LinkedIn jobs:', error);
      setSearchError(error.message);
      setError(error.message);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Fetch job listings with filters (from database)
   * @param {Object} filters - Filter options
   */
  const fetchJobsWithFilters = async (filters = searchFilters) => {
    try {
      setLoading(true);
      setError(null);

      const jobs = await jobSearchService.fetchJobListings(filters);
      setJobListings(jobs);
      setFilteredJobs(jobs);

      return jobs;
    } catch (error) {
      console.error('Error fetching job listings:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update search filters and re-fetch
   * @param {Object} newFilters - Updated filter values
   */
  const updateFilters = useCallback(async (newFilters) => {
    const updatedFilters = { ...searchFilters, ...newFilters };
    setSearchFilters(updatedFilters);

    // Apply filters locally if we already have jobs
    if (jobListings.length > 0) {
      applyFiltersLocally(jobListings, updatedFilters);
    } else {
      await fetchJobsWithFilters(updatedFilters);
    }
  }, [searchFilters, jobListings]);

  /**
   * Apply filters to existing job listings (client-side filtering)
   * @param {Array} jobs - Job listings to filter
   * @param {Object} filters - Filter criteria
   */
  const applyFiltersLocally = (jobs, filters) => {
    let filtered = [...jobs];

    // Filter by job title
    if (filters.job_title && filters.job_title.trim()) {
      const searchTerm = filters.job_title.toLowerCase();
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by location
    if (filters.location && filters.location.trim()) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(locationTerm)
      );
    }

    // Filter by work type
    if (filters.work_type) {
      filtered = filtered.filter(job => job.work_type === filters.work_type);
    }

    // Filter by Easy Apply
    if (filters.easy_apply_only) {
      filtered = filtered.filter(job => job.easy_apply === true);
    }

    // Filter by employment type
    if (filters.employment_type) {
      filtered = filtered.filter(job => job.employment_type === filters.employment_type);
    }

    // Filter by experience level
    if (filters.experience_level) {
      filtered = filtered.filter(job => job.experience_level === filters.experience_level);
    }

    // Filter by date
    if (filters.date_filter && filters.date_filter !== 'all') {
      const now = new Date();
      let cutoffDate;

      switch (filters.date_filter) {
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
        filtered = filtered.filter(job => {
          const jobDate = new Date(job.date_posted);
          return jobDate >= cutoffDate;
        });
      }
    }

    setFilteredJobs(filtered);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchFilters(DEFAULT_FILTERS);
    setFilteredJobs(jobListings);
  };

  // ============================================================================
  // USER JOB APPLICATIONS (Saved/Applied jobs)
  // ============================================================================

  /**
   * Fetch user's saved/applied jobs
   * @param {Object} filters - Optional status filter
   */
  const fetchUserJobApplications = async (filters = {}) => {
    try {
      if (!user) {
        setUserJobApplications([]);
        return [];
      }

      setLoading(true);
      const applications = await jobSearchService.fetchUserJobApplications(user.id, filters);
      setUserJobApplications(applications);
      return applications;
    } catch (error) {
      console.error('Error fetching user job applications:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save job for user
   * @param {string} jobListingId - Job listing UUID
   * @param {Object} additionalData - Additional data (resume_id, notes, etc.)
   */
  const saveJob = async (jobListingId, additionalData = {}) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to save jobs');
      }

      const applicationData = {
        user_id: user.id,
        job_listing_id: jobListingId,
        ...additionalData
      };

      const savedApplication = await jobSearchService.saveJobForUser(applicationData);

      // Update state
      setUserJobApplications(prev => [savedApplication, ...prev]);
      await fetchUserJobStats();

      return savedApplication;
    } catch (error) {
      console.error('Error saving job:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Check if user has already saved a job
   * @param {string} jobListingId - Job listing UUID
   * @returns {boolean} - True if already saved
   */
  const isJobSaved = (jobListingId) => {
    return userJobApplications.some(app => app.job_listing_id === jobListingId);
  };

  /**
   * Get user's application for a specific job
   * @param {string} jobListingId - Job listing UUID
   * @returns {Object|null} - Application object or null
   */
  const getUserApplication = (jobListingId) => {
    return userJobApplications.find(app => app.job_listing_id === jobListingId) || null;
  };

  /**
   * Update user's job application
   * @param {string} applicationId - Application UUID
   * @param {Object} updates - Fields to update
   */
  const updateJobApplication = async (applicationId, updates) => {
    try {
      const updatedApplication = await jobSearchService.updateUserJobApplication(
        applicationId,
        updates
      );

      // Update state
      setUserJobApplications(prev =>
        prev.map(app => (app.id === applicationId ? updatedApplication : app))
      );

      await fetchUserJobStats();

      return updatedApplication;
    } catch (error) {
      console.error('Error updating job application:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Delete user's job application (unsave job)
   * @param {string} applicationId - Application UUID
   */
  const deleteJobApplication = async (applicationId) => {
    try {
      await jobSearchService.deleteUserJobApplication(applicationId);

      // Update state
      setUserJobApplications(prev =>
        prev.filter(app => app.id !== applicationId)
      );

      await fetchUserJobStats();
    } catch (error) {
      console.error('Error deleting job application:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Fetch user's job statistics
   */
  const fetchUserJobStats = async () => {
    try {
      if (!user) return;

      const stats = await jobSearchService.getUserJobStats(user.id);
      setJobStats(stats);
    } catch (error) {
      console.error('Error fetching job stats:', error);
      // Don't set error state for stats (non-critical)
    }
  };

  // ============================================================================
  // SEARCH HISTORY
  // ============================================================================

  /**
   * Fetch user's search history
   */
  const fetchUserSearchHistory = async () => {
    try {
      if (!user) return;

      const history = await jobSearchService.fetchUserSearchHistory(user.id);
      setSearchHistory(history);
    } catch (error) {
      console.error('Error fetching search history:', error);
      // Don't set error state for history (non-critical)
    }
  };

  /**
   * Save search query to history
   * @param {Object} queryData - Search query data
   */
  const saveSearchQuery = async (queryData) => {
    try {
      if (!user) return;

      const savedQuery = await jobSearchService.saveUserSearchQuery({
        user_id: user.id,
        ...queryData
      });

      setSearchHistory(prev => [savedQuery, ...prev]);
    } catch (error) {
      console.error('Error saving search query:', error);
      // Don't throw - search history is non-critical
    }
  };

  /**
   * Delete search history item
   * @param {string} queryId - Search query UUID
   */
  const deleteSearchQuery = async (queryId) => {
    try {
      await jobSearchService.deleteUserSearchQuery(queryId);
      setSearchHistory(prev => prev.filter(q => q.id !== queryId));
    } catch (error) {
      console.error('Error deleting search query:', error);
      throw error;
    }
  };

  /**
   * Clear all search history
   */
  const clearSearchHistory = async () => {
    try {
      if (!user) return;

      await jobSearchService.clearUserSearchHistory(user.id);
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  };

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  /**
   * Open job details modal
   * @param {Object} job - Job listing object
   */
  const openJobDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  /**
   * Close job details modal
   */
  const closeJobDetails = () => {
    setSelectedJob(null);
    setShowJobDetails(false);
  };

  /**
   * Open application dashboard
   */
  const openApplicationDashboard = () => {
    setShowApplicationDashboard(true);
  };

  /**
   * Close application dashboard
   */
  const closeApplicationDashboard = () => {
    setShowApplicationDashboard(false);
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = {
    // Job listings data
    jobListings,
    filteredJobs,
    selectedJob,

    // User applications data
    userJobApplications,
    jobStats,

    // Search state
    searchFilters,
    searchHistory,
    isSearching,
    searchError,

    // UI state
    loading,
    error,
    showJobDetails,
    showApplicationDashboard,

    // Job listings methods
    searchLinkedInJobs,
    fetchJobsWithFilters,
    updateFilters,
    applyFiltersLocally,
    clearFilters,

    // User applications methods
    fetchUserJobApplications,
    saveJob,
    isJobSaved,
    getUserApplication,
    updateJobApplication,
    deleteJobApplication,
    fetchUserJobStats,

    // Search history methods
    fetchUserSearchHistory,
    saveSearchQuery,
    deleteSearchQuery,
    clearSearchHistory,

    // UI methods
    openJobDetails,
    closeJobDetails,
    openApplicationDashboard,
    closeApplicationDashboard,
    setSelectedJob,
    setShowJobDetails,
    setShowApplicationDashboard,
    setError
  };

  return (
    <JobSearchContext.Provider value={value}>
      {children}
    </JobSearchContext.Provider>
  );
};
