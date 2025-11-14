import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
})

/**
 * Generate professional summary based on user's background
 */
export async function generateSummary(currentSummary, jobDescription = '') {
  try {
    const prompt = jobDescription
      ? `Based on this job description: "${jobDescription}"

         And this current professional summary: "${currentSummary}"

         Generate an improved, tailored professional summary that highlights relevant skills and experience for this specific job.
         Keep it concise (3-4 sentences), professional, and use action-oriented language.
         Focus on how the candidate's experience aligns with the job requirements.`
      : `Improve this professional summary: "${currentSummary}"

         Make it more compelling, professional, and action-oriented. Keep it 3-4 sentences.
         Highlight key strengths and unique value proposition.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer with expertise in crafting compelling professional summaries. Provide only the improved summary text, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    return response.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating summary:', error)
    throw new Error('Failed to generate summary. Please check your API key and try again.')
  }
}

/**
 * Generate professional bullet points from brief descriptions
 */
export async function generateBulletPoints(jobTitle, company, briefDescription, jobDescription = '') {
  try {
    const prompt = jobDescription
      ? `Job Title: ${jobTitle}
         Company: ${company}
         Brief Description: ${briefDescription}

         Target Job Description: ${jobDescription}

         Generate 3-5 professional, quantifiable bullet points that describe achievements and responsibilities.
         Tailor them to match keywords and requirements from the target job description.
         Use action verbs, include metrics where possible (e.g., "increased by 40%", "managed team of 5").
         Format: Return only the bullet points, one per line, without bullet symbols or numbers.`
      : `Job Title: ${jobTitle}
         Company: ${company}
         Brief Description: ${briefDescription}

         Generate 3-5 professional, quantifiable bullet points that describe achievements and responsibilities.
         Use action verbs, include metrics where possible (e.g., "increased by 40%", "managed team of 5").
         Format: Return only the bullet points, one per line, without bullet symbols or numbers.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer. Create impactful, quantifiable bullet points that showcase achievements. Return only the bullet points, one per line.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    })

    const bullets = response.choices[0].message.content
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-•*]\s*/, '').trim())

    return bullets
  } catch (error) {
    console.error('Error generating bullet points:', error)
    throw new Error('Failed to generate bullet points. Please try again.')
  }
}

/**
 * Analyze job description and extract key information
 */
export async function analyzeJobDescription(jobDescription) {
  try {
    const prompt = `Analyze this job description and extract:
    1. Required technical skills
    2. Soft skills and competencies
    3. Key responsibilities
    4. Important keywords for ATS optimization
    5. Company culture indicators

    Job Description:
    ${jobDescription}

    Return the analysis in JSON format:
    {
      "technicalSkills": ["skill1", "skill2", ...],
      "softSkills": ["skill1", "skill2", ...],
      "responsibilities": ["resp1", "resp2", ...],
      "keywords": ["keyword1", "keyword2", ...],
      "cultureFit": ["trait1", "trait2", ...]
    }`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing job descriptions and extracting key information for resume optimization. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    })

    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error('Error analyzing job description:', error)
    throw new Error('Failed to analyze job description. Please try again.')
  }
}

/**
 * Customize entire resume based on job description
 */
export async function customizeResume(resumeData, jobDescription) {
  try {
    // First analyze the job description
    const analysis = await analyzeJobDescription(jobDescription)

    // Generate suggestions for each section
    const suggestions = {
      summary: null,
      experience: [],
      skills: [],
      analysis: analysis
    }

    // Generate improved summary
    suggestions.summary = await generateSummary(resumeData.about, jobDescription)

    // Generate suggestions for top 2 experiences
    const experiencesToImprove = resumeData.experience.slice(0, 2)
    for (const exp of experiencesToImprove) {
      const improvedBullets = await generateBulletPoints(
        exp.title,
        exp.company,
        exp.description.join('. '),
        jobDescription
      )
      suggestions.experience.push({
        id: exp.id,
        originalTitle: exp.title,
        suggestedBullets: improvedBullets
      })
    }

    // Suggest relevant skills to add
    const currentSkills = resumeData.skills.flatMap(cat => cat.skills)
    const suggestedSkills = analysis.technicalSkills.filter(
      skill => !currentSkills.some(current =>
        current.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(current.toLowerCase())
      )
    ).slice(0, 10)

    suggestions.skills = suggestedSkills

    return suggestions
  } catch (error) {
    console.error('Error customizing resume:', error)
    throw new Error('Failed to customize resume. Please try again.')
  }
}

/**
 * Improve existing experience bullet points
 */
