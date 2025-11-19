/**
 * Cover Letter Editor
 *
 * Split-view editor with form fields on left and live preview on right.
 * Supports real-time placeholder replacement, copy, save, and PDF download.
 */

import React, { useState, useEffect } from 'react';
import { useCoverLetter } from '../context/CoverLetterContext';
import { useAuth } from '../context/AuthContext';
import {
  PLACEHOLDER_MAP,
  replacePlaceholders,
  getUnfilledPlaceholders,
  formatFieldName,
} from '../types/coverLetterTypes';

const CoverLetterEditor = () => {
  const { user } = useAuth();
  const {
    showEditor,
    currentTemplate,
    currentLetter,
    formData,
    customizedContent,
    updateFormField,
    updateCustomizedContent,
    saveCoverLetter,
    resetEditor,
  } = useCoverLetter();

  const [title, setTitle] = useState('Untitled Cover Letter');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  // Update customized content when form data changes
  useEffect(() => {
    if (currentTemplate) {
      const updated = replacePlaceholders(currentTemplate.template_content, formData);
      updateCustomizedContent(updated);
    }
  }, [formData, currentTemplate]);

  // Set initial title from current letter or template
  useEffect(() => {
    if (currentLetter) {
      setTitle(currentLetter.title);
    } else if (currentTemplate) {
      setTitle(`Cover Letter - ${currentTemplate.job_title}`);
    }
  }, [currentLetter, currentTemplate]);

  const handleSave = async () => {
    if (!user) {
      setSaveMessage('Please sign in to save your cover letter');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      await saveCoverLetter(title);
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setSaveMessage(`Error: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customizedContent);
      setCopyMessage('Copied to clipboard!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (error) {
      console.error('Error copying:', error);
      setCopyMessage('Failed to copy');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const handleDownloadPDF = async () => {
    // Import PDF service dynamically
    const { downloadCoverLetterAsPDF } = await import('../services/coverLetterPDFService');

    try {
      await downloadCoverLetterAsPDF(customizedContent, title);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleClose = () => {
    if (confirm('Are you sure you want to close? Unsaved changes will be lost.')) {
      resetEditor();
    }
  };

  const unfilledPlaceholders = getUnfilledPlaceholders(customizedContent);

  if (!showEditor) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title */}
            <div className="flex items-center">
              <button
                onClick={handleClose}
                className="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold text-gray-900 border-none focus:ring-0 focus:outline-none bg-transparent"
                  placeholder="Enter title..."
                />
                {currentTemplate && (
                  <p className="text-xs text-gray-500">
                    Template: {currentTemplate.job_title}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Unfilled placeholders indicator */}
              {unfilledPlaceholders.length > 0 && (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {unfilledPlaceholders.length} field{unfilledPlaceholders.length !== 1 ? 's' : ''} remaining
                </span>
              )}

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copyMessage || 'Copy'}
              </button>

              {/* Download PDF button */}
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={isSaving || !user}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {saveMessage || 'Save'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Left: Form */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Fill in Your Details</h2>

            <div className="space-y-6">
              {Object.entries(PLACEHOLDER_MAP).map(([placeholder, field]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formatFieldName(field)}
                    {unfilledPlaceholders.includes(placeholder) && (
                      <span className="ml-2 text-xs text-amber-600">• Not filled</span>
                    )}
                  </label>
                  {field === 'yourAddress' || field === 'companyAddress' ? (
                    <textarea
                      value={formData[field]}
                      onChange={(e) => updateFormField(field, e.target.value)}
                      placeholder={placeholder}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <input
                      type={field === 'emailAddress' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'}
                      value={formData[field]}
                      onChange={(e) => updateFormField(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>

            {!user && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Sign in to save your cover letters to the cloud and access them from any device.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-1/2 overflow-y-auto bg-white">
          <div className="p-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
              {unfilledPlaceholders.length === 0 && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All fields filled
                </span>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <div
                className="whitespace-pre-wrap font-serif text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: customizedContent
                    .split('\n')
                    .map((line) => {
                      // Highlight unfilled placeholders
                      let processedLine = line;
                      unfilledPlaceholders.forEach((placeholder) => {
                        processedLine = processedLine.replace(
                          new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'g'),
                          `<mark class="bg-yellow-200 px-1 rounded">${placeholder}</mark>`
                        );
                      });
                      return processedLine;
                    })
                    .join('\n'),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterEditor;
