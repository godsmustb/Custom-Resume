/**
 * LinkedIn Data Extraction Service
 * Uses AI to parse LinkedIn profile text and extract structured resume data
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

/**
 * Extract structured resume data from LinkedIn profile text or URL
 * @param {string} input - LinkedIn profile text or URL
 * @param {string} type - 'text' or 'url'
 * @returns {Promise<Object>} Structured resume data
 */
export const extractLinkedInData = async (input, type = 'text') => {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
  }

  let profileText = input

  // If URL, provide instructions for the user
  if (type === 'url') {
    // LinkedIn URLs require authentication to scrape, so we'll guide the user
    throw new Error(
      'Due to LinkedIn\'s privacy restrictions, we cannot directly fetch profile data from URLs. ' +
      'Please use the "Paste LinkedIn Profile" option instead:\n\n' +
      '1. Go to your LinkedIn profile\n' +
      '2. Select all (Ctrl+A or Cmd+A)\n' +
      '3. Copy (Ctrl+C or Cmd+C)\n' +
      '4. Paste the content here'
    )
  }

  // Validate input
  if (!profileText || profileText.trim().length < 50) {
    throw new Error('Please provide more LinkedIn profile content. The text appears to be too short.')
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume data extractor. Extract structured resume information from LinkedIn profile text.

Your task is to parse the provided LinkedIn profile content and extract all relevant information into a structured JSON format.

Rules:
1. Extract ALL work experience with job titles, companies, dates, and descriptions
2. Extract ALL education entries with degrees, schools, and dates
3. Extract ALL skills mentioned
4. Extract certifications/licenses if present
5. Parse contact information if visible (email, phone, location)
6. Extract the professional headline/title
7. Extract the "About" section as a professional summary
8. For dates, use formats like "Jan 2020 - Present" or "2018 - 2022"
9. For experience descriptions, convert paragraphs into bullet points (array of strings)
10. Group skills into logical categories (Technical Skills, Soft Skills, Languages, Tools, etc.)
11. If information is not available, use empty strings or empty arrays
12. Be thorough - don't miss any experience or education entries

Output ONLY valid JSON, no markdown or explanations.`
        },
        {
          role: 'user',
          content: `Extract resume data from this LinkedIn profile content:

${profileText.substring(0, 15000)}

Return a JSON object with this exact structure:
{
  "personal": {
    "name": "Full Name",
    "title": "Professional Headline",
    "email": "",
    "phone": "",
    "location": "City, State/Country",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "about": "Professional summary/about section text",
  "experience": [
    {
      "id": 1,
      "title": "Job Title",
      "company": "Company Name",
      "date": "Start Date - End Date",
      "description": ["Bullet point 1", "Bullet point 2", "..."]
    }
  ],
  "education": [
    {
      "id": 1,
      "degree": "Degree Name",
      "school": "School Name",
      "date": "Graduation Date or Date Range",
      "details": "GPA, honors, relevant coursework, etc."
    }
  ],
  "skills": [
    {
      "category": "Category Name",
      "skills": ["Skill 1", "Skill 2", "..."]
    }
  ],
  "certifications": [
    {
      "id": 1,
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date Obtained",
      "credentialId": "",
      "credentialUrl": ""
    }
  ]
}`
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response received from AI. Please try again.')
    }

    // Parse the JSON response
    let parsedData
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      parsedData = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw content:', content)
      throw new Error('Failed to parse LinkedIn data. Please try again with clearer profile content.')
    }

    // Validate and clean up the data
    const validatedData = validateAndCleanData(parsedData)

    return validatedData

  } catch (error) {
    if (error.message.includes('API key')) {
      throw error
    }
    if (error.message.includes('rate limit')) {
      throw new Error('AI service is temporarily busy. Please wait a moment and try again.')
    }
    console.error('LinkedIn extraction error:', error)
    throw new Error(error.message || 'Failed to extract LinkedIn data. Please try again.')
  }
}

/**
 * Validate and clean the extracted data
 * @param {Object} data - Raw extracted data
 * @returns {Object} Validated and cleaned data
 */
const validateAndCleanData = (data) => {
  // Ensure all required fields exist with defaults
  const validated = {
    personal: {
      name: data.personal?.name || '',
      title: data.personal?.title || '',
      email: data.personal?.email || '',
      phone: data.personal?.phone || '',
      location: data.personal?.location || '',
      linkedin: data.personal?.linkedin || '',
      github: data.personal?.github || '',
      portfolio: data.personal?.portfolio || ''
    },
    about: data.about || '',
    experience: [],
    education: [],
    skills: [],
    certifications: []
  }

  // Process experience
  if (Array.isArray(data.experience)) {
    validated.experience = data.experience.map((exp, index) => ({
      id: exp.id || Date.now() + index,
      title: exp.title || '',
      company: exp.company || '',
      date: exp.date || '',
      description: Array.isArray(exp.description)
        ? exp.description.filter(d => d && d.trim())
        : typeof exp.description === 'string'
          ? [exp.description]
          : ['']
    }))
  }

  // Process education
  if (Array.isArray(data.education)) {
    validated.education = data.education.map((edu, index) => ({
      id: edu.id || Date.now() + index,
      degree: edu.degree || '',
      school: edu.school || '',
      date: edu.date || '',
      details: edu.details || ''
    }))
  }

  // Process skills
  if (Array.isArray(data.skills)) {
    validated.skills = data.skills
      .filter(skill => skill.category || (skill.skills && skill.skills.length > 0))
      .map(skill => ({
        category: skill.category || 'Skills',
        skills: Array.isArray(skill.skills)
          ? skill.skills.filter(s => s && s.trim())
          : []
      }))
  }

  // If no skill categories, create a default one with any found skills
  if (validated.skills.length === 0 && data.skills) {
    const allSkills = []
    if (typeof data.skills === 'string') {
      allSkills.push(...data.skills.split(',').map(s => s.trim()))
    }
    if (allSkills.length > 0) {
      validated.skills = [{ category: 'Skills', skills: allSkills }]
    }
  }

  // Process certifications
  if (Array.isArray(data.certifications)) {
    validated.certifications = data.certifications.map((cert, index) => ({
      id: cert.id || Date.now() + index,
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || ''
    }))
  }

  return validated
}

/**
 * Generate a sample LinkedIn profile format for user guidance
 * @returns {string} Sample LinkedIn profile text
 */
export const getSampleLinkedInFormat = () => {
  return `Example of what to paste:

John Doe
Senior Software Engineer at Tech Company
San Francisco Bay Area · 500+ connections

About
Results-driven software engineer with 8+ years of experience...

Experience

Senior Software Engineer
Tech Company
Jan 2020 - Present · 4 yrs
San Francisco, CA
- Led development of microservices architecture
- Managed team of 5 developers

Software Engineer
Previous Company
Jun 2016 - Dec 2019 · 3 yrs 7 mos
- Developed full-stack web applications
- Implemented CI/CD pipelines

Education

Stanford University
Master of Science - MS, Computer Science
2014 - 2016

University of California, Berkeley
Bachelor of Science - BS, Computer Science
2010 - 2014

Skills
JavaScript · Python · React · Node.js · AWS · Docker

Licenses & Certifications
AWS Solutions Architect - Amazon Web Services
Issued Jan 2021`
}

export default {
  extractLinkedInData,
  getSampleLinkedInFormat
}
