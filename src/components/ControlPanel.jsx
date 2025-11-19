import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { useAuth } from '../context/AuthContext'
import { downloadResumePDF } from '../services/pdfDownloadService'
import ResumeUpload from './ResumeUpload'
import TemplateBrowser from './TemplateBrowser'
import ResumeManager from './ResumeManager'
import DownloadModal from './DownloadModal'
import SyncStatus from './SyncStatus'
import './ControlPanel.css'

const ControlPanel = ({ showJobDescription, setShowJobDescription }) => {
  const { user } = useAuth()
  const { isEditing, setIsEditing, resetResume, resumeData } = useResume()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showResumeManager, setShowResumeManager] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const handleDownloadPDF = (customFilename) => {
    try {
      downloadResumePDF(resumeData, customFilename)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  return (
    <>
      <div className="control-panel">
        <div className="control-panel-content">
          <div className="control-panel-left">
            <h1 className="control-panel-title">AI Resume Builder</h1>
            <p className="control-panel-subtitle">Build, customize, and optimize your resume with AI</p>
            {user && <SyncStatus />}
          </div>

          <div className="control-panel-actions">
            {user && (
              <button
                className="control-btn manager-btn"
                onClick={() => setShowResumeManager(true)}
                title="Manage your resumes in the cloud"
              >
                📁 My Resumes
              </button>
            )}

            <button
              className="control-btn upload-btn"
              onClick={() => setShowUploadModal(true)}
              title="Upload existing resume (PDF or DOCX)"
            >
              📤 Import Resume
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
              onClick={() => setShowDownloadModal(true)}
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
        <ResumeUpload
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {showTemplates && (
        <TemplateBrowser
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showResumeManager && (
        <ResumeManager
          onClose={() => setShowResumeManager(false)}
        />
      )}

      {showDownloadModal && (
        <DownloadModal
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownloadPDF}
        />
      )}
    </>
  )
}

export default ControlPanel
