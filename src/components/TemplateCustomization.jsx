import { useResume } from '../context/ResumeContext'
import { COLOR_PALETTES, FONT_OPTIONS } from '../types/templateTypes'
import './TemplateCustomization.css'

const SPACING_OPTIONS = [
  { id: 'compact', name: 'Compact', description: 'Tight spacing, more content' },
  { id: 'comfortable', name: 'Comfortable', description: 'Balanced spacing' },
  { id: 'spacious', name: 'Spacious', description: 'Generous spacing, easy reading' }
]

const TemplateCustomization = () => {
  const { templateCustomization, setTemplateCustomization } = useResume()

  const handleColorChange = (colorId) => {
    setTemplateCustomization({ colorScheme: colorId })
  }

  const handleFontChange = (fontId) => {
    setTemplateCustomization({ font: fontId })
  }

  const handleSpacingChange = (spacingId) => {
    setTemplateCustomization({ spacing: spacingId })
  }

  return (
    <div className="template-customization">
      <h3 className="customization-title">🎨 Customize Your Template</h3>

      {/* Color Scheme Selector */}
      <div className="customization-section">
        <label className="customization-label">Color Scheme</label>
        <div className="color-palette-grid">
          {COLOR_PALETTES.map(palette => (
            <button
              key={palette.id}
              className={`color-palette-option ${
                templateCustomization.colorScheme === palette.id ? 'selected' : ''
              }`}
              onClick={() => handleColorChange(palette.id)}
              title={palette.name}
            >
              <div className="color-preview-box">
                <div
                  className="color-swatch primary"
                  style={{ backgroundColor: palette.primary }}
                />
                <div
                  className="color-swatch secondary"
                  style={{ backgroundColor: palette.secondary }}
                />
              </div>
              <span className="color-name">{palette.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Selector */}
      <div className="customization-section">
        <label className="customization-label">Font</label>
        <div className="font-options-grid">
          {FONT_OPTIONS.map(font => (
            <button
              key={font.id}
              className={`font-option ${
                templateCustomization.font === font.id ? 'selected' : ''
              }`}
              onClick={() => handleFontChange(font.id)}
              style={{ fontFamily: font.family }}
            >
              <span className="font-name">{font.name}</span>
              <span className="font-category">{font.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spacing Selector */}
      <div className="customization-section">
        <label className="customization-label">Spacing</label>
        <div className="spacing-options-grid">
          {SPACING_OPTIONS.map(spacing => (
            <button
              key={spacing.id}
              className={`spacing-option ${
                templateCustomization.spacing === spacing.id ? 'selected' : ''
              }`}
              onClick={() => handleSpacingChange(spacing.id)}
            >
              <span className="spacing-name">{spacing.name}</span>
              <span className="spacing-description">{spacing.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplateCustomization
