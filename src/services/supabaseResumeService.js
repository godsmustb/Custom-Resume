import { supabase } from '../config/supabase'

/**
 * Supabase Resume Service
 * Handles all database operations for resumes, folders, and version history
 */

// ============================================
// RESUME OPERATIONS
// ============================================

// Fetch all resumes for the current user
export const fetchUserResumes = async (userId, options = {}) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { folderId = null, includeArchived = false, sortBy = 'updated_at', sortAsc = false } = options

  let query = supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)

  // Filter by folder
  if (folderId === 'all') {
    // All resumes (no folder filter)
  } else if (folderId === 'archived') {
    query = query.eq('is_archived', true)
  } else if (folderId) {
    query = query.eq('folder_id', folderId).eq('is_archived', false)
  } else {
    // Default: unfiled resumes (folder_id is null) and not archived
    query = query.is('folder_id', null).eq('is_archived', false)
  }

  // Don't include archived unless specifically requested
  if (!includeArchived && folderId !== 'archived') {
    query = query.eq('is_archived', false)
  }

  query = query.order(sortBy, { ascending: sortAsc })

  const { data, error } = await query

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
export const createResume = async (userId, resumeData, currentTemplate, templateCustomization, title = 'My Resume', folderId = null) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      title,
      resume_data: resumeData,
      current_template: currentTemplate,
      template_customization: templateCustomization,
      folder_id: folderId,
      is_archived: false
    })
    .select()
    .single()

  return { data, error }
}

// Update an existing resume
export const updateResume = async (resumeId, userId, resumeData, currentTemplate, templateCustomization, title, changeType = 'manual_edit') => {
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

// Move resume to folder
export const moveResumeToFolder = async (resumeId, userId, folderId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resumes')
    .update({ folder_id: folderId })
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

// Archive resume
export const archiveResume = async (resumeId, userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resumes')
    .update({
      is_archived: true,
      archived_at: new Date().toISOString()
    })
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

// Unarchive resume
export const unarchiveResume = async (resumeId, userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resumes')
    .update({
      is_archived: false,
      archived_at: null
    })
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
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

// ============================================
// FOLDER OPERATIONS
// ============================================

// Fetch all folders for user
export const fetchUserFolders = async (userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .rpc('get_user_folder_tree', { p_user_id: userId })

  // Fallback if RPC doesn't exist yet
  if (error && error.code === '42883') {
    // Function doesn't exist, use direct query
    const { data: folders, error: queryError } = await supabase
      .from('resume_folders')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (queryError) return { data: null, error: queryError }

    // Get resume counts manually
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const { count } = await supabase
          .from('resumes')
          .select('*', { count: 'exact', head: true })
          .eq('folder_id', folder.id)
          .eq('is_archived', false)
        return { ...folder, resume_count: count || 0 }
      })
    )

    return { data: foldersWithCounts, error: null }
  }

  return { data, error }
}

// Create a new folder
export const createFolder = async (userId, name, options = {}) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const {
    description = '',
    color = '#6366f1',
    icon = 'folder',
    parentFolderId = null
  } = options

  const { data, error } = await supabase
    .from('resume_folders')
    .insert({
      user_id: userId,
      name,
      description,
      color,
      icon,
      parent_folder_id: parentFolderId
    })
    .select()
    .single()

  return { data, error }
}

// Update a folder
export const updateFolder = async (folderId, userId, updates) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resume_folders')
    .update(updates)
    .eq('id', folderId)
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

// Delete a folder (moves resumes to unfiled)
export const deleteFolder = async (folderId, userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  // First, move all resumes in this folder to unfiled
  await supabase
    .from('resumes')
    .update({ folder_id: null })
    .eq('folder_id', folderId)
    .eq('user_id', userId)

  // Then delete the folder
  const { data, error } = await supabase
    .from('resume_folders')
    .delete()
    .eq('id', folderId)
    .eq('user_id', userId)

  return { data, error }
}

// Reorder folders
export const reorderFolders = async (userId, folderOrders) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  // folderOrders is an array of { id, sort_order }
  const updates = folderOrders.map(({ id, sort_order }) =>
    supabase
      .from('resume_folders')
      .update({ sort_order })
      .eq('id', id)
      .eq('user_id', userId)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  return {
    success: errors.length === 0,
    error: errors.length > 0 ? errors[0].error : null
  }
}

// ============================================
// VERSION HISTORY OPERATIONS
// ============================================

// Fetch version history for a resume
export const fetchResumeVersions = async (resumeId, userId, limit = 50) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resume_versions')
    .select('id, version_number, version_label, change_type, change_summary, created_at')
    .eq('resume_id', resumeId)
    .eq('user_id', userId)
    .order('version_number', { ascending: false })
    .limit(limit)

  return { data, error }
}

// Fetch a specific version with full data
export const fetchVersionById = async (versionId, userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resume_versions')
    .select('*')
    .eq('id', versionId)
    .eq('user_id', userId)
    .single()

  return { data, error }
}

