/**
 * Resume Parser Service
 * Extracts text from PDF/DOCX files and parses it into structured resume data using AI
 */

import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

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
export async function parseResumeWithAI(resumeText) {
  const apiKey = localStorage.getItem('openai_api_key')

  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add your API key in settings.')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
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

Return ONLY the JSON object, no explanations or markdown formatting.`
        },
        {
          role: 'user',
          content: `Parse this resume:\n\n${resumeText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content.trim()

  // Remove markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [null, content]
  const jsonString = jsonMatch[1] || content

  try {
    const parsedData = JSON.parse(jsonString)

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
    throw new Error(`Failed to parse AI response: ${error.message}`)
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