export async function improveExperience(experiences, jobDescription = '') {
  try {
    const improvements = []

    for (const exp of experiences) {
      const improvedBullets = await generateBulletPoints(
        exp.title,
        exp.company,
        exp.description.join('. '),
        jobDescription
      )
      improvements.push({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        improvedBullets
      })
    }

    return improvements
  } catch (error) {
    console.error('Error improving experience:', error)
    throw new Error('Failed to improve experience section. Please try again.')
  }
}

/**
 * Suggest skills based on job description and current resume
 */
export async function suggestSkills(currentSkills, jobDescription) {
  try {
    const skillsList = currentSkills.flatMap(cat => cat.skills).join(', ')

    const prompt = `Current skills: ${skillsList}

    Job Description: ${jobDescription}

    Based on the job description, suggest 5-10 additional relevant skills that would strengthen this resume.
    Only suggest skills that are:
    1. Mentioned or implied in the job description
    2. Not already in the current skills list
    3. Realistic and relevant to the role

    Return only a comma-separated list of skills, nothing else.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a resume optimization expert. Suggest only relevant, high-value skills.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 200
    })

    const suggestedSkills = response.choices[0].message.content
      .trim()
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill)

    return suggestedSkills
  } catch (error) {
    console.error('Error suggesting skills:', error)
    throw new Error('Failed to suggest skills. Please try again.')
  }
}

/**
 * Generate match score between resume and job description using ATS-style criteria
 */
export async function calculateMatchScore(resumeData, jobDescription) {
  try {
    const resumeText = `
      Summary: ${resumeData.about}
      Experience: ${resumeData.experience.map(exp =>
        `${exp.title} at ${exp.company}: ${exp.description.join('. ')}`
      ).join(' ')}
      Skills: ${resumeData.skills.flatMap(cat => cat.skills).join(', ')}
    `

    const prompt = `You are an ATS (Applicant Tracking System) scoring engine. Calculate a precise match score between this resume and job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

SCORING CRITERIA (Use these exact weights - be mathematically precise):

1. KEYWORD MATCH (40 points):
   - Count how many keywords from job description appear in resume
   - Technical skills mentioned: +2 points each (max 20 points)
   - Job-specific terminology: +2 points each (max 10 points)
   - Industry buzzwords: +1 point each (max 10 points)

2. SKILLS OVERLAP (30 points):
   - Required technical skills present: +3 points each (max 15 points)
   - Soft skills mentioned: +2 points each (max 8 points)
   - Tools/technologies listed: +1 point each (max 7 points)

3. EXPERIENCE RELEVANCE (20 points):
   - Job titles match or similar: +5 points
   - Responsibilities align with job requirements: +8 points
   - Quantifiable achievements mentioned: +7 points

4. COMPLETENESS (10 points):
   - Professional summary includes key terms: +3 points
   - All job requirements addressed: +4 points
   - No major gaps in qualifications: +3 points

SCORING SCALE:
- 95-100: Exceptional match - resume mirrors job description perfectly
- 90-94: Excellent match - most keywords and requirements covered
- 85-89: Very good match - strong alignment with key requirements
- 80-84: Good match - several requirements met
- 70-79: Fair match - some requirements met
- Below 70: Weak match - significant gaps

IMPORTANT RULES:
- Be PRECISE with your scoring - use the exact criteria above
- If resume has 90%+ of job keywords, score must be 90+
- If resume addresses all major gaps from previous iteration, score MUST increase by at least 5-10 points
- DO NOT be conservative - if keywords match, give high score
- A resume with all required skills should score 95+

Calculate the EXACT score based on keyword counts and criteria above.

Return in JSON format:
{
  "matchScore": <calculated number 0-100>,
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "gaps": ["specific missing item 1", "specific missing item 2", "specific missing item 3"]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise ATS scoring algorithm. Calculate exact match scores based on keyword density, skills overlap, and requirement alignment. Be objective and mathematical. If a resume has most keywords from the job description, score it 90+. DO NOT default to 85% - calculate the actual match.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content)

    // Log for debugging
    console.log('Score calculation result:', result)

    return result
  } catch (error) {
    console.error('Error calculating match score:', error)
    throw new Error('Failed to calculate match score. Please try again.')
  }
}

/**
 * Auto-improve entire resume to increase match score - AGGRESSIVE MODE
 */
