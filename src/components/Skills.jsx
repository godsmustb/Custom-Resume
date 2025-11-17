import { useState, useMemo } from 'react'
import { useResume } from '../context/ResumeContext'
import {
  skillsLibrary,
  getSkillsByRole,
  searchSkills,
  getAllCategories,
  getSkillsByCategory
} from '../services/skillsSuggestions'

function Skills() {
  const { resumeData, isEditing, updateSkills, addSkillCategory, removeSkillCategory } = useResume()
  const [showSuggestions, setShowSuggestions] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

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
    setSelectedCategory('')
  }

  const addSkillToCategory = (categoryIndex, skill) => {
    const currentSkills = resumeData.skills[categoryIndex].skills
    if (!currentSkills.includes(skill)) {
      const updatedSkills = [...currentSkills, skill]
      updateSkills(categoryIndex, 'skills', updatedSkills)
    }
  }

  // Get job-title-based suggestions
  const jobTitleSuggestions = useMemo(() => {
    // Try to get job title from first experience or personal title
    const jobTitle = resumeData.experience?.[0]?.title || resumeData.personal?.title || ''
    return getSkillsByRole(jobTitle)
  }, [resumeData.experience, resumeData.personal])

  // Get skills to display based on search or category selection
  const getDisplaySkills = () => {
    if (searchQuery.trim().length >= 2) {
      return searchSkills(searchQuery)
    }
    if (selectedCategory) {
      const categorySkills = getSkillsByCategory(selectedCategory)
      return categorySkills.map(skill => ({ skill, category: selectedCategory }))
    }
    return []
  }

  const displaySkills = getDisplaySkills()
  const categories = getAllCategories()

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
                  💡 {showSuggestions[index] ? 'Hide Suggestions' : 'Browse Skills'}
                </button>

                {/* Suggestions Panel */}
                {showSuggestions[index] && (
                  <div className="suggestions-panel" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <div className="suggestions-header">
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Browse Skills</h4>

                      {/* Search Bar */}
                      <input
                        type="text"
                        className="editable-input"
                        placeholder="Search skills... (e.g., React, Python, Marketing)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                      />

                      {/* Category Selector */}
                      <select
                        className="editable-input"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                      >
                        <option value="">-- Select a Category --</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Job-based Recommendations */}
                    {!searchQuery && !selectedCategory && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#667eea' }}>
                          {jobTitleSuggestions.length > 0 ? 'Recommended for Your Role' : 'Popular Skills'}
                        </h5>
                        <div className="skill-chips">
                          {jobTitleSuggestions.slice(0, 20).map((skill, idx) => (
                            <button
                              key={idx}
                              className="skill-chip"
                              onClick={() => addSkillToCategory(index, skill)}
                              title="Click to add this skill"
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                        <p style={{
                          marginTop: '1rem',
                          fontSize: '0.85rem',
                          color: '#7f8c8d',
                          fontStyle: 'italic'
                        }}>
                          💡 Tip: Use the search bar above or select a category to find more skills
                        </p>
                      </div>
                    )}

                    {/* Search/Category Results */}
                    {displaySkills.length > 0 && (
                      <div>
                        <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#667eea' }}>
                          {searchQuery ? `Search Results (${displaySkills.length})` : selectedCategory}
                        </h5>
                        <div className="skill-chips">
                          {displaySkills.map((item, idx) => (
                            <button
                              key={idx}
                              className="skill-chip"
                              onClick={() => addSkillToCategory(index, item.skill)}
                              title={`Click to add ${item.skill} (${item.category})`}
                            >
                              + {item.skill}
                              {searchQuery && (
                                <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '0.3rem' }}>
                                  ({item.category})
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results message */}
                    {(searchQuery.trim().length >= 2 || selectedCategory) && displaySkills.length === 0 && (
                      <p style={{ textAlign: 'center', color: '#999', margin: '2rem 0' }}>
                        No skills found. Try a different search term or category.
                      </p>
                    )}
                  </div>
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
