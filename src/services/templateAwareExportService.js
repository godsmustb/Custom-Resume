import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Generate and download a template-aware PDF resume
 * Captures the actual rendered template and converts to PDF
 * @param {string} customFilename - Optional custom filename (without .pdf extension)
 */
export async function downloadTemplateAwarePDF(customFilename = null) {
  try {
    // Find the resume container element
    const resumeElement = document.querySelector('.template-renderer') ||
                         document.querySelector('.resume-container') ||
                         document.querySelector('[class*="template"]')

    if (!resumeElement) {
      throw new Error('Resume element not found. Please ensure your resume is visible.')
    }

    // Show a loading indicator
    const loadingEl = showLoadingIndicator('Generating PDF...')

    // Temporarily hide any edit buttons or interactive elements
    const interactiveElements = resumeElement.querySelectorAll('button, .edit-button, .add-button, .remove-button, .ai-button')
    interactiveElements.forEach(el => {
      el.dataset.originalDisplay = el.style.display
      el.style.display = 'none'
    })

    // Scroll to top to ensure we capture from the beginning
    window.scrollTo(0, 0)

    // Wait a moment for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Calculate proper dimensions for US Letter resume (8.5" x 11" at 96 DPI)
    const LETTER_WIDTH_PX = 816 // 8.5 inches at 96 DPI
    const LETTER_HEIGHT_PX = 1056 // 11 inches at 96 DPI

    // For two-column layouts, use much wider canvas to prevent responsive breakpoint (900px)
    const isTwoColumn = resumeElement.querySelector('.modern-grid, .modern-two-column, [class*="two-column"]') !== null
    const canvasWidth = isTwoColumn ? 1200 : LETTER_WIDTH_PX // Increased to 1200px to stay well above 900px breakpoint

    // Capture the resume at high quality with proper dimensions
    const canvas = await html2canvas(resumeElement, {
      scale: 2, // 2x for high quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: canvasWidth,
      height: resumeElement.scrollHeight,
      windowWidth: canvasWidth,
      windowHeight: resumeElement.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: -window.scrollY,
      onclone: (clonedDoc) => {
        // Find the resume element in the cloned document
        const clonedResume = clonedDoc.querySelector('.template-renderer') ||
                            clonedDoc.querySelector('.resume-container') ||
                            clonedDoc.querySelector('[class*="template"]')

        if (clonedResume) {
          // Set width to match canvas
          clonedResume.style.width = `${canvasWidth}px`
          clonedResume.style.maxWidth = 'none'
          clonedResume.style.transform = 'none'
          clonedResume.style.boxShadow = 'none'
          clonedResume.style.margin = '0'

          // Moderate padding for professional appearance (0.4 inch = ~38px)
          clonedResume.style.padding = '38px'
          clonedResume.style.paddingBottom = '38px'
          clonedResume.style.boxSizing = 'border-box'

          // Moderate font size reduction (not too aggressive)
          clonedResume.style.fontSize = '92%'
          clonedResume.style.lineHeight = '1.35'
        }

        // Fix sidebar positioning (sticky/fixed breaks html2canvas)
        const sidebars = clonedDoc.querySelectorAll('.modern-sidebar, [class*="sidebar"]')
        sidebars.forEach(sidebar => {
          sidebar.style.position = 'relative !important'
          sidebar.style.top = 'auto !important'
          sidebar.style.height = 'auto !important'
          sidebar.style.fontSize = '90%'
          sidebar.style.lineHeight = '1.3'
        })

        // Ensure grid layouts are preserved - match original CSS exactly
        const grids = clonedDoc.querySelectorAll('.modern-grid, [class*="grid"]')
        grids.forEach(grid => {
          grid.style.display = 'grid !important'
          grid.style.gridTemplateColumns = '1fr 350px !important' // Match original CSS (350px sidebar)
          grid.style.gap = '2rem !important' // Moderate gap
          grid.style.minWidth = '900px !important' // Prevent responsive collapse
        })

        // Force main content to respect grid
        const mainContents = clonedDoc.querySelectorAll('.modern-main-content, [class*="main-content"]')
        mainContents.forEach(main => {
          main.style.minWidth = '0 !important'
          main.style.overflow = 'visible !important'
        })

        // Moderate section spacing reduction (not too aggressive)
        const sections = clonedDoc.querySelectorAll('.section, [class*="section"]')
        sections.forEach(section => {
          const currentMargin = parseFloat(window.getComputedStyle(section).marginBottom) || 0
          section.style.marginBottom = `${currentMargin * 0.75}px`
        })

        // Moderate heading spacing
        const headings = clonedDoc.querySelectorAll('h1, h2, h3, h4, h5, h6')
        headings.forEach(heading => {
          heading.style.marginTop = '0.4em'
          heading.style.marginBottom = '0.4em'
        })

        // Moderate paragraph spacing
        const paragraphs = clonedDoc.querySelectorAll('p')
        paragraphs.forEach(p => {
          p.style.marginTop = '0.3em'
          p.style.marginBottom = '0.3em'
        })

        // Disable responsive media queries by adding a style tag
        const styleTag = clonedDoc.createElement('style')
        styleTag.textContent = `
          /* Override responsive breakpoints for PDF export */
          @media (max-width: 900px) {
            .modern-grid {
              grid-template-columns: 1fr 350px !important;
            }
          }
          /* Ensure grid always displays as two columns */
          .modern-grid {
            display: grid !important;
            grid-template-columns: 1fr 350px !important;
          }
        `
        clonedDoc.head.appendChild(styleTag)

        // Remove overflow hidden to prevent clipping
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach(el => {
          if (el.style.overflow === 'hidden' && !el.classList.contains('modern-grid')) {
            el.style.overflow = 'visible'
          }
        })
      }
    })

    // Collect all clickable links from the DOM before restoring
    const links = collectClickableLinks(resumeElement)

    // Restore interactive elements
    interactiveElements.forEach(el => {
      el.style.display = el.dataset.originalDisplay || ''
      delete el.dataset.originalDisplay
    })

    // Calculate PDF dimensions for Letter size (8.5" x 11")
    const pageWidthMM = 215.9 // Letter width in mm (8.5")
    const pageHeightMM = 279.4 // Letter height in mm (11")

    // Create PDF with Letter format (standard for US resumes)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter', // US Letter size
      compress: true
    })

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 1.0) // Use PNG for better quality

    // Calculate scaling - canvas is at scale:2, so actual width is canvas.width/2
    const canvasActualWidth = canvas.width / 2
    const canvasActualHeight = canvas.height / 2

    // Calculate image dimensions to fit Letter page width
    // Scale image to fit page width exactly
    const imgWidthMM = pageWidthMM
    const aspectRatio = canvasActualHeight / canvasActualWidth
    const imgHeightMM = imgWidthMM * aspectRatio

    // Add image to fill the entire page width
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM, '', 'FAST')

    // Handle multi-page resumes - only add pages if content exceeds page height
    let remainingHeight = imgHeightMM - pageHeightMM
    let pageCount = 1

    while (remainingHeight > 0) {
      pdf.addPage()
      const yOffset = -pageHeightMM * pageCount
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidthMM, imgHeightMM, '', 'FAST')
      remainingHeight -= pageHeightMM
      pageCount++
    }

    // Add clickable link annotations
    addClickableLinksToPDF(pdf, links, resumeElement, canvas, imgWidthMM, imgHeightMM)

    // Generate filename
    const fileName = customFilename
      ? (customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`)
      : 'Resume.pdf'

    // Save PDF
    pdf.save(fileName)

    // Hide loading indicator
    hideLoadingIndicator(loadingEl)

    return { success: true }
  } catch (error) {
    console.error('Error generating template-aware PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

/**
 * Generate and download template-aware DOCX (alternative approach)
 * Note: This is more complex and may not preserve exact template styling
 * For now, we'll use the generic DOCX export
 */
export async function downloadTemplateAwareDOCX(resumeData, customFilename = null) {
  // For DOCX, template-aware export is complex due to Word's formatting limitations
  // We'll use the generic DOCX export for now
  // In the future, we could create template-specific DOCX generators
  const { downloadResumeDOCX } = await import('./docxDownloadService')
  return downloadResumeDOCX(resumeData, customFilename)
}

/**
 * Collect all clickable links from the resume DOM
 * Returns array of {url, rect} objects with link positions
 */
function collectClickableLinks(resumeElement) {
  const links = []

  // Find all anchor tags with href attributes
  const anchorElements = resumeElement.querySelectorAll('a[href]')
  anchorElements.forEach(anchor => {
    const href = anchor.getAttribute('href')
    if (href && href.trim()) {
      const rect = anchor.getBoundingClientRect()
      const containerRect = resumeElement.getBoundingClientRect()

      // Calculate position relative to the resume container
      links.push({
        url: href,
        rect: {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height
        }
      })
    }
  })

  // Also look for social media links in the header (LinkedIn, GitHub, Portfolio)
  // These might not be anchor tags but have data attributes or specific classes
  const socialLinks = resumeElement.querySelectorAll('[data-link], .social-link, .linkedin-link, .github-link, .portfolio-link')
  socialLinks.forEach(element => {
    const url = element.getAttribute('data-link') || element.getAttribute('href')
    if (url && url.trim()) {
      const rect = element.getBoundingClientRect()
      const containerRect = resumeElement.getBoundingClientRect()

      links.push({
        url: url,
        rect: {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height
        }
      })
    }
  })

  return links
}

/**
 * Add clickable link annotations to the PDF
 * Maps DOM link positions to PDF coordinates
 * Handles multi-page PDFs correctly
 */
function addClickableLinksToPDF(pdf, links, resumeElement, canvas, pdfWidthMM, pdfHeightMM) {
  if (!links || links.length === 0) return

  const pageHeightMM = 279.4 // Letter height in mm
  const containerWidth = resumeElement.offsetWidth
  const containerHeight = resumeElement.scrollHeight

  // Calculate scale from DOM pixels to PDF mm
  // pdfWidthMM is the full page width, containerWidth is the DOM width
  const scaleX = pdfWidthMM / containerWidth
  const scaleY = pdfHeightMM / containerHeight

  links.forEach(link => {
    try {
      // Convert DOM coordinates to PDF coordinates
      const pdfX = link.rect.x * scaleX
      const pdfY = link.rect.y * scaleY
      const pdfLinkWidth = link.rect.width * scaleX
      const pdfLinkHeight = link.rect.height * scaleY

      // Determine which page this link is on
      const pageNumber = Math.floor(pdfY / pageHeightMM) + 1
      const yOnPage = pdfY % pageHeightMM

      // Only add link if it's within valid page range
      if (pageNumber <= pdf.internal.getNumberOfPages()) {
        pdf.setPage(pageNumber)
        pdf.link(pdfX, yOnPage, pdfLinkWidth, pdfLinkHeight, { url: link.url })
      }
    } catch (error) {
      console.warn('Failed to add link annotation:', error)
    }
  })
}

/**
 * Show loading indicator
 */
function showLoadingIndicator(message = 'Processing...') {
  const overlay = document.createElement('div')
  overlay.id = 'pdf-loading-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
  `

  const spinner = document.createElement('div')
  spinner.style.cssText = `
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  `

  const text = document.createElement('div')
  text.textContent = message
  text.style.cssText = `
    font-size: 18px;
    font-weight: 500;
  `

  // Add spinner animation
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)

  overlay.appendChild(spinner)
  overlay.appendChild(text)
  document.body.appendChild(overlay)

  return overlay
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator(overlay) {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay)
  }
}

/**
 * Get optimal scale based on template type
 */
function getOptimalScale(templateId) {
  // Adjust scale based on template complexity
  // More complex templates may need higher scale
  const complexTemplates = ['executive', 'creative', 'modern-two-column']
  return complexTemplates.some(t => templateId?.includes(t)) ? 3 : 2
}

/**
 * Check if template-aware export is available
 */
export function isTemplateAwareExportAvailable() {
  return typeof html2canvas !== 'undefined'
}
