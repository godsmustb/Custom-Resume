/**
 * Landing Page Component
 * Persuasive SaaS landing page with social proof and urgency tactics
 */

import { useState, useEffect } from 'react'
import './LandingPage.css'

const LandingPage = ({ onGetStarted, onViewPricing }) => {
  // Animated counter for social proof
  const [userCount, setUserCount] = useState(0)
  const [resumeCount, setResumeCount] = useState(0)
  const targetUsers = 47832
  const targetResumes = 156429

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const userIncrement = targetUsers / steps
    const resumeIncrement = targetResumes / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setUserCount(Math.min(Math.floor(userIncrement * currentStep), targetUsers))
      setResumeCount(Math.min(Math.floor(resumeIncrement * currentStep), targetResumes))
      if (currentStep >= steps) clearInterval(timer)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "Got 3 interviews within a week of using this tool. The AI suggestions were spot-on!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Marketing Director",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "Finally landed my dream job after 6 months of searching. This resume builder changed everything.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist at Meta",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "The ATS optimization feature helped me get past the automated screening. Highly recommend!",
      rating: 5
    }
  ]

  // Company logos for trust badges
  const trustedCompanies = [
    { name: 'Google', logo: '🔍' },
    { name: 'Microsoft', logo: '🪟' },
    { name: 'Amazon', logo: '📦' },
    { name: 'Meta', logo: '👤' },
    { name: 'Apple', logo: '🍎' },
    { name: 'Netflix', logo: '🎬' }
  ]

  // Features list
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Optimization',
      description: 'Our AI analyzes job descriptions and tailors your resume for maximum impact. 95%+ ATS pass rate guaranteed.'
    },
    {
      icon: '📊',
      title: 'Real-Time ATS Scoring',
      description: 'See exactly how your resume scores against applicant tracking systems before you apply.'
    },
    {
      icon: '🎨',
      title: '51 Professional Templates',
      description: 'Choose from our library of recruiter-approved templates designed to stand out.'
    },
    {
      icon: '⚡',
      title: 'Instant Generation',
      description: 'Create a job-winning resume in under 5 minutes. No design skills required.'
    },
    {
      icon: '📝',
      title: 'Cover Letter Builder',
      description: '30 professional templates with smart placeholders. Never write from scratch again.'
    },
    {
      icon: '☁️',
      title: 'Cloud Sync & History',
      description: 'Access your resumes anywhere. Track versions and restore previous drafts instantly.'
    }
  ]

  return (
    <div className="landing-page">
      {/* Urgency Banner */}
      <div className="urgency-banner">
        <span className="urgency-icon">🔥</span>
        <span className="urgency-text">
          <strong>LIMITED TIME:</strong> Get 50% off your first credit package!
          <span className="urgency-timer">Offer ends in 23:47:12</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-icon">📄</span>
          <span className="logo-text">ResumeAI Pro</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#testimonials">Success Stories</a>
          <button className="nav-pricing-btn" onClick={onViewPricing}>Pricing</button>
          <button className="nav-login-btn" onClick={onGetStarted}>Sign In</button>
          <button className="nav-cta-btn" onClick={onGetStarted}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">⭐</span>
            <span>Rated #1 Resume Builder of 2026</span>
          </div>

          <h1 className="hero-title">
            Land Your Dream Job <br />
            <span className="gradient-text">10x Faster</span> With AI
          </h1>

          <p className="hero-subtitle">
            Stop getting rejected by ATS systems. Our AI-powered resume builder
            creates <strong>perfectly optimized resumes</strong> that get you interviews,
            not silence.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{userCount.toLocaleString()}+</span>
              <span className="stat-label">Happy Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{resumeCount.toLocaleString()}+</span>
              <span className="stat-label">Resumes Created</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">89%</span>
              <span className="stat-label">Interview Rate</span>
            </div>
          </div>

          <div className="hero-cta">
            <button className="cta-primary" onClick={onGetStarted}>
              <span>Create Your Resume Now</span>
              <span className="cta-arrow">→</span>
            </button>
            <span className="cta-subtext">
              ✓ No credit card required &nbsp;•&nbsp; ✓ 3 free credits to start
            </span>
          </div>

          {/* Social Proof - Real-time activity */}
          <div className="live-activity">
            <div className="activity-dot"></div>
            <span>
              <strong>127 people</strong> created a resume in the last hour
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <div className="floating-badge top-left">
              <span className="badge-emoji">✅</span>
              <span>ATS Optimized</span>
            </div>
            <div className="floating-badge top-right">
              <span className="badge-emoji">📈</span>
              <span>Score: 96%</span>
            </div>
            <div className="floating-badge bottom-left">
              <span className="badge-emoji">⚡</span>
              <span>Generated in 30s</span>
            </div>
            <div className="resume-preview">
              <div className="preview-header"></div>
              <div className="preview-line long"></div>
              <div className="preview-line medium"></div>
              <div className="preview-section"></div>
              <div className="preview-line long"></div>
              <div className="preview-line short"></div>
              <div className="preview-line medium"></div>
              <div className="preview-section"></div>
              <div className="preview-line long"></div>
              <div className="preview-line medium"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section">
        <p className="trust-label">Trusted by professionals from</p>
        <div className="trust-logos">
          {trustedCompanies.map((company, index) => (
            <div key={index} className="trust-logo">
              <span className="company-logo">{company.logo}</span>
              <span className="company-name">{company.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="problem-section">
        <div className="problem-content">
          <h2 className="section-title">
            75% of Resumes Are <span className="highlight-red">Rejected</span> by ATS
          </h2>
          <p className="section-subtitle">
            Most job seekers don't realize their resumes never reach human eyes.
            Applicant Tracking Systems filter them out before recruiters even see them.
          </p>

          <div className="comparison-grid">
            <div className="comparison-card bad">
              <div className="card-header">
                <span className="card-icon">❌</span>
                <h3>Without ResumeAI Pro</h3>
              </div>
              <ul className="comparison-list">
                <li>Generic templates that don't pass ATS</li>
                <li>Hours spent formatting and rewriting</li>
                <li>No idea why you're not getting callbacks</li>
                <li>Applying to 100+ jobs with no results</li>
                <li>Missing crucial keywords recruiters want</li>
              </ul>
            </div>

            <div className="comparison-card good">
              <div className="card-header">
                <span className="card-icon">✅</span>
                <h3>With ResumeAI Pro</h3>
              </div>
              <ul className="comparison-list">
                <li>AI-optimized for every job description</li>
                <li>Professional resume in under 5 minutes</li>
                <li>Real-time ATS score and feedback</li>
                <li>3x more interview callbacks</li>
                <li>Exact keywords from job postings</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">
          Everything You Need to <span className="gradient-text">Land the Job</span>
        </h2>
        <p className="section-subtitle">
          Powerful features designed to maximize your chances of getting hired
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <h2 className="section-title">
          Join <span className="gradient-text">47,000+</span> Successful Job Seekers
        </h2>
        <p className="section-subtitle">
          Real stories from real people who landed their dream jobs
        </p>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {'⭐'.repeat(testimonial.rating)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="author-image"
                />
                <div className="author-info">
                  <span className="author-name">{testimonial.name}</span>
                  <span className="author-role">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More social proof */}
        <div className="social-proof-bar">
          <div className="proof-item">
            <span className="proof-number">4.9/5</span>
            <span className="proof-label">Average Rating</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">2M+</span>
            <span className="proof-label">Downloads</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">89%</span>
            <span className="proof-label">Success Rate</span>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="pricing-preview-section">
        <h2 className="section-title">
          Simple, <span className="gradient-text">Affordable</span> Pricing
        </h2>
        <p className="section-subtitle">
          Start free. Pay only when you need more credits.
        </p>

        <div className="pricing-preview-cards">
          <div className="pricing-card">
            <div className="pricing-badge">Starter</div>
            <div className="pricing-credits">10 Credits</div>
            <div className="pricing-price">
              <span className="price-original">$19</span>
              <span className="price-current">$9</span>
            </div>
            <div className="pricing-per">$0.90 per resume</div>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">MOST POPULAR</div>
            <div className="pricing-badge">Professional</div>
            <div className="pricing-credits">25 Credits</div>
            <div className="pricing-price">
              <span className="price-original">$39</span>
              <span className="price-current">$19</span>
            </div>
            <div className="pricing-per">$0.76 per resume</div>
          </div>

          <div className="pricing-card">
            <div className="pricing-badge">Enterprise</div>
            <div className="pricing-credits">99 Credits</div>
            <div className="pricing-price">
              <span className="price-original">$99</span>
              <span className="price-current">$49</span>
            </div>
            <div className="pricing-per">$0.49 per resume</div>
          </div>
        </div>

        <button className="cta-secondary" onClick={onViewPricing}>
          View Full Pricing Details →
        </button>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="final-cta-content">
          <h2 className="final-cta-title">
            Ready to Land Your Dream Job?
          </h2>
          <p className="final-cta-subtitle">
            Join thousands of successful job seekers. Start with 3 free credits today.
          </p>

          <button className="cta-final" onClick={onGetStarted}>
            <span>Get Started for Free</span>
            <span className="cta-arrow">→</span>
          </button>

          <div className="guarantee-badge">
            <span className="guarantee-icon">🛡️</span>
            <span>30-day money-back guarantee • No credit card required</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">📄</span>
            <span className="logo-text">ResumeAI Pro</span>
            <p className="footer-tagline">AI-powered resumes that get you hired.</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#" onClick={onViewPricing}>Pricing</a>
              <a href="#testimonials">Success Stories</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Refund Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ResumeAI Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
