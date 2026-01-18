import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
  fetchUserResumes,
  fetchResumeById,
  createResume,
  updateResume,
  deleteResume,
  migrateLocalStorageToSupabase,
  moveResumeToFolder,
  archiveResume as archiveResumeService,
  unarchiveResume as unarchiveResumeService,
  fetchUserFolders,
  createFolder as createFolderService,
  updateFolder as updateFolderService,
  deleteFolder as deleteFolderService,
  fetchResumeVersions,
  fetchVersionById,
  createVersionSnapshot,
  restoreVersion as restoreVersionService,
  updateVersionLabel,
  getVersionCount
} from '../services/supabaseResumeService'

const ResumeContext = createContext()

export const useResume = () => {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}

const initialResumeData = {
  personal: {
    name: 'Your Name',
    title: 'Professional Title',
    email: 'email@example.com',
    phone: '(123) 456-7890',
    location: 'City, State',
    linkedin: 'https://linkedin.com/in/yourprofile',
    github: 'https://github.com/yourusername',
    portfolio: 'https://yourportfolio.com'
  },
  about: 'Experienced professional with a strong background in [your field]. Passionate about [key areas of expertise] and committed to delivering high-quality results. Proven track record of [key achievements].',
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Company Inc.',
      date: '2022 - Present',
      description: [
        'Led development of key features that improved user engagement by 40%',
        'Mentored junior developers and conducted code reviews',
        'Architected scalable solutions using modern technologies'
      ]
    },
    {
      id: '2',
      title: 'Software Engineer',
      company: 'Startup Solutions',
      date: '2019 - 2021',
      description: [
        'Developed and maintained full-stack web applications',
        'Collaborated with cross-functional teams to deliver projects on time',
        'Implemented automated testing to improve code quality'
      ]
    }
  ],
  education: [
    {
      id: '1',
      degree: 'Bachelor of Science in Computer Science',
      school: 'University Name',
      date: '2015 - 2019',
      details: 'Relevant coursework: Data Structures, Algorithms, Web Development'
    }
  ],
  skills: [
    {
      category: 'Frontend',
      skills: ['React', 'JavaScript/TypeScript', 'HTML/CSS', 'Tailwind CSS', 'Redux']
    },
    {
      category: 'Backend',
      skills: ['Node.js', 'Express', 'Python', 'REST APIs', 'GraphQL']
    },
    {
      category: 'Tools & Other',
      skills: ['Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Agile']
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
      credentialId: 'ABC123456',
      credentialUrl: 'https://aws.amazon.com/verification'
    }
  ],
  jobDescription: ''
}

