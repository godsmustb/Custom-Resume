/**
 * Executive Layout
 * Premium executive format with emphasis on leadership and achievements
 * Used for: Executive, C-Suite, CFO, CTO, CMO, Senior Leadership
 */

import { useResume } from '../../../context/ResumeContext'
import { FONT_OPTIONS } from '../../../types/templateTypes'
import About from '../../About'
import Experience from '../../Experience'
import Education from '../../Education'
import Certifications from '../../Certifications'
import Skills from '../../Skills'
import Contact from '../../Contact'
import './ExecutiveLayout.css'

const ExecutiveLayout = ({ template, data, customization }) => {
  const { isEditing } = useResume()

  // Use customization settings
  const colorScheme = customization?.colorScheme || template?.colorSchemes?.[0] || 'executive-navy'
  const spacing = customization?.spacing || 'comfortable'

  // Get font family from customization
  const selectedFont = FONT_OPTIONS.find(f => f.id === (customization?.font || 'inter'))
  const fontFamily = selectedFont?.family || "'Inter', sans-serif"

  return (
    <div
      className={`template-executive ${colorScheme} spacing-${spacing}`}
      style={{ fontFamily }}
    >
      <div className="executive-container">
        {/* Executive Header */}
        <div className="executive-header">
          <div className="executive-name-section">
            <h1 className="executive-name">{data.personal.name}</h1>
            <div className="executive-title-bar">
              <h2 className="executive-title">{data.personal.title}</h2>
            </div>
          </div>
          <div className="executive-contact">
            {data.personal.email && <div>{data.personal.email}</div>}
            {data.personal.phone && <div>{data.personal.phone}</div>}
            {data.personal.location && <div>{data.personal.location}</div>}
            {data.personal.linkedin && <div>LinkedIn</div>}
          </div>
        </div>

        {/* Executive Summary */}
        <About />

        {/* Two Column Grid for Executive Content */}
        <div className="executive-grid">
          <div className="executive-main">
            <Experience />
          </div>

          <div className="executive-sidebar">
            <Education />
            <Skills />
            <Certifications />
          </div>
        </div>

        <Contact />
      </div>
    </div>
  )
}

export default ExecutiveLayout
