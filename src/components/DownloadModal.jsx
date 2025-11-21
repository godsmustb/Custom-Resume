/**
 * Download Modal Component
 * Allows users to customize filename and format before downloading resume
 */

import { useState, useEffect } from 'react'
import { useResume } from '../context/ResumeContext'
import './DownloadModal.css'

const DownloadModal = ({ onClose, onDownload }) => {
  const { resumeData } = useResume()
  const [filename, setFilename] = useState('')
  const [filenameOption, setFilenameOption] = useState('name')
  const [format, setFormat] = useState('pdf') // 'pdf' or 'docx'

  // Generate default filename based on selected option
  useEffect(() => {
    const generateFilename = () => {
      const name = resumeData.personal.name || 'Resume'
      const cleanName = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
      const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const shortDate = date.replace(/-/g, '') // YYYYMMDD

      switch (filenameOption) {
        case 'name':
          return `${cleanName}_Resume`
        case 'name-date':
          return `${cleanName}_Resume_${shortDate}`
        case 'date-name':
          return `Resume_${shortDate}_${cleanName}`
        case 'custom':
          return filename || `${cleanName}_Resume`
        default:
          return `${cleanName}_Resume`
      }
    }

    if (filenameOption !== 'custom') {
      setFilename(generateFilename())
    }
  }, [filenameOption, resumeData.personal.name])

  const handleDownload = () => {
    // Clean filename to remove invalid characters
    const cleanFilename = filename
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .trim()

    if (!cleanFilename) {
      alert('Please enter a valid filename')
      return
    }

    onDownload(cleanFilename, format)
    onClose()
  }

  const handleFilenameChange = (e) => {
    setFilename(e.target.value)
    setFilenameOption('custom')
  }

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal" onClick={(e) => e.stopPropagation()}>
        <div className="download-modal-header">
          <h2>📥 Download Resume</h2>
          <button className="download-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="download-modal-content">
          <div className="format-selection">
            <label className="option-label">Format:</label>
            <div className="format-buttons">
              <button
                className={`format-btn ${format === 'pdf' ? 'active' : ''}`}
                onClick={() => setFormat('pdf')}
              >
                📄 PDF
              </button>
              <button
                className={`format-btn ${format === 'docx' ? 'active' : ''}`}
                onClick={() => setFormat('docx')}
              >
                📝 DOCX
              </button>
            </div>
          </div>

          <div className="filename-options">
            <label className="option-label">Quick Options:</label>
            <div className="option-buttons">
              <button
                className={`option-btn ${filenameOption === 'name' ? 'active' : ''}`}
                onClick={() => setFilenameOption('name')}
              >
                Name Only
              </button>
              <button
                className={`option-btn ${filenameOption === 'name-date' ? 'active' : ''}`}
                onClick={() => setFilenameOption('name-date')}
              >
                Name + Date
              </button>
              <button
                className={`option-btn ${filenameOption === 'date-name' ? 'active' : ''}`}
                onClick={() => setFilenameOption('date-name')}
              >
                Date + Name
              </button>
            </div>
          </div>

          <div className="filename-input-section">
            <label htmlFor="filename" className="input-label">
              Customize Filename:
            </label>
            <div className="filename-input-wrapper">
              <input
                id="filename"
                type="text"
                className="filename-input"
                value={filename}
                onChange={handleFilenameChange}
                placeholder="Enter filename..."
                maxLength={100}
              />
              <span className="filename-extension">.{format}</span>
            </div>
            <p className="filename-hint">
              Letters, numbers, hyphens, and underscores only. Spaces will be converted to underscores.
            </p>
          </div>

          <div className="filename-preview">
            <label className="preview-label">Preview:</label>
            <div className="preview-box">
              <span className="preview-icon">📄</span>
              <span className="preview-name">
                {filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || 'filename'}.{format}
              </span>
            </div>
          </div>

          <div className="download-info">
            <div className="info-row">
              <span className="info-label">Format:</span>
              <span className="info-value">
                {format === 'pdf'
                  ? 'PDF (Portable Document Format)'
                  : 'DOCX (Microsoft Word Document)'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Size:</span>
              <span className="info-value">
                {format === 'pdf'
                  ? '~50-200 KB (estimated)'
                  : '~30-150 KB (estimated)'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Compatibility:</span>
              <span className="info-value">
                {format === 'pdf'
                  ? 'All devices & ATS systems'
                  : 'Microsoft Word, Google Docs & ATS systems'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Editable:</span>
              <span className="info-value">
                {format === 'pdf'
                  ? 'No (use DOCX for editing)'
                  : 'Yes (fully editable in Word)'}
              </span>
            </div>
          </div>
        </div>

        <div className="download-modal-footer">
          <button className="download-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="download-confirm-btn" onClick={handleDownload}>
            📥 Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DownloadModal
