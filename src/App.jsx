import { useState } from 'react'
import './App.css'
import { useResume } from './context/ResumeContext'
import { useAuth } from './context/AuthContext'
import ControlPanel from './components/ControlPanel'
import JobDescriptionInput from './components/JobDescriptionInput'
import TemplateRenderer from './components/templates/TemplateRenderer'
import AuthModal from './components/auth/AuthModal'

function App() {
  const { isEditing } = useResume()
  const { user, signOut } = useAuth()
  const [showJobDescription, setShowJobDescription] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

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

      <ControlPanel
        showJobDescription={showJobDescription}
        setShowJobDescription={setShowJobDescription}
      />

      {showJobDescription && <JobDescriptionInput />}

      <div className="resume-container">
        <TemplateRenderer />
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}

export default App
