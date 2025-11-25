# Custom Resume - AI-Powered Resume & Cover Letter Builder

An intelligent resume and cover letter builder powered by OpenAI that helps you create ATS-optimized resumes and professional cover letters tailored to specific job descriptions. Features 50+ resume templates, 30+ cover letter templates, AI-driven content optimization, and cloud sync.

## Features

### Core Capabilities

- **50+ Professional Resume Templates**
  - 8 FREE templates (98% ATS-optimized)
  - 22 FREEMIUM templates (industry-specific)
  - 20 PREMIUM templates (executive & specialized)
  - Real-time template customization (colors, fonts, spacing)

- **30+ Professional Cover Letter Templates** ⭐ NEW
  - Pre-written templates for 15+ industries
  - 3 experience levels (Entry, Mid, Senior)
  - Live editor with real-time preview
  - Smart placeholder system (12 customizable fields)
  - Export as PDF or copy to clipboard
  - Cloud sync for authenticated users

- **Multi-Resume & Cover Letter Management** ⭐ NEW
  - Create, save, and manage multiple resumes
  - Save multiple cover letter variations
  - Switch between documents seamlessly
  - Cloud sync across devices (Supabase)
  - Rename, duplicate, and delete functionality

- **AI-Powered Resume Optimization**
  - OpenAI GPT-4o-mini integration
  - ATS score calculation (0-100%)
  - Automatic resume tailoring to job descriptions
  - Iterative optimization (target: 95-98% match)
  - Gap analysis and intelligent bullet point generation

- **Resume Import & Export**
  - PDF and DOCX file upload with AI parsing
  - Professional PDF & DOCX download
  - Template-aware PDF export (matches template design)
  - Print-optimized layouts
  - Drag-and-drop upload interface
  - Automatic data extraction from existing resumes

- **Real-Time Editing & Cloud Sync**
  - Live preview of all changes
  - Inline editing for all resume sections
  - Real-time sync status indicator
  - localStorage persistence (auto-save)
  - Cloud backup via Supabase
  - Template switching with data preservation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/godsmustb/Custom-Resume.git
cd Custom-Resume

# Install dependencies
npm install
```

### Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Add your OpenAI API key:**
   ```bash
   # Edit .env file
   VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

3. **Restart dev server** (changes to .env only load on startup)

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### Quick Start

1. **Import Your Resume** (optional)
   - Click "Import Resume" in the control panel
   - Upload PDF or DOCX file
   - AI extracts your information automatically

2. **Choose a Template**
   - Click "Browse Templates"
   - Filter by tier (Free/Freemium/Premium) or category
   - Select your preferred template

3. **Customize Your Template**
   - Click "Customize" to adjust colors, fonts, and spacing
   - Live preview updates in real-time

4. **Edit Your Content**
   - Click "Edit Mode" to enable inline editing
   - Update personal info, experience, education, skills, certifications
   - Changes save automatically to localStorage

5. **Optimize for a Job** (AI-powered)
   - Click "Paste Job Description"
   - Paste the job posting you're targeting
   - Click "Calculate Match Score" to see your ATS score
   - Click "Refine Again" to auto-improve resume (iterative optimization)
   - Review AI-generated content and accept/reject changes

6. **Download Your Resume**
   - Click "Download PDF"
   - Professional PDF generated with jsPDF

### AI Optimization Workflow

The AI optimization follows a multi-stage approach:

**Stage 1: Calculate Match Score**
- Analyzes job description for keywords, skills, and requirements
- Scores your resume on a 0-100% scale
- Identifies strengths and gaps

**Stage 2: Iteration 1 - Comprehensive Rewrite** (0% → 85-90%)
- Rewrites professional summary (8-10 job keywords)
- Rewrites all experience sections (6-8 bullets each with metrics)
- Adds 10-15 missing skills from job description
- Aggressive keyword optimization

**Stage 3: Iteration 2+ - Surgical Gap Fixing** (85% → 95%+)
- Generates targeted bullets addressing each identified gap
- Adds new content while preserving existing achievements
- Continues until 95%+ match score achieved

**Stage 4: Manual Fine-Tuning** (95% → 98%)
- "Generate Bullet Options" creates 10-15 individual bullets
- Each bullet addresses one specific gap
- User selects which bullets to add manually
- Precision control for final optimization

### Template System

#### Template Tiers

