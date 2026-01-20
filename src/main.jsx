import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './print.css'
import './responsive.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { ResumeProvider } from './context/ResumeContext'
import { AuthProvider } from './context/AuthContext'
import { CoverLetterProvider } from './context/CoverLetterContext'
import { CreditsProvider } from './context/CreditsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <CreditsProvider>
          <ResumeProvider>
            <CoverLetterProvider>
              <App />
            </CoverLetterProvider>
          </ResumeProvider>
        </CreditsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
