import { useResume } from '../context/ResumeContext'

function Contact() {
  const { resumeData, isEditing, updatePersonal } = useResume()

  return (
    <section className="section">
      <h2 className="section-title">Contact</h2>
      {isEditing ? (
        <div className="editable-contact">
          <p className="description">
            Feel free to reach out to me via email at{' '}
            <input
              type="email"
              className="editable-input inline-input"
              value={resumeData.personal.email}
              onChange={(e) => updatePersonal('email', e.target.value)}
              placeholder="your.email@example.com"
              style={{
                width: 'auto',
                minWidth: '200px',
                display: 'inline-block',
                fontWeight: 'bold'
              }}
            />
            {' '}or connect with me on LinkedIn. I'm always open to discussing new opportunities,
            collaborations, or just having a chat about technology!
          </p>
        </div>
      ) : (
        <p className="description">
          Feel free to reach out to me via email at{' '}
          <strong>{resumeData.personal.email || 'email@example.com'}</strong> or
          connect with me on LinkedIn. I'm always open to discussing new opportunities,
          collaborations, or just having a chat about technology!
        </p>
      )}
    </section>
  )
}

export default Contact
