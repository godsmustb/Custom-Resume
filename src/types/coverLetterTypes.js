/**
 * Cover Letter Types and Interfaces
 *
 * Type definitions for the cover letter feature.
 * These correspond to the Supabase database schema.
 */

/**
 * @typedef {Object} CoverLetterTemplate
 * @property {string} id - UUID primary key
 * @property {string} job_title - Job title (e.g., "Software Engineer")
 * @property {string} industry - Industry category (e.g., "Technology")
 * @property {string} experience_level - Experience level (e.g., "Mid-level")
 * @property {string} template_content - Full cover letter template with placeholders
 * @property {string} preview_text - First 200 characters for preview
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} UserCoverLetter
 * @property {string} id - UUID primary key
 * @property {string} user_id - User ID from Supabase auth
 * @property {string|null} template_id - Reference to template (nullable)
 * @property {string} title - Cover letter title (default: "Untitled Cover Letter")
 * @property {string} customized_content - User's customized cover letter content
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} CoverLetterFormData
 * @property {string} fullName
 * @property {string} yourAddress
 * @property {string} phoneNumber
 * @property {string} emailAddress
 * @property {string} date
 * @property {string} hiringManagerName
 * @property {string} companyName
 * @property {string} companyAddress
 * @property {string} specificCompanyAchievement
 * @property {string} yearsOfExperience
 * @property {string} previousCompanyName
 * @property {string} relevantCertification
 */

/**
 * Cover letter placeholder mappings
 * Maps placeholder names to form field names
 */
export const PLACEHOLDER_MAP = {
  '[Full Name]': 'fullName',
  '[Your Address]': 'yourAddress',
  '[Phone Number]': 'phoneNumber',
  '[Email Address]': 'emailAddress',
  '[Date]': 'date',
  '[Hiring Manager Name]': 'hiringManagerName',
  '[Company Name]': 'companyName',
  '[Company Address]': 'companyAddress',
  '[Specific Company Achievement/Project]': 'specificCompanyAchievement',
  '[Years of Experience]': 'yearsOfExperience',
  '[Previous Company Name]': 'previousCompanyName',
  '[Relevant Certification]': 'relevantCertification',
};

/**
 * Reverse mapping: form field names to placeholders
 */
export const FIELD_TO_PLACEHOLDER = Object.fromEntries(
  Object.entries(PLACEHOLDER_MAP).map(([placeholder, field]) => [field, placeholder])
);

/**
 * Industry categories
 */
export const INDUSTRIES = [
  'All Industries',
  'Technology',
  'Healthcare',
  'Business',
  'Marketing',
  'Sales',
  'Customer Service',
  'Creative',
  'Administrative',
  'Human Resources',
  'Finance',
  'Education',
  'Real Estate',
  'Skilled Trades',
  'Hospitality',
  'Retail',
  'Logistics',
  'Operations',
];

/**
 * Experience levels
 */
export const EXPERIENCE_LEVELS = [
  'All Levels',
  'Entry-level',
  'Mid-level',
  'Senior',
];

/**
 * Default form data for new cover letters
 * @type {CoverLetterFormData}
 */
export const DEFAULT_FORM_DATA = {
  fullName: '',
  yourAddress: '',
  phoneNumber: '',
  emailAddress: '',
  date: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  hiringManagerName: '',
  companyName: '',
  companyAddress: '',
  specificCompanyAchievement: '',
  yearsOfExperience: '',
  previousCompanyName: '',
  relevantCertification: '',
};

/**
 * Replaces all placeholders in template content with form data
 * @param {string} templateContent - Template text with placeholders
 * @param {CoverLetterFormData} formData - User's form data
 * @returns {string} - Template with placeholders replaced
 */
export const replacePlaceholders = (templateContent, formData) => {
  let result = templateContent;

  Object.entries(PLACEHOLDER_MAP).forEach(([placeholder, field]) => {
    const value = formData[field] || placeholder;
    // Use global regex to replace all occurrences
    result = result.replace(new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'g'), value);
  });

  return result;
};

/**
 * Extracts all placeholders from template content
 * @param {string} templateContent - Template text
 * @returns {string[]} - Array of placeholder names
 */
export const extractPlaceholders = (templateContent) => {
  const regex = /\[([^\]]+)\]/g;
  const matches = [];
  let match;

  while ((match = regex.exec(templateContent)) !== null) {
    if (!matches.includes(match[0])) {
      matches.push(match[0]);
    }
  }

  return matches;
};

/**
 * Checks if a placeholder is still unfilled in the content
 * @param {string} content - Cover letter content
 * @param {string} placeholder - Placeholder to check
 * @returns {boolean} - True if placeholder is still present
 */
export const isPlaceholderUnfilled = (content, placeholder) => {
  return content.includes(placeholder);
};

/**
 * Gets all unfilled placeholders in content
 * @param {string} content - Cover letter content
 * @returns {string[]} - Array of unfilled placeholders
 */
export const getUnfilledPlaceholders = (content) => {
  return extractPlaceholders(content);
};

/**
 * Validates that all required fields are filled
 * @param {CoverLetterFormData} formData - Form data to validate
 * @returns {{isValid: boolean, missingFields: string[]}}
 */
export const validateFormData = (formData) => {
  const requiredFields = [
    'fullName',
    'emailAddress',
    'phoneNumber',
    'hiringManagerName',
    'companyName',
  ];

  const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Formats field names for display in UI
 * @param {string} fieldName - Camel case field name
 * @returns {string} - Human-readable field name
 */
export const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};
