import * as pdfjsLib from 'pdfjs-dist'
import OpenAI from 'openai'

// Set worker path for PDF.js - using local worker to avoid CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    let fullText = ''

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n\n'
    }

    return fullText.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.')
  }
}

/**
 * Parse resume text using AI to extract structured data
 */
export async function parseResumeWithAI(resumeText, retryCount = 0) {
  try {
    // Truncate resume text if too long to avoid token limits
    const maxResumeLength = 8000
    const truncatedText = resumeText.length > maxResumeLength
      ? resumeText.substring(0, maxResumeLength) + '...'
      : resumeText

    const prompt = `Parse this resume text and extract structured information. Return ONLY valid JSON with the following structure:

    {
      "personal": {
        "name": "Full Name",
        "title": "Professional Title",
        "email": "email@example.com",
        "phone": "(123) 456-7890",
        "location": "City, State",
        "linkedin": "linkedin URL if found",
        "github": "github URL if found",
        "portfolio": "portfolio URL if found"
      },
      "about": "Professional summary paragraph",
      "experience": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "date": "Date Range",
          "description": ["bullet point 1", "bullet point 2", ...]
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "school": "School Name",
          "date": "Date Range",
          "details": "Additional details"
        }
      ],
      "skills": [
        {
          "category": "Category Name",
          "skills": ["skill1", "skill2", ...]
        }
      ]
    }

    Resume Text:
    ${truncatedText}

    CRITICAL INSTRUCTIONS:
    - Return ONLY valid JSON - no markdown, no code blocks, no explanations
    - Escape all special characters properly in strings (quotes, newlines, etc.)
    - If a field is not found, use empty string "" or empty array []
    - Keep bullet points concise to avoid JSON size limits
    - Organize skills into logical categories (Frontend, Backend, Tools, etc.)
    - Format dates consistently
    - Extract URLs if present`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at parsing resumes and extracting structured data. Return ONLY valid, properly escaped JSON. No markdown formatting, no code blocks, no explanations. Ensure all strings are properly escaped and terminated.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    })

    let jsonContent = response.choices[0].message.content.trim()

    // Clean up potential markdown code blocks
    jsonContent = jsonContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '')

    console.log('AI Response (first 200 chars):', jsonContent.substring(0, 200))

    const parsedData = JSON.parse(jsonContent)

    // Add IDs to experience and education items
    if (parsedData.experience) {
      parsedData.experience = parsedData.experience.map((exp, idx) => ({
        ...exp,
        id: `exp-${Date.now()}-${idx}`
      }))
    }

    if (parsedData.education) {
      parsedData.education = parsedData.education.map((edu, idx) => ({
        ...edu,
        id: `edu-${Date.now()}-${idx}`
      }))
    }

    // Ensure jobDescription field exists
    parsedData.jobDescription = ''

    return parsedData
  } catch (error) {
    console.error('Error parsing resume with AI:', error)

    // Retry once if it's a JSON parsing error
    if (error instanceof SyntaxError && retryCount < 1) {
      console.log('JSON parse failed, retrying with stricter prompt...')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      return parseResumeWithAI(resumeText, retryCount + 1)
    }

    throw new Error('Failed to parse resume. The AI returned invalid data. Please try again or enter data manually.')
  }
}

/**
 * Upload and parse PDF resume
 */
export async function uploadAndParseResumePDF(file) {
  try {
    // Validate file
    if (!file.type.includes('pdf')) {
      throw new Error('Please upload a PDF file')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size must be less than 5MB')
    }

    console.log('Extracting text from PDF...')

    // Extract text
    const resumeText = await extractTextFromPDF(file)

    if (!resumeText.trim()) {
      throw new Error('Could not extract text from PDF. Please ensure it is not a scanned image.')
    }

    console.log('Text extracted successfully. Length:', resumeText.length)
    console.log('Parsing with AI...')

    // Parse with AI
    const structuredData = await parseResumeWithAI(resumeText)

    console.log('Parsing complete!', structuredData)

    return structuredData
  } catch (error) {
    console.error('Error uploading and parsing PDF:', error)
    throw error
  }
}
