/**
 * Cover Letter Preview
 *
 * Renders a scaled-down visual preview of a cover letter template
 * Shows the actual letter format with styling
 */

import React from 'react';

const CoverLetterPreview = ({ template }) => {
  // Get industry-specific color scheme
  const getIndustryColor = (industry) => {
    const colorMap = {
      'Technology': '#4f46e5', // Indigo
      'Healthcare': '#059669', // Green
      'Marketing': '#dc2626', // Red
      'Business': '#0369a1', // Blue
      'Creative': '#7c3aed', // Purple
      'Finance': '#0f766e', // Teal
      'Sales': '#ea580c', // Orange
      'Customer Service': '#2563eb', // Blue
      'Administrative': '#6b7280', // Gray
      'Human Resources': '#db2777', // Pink
      'Education': '#0891b2', // Cyan
      'Real Estate': '#65a30d', // Lime
      'Skilled Trades': '#a16207', // Amber
      'Hospitality': '#be123c', // Rose
      'Retail': '#9333ea', // Purple
      'Logistics': '#0284c7', // Sky
      'Operations': '#0d9488', // Teal
    };
    return colorMap[industry] || '#4f46e5';
  };

  const accentColor = getIndustryColor(template.industry);

  // Extract first few lines for preview
  const lines = template.template_content.split('\n').slice(0, 20);

  return (
    <div style={{
      height: '280px',
      backgroundColor: '#ffffff',
      padding: '1.25rem',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Georgia, serif',
      fontSize: '0.5rem',
      lineHeight: '1.4',
      color: '#1f2937'
    }}>
      {/* Header area with colored accent */}
      <div style={{
        borderBottom: `2px solid ${accentColor}`,
        paddingBottom: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        <div style={{
          fontSize: '0.45rem',
          color: '#6b7280',
          marginBottom: '0.25rem',
          lineHeight: '1.3'
        }}>
          [Your Address]<br />
          [Phone Number] • [Email Address]
        </div>
        <div style={{
          fontSize: '0.4rem',
          color: '#9ca3af',
          marginTop: '0.35rem'
        }}>
          [Date]
        </div>
      </div>

      {/* Company address */}
      <div style={{
        fontSize: '0.45rem',
        color: '#6b7280',
        marginBottom: '0.5rem',
        lineHeight: '1.3'
      }}>
        [Hiring Manager Name]<br />
        [Company Name]<br />
        [Company Address]
      </div>

      {/* Salutation */}
      <div style={{
        fontSize: '0.5rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '0.4rem'
      }}>
        Dear [Hiring Manager Name],
      </div>

      {/* Preview text - first paragraph */}
      <div style={{
        fontSize: '0.45rem',
        color: '#374151',
        lineHeight: '1.4',
        marginBottom: '0.35rem',
        textAlign: 'justify'
      }}>
        {template.preview_text.substring(0, 180)}...
      </div>

      {/* Additional paragraphs as gray blocks */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        marginTop: '0.4rem'
      }}>
        <div style={{
          height: '1.2rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.125rem'
        }} />
        <div style={{
          height: '1.2rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.125rem',
          width: '90%'
        }} />
        <div style={{
          height: '1.2rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.125rem',
          width: '85%'
        }} />
      </div>

      {/* Signature area */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1.25rem',
        fontSize: '0.45rem',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>Sincerely,</div>
        <div style={{ fontWeight: '600', color: '#111827' }}>[Full Name]</div>
      </div>

      {/* Subtle watermark */}
      <div style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        fontSize: '0.35rem',
        color: accentColor,
        opacity: 0.3,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {template.job_title}
      </div>
    </div>
  );
};

export default CoverLetterPreview;
