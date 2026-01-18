import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
})

/**
 * Generate professional summary based on user's background
 * NEW: Creates scannable bullet-point format (6-9 lines, 80-120 words)
 */
export async function generateSummary(currentSummary, jobDescription = '') {
  try {
    const prompt = jobDescription
      ? `Based on this job description: "${jobDescription}"

         And this current professional summary: "${currentSummary}"

         Generate an improved, tailored professional summary in BULLET-POINT FORMAT.

         CRITICAL REQUIREMENTS:
         - Create 6-9 concise bullet points (total 80-120 words)
         - Each bullet should be ONE line (12-15 words max)
         - Start each bullet with a different power word (avoid repetition)
         - First 2-3 bullets should include scale/scope (team size, budget, users, projects)
         - Include specific technical skills and keywords from job description
         - Make it scannable - recruiters should grasp value in 10 seconds
         - Use varied sentence structures - NO repetition

         POWER WORDS TO VARY:
         • Results-driven, Strategic, Certified, Award-winning, Accomplished
         • Expert, Proficient, Skilled, Specialized, Proven
         • Innovative, Analytical, Detail-oriented, Collaborative

         EXAMPLE FORMAT:
         • Results-driven [Role] with 10+ years managing teams of 15+ and budgets exceeding $5M
         • Expert in [Skill 1], [Skill 2], and [Skill 3] with proven track record in [Industry]
         • Successfully delivered 50+ projects serving 2M+ users across global markets
         • Certified in [Certification] with deep expertise in [Technical Area]
         • Strong background in [Domain] achieving 40% efficiency gains and $2M cost savings
         • Proven ability to lead cross-functional initiatives and drive organizational change

         Return ONLY the bullet points (no intro text, no explanations), one per line, starting with bullet symbol (•).`
      : `Improve this professional summary: "${currentSummary}"

         Create it as 6-9 scannable bullet points (80-120 words total).
         Each bullet should be one concise line highlighting a key strength.
         Include numbers, scale, and specific achievements where possible.
         Return only the bullets, one per line, starting with (•).`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer specializing in ATS-optimized, scannable summaries. Create bullet-point summaries that are concise, impactful, and easy to skim. Each bullet should be a complete thought in 12-15 words. Vary your language - never repeat the same power words. Focus on scale, scope, and measurable achievements. Return ONLY the bullets with • symbols.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400
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

    // Improve summary - SCANNABLE BULLET FORMAT
    const summaryPrompt = `Current Summary: "${resumeData.about}"

    Job Description: ${jobDescription}

    CRITICAL GAPS TO ADDRESS: ${gaps.join(' | ')}

    REQUIRED KEYWORDS: ${analysis.keywords.join(', ')}
    REQUIRED TECHNICAL SKILLS: ${analysis.technicalSkills.join(', ')}
    REQUIRED SOFT SKILLS: ${analysis.softSkills.join(', ')}

    TASK: Create a SCANNABLE, BULLET-POINT professional summary that achieves 95%+ ATS match.

    CRITICAL FORMAT REQUIREMENTS:
    - Create 6-9 concise bullet points (80-120 words total)
    - Each bullet ONE line only (12-15 words max)
    - Start each bullet with DIFFERENT power words (Results-driven, Expert, Accomplished, Certified, Strategic, Proven, Innovative, Skilled)
    - First 2-3 bullets MUST include scale/scope (team size, budget, # projects, users, environments)
    - Include 8-10 exact keywords from job description across all bullets
    - Directly address critical gaps
    - NO repetition of sentence structures or power words

    EXAMPLE SCALE CONTEXT (use in first 2-3 bullets):
    • Results-driven [Role] with 10+ years leading teams of 15+ and managing $5M+ budgets
    • Successfully delivered 50+ enterprise projects serving 2M+ users across 10 global regions

    GOAL: Recruiter can skim in 10 seconds and see perfect match. ATS scores 95%+.

    Return ONLY the bullet points (one per line, starting with •), nothing else.`

    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an elite ATS optimization specialist. Create SCANNABLE bullet-point summaries (not paragraphs). Each bullet should be 12-15 words max. Vary your power words - never repeat. Include scale/scope early (team size, budget, projects, users). Pack keywords while staying professional. Return ONLY bullets with • symbols.'
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

    // Improve ALL experience items - OPTIMIZED FOR READABILITY + ATS
    for (const exp of resumeData.experience) {
      const expPrompt = `Job Title: ${exp.title}
      Company: ${exp.company}
      Current Description: ${exp.description.join('. ')}

      Target Job Description: ${jobDescription}

      CRITICAL GAPS TO FIX: ${gaps.join(' | ')}

      REQUIRED KEYWORDS TO INCORPORATE: ${analysis.keywords.slice(0, 10).join(', ')}
      REQUIRED TECHNICAL SKILLS: ${analysis.technicalSkills.join(', ')}
      KEY RESPONSIBILITIES FROM JOB: ${analysis.responsibilities.slice(0, 3).join(' | ')}

      TASK: Generate EXACTLY 6-7 TARGETED, SCANNABLE bullet points (NOT 8+) that achieve 95%+ ATS match while remaining readable.

      CRITICAL REQUIREMENTS FOR EACH BULLET:
      ✅ EXACTLY 6-7 bullets (not more, not less)
      ✅ Each bullet 15-20 words MAX (NOT 25+) for scannability
      ✅ VARY action verbs - use DIFFERENT verb for each bullet from this list:
         - Architected, Spearheaded, Drove, Implemented, Optimized, Delivered, Established, Streamlined, Engineered, Designed, Pioneered, Orchestrated, Scaled, Transformed
      ✅ NO repetition - each bullet should start differently and use varied structure
      ✅ First 2-3 bullets should include SCALE CONTEXT (team size, budget, # projects, users, systems supported)
      ✅ Include specific metrics in EVERY bullet (%, $, numbers, time, scale)
      ✅ Pack 3-4 exact keywords from job description in each bullet
      ✅ Show: Scope → Action → Measurable Outcome

      STRUCTURE VARIETY (use different patterns):
      1. "Architected [system] supporting X users, achieving Y% improvement in Z metric"
      2. "Led team of X to deliver [project], reducing costs by $Y and increasing Z by 40%"
      3. "Implemented [technology] across X environments, driving Y% efficiency gains"
      4. "Drove [initiative] managing $X budget, resulting in Y% revenue growth"
      5. "Optimized [process] serving X customers, cutting deployment time by Y%"
      6. "Delivered [project] with team of X, improving performance by Y% and saving $Z"

      GOOD EXAMPLES (15-20 words each):
      - "Architected scalable microservices infrastructure supporting 2M+ users, reducing deployment time by 60% using Docker and Kubernetes"
      - "Led agile team of 8 engineers delivering SaaS platform, increasing retention by 35% and generating $1.2M annual revenue"
      - "Implemented cloud migration across 15 production environments, cutting infrastructure costs by 45% while achieving 99.99% uptime"

      GOAL: Scannable bullets that score 95%+ on ATS while being easy to read.

      Return EXACTLY 6-7 bullets in JSON format:
      {
        "bullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5", "bullet 6", "bullet 7"]
      }`

      const expResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an elite resume writer balancing ATS optimization with human readability. Generate EXACTLY 6-7 bullets (not 8+). Each bullet 15-20 words MAX. VARY your action verbs - never use the same verb twice. Include scale/scope early (team size, budget, users). Structure: Scope → Action → Outcome. Pack keywords but keep scannable. Return valid JSON with bullets array.'
          },
          {
            role: 'user',
            content: expPrompt
          }
        ],
        temperature: 1.0,
        max_tokens: 900,
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

TASK: Generate 10-15 INDIVIDUAL bullet points. Each bullet point addresses ONE specific gap from the "Areas to Improve" list above.

MANDATORY REQUIREMENTS:
- Generate 10-15 individual bullet points (NOT grouped)
- Each bullet MUST directly address ONE specific gap from the "Areas to Improve" list
- Use variety in strategic approaches: leadership, technical, business impact, scale, innovation
- Include specific metrics (%, $, numbers, team size, users, time)
- Use exact keywords and terminology from the gaps
- Make bullets sound realistic based on the current resume context
- Each bullet should stand alone as a complete achievement

EXAMPLE OF HOW TO ADDRESS GAPS:
If gap is "Lacks cloud deployment experience":
→ "Led migration of legacy applications to AWS cloud infrastructure, deploying containerized microservices using Docker and Kubernetes, reducing infrastructure costs by 35%"

If gap is "Missing agile methodology experience":
→ "Spearheaded adoption of Scrum framework across 3 engineering teams, implementing sprint planning and daily standups, accelerating feature delivery by 40%"

STRATEGIC VARIETY (use different angles across your bullets):
- Leadership: "Led team of X to implement [gap area], achieving [metric]"
- Technical: "Architected and implemented [gap area] using [technologies], improving [metric]"
- Business: "Drove [gap area] initiative, generating $X revenue / saving $X costs"
- Scale: "Scaled [gap area] to support X users/requests, achieving [performance metric]"
- Innovation: "Pioneered [gap area] strategy, modernizing [system] and positioning company for [outcome]"

CRITICAL: Make sure to address ALL gaps from the list. Some gaps can have multiple bullet options if there are fewer gaps than bullets.

Return as JSON (flat array of individual bullets):
{
  "bullets": [
    {
      "text": "First individual bullet point addressing a specific gap",
      "category": "Leadership & Team Impact"
    },
    {
      "text": "Second individual bullet point addressing another gap",
      "category": "Technical Excellence"
    },
    {
      "text": "Third individual bullet point",
      "category": "Business Results"
    }
    // ... 10-15 total individual bullets
  ]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an elite resume strategist specializing in addressing ATS gaps. Your ONLY job is to generate INDIVIDUAL bullet points that DIRECTLY fix the specific "Areas to Improve" gaps. Each bullet must explicitly address one gap from the list using exact keywords. Use variety in strategic approaches (Leadership, Technical, Business, Scale, Innovation). Be specific and use metrics. Make each bullet realistic and professional. Generate 10-15 individual bullets as a flat array, NOT grouped into options.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.85,
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content)
    // Transform flat bullet array into individual options for compatibility
    const bullets = result.bullets || []
    return bullets.map((bullet, idx) => ({
      theme: bullet.category || 'Professional Achievement',
      bullets: [bullet.text],
      isIndividual: true
    }))
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
 * Categorize skills into structured groups for better ATS parsing and readability
 * Returns skills organized into: Business Analysis, Technical & Modeling, Agile/Project Management, Tools/Software
 */
export async function categorizeSkills(skillsList, jobDescription = '') {
  try {
    const prompt = `Skills List: ${skillsList.join(', ')}

    ${jobDescription ? `Job Description Context: ${jobDescription}` : ''}

    TASK: Organize these skills into 4 SPECIFIC categories for optimal ATS parsing and recruiter readability.

    REQUIRED CATEGORIES (use exactly these names):
    1. "Business Analysis" - Business requirements, stakeholder management, process improvement, domain knowledge
    2. "Technical & Modeling" - Programming languages, databases, data modeling, architecture, technical design
    3. "Agile/Project Management" - Scrum, Kanban, sprint planning, project coordination, delivery methodologies
    4. "Tools/Software" - Specific software, platforms, and tools (JIRA, Confluence, Figma, etc.)

    CATEGORIZATION RULES:
    - Every skill must go into ONE category only (no duplicates)
    - If a skill fits multiple categories, choose the MOST relevant one
    - Keep skill names exactly as provided (don't modify)
    - If job description is provided, prioritize skills mentioned in it
    - Empty categories are OK if no skills fit

    EXAMPLES:
    Business Analysis: Requirements Gathering, Stakeholder Management, Business Process Modeling, Gap Analysis, User Stories
    Technical & Modeling: Python, SQL, Data Modeling, System Architecture, API Design, PostgreSQL, React
    Agile/Project Management: Scrum, Agile Methodologies, Sprint Planning, Kanban, Release Management, Roadmap Planning
    Tools/Software: JIRA, Confluence, Figma, Git, Docker, Tableau, AWS, Azure DevOps

    Return in JSON format:
    {
      "Business Analysis": ["skill1", "skill2", ...],
      "Technical & Modeling": ["skill1", "skill2", ...],
      "Agile/Project Management": ["skill1", "skill2", ...],
      "Tools/Software": ["skill1", "skill2", ...]
    }`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at organizing resume skills for ATS optimization. Categorize skills into exactly 4 groups: Business Analysis, Technical & Modeling, Agile/Project Management, and Tools/Software. Every skill goes in one category only. Keep skill names unchanged. Return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    })

    const categorized = JSON.parse(response.choices[0].message.content)

    // Ensure all categories exist (even if empty)
    return {
      'Business Analysis': categorized['Business Analysis'] || [],
      'Technical & Modeling': categorized['Technical & Modeling'] || [],
      'Agile/Project Management': categorized['Agile/Project Management'] || [],
      'Tools/Software': categorized['Tools/Software'] || []
    }
  } catch (error) {
    console.error('Error categorizing skills:', error)
    throw new Error('Failed to categorize skills. Please try again.')
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
