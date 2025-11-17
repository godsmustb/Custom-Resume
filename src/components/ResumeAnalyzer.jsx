import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { analyzeResume } from '../services/resumeAnalyzer'
import './ResumeAnalyzer.css'

function ResumeAnalyzer() {
  const { resumeData, updateSkills, addCertification, updatePersonal } = useResume()
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [addedSuggestions, setAddedSuggestions] = useState(new Set())

  const handleAnalyze = () => {
    const analysis = analyzeResume(resumeData)
    setSuggestions(analysis)
    setShowAnalysis(true)
  }

  const handleAddSuggestion = (suggestion, index) => {
    switch (suggestion.type) {
      case 'skill':
        addSkillToResume(suggestion.value)
        break
      case 'certification':
        addCertificationToResume(suggestion.value)
        break
      case 'profile':
        addProfileLink(suggestion.value)
        break
      default:
        break
    }

    // Mark as added
    setAddedSuggestions(prev => new Set([...prev, index]))
  }

  const addSkillToResume = (skill) => {
    // Find first skill category or create one
    if (resumeData.skills.length > 0) {
      const firstCategory = resumeData.skills[0]
      const updatedSkills = [...firstCategory.skills, skill]
      updateSkills(0, 'skills', updatedSkills)
    }
  }

  const addCertificationToResume = (cert) => {
    addCertification()
    // The new certification will be added with empty fields
    // User can fill in the details
  }

  const addProfileLink = (profileData) => {
    // Update the personal info with the suggested field
    // This would need the updatePersonal function to handle it
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e74c3c'
      case 'medium':
        return '#f39c12'
      case 'low':
        return '#3498db'
      default:
        return '#95a5a6'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🔥'
      case 'medium':
        return '⚡'
      case 'low':
        return '💡'
      default:
        return '📝'
    }
  }

  return (
    <>
      <button className="analyze-btn" onClick={handleAnalyze}>
        🔍 Analyze Resume
      </button>

      {showAnalysis && (
        <>
          {/* Modal Backdrop */}
          <div
            className="modal-backdrop"
            onClick={() => setShowAnalysis(false)}
          />

          {/* Analysis Modal */}
          <div className="analysis-modal">
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="modal-title">
                📊 Resume Analysis - {suggestions.length} Suggestions
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowAnalysis(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="analysis-content">
              {suggestions.length === 0 ? (
                <div className="no-suggestions">
                  <p>✅ Your resume looks great! No major improvements needed.</p>
                </div>
              ) : (
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`suggestion-card ${addedSuggestions.has(index) ? 'added' : ''}`}
                    >
                      <div className="suggestion-header">
                        <div className="suggestion-category">
                          <span
                            className="priority-badge"
                            style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                          >
                            {getPriorityIcon(suggestion.priority)} {suggestion.priority.toUpperCase()}
                          </span>
                          <span className="category-label">{suggestion.category}</span>
                        </div>
                        {!addedSuggestions.has(index) && (
                          <button
                            className="add-suggestion-btn"
                            onClick={() => handleAddSuggestion(suggestion, index)}
                            title="Add this suggestion"
                          >
                            + Add
                          </button>
                        )}
                        {addedSuggestions.has(index) && (
                          <span className="added-badge">✓ Added</span>
                        )}
                      </div>

                      <h4 className="suggestion-title">{suggestion.title}</h4>
                      <p className="suggestion-description">{suggestion.description}</p>

                      {suggestion.type === 'quantify' || suggestion.type === 'strengthen' ? (
                        <div className="suggestion-preview">
                          <div className="before-after">
                            <div className="before">
                              <strong>Before:</strong>
                              <p>{suggestion.value.original}</p>
                            </div>
                            <div className="arrow">→</div>
                            <div className="after">
                              <strong>Suggested:</strong>
                              <p>{suggestion.value.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ResumeAnalyzer
