import { useState } from 'react'
import { uploadAndParseResumePDF } from '../services/pdfService'
import './PDFUpload.css'

const PDFUpload = ({ onResumeLoaded, onClose }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file) => {
    setUploading(true)
    setError(null)

    // Check if API key is configured
    if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'your-openai-api-key-here') {
      setError('OpenAI API key not found. Please add your API key to the .env file and restart the dev server.')
      setUploading(false)
      console.error('❌ API Key missing! Check .env file has: VITE_OPENAI_API_KEY=sk-your-key')
      return
    }

    try {
      const parsedData = await uploadAndParseResumePDF(file)
      onResumeLoaded(parsedData)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="pdf-upload-modal">
      <div className="pdf-upload-content">
        <button className="close-modal-btn" onClick={onClose}>×</button>

        <h2>📄 Upload Your Resume</h2>
        <p className="upload-subtitle">
          Upload a PDF resume and our AI will automatically extract and structure your information
        </p>

        {error && (
          <div className="upload-error">
            ⚠️ {error}
          </div>
        )}

        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="upload-progress">
              <div className="spinner"></div>
              <p>🤖 AI is parsing your resume...</p>
              <p className="upload-subtext">This may take 10-20 seconds</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">📎</div>
              <p className="upload-text">Drag and drop your PDF here</p>
              <p className="upload-or">or</p>
              <label className="upload-button">
                Choose File
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="upload-info">PDF format only • Max 5MB</p>
            </>
          )}
        </div>

        <div className="upload-features">
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span>AI-powered text extraction</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Automatic data structuring</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Instant resume import</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFUpload
