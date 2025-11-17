/**
 * Modern Two Column Layout
 * Contemporary design with sidebar for skills and contact
 * Used for: Modern Professional, Tech, Project Manager, Engineering, Data Analytics, etc.
 */

import { useResume } from '../../../context/ResumeContext'
import About from '../../About'
import Experience from '../../Experience'
import Education from '../../Education'
import Certifications from '../../Certifications'
import Skills from '../../Skills'
import Contact from '../../Contact'
import './ModernTwoColumn.css'

const ModernTwoColumn = ({ template, data }) => {
  const { isEditing } = useResume()
  const colorScheme = template?.colorSchemes?.[0] || 'corporate-blue'

  return (
    <div className={`template-modern-two-column ${colorScheme}`}>
      <div className="modern-two-column-container">
        {/* Header Section - Full Width */}
        <div className="modern-header-section">
          <h1 className="modern-name">{data.personal.name}</h1>
          <h2 className="modern-title">{data.personal.title}</h2>
          <div className="modern-contact-info">
            {data.personal.email && <span>📧 {data.personal.email}</span>}
            {data.personal.phone && <span>📞 {data.personal.phone}</span>}
            {data.personal.location && <span>📍 {data.personal.location}</span>}
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="modern-grid">
          {/* Main Content - Left Column (70%) */}
          <div className="modern-main-content">
            <About />
            <Experience />
            <Education />
          </div>

          {/* Sidebar - Right Column (30%) */}
          <div className="modern-sidebar">
            <Skills />
            <Certifications />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernTwoColumn
