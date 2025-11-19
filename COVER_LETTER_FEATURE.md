# Cover Letter Feature - Complete Documentation

## Overview

The Cover Letter Builder is a comprehensive feature that allows users to create professional, ATS-optimized cover letters using pre-written templates. This feature integrates seamlessly with the existing Custom Resume application.

**Status:** ✅ Production-ready
**Version:** 1.0.0
**Last Updated:** 2025-11-19

---

## Features

### 1. **30 Professional Templates**
- Industry-specific templates covering all major job roles
- 3 experience levels: Entry-level, Mid-level, Senior
- 15+ industries including Technology, Healthcare, Business, Marketing, Finance, etc.
- Pre-written with quantifiable achievements and strong action verbs

### 2. **Template Browser**
- Grid view with template cards
- Filter by industry and experience level
- Search by job title
- Quick preview modal for each template
- Real-time filtering

### 3. **Live Editor**
- Split-view interface: form on left, preview on right
- Real-time placeholder replacement
- 12 customizable fields (name, email, company, etc.)
- Highlights unfilled placeholders in yellow
- Progress indicator showing remaining fields

### 4. **Export & Save**
- **Copy to Clipboard**: One-click copy
- **Download as PDF**: Professional formatting using jsPDF
- **Save to Account**: Cloud sync via Supabase (requires authentication)
- **Multi-device Access**: Access saved letters from any device

### 5. **My Saved Letters Dashboard**
- Grid view of all saved cover letters
- Edit, duplicate, and delete functionality
- Shows last updated date and creation date
- Template metadata (job title, industry)
- Content preview

---

## Installation & Setup

### Step 1: Database Setup

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy and execute the SQL from `COVER_LETTER_SCHEMA.md` in this order:
   - **Section 1**: Create tables
   - **Section 2**: Enable RLS policies
   - **Section 3**: Insert 30 templates
   - **Section 4**: Verify data (optional)

### Step 2: Verify Installation

The feature is already integrated into your application. No additional npm packages are required (jsPDF is already installed).

### Step 3: Test the Feature

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to **Cover Letter Builder** tab in the top navigation

3. Click **Browse Templates** to see all 30 templates

4. Select a template and fill in your details

5. Download as PDF or save to your account

---

## File Structure

```
/src
  /components
    CoverLetterTemplateBrowser.jsx  # Template browsing modal (371 lines)
    CoverLetterEditor.jsx            # Split-view editor (244 lines)
    SavedCoverLetters.jsx            # Saved letters dashboard (248 lines)

  /context
    CoverLetterContext.jsx           # State management (262 lines)

  /services
    coverLetterService.js            # Supabase CRUD operations (300 lines)
    coverLetterPDFService.js         # PDF generation (225 lines)

  /types
    coverLetterTypes.js              # Type definitions & utilities (180 lines)

  /data
    coverLetterTemplates.json        # 30 templates as JSON (for reference)

/COVER_LETTER_SCHEMA.md              # SQL schema & insert statements
/COVER_LETTER_FEATURE.md             # This documentation file
```

---

## Database Schema

### Tables

#### 1. `cover_letter_templates`
Stores pre-written templates (public read access).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `job_title` | VARCHAR(255) | Job title (e.g., "Software Engineer") |
| `industry` | VARCHAR(100) | Industry category |
| `experience_level` | VARCHAR(50) | Entry-level, Mid-level, Senior |
| `template_content` | TEXT | Full template with placeholders |
| `preview_text` | TEXT | First 200 characters |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### 2. `user_cover_letters`
Stores user's saved cover letters (protected by RLS).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users` |
| `template_id` | UUID | Foreign key to `cover_letter_templates` (nullable) |
| `title` | VARCHAR(255) | Cover letter title |
| `customized_content` | TEXT | User's customized content |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Row Level Security (RLS)

- **Templates**: Public read access for all users
- **User Cover Letters**:
  - Users can only view/edit/delete their own letters
  - INSERT/UPDATE/DELETE require authentication
  - Protected by `auth.uid() = user_id`

---

## Template Categories

### Industries (15)
1. Technology
2. Healthcare
3. Business
4. Marketing
5. Sales
6. Customer Service
7. Creative
8. Administrative
9. Human Resources
10. Finance
11. Education
12. Real Estate
13. Skilled Trades
14. Hospitality
15. Retail
16. Logistics
17. Operations

### Experience Levels (3)
1. Entry-level
2. Mid-level
3. Senior

