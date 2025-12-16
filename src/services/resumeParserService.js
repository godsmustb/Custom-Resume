/**
 * Resume Parser Service
 * Extracts text from PDF/DOCX files and parses it into structured resume data using AI
 */

import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import OpenAI from 'openai'
import { skillsLibrary } from './skillsSuggestions'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

/**
 * Normalize skill name: trim whitespace, standardize capitalization
 */
function normalizeSkillName(skill) {
  if (!skill || typeof skill !== 'string') return skill

  // Trim whitespace
  let normalized = skill.trim()

  // List of known acronyms to keep uppercase
  const acronyms = [
    'AI', 'ML', 'API', 'UI', 'UX', 'SQL', 'AWS', 'GCP', 'CI', 'CD', 'REST', 'JSON',
    'XML', 'HTML', 'CSS', 'JS', 'TS', 'PHP', 'SAP', 'ERP', 'CRM', 'PMP', 'PMI',
    'JIRA', 'SCRUM', 'KPI', 'ROI', 'B2B', 'B2C', 'SaaS', 'PaaS', 'IaaS', 'IoT',
    'SDLC', 'AGILE', 'DevOps', 'QA', 'BI', 'ETL', 'OLAP', 'OLTP', 'HR', 'IT', 'R&D',
    'ADO', 'BAU', 'FCM', 'MiFID', 'ISO', 'RAID'
  ]

  // Check if the entire skill is an acronym
  if (acronyms.includes(normalized.toUpperCase())) {
    return normalized.toUpperCase()
  }

  // Check if skill contains acronyms and preserve them
  const words = normalized.split(/\s+/)
  const titleCased = words.map(word => {
    // Preserve known acronyms
    if (acronyms.includes(word.toUpperCase())) {
      return word.toUpperCase()
    }

    // Special handling for hyphenated words (Power-BI → Power-BI)
    if (word.includes('-')) {
      return word.split('-').map(part =>
        acronyms.includes(part.toUpperCase())
          ? part.toUpperCase()
          : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join('-')
    }

    // Special handling for slashes (Agile/Scrum)
    if (word.includes('/')) {
      return word.split('/').map(part =>
        acronyms.includes(part.toUpperCase())
          ? part.toUpperCase()
          : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join('/')
    }

    // Handle parentheses (e.g., "Excel (Advanced)")
    if (word.includes('(') || word.includes(')')) {
      return word.split(/([()])/g).map(part => {
        if (part === '(' || part === ')') return part
        if (acronyms.includes(part.toUpperCase())) return part.toUpperCase()
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      }).join('')
    }

    // Title case for regular words
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(' ')

  return titleCased
}

/**
 * Deduplicate skills: detect similar skills and merge them
 */
function deduplicateSkills(skills) {
  if (!skills || skills.length === 0) return skills

  const normalized = new Map()

  skills.forEach(skill => {
    // Create a key by removing spaces, hyphens, and converting to lowercase
    const key = skill.toLowerCase().replace(/[\s\-_()]/g, '')

    // If we haven't seen this skill before, add it
    if (!normalized.has(key)) {
      normalized.set(key, skill)
    } else {
      // If we have seen it, keep the longer/more descriptive version
      const existing = normalized.get(key)
      if (skill.length > existing.length) {
        normalized.set(key, skill)
      }
    }
  })

  return Array.from(normalized.values())
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return fullText
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

/**
 * Parse resume text using AI (OpenAI)
 */
export async function parseResumeWithAI(resumeText, retryCount = 0) {
  try {
    // Truncate resume text if too long to avoid token limits
    const maxResumeLength = 8000
    const truncatedText = resumeText.length > maxResumeLength
      ? resumeText.substring(0, maxResumeLength) + '...'
      : resumeText

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a resume parser. Extract structured data from the resume text and return ONLY a valid JSON object with this exact structure:
{
  "personal": {
    "name": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "about": "string - professional summary",
  "experience": [
    {
      "id": "string",
      "title": "string",
      "company": "string",
      "date": "string - MUST include dates (e.g., 'Jan 2020 - Present', '2018-2022')",
      "description": ["array", "of", "strings - each bullet point"]
    }
  ],
  "education": [
    {
      "id": "string",
      "degree": "string - full degree name (e.g., 'Bachelor of Technology, Computer Sciences Engineering')",
      "school": "string - institution name with location if available",
      "date": "string - MUST extract graduation year or date range (e.g., '2006-2010', '2014-2016', '2018')",
      "details": "string - additional details like GPA, honors, etc."
    }
  ],
  "skills": [
    {
      "category": "string - skill category name",
      "skills": ["array", "of", "individual", "skills"]
    }
  ],
  "certifications": [
    {
      "id": "string",
      "name": "string - certification name (e.g., 'PMI PMP - Project Management Professional')",
      "issuer": "string - certifying organization",
      "date": "string - MUST extract year obtained (e.g., '2018', '2016')",
      "credentialId": "string - if available",
      "credentialUrl": "string - if available"
    }
  ]
}

CRITICAL DATE EXTRACTION RULES (DO NOT SKIP):
1. EDUCATION DATES - MANDATORY: Search the entire education section for ANY year/date patterns:
   - Look for: "2006-2010", "2010-2014", "2014-2016", "2016-2018", "2018-2022"
   - Look for: "2010", "2014", "2016", "2018" (single years)
   - Look for: "Graduated 2016", "Graduation: 2014", "Class of 2018"
   - Look for: dates near degree/school names
   - If you find ANY 4-digit number between 1990-2030 near education, that's likely the date

2. CERTIFICATION DATES - MANDATORY: Search certification section for ANY year:
   - Look for: "2018", "2016", "2020", "2022" (any 4-digit year)
   - Look for: "Obtained 2018", "Issued 2016", "Valid 2020"
   - Look for: dates at the end of certification lines
   - If you find ANY 4-digit number near a certification, extract it

3. EXPERIENCE DATES - MANDATORY: Must always have date ranges
   - Format: "Jul 2024 - Present", "Dec 2020 - Jul 2024", "2018-2022"

4. NEVER leave date fields empty - extract ANY date pattern you find
5. If dates appear anywhere in the text near education/certification, EXTRACT THEM

Return ONLY the JSON object, no explanations or markdown formatting. Ensure all strings are properly escaped and terminated.`
        },
        {
          role: 'user',
          content: `Parse this resume:\n\n${truncatedText}`
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    })

    let content = response.choices[0].message.content.trim()

    // Clean up potential markdown code blocks
    content = content.replace(/^```json\s*/i, '').replace(/\s*```$/, '')

    console.log('AI Resume Parse Response (first 200 chars):', content.substring(0, 200))

    const parsedData = JSON.parse(content)

    // Fallback: Extract dates using regex if AI missed them
    const extractDatesWithRegex = (text) => {
      // Match 4-digit years (1990-2030) and date ranges
      const yearPattern = /\b(19[9]\d|20[0-3]\d)\b/g
      const dateRangePattern = /\b(19[9]\d|20[0-3]\d)\s*[-–—]\s*(19[9]\d|20[0-3]\d|Present|Current)\b/gi

      const years = text.match(yearPattern) || []
      const ranges = text.match(dateRangePattern) || []

      return { years, ranges }
    }

    // Try to extract missing education dates from both parsed data and original text
    if (parsedData.education && parsedData.education.length > 0) {
      parsedData.education.forEach((edu, idx) => {
        if (!edu.date || edu.date.trim() === '') {
          // First try: Look for dates in the degree or school text
          const eduText = `${edu.degree || ''} ${edu.school || ''} ${edu.details || ''}`
          const { years, ranges } = extractDatesWithRegex(eduText)

          if (ranges.length > 0) {
            edu.date = ranges[0]
          } else if (years.length > 0) {
            edu.date = years.sort().reverse()[0]
          } else {
            // Second try: Search original text near education keywords
            const educationSection = truncatedText.match(/education[\s\S]{0,500}/i)?.[0] || ''
            const { years: sectionYears, ranges: sectionRanges } = extractDatesWithRegex(educationSection)

            if (sectionRanges.length > idx) {
              edu.date = sectionRanges[idx]
            } else if (sectionYears.length > idx) {
              edu.date = sectionYears[idx]
            }
          }
        }
      })
    }

    // Try to extract missing certification dates from both parsed data and original text
    if (parsedData.certifications && parsedData.certifications.length > 0) {
      parsedData.certifications.forEach((cert, idx) => {
        if (!cert.date || cert.date.trim() === '') {
          // First try: Look for dates in the certification name or issuer
          const certText = `${cert.name || ''} ${cert.issuer || ''}`
          const { years } = extractDatesWithRegex(certText)

          if (years.length > 0) {
            cert.date = years.sort().reverse()[0]
          } else {
            // Second try: Search original text near certification keywords
            const certSection = truncatedText.match(/certifications?[\s\S]{0,800}/i)?.[0] || ''
            const { years: sectionYears } = extractDatesWithRegex(certSection)

            if (sectionYears.length > idx) {
              cert.date = sectionYears[idx]
            }
          }
        }
      })
    }

    // Ensure all required fields exist with defaults
    return {
      personal: {
        name: parsedData.personal?.name || 'Your Name',
        title: parsedData.personal?.title || 'Professional Title',
        email: parsedData.personal?.email || '',
        phone: parsedData.personal?.phone || '',
        location: parsedData.personal?.location || '',
        linkedin: parsedData.personal?.linkedin || '',
        github: parsedData.personal?.github || '',
        portfolio: parsedData.personal?.portfolio || ''
      },
      about: parsedData.about || '',
      experience: (parsedData.experience || []).map((exp, idx) => ({
        id: exp.id || Date.now().toString() + idx,
        title: exp.title || '',
        company: exp.company || '',
        date: exp.date || '',
        description: Array.isArray(exp.description) ? exp.description : []
      })),
      education: (parsedData.education || []).map((edu, idx) => ({
        id: edu.id || Date.now().toString() + idx,
        degree: edu.degree || '',
        school: edu.school || '',
        date: edu.date || '',
        details: edu.details || ''
      })),
      skills: (parsedData.skills || []).map(skillGroup => {
        // Normalize each skill: trim whitespace, Title Case, preserve acronyms
        let normalizedSkills = Array.isArray(skillGroup.skills)
          ? skillGroup.skills.map(skill => normalizeSkillName(skill))
          : []

        // Deduplicate: merge similar skills (PowerBI = Power BI)
        normalizedSkills = deduplicateSkills(normalizedSkills)

        return {
          category: skillGroup.category || 'Skills',
          skills: normalizedSkills
        }
      }),
      certifications: (parsedData.certifications || []).map((cert, idx) => ({
        id: cert.id || Date.now().toString() + idx,
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || ''
      })),
      jobDescription: ''
    }
  } catch (error) {
    console.error('Error parsing resume with AI:', error)

    // Retry once if it's a JSON parsing error
    if (error instanceof SyntaxError && retryCount < 1) {
      console.log('JSON parse failed, retrying with stricter prompt...')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      return parseResumeWithAI(resumeText, retryCount + 1)
    }

    throw new Error(`Failed to parse resume. The AI returned invalid data. Please try again or enter data manually.`)
  }
}

/**
 * Main function to parse uploaded resume
 */
export async function parseUploadedResume(file) {
  let resumeText = ''

  if (file.type === 'application/pdf') {
    resumeText = await extractTextFromPDF(file)
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    resumeText = await extractTextFromDOCX(file)
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
  }

  if (!resumeText.trim()) {
    throw new Error('Could not extract text from the resume. Please try a different file.')
  }

  // Parse the extracted text with AI
  const parsedData = await parseResumeWithAI(resumeText)
  return parsedData
}
