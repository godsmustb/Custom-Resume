/**
 * Saved Cover Letters Dashboard
 *
 * Displays all user's saved cover letters with edit, duplicate, and delete actions.
 * Redesigned with professional grid layout matching Resume.io style
 */

import React, { useState } from 'react';
import { useCoverLetter } from '../context/CoverLetterContext';
import { useAuth } from '../context/AuthContext';

const SavedCoverLetters = () => {
  const { user } = useAuth();
  const {
    savedLetters,
    savedLettersLoading,
    savedLettersError,
    showSavedLetters,
    closeSavedLetters,
    editSavedLetter,
    deleteCoverLetter,
    duplicateCoverLetter,
  } = useCoverLetter();

  const [deletingId, setDeletingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);

  const handleEdit = async (letterId) => {
    try {
      await editSavedLetter(letterId);
      closeSavedLetters();
    } catch (error) {
      console.error('Failed to edit letter:', error);
    }
  };

  const handleDelete = async (letterId) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) {
      return;
    }

    setDeletingId(letterId);
    try {
      await deleteCoverLetter(letterId);
    } catch (error) {
      console.error('Failed to delete letter:', error);
      alert('Failed to delete cover letter. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (letterId) => {
    setDuplicatingId(letterId);
    try {
      await duplicateCoverLetter(letterId);
    } catch (error) {
      console.error('Failed to duplicate letter:', error);
      alert('Failed to duplicate cover letter. Please try again.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!showSavedLetters) return null;

  if (!user) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Please sign in to view your saved cover letters
          </p>
          <button
            onClick={closeSavedLetters}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

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
          maxWidth: '1200px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  My Saved Letters
                </h2>
                <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                  {savedLettersLoading ? 'Loading...' : `${savedLetters.length} cover letter${savedLetters.length !== 1 ? 's' : ''} saved`}
                </p>
              </div>
              <button
                onClick={closeSavedLetters}
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
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '2.5rem',
            backgroundColor: '#f9fafb'
          }}>
            {savedLettersLoading ? (
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
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your cover letters...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : savedLettersError ? (
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
                <p style={{ color: '#991b1b', fontWeight: '600', marginBottom: '0.5rem' }}>Failed to load your cover letters</p>
                <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{savedLettersError}</p>
              </div>
            ) : savedLetters.length === 0 ? (
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
                  No saved cover letters yet
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Start creating cover letters and save them to your account
                </p>
                <button
                  onClick={closeSavedLetters}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                >
                  Browse Templates
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
              }}>
                {savedLetters.map((letter) => (
                  <div
                    key={letter.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0.75rem',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: '#111827',
                          marginBottom: '0.5rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {letter.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Last edited: {formatDate(letter.updated_at || letter.created_at)}
                        </p>
                      </div>

                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        maxHeight: '120px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <p style={{
                          fontSize: '0.8125rem',
                          color: '#6b7280',
                          lineHeight: '1.5',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {letter.customized_content.substring(0, 200)}...
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(letter.id)}
                          style={{
                            flex: 1,
                            padding: '0.625rem 1rem',
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDuplicate(letter.id)}
                          disabled={duplicatingId === letter.id}
                          style={{
                            padding: '0.625rem 0.875rem',
                            backgroundColor: '#ffffff',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: duplicatingId === letter.id ? 'not-allowed' : 'pointer',
                            opacity: duplicatingId === letter.id ? 0.7 : 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => !duplicatingId && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                          onMouseOut={(e) => !duplicatingId && (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          {duplicatingId === letter.id ? '...' : 'Duplicate'}
                        </button>

                        <button
                          onClick={() => handleDelete(letter.id)}
                          disabled={deletingId === letter.id}
                          style={{
                            padding: '0.625rem 0.875rem',
                            backgroundColor: '#ffffff',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: deletingId === letter.id ? 'not-allowed' : 'pointer',
                            opacity: deletingId === letter.id ? 0.7 : 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => !deletingId && (e.currentTarget.style.backgroundColor = '#fef2f2')}
                          onMouseOut={(e) => !deletingId && (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          {deletingId === letter.id ? '...' : 'Delete'}
                        </button>
                      </div>
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

export default SavedCoverLetters;
