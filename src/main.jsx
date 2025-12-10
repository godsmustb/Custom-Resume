import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './print.css'
import App from './App.jsx'
import { ResumeProvider } from './context/ResumeContext'
import { AuthProvider } from './context/AuthContext'
import { CoverLetterProvider } from './context/CoverLetterContext'
import { JobSearchProvider } from './context/JobSearchContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ResumeProvider>
        <CoverLetterProvider>
          <JobSearchProvider>
            <App />
          </JobSearchProvider>
        </CoverLetterProvider>
      </ResumeProvider>
    </AuthProvider>
  </StrictMode>,
)
