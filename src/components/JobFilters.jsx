/**
 * Job Filters Component
 *
 * Sidebar filter controls for job search:
 * - Easy Apply toggle
 * - Date filter (24h, 7d, 30d)
 * - Location
 * - Work Type (Remote/Hybrid/On-site)
 * - Employment Type
 * - Experience Level
 */

import React from 'react';
import { useJobSearch } from '../context/JobSearchContext';
import {
  WORK_TYPE,
  EMPLOYMENT_TYPE,
  EXPERIENCE_LEVEL,
  DATE_FILTER
} from '../types/jobSearchTypes';
import './JobFilters.css';

const JobFilters = () => {
  const { searchFilters, updateFilters, clearFilters, filteredJobs, jobListings } = useJobSearch();

  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const hasActiveFilters = () => {
    return (
      searchFilters.easy_apply_only ||
      searchFilters.date_filter !== 'all' ||
      searchFilters.location ||
      searchFilters.work_type ||
      searchFilters.employment_type ||
      searchFilters.experience_level
    );
  };

  return (
    <div className="job-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters() && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className="filter-results-count">
        <span>
          {filteredJobs.length} of {jobListings.length} jobs
        </span>
      </div>

      {/* Easy Apply Toggle */}
      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={searchFilters.easy_apply_only}
            onChange={(e) => handleFilterChange('easy_apply_only', e.target.checked)}
          />
          <span className="checkmark"></span>
          <span className="checkbox-label">
            Easy Apply only
            <span className="badge-sm easy-apply">Quick</span>
          </span>
        </label>
      </div>

      <div className="filter-divider"></div>

      {/* Date Posted */}
      <div className="filter-group">
        <label className="filter-label">Date Posted</label>
        <div className="radio-group">
          <label className="filter-radio">
            <input
              type="radio"
              name="date_filter"
              value={DATE_FILTER.ALL}
              checked={searchFilters.date_filter === DATE_FILTER.ALL}
              onChange={(e) => handleFilterChange('date_filter', e.target.value)}
            />
            <span>All time</span>
          </label>
          <label className="filter-radio">
            <input
              type="radio"
              name="date_filter"
              value={DATE_FILTER.DAY}
              checked={searchFilters.date_filter === DATE_FILTER.DAY}
              onChange={(e) => handleFilterChange('date_filter', e.target.value)}
            />
            <span>Last 24 hours</span>
          </label>
          <label className="filter-radio">
            <input
              type="radio"
              name="date_filter"
              value={DATE_FILTER.WEEK}
              checked={searchFilters.date_filter === DATE_FILTER.WEEK}
              onChange={(e) => handleFilterChange('date_filter', e.target.value)}
            />
            <span>Last week</span>
          </label>
          <label className="filter-radio">
            <input
              type="radio"
              name="date_filter"
              value={DATE_FILTER.MONTH}
              checked={searchFilters.date_filter === DATE_FILTER.MONTH}
              onChange={(e) => handleFilterChange('date_filter', e.target.value)}
            />
            <span>Last month</span>
          </label>
        </div>
      </div>

      <div className="filter-divider"></div>

      {/* Work Type */}
      <div className="filter-group">
        <label className="filter-label">Work Type</label>
        <select
          className="filter-select"
          value={searchFilters.work_type}
          onChange={(e) => handleFilterChange('work_type', e.target.value)}
        >
          <option value="">All</option>
          <option value={WORK_TYPE.REMOTE}>Remote</option>
          <option value={WORK_TYPE.HYBRID}>Hybrid</option>
          <option value={WORK_TYPE.ONSITE}>On-site</option>
        </select>
      </div>

      <div className="filter-divider"></div>

      {/* Employment Type */}
      <div className="filter-group">
        <label className="filter-label">Employment Type</label>
        <select
          className="filter-select"
          value={searchFilters.employment_type}
          onChange={(e) => handleFilterChange('employment_type', e.target.value)}
        >
          <option value="">All</option>
          <option value={EMPLOYMENT_TYPE.FULL_TIME}>Full-time</option>
          <option value={EMPLOYMENT_TYPE.PART_TIME}>Part-time</option>
          <option value={EMPLOYMENT_TYPE.CONTRACT}>Contract</option>
          <option value={EMPLOYMENT_TYPE.INTERNSHIP}>Internship</option>
        </select>
      </div>

      <div className="filter-divider"></div>

      {/* Experience Level */}
      <div className="filter-group">
        <label className="filter-label">Experience Level</label>
        <select
          className="filter-select"
          value={searchFilters.experience_level}
          onChange={(e) => handleFilterChange('experience_level', e.target.value)}
        >
          <option value="">All</option>
          <option value={EXPERIENCE_LEVEL.INTERNSHIP}>Internship</option>
          <option value={EXPERIENCE_LEVEL.ENTRY}>Entry level</option>
          <option value={EXPERIENCE_LEVEL.ASSOCIATE}>Associate</option>
          <option value={EXPERIENCE_LEVEL.MID_SENIOR}>Mid-Senior level</option>
          <option value={EXPERIENCE_LEVEL.DIRECTOR}>Director</option>
          <option value={EXPERIENCE_LEVEL.EXECUTIVE}>Executive</option>
        </select>
      </div>

      <div className="filter-divider"></div>

      {/* Location */}
      <div className="filter-group">
        <label className="filter-label">Location</label>
        <input
          type="text"
          className="filter-input"
          placeholder="e.g., San Francisco, CA"
          value={searchFilters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>
    </div>
  );
};

export default JobFilters;
