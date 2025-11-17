// Resume Analyzer - Generates improvement suggestions
import { getSkillsByRole } from './skillsSuggestions'

export const analyzeResume = (resumeData) => {
  const suggestions = []

  // Analyze job title and suggest missing skills
  const jobTitle = resumeData.experience?.[0]?.title || ''
  if (jobTitle) {
    const recommendedSkills = getSkillsByRole(jobTitle)
    const currentSkills = resumeData.skills.flatMap(cat => cat.skills)

    const missingSkills = recommendedSkills
      .filter(skill => !currentSkills.some(s => s.toLowerCase() === skill.toLowerCase()))
      .slice(0, 8)

    missingSkills.forEach(skill => {
      suggestions.push({
        type: 'skill',
        category: 'Skills',
        title: `Add "${skill}" to your skills`,
        description: `This skill is highly relevant for ${jobTitle} positions`,
        action: 'add',
        value: skill,
        priority: 'high'
      })
    })
  }

  // Suggest adding certifications if none exist
  if (!resumeData.certifications || resumeData.certifications.length === 0) {
    const certSuggestions = getCertificationSuggestions(jobTitle)
    certSuggestions.forEach(cert => {
      suggestions.push({
        type: 'certification',
        category: 'Certifications',
        title: `Add "${cert.name}" certification`,
        description: cert.description,
        action: 'add',
        value: cert,
        priority: 'medium'
      })
    })
  }

  // Suggest quantifying achievements if descriptions lack numbers
  resumeData.experience?.forEach((exp, expIndex) => {
    exp.description?.forEach((desc, descIndex) => {
      if (!containsNumbers(desc)) {
        suggestions.push({
          type: 'quantify',
          category: 'Experience',
          title: 'Add measurable results to this achievement',
          description: `"${truncateText(desc, 50)}"`,
          action: 'improve',
          value: {
            expIndex,
            descIndex,
            original: desc,
            suggestion: generateQuantifiedVersion(desc)
          },
          priority: 'high'
        })
      }
    })
  })

  // Suggest adding action verbs if descriptions are weak
  resumeData.experience?.forEach((exp, expIndex) => {
    exp.description?.forEach((desc, descIndex) => {
      if (hasWeakStart(desc)) {
        suggestions.push({
          type: 'strengthen',
          category: 'Experience',
          title: 'Use stronger action verb',
          description: `"${truncateText(desc, 50)}"`,
          action: 'improve',
          value: {
            expIndex,
            descIndex,
            original: desc,
            suggestion: strengthenBulletPoint(desc)
          },
          priority: 'medium'
        })
      }
    })
  })

  // Suggest adding portfolio/GitHub if missing
  if (!resumeData.personal?.github?.trim()) {
    suggestions.push({
      type: 'profile',
      category: 'Contact',
      title: 'Add your GitHub profile link',
      description: 'Showcase your projects and code to employers',
      action: 'add',
      value: { field: 'github', placeholder: 'https://github.com/yourusername' },
      priority: 'medium'
    })
  }

  if (!resumeData.personal?.portfolio?.trim()) {
    suggestions.push({
      type: 'profile',
      category: 'Contact',
      title: 'Add your portfolio website',
      description: 'Display your work and projects professionally',
      action: 'add',
      value: { field: 'portfolio', placeholder: 'https://yourportfolio.com' },
      priority: 'medium'
    })
  }

  if (!resumeData.personal?.linkedin?.trim()) {
    suggestions.push({
      type: 'profile',
      category: 'Contact',
      title: 'Add your LinkedIn profile',
      description: 'Essential for networking and job opportunities',
      action: 'add',
      value: { field: 'linkedin', placeholder: 'https://linkedin.com/in/yourname' },
      priority: 'high'
    })
  }

  // Suggest adding more experience bullet points if too few
  resumeData.experience?.forEach((exp, expIndex) => {
    if (exp.description && exp.description.length < 3) {
      suggestions.push({
        type: 'expand',
        category: 'Experience',
        title: `Add more details to ${exp.title} role`,
        description: 'Aim for 3-5 bullet points per position',
        action: 'add',
        value: {
          expIndex,
          suggestion: generateAdditionalBullets(exp)
        },
        priority: 'medium'
      })
    }
  })

  // Suggest technical skills based on job title
  if (jobTitle.toLowerCase().includes('developer') || jobTitle.toLowerCase().includes('engineer')) {
    const technicalSkills = [
      'Git Version Control',
      'CI/CD Pipelines',
      'Code Review',
      'Unit Testing',
      'API Integration',
      'Debugging',
      'Problem Solving',
      'Agile Methodology'
    ]

    const currentSkills = resumeData.skills.flatMap(cat => cat.skills)
    technicalSkills.forEach(skill => {
      if (!currentSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        suggestions.push({
          type: 'skill',
          category: 'Skills',
          title: `Add "${skill}"`,
          description: 'Essential technical skill for developers',
          action: 'add',
          value: skill,
          priority: 'high'
        })
      }
    })
  }

  // Sort by priority: high, medium, low
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return suggestions.slice(0, 15) // Return top 15 suggestions
}

