/**
 * Resume Upload Component
 * Allows users to upload PDF/DOCX resumes with drag-and-drop
 */

import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { parseUploadedResume } from '../services/resumeParserService'
import './ResumeUpload.css'

const ResumeUpload = ({ onClose }) => {
  const { loadResumeFromPDF, createNewResumeFromData } = useResume()
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState('')
  const [parsedResumeData, setParsedResumeData] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showTitleInput, setShowTitleInput] = useState(false)
  const [resumeTitle, setResumeTitle] = useState('')

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileInput = async (e) => {
    const files = e.target.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const processFile = async (file) => {
    setError(null)
    setIsProcessing(true)
    setProgress('Reading file...')

    try {
      // Check if API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'your-openai-api-key-here') {
        throw new Error('OpenAI API key not configured. For local development, add VITE_OPENAI_API_KEY to your .env file. For production, configure the GitHub Secret.')
      }

      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or DOCX file')
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      setProgress('Extracting text from resume...')

      // Parse the resume
      const parsedData = await parseUploadedResume(file)

      setProgress('Complete!')

      // Store parsed data and show action modal
      setParsedResumeData(parsedData)
      setIsProcessing(false)
      setShowActionModal(true)

    } catch (err) {
      console.error('Resume upload error:', err)
      setError(err.message)
      setIsProcessing(false)
    }
  }

  const handleReplaceCurrentResume = () => {
    // Load the parsed data into current resume
    loadResumeFromPDF(parsedResumeData)
    setShowActionModal(false)
    setTimeout(() => {
      alert('✅ Resume imported successfully! Current resume has been updated.')
      onClose()
    }, 300)
  }

  const handleCreateNewResume = () => {
    // Show title input
    setShowActionModal(false)
    setShowTitleInput(true)
    // Generate default title from parsed name
    const defaultTitle = parsedResumeData?.personal?.name
      ? `${parsedResumeData.personal.name}'s Resume`
      : 'Imported Resume'
    setResumeTitle(defaultTitle)
  }

  const handleConfirmCreateNew = async () => {
    if (!resumeTitle.trim()) {
      alert('Please enter a title for your resume')
      return
    }

    setIsProcessing(true)
    const result = await createNewResumeFromData(resumeTitle, parsedResumeData)

    if (result.success) {
      setShowTitleInput(false)
      setIsProcessing(false)
      setTimeout(() => {
        alert('✅ New resume created successfully! You can now edit and customize it.')
        onClose()
      }, 300)
    } else {
      setIsProcessing(false)
      setError(result.error || 'Failed to create resume. Please try again.')
    }
  }

  const handleCancelAction = () => {
    setShowActionModal(false)
    setShowTitleInput(false)
    setParsedResumeData(null)
    setResumeTitle('')
    setError(null)
  }

  return (
    <div className="resume-upload-overlay" onClick={onClose}>
      <div className="resume-upload-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upload-modal-header">
          <h2>📄 Import Your Resume</h2>
          <button className="upload-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="upload-modal-content">
          <p className="upload-description">
            Upload your existing resume (PDF or DOCX) and we'll automatically extract
            and populate all your information using AI.
          </p>

          {/* Drag and Drop Zone */}
          <div
            className={`upload-drop-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isProcessing ? (
              <div className="upload-processing">
                <div className="upload-spinner"></div>
                <p className="upload-progress">{progress}</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">📤</div>
                <p className="upload-text-primary">
                  Drag & drop your resume here
                </p>
                <p className="upload-text-secondary">or</p>
                <label className="upload-file-input-label">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileInput}
                    className="upload-file-input"
                    disabled={isProcessing}
                  />
                  <span className="upload-browse-btn">Browse Files</span>
                </label>
                <p className="upload-file-types">Supported: PDF, DOCX (Max 10MB)</p>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="upload-error">
              <span className="upload-error-icon">⚠️</span>
              <span className="upload-error-text">{error}</span>
            </div>
          )}

          {/* Info */}
          <div className="upload-info">
            <h4>How it works:</h4>
            <ol>
              <li>Upload your existing resume (PDF or DOCX)</li>
              <li>Our AI extracts your information automatically</li>
              <li>All fields are populated with your data</li>
              <li>Review and edit as needed</li>
              <li>Choose from 50 professional templates</li>
            </ol>
          </div>
        </div>

        {/* Action Modal - Choose what to do with uploaded resume */}
        {showActionModal && (
          <div className="upload-action-modal">
            <h3>What would you like to do?</h3>
            <p className="upload-action-description">
              Your resume has been successfully parsed. Choose an option below:
            </p>
            <div className="upload-action-buttons">
              <button
                className="upload-action-btn upload-action-btn-primary"
                onClick={handleCreateNewResume}
              >
                <span className="upload-action-icon">➕</span>
                <div>
                  <strong>Create New Resume</strong>
                  <small>Save as a separate resume in your account</small>
                </div>
              </button>
              <button
                className="upload-action-btn upload-action-btn-secondary"
                onClick={handleReplaceCurrentResume}
              >
                <span className="upload-action-icon">🔄</span>
                <div>
                  <strong>Replace Current Resume</strong>
                  <small>Update your current resume with this data</small>
                </div>
              </button>
            </div>
            <button className="upload-action-cancel" onClick={handleCancelAction}>
              Cancel
            </button>
          </div>
        )}

        {/* Title Input Modal - Enter title for new resume */}
        {showTitleInput && (
          <div className="upload-title-modal">
            <h3>Create New Resume</h3>
            <p className="upload-title-description">
              Enter a title for your new resume:
            </p>
            <input
              type="text"
              className="upload-title-input"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing) handleConfirmCreateNew()
                if (e.key === 'Escape') handleCancelAction()
              }}
            />
            <div className="upload-title-buttons">
              <button
                className="upload-title-btn upload-title-btn-primary"
                onClick={handleConfirmCreateNew}
                disabled={isProcessing}
              >
                {isProcessing ? 'Creating...' : 'Create Resume'}
              </button>
              <button
                className="upload-title-btn upload-title-btn-secondary"
                onClick={handleCancelAction}
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeUpload
