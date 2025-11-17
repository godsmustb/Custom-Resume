/**
 * Classic Single Column Layout
 * Traditional ATS-optimized single column format
 * Used for: Traditional, ATS, Entry-Level, Healthcare, Finance, Legal, Government, etc.
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
import './ClassicSingleColumn.css'

const ClassicSingleColumn = ({ template, data, customization }) => {
  const { isEditing } = useResume()

  // Use customization settings
  const colorScheme = customization?.colorScheme || template?.colorSchemes?.[0] || 'corporate-blue'
  const spacing = customization?.spacing || 'comfortable'

  // Get font family from customization
  const selectedFont = FONT_OPTIONS.find(f => f.id === (customization?.font || 'inter'))
  const fontFamily = selectedFont?.family || "'Inter', sans-serif"

  return (
    <div
      className={`template-classic-single ${colorScheme} spacing-${spacing}`}
      style={{ fontFamily }}
    >
      <div className="classic-container">
        <Header />
        <About />

        {/* Skills section before experience for some templates */}
        {template?.layout?.sections?.[2] === 'skills' && <Skills />}

        <Experience />

        {/* Skills section after experience for most templates */}
        {template?.layout?.sections?.[2] !== 'skills' && <Skills />}

        <Education />
        <Certifications />
        <Contact />
      </div>
    </div>
  )
}

export default ClassicSingleColumn
