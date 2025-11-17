/**
 * Creative Layout
 * Modern creative design with visual emphasis
 * Used for: Creative Designer, Marketing, Architecture, UX, Content Strategy, Timeline
 */

import { useResume } from '../../../context/ResumeContext'
import About from '../../About'
import Experience from '../../Experience'
import Education from '../../Education'
import Certifications from '../../Certifications'
import Skills from '../../Skills'
import Contact from '../../Contact'
import './CreativeLayout.css'

const CreativeLayout = ({ template, data }) => {
  const { isEditing } = useResume()
  const colorScheme = template?.colorSchemes?.[0] || 'creative-purple'

  return (
    <div className={`template-creative ${colorScheme}`}>
      <div className="creative-container">
        {/* Creative Header with Accent Bar */}
        <div className="creative-header">
          <div className="creative-accent-bar"></div>
          <div className="creative-header-content">
            <h1 className="creative-name">{data.personal.name}</h1>
            <h2 className="creative-title">{data.personal.title}</h2>
            <div className="creative-contact-row">
              {data.personal.email && <span>{data.personal.email}</span>}
              {data.personal.phone && <span>{data.personal.phone}</span>}
              {data.personal.location && <span>{data.personal.location}</span>}
            </div>
          </div>
        </div>

        {/* Two Column Creative Grid */}
        <div className="creative-grid">
          {/* Left Sidebar */}
          <div className="creative-left-sidebar">
            <About />
            <Skills />
            <Education />
            <Certifications />
          </div>

          {/* Main Content */}
          <div className="creative-main-content">
            <Experience />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreativeLayout
