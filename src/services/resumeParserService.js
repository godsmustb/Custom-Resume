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
      "date": "string",
      "description": ["array", "of", "strings"]
    }
  ],
  "education": [
    {
      "id": "string",
      "degree": "string",
      "school": "string",
      "date": "string",
      "details": "string"
    }
  ],
  "skills": [
    {
      "category": "string",
      "skills": ["array", "of", "strings"]
    }
  ],
  "certifications": [
    {
      "id": "string",
      "name": "string",
      "issuer": "string",
      "date": "string",
      "credentialId": "string",
      "credentialUrl": "string"
    }
  ]
}

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
