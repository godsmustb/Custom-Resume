# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Custom Resume** is an AI-powered resume builder built with React and Vite. It helps users create ATS-optimized resumes tailored to specific job descriptions using OpenAI's API. The application features 51 professional resume templates, PDF generation/parsing, and real-time resume customization.

**Current Status:** Production-ready with automated FTP deployment to Hostinger
**Version:** 2.2.0
**Last Documentation Update:** 2025-12-10
**Deployment Status:** ✅ Active (GitHub Actions → Hostinger FTP)

### Quick Stats
- **Codebase Size:** ~18,000-20,000 lines of code
- **Components:** 42+ React components
- **Resume Templates:** 51 professional templates (3 tiers) ⭐ Includes custom user template
- **Cover Letter Templates:** 30 professional templates
- **AI Functions:** 11 OpenAI GPT-4o-mini functions
- **Skills Library:** 690+ categorized skills
- **Job Titles:** 597 autocomplete suggestions
- **Supported Formats:** PDF, DOCX (import), PDF & DOCX (export)
- **Features:** Resume Builder, Cover Letter Builder, Job Search & Tracking, Multi-Resume Management, Cloud Sync

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

**51 Resume Templates** organized in 3 tiers:
- **FREE** (9 templates): ATS-optimized, basic layouts (includes custom user template)
- **FREEMIUM** (22 templates): Industry-specific, mid-career
- **PREMIUM** (20 templates): Executive, specialized roles

Template architecture:
1. **Template Catalog** (`src/data/templateCatalog.js`): Registry of all 51 templates with metadata
2. **Template Renderer** (`src/components/templates/TemplateRenderer.jsx`): Dynamic layout selector
3. **Layout Components** (5 reusable layouts):
   - `ClassicSingleColumn`: Traditional 1-column ATS-friendly layout
   - `ModernTwoColumn`: Professional 2-column with sidebar
   - `ExecutiveLayout`: Premium executive/leadership format
   - `CreativeLayout`: Visual designs for creative industries
   - `MinimalistLayout`: Clean Scandinavian style

**How templates map to layouts**: The `LAYOUT_MAP` in `TemplateRenderer.jsx` maps each template's `component` field to one of the 5 actual layout components (plus custom standalone layouts like ProfessionalProjectManager). This allows reusing layouts across multiple templates with different styling/customization.

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
- `generateSummary()`: Creates tailored professional summaries **in bullet-point format (6-9 bullets, 80-120 words)** ⭐ UPDATED
- `generateBulletPoints()`: Generates achievement-focused experience bullets
- `analyzeJobDescription()`: Extracts keywords, skills, responsibilities
- `calculateMatchScore()`: ATS-style scoring (0-100) with gap analysis
- `autoImproveResume()`: **Generates EXACTLY 6-7 bullets per job** with varied action verbs and scale context ⭐ UPDATED
- `generateMultipleBulletOptions()`: Creates 10-15 individual gap-addressing bullets
- `customizeResume()`: End-to-end resume tailoring
- `categorizeSkills()`: **Organizes skills into 4 ATS-optimized categories** ⭐ NEW