export async function autoImproveResume(resumeData, jobDescription, gaps) {
  try {
    const improvements = {
      summary: null,
      experience: [],
      skills: []
    }

    // Extract key requirements from job description first
    const analysis = await analyzeJobDescription(jobDescription)

    // Improve summary - VERY AGGRESSIVE
    const summaryPrompt = `Current Summary: "${resumeData.about}"

    Job Description: ${jobDescription}

    CRITICAL GAPS TO ADDRESS: ${gaps.join(' | ')}

    REQUIRED KEYWORDS: ${analysis.keywords.join(', ')}
    REQUIRED TECHNICAL SKILLS: ${analysis.technicalSkills.join(', ')}
    REQUIRED SOFT SKILLS: ${analysis.softSkills.join(', ')}

    TASK: Completely rewrite this professional summary to MAXIMIZE match with the job description and achieve 95%+ score.

    CRITICAL REQUIREMENTS - ALL MUST BE MET:
    - MUST include at least 8-10 exact keywords from the job description
    - MUST directly address EVERY SINGLE critical gap listed above
    - MUST mention 3-5 technical skills from the required list by name
    - MUST include specific quantifiable achievements (numbers like "500K users", "40% improvement", "$2M savings")
    - MUST be 5-6 sentences to pack maximum keywords
    - MUST mirror the language/terminology used in the job description
    - Use power verbs: Led, Architected, Drove, Spearheaded, Optimized, Delivered
    - Make it sound like this person is THE PERFECT match for this exact role
    - Include industry-specific terminology from the job posting

    GOAL: Write a summary so targeted that ATS systems give it 90%+ keyword match.

    Return ONLY the rewritten summary, nothing else.`

    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an elite ATS optimization specialist and professional resume writer. Your ONLY goal is to pack as many relevant keywords from the job description into the summary as possible while keeping it professional and realistic. Be EXTREMELY aggressive with keyword density. Think like an ATS system - more matching keywords = higher score. DO NOT hold back on keywords.'
        },
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      temperature: 0.9,
      max_tokens: 500
    })

    improvements.summary = summaryResponse.choices[0].message.content.trim()

    // Improve ALL experience items - HYPER-AGGRESSIVE
    for (const exp of resumeData.experience) {
      const expPrompt = `Job Title: ${exp.title}
      Company: ${exp.company}
      Current Description: ${exp.description.join('. ')}

      Target Job Description: ${jobDescription}

      CRITICAL GAPS TO FIX: ${gaps.join(' | ')}

      REQUIRED KEYWORDS TO INCORPORATE: ${analysis.keywords.slice(0, 10).join(', ')}
      REQUIRED TECHNICAL SKILLS: ${analysis.technicalSkills.join(', ')}
      KEY RESPONSIBILITIES FROM JOB: ${analysis.responsibilities.slice(0, 3).join(' | ')}

      TASK: Generate 6-8 HYPER-TARGETED bullet points that MAXIMIZE match with the job description to achieve 95%+ score.

      MANDATORY REQUIREMENTS FOR EACH BULLET (ALL MUST BE MET):
      - Start with power action verbs (Led, Architected, Spearheaded, Engineered, Drove, Optimized, Delivered, Designed)
      - Include SPECIFIC quantifiable metrics (%, $, exact numbers, scale, time saved, team size)
      - Incorporate 3-4 EXACT KEYWORDS from the required list in EACH bullet
      - Directly address at least one of the critical gaps mentioned
      - Mirror EXACT language and terminology from the target job description
      - Show measurable impact and business results, not just responsibilities
      - Include 2-3 relevant technical skills/tools from the requirements IN EACH BULLET
      - Make each bullet 15-25 words for maximum keyword density

      QUALITY EXAMPLES (COPY THIS STYLE):
      - "Architected and deployed scalable microservices infrastructure using Docker, Kubernetes, and AWS, reducing deployment time by 60% and supporting 2M+ daily active users across 15 regions"
      - "Led cross-functional agile team of 8 engineers to deliver React-based SaaS platform with CI/CD pipeline, increasing customer retention by 35% and revenue by $1.2M annually"
      - "Spearheaded cloud migration initiative from on-premise to AWS, implementing auto-scaling and monitoring, cutting infrastructure costs by 45% while improving uptime to 99.99%"

      GOAL: Each bullet should contain so many job-specific keywords that ATS systems score it 95%+.

      Return 6-8 bullets in JSON format:
      {
        "bullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5", ...]
      }`

      const expResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an elite resume writer and ATS optimization expert. Your ONLY job is to generate bullet points with MAXIMUM keyword density from the job description. Pack 3-4 exact keywords from the job posting into EVERY SINGLE bullet. Include specific technical skills, tools, and methodologies mentioned in the job description. Be EXTREMELY aggressive - think like an ATS parser that counts keyword matches. More keywords = higher score. DO NOT be conservative.'
          },
          {
            role: 'user',
            content: expPrompt
          }
        ],
        temperature: 1.0,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      })

      const expData = JSON.parse(expResponse.choices[0].message.content)
      improvements.experience.push({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        improvedBullets: expData.bullets || []
      })
    }

    // Suggest missing skills - AGGRESSIVE KEYWORD MATCHING
    const currentSkillsList = resumeData.skills.flatMap(cat => cat.skills).join(', ')

    const skillsPrompt = `Current Skills: ${currentSkillsList}

    Job Description: ${jobDescription}

    CRITICAL GAPS: ${gaps.join(' | ')}

    REQUIRED TECHNICAL SKILLS FROM JOB: ${analysis.technicalSkills.join(', ')}
    REQUIRED SOFT SKILLS FROM JOB: ${analysis.softSkills.join(', ')}
    IMPORTANT KEYWORDS: ${analysis.keywords.join(', ')}

    TASK: Extract 15-20 HIGH-IMPACT skills that are MISSING from current skills but appear in the job description. Be AGGRESSIVE.

    CRITICAL REQUIREMENTS:
    - Extract EVERY skill keyword that appears in the job description
    - Include ALL technical skills mentioned (languages, frameworks, tools, platforms)
    - Include ALL soft skills mentioned (leadership, communication, agile, etc.)
    - Include ALL methodologies mentioned (Scrum, CI/CD, DevOps, etc.)
    - Prioritize skills mentioned in the critical gaps
    - DO NOT suggest skills already in the current skills list (check carefully for duplicates)
    - Include acronyms AND full names if both appear in job description

    GOAL: Extract every possible skill keyword to maximize ATS match.

    Return 15-20 skills in JSON format:
    {
      "skills": ["skill1", "skill2", "skill3", ..., "skill15"]
    }`

    const skillsResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an ATS keyword extraction expert. Your job is to extract EVERY SINGLE skill keyword from the job description that is not already in the resume. Be EXTREMELY thorough and aggressive. Extract all technologies, tools, methodologies, soft skills, and industry terms. The goal is maximum keyword coverage for ATS systems.'
        },
        {
          role: 'user',
          content: skillsPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 400,
      response_format: { type: 'json_object' }
    })

    const skillsData = JSON.parse(skillsResponse.choices[0].message.content)
    improvements.skills = skillsData.skills || []

    return improvements
  } catch (error) {
    console.error('Error auto-improving resume:', error)
    throw new Error('Failed to auto-improve resume. Please try again.')
  }
}

