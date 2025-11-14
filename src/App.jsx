import { useState } from 'react'
import './App.css'
import { useResume } from './context/ResumeContext'
import Header from './components/Header'
import About from './components/About'
import Experience from './components/Experience'
import Education from './components/Education'
import Skills from './components/Skills'
import Contact from './components/Contact'
import ControlPanel from './components/ControlPanel'
import JobDescriptionInput from './components/JobDescriptionInput'

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
        <Header />
        <About />
        <Experience />
        <Education />
        <Skills />
        <Contact />
      </div>
    </div>
  )
}

export default App
