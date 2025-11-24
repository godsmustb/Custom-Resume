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

    // Get current dimensions before capture
    const originalWidth = resumeElement.offsetWidth
    const originalHeight = resumeElement.scrollHeight

    // Set optimal width for A4 format (210mm = ~794px at 96dpi)
    const targetWidth = 1000 // Good size for A4 resume
    const scale = targetWidth / originalWidth

    // Capture the resume at high quality
    const canvas = await html2canvas(resumeElement, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: targetWidth,
      height: originalHeight * scale,
      windowWidth: targetWidth,
      windowHeight: originalHeight * scale,
      onclone: (clonedDoc, clonedElement) => {
        // Find the resume element in the cloned document
        const clonedResume = clonedDoc.querySelector('.template-renderer') ||
                            clonedDoc.querySelector('.resume-container') ||
                            clonedDoc.querySelector('[class*="template"]')

        if (clonedResume) {
          // Set explicit width for proper rendering
          clonedResume.style.width = `${targetWidth}px`
          clonedResume.style.maxWidth = 'none'
          clonedResume.style.transform = 'none'
          clonedResume.style.boxShadow = 'none'
          clonedResume.style.margin = '0'
          clonedResume.style.padding = '40px' // Add padding for better appearance
        }

        // Fix sidebar positioning issues (sticky breaks html2canvas)
        const sidebars = clonedDoc.querySelectorAll('.modern-sidebar, [class*="sidebar"]')
        sidebars.forEach(sidebar => {
          sidebar.style.position = 'relative'
          sidebar.style.top = 'auto'
        })

        // Ensure grid layouts work properly
        const grids = clonedDoc.querySelectorAll('.modern-grid, [class*="grid"]')
        grids.forEach(grid => {
          grid.style.display = 'grid'
        })

        // Remove any overflow hidden that might clip content
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach(el => {
          if (el.style.overflow === 'hidden') {
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

    // Calculate PDF dimensions
    const pageWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm

    // Calculate image dimensions to fit A4 page
    // Canvas dimensions already account for scale:2
    const canvasAspectRatio = canvas.width / canvas.height

    // Use full page width minus margins
    const marginMM = 10 // 10mm margins on each side
    const pdfWidth = pageWidth - (2 * marginMM)
    const pdfHeight = pdfWidth / canvasAspectRatio

    // Create PDF with correct orientation
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // Handle multi-page resumes properly
    let pageNumber = 0
    const xMargin = marginMM

    // Add first page - centered with margins
    pdf.addImage(imgData, 'JPEG', xMargin, marginMM, pdfWidth, pdfHeight, '', 'FAST')

    // Add additional pages if image is taller than one page
    let heightRemaining = pdfHeight - (pageHeight - 2 * marginMM)
    while (heightRemaining > 0) {
      pageNumber++
      const yPosition = marginMM - ((pageHeight - marginMM) * pageNumber)
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', xMargin, yPosition, pdfWidth, pdfHeight, '', 'FAST')
      heightRemaining -= (pageHeight - 2 * marginMM)
    }

    // Add clickable link annotations on top of the image
    addClickableLinksToPDF(pdf, links, resumeElement, canvas, pdfWidth, pdfHeight, marginMM)

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
 * Handles multi-page PDFs correctly with margins
 */
function addClickableLinksToPDF(pdf, links, resumeElement, canvas, pdfWidth, pdfHeight, marginMM) {
  if (!links || links.length === 0) return

  const pageHeight = 297 // A4 height in mm
  const usablePageHeight = pageHeight - (2 * marginMM)
  const containerWidth = resumeElement.offsetWidth
  const containerHeight = resumeElement.offsetHeight

  // Scale from DOM pixels to PDF mm
  const scaleX = pdfWidth / containerWidth
  const scaleY = pdfHeight / containerHeight

  links.forEach(link => {
    try {
      // Convert DOM coordinates to PDF coordinates
      const pdfX = (link.rect.x * scaleX) + marginMM // Add margin offset
      const pdfY = link.rect.y * scaleY
      const pdfLinkWidth = link.rect.width * scaleX
      const pdfLinkHeight = link.rect.height * scaleY

      // Determine which page this link is on
      const pageNumber = Math.floor(pdfY / usablePageHeight) + 1
      const yOnPage = (pdfY % usablePageHeight) + marginMM // Add margin offset

      // Set to the correct page
      pdf.setPage(pageNumber)

      // Add clickable link annotation to PDF at the correct position on this page
      pdf.link(pdfX, yOnPage, pdfLinkWidth, pdfLinkHeight, { url: link.url })
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
