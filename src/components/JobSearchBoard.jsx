/**
 * Job Search Board Component
 *
 * Main container for the Job Search feature with:
 * - Search bar at top
 * - Filters sidebar on left
 * - Job cards grid on right
 * - Application dashboard access
 *
 * Design: Minimalistic and modern with clean layout
 */

import React, { useState, useEffect } from 'react';
import { useJobSearch } from '../context/JobSearchContext';
import { useAuth } from '../context/AuthContext';
import JobFilters from './JobFilters';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';
import ApplicationDashboard from './ApplicationDashboard';
import './JobSearchBoard.css';

const JobSearchBoard = () => {
  const { user } = useAuth();
  const {
    filteredJobs,
    isSearching,
    searchError,
    searchLinkedInJobs,
    fetchJobsWithFilters,
    showJobDetails,
    showApplicationDashboard,
    closeJobDetails,
    closeApplicationDashboard,
    selectedJob,
    jobStats
  } = useJobSearch();

  // Local state
  const [jobTitle, setJobTitle] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState('date_posted'); // date_posted, applicant_count

  useEffect(() => {
    // Fetch existing jobs from database on mount
    fetchJobsWithFilters();
  }, []);

  /**
   * Handle job search submission
   */
  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!jobTitle.trim()) {
      alert('Please enter a job title to search');
      return;
    }

    try {
      await searchLinkedInJobs(jobTitle, {
        location: '',
        workType: '',
        easyApplyOnly: false,
        maxResults: 50
      });
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  /**
   * Handle Enter key press in search input
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="job-search-board">
      {/* Header with Search Bar */}
      <div className="job-search-header">
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Enter job title (e.g., Product Manager, Software Engineer)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
            />
            <button
              className="search-button"
              onClick={handleSearch}
              disabled={isSearching || !jobTitle.trim()}
            >
              {isSearching ? (
                <>
                  <span className="spinner"></span>
                  Searching...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  Find Job Openings
                </>
              )}
            </button>
          </div>

          {searchError && (
            <div className="search-error">
              ⚠️ {searchError}
            </div>
          )}
        </div>

        {/* Stats and Actions */}
        <div className="header-actions">
          <button
            className="toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>

          {user && (
            <button
              className="my-applications-btn"
              onClick={closeApplicationDashboard ? () => closeApplicationDashboard() : undefined}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              My Applications
              {(jobStats.total_saved + jobStats.total_applied) > 0 && (
                <span className="application-count">
                  {jobStats.total_saved + jobStats.total_applied}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Filters + Job Grid */}
      <div className="job-search-content">
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="filters-sidebar">
            <JobFilters />
          </aside>
        )}

        {/* Job Listings Grid */}
        <main className={`jobs-grid-container ${!showFilters ? 'full-width' : ''}`}>
          {/* Results Header */}
          <div className="results-header">
            <div className="results-info">
              <h2>
                {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
              </h2>
              {jobTitle && (
                <p className="search-query">
                  Showing results for: <strong>{jobTitle}</strong>
                </p>
              )}
            </div>

            <div className="sort-controls">
              <label htmlFor="sort-by">Sort by:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date_posted">Most Recent</option>
                <option value="applicant_count">Fewest Applicants</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isSearching && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Searching LinkedIn for {jobTitle}...</p>
              <p className="loading-subtext">This may take a few seconds</p>
            </div>
          )}

          {/* Empty State */}
          {!isSearching && filteredJobs.length === 0 && (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <h3>No Jobs Found</h3>
              <p>
                {jobTitle
                  ? `Try adjusting your search or filters to find more jobs`
                  : `Enter a job title above to start searching`
                }
              </p>
            </div>
          )}

          {/* Job Cards Grid */}
          {!isSearching && filteredJobs.length > 0 && (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showJobDetails && selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={closeJobDetails} />
      )}

      {showApplicationDashboard && (
        <ApplicationDashboard onClose={closeApplicationDashboard} />
      )}
    </div>
  );
};

export default JobSearchBoard;
