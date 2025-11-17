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
