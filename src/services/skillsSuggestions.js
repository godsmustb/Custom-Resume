// Comprehensive skills library organized by category and job role
// Based on popular resume builders like Resume Now, Zety, etc.

export const skillsLibrary = {
  // Technical Skills
  'Programming Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell/Bash'
  ],

  'Frontend Development': [
    'React', 'Vue.js', 'Angular', 'HTML5', 'CSS3', 'SASS/SCSS', 'Tailwind CSS',
    'Bootstrap', 'Material-UI', 'Redux', 'Next.js', 'Nuxt.js', 'Webpack',
    'Responsive Design', 'jQuery', 'D3.js', 'Three.js', 'Web Accessibility'
  ],

  'Backend Development': [
    'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
    'ASP.NET', 'Ruby on Rails', 'Laravel', 'REST APIs', 'GraphQL', 'Microservices',
    'WebSockets', 'gRPC', 'Authentication', 'OAuth', 'JWT'
  ],

  'Mobile Development': [
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'SwiftUI', 'Kotlin', 'Xamarin', 'Ionic', 'Mobile UI/UX', 'App Store Optimization'
  ],

  'Database & Data': [
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Oracle',
    'Microsoft SQL Server', 'DynamoDB', 'Firebase', 'Elasticsearch', 'Database Design',
    'Data Modeling', 'Query Optimization', 'NoSQL', 'SQLite'
  ],

  'Cloud & DevOps': [
    'AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'Jenkins',
    'CI/CD', 'Terraform', 'Ansible', 'Git', 'GitHub Actions', 'GitLab CI',
    'Cloud Architecture', 'Linux', 'Nginx', 'Apache', 'Serverless'
  ],

  'Data Science & AI': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Pandas', 'NumPy', 'Data Analysis', 'Data Visualization', 'NLP', 'Computer Vision',
    'Neural Networks', 'Statistical Modeling', 'Big Data', 'Spark', 'Hadoop'
  ],

  'Design & Creative': [
    'UI/UX Design', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Sketch',
    'Adobe XD', 'InVision', 'Wireframing', 'Prototyping', 'User Research',
    'Visual Design', 'Branding', 'Typography', 'Color Theory', 'Design Systems'
  ],

  // Business & Management Skills
  'Project Management': [
    'Agile/Scrum', 'Kanban', 'Jira', 'Asana', 'Monday.com', 'Trello',
    'Project Planning', 'Risk Management', 'Budget Management', 'Stakeholder Management',
    'PMP', 'Resource Allocation', 'Sprint Planning', 'Product Roadmapping'
  ],

  'Marketing & Sales': [
    'Digital Marketing', 'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'Content Marketing',
    'Email Marketing', 'Social Media Marketing', 'Marketing Analytics', 'CRM',
    'Salesforce', 'HubSpot', 'Lead Generation', 'B2B Sales', 'B2C Sales', 'Cold Calling'
  ],

  'Business Analysis': [
    'Requirements Gathering', 'Business Process Modeling', 'Data Analysis',
    'Financial Analysis', 'Market Research', 'Competitive Analysis', 'SWOT Analysis',
    'KPI Development', 'Reporting', 'Excel', 'Power BI', 'Tableau', 'SQL'
  ],

  // Soft Skills
  'Communication': [
    'Public Speaking', 'Presentation Skills', 'Written Communication', 'Active Listening',
    'Negotiation', 'Interpersonal Skills', 'Cross-functional Collaboration',
    'Client Relations', 'Conflict Resolution', 'Technical Writing'
  ],

  'Leadership': [
    'Team Leadership', 'Mentoring', 'Decision Making', 'Strategic Planning',
    'Change Management', 'Performance Management', 'Employee Development',
    'Delegation', 'Motivation', 'Vision Setting'
  ],

  'Problem Solving': [
    'Critical Thinking', 'Analytical Thinking', 'Creative Problem Solving',
    'Root Cause Analysis', 'Troubleshooting', 'Research', 'Innovation',
    'Strategic Thinking', 'Data-Driven Decision Making'
  ],

  // Industry-Specific
  'Finance & Accounting': [
    'Financial Modeling', 'Financial Reporting', 'Budgeting', 'Forecasting',
    'QuickBooks', 'SAP', 'Accounts Payable', 'Accounts Receivable', 'Tax Preparation',
    'Auditing', 'GAAP', 'Financial Analysis', 'Excel', 'Variance Analysis'
  ],

  'Healthcare': [
    'Patient Care', 'Medical Terminology', 'HIPAA Compliance', 'Electronic Health Records',
    'Clinical Documentation', 'Healthcare Management', 'Medical Billing',
    'Patient Assessment', 'Healthcare Quality Improvement'
  ],

  'Customer Service': [
    'Customer Support', 'Help Desk', 'Ticketing Systems', 'Zendesk', 'Live Chat',
    'Phone Support', 'Email Support', 'Customer Satisfaction', 'Problem Resolution',
    'CRM Software', 'Empathy', 'Patience', 'Product Knowledge'
  ],

  // Tools & Software
  'Office & Productivity': [
    'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'Google Workspace',
    'Sheets', 'Docs', 'Slides', 'Notion', 'Confluence', 'Slack', 'Microsoft Teams',
    'Zoom', 'Time Management', 'Documentation'
  ],

  'Security': [
    'Cybersecurity', 'Information Security', 'Network Security', 'Penetration Testing',
    'Security Auditing', 'OWASP', 'Firewall', 'Encryption', 'Compliance',
    'ISO 27001', 'SOC 2', 'GDPR', 'Incident Response'
  ]
}

