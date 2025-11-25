# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Custom Resume** is an AI-powered resume builder built with React and Vite. It helps users create ATS-optimized resumes tailored to specific job descriptions using OpenAI's API. The application features 50+ professional resume templates, PDF generation/parsing, and real-time resume customization.

**Current Status:** Production-ready with automated FTP deployment to Hostinger
**Version:** 1.0.0
**Last Documentation Update:** 2025-01-19
**Deployment Status:** ✅ Active (GitHub Actions → Hostinger FTP)

### Quick Stats
- **Codebase Size:** ~8,000-10,000 lines of code
- **Components:** 25+ React components
- **Templates:** 50 professional templates (3 tiers)
- **AI Functions:** 11 OpenAI GPT-4o-mini functions
- **Skills Library:** 690+ categorized skills
- **Job Titles:** 597 autocomplete suggestions
- **Supported Formats:** PDF, DOCX (import), PDF & DOCX (export)

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

The application requires environment variables for AI features and cloud data persistence:

1. **Copy the template**: `cp .env.example .env`
2. **Add your API keys**: Edit `.env` and add the following:
   ```
   # OpenAI API Configuration
   VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here

   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
3. **Get Supabase credentials**:
   - Create a project at [Supabase](https://supabase.com)
   - Copy your project URL and anon key from Settings → API
   - Run the SQL migrations from `SUPABASE_SCHEMA.md` to set up database tables
4. **Restart dev server**: Changes to `.env` only load on server startup
5. **Security note**: The OpenAI API key is used client-side (see `src/services/aiService.js:5` and `src/services/resumeParserService.js:14`). The Supabase anon key is safe to expose in client-side code as it's protected by Row Level Security (RLS) policies.

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
- `HOSTINGER_FTP_SERVER`: FTP server hostname (e.g., `157.173.208.194` - NO ftp:// prefix!)
- `HOSTINGER_FTP_USERNAME`: FTP username from Hostinger
- `HOSTINGER_FTP_PASSWORD`: FTP password from Hostinger
- `VITE_OPENAI_API_KEY`: OpenAI API key (baked into build)
- `VITE_SUPABASE_URL`: Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (safe for client-side use)

**Deployment steps**:
1. Checkout repository code
2. Setup Node.js 18 with npm caching
3. Install dependencies (`npm ci`)
4. Build application with environment variables (OpenAI, Supabase)
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
- Provides **dual persistence**: localStorage (local) + Supabase (cloud)
- Exposes CRUD operations for all resume sections
- Pattern: Context API with hook (`useResume()`)

**AuthContext** (`src/context/AuthContext.jsx`) manages authentication:
- Supabase authentication (email/password + Google OAuth)
- User session management
- Sign up, sign in, sign out, password reset
- Pattern: Context API with hook (`useAuth()`)

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

### Supabase Cloud Integration

**Architecture**: Dual persistence strategy - localStorage (instant) + Supabase (cloud backup)

**Key Services:**
- **Authentication** (`src/context/AuthContext.jsx`):
  - Email/password authentication
  - Google OAuth integration
  - Session management with auto-refresh
  - Password reset functionality

- **Resume Storage** (`src/services/supabaseResumeService.js`):
  - Cloud backup of all resume data
  - Multi-resume support (users can save multiple versions)
  - CRUD operations: fetch, create, update, delete
  - Auto-migration from localStorage on first login

**Database Schema** (see `SUPABASE_SCHEMA.md`):
- `resumes` table: Stores resume data as JSONB with RLS policies
- `user_profiles` table: User metadata and subscription tiers
- Row Level Security (RLS): Users can only access their own data

**Persistence Strategy:**
1. **Offline mode**: All data saved to localStorage (works without auth)
2. **Online mode**: Syncs to Supabase when user is authenticated
3. **First login**: Automatically migrates localStorage data to cloud
4. **Subsequent sessions**: Loads from Supabase, keeps localStorage in sync

**Setup Requirements:**
- Supabase project created at [supabase.com](https://supabase.com)
- SQL migrations from `SUPABASE_SCHEMA.md` executed in Supabase SQL Editor
- Environment variables configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- GitHub Secrets configured for deployment

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
- Accepts custom filename parameter for user-defined filenames

**DOCX Generation** (`src/services/docxDownloadService.js`): ⭐ NEW
- Uses docx library (by dolanmiu) for Microsoft Word document creation
- Professional formatting with:
  * Centered header with name and title
  * Color-coded section headers with bottom borders
  * Proper heading hierarchy (H1, H2)
  * Styled bullet points for experience descriptions
  * Clickable social links (LinkedIn, GitHub, Portfolio)
  * Consistent spacing and typography
- Fully editable in Microsoft Word, Google Docs, LibreOffice
- Smaller file sizes (~30-150 KB)
- ATS-compatible like PDF
- Async blob generation and download
- Accepts custom filename parameter

**Download Customization** (`src/components/DownloadModal.jsx`):
- Professional modal UI for filename and format customization
- **Format Selection**: PDF or DOCX toggle buttons
- **3 Quick Filename Options**: Name Only, Name+Date, Date+Name
- Custom filename input with real-time preview
- Smart sanitization (removes invalid characters, converts spaces to underscores)
- Dynamic file info based on selected format:
  * PDF: "All devices & ATS systems", "Not editable"
  * DOCX: "Microsoft Word, Google Docs & ATS", "Fully editable"
- Auto-generates intelligent default from user's name
- Example outputs:
  * "John_Doe_Resume_20250119.pdf"
  * "John_Doe_Resume_20250119.docx"

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

**Dual Persistence Strategy:**
- **localStorage** (Primary): Instant saves, works offline, no authentication required
- **Supabase** (Cloud Backup): Syncs when authenticated, multi-device access, version history

**localStorage Keys:**
- `resumeData` - All resume content
- `currentTemplate` - Selected template ID
- `templateCustomization` - Color/font/spacing preferences

**Supabase Storage:**
- Database table: `resumes` (JSONB column for resume data)
- Row Level Security (RLS): Users only access their own resumes
- Auto-sync: When user is authenticated, changes sync to cloud
- Migration: First login automatically migrates localStorage → Supabase

**Backwards Compatibility:**
- Schema changes handled gracefully (see `ResumeContext.jsx:91-94`)
- Missing fields auto-initialized with defaults

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

- **Client-side API keys**: Both OpenAI API key and Supabase anon key are exposed in browser bundle (see `aiService.js:5` and `supabase.js:10`). The Supabase anon key is protected by RLS policies, but OpenAI key should ideally be proxied through a backend in production.
- **PDF parsing limitations**: Text-based parsing struggles with complex layouts, tables, multi-column resumes
- **No test suite**: Project currently has no automated tests
- **Template thumbnails**: Thumbnail images referenced in catalog (`thumbnailUrl`) may not exist in `/public/templates/thumbnails/`
- **Supabase setup required**: Deployment will fail if Supabase environment variables are not configured in GitHub Secrets (see error: "Missing Supabase environment variables")

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

## Recent Changes & Git Workflow

### Current Branch Status

**Production Branch:** `main`
**Testing Branches:** `claude/*` (auto-deploys for testing)
**Current Working Branch:** `claude/ftp-hostinger-deployment-01TCwHDWhndCgnmnQu5ahd8p`

### Recent Major Changes (Last 5 Commits)

```
40321b9 - Test deployment with corrected FTP server IP address (removed ftp:// prefix)
103ae65 - Add explicit FTP port 21 configuration to deployment workflow
1834bb6 - Test deployment with corrected FTP server configuration
e3da64c - Test deployment workflow with configured secrets
5b26eb6 - Add automated FTP deployment to Hostinger via GitHub Actions
```

### Recent Feature Additions

1. **Template-Aware Export** (Latest - Phase 4.3) ⭐⭐⭐
   - Exports now match your selected template design exactly!
   - Export Style Selection in download modal:
     * 🎨 Template Design - captures exact visual appearance
     * 📄 Generic Format - simple black & white layout
   - Uses html2canvas + jsPDF for high-quality PDF generation
   - Preserves all template styling, colors, fonts, and spacing
   - Two-column layouts export perfectly
   - Multi-page support with proper pagination
   - Loading indicator during export process
   - Works with all 50 templates
   - Example: Modern Two Column template exports with sidebar colors intact!
   - Files: `src/services/templateAwareExportService.js` (200+ lines, new)
   - Updated: `src/components/DownloadModal.jsx`, `DownloadModal.css`, `ControlPanel.jsx`

2. **Print Optimization** (Phase 4.4) ⭐
   - Professional print support for all resume templates!
   - Print button (🖨️) in control panel
   - Comprehensive print stylesheet (430 lines):
     * A4/Letter paper optimization
     * Intelligent page break handling
     * Hides all UI elements (buttons, nav, modals)
     * Optimized colors for ink-saving
     * Professional typography for print
     * Prevents breaking inside sections
     * Proper margins and spacing
   - Works across all browsers (Chrome, Firefox, Safari, Edge)
   - Supports all 50 templates
   - Two-column layouts print correctly
   - Skills displayed inline to save space
   - Files: `src/print.css` (430 lines, new)
   - Updated: `src/main.jsx`, `src/components/ControlPanel.jsx`

2. **DOCX Export Functionality** (Phase 4.1) ⭐⭐
   - Users can now download resumes in Microsoft Word format!
   - Format selection in download modal (PDF/DOCX toggle buttons)
   - Professional Word document formatting:
     * Color-coded section headers with borders
     * Proper heading hierarchy (H1/H2)
     * Styled bullet points for experience
     * Clickable social links
     * Fully editable in Word, Google Docs, LibreOffice
   - Smaller file sizes (~30-150 KB vs PDF ~50-200 KB)
   - ATS-compatible like PDF
   - Dynamic file info based on format selection
   - Example: "John_Doe_Resume_20250119.docx"
   - Files: `src/services/docxDownloadService.js` (370 lines, new)
   - Updated: `src/components/DownloadModal.jsx`, `DownloadModal.css`, `ControlPanel.jsx`
   - NPM Package: Added `docx` library

3. **Filename Customization for Downloads** (Phase 4.2) ⭐
   - Professional download modal with filename customization
   - 3 quick filename options: Name Only, Name+Date, Date+Name
   - Custom filename input with real-time preview
   - Smart sanitization (auto-converts spaces to underscores, removes invalid chars)
   - File info display (format, size, ATS compatibility)
   - Example outputs: "John_Doe_Resume.pdf", "John_Doe_Resume_20250119.pdf"
   - Files: `src/components/DownloadModal.jsx`, `src/components/DownloadModal.css`
   - Updated: `src/services/pdfDownloadService.js`, `src/components/ControlPanel.jsx`

4. **Supabase Cloud Integration** ⭐
   - Complete authentication system (email/password + Google OAuth)
   - Cloud resume storage with Row Level Security (RLS)
   - Multi-resume support for authenticated users
   - Auto-migration from localStorage to cloud on first login
   - Dual persistence: localStorage (offline) + Supabase (cloud sync)
   - Files: `src/config/supabase.js`, `src/context/AuthContext.jsx`, `src/services/supabaseResumeService.js`, `SUPABASE_SCHEMA.md`
   - **IMPORTANT**: Requires GitHub Secrets configuration for deployment

3. **Automated Deployment**
   - GitHub Actions workflow for FTP deployment to Hostinger
   - Triggers on push to `main` or `claude/*` branches
   - Required secrets: FTP credentials + OpenAI API key + Supabase credentials
   - Clean-slate deployment with verbose logging
   - Files: `.github/workflows/deploy-hostinger.yml`, `DEPLOYMENT.md`

4. **Dual Upload System**
   - Primary: `ResumeUpload.jsx` (PDF + DOCX support via `resumeParserService.js`)
   - Legacy: `PDFUpload.jsx` (PDF only via `pdfService.js`)
   - Both use OpenAI GPT-4o-mini for AI parsing

5. **Environment Variables Migration**
   - All API keys unified to `import.meta.env.*` pattern
   - OpenAI: `VITE_OPENAI_API_KEY`
   - Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - Deprecated localStorage approach for API keys
   - Build-time injection via GitHub Actions

6. **Template System Enhancements**
   - 50 templates across 3 tiers (FREE, FREEMIUM, PREMIUM)
   - Template preview modal with full-screen view
   - Increased preview scale (0.6 → 1.0 for better visibility)
   - 5 reusable layout components (map 50 templates to 5 layouts)

7. **Score Calculation Fixes**
   - Fixed to use updated resume data after AI improvements
   - Proper state synchronization between iterations
   - Retry logic for JSON parsing errors

### Git Workflow Best Practices

**For new features:**
```bash
# Create a branch starting with claude/
git checkout -b claude/feature-name-sessionid

# Make changes, commit frequently
git add .
git commit -m "Descriptive message"

# Push to test deployment
git push -u origin claude/feature-name-sessionid

# After testing, merge to main
git checkout main
git merge claude/feature-name-sessionid
git push origin main
```

**For deployment testing:**
- Push to `claude/*` branches first to test FTP deployment
- Verify on Hostinger temp domain before merging to main
- Main branch pushes deploy to production

## Complete File Structure

### Configuration Files

```
/.github/workflows/deploy-hostinger.yml  # GitHub Actions FTP deployment (63 lines)
/package.json                            # Dependencies & scripts
/vite.config.js                          # Vite build configuration
/eslint.config.js                        # ESLint 9 configuration
/.env.example                            # Environment template
/index.html                              # HTML entry point
```

### Documentation Files

```
/README.md          # User-facing documentation (437 lines)
/CLAUDE.md          # This file - Claude instructions (comprehensive)
/DEPLOYMENT.md      # Deployment guide (235 lines)
/SUPABASE_SCHEMA.md # Supabase database schema & SQL migrations (349 lines)
```

### Source Code Structure

```
/src/
  /components/
    /templates/
      /layouts/
        ClassicSingleColumn.jsx       # 1-column ATS layout
        ModernTwoColumn.jsx           # 2-column with sidebar
        ExecutiveLayout.jsx           # Executive/leadership format
        CreativeLayout.jsx            # Visual creative designs
        MinimalistLayout.jsx          # Scandinavian minimalist
      TemplateRenderer.jsx            # Layout selector with LAYOUT_MAP
    About.jsx                         # Professional summary section
    Certifications.jsx                # Certifications section
    Contact.jsx                       # Contact information
    ControlPanel.jsx                  # Main toolbar (Import/Templates/Edit/Download/Reset)
    Education.jsx                     # Education section
    Experience.jsx                    # Work experience section
    Header.jsx                        # Personal info & contact details
    JobDescriptionInput.jsx           # AI analysis panel (914 lines!)
    PDFUpload.jsx                     # Legacy PDF-only upload
    ResumeUpload.jsx                  # Primary PDF/DOCX upload ⭐
    Skills.jsx                        # Skills section
    TemplateBrowser.jsx               # Template selection modal (291 lines)
    TemplateCustomization.jsx         # Color/font/spacing controls
    TemplatePreview.jsx               # Mini template preview
    TemplatePreviewModal.jsx          # Full-screen template preview

  /context/
    ResumeContext.jsx                 # Central state manager (368 lines)
                                      # - 35+ CRUD operations
                                      # - Dual persistence (localStorage + Supabase)
                                      # - Backwards compatibility handling
    AuthContext.jsx                   # Supabase authentication (108 lines)
                                      # - Email/password auth
                                      # - Google OAuth
                                      # - Session management

  /data/
    sampleData.js                     # Default resume data
    templateCatalog.js                # 50 template definitions (1,140 lines)

  /config/
    supabase.js                       # Supabase client configuration (17 lines)
                                      # - Environment variable validation
                                      # - Auto-refresh & session persistence

  /services/
    aiService.js                      # OpenAI integration (761 lines)
                                      # - 11 AI functions
                                      # - Temperature variations (0.3-1.0)
                                      # - Aggressive keyword optimization
    bulletPointSuggestions.js         # Bullet point library (260 lines)
                                      # - 15 role categories
                                      # - STAR method bullets
    pdfDownloadService.js             # jsPDF PDF generation (331 lines)
                                      # - Multi-page support
                                      # - Professional formatting
    pdfService.js                     # Legacy PDF parsing
    resumeParserService.js            # Primary PDF/DOCX parsing (209 lines)
                                      # - PDF: pdfjs-dist
                                      # - DOCX: mammoth
                                      # - AI: OpenAI GPT-4o-mini
                                      # - Retry logic for errors
    skillsSuggestions.js              # Skills library (690 lines)
                                      # - 20 skill categories
                                      # - 597 job titles
                                      # - Role-based suggestions
    supabaseResumeService.js          # Supabase CRUD operations (140 lines)
                                      # - Resume fetch/create/update/delete
                                      # - localStorage migration
                                      # - Multi-resume support

  /types/
    templateTypes.js                  # Type definitions

  App.jsx                             # Root component
  main.jsx                            # React entry point
  index.css                           # Global styles

/public/
  pdf.worker.min.mjs                  # PDF.js worker file
```

### Major Dependencies

```json
{
  "react": "^19.2.0",              // React 19
  "react-dom": "^19.2.0",
  "openai": "^6.8.1",              // OpenAI API client
  "@supabase/supabase-js": "^2.x", // Supabase client for auth & database
  "jspdf": "^3.0.3",               // PDF generation
  "pdfjs-dist": "^5.4.394",        // PDF parsing
  "mammoth": "^1.11.0",            // DOCX parsing
  "html2canvas": "^1.4.1",         // Canvas rendering
  "@vitejs/plugin-react": "^5.1.0",
  "vite": "^7.2.2",                // Build tool
  "eslint": "^9.39.1"              // Linting
}
```

## AI Service Details

### 11 AI Functions (aiService.js)

All functions use **OpenAI GPT-4o-mini** with `dangerouslyAllowBrowser: true`

1. **generateSummary**(currentSummary, jobDescription)
   - Temperature: 0.7
   - Output: 3-4 sentence professional summary
   - Keywords: Naturally integrated from job description

2. **generateBulletPoints**(jobTitle, company, briefDescription, jobDescription)
   - Temperature: 0.7
   - Output: 3-5 achievement-focused bullets
   - Metrics: Quantifiable results preferred

3. **analyzeJobDescription**(jobDescription)
   - Temperature: 0.5 (precision)
   - Output: JSON with technicalSkills, softSkills, responsibilities, keywords, cultureFit
   - Used for match score calculation

4. **calculateMatchScore**(resumeData, jobDescription)
   - Temperature: 0.3 (very precise)
   - Scoring: Keyword Match (40pts) + Skills Overlap (30pts) + Experience Relevance (20pts) + Completeness (10pts)
   - Output: { matchScore, strengths[], gaps[] }

5. **autoImproveResume**(resumeData, jobDescription, gaps)
   - Temperature: 0.9-1.0 (HIGH creativity for variety)
   - Strategy: AGGRESSIVE keyword optimization
   - Summary: 5-6 sentences, 8-10 exact keywords
   - Experience: 6-8 bullets per role, 3-4 keywords per bullet
   - Skills: Extract 15-20 missing skills
   - Goal: 95%+ match score

6. **generateMultipleBulletOptions**(resumeData, jobDescription, gaps, currentScore)
   - Temperature: 0.85
   - Output: 10-15 INDIVIDUAL bullets (not grouped by role)
   - Each bullet addresses ONE gap
   - Categories: Leadership, Technical, Business Impact, Scale, Innovation
   - User selects which to add manually

7. **generateGapBullets**(gaps, jobDescription, currentExperience)
   - Temperature: 0.8
   - Purpose: Iteration 2+ surgical gap fixing
   - Output: 1 bullet per gap directly addressing it
   - Preserves all existing content

8. **customizeResume**(resumeData, jobDescription)
   - End-to-end tailoring
   - Combines summary + bullets + skills optimization

9. **improveExperience**(experience, jobDescription)
   - Improves existing experience bullets
   - Maintains original structure

10. **suggestSkills**(jobDescription, currentSkills)
    - Recommends missing skills based on job

11. **generateContentVariations**(content, count)
    - A/B testing variants
    - Multiple variations of same content

### AI Optimization Workflow (JobDescriptionInput.jsx)

**Iteration 1: Comprehensive Rewrite** (Score: 0% → 85-90%)
```javascript
autoImproveResume(resumeData, jobDescription, gaps)
// - Rewrites ENTIRE resume
// - Summary: 5-6 sentences, 8-10 keywords
// - Experience: 6-8 bullets per role, ALL rewritten
// - Skills: Add 10-15 missing skills
// - Temperature: 0.9-1.0 (high creativity)
```

**Iteration 2+: Surgical Gap Fixing** (Score: 85% → 95%+)
```javascript
generateGapBullets(gaps, jobDescription, currentExperience)
// - Generate 1 bullet per remaining gap
// - ADD to existing content (don't remove)
// - Preserve iteration 1 improvements
// - Temperature: 0.8
```

**Manual Fine-Tuning: Individual Options** (Score: 95% → 98%)
```javascript
generateMultipleBulletOptions(resumeData, jobDescription, gaps, currentScore)
// - Generate 10-15 INDIVIDUAL bullets
// - User selects which to add
// - Precision control
// - Temperature: 0.85
```

## State Management Deep Dive

### ResumeContext Architecture

**Provider:** `ResumeContext.jsx` (368 lines)
**Hook:** `useResume()`
**Persistence:** localStorage (automatic)

**State Object:**
```javascript
{
  resumeData: {
    personal: { name, title, email, phone, location, linkedin, github, portfolio },
    about: string,
    experience: [{ id, title, company, date, description: string[] }],
    education: [{ id, degree, school, date, details }],
    skills: [{ category, skills: string[] }],
    certifications: [{ id, name, issuer, date, credentialId, credentialUrl }],
    jobDescription: string
  },
  currentTemplate: string,
  templateCustomization: { colorScheme, font, spacing },
  isEditing: boolean,
  loading: boolean
}
```

**35+ CRUD Operations Available:**
- `updatePersonal(field, value)`
- `updateAbout(value)`
- `updateExperience(index, field, value)`
- `addExperience()` / `removeExperience(index)`
- `updateExperienceDescription(expIndex, descIndex, value)`
- `addExperienceDescription(expIndex)` / `removeExperienceDescription(expIndex, descIndex)`
- `replaceExperienceDescription(expIndex, newDescriptionArray)` ← Used by AI
- `updateEducation(index, field, value)`
- `addEducation()` / `removeEducation(index)`
- `updateSkills(categoryIndex, field, value)`
- `addSkillCategory()` / `removeSkillCategory(index)`
- `updateCertification(index, field, value)`
- `addCertification()` / `removeCertification(index)`
- `updateJobDescription(value)`
- `setCurrentTemplate(templateId)`
- `updateTemplateCustomization(field, value)`
- `toggleEditMode()`
- `resetResume()`
- `loadResumeFromPDF(parsedData)` ← Used by upload components

**Backwards Compatibility Pattern:**
```javascript
// Example from lines 91-94
if (!parsedData.certifications) {
  parsedData.certifications = []
}
```

### localStorage Keys

- `resumeData` - All resume content
- `currentTemplate` - Selected template ID
- `templateCustomization` - Color/font/spacing preferences

Auto-saves on every change via `useEffect` hook.

## Deployment Architecture

### GitHub Actions Workflow

**File:** `.github/workflows/deploy-hostinger.yml`
**Triggers:**
- Push to `main` (production)
- Push to `claude/*` (testing)
- Manual dispatch

**Required Secrets:**
- `HOSTINGER_FTP_SERVER` - Example: `157.173.208.194` (NO ftp:// prefix!)
- `HOSTINGER_FTP_USERNAME` - Example: `u123456789`
- `HOSTINGER_FTP_PASSWORD` - FTP password
- `VITE_OPENAI_API_KEY` - OpenAI API key (baked into build)

**Deployment Steps:**
```yaml
1. Checkout repository (fetch-depth: 0)
2. Setup Node.js 18 with npm caching
3. Install dependencies (npm ci)
4. Build application
   env:
     VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
5. Verify build output (dist/ folder check)
6. Deploy to Hostinger via FTP
   - Action: SamKirkland/FTP-Deploy-Action@v4.3.5
   - Port: 21 (explicit)
   - Server: ${{ secrets.HOSTINGER_FTP_SERVER }}
   - Local: ./dist/
   - Remote: /public_html/
   - Clean slate: true (removes old files)
   - Verbose logging: enabled
```

**Common Issues & Solutions:**

1. **getaddrinfo ENOTFOUND** → FTP server hostname includes `ftp://` prefix (remove it!)
2. **530 Login incorrect** → Wrong FTP username/password
3. **Build fails** → Missing `VITE_OPENAI_API_KEY` secret
4. **Permission denied** → FTP account lacks write access to `/public_html/`

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js         # Bundled JavaScript
│   ├── index-[hash].css        # Bundled CSS
│   └── [other-assets]
└── pdf.worker.min.mjs          # PDF.js worker (must be in public/)
```

## Debugging & Monitoring

### Console Logging

**API Key Validation** (App.jsx):
```javascript
console.log('API Key exists?:', import.meta.env.VITE_OPENAI_API_KEY ? 'YES ✅' : 'NO ❌')
```

**Score Calculation** (aiService.js:368):
```javascript
console.log('Match Score:', { matchScore, strengths, gaps })
```

**Resume Parsing** (resumeParserService.js:128):
```javascript
console.log('Parsed Resume:', parsedData)
```

**Iteration Tracking** (JobDescriptionInput.jsx):
```javascript
console.log('Iteration:', iterationCount, 'Score:', currentScore)
```

### Error Handling Patterns

All async functions use try-catch:
```javascript
try {
  const response = await openai.chat.completions.create(...)
  return parseResponse(response)
} catch (error) {
  console.error('AI Error:', error)
  throw new Error('User-friendly message')
}
```

JSON parsing with retry logic:
```javascript
try {
  return JSON.parse(content)
} catch (parseError) {
  // Retry once with cleaned content
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  return JSON.parse(cleaned)
}
```

## Performance Considerations

### Build Optimization

- **Vite:** Lightning-fast HMR in development
- **Code Splitting:** Automatic by Vite
- **Tree Shaking:** Enabled in production builds
- **Asset Optimization:** CSS/JS minification

### Runtime Optimization

- **localStorage:** Reduces API calls for persistence
- **Context API:** Efficient re-renders (no prop drilling)
- **Lazy State Updates:** Debounced autosave
- **PDF Worker:** Offloads PDF parsing to Web Worker

### AI Cost Optimization

- **Model:** GPT-4o-mini (cheapest OpenAI model)
- **Token Limits:** Text truncation (8000 chars max)
- **Retry Logic:** Only 1 automatic retry
- **Temperature Tuning:** Lower = cheaper (fewer tokens)

## Security & Privacy

### Current Security Model

⚠️ **Client-Side API Key Exposure**
- OpenAI API key is visible in browser bundle
- Acceptable for: Personal use, local development, trusted users
- NOT recommended for: Public production without proxy

### Recommended Production Setup

1. **Backend API Proxy**
   ```
   User → React App → Your Backend → OpenAI API
   ```

2. **Rate Limiting**
   - Limit requests per user/IP
   - Set daily usage caps

3. **Authentication**
   - User login required
   - API key tied to user account

4. **Monitoring**
   - Track API usage per user
   - Alert on unusual activity

### Data Privacy

- **localStorage:** All data stays in user's browser
- **No Backend:** Zero data transmission to your servers
- **OpenAI:** Resume data sent to OpenAI for AI processing (per their privacy policy)

## Browser Compatibility

**Minimum Requirements:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Requiring Modern Browsers:**
- ES Modules (import/export)
- Async/Await
- localStorage
- Fetch API
- Web Workers (PDF parsing)
- FileReader API (file upload)

## Troubleshooting Guide

### Common Development Issues

**1. "API key is not defined" or "Missing Supabase environment variables" error**
```bash
# Solution:
cp .env.example .env
# Add all required environment variables:
# VITE_OPENAI_API_KEY=sk-proj-...
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
npm run dev  # Restart required!
```

**2. PDF parsing fails**
```bash
# Check pdf.worker.min.mjs exists:
ls public/pdf.worker.min.mjs

# If missing, copy from node_modules:
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

**3. Build fails**
```bash
# Clear cache and reinstall:
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

**4. Template not rendering**
```javascript
// Check LAYOUT_MAP in TemplateRenderer.jsx
// Ensure component name matches template's "component" field
```

**5. "supabaseUrl is required" error in production**
```bash
# This error occurs when Supabase environment variables are missing
# from GitHub Secrets during deployment

# Solution:
# 1. Go to GitHub repo → Settings → Secrets and variables → Actions
# 2. Add the following secrets:
#    - VITE_SUPABASE_URL (e.g., https://xxxxx.supabase.co)
#    - VITE_SUPABASE_ANON_KEY (from Supabase project settings)
# 3. Re-run the deployment workflow or push a new commit
```

**6. Supabase RLS policy errors**
```bash
# Error: "permission denied for table resumes"
# Solution: Ensure RLS policies are created in Supabase SQL Editor
# Run all SQL from SUPABASE_SCHEMA.md
```

### Common User Issues

**1. Resume not saving**
- **localStorage full** (5-10MB limit)
- **Incognito/private browsing** blocks localStorage
- **Supabase not authenticated**: Cloud sync only works when logged in
- **Solution**:
  - Download PDF backup
  - Clear localStorage
  - Sign in to enable cloud sync

**2. AI features not working**
- API key missing/invalid
- Network connectivity issues
- OpenAI API quota exceeded
- Solution: Check browser console for errors

**3. Low match score despite optimization**
- Job description too vague
- Resume lacks relevant experience
- Need more iterations (try 3-4 times)
- Solution: Manually add missing keywords

## Future Development Roadmap

### Planned Features

**Short-term (Next 1-3 months):**
- [ ] Backend API proxy for OpenAI (security)
- [ ] DOCX export functionality
- [ ] Template thumbnail generation
- [ ] Resume version history (compare iterations)
- [ ] A/B testing for bullet points

**Mid-term (3-6 months):**
- [x] User authentication & accounts ✅ (Supabase auth implemented)
- [x] Cloud storage for resumes ✅ (Supabase integration complete)
- [ ] Resume analytics (views, downloads)
- [ ] Cover letter generator
- [ ] LinkedIn profile optimization

**Long-term (6-12 months):**
- [ ] Automated testing suite (Jest + React Testing Library)
- [ ] Server-side PDF generation (better quality)
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Integration with job boards (Indeed, LinkedIn)

### Technical Debt to Address

1. **Testing:** Add unit tests for critical functions
2. **Security:** Implement backend API proxy
3. **PDF Parsing:** Improve complex layout handling
4. **Error Handling:** More granular error messages
5. **Performance:** Lazy load template components
6. **Accessibility:** WCAG 2.1 AA compliance audit

## Key Learnings & Best Practices

### What Works Well

✅ **Iterative AI Optimization:** Multiple refinement rounds achieve 95%+ scores
✅ **Template Reusability:** 5 layouts support 50 templates efficiently
✅ **Context API:** Simple state management without Redux complexity
✅ **localStorage:** Zero backend needed for persistence
✅ **Vite:** Fast development experience with HMR

### What Needs Improvement

⚠️ **Client-Side API Key:** Major security concern for production
⚠️ **PDF Parsing:** Limited to simple text-based resumes
⚠️ **No Tests:** Difficult to refactor with confidence
⚠️ **No Error Boundaries:** React errors crash entire app

### Architectural Decisions

**Why Context API over Redux?**
- Simpler for single-entity state (resume)
- No middleware needed
- Fewer dependencies

**Why GPT-4o-mini over GPT-4?**
- 10x cheaper
- Sufficient quality for resume content
- Faster response times

**Why localStorage over Backend?**
- Zero infrastructure costs
- Instant saves (no network latency)
- Privacy (data stays in browser)
- Simpler deployment

**Why 5 Layouts for 50 Templates?**
- DRY principle (Don't Repeat Yourself)
- Easy maintenance (fix once, applies to 10 templates)
- Consistent behavior across similar templates

## Contributing Guidelines (For Future Claude Sessions)

### Before Making Changes

1. **Read Recent Commits:** Understand what changed recently
2. **Check Open Branches:** See if feature already in progress
3. **Review DEPLOYMENT.md:** Understand deployment process
4. **Test Locally:** Always test before committing

### Making Changes

1. **Create Branch:** `claude/feature-name-sessionid`
2. **Commit Often:** Small, focused commits
3. **Test Thoroughly:** Manual testing in browser
4. **Update Documentation:** Keep CLAUDE.md and README.md current
5. **Push to Test:** Test deployment on `claude/*` branch first

### Merging to Main

1. **Review Changes:** Double-check all modifications
2. **Update Version:** Increment version if significant changes
3. **Test Deployment:** Verify FTP deployment succeeded
4. **Update CLAUDE.md:** Document what was added/changed

---

**End of CLAUDE.md** | Last Updated: 2025-11-18 | Version: 1.0.0
