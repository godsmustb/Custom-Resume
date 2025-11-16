import { useResume } from '../context/ResumeContext'

function Education() {
  const { resumeData, isEditing, updateEducation, addEducation, removeEducation } = useResume()

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Education</h2>
        {isEditing && (
          <button className="add-btn" onClick={addEducation}>
            + Add Education
          </button>
        )}
      </div>

      {resumeData.education.map((edu, index) => (
        <div key={edu.id} className="education-item">
          {isEditing ? (
            <div className="editable-education">
              <div className="experience-controls">
                <button
                  className="remove-btn"
                  onClick={() => removeEducation(index)}
                  title="Remove this education"
                >
                  × Remove
                </button>
              </div>
              <input
                type="text"
                className="editable-input"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="Degree Name"
              />
              <input
                type="text"
                className="editable-input"
                value={edu.school}
                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                placeholder="School/University Name"
              />
              <input
                type="text"
                className="editable-input"
                value={edu.date}
                onChange={(e) => updateEducation(index, 'date', e.target.value)}
                placeholder="Date Range (e.g., 2015 - 2019)"
              />
              <textarea
                className="editable-textarea"
                value={edu.details}
                onChange={(e) => updateEducation(index, 'details', e.target.value)}
                placeholder="Details (GPA, honors, relevant coursework, etc.)"
                rows={2}
              />
            </div>
          ) : (
            <>
              {edu.degree?.trim() && <h3 className="degree">{edu.degree}</h3>}
              {edu.school?.trim() && <p className="school">{edu.school}</p>}
              {edu.date?.trim() && <p className="date">{edu.date}</p>}
              {edu.details?.trim() && <p className="description">{edu.details}</p>}
            </>
          )}
        </div>
      ))}
    </section>
  )
}

export default Education