// Create a manual version snapshot (before major changes)
export const createVersionSnapshot = async (resumeId, userId, label = '', changeType = 'manual_edit') => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  // Get the current resume data
  const { data: resume, error: resumeError } = await fetchResumeById(resumeId, userId)
  if (resumeError) return { data: null, error: resumeError }

  // Get next version number
  const { data: versions } = await supabase
    .from('resume_versions')
    .select('version_number')
    .eq('resume_id', resumeId)
    .order('version_number', { ascending: false })
    .limit(1)

  const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1

  // Create the version
  const { data, error } = await supabase
    .from('resume_versions')
    .insert({
      resume_id: resumeId,
      user_id: userId,
      version_number: nextVersion,
      version_label: label,
      resume_data: resume.resume_data,
      current_template: resume.current_template,
      template_customization: resume.template_customization,
      change_type: changeType,
      change_summary: label || `Version ${nextVersion}`
    })
    .select()
    .single()

  return { data, error }
}

// Restore a specific version
export const restoreVersion = async (versionId, userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  // Try using the database function first
  const { data: rpcResult, error: rpcError } = await supabase
    .rpc('restore_resume_version', {
      p_version_id: versionId,
      p_user_id: userId
    })

  // Fallback if RPC doesn't exist
  if (rpcError && rpcError.code === '42883') {
    // Get the version data
    const { data: version, error: versionError } = await fetchVersionById(versionId, userId)
    if (versionError) return { data: null, error: versionError }

    // Update the resume with version data
    const { data, error } = await supabase
      .from('resumes')
      .update({
        resume_data: version.resume_data,
        current_template: version.current_template,
        template_customization: version.template_customization,
        updated_at: new Date().toISOString()
      })
      .eq('id', version.resume_id)
      .eq('user_id', userId)
      .select()
      .single()

    return { data, error }
  }

  if (rpcError) return { data: null, error: rpcError }

  // Fetch the updated resume
  if (rpcResult?.success) {
    return await fetchResumeById(rpcResult.resume_id, userId)
  }

  return { data: null, error: new Error(rpcResult?.error || 'Failed to restore version') }
}

// Update version label
export const updateVersionLabel = async (versionId, userId, label) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('resume_versions')
    .update({ version_label: label })
    .eq('id', versionId)
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

// Delete old versions (keep last N versions)
export const pruneVersions = async (resumeId, userId, keepCount = 20) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  // Get versions to delete (older than keepCount)
  const { data: versions, error: fetchError } = await supabase
    .from('resume_versions')
    .select('id')
    .eq('resume_id', resumeId)
    .eq('user_id', userId)
    .order('version_number', { ascending: false })
    .range(keepCount, 1000) // Get versions beyond keepCount

  if (fetchError) return { data: null, error: fetchError }

  if (versions && versions.length > 0) {
    const idsToDelete = versions.map(v => v.id)

    const { error } = await supabase
      .from('resume_versions')
      .delete()
      .in('id', idsToDelete)
      .eq('user_id', userId)

    return { deleted: idsToDelete.length, error }
  }

  return { deleted: 0, error: null }
}

// Compare two versions (returns both for client-side diff)
export const compareVersions = async (versionId1, versionId2, userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  const [v1, v2] = await Promise.all([
    fetchVersionById(versionId1, userId),
    fetchVersionById(versionId2, userId)
  ])

  if (v1.error) return { data: null, error: v1.error }
  if (v2.error) return { data: null, error: v2.error }

  return {
    data: {
      version1: v1.data,
      version2: v2.data
    },
    error: null
  }
}

// Get version count for a resume
export const getVersionCount = async (resumeId, userId) => {
  if (!userId) return { count: 0, error: new Error('User not authenticated') }

  const { count, error } = await supabase
    .from('resume_versions')
    .select('*', { count: 'exact', head: true })
    .eq('resume_id', resumeId)
    .eq('user_id', userId)

  return { count, error }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get resume statistics for user
export const getResumeStats = async (userId) => {
  if (!userId) return { data: null, error: new Error('User not authenticated') }

  // Get counts
  const [totalResult, archivedResult, folderResult] = await Promise.all([
    supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_archived', false),
    supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_archived', true),
    supabase
      .from('resume_folders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
  ])

  return {
    data: {
      totalResumes: totalResult.count || 0,
      archivedResumes: archivedResult.count || 0,
      folderCount: folderResult.count || 0
    },
    error: totalResult.error || archivedResult.error || folderResult.error
  }
}

// Export functions for backward compatibility
export default {
  // Resume operations
  fetchUserResumes,
  fetchResumeById,
  createResume,
  updateResume,
  deleteResume,
  upsertResume,
  moveResumeToFolder,
  archiveResume,
  unarchiveResume,
  hasResumes,
  migrateLocalStorageToSupabase,

  // Folder operations
  fetchUserFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  reorderFolders,

  // Version operations
  fetchResumeVersions,
  fetchVersionById,
  createVersionSnapshot,
  restoreVersion,
  updateVersionLabel,
  pruneVersions,
  compareVersions,
  getVersionCount,

  // Utilities
  getResumeStats
}