### Job Roles (30)
Software Engineer, QA Engineer, Data Analyst, Product Manager, Business Analyst, Project Manager, Registered Nurse, Medical Assistant, Pharmacist, Marketing Manager, Sales Representative, Customer Service Representative, Graphic Designer, Content Writer, Social Media Manager, Executive Assistant, Administrative Assistant, HR Manager, Financial Analyst, Accountant, Teacher, Real Estate Agent, Electrician, HVAC Technician, Restaurant Manager, Retail Store Manager, Warehouse Supervisor, Operations Manager, DevOps Engineer, UX/UI Designer

---

## Placeholder Fields (12)

All templates include these customizable placeholders:

1. `[Full Name]`
2. `[Your Address]`
3. `[Phone Number]`
4. `[Email Address]`
5. `[Date]` - Auto-filled with current date
6. `[Hiring Manager Name]`
7. `[Company Name]`
8. `[Company Address]`
9. `[Specific Company Achievement/Project]`
10. `[Years of Experience]`
11. `[Previous Company Name]`
12. `[Relevant Certification]`

---

## API Reference

### CoverLetterContext Methods

```javascript
import { useCoverLetter } from './context/CoverLetterContext';

const {
  // Templates
  templates,                    // Array of all templates
  templatesLoading,             // Boolean loading state
  templatesError,               // Error message (if any)
  fetchTemplates,               // Function(filters) - Fetch templates

  // Saved letters
  savedLetters,                 // Array of user's saved letters
  savedLettersLoading,          // Boolean loading state
  savedLettersError,            // Error message (if any)
  fetchSavedLetters,            // Function() - Fetch saved letters

  // Current editing state
  currentTemplate,              // Currently selected template
  currentLetter,                // Currently editing letter
  formData,                     // Form data object
  customizedContent,            // Final content with replacements

  // Actions
  startNewLetter,               // Function(template) - Start new letter
  editSavedLetter,              // Function(letterId) - Edit existing
  saveCoverLetter,              // Function(title) - Save current letter
  deleteCoverLetter,            // Function(letterId) - Delete letter
  duplicateCoverLetter,         // Function(letterId) - Duplicate letter
  updateFormField,              // Function(field, value) - Update field
  updateFormData,               // Function(newData) - Bulk update
  updateCustomizedContent,      // Function(content) - Update content
  resetEditor,                  // Function() - Clear editor state

  // UI state
  showTemplateBrowser,          // Boolean
  showEditor,                   // Boolean
  showSavedLetters,             // Boolean
  openTemplateBrowser,          // Function() - Open browser
  closeTemplateBrowser,         // Function() - Close browser
  openSavedLetters,             // Function() - Open dashboard
  closeSavedLetters,            // Function() - Close dashboard
} = useCoverLetter();
```

### Supabase Service Functions

```javascript
import * as coverLetterService from './services/coverLetterService';

// Fetch templates with filters
await coverLetterService.fetchTemplates({
  industry: 'Technology',
  experience_level: 'Mid-level',
  search: 'Software'
});

// Fetch template by ID
await coverLetterService.fetchTemplateById(templateId);

// Fetch user's saved letters
await coverLetterService.fetchUserCoverLetters(userId);

// Create new saved letter
await coverLetterService.createUserCoverLetter({
  user_id: userId,
  template_id: templateId,
  title: 'Cover Letter - Software Engineer',
  customized_content: content
});

// Update saved letter
await coverLetterService.updateUserCoverLetter(letterId, {
  title: 'Updated Title',
  customized_content: newContent
});

// Delete saved letter
await coverLetterService.deleteUserCoverLetter(letterId);

// Duplicate saved letter
await coverLetterService.duplicateUserCoverLetter(letterId, userId);
```

### PDF Service Functions

```javascript
import * as pdfService from './services/coverLetterPDFService';

// Download as PDF
await pdfService.downloadCoverLetterAsPDF(content, 'My Cover Letter');

// Generate PDF blob (for upload/storage)
const blob = await pdfService.generateCoverLetterPDFBlob(content);

// Preview PDF in new window
await pdfService.previewCoverLetterPDF(content);

// Get PDF as base64
const base64 = await pdfService.getCoverLetterPDFBase64(content);
```

---

## Usage Guide

### For End Users

1. **Browse Templates**
   - Click "Cover Letter Builder" in the top navigation
   - Click "Browse Templates"
   - Use filters to find the right template for your industry and experience level
   - Search by job title (e.g., "Software Engineer")
   - Click "Quick Preview" to see the full template
   - Click "Use This Template" to start editing

2. **Fill In Details**
   - The editor will open with a split view
   - Left side: Form fields for your information
   - Right side: Live preview with real-time updates
   - Yellow highlights show unfilled placeholders
   - Progress indicator at top shows remaining fields

