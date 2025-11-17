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
      'Git', 'REST APIs', 'Agile/Scrum', 'Responsive Design'
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

  // Business Analyst roles
  if (title.includes('business') && title.includes('analyst')) {
    return [
      ...skillsLibrary['Business Analysis'],
      ...skillsLibrary['Communication'].slice(0, 5),
      ...skillsLibrary['Problem Solving'].slice(0, 4)
    ]
  }

  // Product roles
  if (title.includes('product') && (title.includes('manager') || title.includes('owner'))) {
    return [
      ...skillsLibrary['Project Management'],
      ...skillsLibrary['Leadership'].slice(0, 6),
      ...skillsLibrary['Communication'].slice(0, 5),
      'User Research', 'Data Analysis', 'SQL'
    ]
  }

  // QA/Testing roles
  if (title.includes('qa') || title.includes('test') || title.includes('quality')) {
    return [
      'Test Automation', 'Selenium', 'Jest', 'Cypress', 'Manual Testing',
      'Bug Tracking', 'Jira', 'Test Planning', 'Agile/Scrum',
      ...skillsLibrary['Programming Languages'].slice(0, 3)
    ]
  }

  // HR roles
  if (title.includes('hr') || title.includes('human resource') || title.includes('recruit')) {
    return [
      'Recruiting', 'Onboarding', 'HRIS', 'Employee Relations', 'Benefits Administration',
      'Performance Management', 'Talent Acquisition', 'Interviewing', 'ATS',
      ...skillsLibrary['Communication'],
      'Conflict Resolution', 'Compliance'
    ]
  }

  // Healthcare roles
  if (title.includes('nurse') || title.includes('medical') || title.includes('healthcare')) {
    return [
      ...skillsLibrary['Healthcare'],
      ...skillsLibrary['Communication'].slice(0, 4),
      'Teamwork', 'Critical Thinking', 'Time Management'
    ]
  }

  // Security roles
  if (title.includes('security') || title.includes('cyber')) {
    return [
      ...skillsLibrary['Security'],
      ...skillsLibrary['Cloud & DevOps'].slice(0, 8),
      'Python', 'Linux', 'Networking'
    ]
  }

  // Administrative roles
  if (title.includes('admin') || title.includes('assistant') || title.includes('coordinator')) {
    return [
      ...skillsLibrary['Office & Productivity'],
      ...skillsLibrary['Communication'].slice(0, 6),
      'Organization', 'Scheduling', 'Data Entry', 'Customer Service'
    ]
  }

  // Teacher/Education roles
  if (title.includes('teacher') || title.includes('educator') || title.includes('instructor')) {
    return [
      'Curriculum Development', 'Lesson Planning', 'Classroom Management',
      'Educational Technology', 'Student Assessment', 'Differentiated Instruction',
      ...skillsLibrary['Communication'],
      ...skillsLibrary['Leadership'].slice(0, 5),
      'Microsoft Office', 'Google Classroom', 'Zoom'
    ]
  }

  // Operations roles
  if (title.includes('operations')) {
    return [
      'Process Improvement', 'Logistics', 'Supply Chain Management',
      'Inventory Management', 'Vendor Management', 'Cost Reduction',
      ...skillsLibrary['Project Management'].slice(0, 8),
      ...skillsLibrary['Business Analysis'].slice(0, 6),
      'Excel', 'Data Analysis'
    ]
  }

  // Content/Writer roles
  if (title.includes('content') || title.includes('writer') || title.includes('copywriter')) {
    return [
      'Content Writing', 'Copywriting', 'SEO Writing', 'Editing', 'Proofreading',
      'Content Strategy', 'WordPress', 'CMS', 'SEO', 'Social Media',
      ...skillsLibrary['Communication'].slice(0, 5),
      'Research', 'Storytelling', 'AP Style'
    ]
  }

  // Developer (general)
  if (title.includes('developer') || title.includes('engineer') || title.includes('programmer')) {
    return [
      ...skillsLibrary['Programming Languages'].slice(0, 5),
      ...skillsLibrary['Frontend Development'].slice(0, 5),
      ...skillsLibrary['Backend Development'].slice(0, 5),
      ...skillsLibrary['Database & Data'].slice(0, 4),
      'Git', 'REST APIs', 'Agile/Scrum', 'Problem Solving'
    ]
  }

  // Default - return most common skills
  return [
    'Communication', 'Teamwork', 'Problem Solving', 'Time Management',
    'Microsoft Office', 'Excel', 'Project Management', 'Customer Service',
    'Leadership', 'Analytical Skills', 'Attention to Detail', 'Adaptability',
    'Organization', 'Multitasking', 'Critical Thinking', 'Collaboration'
  ]
}

