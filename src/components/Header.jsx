import { useResume } from '../context/ResumeContext'
import './Header.css'

function Header() {
  const { resumeData, isEditing, updatePersonal } = useResume()
  const { personal } = resumeData

  if (isEditing) {
    return (
      <header className="header editing">
        <input
          type="text"
          className="editable-input name-input"
          value={personal.name}
          onChange={(e) => updatePersonal('name', e.target.value)}
          placeholder="Your Full Name"
        />
        <input
          type="text"
          className="editable-input title-input"
          value={personal.title}
          onChange={(e) => updatePersonal('title', e.target.value)}
          placeholder="Professional Title / Role"
        />
        <div className="contact-info-edit">
          <input
            type="email"
            className="editable-input small-input"
            value={personal.email}
            onChange={(e) => updatePersonal('email', e.target.value)}
            placeholder="email@example.com"
          />
          <input
            type="tel"
            className="editable-input small-input"
            value={personal.phone}
            onChange={(e) => updatePersonal('phone', e.target.value)}
            placeholder="(123) 456-7890"
          />
          <input
            type="text"
            className="editable-input small-input"
            value={personal.location}
            onChange={(e) => updatePersonal('location', e.target.value)}
            placeholder="City, State"
          />
        </div>
        <div className="social-links-edit">
          <input
            type="url"
            className="editable-input small-input"
            value={personal.linkedin}
            onChange={(e) => updatePersonal('linkedin', e.target.value)}
            placeholder="LinkedIn URL"
          />
          <input
            type="url"
            className="editable-input small-input"
            value={personal.github}
            onChange={(e) => updatePersonal('github', e.target.value)}
            placeholder="GitHub URL"
          />
          <input
            type="url"
            className="editable-input small-input"
            value={personal.portfolio}
            onChange={(e) => updatePersonal('portfolio', e.target.value)}
            placeholder="Portfolio URL"
          />
        </div>
      </header>
    )
  }

  return (
    <header className="header">
      <h1 className="name">{personal.name}</h1>
      <p className="title">{personal.title}</p>
      <div className="contact-info">
        {personal.email?.trim() && <span>{personal.email}</span>}
        {personal.email?.trim() && personal.phone?.trim() && <span>•</span>}
        {personal.phone?.trim() && <span>{personal.phone}</span>}
        {(personal.email?.trim() || personal.phone?.trim()) && personal.location?.trim() && <span>•</span>}
        {personal.location?.trim() && <span>{personal.location}</span>}
      </div>
      {(personal.linkedin?.trim() || personal.github?.trim() || personal.portfolio?.trim()) && (
        <div className="social-links">
          {personal.linkedin?.trim() && (
            <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          )}
          {personal.github?.trim() && (
            <a href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          )}
          {personal.portfolio?.trim() && (
            <a href={personal.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>
          )}
        </div>
      )}
    </header>
  )
}

export default Header
