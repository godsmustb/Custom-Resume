/**
 * Professional Project Manager Template
 * Based on user's custom resume design
 * Clean, traditional layout with clear section separations
 * Uses existing editable components with custom styling
 */

import { useResume } from '../../../context/ResumeContext'
import Header from '../../Header'
import About from '../../About'
import Experience from '../../Experience'
import Education from '../../Education'
import Skills from '../../Skills'
import Certifications from '../../Certifications'
import Contact from '../../Contact'
import './ProfessionalProjectManager.css'

export default function ProfessionalProjectManager({ data, customization, isEditing }) {
  const { resumeData } = useResume()

  return (
    <div className="professional-pm-template">
      {/* Header - Uses existing Header component with custom PM styling */}
      <div className="pm-header-wrapper">
        <Header />
      </div>

      {/* Summary Section */}
      <section className="pm-section pm-summary-section">
        <h2 className="pm-section-title">SUMMARY</h2>
        <div className="pm-section-divider"></div>
        <About />
      </section>

      {/* Strengths/Skills Section (Two/Three-Column) */}
      <section className="pm-section pm-skills-section">
        <h2 className="pm-section-title">STRENGTHS</h2>
        <div className="pm-section-divider"></div>
        <div className="pm-skills-wrapper">
          <Skills />
        </div>
      </section>

      {/* Experience Section */}
      <section className="pm-section pm-experience-section">
        <h2 className="pm-section-title">EXPERIENCE</h2>
        <div className="pm-section-divider"></div>
        <Experience />
      </section>

      {/* Education Section */}
      <section className="pm-section pm-education-section">
        <h2 className="pm-section-title">EDUCATION</h2>
        <div className="pm-section-divider"></div>
        <Education />
      </section>

      {/* Certifications Section */}
      {resumeData.certifications && resumeData.certifications.length > 0 && (
        <section className="pm-section pm-certifications-section">
          <h2 className="pm-section-title">CERTIFICATIONS</h2>
          <div className="pm-section-divider"></div>
          <Certifications />
        </section>
      )}

      {/* Social Links Footer */}
      <div className="pm-contact-wrapper">
        <Contact />
      </div>
    </div>
  )
}
