/**
 * Application Dashboard Component
 *
 * Shows user's saved and applied jobs with status tracking
 * Displays analytics and application history
 */

import React, { useState, useEffect } from 'react';
import { useJobSearch } from '../context/JobSearchContext';
import { useAuth } from '../context/AuthContext';
import { formatJobDate, STATUS_LABELS, STATUS_COLORS } from '../types/jobSearchTypes';
import './ApplicationDashboard.css';

const ApplicationDashboard = ({ onClose }) => {
  const { user } = useAuth();
  const {
    userJobApplications,
    jobStats,
    fetchUserJobApplications,
    updateJobApplication,
    deleteJobApplication,
    openJobDetails
  } = useJobSearch();

  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredApplications, setFilteredApplications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserJobApplications();
    }
  }, [user]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(userJobApplications);
    } else {
      setFilteredApplications(
        userJobApplications.filter(app => app.status === statusFilter)
      );
    }
  }, [statusFilter, userJobApplications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateJobApplication(applicationId, { status: newStatus });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (applicationId) => {
    if (!confirm('Are you sure you want to remove this job from your list?')) {
      return;
    }

    try {
      await deleteJobApplication(applicationId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleViewJob = (job) => {
    onClose();
    openJobDetails(job);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'application-dashboard-overlay') {
      onClose();
    }
  };

  if (!user) {
    return (
      <div className="application-dashboard-overlay" onClick={handleOverlayClick}>
        <div className="application-dashboard">
          <div className="dashboard-header">
            <h2>My Applications</h2>
            <button className="close-btn" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="empty-state">
            <p>Please sign in to track your job applications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="application-dashboard-overlay" onClick={handleOverlayClick}>
      <div className="application-dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h2>My Applications</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{jobStats.total_saved}</span>
              <span className="stat-label">Saved</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{jobStats.total_applied}</span>
              <span className="stat-label">Applied</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{jobStats.total_interviewing}</span>
              <span className="stat-label">Interviewing</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{jobStats.total_offers}</span>
              <span className="stat-label">Offers</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="dashboard-filters">
          <button
            className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({userJobApplications.length})
          </button>
          <button
            className={`filter-chip ${statusFilter === 'saved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('saved')}
          >
            Saved ({jobStats.total_saved})
          </button>
          <button
            className={`filter-chip ${statusFilter === 'applied' ? 'active' : ''}`}
            onClick={() => setStatusFilter('applied')}
          >
            Applied ({jobStats.total_applied})
          </button>
          <button
            className={`filter-chip ${statusFilter === 'interviewing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('interviewing')}
          >
            Interviewing ({jobStats.total_interviewing})
          </button>
          <button
            className={`filter-chip ${statusFilter === 'offer' ? 'active' : ''}`}
            onClick={() => setStatusFilter('offer')}
          >
            Offers ({jobStats.total_offers})
          </button>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3>No Applications Found</h3>
              <p>
                {statusFilter === 'all'
                  ? 'Start saving jobs to track your applications'
                  : `No jobs in "${STATUS_LABELS[statusFilter]}" status`}
              </p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app.id} className="application-item">
                <div className="application-main">
                  <div className="application-info">
                    <h3 onClick={() => handleViewJob(app.job_listing)}>{app.job_listing.job_title}</h3>
                    <p className="company">{app.job_listing.company_name}</p>
                    <div className="meta">
                      <span>{app.job_listing.location}</span>
                      <span>•</span>
                      <span>Saved {formatJobDate(app.saved_at)}</span>
                      {app.applied_date && (
                        <>
                          <span>•</span>
                          <span>Applied {formatJobDate(app.applied_date)}</span>
                        </>
                      )}
                    </div>
                    {app.notes && (
                      <p className="notes">📝 {app.notes}</p>
                    )}
                  </div>

                  <div className="application-actions">
                    <select
                      className="status-select"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{ borderColor: STATUS_COLORS[app.status], color: STATUS_COLORS[app.status] }}
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>

                    <a
                      href={app.job_listing.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn"
                      title="View on LinkedIn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>

                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(app.id)}
                      title="Remove from list"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDashboard;
