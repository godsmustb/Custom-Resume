/**
 * Sample Resume Data for Template Previews
 * Used to show realistic template previews in the template browser
 */

export const SAMPLE_RESUME_DATA = {
  personal: {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    portfolio: 'johndoe.dev'
  },
  about: 'Results-driven software engineer with 8+ years of experience building scalable web applications. Proven track record of leading cross-functional teams and delivering high-impact products.',
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      date: '2021 - Present',
      description: [
        'Led development of microservices architecture serving 5M+ users',
        'Reduced API response time by 60% through optimization',
        'Mentored team of 5 junior developers'
      ]
    },
    {
      id: '2',
      title: 'Software Engineer',
      company: 'StartUp Inc',
      date: '2018 - 2021',
      description: [
        'Built full-stack features using React and Node.js',
        'Implemented CI/CD pipeline reducing deployment time by 40%'
      ]
    }
  ],
  education: [
    {
      id: '1',
      degree: 'BS in Computer Science',
      school: 'State University',
      date: '2014 - 2018',
      details: 'GPA: 3.8/4.0'
    }
  ],
  skills: [
    {
      category: 'Frontend',
      skills: ['React', 'TypeScript', 'CSS', 'Redux']
    },
    {
      category: 'Backend',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS']
    },
    {
      category: 'Tools',
      skills: ['Git', 'Docker', 'Kubernetes', 'Jenkins']
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
      credentialId: 'ABC123',
      credentialUrl: ''
    }
  ],
  jobDescription: ''
}
