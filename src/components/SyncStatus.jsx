import { useResume } from '../context/ResumeContext'
import { useAuth } from '../context/AuthContext'
import './SyncStatus.css'

export default function SyncStatus() {
  const { user } = useAuth()
  const { syncStatus, currentResumeTitle } = useResume()

  if (!user) return null

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return '🔄'
      case 'synced':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '💾'
    }
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Saving...'
      case 'synced':
        return 'Saved to cloud'
      case 'error':
        return 'Sync error'
      default:
        return 'Ready'
    }
  }

  const getStatusClass = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'sync-status-syncing'
      case 'synced':
        return 'sync-status-success'
      case 'error':
        return 'sync-status-error'
      default:
        return ''
    }
  }

  return (
    <div className={`sync-status ${getStatusClass()}`}>
      <span className="sync-status-icon">{getStatusIcon()}</span>
      <div className="sync-status-text">
        <span className="sync-status-label">{getStatusText()}</span>
        {currentResumeTitle && (
          <span className="sync-status-title">{currentResumeTitle}</span>
        )}
      </div>
    </div>
  )
}
