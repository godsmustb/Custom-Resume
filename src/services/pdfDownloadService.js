import jsPDF from 'jspdf'

/**
 * Generate and download a professionally formatted PDF resume
 */
export function downloadResumePDF(resumeData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace = 10) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to add text with word wrap
  const addText = (text, fontSize, fontStyle = 'normal', color = [0, 0, 0]) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', fontStyle)
    pdf.setTextColor(...color)

    const lines = pdf.splitTextToSize(text, contentWidth)
    lines.forEach(line => {
      checkNewPage()
      pdf.text(line, margin, yPosition)
      yPosition += fontSize * 0.5
    })
  }

  // Header Section
  pdf.setFillColor(102, 126, 234) // Purple color
  pdf.rect(0, 0, pageWidth, 40, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text(resumeData.personal.name, margin, 15)

  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text(resumeData.personal.title, margin, 23)

  pdf.setFontSize(9)
  const contactParts = [
    resumeData.personal.email,
    resumeData.personal.phone,
    resumeData.personal.location
  ].filter(Boolean)

  if (contactParts.length > 0) {
    const contactLine = contactParts.join(' • ')
    pdf.text(contactLine, margin, 30)
  }

  const linksLine = [
    resumeData.personal.linkedin && 'LinkedIn',
    resumeData.personal.github && 'GitHub',
    resumeData.personal.portfolio && 'Portfolio'
  ].filter(Boolean).join(' • ')

  if (linksLine) {
    pdf.text(linksLine, margin, 35)
  }

  yPosition = 50

  // About Section
  if (resumeData.about) {
    pdf.setFillColor(102, 126, 234)
    pdf.rect(margin, yPosition, contentWidth, 1, 'F')
    yPosition += 5

    pdf.setTextColor(44, 62, 80)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('PROFESSIONAL SUMMARY', margin, yPosition)
    yPosition += 8

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const aboutLines = pdf.splitTextToSize(resumeData.about, contentWidth)
    aboutLines.forEach(line => {
      checkNewPage()
      pdf.text(line, margin, yPosition)
      yPosition += 5
    })
    yPosition += 5
  }

  // Experience Section
  if (resumeData.experience && resumeData.experience.length > 0) {
    checkNewPage(20)

    pdf.setFillColor(102, 126, 234)
    pdf.rect(margin, yPosition, contentWidth, 1, 'F')
    yPosition += 5

    pdf.setTextColor(44, 62, 80)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('EXPERIENCE', margin, yPosition)
    yPosition += 8

    resumeData.experience.forEach((exp, index) => {
      checkNewPage(20)

      // Job Title
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(44, 62, 80)
      pdf.text(exp.title, margin, yPosition)
      yPosition += 6

      // Company and Date
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(52, 152, 219)
      pdf.text(exp.company, margin, yPosition)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(127, 140, 141)
      pdf.text(exp.date, pageWidth - margin - pdf.getTextWidth(exp.date), yPosition)
      yPosition += 6

      // Descriptions
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(85, 85, 85)

      exp.description.forEach(desc => {
        checkNewPage(10)
        const descLines = pdf.splitTextToSize('• ' + desc, contentWidth - 5)
        descLines.forEach(line => {
          checkNewPage()
          pdf.text(line, margin + 2, yPosition)
          yPosition += 4.5
        })
      })

      yPosition += 4
    })
  }

  // Education Section
  if (resumeData.education && resumeData.education.length > 0) {
    checkNewPage(20)

    pdf.setFillColor(102, 126, 234)
    pdf.rect(margin, yPosition, contentWidth, 1, 'F')
    yPosition += 5

    pdf.setTextColor(44, 62, 80)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('EDUCATION', margin, yPosition)
    yPosition += 8

    resumeData.education.forEach((edu, index) => {
      checkNewPage(15)

      // Degree
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(44, 62, 80)
      pdf.text(edu.degree, margin, yPosition)
      yPosition += 6

      // School and Date
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(52, 152, 219)
      pdf.text(edu.school, margin, yPosition)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(127, 140, 141)
      pdf.text(edu.date, pageWidth - margin - pdf.getTextWidth(edu.date), yPosition)
      yPosition += 6

      // Details
      if (edu.details) {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(85, 85, 85)
        const detailLines = pdf.splitTextToSize(edu.details, contentWidth)
        detailLines.forEach(line => {
          checkNewPage()
          pdf.text(line, margin, yPosition)
          yPosition += 4.5
        })
      }

      yPosition += 4
    })
  }

  // Certifications Section
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    checkNewPage(20)

    pdf.setFillColor(102, 126, 234)
    pdf.rect(margin, yPosition, contentWidth, 1, 'F')
    yPosition += 5

    pdf.setTextColor(44, 62, 80)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CERTIFICATIONS', margin, yPosition)
    yPosition += 8

    resumeData.certifications.forEach((cert, index) => {
      checkNewPage(15)

      // Certification Name
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(44, 62, 80)
      pdf.text(cert.name, margin, yPosition)
      yPosition += 6

      // Issuer and Date
      pdf.setFontSize(10)

      if (cert.issuer) {
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(52, 152, 219)
        pdf.text(cert.issuer, margin, yPosition)
      }

      if (cert.date) {
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(127, 140, 141)
        pdf.text(cert.date, pageWidth - margin - pdf.getTextWidth(cert.date), yPosition)
      }

      if (cert.issuer || cert.date) {
        yPosition += 6
      }

      // Credential ID
      if (cert.credentialId) {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(85, 85, 85)
        const credText = `Credential ID: ${cert.credentialId}`
        pdf.text(credText, margin, yPosition)
        yPosition += 4.5
      }

      // Credential URL (if exists)
      if (cert.credentialUrl) {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(52, 152, 219)
        const urlText = `Verification: ${cert.credentialUrl}`
        const urlLines = pdf.splitTextToSize(urlText, contentWidth)
        urlLines.forEach(line => {
          checkNewPage()
          pdf.text(line, margin, yPosition)
          yPosition += 4.5
        })
      }

      yPosition += 4
    })
  }

  // Skills Section
  if (resumeData.skills && resumeData.skills.length > 0) {
    checkNewPage(20)

    pdf.setFillColor(102, 126, 234)
    pdf.rect(margin, yPosition, contentWidth, 1, 'F')
    yPosition += 5

    pdf.setTextColor(44, 62, 80)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('SKILLS', margin, yPosition)
    yPosition += 8

    resumeData.skills.forEach((category, index) => {
      checkNewPage(10)

      // Category
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(44, 62, 80)
      pdf.text(category.category + ':', margin, yPosition)
      yPosition += 5

      // Skills
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(85, 85, 85)
      const skillsText = category.skills.join(', ')
      const skillLines = pdf.splitTextToSize(skillsText, contentWidth - 5)
      skillLines.forEach(line => {
        checkNewPage()
        pdf.text(line, margin + 2, yPosition)
        yPosition += 4.5
      })

      yPosition += 3
    })
  }

  // Footer
  const footer = 'Generated with AI Resume Builder'
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'italic')
  pdf.setTextColor(150, 150, 150)
  pdf.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center' })

  // Save the PDF
  const fileName = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`
  pdf.save(fileName)
}
