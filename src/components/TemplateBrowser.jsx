import { useState } from 'react'
import { useResume } from '../context/ResumeContext'
import {
  TEMPLATE_CATALOG,
  getFeaturedTemplates,
  getFreeTemplates,
  getTemplatesByCategory,
  getTemplatesByTier,
  searchTemplates
} from '../data/templateCatalog'
import { TEMPLATE_TIERS, TEMPLATE_CATEGORIES, COLOR_PALETTES } from '../types/templateTypes'
import './TemplateBrowser.css'

const TemplateBrowser = ({ onClose }) => {
  const { resumeData, setCurrentTemplate, currentTemplate } = useResume()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTier, setSelectedTier] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // Filter templates
  const getFilteredTemplates = () => {
    let filtered = TEMPLATE_CATALOG

    // Search filter
    if (searchQuery) {
      filtered = searchTemplates(searchQuery)
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Tier filter
    if (selectedTier !== 'all') {
      filtered = filtered.filter(t => t.tier === selectedTier)
    }

    return filtered
  }

  const templates = getFilteredTemplates()
  const featuredTemplates = getFeaturedTemplates()

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return

    // Check if premium/freemium and user has access
    if (selectedTemplate.tier === TEMPLATE_TIERS.PREMIUM) {
      alert('🔒 This is a premium template. Upgrade to access premium templates!')
      return
    }

    if (selectedTemplate.tier === TEMPLATE_TIERS.FREEMIUM) {
      alert('✨ Freemium template selected! You can edit for free, but need to upgrade to download PDF/Word.')
    }

    setCurrentTemplate(selectedTemplate.id)
    alert(`✅ Template "${selectedTemplate.name}" applied! Your resume data has been fitted to the new template.`)
    onClose()
  }

  const getTierBadge = (tier) => {
    const badges = {
      [TEMPLATE_TIERS.FREE]: { text: 'FREE', class: 'tier-free' },
      [TEMPLATE_TIERS.FREEMIUM]: { text: 'FREEMIUM', class: 'tier-freemium' },
      [TEMPLATE_TIERS.PREMIUM]: { text: 'PREMIUM', class: 'tier-premium' }
    }
    return badges[tier]
  }

  return (
    <div className="template-browser-overlay">
      <div className="template-browser">
        {/* Header */}
        <div className="template-browser-header">
          <div className="template-header-content">
            <h2>Choose Your Perfect Resume Template</h2>
            <p>Select from 20 professionally designed, ATS-optimized templates</p>
          </div>
          <button className="template-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Search and Filters */}
        <div className="template-filters">
          <div className="template-search">
            <input
              type="text"
              placeholder="🔍 Search templates by name, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="template-search-input"
            />
          </div>

          <div className="template-filter-buttons">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="template-filter-select"
            >
              <option value="all">All Categories</option>
              <option value={TEMPLATE_CATEGORIES.ATS_CORE}>ATS Optimized</option>
              <option value={TEMPLATE_CATEGORIES.INDUSTRY}>Industry Specific</option>
              <option value={TEMPLATE_CATEGORIES.MODERN}>Modern Design</option>
              <option value={TEMPLATE_CATEGORIES.EXPERIENCE}>Experience Level</option>
              <option value={TEMPLATE_CATEGORIES.SPECIALIZED}>Specialized</option>
            </select>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="template-filter-select"
            >
              <option value="all">All Tiers</option>
              <option value={TEMPLATE_TIERS.FREE}>Free</option>
              <option value={TEMPLATE_TIERS.FREEMIUM}>Freemium</option>
              <option value={TEMPLATE_TIERS.PREMIUM}>Premium</option>
            </select>
          </div>
        </div>

        {/* Featured Templates Section */}
        {!searchQuery && selectedCategory === 'all' && selectedTier === 'all' && (
          <div className="template-section">
            <h3 className="template-section-title">⭐ Featured Templates</h3>
            <div className="template-grid">
              {featuredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  isCurrent={currentTemplate === template.id}
                  onSelect={() => handleTemplateSelect(template)}
                  getTierBadge={getTierBadge}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Templates Section */}
        <div className="template-section">
          <h3 className="template-section-title">
            {searchQuery ? `Search Results (${templates.length})` : `All Templates (${templates.length})`}
          </h3>
          <div className="template-grid">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate?.id === template.id}
                isCurrent={currentTemplate === template.id}
                onSelect={() => handleTemplateSelect(template)}
                getTierBadge={getTierBadge}
              />
            ))}
          </div>

          {templates.length === 0 && (
            <div className="no-templates">
              <p>No templates found matching your criteria.</p>
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedTier('all')
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Apply Button */}
        {selectedTemplate && (
          <div className="template-apply-footer">
            <div className="selected-template-info">
              <div className="selected-template-details">
                <h4>{selectedTemplate.name}</h4>
                <p>{selectedTemplate.description}</p>
                <div className="selected-template-meta">
                  <span className="ats-score">ATS Score: {selectedTemplate.atsScore}%</span>
                  <span className="template-industries">
                    {selectedTemplate.industries.join(', ')}
                  </span>
                </div>
              </div>
            </div>
            <button className="apply-template-btn" onClick={handleApplyTemplate}>
              Apply Template "{selectedTemplate.name}"
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Template Card Component
const TemplateCard = ({ template, isSelected, isCurrent, onSelect, getTierBadge }) => {
  const tierBadge = getTierBadge(template.tier)

  return (
    <div
      className={`template-card ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
      onClick={onSelect}
    >
      {isCurrent && <div className="current-badge">✓ Current</div>}
      <div className={`tier-badge ${tierBadge.class}`}>{tierBadge.text}</div>

      {/* Template Preview Placeholder */}
      <div className="template-preview">
        <div className="template-preview-placeholder">
          <div className="preview-header"></div>
          <div className="preview-content">
            <div className="preview-line"></div>
            <div className="preview-line short"></div>
            <div className="preview-line"></div>
            <div className="preview-section">
              <div className="preview-line"></div>
              <div className="preview-line short"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="template-info">
        <h4 className="template-name">{template.name}</h4>
        <p className="template-description">{template.description}</p>

        <div className="template-meta">
          <span className="template-columns">{template.columns} Column</span>
          <span className="template-ats-score">
            {template.atsScore >= 95 ? '✓' : '○'} ATS {template.atsScore}%
          </span>
        </div>

        <div className="template-industries">
          {template.industries.slice(0, 2).map((industry, idx) => (
            <span key={idx} className="industry-tag">{industry}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplateBrowser
