/**
 * Template Preview Component
 * Renders a scaled-down preview of any template with sample data
 */

import { SAMPLE_RESUME_DATA } from '../data/sampleData'
import { getTemplateById } from '../data/templateCatalog'

// Import template layouts
import ClassicSingleColumn from './templates/layouts/ClassicSingleColumn'
import ModernTwoColumn from './templates/layouts/ModernTwoColumn'
import ExecutiveLayout from './templates/layouts/ExecutiveLayout'
import CreativeLayout from './templates/layouts/CreativeLayout'
import MinimalistLayout from './templates/layouts/MinimalistLayout'

import './TemplatePreview.css'

/**
 * Map template components to actual layout components
 */
const LAYOUT_MAP = {
  // Classic Single Column Layouts
  'ATSSimpleTemplate': ClassicSingleColumn,
  'TraditionalTemplate': ClassicSingleColumn,
  'EntryLevelTemplate': ClassicSingleColumn,
  'RecentGradTemplate': ClassicSingleColumn,
  'CombinationFormatTemplate': ClassicSingleColumn,
  'ProfessionalBasicTemplate': ClassicSingleColumn,
  'HealthcareTemplate': ClassicSingleColumn,
  'FinanceTemplate': ClassicSingleColumn,
  'EducationTemplate': ClassicSingleColumn,
  'LegalTemplate': ClassicSingleColumn,
  'FederalTemplate': ClassicSingleColumn,
  'CareerChangeTemplate': ClassicSingleColumn,
  'CustomerServiceTemplate': ClassicSingleColumn,
  'RetailManagementTemplate': ClassicSingleColumn,
  'SupplyChainTemplate': ClassicSingleColumn,
  'NonProfitTemplate': ClassicSingleColumn,
  'HospitalityTemplate': ClassicSingleColumn,
  'RealEstateTemplate': ClassicSingleColumn,
  'AdministrativeTemplate': ClassicSingleColumn,
  'AcademicCVTemplate': ClassicSingleColumn,
  'PhysicianTemplate': ClassicSingleColumn,
  'PharmacistTemplate': ClassicSingleColumn,
  'VeterinarianTemplate': ClassicSingleColumn,

  // Modern Two Column Layouts
  'ModernProfessionalTemplate': ModernTwoColumn,
  'TechTemplate': ModernTwoColumn,
  'SalesTemplate': ModernTwoColumn,
  'MidCareerTemplate': ModernTwoColumn,
  'ProjectManagerTemplate': ModernTwoColumn,
  'ConsultingTemplate': ModernTwoColumn,
  'EngineeringTemplate': ModernTwoColumn,
  'OperationsTemplate': ModernTwoColumn,
  'DataAnalyticsTemplate': ModernTwoColumn,
  'SeniorPMTemplate': ModernTwoColumn,
  'CybersecurityTemplate': ModernTwoColumn,
  'DevOpsTemplate': ModernTwoColumn,
  'HumanResourcesTemplate': ModernTwoColumn,

  // Executive Layouts
  'ExecutiveTemplate': ExecutiveLayout,
  'SeniorLeadershipTemplate': ExecutiveLayout,
  'CFOTemplate': ExecutiveLayout,
  'CTOTemplate': ExecutiveLayout,
  'CMOTemplate': ExecutiveLayout,
  'TwoColumnPremiumTemplate': ExecutiveLayout,

  // Creative Layouts
  'CreativeTemplate': CreativeLayout,
  'MarketingTemplate': CreativeLayout,
  'ArchitectureTemplate': CreativeLayout,
  'UXResearcherTemplate': CreativeLayout,
  'ContentStrategistTemplate': CreativeLayout,
  'TimelineVisualTemplate': CreativeLayout,
  'ContemporaryTypographyTemplate': CreativeLayout,

  // Minimalist Layout
  'CleanMinimalistTemplate': MinimalistLayout
}

/**
 * TemplatePreview Component
 * @param {string} templateId - ID of template to preview
 * @param {object} customization - Optional customization settings
 * @param {boolean} mini - If true, render in mini mode for thumbnails
 */
const TemplatePreview = ({ templateId, customization, mini = false }) => {
  const template = getTemplateById(templateId)

  if (!template) {
    return (
      <div className="template-preview-error">
        <p>Template not found</p>
      </div>
    )
  }

  // Get the layout component for this template
  const LayoutComponent = LAYOUT_MAP[template.component] || ClassicSingleColumn

  // Use template's default color scheme if no customization provided
  const previewCustomization = customization || {
    colorScheme: template.colorSchemes?.[0] || 'corporate-blue',
    font: 'inter',
    spacing: 'compact' // Use compact for previews to show more content
  }

  return (
    <div className={`template-preview-wrapper ${mini ? 'mini' : 'full'}`}>
      <div className="template-preview-container">
        <LayoutComponent
          template={template}
          data={SAMPLE_RESUME_DATA}
          customization={previewCustomization}
        />
      </div>
    </div>
  )
}

export default TemplatePreview
