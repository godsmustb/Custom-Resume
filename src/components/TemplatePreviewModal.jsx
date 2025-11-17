/**
 * Template Preview Modal
 * Full-screen modal to preview templates with sample data before applying
 */

import { useResume } from '../context/ResumeContext'
import TemplatePreview from './TemplatePreview'
import './TemplatePreviewModal.css'

const TemplatePreviewModal = ({ template, onClose, onApply }) => {
  const { templateCustomization } = useResume()

  if (!template) return null

  return (
    <div className="template-preview-modal-overlay" onClick={onClose}>
      <div className="template-preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="preview-modal-header">
          <div className="preview-modal-title-section">
            <h2>{template.name}</h2>
            <p>{template.description}</p>
          </div>
          <button className="preview-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Preview Content */}
        <div className="preview-modal-content">
          <div className="preview-modal-scroll">
            <TemplatePreview
              templateId={template.id}
              customization={templateCustomization}
              mini={false}
            />
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="preview-modal-footer">
          <div className="preview-template-stats">
            <span className="preview-stat">
              <strong>ATS Score:</strong> {template.atsScore}%
            </span>
            <span className="preview-stat">
              <strong>Layout:</strong> {template.columns} Column
            </span>
            <span className="preview-stat">
              <strong>Industries:</strong> {template.industries.slice(0, 2).join(', ')}
            </span>
          </div>
          <div className="preview-modal-actions">
            <button className="preview-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="preview-apply-btn" onClick={onApply}>
              Apply This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatePreviewModal
