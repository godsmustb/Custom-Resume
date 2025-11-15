import { createContext, useContext, useState, useEffect } from 'react'

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
  const [resumeData, setResumeData] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('resumeData')
    if (saved) {
      const parsedData = JSON.parse(saved)
      // Ensure certifications array exists (for backwards compatibility)
      if (!parsedData.certifications) {
        parsedData.certifications = []
      }
      return parsedData
    }
    return initialResumeData
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData))
  }, [resumeData])

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
      jobDescription: prev.jobDescription // Keep existing job description
    }))
  }

  const value = {
    resumeData,
    isEditing,
    setIsEditing,
    loading,
    setLoading,
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
