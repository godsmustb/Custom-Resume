/**
 * Cover Letter PDF Service
 *
 * Handles PDF generation and download for cover letters using jsPDF.
 */

import jsPDF from 'jspdf';

/**
 * Download cover letter as PDF
 * @param {string} content - Cover letter content (plain text with line breaks)
 * @param {string} filename - PDF filename (without extension)
 */
export const downloadCoverLetterAsPDF = async (content, filename = 'Cover Letter') => {
  try {
    // Create new PDF document (Letter size: 8.5" x 11")
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    // PDF settings
    const pageWidth = 8.5;
    const pageHeight = 11;
    const marginLeft = 0.75;
    const marginRight = 0.75;
    const marginTop = 0.75;
    const marginBottom = 0.75;
    const lineHeight = 0.25; // Line height in inches
    const maxWidth = pageWidth - marginLeft - marginRight;

    // Font settings
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    let yPosition = marginTop;

    // Split content into lines
    const lines = content.split('\n');

    // Process each line
    lines.forEach((line, index) => {
      // Handle empty lines (preserve spacing)
      if (line.trim() === '') {
        yPosition += lineHeight;
        return;
      }

      // Word wrap long lines
      const wrappedLines = doc.splitTextToSize(line, maxWidth);

      // Check if we need a new page
      wrappedLines.forEach((wrappedLine, wrappedIndex) => {
        if (yPosition + lineHeight > pageHeight - marginBottom) {
          doc.addPage();
          yPosition = marginTop;
        }

        // Add text to PDF
        doc.text(wrappedLine, marginLeft, yPosition);
        yPosition += lineHeight;
      });
    });

    // Sanitize filename (remove invalid characters)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'Cover Letter';

    // Download PDF
    doc.save(`${sanitizedFilename}.pdf`);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Generate PDF blob (for preview or upload)
 * @param {string} content - Cover letter content
 * @returns {Promise<Blob>} - PDF blob
 */
export const generateCoverLetterPDFBlob = async (content) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const pageWidth = 8.5;
    const pageHeight = 11;
    const marginLeft = 0.75;
    const marginRight = 0.75;
    const marginTop = 0.75;
    const marginBottom = 0.75;
    const lineHeight = 0.25;
    const maxWidth = pageWidth - marginLeft - marginRight;

    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    let yPosition = marginTop;
    const lines = content.split('\n');

    lines.forEach((line) => {
      if (line.trim() === '') {
        yPosition += lineHeight;
        return;
      }

      const wrappedLines = doc.splitTextToSize(line, maxWidth);

      wrappedLines.forEach((wrappedLine) => {
        if (yPosition + lineHeight > pageHeight - marginBottom) {
          doc.addPage();
          yPosition = marginTop;
        }

        doc.text(wrappedLine, marginLeft, yPosition);
        yPosition += lineHeight;
      });
    });

    // Get PDF as blob
    const blob = doc.output('blob');
    return blob;
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw new Error(`Failed to generate PDF blob: ${error.message}`);
  }
};

/**
 * Preview PDF in new window
 * @param {string} content - Cover letter content
 */
export const previewCoverLetterPDF = async (content) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const pageWidth = 8.5;
    const pageHeight = 11;
    const marginLeft = 0.75;
    const marginRight = 0.75;
    const marginTop = 0.75;
    const marginBottom = 0.75;
    const lineHeight = 0.25;
    const maxWidth = pageWidth - marginLeft - marginRight;

    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    let yPosition = marginTop;
    const lines = content.split('\n');

    lines.forEach((line) => {
      if (line.trim() === '') {
        yPosition += lineHeight;
        return;
      }

      const wrappedLines = doc.splitTextToSize(line, maxWidth);

      wrappedLines.forEach((wrappedLine) => {
        if (yPosition + lineHeight > pageHeight - marginBottom) {
          doc.addPage();
          yPosition = marginTop;
        }

        doc.text(wrappedLine, marginLeft, yPosition);
        yPosition += lineHeight;
      });
    });

    // Open in new window
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    return true;
  } catch (error) {
    console.error('Error previewing PDF:', error);
    throw new Error(`Failed to preview PDF: ${error.message}`);
  }
};

/**
 * Get PDF as base64 string (for storage or transmission)
 * @param {string} content - Cover letter content
 * @returns {Promise<string>} - Base64 encoded PDF
 */
export const getCoverLetterPDFBase64 = async (content) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const pageWidth = 8.5;
    const pageHeight = 11;
    const marginLeft = 0.75;
    const marginRight = 0.75;
    const marginTop = 0.75;
    const marginBottom = 0.75;
    const lineHeight = 0.25;
    const maxWidth = pageWidth - marginLeft - marginRight;

    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    let yPosition = marginTop;
    const lines = content.split('\n');

    lines.forEach((line) => {
      if (line.trim() === '') {
        yPosition += lineHeight;
        return;
      }

      const wrappedLines = doc.splitTextToSize(line, maxWidth);

      wrappedLines.forEach((wrappedLine) => {
        if (yPosition + lineHeight > pageHeight - marginBottom) {
          doc.addPage();
          yPosition = marginTop;
        }

        doc.text(wrappedLine, marginLeft, yPosition);
        yPosition += lineHeight;
      });
    });

    // Get PDF as base64
    const base64 = doc.output('datauristring');
    return base64;
  } catch (error) {
    console.error('Error generating PDF base64:', error);
    throw new Error(`Failed to generate PDF base64: ${error.message}`);
  }
};

export default {
  downloadCoverLetterAsPDF,
  generateCoverLetterPDFBlob,
  previewCoverLetterPDF,
  getCoverLetterPDFBase64,
};
