import { Component } from 'react'

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error)
    console.error('Error details:', errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // You could also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleClearData = () => {
    if (window.confirm('This will clear all locally saved resume data. Are you sure?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <svg
                style={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 style={styles.title}>Something went wrong</h1>

            <p style={styles.message}>
              We're sorry, but something unexpected happened. Please try one of the options below.
            </p>

            <div style={styles.buttonContainer}>
              <button
                onClick={this.handleReset}
                style={styles.primaryButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                style={styles.secondaryButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
              >
                Reload Page
              </button>
            </div>

            <button
              onClick={this.handleClearData}
              style={styles.dangerButton}
              onMouseOver={(e) => e.target.style.color = '#b91c1c'}
              onMouseOut={(e) => e.target.style.color = '#dc2626'}
            >
              Clear saved data and restart
            </button>

            {/* Error details (collapsible for debugging) */}
            {import.meta.env.DEV && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development Only)</summary>
                <div style={styles.errorDetails}>
                  <p style={styles.errorName}>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre style={styles.stackTrace}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '1rem'
  },
  card: {
    maxWidth: '28rem',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '2rem',
    textAlign: 'center'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem'
  },
  icon: {
    width: '4rem',
    height: '4rem',
    color: '#f59e0b'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.75rem'
  },
  message: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  },
  buttonContainer: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    marginBottom: '1rem'
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  dangerButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#dc2626',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    transition: 'color 0.2s'
  },
  details: {
    marginTop: '1.5rem',
    textAlign: 'left'
  },
  summary: {
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.5rem'
  },
  errorDetails: {
    backgroundColor: '#fef2f2',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginTop: '0.5rem'
  },
  errorName: {
    color: '#991b1b',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
    wordBreak: 'break-word'
  },
  stackTrace: {
    fontSize: '0.75rem',
    color: '#7f1d1d',
    backgroundColor: '#fee2e2',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    overflow: 'auto',
    maxHeight: '12rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}

export default ErrorBoundary
