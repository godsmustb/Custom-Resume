function Skills() {
  const skillCategories = [
    {
      category: 'Frontend',
      skills: ['React', 'JavaScript/TypeScript', 'HTML/CSS', 'Tailwind CSS', 'Redux']
    },
    {
      category: 'Backend',
      skills: ['Node.js', 'Express', 'Python', 'RESTful APIs', 'GraphQL']
    },
    {
      category: 'Tools & Other',
      skills: ['Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Agile/Scrum']
    }
  ]

  return (
    <section className="section">
      <h2 className="section-title">Skills</h2>
      <div className="skills-container">
        {skillCategories.map((category, index) => (
          <div key={index} className="skill-category">
            <h3>{category.category}</h3>
            <ul className="skill-list">
              {category.skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
