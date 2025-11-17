/**
 * Template Catalog
 * Registry of all available resume templates
 */

import { TEMPLATE_TIERS, TEMPLATE_CATEGORIES } from '../types/templateTypes'

export const TEMPLATE_CATALOG = [
  // FREE TEMPLATES (3 templates)
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
