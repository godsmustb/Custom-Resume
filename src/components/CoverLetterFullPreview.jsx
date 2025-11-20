/**
 * Cover Letter Full Preview Modal
 *
 * Shows a full-size preview of a cover letter template
 */

import React from 'react';

const CoverLetterFullPreview = ({ template, onClose, onUseTemplate }) => {
  if (!template) return null;

  // Get industry-specific color
  const getIndustryColor = (industry) => {
    const colorMap = {
      'Technology': '#4f46e5',
      'Healthcare': '#059669',
      'Marketing': '#dc2626',
      'Business': '#0369a1',
      'Creative': '#7c3aed',
      'Finance': '#0f766e',
      'Sales': '#ea580c',
      'Customer Service': '#2563eb',
      'Administrative': '#6b7280',
      'Human Resources': '#db2777',
      'Education': '#0891b2',
      'Real Estate': '#65a30d',
      'Skilled Trades': '#a16207',
      'Hospitality': '#be123c',
      'Retail': '#9333ea',
      'Logistics': '#0284c7',
      'Operations': '#0d9488',
    };
    return colorMap[industry] || '#4f46e5';
  };

  const accentColor = getIndustryColor(template.industry);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backdropFilter: 'blur(4px)'
    }}
    onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {template.job_title}
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
              <span style={{
                fontSize: '0.875rem',
                color: '#ffffff',
                backgroundColor: accentColor,
                padding: '0.25rem 0.625rem',
                borderRadius: '0.375rem',
                fontWeight: '600'
              }}>
                {template.experience_level}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
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
              fontSize: '1.5rem',
              fontWeight: '600',
              transition: 'all 0.2s'
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

        {/* Preview Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f9fafb',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '3rem 2.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Georgia, serif',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            color: '#1f2937',
            minHeight: '800px'
          }}>
            {/* Header with colored border */}
            <div style={{
              borderBottom: `3px solid ${accentColor}`,
              paddingBottom: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
                lineHeight: '1.5'
              }}>
                [Your Address]<br />
                [Phone Number] • [Email Address]
              </div>
              <div style={{
                fontSize: '0.8125rem',
                color: '#9ca3af',
                marginTop: '0.75rem'
              }}>
                [Date]
              </div>
            </div>

            {/* Company Address */}
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              [Hiring Manager Name]<br />
              [Company Name]<br />
              [Company Address]
            </div>

            {/* Salutation */}
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Dear [Hiring Manager Name],
            </div>

            {/* Template Content */}
            <div style={{
              fontSize: '0.9375rem',
              color: '#374151',
              lineHeight: '1.6',
              textAlign: 'justify'
            }}>
              {template.template_content.split('\n\n').slice(3).map((paragraph, index) => (
                <p key={index} style={{ marginBottom: '1rem' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Close
          </button>
          <button
            onClick={() => {
              onUseTemplate();
              onClose();
            }}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: accentColor,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterFullPreview;
