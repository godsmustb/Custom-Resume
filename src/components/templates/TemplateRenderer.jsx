/**
 * Template Renderer
 * Dynamically renders the appropriate template layout based on selected template
 */

import { useResume } from '../../context/ResumeContext'
import { getTemplateById } from '../../data/templateCatalog'

// Import template layouts
import ClassicSingleColumn from './layouts/ClassicSingleColumn'
import ModernTwoColumn from './layouts/ModernTwoColumn'
import ExecutiveLayout from './layouts/ExecutiveLayout'
import CreativeLayout from './layouts/CreativeLayout'
import MinimalistLayout from './layouts/MinimalistLayout'
import ProfessionalProjectManager from './layouts/ProfessionalProjectManager'

/**
 * Map template components to actual layout components
 * This allows us to reuse layouts across multiple templates
 */
const LAYOUT_MAP = {
  // Custom User Template (Professional Project Manager)
  'ProfessionalProjectManager': ProfessionalProjectManager,

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
 * Main Template Renderer Component
 */
const TemplateRenderer = () => {
  const { currentTemplate, resumeData, templateCustomization } = useResume()

  // Get the selected template configuration
  const template = getTemplateById(currentTemplate)

  if (!template) {
    // Fallback to default classic layout if template not found
    return <ClassicSingleColumn template={template} data={resumeData} customization={templateCustomization} />
  }

  // Get the layout component for this template
  const LayoutComponent = LAYOUT_MAP[template.component] || ClassicSingleColumn

  // Render the selected layout with template configuration, resume data, and customization
  return <LayoutComponent template={template} data={resumeData} customization={templateCustomization} />
}

export default TemplateRenderer
