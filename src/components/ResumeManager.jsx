import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { useAuth } from '../context/AuthContext'
import './ResumeManager.css'

export default function ResumeManager({ onClose }) {
  const { user } = useAuth()
  const {
    userResumes,
    currentResumeId,
    currentResumeTitle,
    switchResume,
    createNewResume,
    deleteCurrentResume,
    renameResume,
    duplicateResume,
    setCurrentResumeTitle
  } = useResume()

  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createTitle, setCreateTitle] = useState('')

  if (!user) {
    return (
      <div className="resume-manager-container">
        <div className="resume-manager-modal">
          <button className="resume-manager-close" onClick={onClose}>
            ×
          </button>
          <h2>Resume Manager</h2>
          <p className="resume-manager-signin-msg">
            Please sign in to manage multiple resumes in the cloud.
          </p>
          <button className="resume-manager-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  const handleRename = async () => {
    if (!newTitle.trim()) return
    await renameResume(currentResumeId, newTitle)
    setIsRenaming(false)
    setNewTitle('')
  }

  const handleCreate = async () => {
    if (!createTitle.trim()) return
    await createNewResume(createTitle)
    setIsCreating(false)
    setCreateTitle('')
  }

  const handleSwitch = async (resumeId) => {
    await switchResume(resumeId)
    onClose()
  }

  const handleDelete = async () => {
    await deleteCurrentResume()
    if (userResumes.length <= 1) {
      onClose()
    }
  }

  const handleDuplicate = async () => {
    await duplicateResume()
  }

  return (
    <div className="resume-manager-container">
      <div className="resume-manager-modal">
        <button className="resume-manager-close" onClick={onClose}>
          ×
        </button>

        <h2 className="resume-manager-title">Manage Resumes</h2>
        <p className="resume-manager-subtitle">
          {userResumes.length} {userResumes.length === 1 ? 'resume' : 'resumes'} in cloud
        </p>

        {/* Current Resume */}
        <div className="resume-manager-current">
          <div className="resume-manager-current-header">
            <span className="resume-manager-current-label">Current Resume</span>
            {!isRenaming && (
              <button
                className="resume-manager-icon-btn"
                onClick={() => {
                  setIsRenaming(true)
                  setNewTitle(currentResumeTitle)
                }}
                title="Rename"
              >
                ✏️
              </button>
            )}
          </div>

          {isRenaming ? (
            <div className="resume-manager-rename">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Resume title"
                className="resume-manager-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') setIsRenaming(false)
                }}
              />
              <div className="resume-manager-rename-actions">
                <button className="resume-manager-button-small" onClick={handleRename}>
                  Save
                </button>
                <button
                  className="resume-manager-button-small resume-manager-button-secondary"
                  onClick={() => setIsRenaming(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <h3 className="resume-manager-current-title">{currentResumeTitle}</h3>
          )}
        </div>

        {/* Actions */}
        <div className="resume-manager-actions">
          <button className="resume-manager-action-btn" onClick={() => setIsCreating(true)}>
            <span className="resume-manager-action-icon">+</span>
            New Resume
          </button>
          <button className="resume-manager-action-btn" onClick={handleDuplicate}>
            <span className="resume-manager-action-icon">📋</span>
            Duplicate
          </button>
          <button
            className="resume-manager-action-btn resume-manager-action-danger"
            onClick={handleDelete}
            disabled={userResumes.length === 1}
          >
            <span className="resume-manager-action-icon">🗑️</span>
            Delete
          </button>
        </div>

        {/* Create New Resume Form */}
        {isCreating && (
          <div className="resume-manager-create">
            <h4>Create New Resume</h4>
            <input
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="Resume title (e.g., Software Engineer Resume)"
              className="resume-manager-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setIsCreating(false)
              }}
            />
            <div className="resume-manager-create-actions">
              <button className="resume-manager-button" onClick={handleCreate}>
                Create
              </button>
              <button
                className="resume-manager-button resume-manager-button-secondary"
                onClick={() => {
                  setIsCreating(false)
                  setCreateTitle('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Resume List */}
        <div className="resume-manager-list">
          <h4 className="resume-manager-list-title">All Resumes</h4>
          {userResumes.map((resume) => (
            <div
              key={resume.id}
              className={`resume-manager-item ${
                resume.id === currentResumeId ? 'resume-manager-item-active' : ''
              }`}
              onClick={() => resume.id !== currentResumeId && handleSwitch(resume.id)}
            >
              <div className="resume-manager-item-content">
                <span className="resume-manager-item-title">{resume.title}</span>
                <span className="resume-manager-item-date">
                  Updated {new Date(resume.updated_at).toLocaleDateString()}
                </span>
              </div>
              {resume.id === currentResumeId && (
                <span className="resume-manager-item-badge">Current</span>
              )}
            </div>
          ))}
        </div>

        <div className="resume-manager-footer">
          <button className="resume-manager-button resume-manager-button-block" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