// Job title keywords mapping
const jobTitleKeywords = {
  'frontend developer': ['frontend', 'front-end', 'react', 'vue', 'angular', 'ui developer'],
  'backend developer': ['backend', 'back-end', 'api', 'server', 'node'],
  'full stack developer': ['full stack', 'fullstack', 'full-stack'],
  'software engineer': ['software engineer', 'developer', 'programmer', 'swe'],
  'data scientist': ['data scientist', 'data science', 'machine learning', 'ml engineer'],
  'data analyst': ['data analyst', 'business intelligence', 'analytics'],
  'devops engineer': ['devops', 'sre', 'site reliability', 'infrastructure'],
  'mobile developer': ['mobile', 'ios', 'android', 'react native', 'flutter'],
  'ui/ux designer': ['designer', 'ui', 'ux', 'product designer', 'user experience'],
  'project manager': ['project manager', 'pm', 'scrum master', 'agile coach'],
  'product manager': ['product manager', 'product owner', 'po'],
  'marketing manager': ['marketing', 'digital marketing', 'growth'],
  'sales representative': ['sales', 'account executive', 'business development'],
  'business analyst': ['business analyst', 'ba', 'requirements analyst'],
  'qa engineer': ['qa', 'quality assurance', 'test', 'sdet', 'automation'],
  'hr manager': ['hr', 'human resources', 'recruiter', 'talent acquisition'],
  'customer support': ['customer support', 'customer service', 'help desk'],
  'content writer': ['content writer', 'copywriter', 'technical writer'],
  'graphic designer': ['graphic designer', 'visual designer', 'creative'],
  'accountant': ['accountant', 'finance', 'bookkeeper', 'cpa'],
  'nurse': ['nurse', 'rn', 'healthcare', 'medical'],
  'teacher': ['teacher', 'educator', 'instructor', 'professor'],
  'administrative assistant': ['admin', 'assistant', 'coordinator', 'secretary'],
  'operations manager': ['operations', 'ops manager', 'logistics'],
  'security engineer': ['security', 'cybersecurity', 'infosec', 'penetration tester']
}

// Comprehensive job title database with variations
export const jobTitleDatabase = [
  // Product roles
  'Product Owner',
  'Agile Product Owner',
  'Senior Product Owner',
  'IT Product Owner',
  'Digital Product Owner',
  'Technical Product Owner',
  'Product Manager',
  'Senior Product Manager',
  'Associate Product Manager',
  'Product Marketing Manager',
  'Technical Product Manager',
  'Digital Product Manager',
  'Principal Product Manager',

  // Software Engineering
  'Software Engineer',
  'Senior Software Engineer',
  'Junior Software Engineer',
  'Lead Software Engineer',
  'Principal Software Engineer',
  'Software Developer',
  'Full Stack Developer',
  'Full Stack Engineer',
  'Frontend Developer',
  'Frontend Engineer',
  'Senior Frontend Developer',
  'Backend Developer',
  'Backend Engineer',
  'Senior Backend Developer',
  'Web Developer',
  'Mobile Developer',
  'iOS Developer',
  'Android Developer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'Java Developer',
  '.NET Developer',

  // Project Management
  'Project Manager',
  'Senior Project Manager',
  'IT Project Manager',
  'Technical Project Manager',
  'Digital Project Manager',
  'Agile Project Manager',
  'Scrum Master',
  'Certified Scrum Master',
  'Agile Coach',
  'Program Manager',
  'Portfolio Manager',

  // Data roles
  'Data Analyst',
  'Senior Data Analyst',
  'Business Data Analyst',
  'Financial Data Analyst',
  'Marketing Data Analyst',
  'Data Scientist',
  'Senior Data Scientist',
  'Machine Learning Engineer',
  'ML Engineer',
  'AI Engineer',
  'Data Engineer',
  'Big Data Engineer',
  'Business Intelligence Analyst',
  'BI Analyst',

  // DevOps & Infrastructure
  'DevOps Engineer',
  'Senior DevOps Engineer',
  'Site Reliability Engineer',
  'SRE',
  'Cloud Engineer',
  'AWS Engineer',
  'Azure Engineer',
  'Infrastructure Engineer',
  'Platform Engineer',
  'Systems Engineer',
  'Network Engineer',

  // Design roles
  'UI/UX Designer',
  'UX Designer',
  'UI Designer',
  'Product Designer',
  'Senior Product Designer',
  'Graphic Designer',
  'Visual Designer',
  'Web Designer',
  'Interaction Designer',
  'User Researcher',
  'UX Researcher',

  // QA & Testing
  'QA Engineer',
  'Quality Assurance Engineer',
  'QA Analyst',
  'Test Engineer',
  'Automation Engineer',
  'SDET',
  'Manual Tester',
  'Performance Test Engineer',

  // Marketing
  'Marketing Manager',
  'Digital Marketing Manager',
  'Content Marketing Manager',
  'Social Media Manager',
  'SEO Specialist',
  'PPC Specialist',
  'Email Marketing Specialist',
  'Growth Marketing Manager',
  'Brand Manager',
  'Marketing Coordinator',

  // Sales
  'Sales Representative',
  'Account Executive',
  'Senior Account Executive',
  'Sales Manager',
  'Business Development Manager',
  'BDM',
  'Sales Associate',
  'Inside Sales Representative',
  'Outside Sales Representative',
  'Sales Consultant',

  // Business Analysis
  'Business Analyst',
  'Senior Business Analyst',
  'IT Business Analyst',
  'Systems Analyst',
  'Requirements Analyst',
  'Process Analyst',
  'Functional Analyst',

  // HR & Recruiting
  'HR Manager',
  'Human Resources Manager',
  'HR Generalist',
  'HR Specialist',
  'Recruiter',
  'Technical Recruiter',
  'IT Recruiter',
  'Talent Acquisition Specialist',
  'Talent Acquisition Manager',
  'HR Coordinator',
  'HR Business Partner',

  // Customer Service
  'Customer Service Representative',
  'Customer Support Specialist',
  'Customer Success Manager',
  'Technical Support Specialist',
  'Help Desk Technician',
  'Support Engineer',
  'Client Services Manager',

  // Content & Writing
  'Content Writer',
  'Content Creator',
  'Copywriter',
  'Technical Writer',
  'Content Strategist',
  'Blog Writer',
  'SEO Content Writer',

  // Finance & Accounting
  'Accountant',
  'Senior Accountant',
  'Staff Accountant',
  'Financial Analyst',
  'Senior Financial Analyst',
  'Finance Manager',
  'Controller',
  'Tax Accountant',
  'Bookkeeper',
  'Payroll Specialist',

  // Operations
  'Operations Manager',
  'Operations Coordinator',
  'Supply Chain Manager',
  'Logistics Manager',
  'Warehouse Manager',
  'Inventory Manager',
  'Process Improvement Manager',

  // Administrative
  'Administrative Assistant',
  'Executive Assistant',
  'Office Manager',
  'Office Administrator',
  'Receptionist',
  'Administrative Coordinator',

  // Healthcare
  'Registered Nurse',
  'RN',
  'Nurse Practitioner',
  'Licensed Practical Nurse',
  'Medical Assistant',
  'Healthcare Administrator',
  'Clinical Coordinator',

  // Education
  'Teacher',
  'Elementary Teacher',
  'High School Teacher',
  'Special Education Teacher',
  'ESL Teacher',
  'Professor',
  'Instructor',
  'Training Specialist',
  'Corporate Trainer',

  // Security
  'Security Engineer',
  'Cybersecurity Analyst',
  'Information Security Analyst',
  'Security Analyst',
  'Penetration Tester',
  'Security Consultant',
  'CISO',
  'Security Architect'
]

