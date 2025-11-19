import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ResumeProvider } from './context/ResumeContext'
import { AuthProvider } from './context/AuthContext'
import { CoverLetterProvider } from './context/CoverLetterContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ResumeProvider>
        <CoverLetterProvider>
          <App />
        </CoverLetterProvider>
      </ResumeProvider>
    </AuthProvider>
  </StrictMode>,
)
