import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'

/**
 * Generate and download a professionally formatted DOCX resume
 * @param {Object} resumeData - Resume data to export
 * @param {string} customFilename - Optional custom filename (without .docx extension)
 */
export async function downloadResumeDOCX(resumeData, customFilename = null) {
  const sections = []

  // Header Section - Name and Title
  sections.push(
    new Paragraph({
      text: resumeData.personal.name,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    })
  )

  sections.push(
    new Paragraph({
      text: resumeData.personal.title,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  )

  // Contact Information
  const contactParts = [
    resumeData.personal.email?.trim(),
    resumeData.personal.phone?.trim(),
    resumeData.personal.location?.trim()
  ].filter(Boolean)

  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: contactParts.join(' • '),
            size: 20
          })
        ]
      })
    )
  }

  // Social Links
  const linksParts = []
  if (resumeData.personal.linkedin?.trim()) {
    linksParts.push(`LinkedIn: ${resumeData.personal.linkedin}`)
  }
  if (resumeData.personal.github?.trim()) {
    linksParts.push(`GitHub: ${resumeData.personal.github}`)
  }
  if (resumeData.personal.portfolio?.trim()) {
    linksParts.push(`Portfolio: ${resumeData.personal.portfolio}`)
  }

  if (linksParts.length > 0) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: linksParts.join(' • '),
            size: 20,
            color: '1A73E8'
          })
        ]
      })
    )
  }

  // Professional Summary Section
  if (resumeData.about) {
    sections.push(
      new Paragraph({
        text: 'PROFESSIONAL SUMMARY',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 },
        border: {
          bottom: {
            color: '667eea',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        }
      })
    )

    sections.push(
      new Paragraph({
        text: resumeData.about,
        spacing: { after: 300 }
      })
    )
  }

  // Experience Section
  if (resumeData.experience && resumeData.experience.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EXPERIENCE',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 },
        border: {
          bottom: {
            color: '667eea',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        }
      })
    )

    resumeData.experience.forEach((exp, index) => {
      // Job Title
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 24
            })
          ],
          spacing: { before: index > 0 ? 200 : 100, after: 100 }
        })
      )

      // Company and Date
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              italics: true,
              color: '1A73E8'
            }),
            new TextRun({
              text: ` | ${exp.date}`,
              color: '666666'
            })
          ],
          spacing: { after: 100 }
        })
      )

      // Descriptions
      exp.description.forEach(desc => {
        sections.push(
          new Paragraph({
            text: desc,
            bullet: {
              level: 0
            },
            spacing: { after: 50 }
          })
        )
      })
    })
  }

  // Education Section
  if (resumeData.education && resumeData.education.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        border: {
          bottom: {
            color: '667eea',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        }
      })
    )

    resumeData.education.forEach((edu, index) => {
      // Degree
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 24
            })
          ],
          spacing: { before: index > 0 ? 200 : 100, after: 100 }
        })
      )

      // School and Date
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.school,
              italics: true,
              color: '1A73E8'
            }),
            new TextRun({
              text: ` | ${edu.date}`,
              color: '666666'
            })
          ],
          spacing: { after: 100 }
        })
      )

      // Details
      if (edu.details) {
        sections.push(
          new Paragraph({
            text: edu.details,
            spacing: { after: 100 }
          })
        )
      }
    })
  }

  // Certifications Section
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    sections.push(
      new Paragraph({
        text: 'CERTIFICATIONS',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        border: {
          bottom: {
            color: '667eea',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        }
      })
    )

    resumeData.certifications.forEach((cert, index) => {
      // Certification Name
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 24
            })
          ],
          spacing: { before: index > 0 ? 200 : 100, after: 100 }
        })
      )

      // Issuer and Date
      const certParts = []
      if (cert.issuer?.trim()) {
        certParts.push(
          new TextRun({
            text: cert.issuer,
            italics: true,
            color: '1A73E8'
          })
        )
      }
      if (cert.date?.trim()) {
        certParts.push(
          new TextRun({
            text: certParts.length > 0 ? ` | ${cert.date}` : cert.date,
            color: '666666'
          })
        )
      }

      if (certParts.length > 0) {
        sections.push(
          new Paragraph({
            children: certParts,
            spacing: { after: 100 }
          })
        )
      }

      // Credential ID
      if (cert.credentialId?.trim()) {
        sections.push(
          new Paragraph({
            text: `Credential ID: ${cert.credentialId}`,
            spacing: { after: 50 }
          })
        )
      }

      // Credential URL
      if (cert.credentialUrl?.trim()) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Verification: ${cert.credentialUrl}`,
                color: '1A73E8'
              })
            ],
            spacing: { after: 100 }
          })
        )
      }
    })
  }

  // Skills Section
  if (resumeData.skills && resumeData.skills.length > 0) {
    sections.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        border: {
          bottom: {
            color: '667eea',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        }
      })
    )

    resumeData.skills.forEach((category, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${category.category}: `,
              bold: true
            }),
            new TextRun({
              text: category.skills.join(', ')
            })
          ],
          spacing: { before: index > 0 ? 100 : 0, after: 100 }
        })
      )
    })
  }

  // Footer
  sections.push(
    new Paragraph({
      text: 'Generated with AI Resume Builder',
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: 'Generated with AI Resume Builder',
          size: 16,
          italics: true,
          color: '999999'
        })
      ]
    })
  )

  // Create the document
  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  })

  // Generate and download the file
  const blob = await Packer.toBlob(doc)

  let fileName
  if (customFilename) {
    fileName = customFilename.endsWith('.docx') ? customFilename : `${customFilename}.docx`
  } else {
    fileName = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.docx`
  }

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
