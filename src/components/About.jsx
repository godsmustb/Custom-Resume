import { useResume } from '../context/ResumeContext'

function About() {
  const { resumeData, isEditing, updateAbout } = useResume()

  return (
    <section className="section">
      <h2 className="section-title">About Me</h2>
      {isEditing ? (
        <textarea
          className="editable-textarea"
          value={resumeData.about}
          onChange={(e) => updateAbout(e.target.value)}
          placeholder="Write a professional summary about yourself..."
          rows={5}
        />
      ) : (
        <p className="description">{resumeData.about}</p>
      )}
    </section>
  )
}

export default About
