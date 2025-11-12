function Education() {
  const education = [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University Name',
      date: '2015 - 2019',
      details: 'GPA: 3.8/4.0, Dean\'s List, Relevant coursework: Data Structures, Algorithms, Web Development'
    }
  ]

  return (
    <section className="section">
      <h2 className="section-title">Education</h2>
      {education.map((edu, index) => (
        <div key={index} className="education-item">
          <h3 className="degree">{edu.degree}</h3>
          <p className="school">{edu.school}</p>
          <p className="date">{edu.date}</p>
          <p className="description">{edu.details}</p>
        </div>
      ))}
    </section>
  )
}

export default Education
