import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import {
  customizeResume,
  generateSummary,
  improveExperience,
  suggestSkills,
  calculateMatchScore,
  autoImproveResume,
  generateContentVariations,
  generateGapBullets,
  generateMultipleBulletOptions
} from '../services/aiService'
import './JobDescriptionInput.css'

const JobDescriptionInput = () => {
  const {
    resumeData,
    updateJobDescription,
    updateAbout,
    updateExperienceDescription,
    replaceExperienceDescription,
    updateSkills,
    setLoading
  } = useResume()

  const [analyzing, setAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [matchScore, setMatchScore] = useState(null)
  const [scoreHistory, setScoreHistory] = useState([])
  const [showVariations, setShowVariations] = useState(false)
  const [variations, setVariations] = useState([])
  const [error, setError] = useState(null)
  const [iterationCount, setIterationCount] = useState(0)
  const [bulletOptions, setBulletOptions] = useState([])
  const [showBulletOptions, setShowBulletOptions] = useState(false)

  const handleAnalyze = async (autoApply = false) => {
    if (!resumeData.jobDescription.trim()) {
      alert('Please paste a job description first')
      return
    }

    setAnalyzing(true)
    setLoading(true)
    setError(null)

    try {
      if (autoApply) {
        // AUTO-IMPROVE MODE: Apply improvements FIRST, then calculate score
        // Get current score to identify gaps
        const currentScore = await calculateMatchScore(resumeData, resumeData.jobDescription)

        if (currentScore.matchScore >= 95) {
          setMatchScore(currentScore)
          setScoreHistory(prev => [...prev, {
            score: currentScore.matchScore,
            timestamp: new Date().toLocaleTimeString(),
            iteration: iterationCount + 1
          }])
          setIterationCount(prev => prev + 1)

          alert('🎉 Target reached! Your resume is 95%+ optimized!')
          setAnalyzing(false)
          setLoading(false)
          return
        }

        // DIFFERENT STRATEGY BASED ON ITERATION NUMBER
        const isFirstIteration = iterationCount === 0
        let improvements = null

        if (isFirstIteration) {
          // FIRST ITERATION: Major rewrite with keyword optimization
          improvements = await autoImproveResume(
            resumeData,
            resumeData.jobDescription,
            currentScore.gaps
          )

          // Apply improvements to resume
          if (improvements.summary) {
            updateAbout(improvements.summary)
          }

          // Replace entire bullet lists
          improvements.experience.forEach((expImprovement, idx) => {
            if (idx < resumeData.experience.length) {
              replaceExperienceDescription(idx, expImprovement.improvedBullets)
            }
          })

          // Apply skills
          if (improvements.skills && improvements.skills.length > 0 && resumeData.skills.length > 0) {
            const firstCategory = resumeData.skills[0]
            const newSkills = improvements.skills.filter(skill =>
              !firstCategory.skills.some(existing =>
                existing.toLowerCase() === skill.toLowerCase()
              )
            )
            if (newSkills.length > 0) {
              const updatedSkills = [...firstCategory.skills, ...newSkills]
              updateSkills(0, 'skills', updatedSkills)
            }
          }

        } else {
          // SECOND+ ITERATION: SURGICAL - Only add missing gap items to existing bullets
          // Use AI to generate professional bullets that address each gap
          const gapBullets = await generateGapBullets(
            currentScore.gaps,
            resumeData.jobDescription,
            resumeData.experience
          )

          // Add these gap bullets to the FIRST experience entry
          if (resumeData.experience.length > 0 && gapBullets.length > 0) {
            const firstExp = resumeData.experience[0]
            const currentBullets = [...firstExp.description]

            // Add gap-specific bullets to existing bullets (DON'T replace, just ADD)
            const updatedBullets = [...currentBullets, ...gapBullets]
            replaceExperienceDescription(0, updatedBullets)
          }

          // Add gap keywords to skills if not already present
          const gapKeywords = currentScore.gaps.flatMap(gap => {
            // Extract key terms from gaps (more than 3 chars)
            const terms = gap.split(/[\s,]+/).filter(term => term.length > 3)
            return terms
          })

          if (resumeData.skills.length > 0 && gapKeywords.length > 0) {
            const firstCategory = resumeData.skills[0]
            const newSkillsFromGaps = gapKeywords.filter(skill =>
              !firstCategory.skills.some(existing =>
                existing.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(existing.toLowerCase())
              )
            ).slice(0, 5)

            if (newSkillsFromGaps.length > 0) {
              const updatedSkills = [...firstCategory.skills, ...newSkillsFromGaps]
              updateSkills(0, 'skills', updatedSkills)
            }
          }

          // Store the gap bullets for display in suggestions
          improvements = {
            summary: null,
            experience: [{
              id: resumeData.experience[0]?.id,
              title: resumeData.experience[0]?.title,
              company: resumeData.experience[0]?.company,
              improvedBullets: gapBullets
            }],
            skills: gapKeywords.slice(0, 5)
          }
        }

        // Wait for state to update (important - increased to 1000ms for comprehensive updates!)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // NOW calculate the NEW score with improved content
        // CRITICAL: Manually build updated data with improvements, since resumeData is stale
        const updatedResumeData = {
          ...resumeData,
          // Apply summary improvement if it exists
          about: improvements?.summary || resumeData.about,
          // Apply experience improvements
          experience: resumeData.experience.map((exp, idx) => {
            if (improvements?.experience && improvements.experience[idx]) {
              const improvement = improvements.experience[idx]
              return {
                ...exp,
                description: improvement.improvedBullets || exp.description
              }
            }
            return exp
          }),
          // Apply skills improvements
          skills: resumeData.skills.map((cat, idx) => {
            if (idx === 0 && improvements?.skills && improvements.skills.length > 0) {
              // Filter out duplicates
              const newSkills = improvements.skills.filter(skill =>
                !cat.skills.some(existing =>
                  existing.toLowerCase().includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(existing.toLowerCase())
                )
              )
              return {
                ...cat,
                skills: [...cat.skills, ...newSkills]
              }
            }
            return cat
          })
        }

        const newScore = await calculateMatchScore(updatedResumeData, resumeData.jobDescription)

        setMatchScore(newScore)
        setScoreHistory(prev => [...prev, {
          score: newScore.matchScore,
          timestamp: new Date().toLocaleTimeString(),
          iteration: iterationCount + 1
        }])
        setIterationCount(prev => prev + 1)

        // Show what changed based on iteration type
        if (improvements) {
          setSuggestions({
            summary: improvements.summary,
            experience: improvements.experience,
            skills: improvements.skills,
            analysis: null
          })
        }

        const scoreImprovement = newScore.matchScore - currentScore.matchScore

        let alertMessage = ''
        if (isFirstIteration) {
          alertMessage = `✅ ITERATION 1 Complete - Major Optimization!

COMPREHENSIVE CHANGES APPLIED:
✨ Rewrote professional summary with job-specific keywords
💼 Completely rewrote all experience sections with 5-7 bullets each
🎯 Added 10-15 missing skills from job description

SCORE PROGRESS:
Before: ${currentScore.matchScore}%
After: ${newScore.matchScore}%
Improvement: +${scoreImprovement.toFixed(1)}%

${newScore.matchScore < 95 ? `NEXT STEP: Iteration 2 will ADD the specific items from "Areas to Improve" shown below to reach 95%!` : '🎉 95% TARGET ACHIEVED!'}`
        } else {
          const gapBulletsAdded = improvements?.experience[0]?.improvedBullets || []
          alertMessage = `✅ ITERATION ${iterationCount + 1} Complete - Gap-Targeted Optimization!

SURGICAL CHANGES APPLIED:
🎯 Added ${gapBulletsAdded.length} NEW professional bullet points addressing gaps:
${gapBulletsAdded.map((bullet, idx) => `   ${idx + 1}. ${bullet.substring(0, 80)}...`).join('\n')}

📝 Kept ALL improvements from previous iterations
✅ Only ADDED missing gap elements (no data removed)
🔑 Added ${improvements?.skills?.length || 0} gap-related skills

SCORE PROGRESS:
Before: ${currentScore.matchScore}%
After: ${newScore.matchScore}%
Improvement: +${scoreImprovement.toFixed(1)}%

${newScore.matchScore < 95 ? `Gap remaining: ${(95 - newScore.matchScore).toFixed(1)}%. Click "Refine Again" to add more!` : '🎉 95% TARGET ACHIEVED! Resume fully optimized!'}`
        }

        alert(alertMessage)

      } else {
        // INITIAL ANALYSIS MODE: Just calculate score and show suggestions
        const scoreData = await calculateMatchScore(resumeData, resumeData.jobDescription)

        setMatchScore(scoreData)
        setScoreHistory(prev => [...prev, {
          score: scoreData.matchScore,
          timestamp: new Date().toLocaleTimeString(),
          iteration: iterationCount + 1
        }])
        setIterationCount(prev => prev + 1)

        if (scoreData.matchScore < 95) {
          const customizationSuggestions = await customizeResume(resumeData, resumeData.jobDescription)
          setSuggestions(customizationSuggestions)
        }
      }

      // Scroll to results
      setTimeout(() => {
        document.querySelector('.ai-results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Error analyzing job description:', error)
      setError(error.message)
      alert(`Error: ${error.message}`)
    } finally {
      setAnalyzing(false)
      setLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const newSummary = await generateSummary(
        resumeData.about,
        resumeData.jobDescription
      )

      if (window.confirm('Apply this AI-generated summary to your resume?\n\n' + newSummary)) {
        updateAbout(newSummary)
        alert('✅ Summary updated successfully!')
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImproveExperience = async () => {
    setLoading(true)
    setError(null)
    try {
      const improvements = await improveExperience(
        resumeData.experience,
        resumeData.jobDescription
      )

      // Show improvements in a formatted alert
      let message = 'AI-Generated Experience Improvements:\n\n'
      improvements.forEach((imp, idx) => {
        message += `${idx + 1}. ${imp.title} at ${imp.company}:\n`
        imp.improvedBullets.forEach(bullet => {
          message += `   • ${bullet}\n`
        })
        message += '\n'
      })
      message += '\nWould you like to apply these improvements?'

      if (window.confirm(message)) {
        improvements.forEach((imp, idx) => {
          imp.improvedBullets.forEach((bullet, bulletIdx) => {
            updateExperienceDescription(idx, bulletIdx, bullet)
          })
        })
        alert('✅ Experience section updated successfully!')
      }
    } catch (error) {
      console.error('Error improving experience:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestSkills = async () => {
    if (!resumeData.jobDescription.trim()) {
      alert('Please paste a job description first to get tailored skill suggestions')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const newSkills = await suggestSkills(
        resumeData.skills,
        resumeData.jobDescription
      )

      const message = `AI suggests adding these skills:\n\n${newSkills.join(', ')}\n\nAdd them to your resume?`

      if (window.confirm(message)) {
        // Add to first skill category or create new one
        if (resumeData.skills.length > 0) {
          const firstCategory = resumeData.skills[0]
          const updatedSkills = [...firstCategory.skills, ...newSkills]
          updateSkills(0, 'skills', updatedSkills)
          alert('✅ Skills added successfully!')
        }
      }
    } catch (error) {
      console.error('Error suggesting skills:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const applySuggestion = (type, data) => {
    switch (type) {
      case 'summary':
        updateAbout(suggestions.summary)
        alert('✅ Summary updated!')
        break
      case 'experience':
        data.suggestedBullets.forEach((bullet, idx) => {
          const expIndex = resumeData.experience.findIndex(e => e.id === data.id)
          if (expIndex !== -1) {
            updateExperienceDescription(expIndex, idx, bullet)
          }
        })
        alert('✅ Experience updated!')
        break
      case 'skills':
        if (resumeData.skills.length > 0) {
          const firstCategory = resumeData.skills[0]
          const updatedSkills = [...firstCategory.skills, ...suggestions.skills]
          updateSkills(0, 'skills', updatedSkills)
          alert('✅ Skills added!')
        }
        break
    }
  }

  const handleGenerateVariations = async () => {
    setLoading(true)
    setError(null)
    try {
      const variantTexts = await generateContentVariations(
        resumeData.about,
        `Job description context: ${resumeData.jobDescription}`,
        3
      )
      setVariations(variantTexts)
      setShowVariations(true)
    } catch (error) {
      console.error('Error generating variations:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const applyVariation = (variationText) => {
    updateAbout(variationText)
    setShowVariations(false)
    alert('✅ Variation applied to your resume!')
  }

  const handleGenerateBulletOptions = async () => {
    if (!matchScore) {
      alert('Please analyze your resume first to see the match score and gaps')
      return
    }

    if (matchScore.matchScore >= 98) {
      alert('🎉 You already have 98%+ match! No need for more optimization.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const options = await generateMultipleBulletOptions(
        resumeData,
        resumeData.jobDescription,
        matchScore.gaps,
        matchScore
      )
      setBulletOptions(options)
      setShowBulletOptions(true)

      // Scroll to options
      setTimeout(() => {
        document.querySelector('.bullet-options-panel')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Error generating bullet options:', error)
      setError(error.message)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const applyBulletOption = async (option) => {
    // Add the selected bullets to the first experience entry
    if (resumeData.experience.length > 0) {
      const firstExp = resumeData.experience[0]
      const currentBullets = [...firstExp.description]
      const updatedBullets = [...currentBullets, ...option.bullets]

      // Create DEEP COPY of resumeData with the NEW bullets included
      const updatedResumeData = {
        ...resumeData,
        experience: resumeData.experience.map((exp, idx) =>
          idx === 0
            ? { ...exp, description: updatedBullets }  // First experience gets new bullets
            : exp  // Other experiences unchanged
        )
      }

      // Calculate score with the UPDATED data (before state update)
      const newScore = await calculateMatchScore(updatedResumeData, resumeData.jobDescription)

      // NOW update the actual state
      replaceExperienceDescription(0, updatedBullets)

      setMatchScore(newScore)
      setScoreHistory(prev => [...prev, {
        score: newScore.matchScore,
        timestamp: new Date().toLocaleTimeString(),
        iteration: iterationCount + 1
      }])
      setIterationCount(prev => prev + 1)

      const improvement = newScore.matchScore - matchScore.matchScore

      alert(`✅ Bullet point added!

Added "${option.bullets[0]}" to your resume.

Score Update:
Before: ${matchScore.matchScore}%
After: ${newScore.matchScore}%
Improvement: +${improvement.toFixed(1)}%

${newScore.matchScore >= 98 ? '🎉 98% TARGET REACHED!' : `${(98 - newScore.matchScore).toFixed(1)}% away from 98% target. Add more bullets to continue improving!`}`)

      // Close the options panel if target reached
      if (newScore.matchScore >= 98) {
        setShowBulletOptions(false)
      }
    }
  }

  return (
    <div className="job-description-panel">
      <div className="job-description-content">
        <div className="job-description-header">
          <h2>🎯 AI-Powered Job Description Analyzer</h2>
          <p>Paste a job description below to automatically customize your resume with AI</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="textarea-wrapper">
          <textarea
            className="job-description-textarea"
            placeholder="Paste the job description here...&#10;&#10;The AI will analyze:&#10;• Required skills and qualifications&#10;• Key responsibilities&#10;• Important keywords&#10;• Company culture indicators&#10;&#10;Then automatically customize your resume to match!"
            value={resumeData.jobDescription}
            onChange={(e) => updateJobDescription(e.target.value)}
            rows={12}
          />
          {resumeData.jobDescription.trim() && (
            <button
              className="clear-textarea-btn"
              onClick={() => updateJobDescription('')}
              title="Clear job description"
            >
              ✕
            </button>
          )}
        </div>

        <div className="job-description-actions">
          <button
            className="analyze-btn primary-btn"
            onClick={handleAnalyze}
            disabled={analyzing || !resumeData.jobDescription.trim()}
          >
            {analyzing ? '🔄 Analyzing with AI...' : '🤖 Analyze & Customize Resume'}
          </button>

          <div className="ai-actions">
            <span className="ai-actions-label">Quick AI Actions:</span>
            <button
              className="ai-action-btn"
              onClick={handleGenerateSummary}
              disabled={analyzing}
            >
              ✨ Generate Summary
            </button>
            <button
              className="ai-action-btn"
              onClick={handleImproveExperience}
              disabled={analyzing}
            >
              💼 Improve Experience
            </button>
            <button
              className="ai-action-btn"
              onClick={handleSuggestSkills}
              disabled={analyzing}
            >
              🎓 Suggest Skills
            </button>
          </div>
        </div>

        {resumeData.jobDescription.trim() && (
          <div className="job-description-stats">
            <span>📝 {resumeData.jobDescription.split(/\s+/).length} words</span>
            <span>🔤 {resumeData.jobDescription.length} characters</span>
          </div>
        )}

        {/* AI Analysis Results */}
        {suggestions && (
          <div className="ai-results">
            <h3 className="results-title">🎉 AI Analysis Complete!</h3>

            {/* Match Score */}
            {matchScore && (
              <div className="match-score-card">
                <div className="match-score-header">
                  <h4>Resume Match Score</h4>
                  <div className="score-circle">
                    <span className="score-number">{matchScore.matchScore}%</span>
                  </div>
                </div>

                <div className="match-details">
                  <div className="match-section">
                    <h5>✅ Strengths</h5>
                    <ul>
                      {matchScore.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="match-section">
                    <h5>⚠️ Areas to Improve</h5>
                    <ul>
                      {matchScore.gaps.map((gap, idx) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Improvements */}
            <div className="suggestions-container">
              {/* Summary Suggestion */}
              {suggestions.summary && (
                <div className="suggestion-card">
                  <h4>📝 Improved Professional Summary</h4>
                  <p className="suggestion-text">{suggestions.summary}</p>
                  <button
                    className="apply-btn"
                    onClick={() => applySuggestion('summary')}
                  >
                    ✅ Apply to Resume
                  </button>
                </div>
              )}

              {/* Experience Suggestions */}
              {suggestions.experience && suggestions.experience.map((exp, idx) => (
                <div key={idx} className="suggestion-card">
                  <h4>💼 {exp.originalTitle || exp.title} {exp.company ? `at ${exp.company}` : ''}</h4>
                  <p className="suggestion-label">
                    {exp.improvedBullets ? 'Auto-Applied Improvements:' : 'AI-Generated Bullet Points:'}
                  </p>
                  <ul className="suggestion-bullets">
                    {(exp.improvedBullets || exp.suggestedBullets || []).map((bullet, bidx) => (
                      <li key={bidx}>{bullet}</li>
                    ))}
                  </ul>
                  {exp.suggestedBullets && !exp.improvedBullets && (
                    <button
                      className="apply-btn"
                      onClick={() => applySuggestion('experience', exp)}
                    >
                      ✅ Apply to Resume
                    </button>
                  )}
                  {exp.improvedBullets && (
                    <div className="applied-badge">
                      ✅ Already Applied to Your Resume
                    </div>
                  )}
                </div>
              ))}

              {/* Skills Suggestions */}
              {suggestions.skills && suggestions.skills.length > 0 && (
                <div className="suggestion-card">
                  <h4>🎓 Suggested Skills to Add</h4>
                  <div className="skills-suggestion">
                    {suggestions.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                  <button
                    className="apply-btn"
                    onClick={() => applySuggestion('skills')}
                  >
                    ✅ Add All Skills
                  </button>
                </div>
              )}

              {/* Key Insights */}
              {suggestions.analysis && (
                <div className="suggestion-card analysis-card">
                  <h4>🔍 Job Description Analysis</h4>

                  <div className="analysis-section">
                    <h5>Technical Skills Required:</h5>
                    <div className="analysis-tags">
                      {suggestions.analysis.technicalSkills.map((skill, idx) => (
                        <span key={idx} className="analysis-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <h5>Important Keywords for ATS:</h5>
                    <div className="analysis-tags">
                      {suggestions.analysis.keywords.map((keyword, idx) => (
                        <span key={idx} className="analysis-tag keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Tracker */}
            {scoreHistory.length > 0 && (
              <div className="progress-tracker">
                <h4>📊 Score Progress</h4>
                <div className="score-timeline">
                  {scoreHistory.map((entry, idx) => (
                    <div key={idx} className="score-entry">
                      <div className="score-badge" style={{
                        backgroundColor: entry.score >= 95 ? '#4caf50' : entry.score >= 80 ? '#ff9800' : '#f44336'
                      }}>
                        {entry.score}%
                      </div>
                      <div className="score-info">
                        <span>Iteration {entry.iteration}</span>
                        <span className="score-time">{entry.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {matchScore && matchScore.matchScore < 95 && (
                  <div className="refine-prompt">
                    <p>💡 Current score: <strong>{matchScore.matchScore}%</strong> - Let's get it to 95%!</p>
                    <p className="refine-instructions">Click "Refine Again" to automatically improve your resume bullet points</p>
                    <button
                      className="refine-again-btn"
                      onClick={() => handleAnalyze(true)}
                      disabled={analyzing}
                    >
                      {analyzing ? '🔄 Auto-Improving Resume...' : '🚀 Refine Again (Auto-Apply)'}
                    </button>
                  </div>
                )}

                {matchScore && matchScore.matchScore >= 90 && matchScore.matchScore < 98 && (
                  <div className="manual-options-prompt">
                    <p>🎯 Want to fine-tune to 98%? Get individual bullet point options addressing "Areas to Improve"!</p>
                    <p style={{fontSize: '0.95rem', opacity: 0.9, marginTop: '0.5rem'}}>
                      Each bullet directly fixes a specific gap shown above - add them individually as needed
                    </p>
                    <button
                      className="generate-options-btn"
                      onClick={handleGenerateBulletOptions}
                      disabled={analyzing}
                    >
                      {analyzing ? '🔄 Generating Individual Bullet Options...' : '🎨 Generate Individual Bullet Options from "Areas to Improve"'}
                    </button>
                  </div>
                )}
                {matchScore && matchScore.matchScore >= 95 && (
                  <div className="success-message">
                    🎉 Excellent! Your resume is highly optimized for this job!
                  </div>
                )}
              </div>
            )}


            {/* Variations Panel */}
            <div className="variations-section">
              <button
                className="generate-variations-btn"
                onClick={handleGenerateVariations}
                disabled={analyzing || !resumeData.about}
              >
                🎨 Generate Summary Variations
              </button>
            </div>

            {showVariations && variations.length > 0 && (
              <div className="variations-panel">
                <h4>✨ Choose Your Favorite Summary</h4>
                <div className="variations-grid">
                  {variations.map((variation, idx) => (
                    <div key={idx} className="variation-card">
                      <div className="variation-header">
                        <span className="variation-label">Variation {idx + 1}</span>
                      </div>
                      <p className="variation-text">{variation}</p>
                      <button
                        className="apply-variation-btn"
                        onClick={() => applyVariation(variation)}
                      >
                        ✅ Use This One
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="close-variations-btn"
                  onClick={() => setShowVariations(false)}
                >
                  Close Variations
                </button>
              </div>
            )}

            {showBulletOptions && bulletOptions.length > 0 && (
              <div className="bullet-options-panel">
                <div className="bullet-options-header">
                  <h3>🎯 Individual Bullet Points to Fix "Areas to Improve"</h3>
                  <p>Each bullet below directly addresses a specific gap from your match analysis. Click + to add any bullet you like.</p>
                  {matchScore && matchScore.gaps && (
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginTop: '1rem',
                      textAlign: 'left'
                    }}>
                      <strong style={{color: 'white'}}>⚠️ Gaps Being Addressed:</strong>
                      <ul style={{margin: '0.5rem 0 0 1.5rem', color: 'rgba(255,255,255,0.95)'}}>
                        {matchScore.gaps.map((gap, idx) => (
                          <li key={idx}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="bullet-options-grid">
                  {bulletOptions.map((option, idx) => (
                    <div key={idx} className="bullet-option-card individual-bullet-card">
                      <div className="option-header">
                        <span className="option-number">#{idx + 1}</span>
                        <span className="option-theme">{option.theme}</span>
                      </div>
                      <div className="individual-bullet-text">
                        {option.bullets[0]}
                      </div>
                      <button
                        className="apply-option-btn"
                        onClick={() => applyBulletOption(option)}
                        disabled={analyzing}
                      >
                        + Add This Bullet
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="close-options-btn"
                  onClick={() => setShowBulletOptions(false)}
                >
                  Close Options
                </button>
              </div>
            )}

            <button
              className="clear-results-btn"
              onClick={() => {
                setSuggestions(null)
                setScoreHistory([])
                setIterationCount(0)
                setMatchScore(null)
              }}
            >
              Clear All Results
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDescriptionInput
