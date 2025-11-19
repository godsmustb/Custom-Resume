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
        <div style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#f9fafb' }}>
          {/* Hero Section */}
          <div style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            paddingTop: '4rem',
            paddingBottom: '4rem'
          }}>
            <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 2rem' }}>
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '1.5rem',
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em'
                }}>
                  Professional Cover Letter Builder
                </h1>
                <p style={{
                  fontSize: '1.25rem',
                  color: '#6b7280',
                  marginBottom: '2.5rem',
                  lineHeight: '1.6'
                }}>
                  Create a compelling cover letter in minutes with our professionally-designed templates. Choose from 30 industry-specific formats tailored to your career level.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <button
                    onClick={openTemplateBrowser}
                    style={{
                      padding: '1rem 2rem',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#4f46e5',
                      color: '#fff',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
                      minWidth: '200px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#4338ca';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(79, 70, 229, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(79, 70, 229, 0.3)';
                    }}
                  >
                    Create Cover Letter
                  </button>

                  {user && (
                    <button
                      onClick={openSavedLetters}
                      style={{
                        padding: '1rem 2rem',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        borderRadius: '0.5rem',
                        border: '2px solid #4f46e5',
                        cursor: 'pointer',
                        backgroundColor: '#fff',
                        color: '#4f46e5',
                        transition: 'all 0.2s',
                        minWidth: '200px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#eef2ff';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      My Saved Letters
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  No credit card required • Free templates available
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div style={{ backgroundColor: '#f9fafb', padding: '3rem 0' }}>
            <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#4f46e5', marginBottom: '0.5rem' }}>30+</div>
                  <div style={{ fontSize: '1rem', color: '#6b7280' }}>Professional Templates</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#4f46e5', marginBottom: '0.5rem' }}>12</div>
                  <div style={{ fontSize: '1rem', color: '#6b7280' }}>Customizable Fields</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#4f46e5', marginBottom: '0.5rem' }}>PDF</div>
                  <div style={{ fontSize: '1rem', color: '#6b7280' }}>Export Ready</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#4f46e5', marginBottom: '0.5rem' }}>∞</div>
                  <div style={{ fontSize: '1rem', color: '#6b7280' }}>Unlimited Edits</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div style={{ backgroundColor: '#ffffff', padding: '4rem 0' }}>
            <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 2rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                textAlign: 'center',
                marginBottom: '3rem'
              }}>
                Everything you need to land your dream job
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                <div style={{
                  padding: '2rem',
                  backgroundColor: '#fff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    backgroundColor: '#eef2ff',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <svg style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                    Industry-Specific Templates
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
                    Choose from templates designed for Technology, Healthcare, Business, Creative, and more. Each template is optimized for your industry.
                  </p>
                </div>

                <div style={{
                  padding: '2rem',
                  backgroundColor: '#fff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    backgroundColor: '#eef2ff',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <svg style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                    Real-Time Preview
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
                    See your cover letter take shape instantly. Our live editor shows you exactly how your final document will look.
                  </p>
                </div>

                <div style={{
                  padding: '2rem',
                  backgroundColor: '#fff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    backgroundColor: '#eef2ff',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <svg style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                    Export & Cloud Save
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
                    Download professional PDFs, copy to clipboard, or save to your account for access anywhere, anytime.
                  </p>
                </div>
              </div>
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
