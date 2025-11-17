import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { getBulletSuggestions } from '../services/bulletPointSuggestions'

function Experience() {
  const {
    resumeData,
    isEditing,
    updateExperience,
    addExperience,
    removeExperience,
    updateExperienceDescription,
    addExperienceDescription,
    removeExperienceDescription
  } = useResume()

  // Track which bullet point is showing suggestions
  const [showSuggestions, setShowSuggestions] = useState({})

  const toggleSuggestions = (expIndex, descIndex) => {
    const key = `${expIndex}-${descIndex}`
    setShowSuggestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const useSuggestion = (expIndex, descIndex, suggestion) => {
    updateExperienceDescription(expIndex, descIndex, suggestion)
    const key = `${expIndex}-${descIndex}`
    setShowSuggestions(prev => ({
      ...prev,
      [key]: false
    }))
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Experience</h2>
        {isEditing && (
          <button className="add-btn" onClick={addExperience}>
            + Add Experience
          </button>
        )}
      </div>

      {resumeData.experience.map((exp, expIndex) => (
        <div key={exp.id} className="experience-item">
          {isEditing ? (
            <div className="editable-experience">
              <div className="experience-controls">
                <button
                  className="remove-btn"
                  onClick={() => removeExperience(expIndex)}
                  title="Remove this experience"
                >
                  × Remove
                </button>
              </div>
              <input
                type="text"
                className="editable-input"
                value={exp.title}
                onChange={(e) => updateExperience(expIndex, 'title', e.target.value)}
                placeholder="Job Title"
              />
              <input
                type="text"
                className="editable-input"
                value={exp.company}
                onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                placeholder="Company Name"
              />
              <input
                type="text"
                className="editable-input"
                value={exp.date}
                onChange={(e) => updateExperience(expIndex, 'date', e.target.value)}
                placeholder="Date Range (e.g., Jan 2020 - Present)"
              />
              <div className="description-edit">
                <label className="field-label">Responsibilities & Achievements:</label>
                {exp.description.map((desc, descIndex) => {
                  const suggestionKey = `${expIndex}-${descIndex}`
                  const showingSuggestions = showSuggestions[suggestionKey]
                  // Only compute suggestions when panel is visible to improve performance
                  const suggestions = showingSuggestions ? getBulletSuggestions(exp.title) : []

                  return (
                    <div key={descIndex} className="bullet-edit-wrapper">
                      <div className="bullet-edit">
                        <textarea
                          className="editable-textarea bullet-textarea"
                          value={desc}
                          onChange={(e) => updateExperienceDescription(expIndex, descIndex, e.target.value)}
                          placeholder="Describe your achievement or responsibility..."
                          rows={2}
                        />
                        <div className="bullet-actions">
                          <button
                            className="suggestion-btn"
                            onClick={() => toggleSuggestions(expIndex, descIndex)}
                            title="Get professional bullet point suggestions"
                          >
                            💡 {showingSuggestions ? 'Hide' : 'Suggestions'}
                          </button>
                          <button
                            className="remove-bullet-btn"
                            onClick={() => removeExperienceDescription(expIndex, descIndex)}
                            title="Remove bullet point"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {showingSuggestions && (
                        <div className="suggestions-panel">
                          <div className="suggestions-header">
                            <span className="suggestions-title">
                              💡 Professional Examples for "{exp.title || 'this role'}"
                            </span>
                            <span className="suggestions-hint">
                              Click any suggestion to use it
                            </span>
                          </div>
                          <div className="suggestions-list">
                            {suggestions.map((suggestion, idx) => (
                              <div
                                key={idx}
                                className="suggestion-item"
                                onClick={() => useSuggestion(expIndex, descIndex, suggestion)}
                              >
                                <span className="suggestion-icon">▸</span>
                                <span className="suggestion-text">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <button
                  className="add-bullet-btn"
                  onClick={() => addExperienceDescription(expIndex)}
                >
                  + Add Bullet Point
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="job-title">{exp.title}</h3>
              <p className="company">{exp.company}</p>
              <p className="date">{exp.date}</p>
              <ul>
                {exp.description.map((item, i) => (
                  <li key={i} className="description">{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
    </section>
  )
}

export default Experience