/**
 * Generate 5 different bullet point options for manual selection to reach 98% match
 * Each option directly addresses the "Areas to Improve" gaps
 */
export async function generateMultipleBulletOptions(resumeData, jobDescription, gaps, currentScore) {
  try {
    const prompt = `Job Description: ${jobDescription}

Current Resume Summary: ${resumeData.about}

Current Experience:
${resumeData.experience.map(exp =>
  `${exp.title} at ${exp.company}:\n${exp.description.map(d => `• ${d}`).join('\n')}`
).join('\n\n')}

Current Skills: ${resumeData.skills.flatMap(cat => cat.skills).join(', ')}

Current Match Score: ${currentScore.matchScore}%
Target: 98%

⚠️ CRITICAL "AREAS TO IMPROVE" FROM MATCH ANALYSIS:
${gaps.map((gap, idx) => `${idx + 1}. ${gap}`).join('\n')}

TASK: Generate 5 DIFFERENT OPTIONS of bullet points. Each option MUST directly address ALL the "Areas to Improve" listed above, but from different strategic angles.

MANDATORY REQUIREMENTS FOR EACH OPTION:
- MUST contain 3-5 bullet points
- EVERY SINGLE bullet must address at least ONE specific gap from the "Areas to Improve" list
- Each option takes a different strategic approach (leadership, technical, business, scale, innovation)
- Include specific metrics (%, $, numbers, team size, users, time)
- Use exact keywords and terminology from the gaps
- Make bullets sound realistic based on the current resume context

EXAMPLE OF HOW TO ADDRESS GAPS:
If gap is "Lacks cloud deployment experience":
→ "Led migration of legacy applications to AWS cloud infrastructure, deploying containerized microservices using Docker and Kubernetes, reducing infrastructure costs by 35%"

If gap is "Missing agile methodology experience":
→ "Spearheaded adoption of Scrum framework across 3 engineering teams, implementing sprint planning and daily standups, accelerating feature delivery by 40%"

OPTION THEMES (each must address ALL gaps, just from different angles):

1. LEADERSHIP & TEAM IMPACT:
   - Address gaps through team leadership, mentoring, cross-functional collaboration
   - Example: "Led team of X to implement [gap area], achieving [metric]"

2. TECHNICAL EXCELLENCE:
   - Address gaps through technical implementation, architecture, optimization
   - Example: "Architected and implemented [gap area] using [technologies], improving [metric]"

3. BUSINESS RESULTS:
   - Address gaps through business impact, revenue, cost savings
   - Example: "Drove [gap area] initiative, generating $X revenue / saving $X costs"

4. SCALE & PERFORMANCE:
   - Address gaps through scalability, performance, user growth
   - Example: "Scaled [gap area] to support X users/requests, achieving [performance metric]"

5. INNOVATION & MODERNIZATION:
   - Address gaps through innovation, new initiatives, strategic improvements
   - Example: "Pioneered [gap area] strategy, modernizing [system] and positioning company for [outcome]"

CRITICAL: Each bullet within an option should address a DIFFERENT gap from the list. Make sure ALL gaps are covered across the bullets in each option.

Return as JSON:
{
  "options": [
    {
      "theme": "Leadership & Team Impact",
      "bullets": ["bullet addressing gap 1", "bullet addressing gap 2", "bullet addressing gap 3"]
    },
    {
      "theme": "Technical Excellence",
      "bullets": ["bullet addressing gap 1", "bullet addressing gap 2", "bullet addressing gap 3"]
    },
    {
      "theme": "Business Results",
      "bullets": ["bullet addressing gap 1", "bullet addressing gap 2", "bullet addressing gap 3"]
    },
    {
      "theme": "Scale & Performance",
      "bullets": ["bullet addressing gap 1", "bullet addressing gap 2", "bullet addressing gap 3"]
    },
    {
      "theme": "Innovation & Modernization",
      "bullets": ["bullet addressing gap 1", "bullet addressing gap 2", "bullet addressing gap 3"]
    }
  ]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an elite resume strategist specializing in addressing ATS gaps. Your ONLY job is to generate bullet points that DIRECTLY fix the specific "Areas to Improve" gaps. Each bullet must explicitly address a gap from the list using exact keywords. Generate 5 different strategic approaches (Leadership, Technical, Business, Scale, Innovation) but ALL must address the same gaps. Be specific and use metrics. Make each option realistic and professional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.85,
      max_tokens: 1800,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content)
    return result.options || []
  } catch (error) {
    console.error('Error generating multiple bullet options:', error)
    throw new Error('Failed to generate bullet options. Please try again.')
  }
}

/**
 * Generate professional bullet points that directly address specific gaps
 */
export async function generateGapBullets(gaps, jobDescription, currentExperience) {
  try {
    const prompt = `Job Description: ${jobDescription}

Current Experience Context:
${currentExperience.map(exp => `${exp.title} at ${exp.company}`).join('\n')}

CRITICAL GAPS TO ADDRESS:
${gaps.map((gap, idx) => `${idx + 1}. ${gap}`).join('\n')}

TASK: Generate ${gaps.length} POWERFUL resume bullet points, one for each gap listed above.

REQUIREMENTS FOR EACH BULLET:
- Directly addresses the specific gap with concrete achievement
- Includes quantifiable metrics (numbers, %, time, scale)
- Uses strong action verbs (Led, Architected, Drove, Implemented, Optimized)
- Sounds professional and realistic for the roles listed above
- Incorporates keywords from the job description
- Shows clear impact and business value

EXAMPLE FORMAT:
"Led implementation of [technology/approach from gap], reducing [metric] by 45% and improving [business outcome] across team of 12"

Return as JSON array matching the number of gaps:
{
  "bullets": ["bullet addressing gap 1", "bullet addressing gap 2", ...]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an elite resume writer. Create impactful, quantifiable bullet points that directly fill resume gaps. Each bullet must be specific, measurable, and professional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content)
    return result.bullets || []
  } catch (error) {
    console.error('Error generating gap bullets:', error)
    throw new Error('Failed to generate gap-specific bullets. Please try again.')
  }
}

/**
 * Generate multiple content variations for A/B testing
 */
export async function generateContentVariations(currentText, context, numVariations = 3) {
  try {
    const prompt = `Generate ${numVariations} different professional variations of this text:

    Current Text:
    "${currentText}"

    Context: ${context}

    Requirements:
    - Each variation should be unique and professional
    - Maintain the same core message
    - Use different wording and structure
    - Keep similar length

    Return as JSON array:
    {
      "variations": ["variation 1", "variation 2", "variation 3"]
    }`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional copywriter. Generate distinct, high-quality variations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })

    return JSON.parse(response.choices[0].message.content).variations
  } catch (error) {
    console.error('Error generating variations:', error)
    throw new Error('Failed to generate variations. Please try again.')
  }
}