**FREE (8 templates)**
- ATS Simple & Minimal (98% ATS)
- Traditional Conservative (97% ATS)
- Modern Professional (95% ATS)
- Entry-Level & Student (96% ATS)
- Recent Graduate (95% ATS)
- ATS Combination Format (96% ATS)
- Clean & Minimalist (97% ATS)
- Professional Basic (98% ATS)

**FREEMIUM (22 templates)**
- Industry-specific: Tech, Creative, Healthcare, Finance, Education, Legal, Sales, Marketing
- Experience-level: Mid-Career, Federal Government
- Specialized: Career Change, Project Manager, Executive Assistant
- ATS scores: 93-97%

**PREMIUM (20 templates)**
- Executive & C-Suite (95% ATS)
- Senior Leadership (96% ATS)
- Academic CV (94% ATS)
- Specialized: CFO, CTO, CMO, Medical Physician, Pharmacist, Nurse Practitioner
- Modern designs: Timeline Visual, Contemporary Typography
- ATS scores: 92-96%

#### Customization Options

**Color Schemes:**
- Corporate Blue (professional blue tones)
- Modern Neutral (grayscale minimalist)
- Professional Green (green accent)
- Executive Navy (dark navy for executives)
- Tech Cyan (cyan for tech roles)
- Creative Purple (purple for creative industries)

**Fonts:**
- Modern: Inter, Roboto, Lato
- Traditional: Georgia, Times New Roman
- Creative: Montserrat

**Spacing:**
- Comfortable, Compact, Balanced, Generous, Creative

## Technology Stack

### Core Technologies

- **Frontend Framework:** React 19
- **Build Tool:** Vite 7
- **AI Integration:** OpenAI API (GPT-4o-mini)
- **PDF Generation:** jsPDF
- **PDF Parsing:** pdfjs-dist
- **DOCX Parsing:** mammoth
- **State Management:** React Context API
- **Persistence:** localStorage

