/**
 * Minimalist Layout
 * Ultra-clean Scandinavian design with maximum white space
 * Used for: Clean & Minimalist template
 */

import { useResume } from '../../../context/ResumeContext'
import Header from '../../Header'
import About from '../../About'
import Experience from '../../Experience'
import Education from '../../Education'
import Certifications from '../../Certifications'
import Skills from '../../Skills'
import Contact from '../../Contact'
import './MinimalistLayout.css'

const MinimalistLayout = ({ template, data }) => {
  const { isEditing } = useResume()
  const colorScheme = template?.colorSchemes?.[0] || 'modern-neutral'

  return (
    <div className={`template-minimalist ${colorScheme}`}>
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