3. **Export Your Cover Letter**
   - **Copy**: Click "Copy" to copy to clipboard
   - **Download**: Click "Download PDF" for a professional PDF
   - **Save**: Click "Save" to store in your account (requires sign-in)

4. **Manage Saved Letters**
   - Click "My Saved Letters" to view all saved letters
   - Edit, duplicate, or delete any letter
   - Click "Edit" to continue working on a letter

### For Developers

#### Adding New Templates

1. **Create Template Object**
   ```javascript
   {
     "job_title": "New Job Title",
     "industry": "Industry Name",
     "experience_level": "Mid-level",
     "template_content": "Full cover letter text with [Placeholders]",
     "preview_text": "First 200 characters..."
   }
   ```

2. **Insert into Supabase**
   ```sql
   INSERT INTO cover_letter_templates
   (job_title, industry, experience_level, template_content, preview_text)
   VALUES ('...', '...', '...', '...', '...');
   ```

#### Customizing the Editor

Edit `/src/components/CoverLetterEditor.jsx`:

- **Form Fields**: Modify the PLACEHOLDER_MAP in `/src/types/coverLetterTypes.js`
- **Styling**: Update inline styles or extract to CSS modules
- **Validation**: Add validation in the `handleSave` function

#### Extending the Feature

**Add AI-powered customization:**
1. Import `aiService.js` in `CoverLetterContext.jsx`
2. Create new context method `customizeWithAI(jobDescription)`
3. Use existing AI functions to tailor content
4. Update UI to show AI suggestions

**Add more export formats:**
1. Create new service in `/src/services/coverLetterDocxService.js`
2. Use a library like `docx` to generate DOCX files
3. Add "Download DOCX" button in `CoverLetterEditor.jsx`

---

## Troubleshooting

### Templates not loading

**Problem**: Template browser shows "No templates found"

**Solution**:
1. Check that SQL insert statements were executed in Supabase
2. Verify RLS policies are enabled: `SELECT * FROM cover_letter_templates;`
3. Check browser console for errors
4. Verify Supabase environment variables are set

### Save button not working

**Problem**: "Please sign in to save" message appears

**Solution**:
1. User must be authenticated to save letters
2. Click "Sign In / Sign Up" in the top right
3. Create account or sign in
4. Try saving again

### PDF download fails

**Problem**: Error when clicking "Download PDF"

**Solution**:
1. Check browser console for errors
2. Verify jsPDF is installed: `npm list jspdf`
3. Check that content is not empty
4. Try a different browser (PDF generation uses browser APIs)

### Placeholder not replacing

**Problem**: Placeholders like `[Full Name]` not being replaced

**Solution**:
1. Check that field name matches exactly in `PLACEHOLDER_MAP`
2. Verify `replacePlaceholders` function is being called
3. Check browser console for errors
4. Ensure formData is updating correctly

### Database permission errors

**Problem**: "permission denied for table user_cover_letters"

**Solution**:
1. Verify RLS policies are created in Supabase
2. Check that user is authenticated: `console.log(user)`
3. Run RLS policy creation SQL from `COVER_LETTER_SCHEMA.md`
4. Verify `user_id` matches `auth.uid()`

---

## Performance Considerations

### Database Queries

- **Templates**: Fetched once on mount, then filtered client-side
- **Saved Letters**: Fetched when user clicks "My Saved Letters"
- **Indexes**: Added for `industry`, `experience_level`, `job_title`, `user_id`

### Optimizations

1. **Lazy Loading**: PDF service imported dynamically when needed
2. **Client-side Filtering**: Templates filtered in browser, no repeated DB calls
3. **Debouncing**: Search input could be debounced for better performance
4. **Pagination**: Consider adding if template count exceeds 100

### Recommendations

- Add pagination to saved letters dashboard if user has > 50 letters
- Implement virtual scrolling for large template lists
- Cache template data in localStorage for offline access
- Add service worker for PWA capabilities

---

## Security

### Current Security Model

- ✅ **RLS Policies**: Users can only access their own saved letters
- ✅ **Authentication**: Supabase Auth with email/password + Google OAuth
- ✅ **API Keys**: Supabase anon key is safe for client-side use (protected by RLS)
- ⚠️ **OpenAI API Key**: Exposed in browser (same as resume feature)

### Best Practices

1. **Never expose admin credentials** in client-side code
2. **Validate user input** before saving to database
3. **Sanitize HTML** when rendering user content
4. **Use HTTPS** in production
5. **Rate limit** API calls to prevent abuse

