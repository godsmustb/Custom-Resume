/**
 * Template Catalog
 * Registry of all available resume templates
 */

import { TEMPLATE_TIERS, TEMPLATE_CATEGORIES } from '../types/templateTypes'

export const TEMPLATE_CATALOG = [
  // FREE TEMPLATES (4 templates - including custom user template)
  {
    id: 'professional-project-manager',
    name: 'Professional Project Manager',
    description: 'Clean, traditional layout with two-column strengths section. Perfect for project managers, operations, and engineering roles.',
    category: TEMPLATE_CATEGORIES.ATS_CORE,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 96,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'executive-navy'],
    fonts: ['arial', 'calibri', 'roboto'],
    industries: ['Project Management', 'Operations', 'Engineering', 'Manufacturing', 'Construction'],
    thumbnailUrl: '/templates/thumbnails/professional-project-manager.png',
    component: 'ProfessionalProjectManager',
    featured: true,
    default: true,
    layout: {
      sections: ['contact', 'summary', 'strengths', 'experience', 'education', 'certifications'],
      spacing: 'comfortable',
      headerStyle: 'centered'
    }
  },
  {
    id: 'ats-simple-minimal',
    name: 'ATS Simple & Minimal',
    description: 'Clean single-column layout optimized for Applicant Tracking Systems. Perfect for any industry.',
    category: TEMPLATE_CATEGORIES.ATS_CORE,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 98,
    columns: 1,
    colorSchemes: ['corporate-blue', 'modern-neutral', 'professional-green'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['All Industries'],
    thumbnailUrl: '/templates/thumbnails/ats-simple-minimal.png',
    component: 'ATSSimpleTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'experience', 'education', 'skills', 'certifications'],
      spacing: 'comfortable',
      headerStyle: 'clean'
    }
  },
  {
    id: 'traditional-conservative',
    name: 'Traditional Conservative',
    description: 'Classic format ideal for finance, law, and healthcare. Timeless and professional.',
    category: TEMPLATE_CATEGORIES.ATS_CORE,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 97,
    columns: 1,
    colorSchemes: ['executive-navy', 'modern-neutral'],
    fonts: ['georgia', 'times'],
    industries: ['Finance', 'Law', 'Healthcare', 'Government'],
    thumbnailUrl: '/templates/thumbnails/traditional-conservative.png',
    component: 'TraditionalTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'experience', 'education', 'skills', 'certifications'],
      spacing: 'compact',
      headerStyle: 'traditional'
    }
  },
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Contemporary two-column design that fits 30% more content while maintaining ATS compatibility.',
    category: TEMPLATE_CATEGORIES.ATS_CORE,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 95,
    columns: 2,
    colorSchemes: ['corporate-blue', 'professional-green', 'tech-cyan'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['Technology', 'Marketing', 'Business'],
    thumbnailUrl: '/templates/thumbnails/modern-professional.png',
    component: 'ModernProfessionalTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'certifications'],
      spacing: 'balanced',
      headerStyle: 'modern',
      sidebar: true
    }
  },

  // FREEMIUM TEMPLATES (2 templates - industry specific)
  {
    id: 'tech-software-engineer',
    name: 'Tech: Software Engineer',
    description: 'Optimized for software developers with sections for projects, technical skills, and GitHub.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 96,
    columns: 2,
    colorSchemes: ['tech-cyan', 'corporate-blue', 'modern-neutral'],
    fonts: ['roboto', 'inter', 'lato'],
    industries: ['Software Engineering', 'Web Development', 'Data Science'],
    thumbnailUrl: '/templates/thumbnails/tech-software-engineer.png',
    component: 'TechTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'technical-skills', 'experience', 'projects', 'education', 'certifications'],
      spacing: 'compact',
      headerStyle: 'tech',
      sidebar: true,
      specialSections: ['github', 'portfolio']
    }
  },
  {
    id: 'creative-designer',
    name: 'Creative: Designer',
    description: 'Stand out with modern typography and visual elements while remaining ATS-friendly.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 92,
    columns: 2,
    colorSchemes: ['creative-purple', 'tech-cyan', 'professional-green'],
    fonts: ['montserrat', 'inter', 'lato'],
    industries: ['Graphic Design', 'UX/UI', 'Marketing', 'Photography'],
    thumbnailUrl: '/templates/thumbnails/creative-designer.png',
    component: 'CreativeTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'portfolio'],
      spacing: 'creative',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['portfolio', 'awards']
    }
  },

  // FREE TEMPLATES (Additional 2)
  {
    id: 'entry-level-student',
    name: 'Entry-Level & Student',
    description: 'Education-focused layout perfect for students and recent graduates with limited work experience.',
    category: TEMPLATE_CATEGORIES.EXPERIENCE,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 96,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['All Industries', 'Entry Level', 'Internships'],
    thumbnailUrl: '/templates/thumbnails/entry-level-student.png',
    component: 'EntryLevelTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'education', 'summary', 'experience', 'skills', 'projects', 'activities'],
      spacing: 'comfortable',
      headerStyle: 'clean',
      specialSections: ['coursework', 'activities']
    }
  },
  {
    id: 'recent-graduate',
    name: 'Recent Graduate (1-3 Years)',
    description: 'Balanced format highlighting early career achievements and education credentials.',
    category: TEMPLATE_CATEGORIES.EXPERIENCE,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 95,
    columns: 1,
    colorSchemes: ['corporate-blue', 'tech-cyan', 'professional-green'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['All Industries', 'Early Career'],
    thumbnailUrl: '/templates/thumbnails/recent-graduate.png',
    component: 'RecentGradTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'education', 'skills', 'certifications'],
      spacing: 'balanced',
      headerStyle: 'modern'
    }
  },

  // FREEMIUM TEMPLATES (Additional 8)
  {
    id: 'healthcare-medical',
    name: 'Healthcare & Medical',
    description: 'Specialized template for nurses, physicians, and healthcare administrators with licensure sections.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 96,
    columns: 1,
    colorSchemes: ['professional-green', 'corporate-blue', 'modern-neutral'],
    fonts: ['georgia', 'times', 'inter'],
    industries: ['Healthcare', 'Nursing', 'Medical', 'Healthcare Administration'],
    thumbnailUrl: '/templates/thumbnails/healthcare-medical.png',
    component: 'HealthcareTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'licenses', 'experience', 'education', 'certifications', 'skills'],
      spacing: 'compact',
      headerStyle: 'traditional',
      specialSections: ['licenses', 'clinical-rotations']
    }
  },
  {
    id: 'finance-banking',
    name: 'Finance & Banking',
    description: 'Conservative design for financial analysts, accountants, and banking professionals.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 97,
    columns: 1,
    colorSchemes: ['executive-navy', 'modern-neutral', 'corporate-blue'],
    fonts: ['georgia', 'times', 'inter'],
    industries: ['Finance', 'Banking', 'Accounting', 'Investment'],
    thumbnailUrl: '/templates/thumbnails/finance-banking.png',
    component: 'FinanceTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'experience', 'education', 'certifications', 'skills'],
      spacing: 'compact',
      headerStyle: 'traditional',
      specialSections: ['licenses', 'financial-certifications']
    }
  },
  {
    id: 'education-teacher',
    name: 'Education & Teaching',
    description: 'Tailored for teachers and professors with sections for teaching philosophy and curriculum.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 95,
    columns: 1,
    colorSchemes: ['professional-green', 'corporate-blue', 'modern-neutral'],
    fonts: ['georgia', 'inter', 'lato'],
    industries: ['Education', 'Teaching', 'K-12', 'Higher Education'],
    thumbnailUrl: '/templates/thumbnails/education-teacher.png',
    component: 'EducationTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'teaching-experience', 'education', 'certifications', 'skills'],
      spacing: 'balanced',
      headerStyle: 'traditional',
      specialSections: ['teaching-philosophy', 'curriculum']
    }
  },
  {
    id: 'legal-attorney',
    name: 'Legal & Attorney',
    description: 'Professional format for attorneys and paralegals with bar admission and case experience.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 97,
    columns: 1,
    colorSchemes: ['executive-navy', 'modern-neutral'],
    fonts: ['georgia', 'times'],
    industries: ['Law', 'Legal', 'Paralegal', 'Corporate Law'],
    thumbnailUrl: '/templates/thumbnails/legal-attorney.png',
    component: 'LegalTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'bar-admissions', 'experience', 'education', 'publications'],
      spacing: 'compact',
      headerStyle: 'traditional',
      specialSections: ['bar-admissions', 'publications']
    }
  },
  {
    id: 'sales-business-dev',
    name: 'Sales & Business Development',
    description: 'Results-driven template emphasizing revenue achievements and client relationships.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 94,
    columns: 2,
    colorSchemes: ['corporate-blue', 'professional-green', 'tech-cyan'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['Sales', 'Business Development', 'Account Management'],
    thumbnailUrl: '/templates/thumbnails/sales-business-dev.png',
    component: 'SalesTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'achievements', 'education', 'skills'],
      spacing: 'balanced',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['sales-metrics', 'awards']
    }
  },
  {
    id: 'mid-career-professional',
    name: 'Mid-Career Professional (5-10 Years)',
    description: 'Comprehensive layout for experienced professionals with proven track records.',
    category: TEMPLATE_CATEGORIES.EXPERIENCE,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 96,
    columns: 2,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'georgia'],
    industries: ['All Industries', 'Management', 'Professional Services'],
    thumbnailUrl: '/templates/thumbnails/mid-career-professional.png',
    component: 'MidCareerTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'certifications'],
      spacing: 'balanced',
      headerStyle: 'modern',
      sidebar: true
    }
  },
  {
    id: 'federal-government',
    name: 'Federal & Government',
    description: 'Detailed format meeting federal resume requirements with comprehensive work history.',
    category: TEMPLATE_CATEGORIES.ATS_CORE,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 98,
    columns: 1,
    colorSchemes: ['executive-navy', 'modern-neutral'],
    fonts: ['times', 'georgia'],
    industries: ['Government', 'Federal', 'Public Sector', 'Defense'],
    thumbnailUrl: '/templates/thumbnails/federal-government.png',
    component: 'FederalTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'work-experience', 'education', 'certifications', 'security-clearance'],
      spacing: 'detailed',
      headerStyle: 'traditional',
      specialSections: ['security-clearance', 'veteran-preference']
    }
  },
  {
    id: 'career-change-functional',
    name: 'Career Change & Functional',
    description: 'Skills-focused layout ideal for career changers highlighting transferable skills.',
    category: TEMPLATE_CATEGORIES.SPECIALIZED,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 93,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['All Industries', 'Career Change', 'Transitioning'],
    thumbnailUrl: '/templates/thumbnails/career-change-functional.png',
    component: 'CareerChangeTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'core-competencies', 'relevant-experience', 'work-history', 'education'],
      spacing: 'balanced',
      headerStyle: 'modern',
      specialSections: ['core-competencies']
    }
  },

  // PREMIUM TEMPLATES (5 templates)
  {
    id: 'executive-c-suite',
    name: 'Executive & C-Suite',
    description: 'Premium executive format showcasing leadership impact and board experience.',
    category: TEMPLATE_CATEGORIES.EXPERIENCE,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 95,
    columns: 2,
    colorSchemes: ['executive-navy', 'modern-neutral'],
    fonts: ['georgia', 'times', 'inter'],
    industries: ['Executive', 'C-Suite', 'Senior Leadership', 'Board'],
    thumbnailUrl: '/templates/thumbnails/executive-c-suite.png',
    component: 'ExecutiveTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'executive-summary', 'leadership-experience', 'board-positions', 'education', 'achievements'],
      spacing: 'executive',
      headerStyle: 'executive',
      sidebar: true,
      specialSections: ['board-positions', 'speaking-engagements']
    }
  },
  {
    id: 'academic-cv',
    name: 'Academic CV',
    description: 'Comprehensive academic curriculum vitae for researchers and professors (2+ pages).',
    category: TEMPLATE_CATEGORIES.SPECIALIZED,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 94,
    columns: 1,
    colorSchemes: ['executive-navy', 'modern-neutral'],
    fonts: ['georgia', 'times'],
    industries: ['Academia', 'Research', 'Higher Education', 'PhD'],
    thumbnailUrl: '/templates/thumbnails/academic-cv.png',
    component: 'AcademicCVTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'research-interests', 'education', 'publications', 'teaching', 'grants', 'conferences'],
      spacing: 'detailed',
      headerStyle: 'traditional',
      multiPage: true,
      specialSections: ['publications', 'grants', 'conferences']
    }
  },
  {
    id: 'senior-leadership',
    name: 'Senior Leadership (10+ Years)',
    description: 'Premium template for senior leaders with extensive management experience.',
    category: TEMPLATE_CATEGORIES.EXPERIENCE,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 96,
    columns: 2,
    colorSchemes: ['executive-navy', 'corporate-blue', 'modern-neutral'],
    fonts: ['georgia', 'inter', 'roboto'],
    industries: ['Leadership', 'Management', 'Director', 'VP'],
    thumbnailUrl: '/templates/thumbnails/senior-leadership.png',
    component: 'SeniorLeadershipTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'leadership-summary', 'professional-experience', 'key-achievements', 'education', 'skills'],
      spacing: 'executive',
      headerStyle: 'executive',
      sidebar: true,
      specialSections: ['key-achievements', 'leadership-competencies']
    }
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics & BI',
    description: 'Technical template for data analysts and business intelligence professionals.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 95,
    columns: 2,
    colorSchemes: ['tech-cyan', 'corporate-blue', 'modern-neutral'],
    fonts: ['roboto', 'inter', 'lato'],
    industries: ['Data Analytics', 'Business Intelligence', 'Data Science', 'Analytics'],
    thumbnailUrl: '/templates/thumbnails/data-analytics.png',
    component: 'DataAnalyticsTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'technical-skills', 'experience', 'projects', 'education', 'certifications'],
      spacing: 'compact',
      headerStyle: 'tech',
      sidebar: true,
      specialSections: ['tools-technologies', 'data-projects']
    }
  },
  {
    id: 'marketing-manager',
    name: 'Marketing Manager',
    description: 'Premium marketing template highlighting campaign results and brand strategy.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 94,
    columns: 2,
    colorSchemes: ['creative-purple', 'corporate-blue', 'tech-cyan'],
    fonts: ['montserrat', 'inter', 'lato'],
    industries: ['Marketing', 'Digital Marketing', 'Brand Management', 'Content Marketing'],
    thumbnailUrl: '/templates/thumbnails/marketing-manager.png',
    component: 'MarketingTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'campaigns', 'skills', 'education', 'certifications'],
      spacing: 'creative',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['campaign-results', 'marketing-metrics']
    }
  },

  // FREE TEMPLATES (Additional 3 - Total 8)
  {
    id: 'ats-combination-format',
    name: 'ATS Combination Format',
    description: 'Hybrid skills + chronological format emphasizing both competencies and work history.',
    category: TEMPLATE_CATEGORIES.ATS_CORE,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 96,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['All Industries', 'Career Change', 'Mid-Career'],
    thumbnailUrl: '/templates/thumbnails/ats-combination-format.png',
    component: 'CombinationFormatTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'core-skills', 'experience', 'education', 'certifications'],
      spacing: 'balanced',
      headerStyle: 'clean'
    }
  },
  {
    id: 'clean-minimalist',
    name: 'Clean & Minimalist',
    description: 'Ultra-clean Scandinavian design with maximum white space and readability.',
    category: TEMPLATE_CATEGORIES.MODERN,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 97,
    columns: 1,
    colorSchemes: ['modern-neutral', 'corporate-blue'],
    fonts: ['inter', 'lato'],
    industries: ['All Industries', 'Modern', 'Professional'],
    thumbnailUrl: '/templates/thumbnails/clean-minimalist.png',
    component: 'CleanMinimalistTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'education', 'skills'],
      spacing: 'generous',
      headerStyle: 'minimalist'
    }
  },
  {
    id: 'professional-basic',
    name: 'Professional Basic',
    description: 'Straightforward no-frills template perfect for quick applications.',
    category: TEMPLATE_CATEGORIES.ATS_CORE,
    tier: TEMPLATE_TIERS.FREE,
    atsScore: 98,
    columns: 1,
    colorSchemes: ['modern-neutral', 'corporate-blue', 'professional-green'],
    fonts: ['inter', 'roboto', 'times'],
    industries: ['All Industries'],
    thumbnailUrl: '/templates/thumbnails/professional-basic.png',
    component: 'ProfessionalBasicTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'education', 'skills'],
      spacing: 'comfortable',
      headerStyle: 'basic'
    }
  },

  // FREEMIUM TEMPLATES (Additional 12 - Total 22)
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Results-oriented template for PMs highlighting deliverables and methodologies.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 95,
    columns: 2,
    colorSchemes: ['corporate-blue', 'professional-green', 'tech-cyan'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['Project Management', 'Agile', 'Scrum Master', 'Program Management'],
    thumbnailUrl: '/templates/thumbnails/project-manager.png',
    component: 'ProjectManagerTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'experience', 'certifications', 'skills', 'education'],
      spacing: 'balanced',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['project-highlights', 'methodologies']
    }
  },
  {
    id: 'human-resources',
    name: 'Human Resources',
    description: 'HR-focused template with sections for recruitment metrics and employee relations.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 94,
    columns: 1,
    colorSchemes: ['professional-green', 'corporate-blue', 'modern-neutral'],
    fonts: ['inter', 'georgia', 'lato'],
    industries: ['Human Resources', 'Talent Acquisition', 'HR Management', 'Recruiting'],
    thumbnailUrl: '/templates/thumbnails/human-resources.png',
    component: 'HumanResourcesTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'certifications'],
      spacing: 'balanced',
      headerStyle: 'professional',
      specialSections: ['hr-metrics', 'certifications']
    }
  },
  {
    id: 'consulting',
    name: 'Management Consulting',
    description: 'Consulting-optimized format emphasizing client impact and problem-solving.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 96,
    columns: 2,
    colorSchemes: ['executive-navy', 'corporate-blue', 'modern-neutral'],
    fonts: ['georgia', 'inter', 'times'],
    industries: ['Consulting', 'Strategy', 'Management Consulting', 'Advisory'],
    thumbnailUrl: '/templates/thumbnails/consulting.png',
    component: 'ConsultingTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'education', 'skills', 'certifications'],
      spacing: 'compact',
      headerStyle: 'executive',
      sidebar: true,
      specialSections: ['client-impact', 'case-studies']
    }
  },
  {
    id: 'engineering-technical',
    name: 'Engineering & Technical',
    description: 'Technical template for engineers with project portfolio and technical skills.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 96,
    columns: 2,
    colorSchemes: ['tech-cyan', 'corporate-blue', 'modern-neutral'],
    fonts: ['roboto', 'inter', 'lato'],
    industries: ['Engineering', 'Mechanical', 'Civil', 'Electrical', 'Industrial'],
    thumbnailUrl: '/templates/thumbnails/engineering-technical.png',
    component: 'EngineeringTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'technical-skills', 'experience', 'projects', 'education', 'certifications'],
      spacing: 'compact',
      headerStyle: 'technical',
      sidebar: true,
      specialSections: ['technical-projects', 'pe-license']
    }
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Customer-focused template highlighting satisfaction metrics and problem resolution.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 94,
    columns: 1,
    colorSchemes: ['professional-green', 'corporate-blue', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['Customer Service', 'Customer Support', 'Client Relations', 'Call Center'],
    thumbnailUrl: '/templates/thumbnails/customer-service.png',
    component: 'CustomerServiceTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'awards'],
      spacing: 'balanced',
      headerStyle: 'friendly',
      specialSections: ['customer-metrics', 'languages']
    }
  },
  {
    id: 'retail-management',
    name: 'Retail Management',
    description: 'Retail-optimized format with sales performance and team leadership focus.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 93,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['Retail', 'Store Management', 'Retail Operations', 'Merchandising'],
    thumbnailUrl: '/templates/thumbnails/retail-management.png',
    component: 'RetailManagementTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'achievements', 'education', 'skills'],
      spacing: 'balanced',
      headerStyle: 'professional',
      specialSections: ['sales-performance', 'team-metrics']
    }
  },
  {
    id: 'operations-manager',
    name: 'Operations Manager',
    description: 'Operations-focused template emphasizing process improvement and efficiency.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 95,
    columns: 2,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'georgia'],
    industries: ['Operations', 'Operations Management', 'Supply Chain', 'Logistics'],
    thumbnailUrl: '/templates/thumbnails/operations-manager.png',
    component: 'OperationsTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'certifications'],
      spacing: 'balanced',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['process-improvements', 'kpis']
    }
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain & Logistics',
    description: 'Specialized template for supply chain professionals with inventory and distribution focus.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 95,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'georgia'],
    industries: ['Supply Chain', 'Logistics', 'Procurement', 'Distribution'],
    thumbnailUrl: '/templates/thumbnails/supply-chain.png',
    component: 'SupplyChainTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'certifications'],
      spacing: 'compact',
      headerStyle: 'professional',
      specialSections: ['certifications', 'systems']
    }
  },
  {
    id: 'nonprofit-social-work',
    name: 'Non-Profit & Social Work',
    description: 'Mission-driven template for non-profit professionals and social workers.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 94,
    columns: 1,
    colorSchemes: ['professional-green', 'corporate-blue', 'modern-neutral'],
    fonts: ['georgia', 'inter', 'lato'],
    industries: ['Non-Profit', 'Social Work', 'Community Services', 'NGO'],
    thumbnailUrl: '/templates/thumbnails/nonprofit-social-work.png',
    component: 'NonProfitTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'education', 'volunteer', 'skills'],
      spacing: 'balanced',
      headerStyle: 'traditional',
      specialSections: ['volunteer-work', 'grants']
    }
  },
  {
    id: 'hospitality-manager',
    name: 'Hospitality Manager',
    description: 'Hospitality-focused template for hotel and restaurant management professionals.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 93,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['Hospitality', 'Hotel Management', 'Restaurant', 'Tourism'],
    thumbnailUrl: '/templates/thumbnails/hospitality-manager.png',
    component: 'HospitalityTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'certifications'],
      spacing: 'balanced',
      headerStyle: 'friendly',
      specialSections: ['guest-satisfaction', 'languages']
    }
  },
  {
    id: 'real-estate-agent',
    name: 'Real Estate Agent',
    description: 'Sales-oriented template for real estate agents highlighting transactions and commissions.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 93,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'executive-navy'],
    fonts: ['inter', 'georgia', 'lato'],
    industries: ['Real Estate', 'Realtor', 'Property Management', 'Commercial Real Estate'],
    thumbnailUrl: '/templates/thumbnails/real-estate-agent.png',
    component: 'RealEstateTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'achievements', 'education', 'licenses'],
      spacing: 'balanced',
      headerStyle: 'professional',
      specialSections: ['sales-volume', 'licenses']
    }
  },
  {
    id: 'administrative-assistant',
    name: 'Administrative Assistant',
    description: 'Organizational template highlighting administrative skills and office management.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.FREEMIUM,
    atsScore: 95,
    columns: 1,
    colorSchemes: ['corporate-blue', 'professional-green', 'modern-neutral'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['Administrative', 'Office Management', 'Executive Assistant', 'Clerical'],
    thumbnailUrl: '/templates/thumbnails/administrative-assistant.png',
    component: 'AdministrativeTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'certifications'],
      spacing: 'comfortable',
      headerStyle: 'clean',
      specialSections: ['software-proficiency', 'languages']
    }
  },

  // PREMIUM TEMPLATES (Additional 15 - Total 20)
  {
    id: 'two-column-premium-executive',
    name: 'Two-Column Premium Executive',
    description: 'Sophisticated two-column design with infographic elements for senior professionals.',
    category: TEMPLATE_CATEGORIES.MODERN,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 94,
    columns: 2,
    colorSchemes: ['executive-navy', 'corporate-blue', 'modern-neutral'],
    fonts: ['georgia', 'inter', 'montserrat'],
    industries: ['Executive', 'Management', 'Leadership', 'Senior Professional'],
    thumbnailUrl: '/templates/thumbnails/two-column-premium-executive.png',
    component: 'TwoColumnPremiumTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'executive-summary', 'experience', 'key-achievements', 'education', 'skills'],
      spacing: 'executive',
      headerStyle: 'premium',
      sidebar: true,
      specialSections: ['visual-metrics', 'competencies']
    }
  },
  {
    id: 'timeline-visual',
    name: 'Timeline Visual',
    description: 'Visual career progression template with timeline-based experience display.',
    category: TEMPLATE_CATEGORIES.MODERN,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 92,
    columns: 1,
    colorSchemes: ['corporate-blue', 'tech-cyan', 'creative-purple'],
    fonts: ['inter', 'montserrat', 'lato'],
    industries: ['Creative', 'Modern', 'Design', 'Technology'],
    thumbnailUrl: '/templates/thumbnails/timeline-visual.png',
    component: 'TimelineVisualTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'experience-timeline', 'skills', 'education'],
      spacing: 'visual',
      headerStyle: 'modern',
      specialSections: ['visual-timeline', 'milestones']
    }
  },
  {
    id: 'contemporary-typography',
    name: 'Contemporary Typography',
    description: 'Modern design with unique font pairings and contemporary layout.',
    category: TEMPLATE_CATEGORIES.MODERN,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 93,
    columns: 2,
    colorSchemes: ['corporate-blue', 'creative-purple', 'tech-cyan'],
    fonts: ['montserrat', 'inter', 'lato'],
    industries: ['Creative', 'Marketing', 'Design', 'Modern Professional'],
    thumbnailUrl: '/templates/thumbnails/contemporary-typography.png',
    component: 'ContemporaryTypographyTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'skills', 'education', 'portfolio'],
      spacing: 'creative',
      headerStyle: 'contemporary',
      sidebar: true,
      specialSections: ['portfolio', 'design-skills']
    }
  },
  {
    id: 'cfo-finance-executive',
    name: 'CFO & Finance Executive',
    description: 'Executive finance template highlighting P&L management and strategic financial leadership.',
    category: TEMPLATE_CATEGORIES.EXPERIENCE,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 96,
    columns: 2,
    colorSchemes: ['executive-navy', 'modern-neutral', 'corporate-blue'],
    fonts: ['georgia', 'times', 'inter'],
    industries: ['Finance Executive', 'CFO', 'Controller', 'VP Finance'],
    thumbnailUrl: '/templates/thumbnails/cfo-finance-executive.png',
    component: 'CFOTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'executive-summary', 'leadership-experience', 'achievements', 'education', 'boards'],
      spacing: 'executive',
      headerStyle: 'executive',
      sidebar: true,
      specialSections: ['financial-impact', 'board-positions']
    }
  },
  {
    id: 'cto-technology-executive',
    name: 'CTO & Technology Executive',
    description: 'Technology executive template showcasing technical vision and digital transformation.',
    category: TEMPLATE_CATEGORIES.EXPERIENCE,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 95,
    columns: 2,
    colorSchemes: ['tech-cyan', 'corporate-blue', 'executive-navy'],
    fonts: ['inter', 'roboto', 'georgia'],
    industries: ['Technology Executive', 'CTO', 'VP Engineering', 'Tech Leadership'],
    thumbnailUrl: '/templates/thumbnails/cto-technology-executive.png',
    component: 'CTOTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'executive-summary', 'leadership-experience', 'technical-vision', 'education', 'speaking'],
      spacing: 'executive',
      headerStyle: 'tech-executive',
      sidebar: true,
      specialSections: ['digital-transformation', 'patents']
    }
  },
  {
    id: 'cmo-marketing-executive',
    name: 'CMO & Marketing Executive',
    description: 'Marketing executive template emphasizing brand growth and revenue impact.',
    category: TEMPLATE_CATEGORIES.EXPERIENCE,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 94,
    columns: 2,
    colorSchemes: ['creative-purple', 'corporate-blue', 'executive-navy'],
    fonts: ['montserrat', 'inter', 'georgia'],
    industries: ['Marketing Executive', 'CMO', 'VP Marketing', 'Brand Leadership'],
    thumbnailUrl: '/templates/thumbnails/cmo-marketing-executive.png',
    component: 'CMOTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'executive-summary', 'leadership-experience', 'brand-impact', 'education', 'awards'],
      spacing: 'executive',
      headerStyle: 'creative-executive',
      sidebar: true,
      specialSections: ['brand-achievements', 'revenue-growth']
    }
  },
  {
    id: 'medical-physician',
    name: 'Medical Physician',
    description: 'Comprehensive physician CV with clinical experience, research, and publications.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 96,
    columns: 1,
    colorSchemes: ['professional-green', 'executive-navy', 'modern-neutral'],
    fonts: ['georgia', 'times'],
    industries: ['Physician', 'Doctor', 'Medical', 'Clinical'],
    thumbnailUrl: '/templates/thumbnails/medical-physician.png',
    component: 'PhysicianTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'medical-licenses', 'clinical-experience', 'education', 'publications', 'certifications'],
      spacing: 'detailed',
      headerStyle: 'traditional',
      multiPage: true,
      specialSections: ['board-certifications', 'research']
    }
  },
  {
    id: 'pharmacist',
    name: 'Pharmacist',
    description: 'Specialized pharmacist template with licensure and clinical pharmacy experience.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 96,
    columns: 1,
    colorSchemes: ['professional-green', 'corporate-blue', 'modern-neutral'],
    fonts: ['georgia', 'inter', 'times'],
    industries: ['Pharmacy', 'Clinical Pharmacy', 'Retail Pharmacy', 'Hospital Pharmacy'],
    thumbnailUrl: '/templates/thumbnails/pharmacist.png',
    component: 'PharmacistTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'licenses', 'experience', 'education', 'certifications', 'skills'],
      spacing: 'compact',
      headerStyle: 'professional',
      specialSections: ['pharmacy-licenses', 'clinical-rotations']
    }
  },
  {
    id: 'architecture-design',
    name: 'Architecture & Design',
    description: 'Creative template for architects with project portfolio and design philosophy.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 93,
    columns: 2,
    colorSchemes: ['modern-neutral', 'corporate-blue', 'creative-purple'],
    fonts: ['montserrat', 'inter', 'lato'],
    industries: ['Architecture', 'Interior Design', 'Urban Planning', 'Architectural Design'],
    thumbnailUrl: '/templates/thumbnails/architecture-design.png',
    component: 'ArchitectureTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'projects', 'education', 'skills', 'awards'],
      spacing: 'creative',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['portfolio-projects', 'software-expertise']
    }
  },
  {
    id: 'product-manager-senior',
    name: 'Senior Product Manager',
    description: 'Product leadership template with product launches and strategic impact.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 95,
    columns: 2,
    colorSchemes: ['tech-cyan', 'corporate-blue', 'professional-green'],
    fonts: ['inter', 'roboto', 'lato'],
    industries: ['Product Management', 'Product Leadership', 'Technology', 'SaaS'],
    thumbnailUrl: '/templates/thumbnails/product-manager-senior.png',
    component: 'SeniorPMTemplate',
    featured: true,
    layout: {
      sections: ['contact', 'summary', 'experience', 'product-launches', 'skills', 'education'],
      spacing: 'balanced',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['product-metrics', 'methodologies']
    }
  },
  {
    id: 'cybersecurity-specialist',
    name: 'Cybersecurity Specialist',
    description: 'Security-focused template for cybersecurity professionals with certifications.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 96,
    columns: 2,
    colorSchemes: ['executive-navy', 'tech-cyan', 'modern-neutral'],
    fonts: ['roboto', 'inter', 'lato'],
    industries: ['Cybersecurity', 'Information Security', 'Network Security', 'Security Engineering'],
    thumbnailUrl: '/templates/thumbnails/cybersecurity-specialist.png',
    component: 'CybersecurityTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'technical-skills', 'experience', 'certifications', 'education'],
      spacing: 'compact',
      headerStyle: 'technical',
      sidebar: true,
      specialSections: ['security-certifications', 'clearances']
    }
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'Technical template for DevOps engineers with CI/CD and infrastructure expertise.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 95,
    columns: 2,
    colorSchemes: ['tech-cyan', 'corporate-blue', 'modern-neutral'],
    fonts: ['roboto', 'inter', 'lato'],
    industries: ['DevOps', 'Site Reliability', 'Cloud Engineering', 'Infrastructure'],
    thumbnailUrl: '/templates/thumbnails/devops-engineer.png',
    component: 'DevOpsTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'technical-skills', 'experience', 'projects', 'education', 'certifications'],
      spacing: 'compact',
      headerStyle: 'tech',
      sidebar: true,
      specialSections: ['cloud-platforms', 'automation']
    }
  },
  {
    id: 'ux-researcher',
    name: 'UX Researcher',
    description: 'Research-focused template for UX researchers with methodologies and findings.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 94,
    columns: 2,
    colorSchemes: ['creative-purple', 'tech-cyan', 'corporate-blue'],
    fonts: ['montserrat', 'inter', 'lato'],
    industries: ['UX Research', 'User Research', 'Product Research', 'Design Research'],
    thumbnailUrl: '/templates/thumbnails/ux-researcher.png',
    component: 'UXResearcherTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'research-projects', 'skills', 'education'],
      spacing: 'balanced',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['research-methods', 'publications']
    }
  },
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    description: 'Content-focused template for strategists with portfolio and engagement metrics.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 93,
    columns: 2,
    colorSchemes: ['creative-purple', 'corporate-blue', 'tech-cyan'],
    fonts: ['montserrat', 'inter', 'lato'],
    industries: ['Content Strategy', 'Content Marketing', 'Digital Content', 'Editorial'],
    thumbnailUrl: '/templates/thumbnails/content-strategist.png',
    component: 'ContentStrategistTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'experience', 'portfolio', 'skills', 'education'],
      spacing: 'creative',
      headerStyle: 'modern',
      sidebar: true,
      specialSections: ['content-portfolio', 'engagement-metrics']
    }
  },
  {
    id: 'veterinarian',
    name: 'Veterinarian',
    description: 'Veterinary-specific template with licensure and clinical experience.',
    category: TEMPLATE_CATEGORIES.INDUSTRY,
    tier: TEMPLATE_TIERS.PREMIUM,
    atsScore: 96,
    columns: 1,
    colorSchemes: ['professional-green', 'corporate-blue', 'modern-neutral'],
    fonts: ['georgia', 'inter', 'times'],
    industries: ['Veterinary', 'Animal Health', 'Veterinary Medicine', 'Pet Care'],
    thumbnailUrl: '/templates/thumbnails/veterinarian.png',
    component: 'VeterinarianTemplate',
    featured: false,
    layout: {
      sections: ['contact', 'summary', 'licenses', 'clinical-experience', 'education', 'certifications'],
      spacing: 'compact',
      headerStyle: 'professional',
      specialSections: ['veterinary-licenses', 'specializations']
    }
  }
]

/**
 * Get template by ID
 */
export const getTemplateById = (id) => {
  return TEMPLATE_CATALOG.find(template => template.id === id)
}

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category) => {
  return TEMPLATE_CATALOG.filter(template => template.category === category)
}

/**
 * Get templates by tier
 */
export const getTemplatesByTier = (tier) => {
  return TEMPLATE_CATALOG.filter(template => template.tier === tier)
}

/**
 * Get featured templates
 */
export const getFeaturedTemplates = () => {
  return TEMPLATE_CATALOG.filter(template => template.featured)
}

/**
 * Get free templates
 */
export const getFreeTemplates = () => {
  return getTemplatesByTier(TEMPLATE_TIERS.FREE)
}

/**
 * Search templates
 */
export const searchTemplates = (query) => {
  const lowerQuery = query.toLowerCase()
  return TEMPLATE_CATALOG.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.industries.some(industry => industry.toLowerCase().includes(lowerQuery))
  )
}
