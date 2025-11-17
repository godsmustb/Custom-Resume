/**
 * Template System Types and Interfaces
 * Defines the structure for resume templates
 */

/**
 * Template tiers for monetization
 * @typedef {'free' | 'freemium' | 'premium'} TemplateTier
 */

/**
 * Template categories
 * @typedef {'ats-core' | 'industry' | 'experience' | 'modern' | 'specialized'} TemplateCategory
 */

/**
 * Color palette for templates
 * @typedef {Object} ColorPalette
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} primary - Primary accent color
 * @property {string} secondary - Secondary accent color
 * @property {string} text - Text color
 * @property {string} background - Background color
 */

/**
 * Font option for templates
 * @typedef {Object} FontOption
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} family - CSS font-family value
 * @property {string} category - 'modern' | 'traditional' | 'creative'
 */

/**
 * Resume template definition
 * @typedef {Object} ResumeTemplate
 * @property {string} id - Unique identifier
 * @property {string} name - Template display name
 * @property {string} description - Brief description
 * @property {TemplateCategory} category - Template category
 * @property {TemplateTier} tier - Access tier (free/freemium/premium)
 * @property {number} atsScore - ATS compatibility score (0-100)
 * @property {1 | 2} columns - Number of columns
 * @property {string[]} colorSchemes - Available color palette IDs
 * @property {string[]} fonts - Available font IDs
 * @property {string[]} industries - Target industries
 * @property {string} thumbnailUrl - Preview image URL
 * @property {string} component - React component name
 * @property {boolean} featured - Show in featured section
 * @property {Object} layout - Layout configuration
 */

export const TEMPLATE_TIERS = {
  FREE: 'free',
  FREEMIUM: 'freemium',
  PREMIUM: 'premium'
}

export const TEMPLATE_CATEGORIES = {
  ATS_CORE: 'ats-core',
  INDUSTRY: 'industry',
  EXPERIENCE: 'experience',
  MODERN: 'modern',
  SPECIALIZED: 'specialized'
}

export const COLOR_PALETTES = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    primary: '#1A73E8',
    secondary: '#0D47A1',
    text: '#212121',
    background: '#FFFFFF'
  },
  {
    id: 'professional-green',
    name: 'Professional Green',
    primary: '#2E7D32',
    secondary: '#1B5E20',
    text: '#212121',
    background: '#FFFFFF'
  },
  {
    id: 'modern-neutral',
    name: 'Modern Neutral',
    primary: '#424242',
    secondary: '#757575',
    text: '#212121',
    background: '#FFFFFF'
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    primary: '#9C27B0',
    secondary: '#6A1B9A',
    text: '#212121',
    background: '#FFFFFF'
  },
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    primary: '#0D47A1',
    secondary: '#1565C0',
    text: '#212121',
    background: '#FFFFFF'
  },
  {
    id: 'tech-cyan',
    name: 'Tech Cyan',
    primary: '#00ACC1',
    secondary: '#00838F',
    text: '#212121',
    background: '#FFFFFF'
  }
]

export const FONT_OPTIONS = [
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'modern'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: "'Roboto', sans-serif",
    category: 'modern'
  },
  {
    id: 'lato',
    name: 'Lato',
    family: "'Lato', sans-serif",
    category: 'modern'
  },
  {
    id: 'georgia',
    name: 'Georgia',
    family: "'Georgia', serif",
    category: 'traditional'
  },
  {
    id: 'times',
    name: 'Times New Roman',
    family: "'Times New Roman', serif",
    category: 'traditional'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    category: 'creative'
  }
]
