import { useState } from 'react'
import './App.css'
import { useResume } from './context/ResumeContext'
import ControlPanel from './components/ControlPanel'
import JobDescriptionInput from './components/JobDescriptionInput'
import TemplateRenderer from './components/templates/TemplateRenderer'

function App() {
  const { isEditing } = useResume()
  const [showJobDescription, setShowJobDescription] = useState(false)

  // Debug: Check if API key is loaded
  console.log('=== API Key Debug ===')
  console.log('API Key exists?:', import.meta.env.VITE_OPENAI_API_KEY ? 'YES ✅' : 'NO ❌')
  console.log('First 10 chars:', import.meta.env.VITE_OPENAI_API_KEY?.substring(0, 10) || 'undefined')
  console.log('All VITE env vars:', import.meta.env)

  return (
    <div className="app-wrapper">
      <ControlPanel
        showJobDescription={showJobDescription}
        setShowJobDescription={setShowJobDescription}
      />

      {showJobDescription && <JobDescriptionInput />}

      <div className="resume-container">
        <TemplateRenderer />
      </div>
    </div>
  )
}

export default App
