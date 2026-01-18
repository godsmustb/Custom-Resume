import { useState, useEffect } from 'react'
import { useResume } from '../context/ResumeContext'
import { useAuth } from '../context/AuthContext'
import { downloadResumePDF } from '../services/pdfDownloadService'
import { downloadResumeDOCX } from '../services/docxDownloadService'
import './VersionHistory.css'

const CHANGE_TYPE_LABELS = {
  'manual_edit': 'Manual Edit',
  'ai_improvement': 'AI Improvement',
  'restore': 'Restored',
  'duplicate': 'Duplicated',
  'import': 'Imported',
  'template_change': 'Template Changed'
}

const CHANGE_TYPE_ICONS = {
  'manual_edit': '✏️',
  'ai_improvement': '✨',
  'restore': '↩️',
  'duplicate': '📋',
  'import': '📥',
  'template_change': '🎨'
}

export default function VersionHistory({ onClose, isModal = true }) {
  const { user } = useAuth()
  const {
    versions,
    versionCount,
    versionLoading,
    currentResumeTitle,
    currentResumeId,
    restoreVersion,
    getVersionDetails,
    labelVersion,
    createSnapshot,
    loadVersionHistory
  } = useResume()

  const [selectedVersionId, setSelectedVersionId] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isLabeling, setIsLabeling] = useState(null)
  const [newLabel, setNewLabel] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false)
  const [snapshotLabel, setSnapshotLabel] = useState('')

  // Refresh versions on mount
  useEffect(() => {
    if (user && currentResumeId) {
      loadVersionHistory()
    }
  }, [user, currentResumeId, loadVersionHistory])

  const handleSelectVersion = async (versionId) => {
    if (selectedVersionId === versionId) {
      setSelectedVersionId(null)
      setPreviewData(null)
      return
    }

    setSelectedVersionId(versionId)
    setIsPreviewLoading(true)

    const { data, error } = await getVersionDetails(versionId)
    if (!error && data) {
      setPreviewData(data)
    }
    setIsPreviewLoading(false)
  }

  const handleRestore = async (versionId) => {
    const { success } = await restoreVersion(versionId)
    if (success) {
      setSelectedVersionId(null)
      setPreviewData(null)
      if (onClose) onClose()
    }
  }

  const handleLabel = async () => {
    if (!isLabeling || !newLabel.trim()) return

    await labelVersion(isLabeling, newLabel.trim())
    setIsLabeling(null)
    setNewLabel('')
  }

  const handleExport = async (versionId) => {
    if (!previewData) return

    setIsExporting(true)
    const filename = `${currentResumeTitle}_v${previewData.version_number}`

    try {
      if (exportFormat === 'pdf') {
        await downloadResumePDF(previewData.resume_data, filename)
      } else {
        await downloadResumeDOCX(previewData.resume_data, filename)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export. Please try again.')
    }

    setIsExporting(false)
  }

  const handleCreateSnapshot = async () => {
    if (!snapshotLabel.trim()) {
      alert('Please enter a label for the snapshot')
      return
    }

    setIsCreatingSnapshot(true)
    const { success } = await createSnapshot(snapshotLabel.trim(), 'manual_edit')
    setIsCreatingSnapshot(false)
    setSnapshotLabel('')

    if (success) {
      await loadVersionHistory()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!user) {
    return (
      <div className={`version-history ${isModal ? 'version-history-modal' : ''}`}>
        <div className="version-history-content">
          <div className="version-history-header">
            <h3>Version History</h3>
            {onClose && <button className="version-history-close" onClick={onClose}>×</button>}
          </div>
          <p className="version-history-signin">Sign in to access version history.</p>
        </div>
      </div>
    )
  }

  const content = (
    <div className="version-history-content">
      <div className="version-history-header">
        <div className="version-history-header-left">
          <h3>Version History</h3>
          <span className="version-history-count">{versionCount} versions</span>
        </div>
        {onClose && <button className="version-history-close" onClick={onClose}>×</button>}
      </div>

      {/* Create Snapshot */}
      <div className="version-snapshot-section">
        <div className="version-snapshot-header">
          <span className="version-snapshot-icon">📸</span>
          <span>Create Snapshot</span>
        </div>
        <div className="version-snapshot-form">
          <input
            type="text"
            value={snapshotLabel}
            onChange={(e) => setSnapshotLabel(e.target.value)}
            placeholder="Label (e.g., Before AI changes)"
            className="version-snapshot-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSnapshot()
            }}
          />
          <button
            className="version-snapshot-btn"
            onClick={handleCreateSnapshot}
            disabled={isCreatingSnapshot || !snapshotLabel.trim()}
          >
            {isCreatingSnapshot ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Version List */}
      <div className="version-list">
        {versionLoading ? (
          <div className="version-loading">Loading versions...</div>
        ) : versions.length === 0 ? (
          <div className="version-empty">
            <span className="version-empty-icon">📜</span>
            <p>No version history yet.</p>
            <p className="version-empty-hint">Versions are created automatically when you make changes.</p>
          </div>
        ) : (
          <>
            <div className="version-list-header">Recent Changes</div>
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`version-item ${selectedVersionId === version.id ? 'version-item-selected' : ''}`}
                onClick={() => handleSelectVersion(version.id)}
              >
                <div className="version-item-timeline">
                  <div className="version-item-dot" />
                  {index < versions.length - 1 && <div className="version-item-line" />}
                </div>

                <div className="version-item-content">
                  <div className="version-item-header">
                    <span className="version-item-number">v{version.version_number}</span>
                    <span className="version-item-type">
                      {CHANGE_TYPE_ICONS[version.change_type] || '📝'} {CHANGE_TYPE_LABELS[version.change_type] || version.change_type}
                    </span>
                  </div>

                  {isLabeling === version.id ? (
                    <div className="version-label-form">
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Add a label"
                        className="version-label-input"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter') handleLabel()
                          if (e.key === 'Escape') setIsLabeling(null)
                        }}
                      />
                      <button className="version-label-save" onClick={(e) => { e.stopPropagation(); handleLabel() }}>
                        Save
                      </button>
                      <button className="version-label-cancel" onClick={(e) => { e.stopPropagation(); setIsLabeling(null) }}>
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      {version.version_label && (
                        <div className="version-item-label">{version.version_label}</div>
                      )}
                      {version.change_summary && (
                        <div className="version-item-summary">{version.change_summary}</div>
                      )}
                    </>
                  )}

                  <div className="version-item-footer">
                    <span className="version-item-date" title={formatFullDate(version.created_at)}>
                      {formatDate(version.created_at)}
                    </span>
                    {selectedVersionId !== version.id && !isLabeling && (
                      <button
                        className="version-item-label-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsLabeling(version.id)
                          setNewLabel(version.version_label || '')
                        }}
                        title="Add/edit label"
                      >
                        🏷️
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Actions */}
                {selectedVersionId === version.id && (
                  <div className="version-item-actions" onClick={(e) => e.stopPropagation()}>
                    {isPreviewLoading ? (
                      <div className="version-preview-loading">Loading preview...</div>
                    ) : previewData ? (
                      <>
                        <div className="version-preview-info">
                          <strong>{previewData.resume_data?.personal?.name || 'Resume'}</strong>
                          <span className="version-preview-template">
                            Template: {previewData.current_template || 'Default'}
                          </span>
                        </div>

                        <div className="version-action-buttons">
                          <button
                            className="version-btn version-btn-restore"
                            onClick={() => handleRestore(version.id)}
                          >
                            ↩️ Restore
                          </button>

                          <div className="version-export-group">
                            <select
                              value={exportFormat}
                              onChange={(e) => setExportFormat(e.target.value)}
                              className="version-export-select"
                            >
                              <option value="pdf">PDF</option>
                              <option value="docx">DOCX</option>
                            </select>
                            <button
                              className="version-btn version-btn-export"
                              onClick={() => handleExport(version.id)}
                              disabled={isExporting}
                            >
                              {isExporting ? '...' : '📥'} Export
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="version-preview-error">Could not load version details</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="version-history-overlay" onClick={onClose}>
        <div className="version-history version-history-modal" onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="version-history">
      {content}
    </div>
  )
}
