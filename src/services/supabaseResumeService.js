import { supabase } from '../config/supabase'

/**
 * Supabase Resume Service
 * Handles all database operations for resumes
 */

// Fetch all resumes for the current user
export const fetchUserResumes = async (userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  return { data, error }
}

// Fetch a single resume by ID
export const fetchResumeById = async (resumeId, userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single()

  return { data, error }
}

// Create a new resume
export const createResume = async (userId, resumeData, currentTemplate, templateCustomization, title = 'My Resume') => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      title,
      resume_data: resumeData,
      current_template: currentTemplate,
      template_customization: templateCustomization
    })
    .select()
    .single()

  return { data, error }
}

// Update an existing resume
export const updateResume = async (resumeId, userId, resumeData, currentTemplate, templateCustomization, title) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const updateData = {
    resume_data: resumeData,
    current_template: currentTemplate,
    template_customization: templateCustomization,
  }

  if (title) {
    updateData.title = title
  }

  const { data, error } = await supabase
    .from('resumes')
    .update(updateData)
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

// Delete a resume
export const deleteResume = async (resumeId, userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId)

  return { data, error }
}

// Upsert resume (create if doesn't exist, update if it does)
export const upsertResume = async (resumeId, userId, resumeData, currentTemplate, templateCustomization, title = 'My Resume') => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  if (resumeId) {
    // Update existing
    return await updateResume(resumeId, userId, resumeData, currentTemplate, templateCustomization, title)
  } else {
    // Create new
    return await createResume(userId, resumeData, currentTemplate, templateCustomization, title)
  }
}

// Check if user has any resumes
export const hasResumes = async (userId) => {
  if (!userId) return { count: 0, error: new Error('User not authenticated') }

  const { count, error } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return { count, error }
}

// Migrate localStorage data to Supabase (first login)
export const migrateLocalStorageToSupabase = async (userId, resumeData, currentTemplate, templateCustomization) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  // Check if user already has resumes
  const { count, error: countError } = await hasResumes(userId)

  if (countError) return { data: null, error: countError }

  // If user has no resumes, create one from localStorage data
  if (count === 0) {
    return await createResume(
      userId,
      resumeData,
      currentTemplate,
      templateCustomization,
      'My Resume (Imported from localStorage)'
    )
  }

  // User already has resumes, don't migrate
  return { data: null, error: null, skipped: true }
}
