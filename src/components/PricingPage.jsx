/**
 * Pricing Page Component
 * Credit packages with persuasive pricing design
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './PricingPage.css'

const PricingPage = ({ onBack, onGetStarted }) => {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      credits: 10,
      originalPrice: 19,
      price: 9,
      perCredit: 0.90,
      features: [
        '10 AI-powered resume generations',
        'All 51 professional templates',
        'ATS optimization included',
        'PDF & DOCX export',
        'Basic support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      credits: 25,
      originalPrice: 39,
      price: 19,
      perCredit: 0.76,
      features: [
        '25 AI-powered resume generations',
        'All 51 professional templates',
        'ATS optimization included',
        'PDF & DOCX export',
        'Cover letter builder included',
        'Priority support',
        'LinkedIn profile import'
      ],
      cta: 'Get Started',
      popular: true,
      savings: '51% OFF'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 99,
      originalPrice: 99,
      price: 49,
      perCredit: 0.49,
      features: [
        '99 AI-powered resume generations',
        'All 51 professional templates',
        'ATS optimization included',
        'PDF & DOCX export',
        'Cover letter builder included',
        'Priority support',
        'LinkedIn profile import',
        'Version history & cloud backup',
        'Dedicated account manager'
      ],
      cta: 'Get Started',
      popular: false,
      savings: '50% OFF',
      bestValue: true
    }
  ]

  const faqs = [
    {
      question: 'What is a credit?',
      answer: 'One credit allows you to generate one AI-optimized resume tailored to a specific job description. You can create unlimited variations and edits of your resume, but each new AI generation consumes one credit.'
    },
    {
      question: 'Do credits expire?',
      answer: 'No! Your credits never expire. Use them whenever you need to apply for a new job, whether that\'s next week or next year.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes! We offer a 30-day money-back guarantee. If you\'re not satisfied with our service, contact us for a full refund - no questions asked.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.'
    },
    {
      question: 'Do I need to pay to use the templates?',
      answer: 'You can browse and preview all 51 templates for free. Credits are only consumed when you use AI to generate or optimize your resume content.'
    },
    {
      question: 'What happens when I run out of credits?',
      answer: 'You can continue editing and downloading your existing resumes. When you need more AI generations, simply purchase another credit package.'
    }
  ]

  const handlePurchase = async (planId) => {
    if (!user) {
      onGetStarted()
      return
    }

    setIsProcessing(true)
    // TODO: Integrate with payment provider (Stripe)
    setTimeout(() => {
      alert('Payment integration coming soon! For now, contact support to purchase credits.')
      setIsProcessing(false)
    }, 1000)
  }

  return (
    <div className="pricing-page">
      {/* Header */}
      <header className="pricing-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="pricing-logo">
          <span className="logo-icon">📄</span>
          <span className="logo-text">ResumeAI Pro</span>
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Hero */}
      <section className="pricing-hero">
        <div className="pricing-badge">
          <span>🎉</span>
          <span>Launch Special - 50% Off All Plans!</span>
        </div>
        <h1 className="pricing-title">
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </h1>
        <p className="pricing-subtitle">
          Start with 3 free credits. No subscription required - pay only for what you use.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards-section">
        <div className="pricing-cards">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.bestValue ? 'best-value' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="popular-ribbon">MOST POPULAR</div>
              )}
              {plan.bestValue && (
                <div className="best-value-ribbon">BEST VALUE</div>
              )}
              {plan.savings && (
                <div className="savings-badge">{plan.savings}</div>
              )}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-credits">
                  <span className="credits-number">{plan.credits}</span>
                  <span className="credits-label">Credits</span>
                </div>
              </div>

              <div className="plan-pricing">
                <div className="price-row">
                  <span className="original-price">${plan.originalPrice}</span>
                  <span className="current-price">${plan.price}</span>
                </div>
                <div className="per-credit">
                  ${plan.perCredit.toFixed(2)} per resume
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`plan-cta ${plan.popular ? 'primary' : 'secondary'}`}
                onClick={() => handlePurchase(plan.id)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="trust-indicators">
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">💳</span>
            <span>No Subscription</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <span>30-Day Guarantee</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">♾️</span>
            <span>Credits Never Expire</span>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="included-section">
        <h2 className="section-title">What's Included With Every Credit</h2>
        <div className="included-grid">
          <div className="included-item">
            <span className="included-icon">🤖</span>
            <h4>AI Resume Generation</h4>
            <p>Tailored to any job description with 95%+ ATS pass rate</p>
          </div>
          <div className="included-item">
            <span className="included-icon">🎨</span>
            <h4>51 Templates</h4>
            <p>Professional designs for every industry and career level</p>
          </div>
          <div className="included-item">
            <span className="included-icon">📊</span>
            <h4>ATS Scoring</h4>
            <p>Real-time feedback on how your resume scores</p>
          </div>
          <div className="included-item">
            <span className="included-icon">📥</span>
            <h4>Export Options</h4>
            <p>Download as PDF or DOCX, or print directly</p>
          </div>
          <div className="included-item">
            <span className="included-icon">✏️</span>
            <h4>Unlimited Edits</h4>
            <p>Make changes anytime without using credits</p>
          </div>
          <div className="included-item">
            <span className="included-icon">☁️</span>
            <h4>Cloud Storage</h4>
            <p>Access your resumes from any device</p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="comparison-section">
        <h2 className="section-title">Compare Plans</h2>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Starter</th>
                <th className="highlight">Professional</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AI Resume Generations</td>
                <td>10</td>
                <td className="highlight">25</td>
                <td>99</td>
              </tr>
              <tr>
                <td>Price per Resume</td>
                <td>$0.90</td>
                <td className="highlight">$0.76</td>
                <td>$0.49</td>
              </tr>
              <tr>
                <td>All 51 Templates</td>
                <td>✓</td>
                <td className="highlight">✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>ATS Optimization</td>
                <td>✓</td>
                <td className="highlight">✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>PDF & DOCX Export</td>
                <td>✓</td>
                <td className="highlight">✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Cover Letter Builder</td>
                <td>-</td>
                <td className="highlight">✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>LinkedIn Import</td>
                <td>-</td>
                <td className="highlight">✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Version History</td>
                <td>-</td>
                <td className="highlight">-</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Priority Support</td>
                <td>-</td>
                <td className="highlight">✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Dedicated Manager</td>
                <td>-</td>
                <td className="highlight">-</td>
                <td>✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h4 className="faq-question">{faq.question}</h4>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="pricing-final-cta">
        <h2>Ready to Land Your Dream Job?</h2>
        <p>Start with 3 free credits - no credit card required</p>
        <button className="final-cta-btn" onClick={onGetStarted}>
          Get Started Free →
        </button>
      </section>

      {/* Footer */}
      <footer className="pricing-footer">
        <p>© 2026 ResumeAI Pro. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Refund Policy</a>
        </div>
      </footer>
    </div>
  )
}

export default PricingPage
