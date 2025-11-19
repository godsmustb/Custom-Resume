/**
 * Cover Letter Editor
 *
 * Split-view editor for customizing cover letter templates.
 * Left: Form fields | Right: Live preview
 * Redesigned with professional spacing and Resume.io style
 */

import React, { useEffect, useState } from 'react';
import { useCoverLetter } from '../context/CoverLetterContext';
import { useAuth } from '../context/AuthContext';
import { replacePlaceholders, PLACEHOLDER_MAP } from '../types/coverLetterTypes';
import { downloadCoverLetterAsPDF } from '../services/coverLetterPDFService';

const CoverLetterEditor = () => {
  const { user } = useAuth();
  const {
    currentTemplate,
    formData,
    customizedContent,
    updateFormField,
    updateCustomizedContent,
    saveCoverLetter,
    showEditor,
    closeEditor,
  } = useCoverLetter();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Update customized content when form data or template changes
  useEffect(() => {
    if (currentTemplate) {
      const updated = replacePlaceholders(currentTemplate.template_content, formData);
      updateCustomizedContent(updated);
    }
  }, [formData, currentTemplate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customizedContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const filename = formData.fullName
        ? `${formData.fullName} - Cover Letter`
        : 'Cover Letter';
      await downloadCoverLetterAsPDF(customizedContent, filename);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save your cover letter');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const title = formData.fullName
        ? `${formData.fullName} - ${currentTemplate.job_title}`
        : `Cover Letter - ${currentTemplate.job_title}`;

      await saveCoverLetter(title);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Count filled vs total placeholders
  const totalPlaceholders = Object.keys(PLACEHOLDER_MAP).length;
  const filledPlaceholders = Object.values(formData).filter(v => v && v.trim()).length;
  const progress = Math.round((filledPlaceholders / totalPlaceholders) * 100);

  if (!showEditor || !currentTemplate) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      overflow: 'hidden',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '0.25rem'
              }}>
                {currentTemplate.job_title} - Cover Letter
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {currentTemplate.industry} • {currentTemplate.experience_level}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: progress === 100 ? '#059669' : '#4f46e5',
                  backgroundColor: progress === 100 ? '#d1fae5' : '#eef2ff',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '0.375rem'
                }}>
                  {progress}% Complete
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: copySuccess ? '#d1fae5' : '#ffffff',
                  color: copySuccess ? '#059669' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => !copySuccess && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseOut={(e) => !copySuccess && (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                {copySuccess ? '✓ Copied!' : 'Copy Text'}
              </button>

              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
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
                Download PDF
              </button>

              {user && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: saveSuccess ? '#059669' : '#4f46e5',
                    color: '#ffffff',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !isSaving && !saveSuccess && (e.currentTarget.style.backgroundColor = '#4338ca')}
                  onMouseOut={(e) => !isSaving && !saveSuccess && (e.currentTarget.style.backgroundColor = '#4f46e5')}
                >
                  {isSaving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save to Account'}
                </button>
              )}

              <button
                onClick={closeEditor}
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
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
          </div>

          {/* Error/Success Messages */}
          {saveError && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#991b1b',
              fontSize: '0.875rem'
            }}>
              {saveError}
            </div>
          )}
        </div>

        {/* Split View */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: Form Fields */}
          <div style={{
            width: '45%',
            borderRight: '1px solid #e5e7eb',
            overflow: 'auto',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ padding: '2rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>
                Fill in your information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.entries(PLACEHOLDER_MAP).map(([placeholder, fieldName]) => (
                  <div key={fieldName}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      {placeholder.replace(/[\[\]]/g, '')}
                      {!formData[fieldName] && (
                        <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>
                      )}
                    </label>
                    {fieldName === 'yourAddress' || fieldName === 'companyAddress' ? (
                      <textarea
                        value={formData[fieldName] || ''}
                        onChange={(e) => updateFormField(fieldName, e.target.value)}
                        placeholder={`Enter ${placeholder.replace(/[\[\]]/g, '').toLowerCase()}`}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: `2px solid ${!formData[fieldName] ? '#fecaca' : '#d1d5db'}`,
                          borderRadius: '0.5rem',
                          fontSize: '0.9375rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s',
                          resize: 'vertical',
                          backgroundColor: '#ffffff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = !formData[fieldName] ? '#fecaca' : '#d1d5db'}
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[fieldName] || ''}
                        onChange={(e) => updateFormField(fieldName, e.target.value)}
                        placeholder={`Enter ${placeholder.replace(/[\[\]]/g, '').toLowerCase()}`}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: `2px solid ${!formData[fieldName] ? '#fecaca' : '#d1d5db'}`,
                          borderRadius: '0.5rem',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: '#ffffff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = !formData[fieldName] ? '#fecaca' : '#d1d5db'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ padding: '2rem' }}>
              <div style={{
                maxWidth: '700px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                padding: '3rem 2.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Georgia, serif',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                color: '#1f2937'
              }}>
                {customizedContent.split('\n').map((line, index) => (
                  <p key={index} style={{
                    margin: '0 0 0.75rem 0',
                    backgroundColor: line.includes('[') && line.includes(']') ? '#fef3c7' : 'transparent',
                    padding: line.includes('[') && line.includes(']') ? '0.25rem 0.5rem' : '0',
                    borderRadius: line.includes('[') && line.includes(']') ? '0.25rem' : '0'
                  }}>
                    {line || <br />}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterEditor;
