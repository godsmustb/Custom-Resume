import { useResume } from '../context/ResumeContext'

function Certifications() {
  const {
    resumeData,
    isEditing,
    updateCertification,
    addCertification,
    removeCertification
  } = useResume()

  // Get certifications array, defaulting to empty array if undefined
  const certifications = resumeData.certifications || []

  // Only show section if there are certifications or in edit mode
  if (certifications.length === 0 && !isEditing) {
    return null
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Certifications</h2>
        {isEditing && (
          <button className="add-btn" onClick={addCertification}>
            + Add Certification
          </button>
        )}
      </div>

      {certifications.map((cert, index) => (
        <div key={cert.id} className="certification-item">
          {isEditing ? (
            <div className="editable-certification">
              <div className="experience-controls">
                <button
                  className="remove-btn"
                  onClick={() => removeCertification(index)}
                  title="Remove this certification"
                >
                  × Remove
                </button>
              </div>

              <div className="cert-row">
                <div className="cert-field cert-field-full">
                  <label className="cert-label">Certification Name</label>
                  <input
                    type="text"
                    className="editable-input"
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                </div>
              </div>

              <div className="cert-row">
                <div className="cert-field cert-field-half">
                  <label className="cert-label">Issuing Organization</label>
                  <input
                    type="text"
                    className="editable-input"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>
                <div className="cert-field cert-field-half">
                  <label className="cert-label">Issue Date</label>
                  <input
                    type="text"
                    className="editable-input"
                    value={cert.date}
                    onChange={(e) => updateCertification(index, 'date', e.target.value)}
                    placeholder="e.g., January 2023"
                  />
                </div>
              </div>

              <div className="cert-row">
                <div className="cert-field cert-field-half">
                  <label className="cert-label">
                    Credential ID <span className="optional-label">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="editable-input"
                    value={cert.credentialId}
                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                    placeholder="e.g., ABC123456"
                  />
                </div>
                <div className="cert-field cert-field-half">
                  <label className="cert-label">
                    Credential URL <span className="optional-label">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="editable-input"
                    value={cert.credentialUrl}
                    onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                    placeholder="e.g., https://verify.example.com"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="certification-display">
              <div className="cert-header">
                <h3 className="cert-name">{cert.name}</h3>
                {cert.date && <span className="cert-date">{cert.date}</span>}
              </div>
              {cert.issuer && <p className="cert-issuer">{cert.issuer}</p>}
              {cert.credentialId && (
                <p className="cert-credential">
                  <span className="cert-credential-label">Credential ID:</span> {cert.credentialId}
                </p>
              )}
              {cert.credentialUrl && (
                <p className="cert-url">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-link"
                  >
                    🔗 View Credential
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

export default Certifications
