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

    // Capture the resume at high quality
    const canvas = await html2canvas(resumeElement, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: resumeElement.scrollWidth,
      windowHeight: resumeElement.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure all content is visible in the clone
        const clonedElement = clonedDoc.querySelector('.template-renderer') ||
                             clonedDoc.querySelector('.resume-container') ||
                             clonedDoc.querySelector('[class*="template"]')
        if (clonedElement) {
          clonedElement.style.transform = 'none'
          clonedElement.style.boxShadow = 'none'
          clonedElement.style.maxWidth = 'none'
        }
      }
    })

    // Restore interactive elements
    interactiveElements.forEach(el => {
      el.style.display = el.dataset.originalDisplay || ''
      delete el.dataset.originalDisplay
    })

    // Calculate PDF dimensions
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pageHeight = 297 // A4 height in mm

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // Handle multi-page resumes
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST')
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST')
      heightLeft -= pageHeight
    }

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
