# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Custom Resume** is an AI-powered resume builder built with React and Vite. It helps users create ATS-optimized resumes tailored to specific job descriptions using OpenAI's API. The application features 50+ professional resume templates, PDF generation/parsing, and real-time resume customization.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Setup

The application requires an OpenAI API key for AI features:

1. **Copy the template**: `cp .env.example .env`
2. **Add your API key**: Edit `.env` and replace `your-openai-api-key-here` with your actual OpenAI API key
   ```
   VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
3. **Restart dev server**: Changes to `.env` only load on server startup
4. **Security note**: The API key is used client-side (see `src/services/aiService.js:5` and `src/services/resumeParserService.js:14`). This is acceptable for local development but not recommended for production deployment.

**Important**: All AI services now use `import.meta.env.VITE_OPENAI_API_KEY` from the `.env` file. The old `localStorage` approach has been deprecated.

## Deployment

### Automated FTP Deployment to Hostinger

The project includes GitHub Actions workflow for automated deployment to Hostinger via FTP. This setup mirrors the deployment process used in the White Feather Finance project.

**Workflow file**: `.github/workflows/deploy-hostinger.yml`

**Deployment triggers**:
- Automatic: Push to `main` branch
- Automatic: Push to any `claude/*` branch (for testing)
- Manual: Triggered via GitHub Actions UI

**Required GitHub Secrets** (configure in repo Settings → Secrets and variables → Actions):
- `HOSTINGER_FTP_SERVER`: FTP server hostname (e.g., `ftp.yourdomain.com`)
- `HOSTINGER_FTP_USERNAME`: FTP username from Hostinger
- `HOSTINGER_FTP_PASSWORD`: FTP password from Hostinger
- `VITE_OPENAI_API_KEY`: OpenAI API key (baked into build)

**Deployment steps**:
1. Checkout repository code
2. Setup Node.js 18 with npm caching
3. Install dependencies (`npm ci`)
4. Build application with `VITE_OPENAI_API_KEY` environment variable
5. Verify build output in `dist/` folder
6. Deploy to Hostinger FTP at `/public_html/` using clean-slate mode

**Key configuration**:
- Build output: `dist/` folder
- Server directory: `/public_html/`
- Clean slate: Yes (removes old files before deployment)
- Verbose logging: Enabled for debugging

**Testing deployments**: Use `claude/*` branches to test deployment without affecting main site.

For detailed setup instructions, troubleshooting, and FTP configuration, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## Architecture Overview

### State Management

**ResumeContext** (`src/context/ResumeContext.jsx`) is the central state manager:
- Manages all resume data (personal info, experience, education, skills, certifications)
- Handles template selection and customization
- Provides localStorage persistence
- Exposes CRUD operations for all resume sections
- Pattern: Context API with hook (`useResume()`)

Key state structure:
```javascript
{
  resumeData: {
    personal: {...},      // Name, title, contact info, social links
    about: "...",         // Professional summary
    experience: [...],    // Work history with bullet points
    education: [...],     // Academic background
    skills: [...],        // Categorized skills
    certifications: [...], // Professional certifications
    jobDescription: ""    // Target job for AI tailoring
  },
  currentTemplate: "template-id",
  templateCustomization: {
    colorScheme: "...",
    font: "...",
    spacing: "..."
  }
}
```

### Template System

**50+ Resume Templates** organized in 3 tiers:
- **FREE** (8 templates): ATS-optimized, basic layouts
- **FREEMIUM** (22 templates): Industry-specific, mid-career
- **PREMIUM** (20 templates): Executive, specialized roles

Template architecture:
1. **Template Catalog** (`src/data/templateCatalog.js`): Registry of all 50 templates with metadata
2. **Template Renderer** (`src/components/templates/TemplateRenderer.jsx`): Dynamic layout selector
3. **Layout Components** (5 reusable layouts):
   - `ClassicSingleColumn`: Traditional 1-column ATS-friendly layout
   - `ModernTwoColumn`: Professional 2-column with sidebar
   - `ExecutiveLayout`: Premium executive/leadership format
   - `CreativeLayout`: Visual designs for creative industries
   - `MinimalistLayout`: Clean Scandinavian style

**How templates map to layouts**: The `LAYOUT_MAP` in `TemplateRenderer.jsx` maps each template's `component` field to one of the 5 actual layout components. This allows reusing layouts across multiple templates with different styling/customization.

### AI Services

**AI-powered features** (`src/services/aiService.js`):
- `generateSummary()`: Creates tailored professional summaries
- `generateBulletPoints()`: Generates achievement-focused experience bullets
- `analyzeJobDescription()`: Extracts keywords, skills, responsibilities
- `calculateMatchScore()`: ATS-style scoring (0-100) with gap analysis
- `autoImproveResume()`: Aggressive keyword optimization for 95%+ match
- `generateMultipleBulletOptions()`: Creates 10-15 individual gap-addressing bullets
- `customizeResume()`: End-to-end resume tailoring

**Important**: All AI prompts use aggressive keyword matching to maximize ATS scores. Temperature varies by function (0.3-1.0) to balance creativity and precision.

### Resume Upload Services

**Two Upload Systems** (both use OpenAI for AI parsing):

1. **ResumeUpload** (`src/components/ResumeUpload.jsx`) - **Primary System** ⭐
   - Supports **both PDF and DOCX** file uploads
   - Uses `resumeParserService.js` for file processing
   - Drag-and-drop interface with progress indicators
   - File validation: PDF/DOCX, max 10MB
   - API key validation before processing
   - **Currently used in ControlPanel**

2. **PDFUpload** (`src/components/PDFUpload.jsx`) - **Legacy System**
   - Supports **PDF only**
   - Uses `pdfService.js` for file processing
   - Simpler interface, PDF-specific
   - File validation: PDF only, max 5MB
   - API key validation before processing
   - **Not currently used** (kept for compatibility)

**Resume Parser Service** (`src/services/resumeParserService.js`):
- Handles both PDF and DOCX file formats
- PDF extraction: Uses pdfjs-dist library
- DOCX extraction: Uses mammoth library
- AI parsing: OpenAI GPT-4o-mini with structured JSON output
- Retry logic: Automatically retries once on JSON parsing errors
- Text truncation: Limits to 8000 chars to avoid token limits
- Extracts: Personal info, experience, education, skills, certifications

**PDF Services** (`src/services/pdfService.js`):
- **PDF Parsing**: Uses pdfjs-dist to extract text from PDFs
- **AI Parsing**: OpenAI GPT-4o-mini with enhanced error handling
- Worker configuration: Uses local pdf.worker.min.mjs
- Same retry logic and truncation as resumeParserService

**PDF Generation** (`src/services/pdfDownloadService.js`):
- Uses jsPDF to create professionally formatted PDFs
- Supports multi-page resumes with automatic pagination
- Styled sections with color-coded headers
- Word wrapping and spacing optimization

### Component Structure

**Main App Flow**:
1. `App.jsx`: Root component with `ControlPanel`, `JobDescriptionInput`, `TemplateRenderer`
2. `ControlPanel.jsx`: Main toolbar (template browser, PDF upload, customization, download)
3. `TemplateBrowser.jsx`: Modal for selecting from 50 templates with filters
4. `TemplateCustomization.jsx`: Color schemes, fonts, spacing controls
5. `JobDescriptionInput.jsx`: Paste job description for AI tailoring
6. `TemplateRenderer.jsx`: Dynamically renders selected template layout

**Resume Section Components** (all support inline editing when `isEditing=true`):
- `Header.jsx`: Personal info and contact details
- `About.jsx`: Professional summary with AI suggestions
- `Experience.jsx`: Work history with AI bullet point generation
- `Education.jsx`: Academic credentials
- `Skills.jsx`: Categorized technical/soft skills
- `Certifications.jsx`: Professional certifications

### Data Persistence

- All resume data persists to **localStorage** automatically
- Keys: `resumeData`, `currentTemplate`, `templateCustomization`
- Backwards compatibility handling for schema changes (see `ResumeContext.jsx:91-94`)

## Key Patterns and Conventions

### Template Metadata

Each template in the catalog includes:
```javascript
{
  id: "unique-template-id",
  name: "Display Name",
  description: "Template description",
  category: TEMPLATE_CATEGORIES.*, // ATS_CORE, INDUSTRY, EXPERIENCE, etc.
  tier: TEMPLATE_TIERS.*,          // FREE, FREEMIUM, PREMIUM
  atsScore: 90-98,                 // ATS compatibility score
  columns: 1 or 2,
  colorSchemes: [...],
  fonts: [...],
  industries: [...],
  component: "ComponentName",       // Maps to layout in LAYOUT_MAP
  layout: {
    sections: [...],                // Order of resume sections
    spacing: "...",
    headerStyle: "...",
    sidebar: true/false,
    specialSections: [...]          // Industry-specific sections
  }
}
```

### Experience Bullet Points

Experience descriptions are stored as **arrays of strings**, where each string is a bullet point:
```javascript
{
  title: "Senior Software Engineer",
  company: "Tech Company",
  date: "2022 - Present",
  description: [
    "Led development of features...",
    "Mentored junior developers...",
    "Architected scalable solutions..."
  ]
}
```

### AI Prompt Strategy

The AI service uses **aggressive keyword optimization**:
- Summary: 5-6 sentences, 8-10 exact job keywords
- Bullets: 6-8 bullets per role, 3-4 keywords per bullet, quantifiable metrics
- Gap addressing: Direct 1:1 mapping between identified gaps and generated bullets
- ATS scoring: Precise mathematical calculation based on keyword density

## Important Implementation Details

### LocalStorage Schema Migration

When adding new fields (like `certifications`), ensure backwards compatibility:
```javascript
if (!parsedData.certifications) {
  parsedData.certifications = []
}
```
See `ResumeContext.jsx:91-94` for example.

### Template Layout Mapping

To add a new template:
1. Add template metadata to `TEMPLATE_CATALOG` in `templateCatalog.js`
2. Choose appropriate `component` name (e.g., "NewTemplate")
3. Map component to layout in `LAYOUT_MAP` in `TemplateRenderer.jsx`
4. If creating new layout, create in `src/components/templates/layouts/`

### PDF Worker Configuration

pdfjs-dist requires a worker file. Ensure `pdf.worker.min.mjs` is copied to `public/` directory. See `pdfService.js:3-4` for worker configuration.

### Color Scheme System

Template customization supports predefined color schemes:
- `corporate-blue`: Professional blue tones
- `modern-neutral`: Grayscale minimalist
- `professional-green`: Green accent
- `executive-navy`: Dark navy for executives
- `tech-cyan`: Cyan for tech roles
- `creative-purple`: Purple for creative industries

Apply via CSS variables in layout components.

## Testing Workflows

### Testing Resume Tailoring

1. Start dev server: `npm run dev`
2. Add sample resume data or use defaults
3. Click "Paste Job Description" and add target job posting
4. Use "Calculate Match Score" to see ATS score
5. Click "Auto-Improve" to apply AI optimization
6. Verify score increases and gaps are addressed

### Testing Templates

1. Click "Browse Templates" to open template browser
2. Filter by tier (Free/Freemium/Premium) or category
3. Select template and verify layout renders correctly
4. Test customization (colors, fonts, spacing)
5. Download PDF and verify formatting

### Testing PDF Upload

1. Upload an existing resume PDF
2. Verify parsing extracts name, experience, education, skills
3. Check for formatting issues in extracted text
4. Manually correct any parsing errors

## Technical Debt and Known Issues

- **Client-side API key**: OpenAI API key is exposed in browser (see `aiService.js:5` warning). Production should use backend proxy.
- **PDF parsing limitations**: Text-based parsing struggles with complex layouts, tables, multi-column resumes
- **No test suite**: Project currently has no automated tests
- **Template thumbnails**: Thumbnail images referenced in catalog (`thumbnailUrl`) may not exist in `/public/templates/thumbnails/`

## Future Enhancement Areas

Based on codebase analysis, consider:
- Backend API proxy for OpenAI calls
- Server-side PDF generation for better quality
- Resume version history / A-B testing
- Export to DOCX format
- Template preview system improvements
- Automated testing suite

## Common Tasks

**Add a new template:**
1. Add template metadata to `TEMPLATE_CATALOG` in `src/data/templateCatalog.js`
2. Map to existing layout or create new layout component in `src/components/templates/layouts/`
3. Update `LAYOUT_MAP` in `TemplateRenderer.jsx` if using new layout

**Modify AI prompts:**
- Edit functions in `src/services/aiService.js`
- Adjust temperature (0.3-1.0) to balance creativity vs consistency
- Update scoring criteria in `calculateMatchScore()` for ATS changes

**Add new resume section:**
1. Add field to `initialResumeData` in `ResumeContext.jsx`
2. Create update/add/remove functions in context
3. Add to context value object
4. Create component in `src/components/`
5. Update layout components to render new section

**Customize template styling:**
- Edit CSS in layout components (`src/components/templates/layouts/`)
- Use `customization` prop for color schemes and fonts
- Apply CSS variables for theming consistency
