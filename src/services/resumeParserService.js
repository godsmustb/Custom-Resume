/**
 * Resume Parser Service
 * Extracts text from PDF/DOCX files and parses it into structured resume data using AI
 */

import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import OpenAI from 'openai'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

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

IMPORTANT EXTRACTION RULES:
1. For EDUCATION: Always extract the date/year (graduation year or date range). Look for patterns like "2006-2010", "2014", "Graduated 2016", etc.
2. For CERTIFICATIONS: Always extract the year obtained. Look for patterns like "2018", "Obtained 2016", etc.
3. For EXPERIENCE: Always include the date range (e.g., "Jul 2024 - Present", "Dec 2020 - Jul 2024").
4. Extract ALL information available, do not skip dates even if they seem partial.

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

    const parsedData = JSON.parse(content)

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
      skills: (parsedData.skills || []).map(skillGroup => ({
        category: skillGroup.category || 'Skills',
        skills: Array.isArray(skillGroup.skills) ? skillGroup.skills : []
      })),
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
