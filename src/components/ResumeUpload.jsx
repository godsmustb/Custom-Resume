/**
 * Resume Upload Component
 * Allows users to upload PDF/DOCX resumes with drag-and-drop
 */

import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { parseUploadedResume } from '../services/resumeParserService'
import './ResumeUpload.css'

const ResumeUpload = ({ onClose }) => {
  const { loadResumeFromPDF } = useResume()
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState('')

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
        throw new Error('OpenAI API key not found. Please add your API key to the .env file and restart the dev server.')
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

      setProgress('Populating fields...')

      // Load the parsed data into the resume
      loadResumeFromPDF(parsedData)

      setProgress('Complete!')

      // Show success message
      setTimeout(() => {
        alert('✅ Resume imported successfully! All fields have been populated.')
        onClose()
      }, 500)

    } catch (err) {
      console.error('Resume upload error:', err)
      setError(err.message)
      setIsProcessing(false)
    }
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
            <p className="upload-note">
              <strong>Note:</strong> This feature uses OpenAI's AI to automatically extract your resume data.
              Processing typically takes 10-20 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeUpload
