import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { downloadResumePDF } from '../services/pdfDownloadService'
import PDFUpload from './PDFUpload'
import TemplateBrowser from './TemplateBrowser'
import './ControlPanel.css'

const ControlPanel = ({ showJobDescription, setShowJobDescription }) => {
  const { isEditing, setIsEditing, resetResume, resumeData, loadResumeFromPDF } = useResume()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const handleDownloadPDF = () => {
    try {
      downloadResumePDF(resumeData)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const handleResumeLoaded = (parsedData) => {
    loadResumeFromPDF(parsedData)
    setShowUploadModal(false)
    alert('✅ Resume loaded successfully! You can now edit and customize it.')
  }

  return (
    <>
      <div className="control-panel">
        <div className="control-panel-content">
          <div className="control-panel-left">
            <h1 className="control-panel-title">AI Resume Builder</h1>
            <p className="control-panel-subtitle">Build, customize, and optimize your resume with AI</p>
          </div>

          <div className="control-panel-actions">
            <button
              className="control-btn upload-btn"
              onClick={() => setShowUploadModal(true)}
              title="Upload existing PDF resume"
            >
              📤 Upload PDF
            </button>

            <button
              className="control-btn templates-btn"
              onClick={() => setShowTemplates(true)}
              title="Browse and select resume templates"
            >
              🎨 Templates
            </button>

            <button
              className={`control-btn ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
              title="Toggle edit mode to modify your resume"
            >
              {isEditing ? '👁️ Preview Mode' : '✏️ Edit Mode'}
            </button>

            <button
              className={`control-btn ${showJobDescription ? 'active' : ''}`}
              onClick={() => setShowJobDescription(!showJobDescription)}
              title="Paste job description to customize your resume"
            >
              📋 Job Description
            </button>

            <button
              className="control-btn download-btn"
              onClick={handleDownloadPDF}
              title="Download professional PDF resume"
            >
              📥 Download PDF
            </button>

            <button
              className="control-btn reset-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all resume data?')) {
                  resetResume()
                }
              }}
              title="Reset to default template"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <PDFUpload
          onResumeLoaded={handleResumeLoaded}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {showTemplates && (
        <TemplateBrowser
          onClose={() => setShowTemplates(false)}
        />
      )}
    </>
  )
}

export default ControlPanel
