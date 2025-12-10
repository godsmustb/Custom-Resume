/**
 * Job Details Modal Component
 *
 * Full-screen modal showing complete job details
 * Allows user to save job, update status, add notes
 */

import React, { useState, useEffect } from 'react';
import { useJobSearch } from '../context/JobSearchContext';
import { useAuth } from '../context/AuthContext';
import { formatJobDate, formatApplicantCount } from '../types/jobSearchTypes';
import './JobDetailsModal.css';

const JobDetailsModal = ({ job, onClose }) => {
  const { user } = useAuth();
  const { isJobSaved, saveJob, getUserApplication, updateJobApplication } = useJobSearch();

  const isSaved = isJobSaved(job.id);
  const userApp = getUserApplication(job.id);

  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('saved');

  useEffect(() => {
    if (userApp) {
      setNotes(userApp.notes || '');
      setStatus(userApp.status);
    }
  }, [userApp]);

  const handleSaveJob = async () => {
    if (!user) {
      alert('Please sign in to save jobs');
      return;
    }

    try {
      await saveJob(job.id, { notes });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateApplication = async () => {
    if (!userApp) return;

    try {
      await updateJobApplication(userApp.id, { notes, status });
      alert('Application updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'job-details-modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="job-details-modal-overlay" onClick={handleOverlayClick}>
      <div className="job-details-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2>{job.job_title}</h2>
            <p className="company-name">{job.company_name}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Job Info Section */}
          <section className="job-info-section">
            <div className="info-grid">
              <div className="info-item">
                <label>Location</label>
                <span>{job.location || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Work Type</label>
                <span>{job.work_type || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Employment Type</label>
                <span>{job.employment_type || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Experience Level</label>
                <span>{job.experience_level || 'Not specified'}</span>
              </div>
              {job.salary_range && (
                <div className="info-item">
                  <label>Salary Range</label>
                  <span>{job.salary_range}</span>
                </div>
              )}
              <div className="info-item">
                <label>Applicants</label>
                <span>{formatApplicantCount(job.applicant_count)}</span>
              </div>
              <div className="info-item">
                <label>Posted</label>
                <span>{formatJobDate(job.date_posted)}</span>
              </div>
              <div className="info-item">
                <label>Easy Apply</label>
                <span className={job.easy_apply ? 'badge-yes' : 'badge-no'}>
                  {job.easy_apply ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </section>

          {/* Job Description */}
          <section className="job-description-section">
            <h3>Job Description</h3>
            <div
              className="job-description"
              dangerouslySetInnerHTML={{ __html: job.job_description || '<p>No description available.</p>' }}
            ></div>
          </section>

          {/* User Actions (if logged in) */}
          {user && (
            <section className="user-actions-section">
              <h3>{isSaved ? 'Update Application' : 'Save This Job'}</h3>

              {isSaved && (
                <div className="form-group">
                  <label>Application Status</label>
                  <select
                    className="status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer Received</option>
                    <option value="rejected">Not Selected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="notes-textarea"
                  placeholder="Add your notes about this job..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                ></textarea>
              </div>

              <button
                className={`action-btn ${isSaved ? 'update' : 'save'}`}
                onClick={isSaved ? handleUpdateApplication : handleSaveJob}
              >
                {isSaved ? 'Update Application' : 'Save Job'}
              </button>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="view-linkedin-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            View on LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
