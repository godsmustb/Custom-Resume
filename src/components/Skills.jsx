import { useState, useMemo } from 'react'
import { useResume } from '../context/ResumeContext'
import {
  skillsLibrary,
  getSkillsByRole,
  searchSkills,
  getAllCategories,
  getSkillsByCategory,
  autocompleteJobTitles
} from '../services/skillsSuggestions'

function Skills() {
  const { resumeData, isEditing, updateSkills, addSkillCategory, removeSkillCategory } = useResume()
  const [showSuggestions, setShowSuggestions] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [jobTitleSearch, setJobTitleSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([])

  const handleSkillsChange = (categoryIndex, value) => {
    // Convert comma-separated string to array
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s)
    updateSkills(categoryIndex, 'skills', skillsArray)
  }

  const toggleSuggestions = (categoryIndex) => {
    setShowSuggestions(prev => ({
      ...prev,
      [categoryIndex]: !prev[categoryIndex]
    }))
    setSearchQuery('')
    setJobTitleSearch('')
    setSelectedCategory('')
  }

  const addSkillToCategory = (categoryIndex, skill) => {
    const currentSkills = resumeData.skills[categoryIndex].skills
    if (!currentSkills.includes(skill)) {
      const updatedSkills = [...currentSkills, skill]
      updateSkills(categoryIndex, 'skills', updatedSkills)
    }
  }

  // Popular job titles for quick access
  const popularJobTitles = [
    'Project Manager', 'Product Manager', 'Software Engineer', 'Data Analyst',
    'Marketing Manager', 'Sales Representative', 'Customer Service', 'Teacher'
  ]

  // Get job-title-based suggestions
  const jobTitleSuggestions = useMemo(() => {
    // If user searched for a job title, use that
    if (jobTitleSearch.trim()) {
      return getSkillsByRole(jobTitleSearch)
    }
    // Otherwise use their actual job title
    const jobTitle = resumeData.experience?.[0]?.title || resumeData.personal?.title || ''
    return getSkillsByRole(jobTitle)
  }, [jobTitleSearch, resumeData.experience, resumeData.personal])

  // Get skills to display based on search or category selection
  const getDisplaySkills = () => {
    if (searchQuery.trim().length >= 2) {
      return searchSkills(searchQuery)
    }
    if (selectedCategory) {
      const categorySkills = getSkillsByCategory(selectedCategory)
      return categorySkills.map(skill => ({ skill, category: selectedCategory }))
    }
    if (jobTitleSearch.trim()) {
      return jobTitleSuggestions.map(skill => ({ skill, category: 'Recommended' }))
    }
    return []
  }

  const displaySkills = getDisplaySkills()
  const categories = getAllCategories()

  // Check if a skill is "expert recommended" (from job title suggestions)
  const isExpertRecommended = (skill) => {
    return jobTitleSuggestions.includes(skill)
  }

  const handleJobTitleClick = (jobTitle) => {
    setJobTitleSearch(jobTitle)
    setSearchQuery('')
    setSelectedCategory('')
    setShowAutocomplete(false)
  }

  const handleSearchJobTitle = () => {
    // Trigger search when button is clicked
    if (jobTitleSearch.trim()) {
      setSearchQuery('')
      setSelectedCategory('')
      setShowAutocomplete(false)
    }
  }

  const handleJobTitleInputChange = (e) => {
    const value = e.target.value
    setJobTitleSearch(value)

    // Get autocomplete suggestions
    if (value.trim().length >= 1) {
      const suggestions = autocompleteJobTitles(value)
      setAutocompleteSuggestions(suggestions)
      setShowAutocomplete(suggestions.length > 0)
    } else {
      setAutocompleteSuggestions([])
      setShowAutocomplete(false)
    }
  }

  const handleAutocompleteClick = (suggestion) => {
    setJobTitleSearch(suggestion)
    setShowAutocomplete(false)
    setSearchQuery('')
    setSelectedCategory('')
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Skills</h2>
        {isEditing && (
          <button className="add-btn" onClick={addSkillCategory}>
            + Add Category
          </button>
        )}
      </div>

      <div className="skills-container">
        {resumeData.skills.map((category, index) => (
          <div key={index} className="skill-category">
            {isEditing ? (
              <div className="editable-skills">
                <div className="experience-controls">
                  <button
                    className="remove-btn"
                    onClick={() => removeSkillCategory(index)}
                    title="Remove this category"
                  >
                    × Remove
                  </button>
                </div>
                <input
                  type="text"
                  className="editable-input"
                  value={category.category}
                  onChange={(e) => updateSkills(index, 'category', e.target.value)}
                  placeholder="Category Name (e.g., Frontend)"
                />
                <textarea
                  className="editable-textarea"
                  value={category.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(index, e.target.value)}
                  placeholder="Skills separated by commas (e.g., React, JavaScript, HTML)"
                  rows={3}
                />

                {/* Suggestions Button */}
                <button
                  className="suggestion-btn"
                  onClick={() => toggleSuggestions(index)}
                  style={{ marginTop: '0.5rem' }}
                >
                  💡 Browse Skills
                </button>

                {/* Suggestions Modal - Resume Now Style Popup */}
                {showSuggestions[index] && (
                  <>
                    {/* Modal Backdrop */}
                    <div
                      className="modal-backdrop"
                      onClick={() => toggleSuggestions(index)}
                    />

                    {/* Modal Container */}
                    <div className="skills-modal">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h3 className="modal-title">Browse Skills</h3>
                        <button
                          className="modal-close-btn"
                          onClick={() => toggleSuggestions(index)}
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Modal Content */}
                      <div className="skills-suggestions-panel">
                    {/* Job Title Search */}
                    <div className="job-title-search-section">
                      <h4 className="search-section-title">Search by job title for pre-written examples</h4>
                      <div className="search-input-wrapper" style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="job-title-search-input"
                          placeholder="Search by job title"
                          value={jobTitleSearch}
                          onChange={handleJobTitleInputChange}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchJobTitle()}
                          onFocus={() => jobTitleSearch.trim() && setShowAutocomplete(autocompleteSuggestions.length > 0)}
                        />
                        <button className="search-icon-btn" onClick={handleSearchJobTitle}>
                          🔍
                        </button>

                        {/* Autocomplete Dropdown */}
                        {showAutocomplete && autocompleteSuggestions.length > 0 && (
                          <div className="autocomplete-dropdown">
                            {autocompleteSuggestions.map((suggestion, idx) => (
                              <div
                                key={idx}
                                className="autocomplete-item"
                                onClick={() => handleAutocompleteClick(suggestion)}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Popular Job Titles */}
                      <div className="popular-job-titles">
                        <h5 className="popular-titles-label">Popular Job Titles</h5>
                        <div className="job-title-links">
                          {popularJobTitles.map((title, idx) => (
                            <button
                              key={idx}
                              className="job-title-link"
                              onClick={() => handleJobTitleClick(title)}
                            >
                              🔍 {title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Skills List */}
                    <div className="ready-to-use-section">
                      <h5 className="ready-to-use-label">Ready to use examples</h5>

                      {/* Display skills based on job title or search */}
                      {(displaySkills.length > 0 || jobTitleSuggestions.length > 0) && (
                        <div className="skills-list-vertical">
                          {(displaySkills.length > 0 ? displaySkills : jobTitleSuggestions.map(s => ({ skill: s, category: 'Recommended' }))).slice(0, 30).map((item, idx) => (
                            <div key={idx} className="skill-list-item">
                              <button
                                className="add-skill-btn-circle"
                                onClick={() => addSkillToCategory(index, typeof item === 'string' ? item : item.skill)}
                                title="Add this skill"
                              >
                                +
                              </button>
                              <div className="skill-item-content">
                                {isExpertRecommended(typeof item === 'string' ? item : item.skill) && (
                                  <div className="expert-badge">
                                    ⭐ Expert Recommended
                                  </div>
                                )}
                                <div className="skill-name">
                                  {typeof item === 'string' ? item : item.skill}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Alternative search options */}
                      {displaySkills.length === 0 && jobTitleSearch && (
                        <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                          No skills found for "{jobTitleSearch}". Try a different job title.
                        </p>
                      )}

                      {/* Category and skill name search */}
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
                        <h5 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#2c3e50' }}>
                          Or browse by category / skill name
                        </h5>

                        <select
                          className="editable-input"
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value)
                            setJobTitleSearch('')
                          }}
                          style={{ marginBottom: '0.75rem' }}
                        >
                          <option value="">-- Select a Category --</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          className="editable-input"
                          placeholder="Search by skill name (e.g., React, Python)"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setJobTitleSearch('')
                          }}
                        />
                      </div>
                    </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <h3>{category.category}</h3>
                <ul className="skill-list">
                  {category.skills.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
