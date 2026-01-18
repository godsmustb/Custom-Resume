import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { useAuth } from '../context/AuthContext'
import './FolderBrowser.css'

const FOLDER_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Gray', value: '#6b7280' }
]

export default function FolderBrowser({ onSelectFolder, onClose }) {
  const { user } = useAuth()
  const {
    folders,
    currentFolderId,
    folderLoading,
    createFolder,
    updateFolder,
    deleteFolder,
    filterResumesByFolder,
    userResumes
  } = useResume()

  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('#6366f1')
  const [editingFolder, setEditingFolder] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  if (!user) {
    return (
      <div className="folder-browser">
        <div className="folder-browser-header">
          <h3>Folders</h3>
          {onClose && (
            <button className="folder-browser-close" onClick={onClose}>×</button>
          )}
        </div>
        <p className="folder-browser-signin">Sign in to organize resumes in folders.</p>
      </div>
    )
  }

  // Count resumes in each folder
  const getResumeCount = (folderId) => {
    if (folderId === 'archived') {
      return userResumes.filter(r => r.is_archived).length
    } else if (folderId === null || folderId === 'all') {
      return userResumes.filter(r => !r.is_archived).length
    }
    return userResumes.filter(r => r.folder_id === folderId && !r.is_archived).length
  }

  const handleSelectFolder = (folderId) => {
    filterResumesByFolder(folderId)
    if (onSelectFolder) {
      onSelectFolder(folderId)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    const { success } = await createFolder(newFolderName.trim(), { color: newFolderColor })
    if (success) {
      setIsCreating(false)
      setNewFolderName('')
      setNewFolderColor('#6366f1')
    }
  }

  const handleUpdateFolder = async () => {
    if (!editingFolder || !editName.trim()) return

    const { success } = await updateFolder(editingFolder, { name: editName.trim(), color: editColor })
    if (success) {
      setEditingFolder(null)
      setEditName('')
      setEditColor('')
    }
  }

  const handleDeleteFolder = async (folderId) => {
    await deleteFolder(folderId)
  }

  const startEditing = (folder) => {
    setEditingFolder(folder.id)
    setEditName(folder.name)
    setEditColor(folder.color || '#6366f1')
  }

  const archivedCount = getResumeCount('archived')

  return (
    <div className="folder-browser">
      <div className="folder-browser-header">
        <h3>Folders</h3>
        {onClose && (
          <button className="folder-browser-close" onClick={onClose}>×</button>
        )}
      </div>

      {folderLoading ? (
        <div className="folder-browser-loading">Loading folders...</div>
      ) : (
        <>
          {/* System Folders */}
          <div className="folder-browser-section">
            <div
              className={`folder-item folder-item-system ${currentFolderId === null || currentFolderId === 'all' ? 'folder-item-active' : ''}`}
              onClick={() => handleSelectFolder(null)}
            >
              <span className="folder-icon" style={{ color: '#6366f1' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6c0-1.1.9-2 2-2h5.5l2 2H19c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6z"/>
                </svg>
              </span>
              <span className="folder-name">All Resumes</span>
              <span className="folder-count">{getResumeCount(null)}</span>
            </div>

            {archivedCount > 0 && (
              <div
                className={`folder-item folder-item-system ${currentFolderId === 'archived' ? 'folder-item-active' : ''}`}
                onClick={() => handleSelectFolder('archived')}
              >
                <span className="folder-icon" style={{ color: '#6b7280' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6H4V4h16v2zm-2 2H6v2h12V8zm-1 4H7a1 1 0 00-1 1v7a1 1 0 001 1h10a1 1 0 001-1v-7a1 1 0 00-1-1zm-3 6h-4v-2h4v2z"/>
                  </svg>
                </span>
                <span className="folder-name">Archived</span>
                <span className="folder-count">{archivedCount}</span>
              </div>
            )}
          </div>

          {/* User Folders */}
          {folders.length > 0 && (
            <div className="folder-browser-section">
              <div className="folder-section-title">My Folders</div>
              {folders.map((folder) => (
                <div key={folder.id} className="folder-item-wrapper">
                  {editingFolder === folder.id ? (
                    <div className="folder-edit">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Folder name"
                        className="folder-edit-input"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateFolder()
                          if (e.key === 'Escape') setEditingFolder(null)
                        }}
                      />
                      <div className="folder-color-picker">
                        {FOLDER_COLORS.map((color) => (
                          <button
                            key={color.value}
                            className={`folder-color-btn ${editColor === color.value ? 'folder-color-active' : ''}`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setEditColor(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                      <div className="folder-edit-actions">
                        <button className="folder-btn-save" onClick={handleUpdateFolder}>
                          Save
                        </button>
                        <button className="folder-btn-cancel" onClick={() => setEditingFolder(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`folder-item ${currentFolderId === folder.id ? 'folder-item-active' : ''}`}
                      onClick={() => handleSelectFolder(folder.id)}
                    >
                      <span className="folder-icon" style={{ color: folder.color || '#6366f1' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 6c0-1.1.9-2 2-2h5.5l2 2H19c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6z"/>
                        </svg>
                      </span>
                      <span className="folder-name">{folder.name}</span>
                      <span className="folder-count">{folder.resume_count || getResumeCount(folder.id)}</span>
                      <div className="folder-actions">
                        <button
                          className="folder-action-btn"
                          onClick={(e) => { e.stopPropagation(); startEditing(folder) }}
                          title="Edit folder"
                        >
                          ✏️
                        </button>
                        <button
                          className="folder-action-btn folder-action-delete"
                          onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id) }}
                          title="Delete folder"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create New Folder */}
          {isCreating ? (
            <div className="folder-create">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="folder-create-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder()
                  if (e.key === 'Escape') setIsCreating(false)
                }}
              />
              <div className="folder-color-picker">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`folder-color-btn ${newFolderColor === color.value ? 'folder-color-active' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewFolderColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="folder-create-actions">
                <button className="folder-btn-create" onClick={handleCreateFolder}>
                  Create Folder
                </button>
                <button className="folder-btn-cancel" onClick={() => {
                  setIsCreating(false)
                  setNewFolderName('')
                }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="folder-add-btn" onClick={() => setIsCreating(true)}>
              <span className="folder-add-icon">+</span>
              New Folder
            </button>
          )}
        </>
      )}
    </div>
  )
}
