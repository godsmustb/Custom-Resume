/**
 * Job Card Component
 *
 * Displays individual job listing in a card format
 * Shows: title, company, location, work type, easy apply status, applicants, date
 */

import React from 'react';
import { useJobSearch } from '../context/JobSearchContext';
import { useAuth } from '../context/AuthContext';
import {
  formatJobDate,
  formatApplicantCount,
  getCompetitionLevel,
  getDaysSincePosted
} from '../types/jobSearchTypes';
import './JobCard.css';

const JobCard = ({ job }) => {
  const { user } = useAuth();
  const { openJobDetails, isJobSaved, saveJob, getUserApplication } = useJobSearch();

  const isSaved = isJobSaved(job.id);
  const userApp = getUserApplication(job.id);
  const daysSincePosted = getDaysSincePosted(job.date_posted);
  const isFresh = daysSincePosted <= 3;
  const competitionLevel = getCompetitionLevel(job.applicant_count);

  const handleSaveJob = async (e) => {
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to save jobs');
      return;
    }

    try {
      await saveJob(job.id);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCardClick = () => {
    openJobDetails(job);
  };

  return (
    <div
      className={`job-card ${isSaved ? 'saved' : ''}`}
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="job-card-header">
        <div className="job-title-section">
          <h3 className="job-title">{job.job_title}</h3>
          {isFresh && (
            <span className="fresh-badge">NEW</span>
          )}
        </div>

        {user && (
          <button
            className={`save-job-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleSaveJob}
            disabled={isSaved}
            title={isSaved ? 'Already saved' : 'Save job'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        )}
      </div>

      {/* Company Name */}
      <p className="company-name">{job.company_name}</p>

      {/* Job Meta Info */}
      <div className="job-meta">
        <span className="job-meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {job.location || 'Remote'}
        </span>

        {job.work_type && (
          <span className="job-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            {job.work_type}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="job-badges">
        {job.easy_apply && (
          <span className="badge easy-apply">Easy Apply</span>
        )}
        {job.employment_type && (
          <span className="badge employment-type">{job.employment_type}</span>
        )}
        {job.experience_level && (
          <span className="badge experience-level">{job.experience_level}</span>
        )}
      </div>

      {/* Job Footer */}
      <div className="job-card-footer">
        <div className="applicant-info">
          <span className={`applicant-count ${competitionLevel}`}>
            {formatApplicantCount(job.applicant_count)}
          </span>
          {competitionLevel === 'low' && (
            <span className="competition-badge low">Low competition</span>
          )}
          {competitionLevel === 'high' && (
            <span className="competition-badge high">High competition</span>
          )}
        </div>

        <span className="date-posted">{formatJobDate(job.date_posted)}</span>
      </div>

      {/* Application Status (if saved) */}
      {isSaved && userApp && (
        <div className="application-status-badge">
          <span className={`status-dot ${userApp.status}`}></span>
          {userApp.status === 'saved' && 'Saved'}
          {userApp.status === 'applied' && 'Applied'}
          {userApp.status === 'interviewing' && 'Interviewing'}
          {userApp.status === 'offer' && 'Offer Received'}
          {userApp.status === 'rejected' && 'Not Selected'}
        </div>
      )}
    </div>
  );
};

export default JobCard;