// Get skills by job title/role
export const getSkillsByRole = (jobTitle) => {
  const title = (jobTitle || '').toLowerCase()

  // Software Development roles
  if (title.includes('frontend') || title.includes('front-end')) {
    return [
      ...skillsLibrary['Programming Languages'].slice(0, 3),
      ...skillsLibrary['Frontend Development'].slice(0, 10),
      ...skillsLibrary['Tools & Software'],
      'Git', 'REST APIs', 'Agile/Scrum'
    ]
  }

  if (title.includes('backend') || title.includes('back-end')) {
    return [
      ...skillsLibrary['Programming Languages'].slice(0, 5),
      ...skillsLibrary['Backend Development'].slice(0, 10),
      ...skillsLibrary['Database & Data'].slice(0, 6),
      'Git', 'Docker', 'AWS'
    ]
  }

  if (title.includes('full') && title.includes('stack')) {
    return [
      'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'PostgreSQL',
      'REST APIs', 'Git', 'Docker', 'AWS', 'Agile/Scrum', 'CI/CD'
    ]
  }

  if (title.includes('data') && (title.includes('scientist') || title.includes('analyst'))) {
    return [
      ...skillsLibrary['Data Science & AI'].slice(0, 8),
      ...skillsLibrary['Database & Data'].slice(0, 4),
      'Python', 'R', 'SQL', 'Excel'
    ]
  }

  if (title.includes('devops') || title.includes('sre')) {
    return [
      ...skillsLibrary['Cloud & DevOps'],
      'Python', 'Bash', 'Monitoring', 'Automation'
    ]
  }

  if (title.includes('mobile')) {
    return [
      ...skillsLibrary['Mobile Development'],
      'JavaScript', 'Swift', 'REST APIs', 'Git', 'Agile/Scrum'
    ]
  }

  // Design roles
  if (title.includes('design') || title.includes('ux') || title.includes('ui')) {
    return [
      ...skillsLibrary['Design & Creative'],
      'User Research', 'Prototyping', 'HTML/CSS', 'Accessibility'
    ]
  }

  // Management roles
  if (title.includes('manager') || title.includes('lead')) {
    return [
      ...skillsLibrary['Project Management'].slice(0, 10),
      ...skillsLibrary['Leadership'],
      ...skillsLibrary['Communication'].slice(0, 5)
    ]
  }

  // Marketing roles
  if (title.includes('marketing')) {
    return [
      ...skillsLibrary['Marketing & Sales'],
      ...skillsLibrary['Communication'].slice(0, 5),
      'Google Analytics', 'Data Analysis'
    ]
  }

  // Sales roles
  if (title.includes('sales')) {
    return [
      ...skillsLibrary['Marketing & Sales'].slice(10),
      ...skillsLibrary['Communication'],
      'Salesforce', 'Negotiation', 'CRM'
    ]
  }

  // Finance roles
  if (title.includes('finance') || title.includes('account')) {
    return [
      ...skillsLibrary['Finance & Accounting'],
      ...skillsLibrary['Business Analysis'].slice(0, 6)
    ]
  }

  // Customer Service roles
  if (title.includes('customer') || title.includes('support')) {
    return skillsLibrary['Customer Service']
  }

  // Default - return most common skills
  return [
    'Communication', 'Teamwork', 'Problem Solving', 'Time Management',
    'Microsoft Office', 'Excel', 'Project Management', 'Customer Service',
    'Leadership', 'Analytical Skills', 'Attention to Detail', 'Adaptability'
  ]
}

// Search skills across all categories
export const searchSkills = (query) => {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = query.toLowerCase()
  const results = []

  Object.entries(skillsLibrary).forEach(([category, skills]) => {
    skills.forEach(skill => {
      if (skill.toLowerCase().includes(searchTerm)) {
        results.push({ skill, category })
      }
    })
  })

  return results.slice(0, 20) // Limit to 20 results
}

// Get all categories
export const getAllCategories = () => {
  return Object.keys(skillsLibrary)
}

// Get skills by category
export const getSkillsByCategory = (category) => {
  return skillsLibrary[category] || []
}
