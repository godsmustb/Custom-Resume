/**
 * Professional Project Manager Template
 * Based on user's custom resume design
 * Clean, traditional layout with clear section separations
 */

import './ProfessionalProjectManager.css'

export default function ProfessionalProjectManager({ data, customization, isEditing }) {
  const { personal, about, experience, education, skills, certifications } = data

  return (
    <div className="professional-pm-template">
      {/* Header */}
      <header className="pm-header">
        <h1 className="pm-name">{personal.name}</h1>
        <p className="pm-title">{personal.title}</p>
        <div className="pm-contact">
          {personal.phone && (
            <>
              <span className="contact-icon">📞</span>
              <span>{personal.phone}</span>
              <span className="contact-separator">|</span>
            </>
          )}
          {personal.email && (
            <>
              <span className="contact-icon">✉️</span>
              <span>{personal.email}</span>
              <span className="contact-separator">|</span>
            </>
          )}
          {personal.location && (
            <>
              <span className="contact-icon">📍</span>
              <span>{personal.location}</span>
            </>
          )}
        </div>
      </header>

      {/* Summary Section */}
      {about && (
        <section className="pm-section">
          <h2 className="pm-section-title">SUMMARY</h2>
          <div className="pm-section-divider"></div>
          <p className="pm-summary">{about}</p>
        </section>
      )}

      {/* Strengths Section (Two-Column) */}
      {skills && skills.length > 0 && (
        <section className="pm-section">
          <h2 className="pm-section-title">STRENGTHS</h2>
          <div className="pm-section-divider"></div>
          <div className="pm-strengths-grid">
            {skills.map((skillCategory, index) => (
              <div key={index} className="pm-strength-category">
                {skillCategory.skills && skillCategory.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="pm-strength-item">
                    <span className="pm-bullet">•</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className="pm-section">
          <h2 className="pm-section-title">EXPERIENCE</h2>
          <div className="pm-section-divider"></div>

          {experience.map((exp, index) => (
            <div key={exp.id || index} className="pm-experience-item">
              <div className="pm-exp-header">
                <div className="pm-exp-left">
                  <h3 className="pm-job-title">{exp.title}</h3>
                  <p className="pm-company">{exp.company}</p>
                </div>
                <div className="pm-exp-right">
                  <p className="pm-date">{exp.date}</p>
                </div>
              </div>

              {exp.description && (
                <ul className="pm-exp-bullets">
                  {Array.isArray(exp.description) ? (
                    exp.description.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))
                  ) : (
                    <li>{exp.description}</li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className="pm-section">
          <h2 className="pm-section-title">EDUCATION</h2>
          <div className="pm-section-divider"></div>

          {education.map((edu, index) => (
            <div key={edu.id || index} className="pm-education-item">
              <div className="pm-edu-row">
                <span className="pm-degree">{edu.degree}</span>
                <span className="pm-edu-location">{edu.school}</span>
                <span className="pm-edu-date">{edu.date}</span>
              </div>
              {edu.details && (
                <p className="pm-edu-details">{edu.details}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && (
        <section className="pm-section">
          <h2 className="pm-section-title">CERTIFICATIONS</h2>
          <div className="pm-section-divider"></div>

          {certifications.map((cert, index) => (
            <div key={cert.id || index} className="pm-cert-item">
              <div className="pm-cert-row">
                <span className="pm-cert-name">{cert.name}</span>
                <span className="pm-cert-date">{cert.date}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Social Links Footer */}
      {(personal.linkedin || personal.github || personal.portfolio) && (
        <footer className="pm-footer">
          {personal.linkedin && (
            <a href={personal.linkedin} className="pm-social-link" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
          {personal.github && (
            <a href={personal.github} className="pm-social-link" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {personal.portfolio && (
            <a href={personal.portfolio} className="pm-social-link" target="_blank" rel="noopener noreferrer">
              Portfolio
            </a>
          )}
        </footer>
      )}
    </div>
  )
}
