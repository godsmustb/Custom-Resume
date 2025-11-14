import { useResume } from '../context/ResumeContext'

function Skills() {
  const { resumeData, isEditing, updateSkills, addSkillCategory, removeSkillCategory } = useResume()

  const handleSkillsChange = (categoryIndex, value) => {
    // Convert comma-separated string to array
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s)
    updateSkills(categoryIndex, 'skills', skillsArray)
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