export const ResumeProvider = ({ children }) => {
  const { user } = useAuth()

  // Core resume state
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('resumeData')
    if (saved) {
      const parsedData = JSON.parse(saved)
      if (!parsedData.certifications) {
        parsedData.certifications = []
      }
      return parsedData
    }
    return initialResumeData
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentTemplate, setCurrentTemplateState] = useState(() => {
    const savedTemplate = localStorage.getItem('currentTemplate')
    return savedTemplate || 'professional-project-manager'
  })

  const [templateCustomization, setTemplateCustomizationState] = useState(() => {
    const saved = localStorage.getItem('templateCustomization')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      colorScheme: 'corporate-blue',
      font: 'inter',
      spacing: 'comfortable'
    }
  })

  // Supabase-specific state
  const [currentResumeId, setCurrentResumeId] = useState(null)
  const [currentResumeTitle, setCurrentResumeTitle] = useState('My Resume')
  const [userResumes, setUserResumes] = useState([])
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, synced, error
  const [hasMigrated, setHasMigrated] = useState(() => {
    return localStorage.getItem('supabaseMigrated') === 'true'
  })

  // Folder state
  const [folders, setFolders] = useState([])
  const [currentFolderId, setCurrentFolderId] = useState(null) // null = "All Resumes", 'archived' = Archived
  const [folderLoading, setFolderLoading] = useState(false)

  // Version history state
  const [versions, setVersions] = useState([])
  const [versionCount, setVersionCount] = useState(0)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [versionLoading, setVersionLoading] = useState(false)

  // Debounce timer ref
  const saveTimerRef = useRef(null)

  // Save to localStorage (immediate, for offline support)
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData))
  }, [resumeData])

  useEffect(() => {
    localStorage.setItem('currentTemplate', currentTemplate)
  }, [currentTemplate])

  useEffect(() => {
    localStorage.setItem('templateCustomization', JSON.stringify(templateCustomization))
  }, [templateCustomization])

  // Auto-save to Supabase (debounced)
  const saveToSupabase = useCallback(async () => {
    if (!user || !currentResumeId) return

    setSyncStatus('syncing')
    const { data, error } = await updateResume(
      currentResumeId,
      user.id,
      resumeData,
      currentTemplate,
      templateCustomization,
      currentResumeTitle
    )

    if (error) {
      console.error('Error saving to Supabase:', error)
      setSyncStatus('error')
    } else {
      setSyncStatus('synced')
      // Update local state with the returned data
      if (data) {
        setUserResumes(prev =>
          prev.map(r => r.id === currentResumeId ? { ...r, ...data } : r)
        )
      }
    }
  }, [user, currentResumeId, resumeData, currentTemplate, templateCustomization, currentResumeTitle])

  // Debounced save effect
  useEffect(() => {
    if (!user || !currentResumeId) return

    // Clear previous timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    // Set new timer (2 second debounce)
    saveTimerRef.current = setTimeout(() => {
      saveToSupabase()
    }, 2000)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [resumeData, currentTemplate, templateCustomization, user, currentResumeId, saveToSupabase])

  // Load folders when user authenticates
  const loadFolders = useCallback(async () => {
    if (!user) return
    setFolderLoading(true)
    const { data, error } = await fetchUserFolders(user.id)
    if (error) {
      console.error('Error fetching folders:', error)
    } else {
      setFolders(data || [])
    }
    setFolderLoading(false)
  }, [user])

  // Load resumes when user authenticates
  useEffect(() => {
    if (!user) {
      // User logged out - clear Supabase state
      setCurrentResumeId(null)
      setUserResumes([])
      setFolders([])
      setVersions([])
      setSyncStatus('idle')
      setCurrentFolderId(null)
      return
    }

    // User logged in - load resumes from Supabase
    const loadResumes = async () => {
      setLoading(true)

      // Load folders first
      await loadFolders()

      // Migrate localStorage data if first login
      if (!hasMigrated) {
        const { data: migratedResume, error: migrateError, skipped } = await migrateLocalStorageToSupabase(
          user.id,
          resumeData,
          currentTemplate,
          templateCustomization
        )

        if (!migrateError && !skipped) {
          localStorage.setItem('supabaseMigrated', 'true')
          setHasMigrated(true)

          if (migratedResume) {
            setCurrentResumeId(migratedResume.id)
            setCurrentResumeTitle(migratedResume.title)
          }
        }
      }

      // Fetch all resumes (unfiled by default)
      const { data: resumes, error } = await fetchUserResumes(user.id, { folderId: 'all' })

      if (error) {
        console.error('Error fetching resumes:', error)
      } else if (resumes && resumes.length > 0) {
        setUserResumes(resumes)

        // If no current resume, load the most recent one
        if (!currentResumeId) {
          const latestResume = resumes[0] // Already sorted by updated_at desc
          setCurrentResumeId(latestResume.id)
          setCurrentResumeTitle(latestResume.title)
          setResumeData(latestResume.resume_data)
          setCurrentTemplateState(latestResume.current_template || 'professional-project-manager')
          setTemplateCustomizationState(latestResume.template_customization || {
            colorScheme: 'corporate-blue',
            font: 'inter',
            spacing: 'comfortable'
          })
        }
      }

      setLoading(false)
    }

    loadResumes()
  }, [user, hasMigrated, loadFolders])

  // Load version history when current resume changes
  const loadVersionHistory = useCallback(async () => {
    if (!user || !currentResumeId) {
      setVersions([])
      setVersionCount(0)
      return
    }

    setVersionLoading(true)
    const [versionsResult, countResult] = await Promise.all([
      fetchResumeVersions(currentResumeId, user.id, 50),
      getVersionCount(currentResumeId, user.id)
    ])

    if (versionsResult.error) {
      console.error('Error fetching versions:', versionsResult.error)
    } else {
      setVersions(versionsResult.data || [])
    }

    if (!countResult.error) {
      setVersionCount(countResult.count || 0)
    }

    setVersionLoading(false)
  }, [user, currentResumeId])

  // Load versions when resume changes
  useEffect(() => {
    loadVersionHistory()
  }, [currentResumeId, loadVersionHistory])

  // ============================================
  // RESUME MANAGEMENT FUNCTIONS
  // ============================================

  const createNewResume = async (title = 'New Resume', folderId = null) => {
    if (!user) {
      alert('Please sign in to create multiple resumes')
      return
    }

    setLoading(true)
    const { data, error } = await createResume(
      user.id,
      initialResumeData,
      'professional-project-manager',
      {
        colorScheme: 'corporate-blue',
        font: 'inter',
        spacing: 'comfortable'
      },
      title,
      folderId
    )

    if (error) {
      console.error('Error creating resume:', error)
      alert('Failed to create new resume')
    } else {
      setUserResumes(prev => [data, ...prev])
      setCurrentResumeId(data.id)
      setCurrentResumeTitle(data.title)
      setResumeData(initialResumeData)
      setCurrentTemplateState('professional-project-manager')
      setTemplateCustomizationState({
        colorScheme: 'corporate-blue',
        font: 'inter',
        spacing: 'comfortable'
      })
      // Reload folders to update counts
      await loadFolders()
    }

    setLoading(false)
  }

  const createNewResumeFromData = async (title, customResumeData, template = 'professional-project-manager', customization = {
    colorScheme: 'corporate-blue',
    font: 'inter',
    spacing: 'comfortable'
  }, folderId = null) => {
    if (!user) {
      alert('Please sign in to create multiple resumes')
      return { success: false, error: 'Not authenticated' }
    }

    setLoading(true)
    const { data, error } = await createResume(
      user.id,
      customResumeData,
      template,
      customization,
      title,
      folderId
    )

    if (error) {
      console.error('Error creating resume from data:', error)
      setLoading(false)
      return { success: false, error: error.message }
    } else {
      setUserResumes(prev => [data, ...prev])
      setCurrentResumeId(data.id)
      setCurrentResumeTitle(data.title)
      setResumeData(customResumeData)
      setCurrentTemplateState(template)
      setTemplateCustomizationState(customization)
      await loadFolders()
      setLoading(false)
      return { success: true, data }
    }
  }

  const switchResume = async (resumeId) => {
    const resume = userResumes.find(r => r.id === resumeId)
    if (!resume) {
      // Try to fetch it from database
      if (user) {
        const { data, error } = await fetchResumeById(resumeId, user.id)
        if (error || !data) return

        setCurrentResumeId(data.id)
        setCurrentResumeTitle(data.title)
        setResumeData(data.resume_data)
        setCurrentTemplateState(data.current_template || 'professional-project-manager')
        setTemplateCustomizationState(data.template_customization || {
          colorScheme: 'corporate-blue',
          font: 'inter',
          spacing: 'comfortable'
        })
        return
      }
      return
    }

    setCurrentResumeId(resume.id)
    setCurrentResumeTitle(resume.title)
    setResumeData(resume.resume_data)
    setCurrentTemplateState(resume.current_template || 'professional-project-manager')
    setTemplateCustomizationState(resume.template_customization || {
      colorScheme: 'corporate-blue',
      font: 'inter',
      spacing: 'comfortable'
    })
  }

  const renameResume = async (resumeId, newTitle) => {
    if (!user) return

    const { data, error } = await updateResume(
      resumeId,
      user.id,
      resumeData,
      currentTemplate,
      templateCustomization,
      newTitle
    )

    if (error) {
      console.error('Error renaming resume:', error)
    } else {
      setUserResumes(prev =>
        prev.map(r => r.id === resumeId ? { ...r, title: newTitle } : r)
      )
      if (currentResumeId === resumeId) {
        setCurrentResumeTitle(newTitle)
      }
    }
  }

  const deleteCurrentResume = async () => {
    if (!user || !currentResumeId) return

    if (userResumes.length === 1) {
      alert('Cannot delete your only resume')
      return
    }

    if (!confirm('Are you sure you want to delete this resume?')) {
      return
    }

    const { error } = await deleteResume(currentResumeId, user.id)

    if (error) {
      console.error('Error deleting resume:', error)
      alert('Failed to delete resume')
    } else {
      const remaining = userResumes.filter(r => r.id !== currentResumeId)
      setUserResumes(remaining)

      // Switch to the next resume
      if (remaining.length > 0) {
        await switchResume(remaining[0].id)
      }
      await loadFolders()
    }
  }

  const duplicateResume = async () => {
    if (!user) {
      alert('Please sign in to duplicate resumes')
      return
    }

    const { data, error } = await createResume(
      user.id,
      resumeData,
      currentTemplate,
      templateCustomization,
      `${currentResumeTitle} (Copy)`
    )

    if (error) {
      console.error('Error duplicating resume:', error)
      alert('Failed to duplicate resume')
    } else {
      setUserResumes(prev => [data, ...prev])
      // Optionally switch to the new copy
      await switchResume(data.id)
      await loadFolders()
    }
  }

  // ============================================
  // FOLDER MANAGEMENT FUNCTIONS
  // ============================================

  const createFolder = async (name, options = {}) => {
    if (!user) {
      alert('Please sign in to create folders')
      return { success: false }
    }

    const { data, error } = await createFolderService(user.id, name, options)
    if (error) {
      console.error('Error creating folder:', error)
      return { success: false, error }
    }

    setFolders(prev => [...prev, { ...data, resume_count: 0 }])
    return { success: true, data }
  }

  const updateFolder = async (folderId, updates) => {
    if (!user) return { success: false }

    const { data, error } = await updateFolderService(folderId, user.id, updates)
    if (error) {
      console.error('Error updating folder:', error)
      return { success: false, error }
    }

    setFolders(prev =>
      prev.map(f => f.id === folderId ? { ...f, ...updates } : f)
    )
    return { success: true, data }
  }

  const deleteFolder = async (folderId) => {
    if (!user) return { success: false }

    if (!confirm('Are you sure? Resumes in this folder will be moved to "All Resumes".')) {
      return { success: false, cancelled: true }
    }

    const { error } = await deleteFolderService(folderId, user.id)
    if (error) {
      console.error('Error deleting folder:', error)
      return { success: false, error }
    }

    setFolders(prev => prev.filter(f => f.id !== folderId))

    // Move resumes in this folder to unfiled
    setUserResumes(prev =>
      prev.map(r => r.folder_id === folderId ? { ...r, folder_id: null } : r)
    )

    // If we were viewing this folder, go back to all
    if (currentFolderId === folderId) {
      setCurrentFolderId(null)
    }

    return { success: true }
  }

  const moveToFolder = async (resumeId, folderId) => {
    if (!user) return { success: false }

    const { data, error } = await moveResumeToFolder(resumeId, user.id, folderId)
    if (error) {
      console.error('Error moving resume:', error)
      return { success: false, error }
    }

    setUserResumes(prev =>
      prev.map(r => r.id === resumeId ? { ...r, folder_id: folderId } : r)
    )

    // Reload folders to update counts
    await loadFolders()
    return { success: true, data }
  }

  const archiveResume = async (resumeId) => {
    if (!user) return { success: false }

    const { data, error } = await archiveResumeService(resumeId, user.id)
    if (error) {
      console.error('Error archiving resume:', error)
      return { success: false, error }
    }

    setUserResumes(prev =>
      prev.map(r => r.id === resumeId ? { ...r, is_archived: true } : r)
    )

    // If this was the current resume, switch to another
    if (currentResumeId === resumeId) {
      const activeResumes = userResumes.filter(r => r.id !== resumeId && !r.is_archived)
      if (activeResumes.length > 0) {
        await switchResume(activeResumes[0].id)
      }
    }

    return { success: true, data }
  }

  const unarchiveResume = async (resumeId) => {
    if (!user) return { success: false }

    const { data, error } = await unarchiveResumeService(resumeId, user.id)
    if (error) {
      console.error('Error unarchiving resume:', error)
      return { success: false, error }
    }

    setUserResumes(prev =>
      prev.map(r => r.id === resumeId ? { ...r, is_archived: false, archived_at: null } : r)
    )

    return { success: true, data }
  }

  const filterResumesByFolder = (folderId) => {
    setCurrentFolderId(folderId)
  }

  const getFilteredResumes = () => {
    if (currentFolderId === 'archived') {
      return userResumes.filter(r => r.is_archived)
    } else if (currentFolderId === 'all' || currentFolderId === null) {
      return userResumes.filter(r => !r.is_archived)
    } else {
      return userResumes.filter(r => r.folder_id === currentFolderId && !r.is_archived)
    }
  }

  // ============================================
  // VERSION HISTORY FUNCTIONS
  // ============================================

  const createSnapshot = async (label = '', changeType = 'manual_edit') => {
    if (!user || !currentResumeId) return { success: false }

    const { data, error } = await createVersionSnapshot(currentResumeId, user.id, label, changeType)
    if (error) {
      console.error('Error creating snapshot:', error)
      return { success: false, error }
    }

    // Reload versions
    await loadVersionHistory()
    return { success: true, data }
  }

  const restoreVersion = async (versionId) => {
    if (!user) return { success: false }

    if (!confirm('Are you sure you want to restore this version? Current changes will be saved as a new version.')) {
      return { success: false, cancelled: true }
    }

    setVersionLoading(true)
    const { data, error } = await restoreVersionService(versionId, user.id)
    if (error) {
      console.error('Error restoring version:', error)
      setVersionLoading(false)
      return { success: false, error }
    }

    // Update current state with restored data
    if (data) {
      setResumeData(data.resume_data)
      setCurrentTemplateState(data.current_template || 'professional-project-manager')
      setTemplateCustomizationState(data.template_customization || {
        colorScheme: 'corporate-blue',
        font: 'inter',
        spacing: 'comfortable'
      })

      // Update in userResumes
      setUserResumes(prev =>
        prev.map(r => r.id === data.id ? data : r)
      )
    }

    // Reload version history
    await loadVersionHistory()
    setVersionLoading(false)
    return { success: true, data }
  }

  const getVersionDetails = async (versionId) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }
    return await fetchVersionById(versionId, user.id)
  }

  const labelVersion = async (versionId, label) => {
    if (!user) return { success: false }

    const { data, error } = await updateVersionLabel(versionId, user.id, label)
    if (error) {
      console.error('Error labeling version:', error)
      return { success: false, error }
    }

    setVersions(prev =>
      prev.map(v => v.id === versionId ? { ...v, version_label: label } : v)
    )
    return { success: true, data }
  }

  // ============================================
  // ORIGINAL CRUD FUNCTIONS
  // ============================================

  const setCurrentTemplate = (templateId) => {
    setCurrentTemplateState(templateId)
  }

  const setTemplateCustomization = (customization) => {
    setTemplateCustomizationState(prev => ({
      ...prev,
      ...customization
    }))
  }

  const updatePersonal = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }))
  }

  const updateAbout = (value) => {
    setResumeData(prev => ({ ...prev, about: value }))
  }

  const updateExperience = (index, field, value) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience]
      newExperience[index] = { ...newExperience[index], [field]: value }
      return { ...prev, experience: newExperience }
    })
  }

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      title: '',
      company: '',
      date: '',
      description: ['']
    }
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }))
  }

  const removeExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateExperienceDescription = (expIndex, descIndex, value) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience]
      const newDescription = [...newExperience[expIndex].description]
      newDescription[descIndex] = value
      newExperience[expIndex] = { ...newExperience[expIndex], description: newDescription }
      return { ...prev, experience: newExperience }
    })
  }

  const addExperienceDescription = (expIndex) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience]
      newExperience[expIndex].description.push('')
      return { ...prev, experience: newExperience }
    })
  }

  const removeExperienceDescription = (expIndex, descIndex) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience]
      newExperience[expIndex].description = newExperience[expIndex].description.filter((_, i) => i !== descIndex)
      return { ...prev, experience: newExperience }
    })
  }

  const replaceExperienceDescription = (expIndex, newDescriptionArray) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience]
      newExperience[expIndex] = {
        ...newExperience[expIndex],
        description: newDescriptionArray
      }
      return { ...prev, experience: newExperience }
    })
  }

  const updateEducation = (index, field, value) => {
    setResumeData(prev => {
      const newEducation = [...prev.education]
      newEducation[index] = { ...newEducation[index], [field]: value }
      return { ...prev, education: newEducation }
    })
  }

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: '',
      school: '',
      date: '',
      details: ''
    }
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }))
  }

  const removeEducation = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateSkills = (categoryIndex, field, value) => {
    setResumeData(prev => {
      const newSkills = [...prev.skills]
      if (field === 'category') {
        newSkills[categoryIndex].category = value
      } else if (field === 'skills') {
        newSkills[categoryIndex].skills = value
      }
      return { ...prev, skills: newSkills }
    })
  }

  const addSkillCategory = () => {
    const newCategory = {
      category: 'New Category',
      skills: []
    }
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newCategory]
    }))
  }

  const removeSkillCategory = (index) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const updateCertification = (index, field, value) => {
    setResumeData(prev => {
      const newCertifications = [...(prev.certifications || [])]
      newCertifications[index] = { ...newCertifications[index], [field]: value }
      return { ...prev, certifications: newCertifications }
    })
  }

  const addCertification = () => {
    const newCert = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      credentialId: '',
      credentialUrl: ''
    }
    setResumeData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert]
    }))
  }

  const removeCertification = (index) => {
    setResumeData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index)
    }))
  }

  const updateJobDescription = (value) => {
    setResumeData(prev => ({ ...prev, jobDescription: value }))
  }

  const resetResume = () => {
    setResumeData(initialResumeData)
    localStorage.removeItem('resumeData')
  }

  const loadResumeFromPDF = (parsedData) => {
    setResumeData(prev => ({
      ...parsedData,
      jobDescription: prev.jobDescription
    }))
  }

  const value = {
    // Original state
    resumeData,
    isEditing,
    setIsEditing,
    loading,
    setLoading,
    currentTemplate,
    setCurrentTemplate,
    templateCustomization,
    setTemplateCustomization,

    // Supabase state
    currentResumeId,
    currentResumeTitle,
    setCurrentResumeTitle,
    userResumes,
    syncStatus,

    // Folder state
    folders,
    currentFolderId,
    folderLoading,
    setCurrentFolderId,

    // Version state
    versions,
    versionCount,
    selectedVersion,
    setSelectedVersion,
    versionLoading,

    // Resume management
    createNewResume,
    createNewResumeFromData,
    switchResume,
    renameResume,
    deleteCurrentResume,
    duplicateResume,
    saveToSupabase,

    // Folder management
    createFolder,
    updateFolder,
    deleteFolder,
    moveToFolder,
    archiveResume,
    unarchiveResume,
    filterResumesByFolder,
    getFilteredResumes,
    loadFolders,

    // Version management
    createSnapshot,
    restoreVersion,
    getVersionDetails,
    labelVersion,
    loadVersionHistory,

    // Original CRUD operations
    updatePersonal,
    updateAbout,
    updateExperience,
    addExperience,
    removeExperience,
    updateExperienceDescription,
    addExperienceDescription,
    removeExperienceDescription,
    replaceExperienceDescription,
    updateEducation,
    addEducation,
    removeEducation,
    updateSkills,
    addSkillCategory,
    removeSkillCategory,
    updateCertification,
    addCertification,
    removeCertification,
    updateJobDescription,
    resetResume,
    loadResumeFromPDF
  }

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  )
}
