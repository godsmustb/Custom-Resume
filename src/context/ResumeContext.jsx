import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
  fetchUserResumes,
  createResume,
  updateResume,
  deleteResume,
  migrateLocalStorageToSupabase
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
    return savedTemplate || 'ats-simple-minimal'
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
      console.log('✅ Saved to Supabase')
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

  // Load resumes when user authenticates
  useEffect(() => {
    if (!user) {
      // User logged out - clear Supabase state
      setCurrentResumeId(null)
      setUserResumes([])
      setSyncStatus('idle')
      return
    }

    // User logged in - load resumes from Supabase
    const loadResumes = async () => {
      setLoading(true)

      // Migrate localStorage data if first login
      if (!hasMigrated) {
        const { data: migratedResume, error: migrateError, skipped } = await migrateLocalStorageToSupabase(
          user.id,
          resumeData,
          currentTemplate,
          templateCustomization
        )

        if (!migrateError && !skipped) {
          console.log('✅ Migrated localStorage data to Supabase')
          localStorage.setItem('supabaseMigrated', 'true')
          setHasMigrated(true)

          if (migratedResume) {
            setCurrentResumeId(migratedResume.id)
            setCurrentResumeTitle(migratedResume.title)
          }
        }
      }

      // Fetch all resumes
      const { data: resumes, error } = await fetchUserResumes(user.id)

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
          setCurrentTemplateState(latestResume.current_template || 'ats-simple-minimal')
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
  }, [user, hasMigrated])

  // Resume management functions
  const createNewResume = async (title = 'New Resume') => {
    if (!user) {
      alert('Please sign in to create multiple resumes')
      return
    }

    setLoading(true)
    const { data, error } = await createResume(
      user.id,
      initialResumeData,
      'ats-simple-minimal',
      {
        colorScheme: 'corporate-blue',
        font: 'inter',
        spacing: 'comfortable'
      },
      title
    )

    if (error) {
      console.error('Error creating resume:', error)
      alert('Failed to create new resume')
    } else {
      setUserResumes(prev => [data, ...prev])
      setCurrentResumeId(data.id)
      setCurrentResumeTitle(data.title)
      setResumeData(initialResumeData)
      setCurrentTemplateState('ats-simple-minimal')
      setTemplateCustomizationState({
        colorScheme: 'corporate-blue',
        font: 'inter',
        spacing: 'comfortable'
      })
    }

    setLoading(false)
  }

  const switchResume = async (resumeId) => {
    const resume = userResumes.find(r => r.id === resumeId)
    if (!resume) return

    setCurrentResumeId(resume.id)
    setCurrentResumeTitle(resume.title)
    setResumeData(resume.resume_data)
    setCurrentTemplateState(resume.current_template || 'ats-simple-minimal')
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
    }
  }

  // Original CRUD functions (unchanged)
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

    // Resume management
    createNewResume,
    switchResume,
    renameResume,
    deleteCurrentResume,
    duplicateResume,
    saveToSupabase,

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