### Future Enhancements

- Add backend API proxy for sensitive operations
- Implement rate limiting per user
- Add input validation and sanitization
- Add CAPTCHA for public-facing forms
- Implement audit logging for data access

---

## Deployment

### GitHub Secrets Required

Add these secrets in: **Settings → Secrets and variables → Actions**

```
VITE_OPENAI_API_KEY=sk-proj-...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
HOSTINGER_FTP_SERVER=157.173.208.194
HOSTINGER_FTP_USERNAME=u123456789
HOSTINGER_FTP_PASSWORD=...
```

### Deployment Steps

1. **Run SQL migrations** in Supabase SQL Editor
2. **Verify environment variables** in GitHub Secrets
3. **Push to `main` branch** or `claude/*` branch for testing
4. **GitHub Actions** will automatically build and deploy
5. **Verify deployment** by visiting your Hostinger domain

### Post-Deployment Verification

1. Navigate to Cover Letter Builder
2. Browse templates (should see all 30)
3. Select a template and fill in details
4. Download PDF and verify formatting
5. Sign in and save a letter
6. Verify saved letter appears in dashboard

---

## Testing

### Manual Testing Checklist

- [ ] Browse templates with filters
- [ ] Search by job title
- [ ] Preview template in modal
- [ ] Select template and start editing
- [ ] Fill in all form fields
- [ ] Verify live preview updates
- [ ] Check that unfilled placeholders are highlighted
- [ ] Copy to clipboard and paste in another app
- [ ] Download as PDF and verify formatting
- [ ] Sign in and save letter
- [ ] View saved letters dashboard
- [ ] Edit a saved letter
- [ ] Duplicate a saved letter
- [ ] Delete a saved letter
- [ ] Sign out and verify saved letters dashboard shows sign-in prompt

### Automated Testing (Future)

Consider adding:
- Unit tests for utility functions (replacePlaceholders, validateFormData)
- Integration tests for Supabase service functions
- E2E tests for user workflows (browse → edit → save → download)
- Screenshot tests for UI consistency

---

## Known Issues & Limitations

1. **No DOCX Export**: Only PDF export is currently supported
2. **No AI Customization**: Templates are static (AI integration possible)
3. **No Version History**: No way to see previous versions of saved letters
4. **No Sharing**: Cannot share cover letters with others
5. **No Templates API**: Templates are hard-coded in database (no admin UI to add new ones)

---

## Future Enhancements

### Short-term (1-3 months)
- [ ] Add DOCX export functionality
- [ ] Implement AI-powered customization using existing `aiService.js`
- [ ] Add more templates (target: 50 total)
- [ ] Add template preview thumbnails
- [ ] Implement search autocomplete

### Mid-term (3-6 months)
- [ ] Version history for saved letters
- [ ] Share letters via link
- [ ] Admin panel to manage templates
- [ ] Analytics (which templates are most popular)
- [ ] Mobile app using React Native

### Long-term (6-12 months)
- [ ] AI-powered template generation
- [ ] Collaborative editing
- [ ] Integration with job boards
- [ ] Cover letter scoring/feedback
- [ ] Multi-language support

---

## Support & Contributing

### Getting Help

1. Check this documentation first
2. Review `COVER_LETTER_SCHEMA.md` for database setup
3. Check browser console for errors
4. Verify environment variables are set
5. Review Supabase logs in dashboard

### Reporting Issues

When reporting issues, include:
- Browser and version
- Steps to reproduce
- Error messages from console
- Screenshots (if applicable)
- Expected vs actual behavior

### Contributing

To contribute to this feature:
1. Create a new branch: `git checkout -b feature/cover-letter-enhancement`
2. Make your changes
3. Test thoroughly
4. Update this documentation
5. Submit a pull request

---

## Changelog

### Version 1.0.0 (2025-11-19)
- ✨ Initial release
- ✅ 30 professional templates across 15 industries
- ✅ Template browser with filters and search
- ✅ Live editor with split-view
- ✅ Real-time placeholder replacement
- ✅ PDF download functionality
- ✅ Supabase cloud sync
- ✅ Saved letters dashboard
- ✅ Copy to clipboard
- ✅ Edit, duplicate, delete functionality

---

## Credits

**Developed for**: Custom Resume AI-powered resume builder
**Technologies**: React, Supabase, jsPDF, TailwindCSS
**Documentation**: This file
**License**: Same as parent project

---

**Last Updated:** 2025-11-19
**Maintained By:** Custom Resume Development Team
**Version:** 1.0.0
