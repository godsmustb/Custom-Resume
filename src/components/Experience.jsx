import { useResume } from '../context/ResumeContext'

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
                {exp.description.map((desc, descIndex) => (
                  <div key={descIndex} className="bullet-edit">
                    <textarea
                      className="editable-textarea bullet-textarea"
                      value={desc}
                      onChange={(e) => updateExperienceDescription(expIndex, descIndex, e.target.value)}
                      placeholder="Describe your achievement or responsibility..."
                      rows={2}
                    />
                    <button
                      className="remove-bullet-btn"
                      onClick={() => removeExperienceDescription(expIndex, descIndex)}
                      title="Remove bullet point"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
