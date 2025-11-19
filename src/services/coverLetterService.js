/**
 * Cover Letter Service
 *
 * Handles all Supabase database operations for cover letter templates
 * and user cover letters.
 */

import { supabase } from '../config/supabase.js';

/**
 * Check if Supabase is configured
 * @returns {boolean}
 */
const isSupabaseConfigured = () => {
  if (!supabase) {
    console.warn('⚠️ Supabase not configured. Cover letter cloud features are disabled.');
    return false;
  }
  return true;
};

/**
 * Fetch all cover letter templates
 * @param {Object} filters - Optional filters
 * @param {string} filters.industry - Filter by industry (optional)
 * @param {string} filters.experience_level - Filter by experience level (optional)
 * @param {string} filters.search - Search in job titles (optional)
 * @returns {Promise<Array>} - Array of templates
 */
export const fetchTemplates = async (filters = {}) => {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase
      .from('cover_letter_templates')
      .select('*')
      .order('job_title', { ascending: true });

    // Apply industry filter
    if (filters.industry && filters.industry !== 'All Industries') {
      query = query.eq('industry', filters.industry);
    }

    // Apply experience level filter
    if (filters.experience_level && filters.experience_level !== 'All Levels') {
      query = query.eq('experience_level', filters.experience_level);
    }

    // Apply search filter (case-insensitive)
    if (filters.search && filters.search.trim() !== '') {
      query = query.ilike('job_title', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchTemplates:', error);
    throw error;
  }
};

/**
 * Fetch a single template by ID
 * @param {string} templateId - Template UUID
 * @returns {Promise<Object|null>} - Template object or null
 */
export const fetchTemplateById = async (templateId) => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error} = await supabase
      .from('cover_letter_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Error fetching template by ID:', error);
      throw new Error(`Failed to fetch template: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchTemplateById:', error);
    throw error;
  }
};

/**
 * Fetch all saved cover letters for the current user
 * @param {string} userId - User UUID from Supabase auth
 * @returns {Promise<Array>} - Array of user cover letters
 */
export const fetchUserCoverLetters = async (userId) => {
  if (!isSupabaseConfigured()) return [];

  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('user_cover_letters')
      .select(`
        *,
        template:cover_letter_templates(job_title, industry, experience_level)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user cover letters:', error);
      throw new Error(`Failed to fetch saved cover letters: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUserCoverLetters:', error);
    throw error;
  }
};

/**
 * Create a new saved cover letter
 * @param {Object} coverLetterData - Cover letter data
 * @param {string} coverLetterData.user_id - User UUID
 * @param {string} coverLetterData.template_id - Template UUID (optional)
 * @param {string} coverLetterData.title - Cover letter title
 * @param {string} coverLetterData.customized_content - Customized content
 * @returns {Promise<Object>} - Created cover letter object
 */
export const createUserCoverLetter = async (coverLetterData) => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { user_id, template_id, title, customized_content } = coverLetterData;

    if (!user_id) {
      throw new Error('User ID is required');
    }

    if (!customized_content) {
      throw new Error('Cover letter content is required');
    }

    const { data, error } = await supabase
      .from('user_cover_letters')
      .insert([
        {
          user_id,
          template_id: template_id || null,
          title: title || 'Untitled Cover Letter',
          customized_content,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating cover letter:', error);
      throw new Error(`Failed to save cover letter: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createUserCoverLetter:', error);
    throw error;
  }
};

/**
 * Update an existing saved cover letter
 * @param {string} coverLetterId - Cover letter UUID
 * @param {Object} updates - Fields to update
 * @param {string} updates.title - New title (optional)
 * @param {string} updates.customized_content - New content (optional)
 * @returns {Promise<Object>} - Updated cover letter object
 */
export const updateUserCoverLetter = async (coverLetterId, updates) => {
  if (!isSupabaseConfigured()) return null;
  try {
    if (!coverLetterId) {
      throw new Error('Cover letter ID is required');
    }

    const { data, error } = await supabase
      .from('user_cover_letters')
      .update(updates)
      .eq('id', coverLetterId)
      .select()
      .single();

    if (error) {
      console.error('Error updating cover letter:', error);
      throw new Error(`Failed to update cover letter: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserCoverLetter:', error);
    throw error;
  }
};

/**
 * Delete a saved cover letter
 * @param {string} coverLetterId - Cover letter UUID
 * @returns {Promise<void>}
 */
export const deleteUserCoverLetter = async (coverLetterId) => {
  if (!isSupabaseConfigured()) return false;
  try {
    if (!coverLetterId) {
      throw new Error('Cover letter ID is required');
    }

    const { error } = await supabase
      .from('user_cover_letters')
      .delete()
      .eq('id', coverLetterId);

    if (error) {
      console.error('Error deleting cover letter:', error);
      throw new Error(`Failed to delete cover letter: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteUserCoverLetter:', error);
    throw error;
  }
};

/**
 * Fetch a single user cover letter by ID
 * @param {string} coverLetterId - Cover letter UUID
 * @param {string} userId - User UUID (for RLS verification)
 * @returns {Promise<Object|null>} - Cover letter object or null
 */
export const fetchUserCoverLetterById = async (coverLetterId, userId) => {
  if (!isSupabaseConfigured()) return null;
  try {
    if (!coverLetterId) {
      throw new Error('Cover letter ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('user_cover_letters')
      .select(`
        *,
        template:cover_letter_templates(*)
      `)
      .eq('id', coverLetterId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching cover letter by ID:', error);
      throw new Error(`Failed to fetch cover letter: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchUserCoverLetterById:', error);
    throw error;
  }
};

/**
 * Get template statistics (for admin/analytics)
 * @returns {Promise<Object>} - Statistics object
 */
export const getTemplateStats = async () => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data: templates, error: templatesError } = await supabase
      .from('cover_letter_templates')
      .select('industry, experience_level');

    if (templatesError) {
      throw new Error(`Failed to fetch template stats: ${templatesError.message}`);
    }

    const stats = {
      total: templates.length,
      byIndustry: {},
      byExperience: {},
    };

    templates.forEach(template => {
      // Count by industry
      stats.byIndustry[template.industry] = (stats.byIndustry[template.industry] || 0) + 1;

      // Count by experience level
      stats.byExperience[template.experience_level] =
        (stats.byExperience[template.experience_level] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error in getTemplateStats:', error);
    throw error;
  }
};

/**
 * Duplicate a saved cover letter
 * @param {string} coverLetterId - Cover letter UUID to duplicate
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} - New cover letter object
 */
export const duplicateUserCoverLetter = async (coverLetterId, userId) => {
  if (!isSupabaseConfigured()) return null;
  try {
    // Fetch the original cover letter
    const original = await fetchUserCoverLetterById(coverLetterId, userId);

    if (!original) {
      throw new Error('Cover letter not found');
    }

    // Create a duplicate with "(Copy)" appended to title
    const duplicate = await createUserCoverLetter({
      user_id: userId,
      template_id: original.template_id,
      title: `${original.title} (Copy)`,
      customized_content: original.customized_content,
    });

    return duplicate;
  } catch (error) {
    console.error('Error in duplicateUserCoverLetter:', error);
    throw error;
  }
};

export default {
  fetchTemplates,
  fetchTemplateById,
  fetchUserCoverLetters,
  createUserCoverLetter,
  updateUserCoverLetter,
  deleteUserCoverLetter,
  fetchUserCoverLetterById,
  getTemplateStats,
  duplicateUserCoverLetter,
};
