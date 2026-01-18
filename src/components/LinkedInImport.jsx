/**
 * LinkedIn Import Component
 * Multi-step wizard to collect resume information from LinkedIn or manual entry
 */

import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import { useAuth } from '../context/AuthContext'
import { extractLinkedInData } from '../services/linkedInService'
import './LinkedInImport.css'

const WIZARD_STEPS = [
  { id: 'source', title: 'Source', icon: '🔗' },
  { id: 'personal', title: 'Personal', icon: '👤' },
  { id: 'experience', title: 'Experience', icon: '💼' },
  { id: 'education', title: 'Education', icon: '🎓' },
  { id: 'skills', title: 'Skills', icon: '🛠️' },
  { id: 'certifications', title: 'Certifications', icon: '📜' },
  { id: 'review', title: 'Review', icon: '✅' }
]

const LinkedInImport = ({ onClose }) => {
  const { loadResumeFromPDF, createNewResumeFromData } = useResume()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [importSource, setImportSource] = useState(null) // 'linkedin-url', 'linkedin-pdf', 'manual'

  // Form data state
  const [formData, setFormData] = useState({
    personal: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    about: '',
    experience: [],
    education: [],
    skills: [],
    certifications: []
  })

  // LinkedIn URL state
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [linkedInText, setLinkedInText] = useState('')

  // Handlers for navigation
  const goToNextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < WIZARD_STEPS.length) {
      setCurrentStep(stepIndex)
    }
  }

  // Handle source selection
  const handleSourceSelect = async (source) => {
    setImportSource(source)
    setError(null)

    if (source === 'linkedin-url' || source === 'linkedin-text') {
      // Will process in next step
      goToNextStep()
    } else if (source === 'manual') {
      // Skip to personal info
      goToNextStep()
    }
  }

  // Process LinkedIn data
  const processLinkedInData = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      let extractedData

      if (importSource === 'linkedin-url' && linkedInUrl) {
        extractedData = await extractLinkedInData(linkedInUrl, 'url')
      } else if (importSource === 'linkedin-text' && linkedInText) {
        extractedData = await extractLinkedInData(linkedInText, 'text')
      }

      if (extractedData) {
        setFormData(prev => ({
          ...prev,
          ...extractedData
        }))
      }

      goToNextStep()
    } catch (err) {
      setError(err.message || 'Failed to process LinkedIn data')
    } finally {
      setIsProcessing(false)
    }
  }

  // Update personal info
  const updatePersonal = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }))
  }

  // Update about/summary
  const updateAbout = (value) => {
    setFormData(prev => ({
      ...prev,
      about: value
    }))
  }

  // Experience handlers
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now(),
          title: '',
          company: '',
          date: '',
          description: ['']
        }
      ]
    }))
  }

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const addExperienceBullet = (expIndex) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex
          ? { ...exp, description: [...exp.description, ''] }
          : exp
      )
    }))
  }

  const updateExperienceBullet = (expIndex, bulletIndex, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex
          ? {
            ...exp,
            description: exp.description.map((bullet, j) =>
              j === bulletIndex ? value : bullet
            )
          }
          : exp
      )
    }))
  }

  const removeExperienceBullet = (expIndex, bulletIndex) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex
          ? {
            ...exp,
            description: exp.description.filter((_, j) => j !== bulletIndex)
          }
          : exp
      )
    }))
  }

  // Education handlers
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now(),
          degree: '',
          school: '',
          date: '',
          details: ''
        }
      ]
    }))
  }

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  // Skills handlers
  const addSkillCategory = () => {
    setFormData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          category: 'New Category',
          skills: []
        }
      ]
    }))
  }

  const updateSkillCategory = (index, category) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) =>
        i === index ? { ...s, category } : s
      )
    }))
  }

  const updateSkills = (index, skillsString) => {
    const skillsArray = skillsString.split(',').map(s => s.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) =>
        i === index ? { ...s, skills: skillsArray } : s
      )
    }))
  }

  const removeSkillCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  // Certification handlers
  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: Date.now(),
          name: '',
          issuer: '',
          date: '',
          credentialId: '',
          credentialUrl: ''
        }
      ]
    }))
  }

  const updateCertification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    }))
  }

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  // Final submission
  const [showSaveOptions, setShowSaveOptions] = useState(false)
  const [resumeTitle, setResumeTitle] = useState('')

  const handleCreateResume = () => {
    setShowSaveOptions(true)
    setResumeTitle(formData.personal.name ? `${formData.personal.name}'s Resume` : 'New Resume')
  }

  const handleSaveAsNew = async () => {
    if (!resumeTitle.trim()) {
      setError('Please enter a title for your resume')
      return
    }

    setIsProcessing(true)
    try {
      const result = await createNewResumeFromData(resumeTitle, formData)
      if (result.success) {
        alert('Resume created successfully!')
        onClose()
      } else {
        setError(result.error || 'Failed to create resume')
      }
    } catch (err) {
      setError(err.message || 'Failed to create resume')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReplaceCurrent = () => {
    loadResumeFromPDF(formData)
    alert('Resume updated successfully!')
    onClose()
  }

  // Render step content
  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep]

    switch (step.id) {
      case 'source':
        return renderSourceStep()
      case 'personal':
        return renderPersonalStep()
      case 'experience':
        return renderExperienceStep()
      case 'education':
        return renderEducationStep()
      case 'skills':
        return renderSkillsStep()
      case 'certifications':
        return renderCertificationsStep()
      case 'review':
        return renderReviewStep()
      default:
        return null
    }
  }

  const renderSourceStep = () => (
    <div className="wizard-step-content source-step">
      <h3>Choose how to import your information</h3>
      <p className="step-description">
        Select a method to get started with your resume
      </p>

      <div className="source-options">
        <button
          className="source-option"
          onClick={() => handleSourceSelect('linkedin-text')}
        >
          <div className="source-icon">📋</div>
          <div className="source-info">
            <h4>Paste LinkedIn Profile</h4>
            <p>Copy and paste your LinkedIn profile text</p>
          </div>
        </button>

        <button
          className="source-option"
          onClick={() => handleSourceSelect('linkedin-url')}
        >
          <div className="source-icon">🔗</div>
          <div className="source-info">
            <h4>LinkedIn URL</h4>
            <p>Enter your public LinkedIn profile URL</p>
          </div>
        </button>

        <button
          className="source-option"
          onClick={() => handleSourceSelect('manual')}
        >
          <div className="source-icon">✏️</div>
          <div className="source-info">
            <h4>Manual Entry</h4>
            <p>Fill in your information step by step</p>
          </div>
        </button>
      </div>

      {/* LinkedIn URL/Text input based on selection */}
      {importSource === 'linkedin-url' && (
        <div className="linkedin-input-section">
          <label>LinkedIn Profile URL</label>
          <input
            type="url"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/your-profile"
          />
          <p className="input-hint">
            Make sure your profile is set to public or use the &quot;Paste LinkedIn Profile&quot; option
          </p>
          <button
            className="process-btn"
            onClick={processLinkedInData}
            disabled={!linkedInUrl || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Extract Profile Data'}
          </button>
        </div>
      )}

      {importSource === 'linkedin-text' && (
        <div className="linkedin-input-section">
          <label>Paste Your LinkedIn Profile</label>
          <textarea
            value={linkedInText}
            onChange={(e) => setLinkedInText(e.target.value)}
            placeholder="Go to your LinkedIn profile, select all (Ctrl+A), copy (Ctrl+C), and paste here..."
            rows={10}
          />
          <p className="input-hint">
            Copy all text from your LinkedIn profile page and paste it here. Our AI will extract the relevant information.
          </p>
          <button
            className="process-btn"
            onClick={processLinkedInData}
            disabled={!linkedInText || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Extract Profile Data'}
          </button>
        </div>
      )}
    </div>
  )

  const renderPersonalStep = () => (
    <div className="wizard-step-content">
      <h3>Personal Information</h3>
      <p className="step-description">
        Enter your contact details and professional headline
      </p>

      <div className="form-grid">
        <div className="form-field">
          <label>Full Name *</label>
          <input
            type="text"
            value={formData.personal.name}
            onChange={(e) => updatePersonal('name', e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="form-field">
          <label>Professional Title *</label>
          <input
            type="text"
            value={formData.personal.title}
            onChange={(e) => updatePersonal('title', e.target.value)}
            placeholder="Senior Software Engineer"
          />
        </div>

        <div className="form-field">
          <label>Email *</label>
          <input
            type="email"
            value={formData.personal.email}
            onChange={(e) => updatePersonal('email', e.target.value)}
            placeholder="john.doe@email.com"
          />
        </div>

        <div className="form-field">
          <label>Phone</label>
          <input
            type="tel"
            value={formData.personal.phone}
            onChange={(e) => updatePersonal('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="form-field">
          <label>Location</label>
          <input
            type="text"
            value={formData.personal.location}
            onChange={(e) => updatePersonal('location', e.target.value)}
            placeholder="San Francisco, CA"
          />
        </div>

        <div className="form-field">
          <label>LinkedIn URL</label>
          <input
            type="url"
            value={formData.personal.linkedin}
            onChange={(e) => updatePersonal('linkedin', e.target.value)}
            placeholder="linkedin.com/in/johndoe"
          />
        </div>

        <div className="form-field">
          <label>GitHub URL</label>
          <input
            type="url"
            value={formData.personal.github}
            onChange={(e) => updatePersonal('github', e.target.value)}
            placeholder="github.com/johndoe"
          />
        </div>

        <div className="form-field">
          <label>Portfolio URL</label>
          <input
            type="url"
            value={formData.personal.portfolio}
            onChange={(e) => updatePersonal('portfolio', e.target.value)}
            placeholder="johndoe.com"
          />
        </div>
      </div>

      <div className="form-field full-width">
        <label>Professional Summary</label>
        <textarea
          value={formData.about}
          onChange={(e) => updateAbout(e.target.value)}
          placeholder="Write a brief professional summary highlighting your key achievements and career goals..."
          rows={4}
        />
      </div>
    </div>
  )

  const renderExperienceStep = () => (
    <div className="wizard-step-content">
      <h3>Work Experience</h3>
      <p className="step-description">
        Add your relevant work history
      </p>

      {formData.experience.map((exp, expIndex) => (
        <div key={exp.id} className="experience-card">
          <div className="card-header">
            <span className="card-number">Position #{expIndex + 1}</span>
            <button
              className="remove-btn"
              onClick={() => removeExperience(expIndex)}
            >
              Remove
            </button>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Job Title *</label>
              <input
                type="text"
                value={exp.title}
                onChange={(e) => updateExperience(expIndex, 'title', e.target.value)}
                placeholder="Senior Software Engineer"
              />
            </div>

            <div className="form-field">
              <label>Company *</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                placeholder="Tech Company Inc."
              />
            </div>

            <div className="form-field">
              <label>Date Range</label>
              <input
                type="text"
                value={exp.date}
                onChange={(e) => updateExperience(expIndex, 'date', e.target.value)}
                placeholder="Jan 2020 - Present"
              />
            </div>
          </div>

          <div className="bullets-section">
            <label>Key Achievements & Responsibilities</label>
            {exp.description.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="bullet-row">
                <span className="bullet-marker">•</span>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateExperienceBullet(expIndex, bulletIndex, e.target.value)}
                  placeholder="Describe an achievement or responsibility..."
                />
                {exp.description.length > 1 && (
                  <button
                    className="remove-bullet-btn"
                    onClick={() => removeExperienceBullet(expIndex, bulletIndex)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              className="add-bullet-btn"
              onClick={() => addExperienceBullet(expIndex)}
            >
              + Add Bullet Point
            </button>
          </div>
        </div>
      ))}

      <button className="add-card-btn" onClick={addExperience}>
        + Add Work Experience
      </button>
    </div>
  )

  const renderEducationStep = () => (
    <div className="wizard-step-content">
      <h3>Education</h3>
      <p className="step-description">
        Add your educational background
      </p>

      {formData.education.map((edu, index) => (
        <div key={edu.id} className="education-card">
          <div className="card-header">
            <span className="card-number">Education #{index + 1}</span>
            <button
              className="remove-btn"
              onClick={() => removeEducation(index)}
            >
              Remove
            </button>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="Bachelor of Science in Computer Science"
              />
            </div>

            <div className="form-field">
              <label>School/University *</label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                placeholder="University of Technology"
              />
            </div>

            <div className="form-field">
              <label>Graduation Date</label>
              <input
                type="text"
                value={edu.date}
                onChange={(e) => updateEducation(index, 'date', e.target.value)}
                placeholder="May 2020"
              />
            </div>

            <div className="form-field full-width">
              <label>Additional Details</label>
              <textarea
                value={edu.details}
                onChange={(e) => updateEducation(index, 'details', e.target.value)}
                placeholder="GPA, honors, relevant coursework..."
                rows={2}
              />
            </div>
          </div>
        </div>
      ))}

      <button className="add-card-btn" onClick={addEducation}>
        + Add Education
      </button>
    </div>
  )

  const renderSkillsStep = () => (
    <div className="wizard-step-content">
      <h3>Skills</h3>
      <p className="step-description">
        Organize your skills by category
      </p>

      {formData.skills.map((skillGroup, index) => (
        <div key={index} className="skill-category-card">
          <div className="card-header">
            <input
              type="text"
              className="category-input"
              value={skillGroup.category}
              onChange={(e) => updateSkillCategory(index, e.target.value)}
              placeholder="Category Name"
            />
            <button
              className="remove-btn"
              onClick={() => removeSkillCategory(index)}
            >
              Remove
            </button>
          </div>

          <div className="form-field">
            <input
              type="text"
              value={skillGroup.skills.join(', ')}
              onChange={(e) => updateSkills(index, e.target.value)}
              placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
            />
          </div>
        </div>
      ))}

      <button className="add-card-btn" onClick={addSkillCategory}>
        + Add Skill Category
      </button>

      <div className="skill-suggestions">
        <h4>Common Categories</h4>
        <div className="suggestion-chips">
          {['Technical Skills', 'Programming Languages', 'Frameworks', 'Tools & Software', 'Soft Skills', 'Languages'].map(cat => (
            <button
              key={cat}
              className="suggestion-chip"
              onClick={() => {
                if (!formData.skills.find(s => s.category === cat)) {
                  setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, { category: cat, skills: [] }]
                  }))
                }
              }}
            >
              + {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCertificationsStep = () => (
    <div className="wizard-step-content">
      <h3>Certifications</h3>
      <p className="step-description">
        Add your professional certifications and licenses
      </p>

      {formData.certifications.map((cert, index) => (
        <div key={cert.id} className="certification-card">
          <div className="card-header">
            <span className="card-number">Certification #{index + 1}</span>
            <button
              className="remove-btn"
              onClick={() => removeCertification(index)}
            >
              Remove
            </button>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Certification Name *</label>
              <input
                type="text"
                value={cert.name}
                onChange={(e) => updateCertification(index, 'name', e.target.value)}
                placeholder="AWS Solutions Architect"
              />
            </div>

            <div className="form-field">
              <label>Issuing Organization *</label>
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                placeholder="Amazon Web Services"
              />
            </div>

            <div className="form-field">
              <label>Date Obtained</label>
              <input
                type="text"
                value={cert.date}
                onChange={(e) => updateCertification(index, 'date', e.target.value)}
                placeholder="March 2023"
              />
            </div>

            <div className="form-field">
              <label>Credential ID</label>
              <input
                type="text"
                value={cert.credentialId}
                onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                placeholder="ABC123XYZ"
              />
            </div>

            <div className="form-field full-width">
              <label>Credential URL</label>
              <input
                type="url"
                value={cert.credentialUrl}
                onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                placeholder="https://certification-url.com/verify/abc123"
              />
            </div>
          </div>
        </div>
      ))}

      <button className="add-card-btn" onClick={addCertification}>
        + Add Certification
      </button>
    </div>
  )

  const renderReviewStep = () => (
    <div className="wizard-step-content review-step">
      <h3>Review Your Information</h3>
      <p className="step-description">
        Please review your information before creating your resume
      </p>

      {/* Personal Info Summary */}
      <div className="review-section">
        <div className="review-header">
          <h4>Personal Information</h4>
          <button className="edit-section-btn" onClick={() => goToStep(1)}>
            Edit
          </button>
        </div>
        <div className="review-content">
          <p><strong>{formData.personal.name || 'Not provided'}</strong></p>
          <p>{formData.personal.title || 'No title'}</p>
          <p>{formData.personal.email} {formData.personal.phone && `| ${formData.personal.phone}`}</p>
          <p>{formData.personal.location}</p>
        </div>
      </div>

      {/* Summary */}
      {formData.about && (
        <div className="review-section">
          <div className="review-header">
            <h4>Professional Summary</h4>
            <button className="edit-section-btn" onClick={() => goToStep(1)}>
              Edit
            </button>
          </div>
          <div className="review-content">
            <p>{formData.about}</p>
          </div>
        </div>
      )}

      {/* Experience Summary */}
      <div className="review-section">
        <div className="review-header">
          <h4>Work Experience ({formData.experience.length})</h4>
          <button className="edit-section-btn" onClick={() => goToStep(2)}>
            Edit
          </button>
        </div>
        <div className="review-content">
          {formData.experience.length === 0 ? (
            <p className="empty-notice">No work experience added</p>
          ) : (
            formData.experience.map((exp, i) => (
              <div key={i} className="review-item">
                <strong>{exp.title}</strong> at {exp.company}
                <span className="review-date">{exp.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Education Summary */}
      <div className="review-section">
        <div className="review-header">
          <h4>Education ({formData.education.length})</h4>
          <button className="edit-section-btn" onClick={() => goToStep(3)}>
            Edit
          </button>
        </div>
        <div className="review-content">
          {formData.education.length === 0 ? (
            <p className="empty-notice">No education added</p>
          ) : (
            formData.education.map((edu, i) => (
              <div key={i} className="review-item">
                <strong>{edu.degree}</strong> - {edu.school}
                <span className="review-date">{edu.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Skills Summary */}
      <div className="review-section">
        <div className="review-header">
          <h4>Skills ({formData.skills.reduce((acc, s) => acc + s.skills.length, 0)} total)</h4>
          <button className="edit-section-btn" onClick={() => goToStep(4)}>
            Edit
          </button>
        </div>
        <div className="review-content">
          {formData.skills.length === 0 ? (
            <p className="empty-notice">No skills added</p>
          ) : (
            formData.skills.map((group, i) => (
              <div key={i} className="review-skill-group">
                <strong>{group.category}:</strong> {group.skills.join(', ') || 'None'}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Certifications Summary */}
      <div className="review-section">
        <div className="review-header">
          <h4>Certifications ({formData.certifications.length})</h4>
          <button className="edit-section-btn" onClick={() => goToStep(5)}>
            Edit
          </button>
        </div>
        <div className="review-content">
          {formData.certifications.length === 0 ? (
            <p className="empty-notice">No certifications added</p>
          ) : (
            formData.certifications.map((cert, i) => (
              <div key={i} className="review-item">
                <strong>{cert.name}</strong> - {cert.issuer}
                <span className="review-date">{cert.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save Options Modal */}
      {showSaveOptions && (
        <div className="save-options-modal">
          <h4>Save Your Resume</h4>

          <div className="save-option-buttons">
            {user && (
              <div className="save-option">
                <label>Resume Title</label>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="Enter resume title"
                />
                <button
                  className="save-btn primary"
                  onClick={handleSaveAsNew}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Saving...' : 'Create New Resume'}
                </button>
              </div>
            )}

            <button
              className="save-btn secondary"
              onClick={handleReplaceCurrent}
              disabled={isProcessing}
            >
              Replace Current Resume
            </button>

            <button
              className="save-btn tertiary"
              onClick={() => setShowSaveOptions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="linkedin-import-overlay" onClick={onClose}>
      <div className="linkedin-import-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <h2>Create Resume from LinkedIn</h2>
          <button className="wizard-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Progress Steps */}
        <div className="wizard-progress">
          {WIZARD_STEPS.map((step, index) => (
            <button
              key={step.id}
              className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => index <= currentStep && goToStep(index)}
              disabled={index > currentStep}
            >
              <span className="step-icon">{step.icon}</span>
              <span className="step-title">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="wizard-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Step Content */}
        <div className="wizard-content">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="wizard-navigation">
          <button
            className="nav-btn prev"
            onClick={goToPreviousStep}
            disabled={currentStep === 0 || isProcessing}
          >
            ← Previous
          </button>

          <span className="step-indicator">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </span>

          {currentStep === WIZARD_STEPS.length - 1 ? (
            <button
              className="nav-btn create"
              onClick={handleCreateResume}
              disabled={isProcessing}
            >
              Create Resume
            </button>
          ) : (
            <button
              className="nav-btn next"
              onClick={goToNextStep}
              disabled={isProcessing}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LinkedInImport
