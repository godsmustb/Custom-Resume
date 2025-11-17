import { useState } from 'react'
import './App.css'
import { useResume } from './context/ResumeContext'
import ControlPanel from './components/ControlPanel'
import JobDescriptionInput from './components/JobDescriptionInput'
import TemplateRenderer from './components/templates/TemplateRenderer'

function App() {
  const { isEditing } = useResume()
  const [showJobDescription, setShowJobDescription] = useState(false)

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