**Recent AI Improvements (Based on ChatGPT Feedback):**
1. **Summary Format**: Now generates scannable bullet points (6-9 bullets, 12-15 words each) instead of dense paragraphs
2. **Bullet Count**: Enforces EXACTLY 6-7 bullets per job (not 8-10+) for better readability
3. **Action Verb Variety**: 14 different action verbs to prevent repetition (Architected, Spearheaded, Drove, Implemented, Optimized, Delivered, Established, Streamlined, Engineered, Designed, Pioneered, Orchestrated, Scaled, Transformed)
4. **Scale Context**: First 2-3 bullets always include scope (team size, budget, # projects, users, systems)
5. **Shorter Bullets**: 15-20 words max (was 15-25) for better scannability
6. **Skill Structure**: New `categorizeSkills()` function groups skills into Business Analysis, Technical & Modeling, Agile/Project Management, Tools/Software

**Important**: All AI prompts balance keyword density (for ATS) with human readability. Temperature varies by function (0.3-1.0) to balance creativity and precision.

### Resume Upload Services

**Two Upload Systems** (both use OpenAI for AI parsing):

1. **ResumeUpload** (`src/components/ResumeUpload.jsx`) - **Primary System** ⭐⭐⭐
   - Supports **both PDF and DOCX** file uploads
   - Uses `resumeParserService.js` for file processing
   - Drag-and-drop interface with progress indicators
   - File validation: PDF/DOCX, max 10MB
   - API key validation before processing
   - **Multi-Resume Upload Feature** (NEW):
     * After parsing, shows modal: "What would you like to do?"
     * Option 1: **Create New Resume** - saves as separate entry in cloud (requires auth)
     * Option 2: **Replace Current Resume** - updates current resume (existing behavior)
     * Smart title generation from resume name (e.g., "John Doe's Resume")
     * Integrates with ResumeManager for managing uploaded resumes
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

### Cover Letter Builder System

**Architecture**: Template-based cover letter creation with cloud sync

**Key Components:**
- **CoverLetterTemplateBrowser** (`src/components/CoverLetterTemplateBrowser.jsx`):
  - Grid view of 30 professional templates
  - Filter by industry (Technology, Healthcare, Business, etc.)
  - Filter by experience level (Entry-level, Mid-level, Senior)
  - Search by job title
  - Quick preview modal with full template content
  - Real-time filtering and search

- **CoverLetterEditor** (`src/components/CoverLetterEditor.jsx`):
  - Split-view interface: form on left, live preview on right
  - 12 customizable placeholder fields:
    * Personal: [Your Name], [Your Email], [Your Phone], [Your Address]
    * Company: [Company Name], [Hiring Manager Name], [Job Title]
    * Content: [Specific Achievement], [Relevant Skill], [Years of Experience]
    * Dates: [Today's Date], [Notice Period]
  - Real-time placeholder replacement
  - Yellow highlighting for unfilled placeholders
  - Progress indicator showing completion percentage
  - Auto-save to context state

- **SavedCoverLetters** (`src/components/SavedCoverLetters.jsx`):
  - Dashboard view of all saved letters
  - Grid layout with template cards
  - Actions: Edit, Duplicate, Delete
  - Metadata: Job title, industry, creation date, last updated
  - Content preview (first 200 characters)
  - Load saved letter into editor

**Cover Letter Services:**
- **coverLetterService.js** (`src/services/coverLetterService.js`):
  - `fetchTemplates()` - Load all 30 templates from Supabase
  - `fetchUserLetters(userId)` - Get user's saved letters
  - `saveUserLetter(userId, letterData)` - Save to cloud
  - `updateUserLetter(letterId, letterData)` - Update existing
  - `deleteUserLetter(letterId)` - Delete saved letter
  - All operations use Supabase RLS for security

- **coverLetterPDFService.js** (`src/services/coverLetterPDFService.js`):
  - Professional PDF generation using jsPDF
  - Business letter formatting:
    * Header: Name, contact info, date (right-aligned)
    * Recipient: Hiring manager, company (left-aligned)
    * Subject line (bold)
    * Body paragraphs with proper spacing
    * Signature section
  - Multi-page support with automatic pagination
  - Custom filename support
  - Proper margins and typography

**Database Schema** (see `COVER_LETTER_SCHEMA.md`):
- `cover_letter_templates` table:
  - Stores 30 pre-written templates
  - Fields: job_title, industry, experience_level, template_content, preview_text
  - Indexed by industry, experience_level, job_title

- `user_cover_letters` table:
  - Stores user's saved and customized letters
  - Fields: user_id, template_id, title, customized_content
  - RLS policies: Users only access their own letters
  - Cascading deletes when user is deleted

**Template Structure:**
Each template includes:
```javascript
{
  id: "uuid",
  jobTitle: "Software Engineer",
  industry: "Technology",
  experienceLevel: "Mid-level",
  templateContent: "Dear [Hiring Manager Name]...",
  previewText: "First 200 characters...",
  metadata: {
    keywords: [...],  // Industry-specific keywords
    tone: "Professional",
    length: "Medium"
  }
}
```

**Placeholder System:**
- Templates use bracket syntax: `[Placeholder Name]`
- Editor provides input fields for each unique placeholder
- Real-time replacement as user types
- Unfilled placeholders highlighted in yellow for visibility
- Smart defaults for common fields (e.g., today's date)

**Export Options:**
1. **Copy to Clipboard**: One-click copy of final text
2. **Download PDF**: Professional formatting via jsPDF
3. **Save to Account**: Cloud sync via Supabase (requires authentication)

**Use Cases:**
- Browse 30 pre-written professional templates
- Customize template with personal details
- Save multiple versions for different job applications
- Export as PDF for submission
- Access saved letters from any device (cloud sync)

### Job Search & Application Tracking System ⭐ NEW

**Architecture:** Job search + filtering + application tracking with cloud sync

**Key Components:**
- **JobSearchBoard** (`src/components/JobSearchBoard.jsx`):
  - Search bar for job title input
  - Collapsible filters sidebar
  - Job cards grid display
  - "My Applications" dashboard access

- **JobCard** (`src/components/JobCard.jsx`):
  - Job title, company, location, work type
  - Badges: Easy Apply, employment type, experience level
  - Applicant count with competition indicator
  - Bookmark button (save for later)
  - Date posted (relative time)

- **JobFilters** (`src/components/JobFilters.jsx`):
  - Easy Apply toggle
  - Date posted (24h/7d/30d/all)
  - Work type (Remote/Hybrid/On-site)
  - Employment type (Full-time/Part-time/Contract)
  - Experience level
  - Location search

- **JobDetailsModal** (`src/components/JobDetailsModal.jsx`):
  - Full job information display
  - Complete job description
  - Save/update job actions
  - Application notes
  - Status tracking
  - "View on LinkedIn" link

- **ApplicationDashboard** (`src/components/ApplicationDashboard.jsx`):
  - Stats cards (Saved, Applied, Interviewing, Offers)
  - Filter by status
  - Update application status
  - Add notes and track interviews
  - Delete saved jobs

**Job Search Services:**
- **jobSearchService.js** (`src/services/jobSearchService.js`):
  - `fetchJobListings(filters)` - Get jobs from database
  - `saveJobForUser(applicationData)` - Save job for tracking
  - `updateUserJobApplication(id, updates)` - Update status/notes
  - `getUserJobStats(userId)` - Get application statistics
  - All operations use Supabase RLS for security

- **linkedInScraperService.js** (`src/services/linkedInScraperService.js`):
  - `scrapeLinkedInJobsWithFallback(jobTitle, options)` - Search jobs
  - **Mock Mode (Current)**: Generates realistic fake jobs for testing
  - **Future**: Supabase Edge Function with Crawl4AI for real scraping
  - Auto-saves scraped jobs to database

**Database Schema** (see `JOB_SEARCH_SCHEMA.md`):
- `job_listings` table:
  - Stores all scraped job data (public, shared across users)
  - Fields: job_url, job_title, company_name, location, work_type, easy_apply, applicant_count, date_posted
  - Indexed for fast filtering and searching

- `user_job_applications` table:
  - User-specific job tracking with RLS
  - Fields: user_id, job_listing_id, status, applied_date, notes, resume_snapshot
  - Statuses: saved, applied, interviewing, offer, rejected, withdrawn

- `user_search_queries` table:
  - Search history for quick access
  - Fields: user_id, job_title, location, results_count, searched_at

**Current Status:** ✅ MVP Complete (Mock Data Mode)
- Mock job generation (10-20 realistic jobs per search)
- Advanced filtering (all filters functional)
- Save & track jobs (requires authentication)
- Application dashboard with stats
- Cloud sync via Supabase

**Future:** Real LinkedIn scraping via Supabase Edge Function (optional)

**For detailed documentation**, see **[JOB_SEARCH_FEATURE.md](JOB_SEARCH_FEATURE.md)** and **[JOB_SEARCH_SETUP_GUIDE.md](JOB_SEARCH_SETUP_GUIDE.md)**.

### Component Structure

**Main App Flow**:
1. `App.jsx`: Root component with `ControlPanel`, `JobDescriptionInput`, `TemplateRenderer`
2. `ControlPanel.jsx`: Main toolbar (template browser, PDF upload, customization, download)
3. `TemplateBrowser.jsx`: Modal for selecting from 51 templates with filters
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

**Add a new resume template:**
1. Add template metadata to `TEMPLATE_CATALOG` in `src/data/templateCatalog.js`
2. Map to existing layout or create new layout component in `src/components/templates/layouts/`
3. Update `LAYOUT_MAP` in `TemplateRenderer.jsx` if using new layout

**Add a new cover letter template:**
1. Create template object with required fields (jobTitle, industry, experienceLevel, templateContent, previewText)
2. Insert into Supabase `cover_letter_templates` table via SQL Editor
3. Template will automatically appear in CoverLetterTemplateBrowser
4. Use bracket syntax `[Placeholder Name]` for customizable fields

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
6. Update `pdfDownloadService.js` and `docxDownloadService.js` for exports

**Customize template styling:**
- Edit CSS in layout components (`src/components/templates/layouts/`)
- Use `customization` prop for color schemes and fonts
- Apply CSS variables for theming consistency

**Work with multi-resume management:**
- Access via `ResumeManager` component (ControlPanel → "My Resumes")
- Create new resume: `createNewResume(title)`
- Switch resume: `switchResume(id)`
- Rename: `renameResume(id, newTitle)`
- Duplicate: `duplicateResume(id)`
- Delete: `deleteCurrentResume()`
- All operations sync to Supabase if authenticated

**Manage cover letters:**
- Access via `SavedCoverLetters` component
- Save new letter: `saveUserLetter(userId, letterData)`
- Update existing: `updateUserLetter(letterId, letterData)`
- Delete: `deleteUserLetter(letterId)`
- All operations require authentication

## Recent Changes & Git Workflow

### Current Branch Status

**Production Branch:** `main`
**Testing Branches:** `claude/*` (auto-deploys for testing)
**Current Working Branch:** `claude/update-docs-context-01EyJwHJZPAQK1mkcC3wHdTV`

### Recent Major Changes (Last 10 Commits)

```
fcb67c8 - Fix: Enable edit mode for Professional Project Manager template
e651f0c - Fix: Improve skills layout and date parsing
97ee81e - Add Professional Project Manager template as default (Template #51)
6dca55f - Update CLAUDE.md: Document Multi-Resume Upload Integration (Phase 5.5)
2a37029 - Add multi-resume upload feature: Create new or replace current
68cfbd5 - Document AI optimization improvements in CLAUDE.md (v2.1.0)
3910d1c - Improve AI resume generation based on ChatGPT feedback
ca39de3 - Update documentation to v2.0: Add Cover Letter & Multi-Resume features
7ca3dc8 - Merge pull request #21 from godsmustb/claude/fix-supabase-env-vars-019mZDfybE7BgNt7nptM4QoZ
08e3b05 - Trigger Hostinger deployment - all PDF fixes ready
```

### Recent Feature Additions

1. **Job Search & Application Tracking** (Latest - Phase 6.0) ⭐⭐⭐⭐ **NEW**
   - Complete job search system with LinkedIn-style filtering and application tracking!
   - **Search Interface**:
     * Minimalistic modern UI with 3-section layout
     * Search bar for job title input (e.g., "Product Manager", "Software Engineer")
     * Mock LinkedIn job generation (10-20 realistic jobs per search)
     * Collapsible filters sidebar
     * Job cards grid with responsive design
   - **Advanced Filtering**:
     * Easy Apply toggle (show only quick-apply jobs)
     * Date posted filter (Last 24h, Last week, Last month, All time)
     * Work type (Remote, Hybrid, On-site)
     * Employment type (Full-time, Part-time, Contract, Internship)
     * Experience level (Entry, Mid-Senior, Director, Executive)
     * Location text search
     * Client-side filtering (instant updates)
   - **Job Cards**:
     * Job title with "NEW" badge for recent posts
     * Company name, location, work type
     * Badges: Easy Apply, employment type, experience level
     * Applicant count with competition indicator (low/medium/high)
     * Date posted (relative time: "2 days ago")
     * Bookmark icon (save for later - requires auth)
   - **Job Details Modal**:
     * Full job information grid
     * Complete job description (HTML rendered)
     * Save/update job actions
     * Application notes textarea
     * Status tracking dropdown
     * "View on LinkedIn" link
   - **Application Dashboard**:
     * Stats cards: Saved (📌), Applied (✅), Interviewing (👥), Offers (🎉)
     * Filter by status (All, Saved, Applied, Interviewing, Offers)
     * Update application status per job
     * Add personal notes
     * Delete saved jobs
     * Track interview dates (JSONB storage)
   - **Database Schema** (3 new tables):
     * `job_listings` - All scraped jobs (public, shared)
     * `user_job_applications` - User's saved jobs (RLS protected)
     * `user_search_queries` - Search history
   - **Services**:
     * `jobSearchService.js` - 15+ CRUD functions for Supabase operations
     * `linkedInScraperService.js` - Mock scraper (realistic fake data)
     * Future: Supabase Edge Function with Crawl4AI for real scraping
   - **Files Created** (~5,000+ lines):
     * Components: `JobSearchBoard.jsx`, `JobCard.jsx`, `JobFilters.jsx`, `JobDetailsModal.jsx`, `ApplicationDashboard.jsx` + CSS
     * Context: `JobSearchContext.jsx` (400+ lines)
     * Services: `jobSearchService.js`, `linkedInScraperService.js`
     * Types: `jobSearchTypes.js` (utility functions)
     * Docs: `JOB_SEARCH_SCHEMA.md`, `JOB_SEARCH_FEATURE.md`, `JOB_SEARCH_SETUP_GUIDE.md`
   - **Current Status**: ✅ MVP Complete (Mock Data Mode)
   - **Future**: Optional real LinkedIn scraping via Supabase Edge Function
   - Commit: (Current session - 2025-12-10)

2. **AI Resume Optimization Improvements** (Phase 5.4) ⭐⭐⭐
   - Enhanced resume generation based on ChatGPT feedback for better ATS + human readability
   - **Scannable Summary Format**:
     * Bullet-point format (not paragraphs)
     * 6-9 concise bullets (80-120 words total)
     * Each bullet 12-15 words for quick scanning
     * Scale/scope in first 2-3 bullets (team size, budget, projects, users)
   - **Optimized Experience Bullets**:
     * EXACTLY 6-7 bullets per job (not 8-10+)
     * Shorter bullets: 15-20 words max (was 15-25)
     * 14 varied action verbs to prevent repetition
     * Clear structure: Scope → Action → Measurable Outcome
   - **NEW: Skill Categorization** (`categorizeSkills()` function):
     * Organizes skills into 4 ATS-optimized groups
     * Business Analysis, Technical & Modeling, Agile/Project Management, Tools/Software
     * Improves ATS parsing and recruiter readability
   - **Benefits**:
     * More scannable for human recruiters (skim in 10 seconds)
     * Better ATS parsing with structured content
     * No repetitive language or sentence structures
     * Maintains 95%+ keyword match while improving readability
   - Files: `src/services/aiService.js` (3 functions updated, 1 new function)
   - Commit: 3910d1c

2. **Multi-Resume Upload Integration** (Phase 5.5) ⭐⭐⭐ **NEW**
   - Upload multiple resumes and store them separately in the cloud!
   - **Enhanced Upload Flow**:
     * After AI parses resume, shows modal: "What would you like to do?"
     * Option 1: **Create New Resume** - saves as separate cloud entry (requires auth)
     * Option 2: **Replace Current Resume** - updates current resume (existing behavior)
   - **Smart Features**:
     * Auto-generates default title from resume name (e.g., "John Doe's Resume")
     * User can customize title before creating
     * Keyboard shortcuts: Enter to confirm, Escape to cancel
   - **Integration**:
     * Works seamlessly with ResumeManager component
     * All uploaded resumes appear in "My Resumes" dashboard
     * Can delete, rename, duplicate uploaded resumes
   - **Technical Implementation**:
     * New function: `createNewResumeFromData(title, customResumeData, template, customization)`
     * ResumeContext enhanced to accept custom resume data
     * Modal system with action selection and title input
   - **Files**:
     * `src/context/ResumeContext.jsx` - Added createNewResumeFromData() function
     * `src/components/ResumeUpload.jsx` - Enhanced with modal workflow (294 lines)
     * `src/components/ResumeUpload.css` - New modal styles (493 lines total)
   - **Use Case**: Upload resumes for different roles, keep all organized, switch between them
   - Commit: 2a37029

3. **Professional Project Manager Template** (Template #51) ⭐⭐⭐ **NEW**
   - Custom template based on user's actual resume - now the default template for the entire website!
   - **Design Features**:
     * Clean, traditional single-column layout
     * Centered header with uppercase name and blue accent color
     * Gradient section dividers for visual separation
     * Two-column strengths/skills grid (adaptive 3-column for 13+ skills)
     * Professional color scheme: Corporate blue (#3182CE) with gray text
     * Calibri/Arial font family for professional appearance
   - **Technical Implementation**:
     * Uses existing editable components (Header, About, Experience, Education, Skills, Certifications, Contact)
     * Custom CSS overrides (381 lines) to style components to match original design
     * Proper edit mode support - all sections fully editable inline
     * Responsive design with mobile optimization
     * Print-optimized styling
   - **Adaptive Skills Layout**:
     * 2-column grid by default for readability
     * Automatically switches to 3-column when 13+ skills detected
     * Blue bullet points (•) for visual consistency
     * Proper spacing and alignment
   - **Section Order**:
     1. Header (centered with contact info)
     2. Summary (professional overview)
     3. Strengths (2-3 column skill grid)
     4. Experience (chronological work history)
     5. Education (academic credentials)
     6. Certifications (professional certifications - conditional display)
   - **Why This Template**:
     * User's personal resume used as base design
     * ATS-optimized single-column layout (96 ATS score)
     * Perfect for Project Management, Operations, Engineering roles
     * Set as default for all new users
   - **Files**:
     * `src/components/templates/layouts/ProfessionalProjectManager.jsx` (73 lines)
     * `src/components/templates/layouts/ProfessionalProjectManager.css` (381 lines)
     * `src/data/templateCatalog.js` - Added as first template with default: true
     * `src/components/templates/TemplateRenderer.jsx` - Added import and mapping
     * `src/context/ResumeContext.jsx` - Changed default template in 6 locations
   - **Fixes Applied**:
     * **Skills Layout**: Fixed to display in parallel 2-3 column grid (was vertical list)
     * **Date Parsing**: Enhanced AI prompt to explicitly extract education/certification dates
     * **Edit Mode**: Completely rewrote to use editable components instead of custom rendering
   - **Commits**:
     * 97ee81e - Add Professional Project Manager template as default
     * e651f0c - Fix: Improve skills layout and date parsing
     * fcb67c8 - Fix: Enable edit mode for Professional Project Manager template
   - **Industries**: Project Management, Operations, Engineering, Manufacturing, Construction

4. **Cover Letter Builder** (Phase 5.0) ⭐⭐⭐⭐
   - Complete cover letter creation system with 30 professional templates!
   - **Template Browser**: Grid view with filters (industry, experience level, job title)
   - **Live Editor**: Split-view interface with real-time preview
   - **30 Pre-Written Templates**:
     * 3 experience levels: Entry-level, Mid-level, Senior
     * 15+ industries: Technology, Healthcare, Business, Marketing, Finance, etc.
     * Pre-written with quantifiable achievements and action verbs
   - **Export Options**:
     * Copy to clipboard (one-click)
     * Download as PDF (professional formatting)
     * Save to cloud (Supabase sync for authenticated users)
   - **My Saved Letters Dashboard**: View, edit, duplicate, delete saved letters
   - **Smart Placeholder System**: 12 customizable fields with auto-replacement
   - **Progress Indicator**: Shows remaining unfilled fields
   - Files:
     * `src/components/CoverLetterEditor.jsx` (244 lines)
     * `src/components/CoverLetterTemplateBrowser.jsx` (371 lines)
     * `src/components/SavedCoverLetters.jsx` (248 lines)
     * `src/context/CoverLetterContext.jsx` (362 lines)
     * `src/services/coverLetterService.js` (330 lines)
     * `src/services/coverLetterPDFService.js` (254 lines)
     * `src/types/coverLetterTypes.js` (180 lines)
     * `src/data/coverLetterTemplates.json`
   - Database:
     * `cover_letter_templates` table (stores 30 templates)
     * `user_cover_letters` table (stores user's saved letters)
   - Documentation: `COVER_LETTER_FEATURE.md`, `COVER_LETTER_SCHEMA.md`
   - Total: ~2,000 lines of new code

4. **Multi-Resume Management** (Phase 5.1) ⭐⭐⭐
   - Manage multiple resumes in the cloud for authenticated users!
   - **Resume Manager Component** (`src/components/ResumeManager.jsx`, 220 lines):
     * Create new resumes with custom titles
     * Switch between saved resumes
     * Rename existing resumes
     * Duplicate resumes for variations
     * Delete resumes
     * View all resumes in grid layout
   - **ResumeContext Enhancements**:
     * `userResumes` - Array of all user's resumes
     * `currentResumeId` - Active resume identifier
     * `currentResumeTitle` - Active resume name
     * `switchResume(id)` - Switch to different resume
     * `createNewResume(title)` - Create new resume
     * `deleteCurrentResume()` - Delete active resume
     * `renameResume(id, newTitle)` - Rename resume
     * `duplicateResume(id)` - Clone resume
   - **Cloud Sync**: All resumes automatically sync to Supabase
   - **localStorage Fallback**: Works offline, syncs when authenticated
   - Use Case: Create different resumes for different job types or companies

5. **Sync Status Indicator** (Phase 5.2) ⭐
   - Real-time cloud synchronization status display!
   - **SyncStatus Component** (`src/components/SyncStatus.jsx`, 61 lines):
     * Visual indicator: 🔄 Saving... / ✅ Saved to cloud / ❌ Sync error
     * Shows current resume title
     * Only visible when user is authenticated
     * Updates in real-time during save operations
   - **Status States**:
     * `syncing` - Currently saving to cloud
     * `synced` - Successfully saved
     * `error` - Sync failed (with error message)
     * `idle` - Ready to save
   - CSS: `src/components/SyncStatus.css`
   - Integrated into main UI for user confidence

6. **Enhanced Authentication UI** (Phase 5.3) ⭐⭐
   - Completely refactored authentication components for better UX!
   - **Separate Components**:
     * `src/components/auth/Login.jsx` (137 lines) - Login form with email/password
     * `src/components/auth/Register.jsx` (176 lines) - Registration form
     * `src/components/auth/AuthModal.jsx` (17 lines) - Modal wrapper
     * `src/components/auth/AuthCallback.jsx` (43 lines) - OAuth callback handler
     * `src/components/auth/Auth.css` - Unified styling
   - **Features**:
     * Email/password authentication
     * Google OAuth integration
     * Password reset functionality
     * Form validation with error messages
     * Loading states during authentication
     * Smooth transitions between login/register
   - **Security**: All auth handled by Supabase with RLS policies
   - Total: ~373 lines of auth UI code

7. **Template-Aware Export** (Phase 4.3) ⭐⭐⭐
   - Exports now match your selected template design exactly!
   - Export Style Selection in download modal:
     * 🎨 Template Design - captures exact visual appearance
     * 📄 Generic Format - simple black & white layout
   - Uses html2canvas + jsPDF for high-quality PDF generation
   - Preserves all template styling, colors, fonts, and spacing
   - Two-column layouts export perfectly
   - Multi-page support with proper pagination
   - Loading indicator during export process
   - Works with all 51 templates
   - Example: Modern Two Column template exports with sidebar colors intact!
   - Files: `src/services/templateAwareExportService.js` (200+ lines, new)
   - Updated: `src/components/DownloadModal.jsx`, `DownloadModal.css`, `ControlPanel.jsx`

8. **Print Optimization** (Phase 4.4) ⭐
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
   - Supports all 51 templates
   - Two-column layouts print correctly
   - Skills displayed inline to save space
   - Files: `src/print.css` (430 lines, new)
   - Updated: `src/main.jsx`, `src/components/ControlPanel.jsx`

9. **DOCX Export Functionality** (Phase 4.1) ⭐⭐
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

10. **Filename Customization for Downloads** (Phase 4.2) ⭐
   - Professional download modal with filename customization
   - 3 quick filename options: Name Only, Name+Date, Date+Name
   - Custom filename input with real-time preview
   - Smart sanitization (auto-converts spaces to underscores, removes invalid chars)
   - File info display (format, size, ATS compatibility)
   - Example outputs: "John_Doe_Resume.pdf", "John_Doe_Resume_20250119.pdf"
   - Files: `src/components/DownloadModal.jsx`, `src/components/DownloadModal.css`
   - Updated: `src/services/pdfDownloadService.js`, `src/components/ControlPanel.jsx`

11. **Supabase Cloud Integration** ⭐
   - Complete authentication system (email/password + Google OAuth)
   - Cloud resume storage with Row Level Security (RLS)
   - Multi-resume support for authenticated users
   - Auto-migration from localStorage to cloud on first login
   - Dual persistence: localStorage (offline) + Supabase (cloud sync)
   - Files: `src/config/supabase.js`, `src/context/AuthContext.jsx`, `src/services/supabaseResumeService.js`, `SUPABASE_SCHEMA.md`
   - **IMPORTANT**: Requires GitHub Secrets configuration for deployment

12. **Automated Deployment**
   - GitHub Actions workflow for FTP deployment to Hostinger
   - Triggers on push to `main` or `claude/*` branches
   - Required secrets: FTP credentials + OpenAI API key + Supabase credentials
   - Clean-slate deployment with verbose logging
   - Files: `.github/workflows/deploy-hostinger.yml`, `DEPLOYMENT.md`

13. **Dual Upload System**
   - Primary: `ResumeUpload.jsx` (PDF + DOCX support via `resumeParserService.js`)
   - Legacy: `PDFUpload.jsx` (PDF only via `pdfService.js`)
   - Both use OpenAI GPT-4o-mini for AI parsing

14. **Environment Variables Migration**
   - All API keys unified to `import.meta.env.*` pattern
   - OpenAI: `VITE_OPENAI_API_KEY`
   - Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - Deprecated localStorage approach for API keys
   - Build-time injection via GitHub Actions

15. **Template System Enhancements**
   - 51 templates across 3 tiers (FREE: 9, FREEMIUM: 22, PREMIUM: 20)
   - Template preview modal with full-screen view
   - Increased preview scale (0.6 → 1.0 for better visibility)
   - 5 reusable layout components (map most templates to 5 core layouts)
   - Custom standalone templates (e.g., Professional Project Manager)

16. **Score Calculation Fixes**
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
/README.md                    # User-facing documentation (437 lines)
/CLAUDE.md                    # This file - Claude instructions (comprehensive)
/DEPLOYMENT.md                # Deployment guide (235 lines)
/SUPABASE_SCHEMA.md           # Supabase database schema & SQL migrations (349 lines)
/COVER_LETTER_FEATURE.md      # Cover letter feature documentation
/COVER_LETTER_SCHEMA.md       # Cover letter database schema & SQL
/COMPLETE_DATABASE_SETUP.sql  # Complete database setup script
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
    /auth/                            # ⭐ NEW: Authentication components
      Login.jsx                       # Login form (137 lines)
      Register.jsx                    # Registration form (176 lines)
      AuthModal.jsx                   # Modal wrapper (17 lines)
      AuthCallback.jsx                # OAuth callback handler (43 lines)
      Auth.css                        # Unified auth styling
    About.jsx                         # Professional summary section
    Certifications.jsx                # Certifications section
    Contact.jsx                       # Contact information
    ControlPanel.jsx                  # Main toolbar (Import/Templates/Edit/Download/Reset)
    CoverLetterEditor.jsx             # ⭐ NEW: Cover letter live editor (244 lines)
    CoverLetterTemplateBrowser.jsx    # ⭐ NEW: Cover letter template browser (371 lines)
    DownloadModal.jsx                 # Download customization modal
    Education.jsx                     # Education section
    Experience.jsx                    # Work experience section
    Header.jsx                        # Personal info & contact details
    JobDescriptionInput.jsx           # AI analysis panel (914 lines!)
    PDFUpload.jsx                     # Legacy PDF-only upload
    ResumeManager.jsx                 # ⭐ NEW: Multi-resume management (220 lines)
    ResumeUpload.jsx                  # Primary PDF/DOCX upload ⭐
    SavedCoverLetters.jsx             # ⭐ NEW: Saved cover letters dashboard (248 lines)
    Skills.jsx                        # Skills section
    SyncStatus.jsx                    # ⭐ NEW: Cloud sync indicator (61 lines)
    TemplateBrowser.jsx               # Template selection modal (291 lines)
    TemplateCustomization.jsx         # Color/font/spacing controls
    TemplatePreview.jsx               # Mini template preview
    TemplatePreviewModal.jsx          # Full-screen template preview

  /context/
    ResumeContext.jsx                 # Central state manager (enhanced)
                                      # - 35+ CRUD operations
                                      # - Dual persistence (localStorage + Supabase)
                                      # - Multi-resume management ⭐ NEW
                                      # - Cloud sync status tracking ⭐ NEW
    AuthContext.jsx                   # Supabase authentication (108 lines)
                                      # - Email/password auth
                                      # - Google OAuth
                                      # - Session management
    CoverLetterContext.jsx            # ⭐ NEW: Cover letter state manager (362 lines)
                                      # - Template browsing & selection
                                      # - Live editing with placeholders
                                      # - Save/load/delete operations
                                      # - Supabase cloud sync

  /data/
    sampleData.js                     # Default resume data
    templateCatalog.js                # 50 resume template definitions (1,140 lines)
    coverLetterTemplates.json         # ⭐ NEW: 30 cover letter templates

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
    coverLetterService.js             # ⭐ NEW: Cover letter Supabase CRUD (330 lines)
                                      # - Fetch templates from database
                                      # - Save/load/delete user letters
                                      # - Cloud synchronization
    coverLetterPDFService.js          # ⭐ NEW: Cover letter PDF generation (254 lines)
                                      # - Professional formatting
                                      # - Multi-page support
                                      # - jsPDF integration
    docxDownloadService.js            # DOCX generation (370 lines)
                                      # - Microsoft Word format
                                      # - Fully editable output
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
    supabaseResumeService.js          # Supabase CRUD operations (enhanced)
                                      # - Resume fetch/create/update/delete
                                      # - localStorage migration
                                      # - Multi-resume support ⭐ ENHANCED
    templateAwareExportService.js     # Template-aware PDF export (200+ lines)
                                      # - Captures template design
                                      # - html2canvas + jsPDF
                                      # - Multi-page support

  /types/
    templateTypes.js                  # Resume template type definitions
    coverLetterTypes.js               # ⭐ NEW: Cover letter type definitions (180 lines)

  App.jsx                             # Root component
  main.jsx                            # React entry point
  index.css                           # Global styles
  print.css                           # Print stylesheet (430 lines)

/public/
  pdf.worker.min.mjs                  # PDF.js worker file
  .htaccess                           # ⭐ NEW: Apache configuration for deployment
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

1. **generateSummary**(currentSummary, jobDescription) ⭐ UPDATED
   - Temperature: 0.7
   - Output: 6-9 bullet points (80-120 words total) in scannable format
   - Each bullet: 12-15 words max, varied power words
   - First 2-3 bullets include scale/scope (team size, budget, projects, users)
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

5. **autoImproveResume**(resumeData, jobDescription, gaps) ⭐ UPDATED
   - Temperature: 0.9-1.0 (HIGH creativity for variety)
   - Strategy: Balanced ATS optimization + human readability
   - Summary: 6-9 bullet points (80-120 words), varied power words, scale/scope upfront
   - Experience: EXACTLY 6-7 bullets per role (not 8+), 15-20 words each
   - Action verbs: 14 varied verbs (Architected, Spearheaded, Drove, Implemented, Optimized, Delivered, etc.)
   - Structure: Scope → Action → Measurable Outcome
   - Skills: Extract 15-20 missing skills
   - Goal: 95%+ match score with better scannability

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

12. **categorizeSkills**(skillsList, jobDescription) ⭐ NEW
    - Temperature: 0.3 (precision)
    - Organizes skills into 4 ATS-optimized categories:
      * Business Analysis
      * Technical & Modeling
      * Agile/Project Management
      * Tools/Software
    - Improves ATS parsing and recruiter readability
    - Each skill in one category only (no duplicates)

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
- [ ] Template thumbnail generation
- [ ] Resume version history (compare iterations)
- [ ] A/B testing for bullet points
- [ ] Cover letter AI customization (tailor to job description)

**Mid-term (3-6 months):**
- [x] User authentication & accounts ✅ (Supabase auth implemented)
- [x] Cloud storage for resumes ✅ (Supabase integration complete)
- [x] DOCX export functionality ✅ (Phase 4.1)
- [x] Cover letter generator ✅ (Phase 5.0 - 30 templates)
- [x] Multi-resume management ✅ (Phase 5.1)
- [ ] Resume analytics (views, downloads)
- [ ] LinkedIn profile optimization
- [ ] Cover letter template customization (colors, fonts)

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
✅ **Template Reusability:** 5 core layouts + custom standalone templates support 51 templates efficiently
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

**Why 5 Core Layouts for 51 Templates?**
- DRY principle (Don't Repeat Yourself)
- Easy maintenance (fix once, applies to multiple templates)
- Consistent behavior across similar templates
- Custom standalone templates (like Professional Project Manager) for unique designs

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

**End of CLAUDE.md** | Last Updated: 2025-11-25 | Version: 2.1.0