// Search skills across all categories AND job titles
export const searchSkills = (query) => {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = query.toLowerCase()
  const results = []
  const addedSkills = new Set() // Prevent duplicates

  // First, check if search matches a job title
  let jobTitleMatch = null
  for (const [jobTitle, keywords] of Object.entries(jobTitleKeywords)) {
    if (keywords.some(keyword => keyword.includes(searchTerm) || searchTerm.includes(keyword))) {
      jobTitleMatch = jobTitle
      break
    }
  }

  // If job title matched, get skills for that role
  if (jobTitleMatch) {
    const roleSkills = getSkillsByRole(jobTitleMatch)
    roleSkills.forEach(skill => {
      if (!addedSkills.has(skill)) {
        // Find which category this skill belongs to
        let skillCategory = 'Recommended'
        for (const [category, skills] of Object.entries(skillsLibrary)) {
          if (skills.includes(skill)) {
            skillCategory = category
            break
          }
        }
        results.push({ skill, category: skillCategory })
        addedSkills.add(skill)
      }
    })
  }

  // Also search for skills by name
  Object.entries(skillsLibrary).forEach(([category, skills]) => {
    skills.forEach(skill => {
      if (skill.toLowerCase().includes(searchTerm) && !addedSkills.has(skill)) {
        results.push({ skill, category })
        addedSkills.add(skill)
      }
    })
  })

  return results.slice(0, 30) // Increased limit to 30 results
}

// Get all categories
export const getAllCategories = () => {
  return Object.keys(skillsLibrary)
}

// Get skills by category
export const getSkillsByCategory = (category) => {
  return skillsLibrary[category] || []
}

// Autocomplete job titles based on search query
export const autocompleteJobTitles = (query) => {
  if (!query || query.trim().length < 1) {
    return []
  }

  const searchTerm = query.toLowerCase()

  // Filter job titles that contain the search term
  const matches = jobTitleDatabase.filter(title =>
    title.toLowerCase().includes(searchTerm)
  )

  // Sort results: exact matches first, then starts-with matches, then contains
  return matches.sort((a, b) => {
    const aLower = a.toLowerCase()
    const bLower = b.toLowerCase()

    // Exact match
    if (aLower === searchTerm) return -1
    if (bLower === searchTerm) return 1

    // Starts with
    if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) return -1
    if (bLower.startsWith(searchTerm) && !aLower.startsWith(searchTerm)) return 1

    // Alphabetical for same priority
    return a.localeCompare(b)
  }).slice(0, 10) // Limit to top 10 suggestions
}
