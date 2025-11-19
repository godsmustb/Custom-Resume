import { useState } from 'react'
import './App.css'
import { useResume } from './context/ResumeContext'
import { useAuth } from './context/AuthContext'
import { useCoverLetter } from './context/CoverLetterContext'
import ControlPanel from './components/ControlPanel'
import JobDescriptionInput from './components/JobDescriptionInput'
import TemplateRenderer from './components/templates/TemplateRenderer'
import AuthModal from './components/auth/AuthModal'
import CoverLetterTemplateBrowser from './components/CoverLetterTemplateBrowser'
import CoverLetterEditor from './components/CoverLetterEditor'
import SavedCoverLetters from './components/SavedCoverLetters'

function App() {
  const { isEditing } = useResume()
  const { user, signOut } = useAuth()
  const { openTemplateBrowser, openSavedLetters } = useCoverLetter()
  const [showJobDescription, setShowJobDescription] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentView, setCurrentView] = useState('resume') // 'resume' or 'coverletter'

  // Debug: Check if API keys are loaded
  console.log('=== Environment Variables Debug ===')
  console.log('OpenAI API Key exists?:', import.meta.env.VITE_OPENAI_API_KEY ? 'YES ✅' : 'NO ❌')
  console.log('Supabase URL exists?:', import.meta.env.VITE_SUPABASE_URL ? 'YES ✅' : 'NO ❌')
  console.log('Supabase Anon Key exists?:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'YES ✅' : 'NO ❌')

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="app-wrapper">
      {/* Auth Button */}
      <div className="auth-button-container">
        {user ? (
          <div className="user-menu">
            <span className="user-email">{user.email}</span>
            <button onClick={handleSignOut} className="auth-sign-out-btn">
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="auth-sign-in-btn">
            Sign In / Sign Up
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <button
          onClick={() => setCurrentView('resume')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: currentView === 'resume' ? '#2563eb' : '#fff',
            color: currentView === 'resume' ? '#fff' : '#374151',
            transition: 'all 0.2s',
            boxShadow: currentView === 'resume' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          Resume Builder
        </button>
        <button
          onClick={() => setCurrentView('coverletter')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: currentView === 'coverletter' ? '#2563eb' : '#fff',
            color: currentView === 'coverletter' ? '#fff' : '#374151',
            transition: 'all 0.2s',
            boxShadow: currentView === 'coverletter' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          Cover Letter Builder
        </button>
      </div>

      {/* Resume Builder View */}
      {currentView === 'resume' && (
        <>
          <ControlPanel
            showJobDescription={showJobDescription}
            setShowJobDescription={setShowJobDescription}
          />

          {showJobDescription && <JobDescriptionInput />}

          <div className="resume-container">
            <TemplateRenderer />
          </div>
        </>
      )}

      {/* Cover Letter Builder View */}
      {currentView === 'coverletter' && (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              Cover Letter Builder
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
              Choose from 30 professional templates and customize for your dream job
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={openTemplateBrowser}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Browse Templates
              </button>

              {user && (
                <button
                  onClick={openSavedLetters}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '0.5rem',
                    border: '2px solid #2563eb',
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff'
                  }}
                >
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                  My Saved Letters
                </button>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#dbeafe',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                30 Professional Templates
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Industry-specific templates for every job role, from entry-level to executive positions
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#dbeafe',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                Live Preview
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                See your changes in real-time as you fill in your information with instant placeholder replacement
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#dbeafe',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                Export & Save
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Download as PDF, copy to clipboard, or save to your account for easy access across devices
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals - Always render (they control their own visibility) */}
      <CoverLetterTemplateBrowser />
      <CoverLetterEditor />
      <SavedCoverLetters />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}

export default App
