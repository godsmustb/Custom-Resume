/**
 * Minimalist Layout
 * Ultra-clean Scandinavian design with maximum white space
 * Used for: Clean & Minimalist template
 */

import { useResume } from '../../../context/ResumeContext'
import { FONT_OPTIONS } from '../../../types/templateTypes'
import Header from '../../Header'
import About from '../../About'
import Experience from '../../Experience'
import Education from '../../Education'
import Certifications from '../../Certifications'
import Skills from '../../Skills'
import Contact from '../../Contact'
import './MinimalistLayout.css'

const MinimalistLayout = ({ template, data, customization }) => {
  const { isEditing } = useResume()

  // Use customization settings
  const colorScheme = customization?.colorScheme || template?.colorSchemes?.[0] || 'modern-neutral'
  const spacing = customization?.spacing || 'comfortable'

  // Get font family from customization
  const selectedFont = FONT_OPTIONS.find(f => f.id === (customization?.font || 'inter'))
  const fontFamily = selectedFont?.family || "'Inter', sans-serif"

  return (
    <div
      className={`template-minimalist ${colorScheme} spacing-${spacing}`}
      style={{ fontFamily }}
    >
      <div className="minimalist-container">
        {/* Minimalist Header */}
        <div className="minimalist-header">
          <h1 className="minimalist-name">{data.personal.name}</h1>
          <p className="minimalist-title">{data.personal.title}</p>
        </div>

        {/* Contact Bar */}
        <div className="minimalist-contact-bar">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>•</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span>•</span>}
          {data.personal.location && <span>{data.personal.location}</span>}
        </div>

        {/* Content */}
        <div className="minimalist-content">
          <About />
          <Experience />
          <Skills />
          <Education />
          <Certifications />
          <Contact />
        </div>
      </div>
    </div>
  )
}

export default MinimalistLayout
