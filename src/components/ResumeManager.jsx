import { useState, useEffect } from 'react'
import { useResume } from '../context/ResumeContext'
import { useAuth } from '../context/AuthContext'
import FolderBrowser from './FolderBrowser'
import VersionHistory from './VersionHistory'
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
    folders,
    currentFolderId,
    setCurrentFolderId,
    getFilteredResumes,
    moveToFolder,
    archiveResume,
    unarchiveResume,
    versions,
    versionCount
  } = useResume()

  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [activeTab, setActiveTab] = useState('resumes') // 'resumes', 'folders', 'versions'
  const [showMoveModal, setShowMoveModal] = useState(null) // resume id to move
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(null)

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!user) {
    return (
      <div className="resume-manager-container">
        <div className="resume-manager-modal">
          <button className="resume-manager-close" onClick={onClose}>×</button>
          <h2>Resume Manager</h2>
          <p className="resume-manager-signin-msg">
            Please sign in to manage multiple resumes in the cloud.
          </p>
          <button className="resume-manager-button" onClick={onClose}>Close</button>
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
    await createNewResume(createTitle, currentFolderId !== 'archived' ? currentFolderId : null)
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

  const handleMoveToFolder = async (folderId) => {
    if (showMoveModal) {
      await moveToFolder(showMoveModal, folderId)
      setShowMoveModal(null)
    }
  }

  const handleArchive = async (resumeId) => {
    await archiveResume(resumeId)
  }

  const handleUnarchive = async (resumeId) => {
    await unarchiveResume(resumeId)
  }

  const filteredResumes = getFilteredResumes()
  const currentFolder = folders.find(f => f.id === currentFolderId)

  const getFolderName = () => {
    if (currentFolderId === 'archived') return 'Archived'
    if (currentFolderId === null || currentFolderId === 'all') return 'All Resumes'
    return currentFolder?.name || 'Unknown Folder'
  }

  return (
    <div className="resume-manager-container">
      <div className={`resume-manager-modal ${isMobile ? 'resume-manager-mobile' : ''}`}>
        <button className="resume-manager-close" onClick={onClose}>×</button>

        {/* Header with Tabs */}
        <div className="resume-manager-header">
          <h2 className="resume-manager-title">My Resumes</h2>
          <div className="resume-manager-tabs">
            <button
              className={`resume-manager-tab ${activeTab === 'resumes' ? 'active' : ''}`}
              onClick={() => setActiveTab('resumes')}
            >
              <span className="tab-icon">📄</span>
              <span className="tab-label">Resumes</span>
            </button>
            <button
              className={`resume-manager-tab ${activeTab === 'folders' ? 'active' : ''}`}
              onClick={() => setActiveTab('folders')}
            >
              <span className="tab-icon">📁</span>
              <span className="tab-label">Folders</span>
            </button>
            <button
              className={`resume-manager-tab ${activeTab === 'versions' ? 'active' : ''}`}
              onClick={() => setActiveTab('versions')}
            >
              <span className="tab-icon">📜</span>
              <span className="tab-label">History</span>
              {versionCount > 0 && (
                <span className="tab-badge">{versionCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="resume-manager-content">
          {activeTab === 'resumes' && (
            <>
              {/* Folder Breadcrumb */}
              <div className="resume-manager-breadcrumb">
                <button
                  className={`breadcrumb-item ${currentFolderId === null ? 'active' : ''}`}
                  onClick={() => setCurrentFolderId(null)}
                >
                  All Resumes
                </button>
                {currentFolderId && currentFolderId !== 'all' && (
                  <>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">{getFolderName()}</span>
                  </>
                )}
              </div>

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
                  New
                </button>
                <button className="resume-manager-action-btn" onClick={handleDuplicate}>
                  <span className="resume-manager-action-icon">📋</span>
                  Duplicate
                </button>
                <button
                  className="resume-manager-action-btn"
                  onClick={() => setShowMoveModal(currentResumeId)}
                >
                  <span className="resume-manager-action-icon">📁</span>
                  Move
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
                <div className="resume-manager-list-header">
                  <h4 className="resume-manager-list-title">{getFolderName()}</h4>
                  <span className="resume-manager-list-count">
                    {filteredResumes.length} {filteredResumes.length === 1 ? 'resume' : 'resumes'}
                  </span>
                </div>

                {filteredResumes.length === 0 ? (
                  <div className="resume-manager-empty">
                    <span className="resume-manager-empty-icon">📄</span>
                    <p>No resumes in this folder</p>
                  </div>
                ) : (
                  filteredResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`resume-manager-item ${
                        resume.id === currentResumeId ? 'resume-manager-item-active' : ''
                      }`}
                    >
                      <div
                        className="resume-manager-item-main"
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
                      <div className="resume-manager-item-actions">
                        {resume.is_archived ? (
                          <button
                            className="resume-manager-item-action"
                            onClick={(e) => { e.stopPropagation(); handleUnarchive(resume.id) }}
                            title="Unarchive"
                          >
                            ↩️
                          </button>
                        ) : (
                          <>
                            <button
                              className="resume-manager-item-action"
                              onClick={(e) => { e.stopPropagation(); setShowMoveModal(resume.id) }}
                              title="Move to folder"
                            >
                              📁
                            </button>
                            <button
                              className="resume-manager-item-action"
                              onClick={(e) => { e.stopPropagation(); handleArchive(resume.id) }}
                              title="Archive"
                            >
                              📥
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'folders' && (
            <FolderBrowser onSelectFolder={(folderId) => {
              setCurrentFolderId(folderId)
              setActiveTab('resumes')
            }} />
          )}

          {activeTab === 'versions' && (
            <VersionHistory isModal={false} />
          )}
        </div>

        {/* Footer */}
        <div className="resume-manager-footer">
          <button className="resume-manager-button resume-manager-button-block" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Move to Folder Modal */}
        {showMoveModal && (
          <div className="move-modal-overlay" onClick={() => setShowMoveModal(null)}>
            <div className="move-modal" onClick={(e) => e.stopPropagation()}>
              <div className="move-modal-header">
                <h3>Move to Folder</h3>
                <button className="move-modal-close" onClick={() => setShowMoveModal(null)}>×</button>
              </div>
              <div className="move-modal-content">
                <button
                  className="move-modal-option"
                  onClick={() => handleMoveToFolder(null)}
                >
                  <span className="move-option-icon">📄</span>
                  <span>All Resumes (No Folder)</span>
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    className="move-modal-option"
                    onClick={() => handleMoveToFolder(folder.id)}
                  >
                    <span
                      className="move-option-icon"
                      style={{ color: folder.color || '#6366f1' }}
                    >
                      📁
                    </span>
                    <span>{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