// Helper functions
const containsNumbers = (text) => {
  return /\d/.test(text)
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const hasWeakStart = (text) => {
  const weakVerbs = ['responsible for', 'worked on', 'helped with', 'was involved', 'duties included']
  return weakVerbs.some(verb => text.toLowerCase().startsWith(verb))
}

const generateQuantifiedVersion = (text) => {
  // Generate example with numbers
  const examples = [
    `Increased efficiency by 30% through ${text.toLowerCase()}`,
    `${text} resulting in 25% improvement`,
    `Led team of 5 to ${text.toLowerCase()}`,
    `Achieved 40% growth by ${text.toLowerCase()}`,
    `Reduced costs by $50K through ${text.toLowerCase()}`
  ]
  return examples[Math.floor(Math.random() * examples.length)]
}

const strengthenBulletPoint = (text) => {
  const strongVerbs = [
    'Spearheaded', 'Orchestrated', 'Engineered', 'Architected', 'Pioneered',
    'Championed', 'Optimized', 'Streamlined', 'Accelerated', 'Transformed'
  ]
  const verb = strongVerbs[Math.floor(Math.random() * strongVerbs.length)]
  return `${verb} ${text.replace(/^.*?\s/, '').toLowerCase()}`
}

const generateAdditionalBullets = (experience) => {
  return [
    `Collaborated with cross-functional teams to deliver projects`,
    `Implemented best practices and coding standards`,
    `Mentored junior team members and conducted code reviews`
  ]
}

const getCertificationSuggestions = (jobTitle) => {
  const title = jobTitle.toLowerCase()

  if (title.includes('project manager') || title.includes('product')) {
    return [
      { name: 'PMP (Project Management Professional)', description: 'Industry-standard certification for project managers' },
      { name: 'Certified Scrum Master (CSM)', description: 'Essential for Agile project management' },
      { name: 'SAFe Agilist', description: 'Scaled Agile Framework certification' }
    ]
  }

  if (title.includes('developer') || title.includes('engineer')) {
    return [
      { name: 'AWS Certified Developer', description: 'Demonstrates cloud development expertise' },
      { name: 'Azure Developer Associate', description: 'Microsoft cloud development certification' },
      { name: 'Google Cloud Professional Developer', description: 'Google Cloud Platform certification' }
    ]
  }

  if (title.includes('data')) {
    return [
      { name: 'AWS Certified Data Analytics', description: 'Specialty certification for data analytics' },
      { name: 'Google Data Analytics Certificate', description: 'Professional data analytics certification' },
      { name: 'Microsoft Certified: Data Analyst Associate', description: 'Power BI and data analysis certification' }
    ]
  }

  if (title.includes('security')) {
    return [
      { name: 'CISSP (Certified Information Systems Security Professional)', description: 'Top cybersecurity certification' },
      { name: 'CompTIA Security+', description: 'Foundational security certification' },
      { name: 'CEH (Certified Ethical Hacker)', description: 'Ethical hacking certification' }
    ]
  }

  return [
    { name: 'Professional Certification', description: 'Relevant industry certification for your field' },
    { name: 'Online Course Completion', description: 'Coursera, Udemy, or LinkedIn Learning certificate' }
  ]
}

export default analyzeResume
