/**
 * Cover Letter Template Browser
 *
 * Modal component for browsing and selecting cover letter templates.
 * Features filters for industry, experience level, and job title search.
 * Redesigned UI matching Resume.io style
 */

import React, { useState, useEffect } from 'react';
import { useCoverLetter } from '../context/CoverLetterContext';
import { INDUSTRIES, EXPERIENCE_LEVELS } from '../types/coverLetterTypes';

const CoverLetterTemplateBrowser = () => {
  const {
    templates,
    templatesLoading,
    templatesError,
    fetchTemplates,
    startNewLetter,
    showTemplateBrowser,
    closeTemplateBrowser,
  } = useCoverLetter();

  // Filter state
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch templates when filters change
  useEffect(() => {
    if (showTemplateBrowser) {
      const filters = {};

      if (selectedIndustry !== 'All Industries') {
        filters.industry = selectedIndustry;
      }

      if (selectedExperience !== 'All Levels') {
        filters.experience_level = selectedExperience;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery;
      }

      fetchTemplates(filters);
    }
  }, [selectedIndustry, selectedExperience, searchQuery, showTemplateBrowser]);

  const handleSelectTemplate = (template) => {
    startNewLetter(template);
    closeTemplateBrowser();
  };

  const handleReset = () => {
    setSelectedIndustry('All Industries');
    setSelectedExperience('All Levels');
    setSearchQuery('');
  };

  if (!showTemplateBrowser) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      overflow: 'auto',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '1400px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '2rem 2.5rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  Choose a Template
                </h2>
                <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                  {templates.length} professional templates available
                </p>
              </div>
              <button
                onClick={closeTemplateBrowser}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontSize: '1.5rem',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                ×
              </button>
            </div>

            {/* Filters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'end'
            }}>
              {/* Search */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Search by job title
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* Industry Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="All Industries">All Industries</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Experience Level
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="All Levels">All Levels</option>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '2.5rem',
            backgroundColor: '#f9fafb'
          }}>
            {templatesLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{
                  display: 'inline-block',
                  width: '3rem',
                  height: '3rem',
                  border: '4px solid #f3f4f6',
                  borderTopColor: '#4f46e5',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading templates...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : templatesError ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: '#fef2f2',
                borderRadius: '0.75rem',
                border: '1px solid #fecaca'
              }}>
                <svg style={{ width: '3rem', height: '3rem', color: '#dc2626', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p style={{ color: '#991b1b', fontWeight: '600', marginBottom: '0.5rem' }}>Failed to load templates</p>
                <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{templatesError}</p>
              </div>
            ) : templates.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem',
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <svg style={{ width: '4rem', height: '4rem', color: '#9ca3af', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p style={{ color: '#6b7280', fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  No templates found
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {templates.map((template) => (
                  <div
                    key={template.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                      e.currentTarget.style.borderColor = '#4f46e5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {/* Template Preview Placeholder */}
                    <div style={{
                      height: '280px',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid #e5e7eb',
                      position: 'relative'
                    }}>
                      <svg style={{ width: '4rem', height: '4rem', color: '#d1d5db' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {/* Experience Level Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {template.experience_level}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '0.5rem',
                        lineHeight: '1.4'
                      }}>
                        {template.job_title}
                      </h3>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          backgroundColor: '#f3f4f6',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '0.375rem',
                          fontWeight: '500'
                        }}>
                          {template.industry}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        marginBottom: '1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {template.preview_text}
                      </p>

                      <button
                        onClick={() => handleSelectTemplate(template)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#4f46e5',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#4338ca';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#4f46e5';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Use This Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterTemplateBrowser;