### Dependencies

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "openai": "^6.8.1",
  "jspdf": "^3.0.3",
  "pdfjs-dist": "^5.4.394",
  "mammoth": "^1.11.0",
  "html2canvas": "^1.4.1"
}
```

## Project Structure

```
Custom-Resume/
├── .github/workflows/
│   └── deploy-hostinger.yml      # Automated deployment
├── public/
│   └── pdf.worker.min.mjs        # PDF.js worker
├── src/
│   ├── components/               # React components
│   │   ├── templates/
│   │   │   ├── layouts/          # 5 reusable layout components
│   │   │   └── TemplateRenderer.jsx
│   │   ├── About.jsx
│   │   ├── Certifications.jsx
│   │   ├── ControlPanel.jsx      # Main toolbar
│   │   ├── Education.jsx
│   │   ├── Experience.jsx
│   │   ├── Header.jsx
│   │   ├── JobDescriptionInput.jsx  # AI analysis panel
│   │   ├── ResumeUpload.jsx      # PDF/DOCX upload
│   │   ├── Skills.jsx
│   │   ├── TemplateBrowser.jsx   # Template selection
│   │   └── TemplateCustomization.jsx
│   ├── context/
│   │   └── ResumeContext.jsx     # Central state manager
│   ├── data/
│   │   ├── sampleData.js
│   │   └── templateCatalog.js    # 50 template definitions
│   ├── services/
│   │   ├── aiService.js          # OpenAI integration (11 functions)
│   │   ├── pdfDownloadService.js # PDF generation
│   │   ├── resumeParserService.js # PDF/DOCX parsing
│   │   └── skillsSuggestions.js  # Skills library
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── CLAUDE.md                     # Project instructions for Claude
├── DEPLOYMENT.md                 # Deployment guide
├── README.md                     # This file
├── package.json
└── vite.config.js
```

## Deployment

The project includes automated deployment to Hostinger via GitHub Actions FTP.

### Deployment Triggers

- **Automatic:** Push to `main` branch (production)
- **Automatic:** Push to `claude/*` branches (testing)
- **Manual:** GitHub Actions UI

### Required GitHub Secrets

Configure these in your repository Settings → Secrets and variables → Actions:

- `HOSTINGER_FTP_SERVER` - FTP server hostname or IP
- `HOSTINGER_FTP_USERNAME` - FTP username
- `HOSTINGER_FTP_PASSWORD` - FTP password
- `VITE_OPENAI_API_KEY` - OpenAI API key (baked into build)

### Deployment Process

1. Checkout repository
2. Setup Node.js 18 with npm caching
3. Install dependencies (`npm ci`)
4. Build application with environment variables
5. Verify build output
6. Deploy to `/public_html/` via FTP (clean-slate mode)

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## AI Services

The application uses OpenAI GPT-4o-mini for intelligent resume optimization:

### Available AI Functions

1. **generateSummary** - Tailored professional summaries
2. **generateBulletPoints** - Achievement-focused bullets with metrics
3. **analyzeJobDescription** - Extract keywords, skills, requirements
4. **calculateMatchScore** - ATS-style scoring (0-100%) with gap analysis
5. **autoImproveResume** - Aggressive keyword optimization for 95%+ match
6. **generateMultipleBulletOptions** - 10-15 individual gap-addressing bullets
7. **generateGapBullets** - Surgical gap fixing for iteration 2+
8. **customizeResume** - End-to-end resume tailoring
9. **improveExperience** - Improve existing experience bullets
10. **suggestSkills** - Recommend missing skills
11. **generateContentVariations** - A/B testing variants

### Scoring Criteria

**Keyword Match (40 points):**
- Technical skills: +2 each (max 20)
- Job-specific terms: +2 each (max 10)
- Industry buzzwords: +1 each (max 10)

**Skills Overlap (30 points):**
- Required technical: +3 each (max 15)
- Soft skills: +2 each (max 8)
- Tools/tech: +1 each (max 7)

**Experience Relevance (20 points):**
- Job title match: +5
- Responsibilities align: +8
- Quantifiable achievements: +7

**Completeness (10 points):**
- Summary keywords: +3
- Requirements addressed: +4
- No gaps: +3

## Data Persistence

All resume data automatically saves to browser localStorage:

- **Resume Data:** Personal info, experience, education, skills, certifications
- **Template Selection:** Current template choice
- **Customization:** Color scheme, font, spacing preferences

Data persists across sessions and page refreshes.

## Development

### Code Quality

```bash
# Run ESLint
npm run lint
```

### Adding a New Template

1. Add template metadata to `src/data/templateCatalog.js`
2. Choose appropriate `component` name
3. Map to existing layout in `TemplateRenderer.jsx` LAYOUT_MAP
4. Or create new layout in `src/components/templates/layouts/`

### Modifying AI Prompts

Edit functions in `src/services/aiService.js`:
- Adjust temperature (0.3-1.0) for creativity vs precision
- Update prompt text for different results
- Modify scoring criteria in `calculateMatchScore()`

### Adding New Resume Section

1. Add field to `initialResumeData` in `ResumeContext.jsx`
2. Create update/add/remove functions in context
3. Add to context value object
4. Create component in `src/components/`
5. Update layout components to render new section
6. Update `pdfDownloadService.js` for PDF export

## Security Considerations

**Important:** The OpenAI API key is currently used client-side (baked into the JavaScript bundle during build). This means:

- ✅ **Acceptable for:** Personal use, local development, trusted environments
- ❌ **Not recommended for:** Public production deployment without additional security

**For production deployment:**
- Implement a backend API proxy for OpenAI calls
- Use server-side API key management
- Add rate limiting and usage monitoring
- Consider implementing user authentication

## Known Limitations

- **PDF Parsing:** Text-based only, struggles with complex layouts, tables, multi-column resumes
- **No Test Suite:** Currently no automated tests (manual testing only)
- **Template Thumbnails:** May not exist in `/public/templates/thumbnails/`
- **Browser Compatibility:** Uses modern JavaScript APIs

## Future Enhancements

- Backend API proxy for secure OpenAI calls
- Server-side PDF generation for better quality
- Resume version history and A/B testing
- Export to DOCX format
- Automated testing suite (Jest/Vitest + React Testing Library)
- Multi-language support
- Resume analytics and tracking

## Contributing

This is a personal project, but suggestions and feedback are welcome! Please open an issue to discuss proposed changes.

## License

This project is private and not licensed for public use.

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

## Acknowledgments

- OpenAI for GPT-4o-mini API
- React and Vite teams for excellent developer experience
- SamKirkland for FTP-Deploy-Action
- All open-source libraries used in this project

---

**Built with ❤️ using React, Vite, and OpenAI**

**Live Demo:** [Your Hostinger domain here]

**Version:** 2.0.0
**Last Updated:** 2025-11-25
