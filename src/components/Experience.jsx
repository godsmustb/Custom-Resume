function Experience() {
  const experiences = [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Company Inc.',
      date: 'Jan 2022 - Present',
      description: [
        'Led development of scalable web applications serving 100k+ users',
        'Mentored junior developers and conducted code reviews',
        'Improved application performance by 40% through optimization',
      ]
    },
    {
      title: 'Software Engineer',
      company: 'Startup Solutions',
      date: 'Jun 2019 - Dec 2021',
      description: [
        'Developed and maintained full-stack applications using React and Node.js',
        'Collaborated with designers to implement responsive UI components',
        'Implemented CI/CD pipelines reducing deployment time by 50%',
      ]
    }
  ]

  return (
    <section className="section">
      <h2 className="section-title">Experience</h2>
      {experiences.map((exp, index) => (
        <div key={index} className="experience-item">
          <h3 className="job-title">{exp.title}</h3>
          <p className="company">{exp.company}</p>
          <p className="date">{exp.date}</p>
          <ul>
            {exp.description.map((item, i) => (
              <li key={i} className="description">{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

export default Experience
