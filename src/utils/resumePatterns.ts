/**
 * Resume parsing patterns and utilities for data normalization
 * Contains regex patterns, keyword lists, and formatting utilities for resume parsing
 */

import type { SkillLevel, LanguageLevel } from '../types/application';

export interface DateParsingResult {
  date: string | null;
  confidence: number;
  originalText: string;
}

export interface NameParsingResult {
  firstName: string;
  lastName: string;
  fullName: string;
  confidence: number;
}

export interface ContactInfo {
  emails: string[];
  phones: string[];
  websites: string[];
  linkedin: string[];
  github: string[];
  addresses: string[];
}

// Common resume section patterns
export const SECTION_PATTERNS = {
  // Personal/Contact sections
  contact: /(?:^|\n)\s*(?:CONTACT|PERSONAL\s+INFORMATION|CONTACT\s+INFORMATION|PERSONAL\s+DETAILS)\s*(?:\n|$)/i,
  
  // Professional summary/objective
  summary: /(?:^|\n)\s*(?:SUMMARY|PROFILE|OBJECTIVE|CAREER\s+OBJECTIVE|PROFESSIONAL\s+SUMMARY|CAREER\s+SUMMARY|EXECUTIVE\s+SUMMARY)\s*(?:\n|$)/i,
  
  // Work experience
  experience: /(?:^|\n)\s*(?:EXPERIENCE|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY|WORK\s+HISTORY)\s*(?:\n|$)/i,
  
  // Education
  education: /(?:^|\n)\s*(?:EDUCATION|ACADEMIC\s+BACKGROUND|EDUCATIONAL\s+BACKGROUND|ACADEMIC\s+QUALIFICATIONS)\s*(?:\n|$)/i,
  
  // Skills
  skills: /(?:^|\n)\s*(?:SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|COMPETENCIES|KEY\s+SKILLS|TECHNICAL\s+COMPETENCIES)\s*(?:\n|$)/i,
  
  // Certifications
  certifications: /(?:^|\n)\s*(?:CERTIFICATIONS?|LICENSES?|CREDENTIALS?|PROFESSIONAL\s+CERTIFICATIONS?|CERTIFICATES?)\s*(?:\n|$)/i,
  
  // Projects
  projects: /(?:^|\n)\s*(?:PROJECTS?|NOTABLE\s+PROJECTS?|PERSONAL\s+PROJECTS?|KEY\s+PROJECTS?|SELECTED\s+PROJECTS?)\s*(?:\n|$)/i,
  
  // Languages
  languages: /(?:^|\n)\s*(?:LANGUAGES?|LANGUAGE\s+SKILLS?|FOREIGN\s+LANGUAGES?)\s*(?:\n|$)/i,
  
  // Awards/Achievements
  awards: /(?:^|\n)\s*(?:AWARDS?|ACHIEVEMENTS?|HONORS?|ACCOMPLISHMENTS?|RECOGNITION)\s*(?:\n|$)/i,
  
  // Publications
  publications: /(?:^|\n)\s*(?:PUBLICATIONS?|PAPERS?|RESEARCH|PUBLICATIONS\s+AND\s+PRESENTATIONS?)\s*(?:\n|$)/i,
};

// Contact information patterns
export const CONTACT_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})(?:\s*(?:ext|extension|x)\.?\s*(\d+))?/g,
  linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9-_]+)\/?/g,
  github: /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-_]+)\/?/g,
  website: /(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9-_]+\.[A-Za-z]{2,}(?:\/[^\s]*)?/g,
  address: /\d+\s+[A-Za-z0-9\s,#.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Way|Circle|Cir)\s*,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?/g,
};

// Date patterns
export const DATE_PATTERNS = {
  // Full dates: MM/DD/YYYY, MM-DD-YYYY, MM.DD.YYYY
  fullDate: /\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})\b/g,
  
  // ISO format: YYYY-MM-DD
  isoDate: /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g,
  
  // Month Year: January 2020, Jan 2020, 01/2020
  monthYear: /\b(?:(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{4})|(\d{1,2})\/(\d{4}))\b/g,
  
  // Year only: 2020, '20
  yearOnly: /\b(?:19|20)\d{2}\b|\b'\d{2}\b/g,
  
  // Current/Present indicators
  current: /\b(?:current|present|now|ongoing|today)\b/gi,
  
  // Duration patterns
  duration: /\b(\d+)\s*(?:years?|yrs?|months?|mos?)\b/gi,
};

// Experience/Job patterns
export const EXPERIENCE_PATTERNS = {
  // Job title at company
  titleAtCompany: /^(.+?)\s+(?:at|@|\|)\s+(.+?)(?:\s*[-–—]\s*(.+?))?$/i,
  
  // Company, job title
  companyTitle: /^(.+?),\s*(.+?)(?:\s*[-–—]\s*(.+?))?$/i,
  
  // Bullet points/achievements
  bulletPoint: /^[\s]*[•·▪▫◦‣⁃]\s*(.+)$/m,
  
  // Responsibility indicators
  responsibilities: /^[\s]*(?:[-•·▪▫◦‣⁃]|\d+\.)\s*(?:Responsible for|Managed|Led|Developed|Implemented|Designed|Created|Built|Maintained|Coordinated|Supervised|Oversaw|Directed|Executed|Delivered|Achieved|Increased|Decreased|Improved|Optimized|Reduced|Enhanced|Streamlined|Collaborated|Worked with|Partnered with)(.+)$/im,
  
  // Achievement indicators with metrics
  achievements: /(?:increased|decreased|improved|reduced|saved|generated|achieved|exceeded|delivered|grew|expanded|boosted|enhanced|optimized)\s+.+?(?:\d+%|\$[\d,]+|[\d,]+\s*(?:users|customers|clients|projects|sales|revenue|efficiency|productivity|performance|quality|time|cost))/i,
};

// Education patterns
export const EDUCATION_PATTERNS = {
  // Degree types
  degrees: /\b(?:Ph\.?D\.?|Doctor|Doctorate|Master|M\.?[AS]\.?|Bachelor|B\.?[AS]\.?|Associate|A\.?[AS]\.?|Certificate|Diploma|Certification)\b/gi,
  
  // Degree in field at institution
  degreeInFieldAt: /^(.+?)\s+in\s+(.+?)\s+(?:at|from)\s+(.+?)(?:\s*[-–—]\s*(.+?))?$/i,
  
  // Institution, degree
  institutionDegree: /^(.+?),\s*(.+?)(?:\s*[-–—]\s*(.+?))?$/i,
  
  // GPA patterns
  gpa: /\b(?:GPA|Grade Point Average):\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?))?\b/i,
  
  // Honors/distinctions
  honors: /\b(?:Summa Cum Laude|Magna Cum Laude|Cum Laude|Dean's List|Honor Roll|Honors|Distinction|First Class|Second Class|Third Class)\b/gi,
};

// Skill level indicators
export const SKILL_LEVEL_PATTERNS = {
  expert: /\b(?:expert|advanced|senior|lead|principal|architect|specialist|guru|ninja|rock\s*star|10\+?\s*years?|[8-9]\+?\s*years?)\b/i,
  advanced: /\b(?:advanced|proficient|strong|solid|extensive|experienced|skilled|competent|[5-7]\+?\s*years?|senior)\b/i,
  intermediate: /\b(?:intermediate|moderate|working\s+knowledge|familiar|some\s+experience|[2-4]\+?\s*years?|junior)\b/i,
  beginner: /\b(?:beginner|basic|fundamental|learning|novice|entry\s*level|[0-1]\+?\s*years?|new\s+to)\b/i,
};

// Language level indicators
export const LANGUAGE_LEVEL_PATTERNS = {
  native: /\b(?:native|mother\s*tongue|first\s+language|bilingual|trilingual)\b/i,
  full_professional: /\b(?:fluent|full\s+professional|business\s+fluent|professional\s+proficiency|advanced)\b/i,
  professional_working: /\b(?:professional|working\s+proficiency|conversational|intermediate|good)\b/i,
  limited_working: /\b(?:limited\s+working|basic|elementary|beginner|some)\b/i,
  elementary: /\b(?:elementary|basic|beginner|minimal|learning)\b/i,
};

// Technology and skill categorization
export const SKILL_CATEGORIES = {
  programmingLanguages: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Lua', 'Dart', 'Elixir', 'Haskell', 'Clojure', 'F#', 'VB.NET', 'Objective-C', 'Assembly'
  ],
  webTechnologies: [
    'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'Express.js', 'Node.js', 'Django', 'Flask', 'FastAPI', 'Spring', 'ASP.NET', 'Laravel', 'Symfony', 'Rails', 'Phoenix', 'Ember.js', 'Backbone.js', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Sass', 'Less', 'Webpack', 'Vite', 'Parcel'
  ],
  databases: [
    'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'CouchDB', 'Neo4j', 'InfluxDB', 'Oracle', 'SQL Server', 'MariaDB', 'Firebase'
  ],
  cloudPlatforms: [
    'AWS', 'Azure', 'Google Cloud', 'GCP', 'DigitalOcean', 'Heroku', 'Vercel', 'Netlify', 'Cloudflare', 'Linode', 'Vultr'
  ],
  devOps: [
    'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Travis CI', 'CircleCI', 'Ansible', 'Terraform', 'Vagrant', 'Chef', 'Puppet', 'Nginx', 'Apache', 'Linux', 'Ubuntu', 'CentOS', 'RHEL', 'Windows Server'
  ],
  tools: [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VS Code', 'IntelliJ', 'Eclipse', 'Vim', 'Emacs', 'Sublime Text', 'Atom', 'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'Jira', 'Confluence', 'Slack', 'Teams', 'Notion', 'Trello', 'Asana'
  ],
  dataScience: [
    'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Jupyter', 'Tableau', 'Power BI', 'D3.js', 'Matplotlib', 'Seaborn', 'Plotly', 'Apache Spark', 'Hadoop', 'Apache Kafka', 'Apache Airflow'
  ],
  mobile: [
    'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap', 'Swift', 'Kotlin', 'Objective-C', 'Java'
  ]
};

// Common job titles and their normalized forms
export const JOB_TITLE_MAPPING = {
  'Software Engineer': ['Software Engineer', 'SWE', 'Software Developer', 'Developer', 'Programmer', 'Software Programmer'],
  'Senior Software Engineer': ['Senior Software Engineer', 'Senior SWE', 'Senior Developer', 'Senior Software Developer', 'Sr. Software Engineer', 'Sr SWE'],
  'Frontend Developer': ['Frontend Developer', 'Front-end Developer', 'Front End Developer', 'UI Developer', 'Web Developer'],
  'Backend Developer': ['Backend Developer', 'Back-end Developer', 'Back End Developer', 'Server Developer', 'API Developer'],
  'Full Stack Developer': ['Full Stack Developer', 'Fullstack Developer', 'Full-stack Developer', 'MERN Developer', 'MEAN Developer'],
  'Data Scientist': ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'ML Engineer', 'AI Engineer'],
  'Product Manager': ['Product Manager', 'PM', 'Senior Product Manager', 'Sr. Product Manager', 'Product Owner', 'PO'],
  'DevOps Engineer': ['DevOps Engineer', 'Site Reliability Engineer', 'SRE', 'Infrastructure Engineer', 'Platform Engineer'],
  'QA Engineer': ['QA Engineer', 'Quality Assurance Engineer', 'Test Engineer', 'SDET', 'Automation Engineer'],
  'UI/UX Designer': ['UI/UX Designer', 'UX Designer', 'UI Designer', 'Product Designer', 'Visual Designer', 'Interaction Designer'],
};

// Company name normalization patterns
export const COMPANY_PATTERNS = {
  // Remove common suffixes
  suffixes: /\s*(?:Inc\.?|LLC|Corp\.?|Corporation|Ltd\.?|Limited|Co\.?|Company|LP|LLP|PC|PLLC|Group|Solutions|Technologies|Tech|Systems|Services|International|Global|Worldwide)\s*$/i,
  
  // Normalize common company name variations
  normalizations: {
    'Google LLC': 'Google',
    'Apple Inc.': 'Apple',
    'Microsoft Corporation': 'Microsoft',
    'Amazon.com, Inc.': 'Amazon',
    'Meta Platforms, Inc.': 'Meta',
    'Tesla, Inc.': 'Tesla',
    'Netflix, Inc.': 'Netflix',
    'Adobe Inc.': 'Adobe',
    'Salesforce, Inc.': 'Salesforce',
  }
};

/**
 * Parse dates from various formats and return standardized ISO format
 */
export const parseDate = (dateString: string): DateParsingResult => {
  if (!dateString || typeof dateString !== 'string') {
    return { date: null, confidence: 0, originalText: dateString || '' };
  }
  
  const original = dateString.trim();
  const lower = original.toLowerCase();
  
  // Check for current/present indicators
  if (DATE_PATTERNS.current.test(lower)) {
    return { date: null, confidence: 95, originalText: original };
  }
  
  // Try to parse ISO format first
  const isoMatch = original.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(parsedDate.getTime())) {
      return {
        date: formatDateISO(parsedDate),
        confidence: 90,
        originalText: original
      };
    }
  }
  
  // Try MM/DD/YYYY format
  const fullDateMatch = original.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
  if (fullDateMatch) {
    const [, month, day, year] = fullDateMatch;
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(parsedDate.getTime())) {
      return {
        date: formatDateISO(parsedDate),
        confidence: 85,
        originalText: original
      };
    }
  }
  
  // Try Month Year format
  const monthYearMatch = original.match(/(?:(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{4})|(\d{1,2})\/(\d{4}))/i);
  if (monthYearMatch) {
    let month: number;
    let year: number;
    
    if (monthYearMatch[1] && monthYearMatch[2]) {
      // Named month
      month = getMonthNumber(monthYearMatch[1]);
      year = parseInt(monthYearMatch[2]);
    } else if (monthYearMatch[3] && monthYearMatch[4]) {
      // Numeric month
      month = parseInt(monthYearMatch[3]);
      year = parseInt(monthYearMatch[4]);
    } else {
      return { date: null, confidence: 0, originalText: original };
    }
    
    const parsedDate = new Date(year, month - 1, 1);
    if (!isNaN(parsedDate.getTime())) {
      return {
        date: formatDateISO(parsedDate),
        confidence: 80,
        originalText: original
      };
    }
  }
  
  // Try year only
  const yearMatch = original.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    const parsedDate = new Date(year, 0, 1);
    if (!isNaN(parsedDate.getTime()) && year >= 1980 && year <= new Date().getFullYear() + 5) {
      return {
        date: formatDateISO(parsedDate),
        confidence: 60,
        originalText: original
      };
    }
  }
  
  return { date: null, confidence: 0, originalText: original };
};

/**
 * Extract contact information from text
 */
export const extractContactInfo = (text: string): ContactInfo => {
  const result: ContactInfo = {
    emails: [],
    phones: [],
    websites: [],
    linkedin: [],
    github: [],
    addresses: [],
  };
  
  // Extract emails
  const emailMatches = text.match(CONTACT_PATTERNS.email);
  if (emailMatches) {
    result.emails = [...new Set(emailMatches)];
  }
  
  // Extract phone numbers
  const phoneMatches = text.match(CONTACT_PATTERNS.phone);
  if (phoneMatches) {
    result.phones = [...new Set(phoneMatches.map(normalizePhoneNumber))];
  }
  
  // Extract LinkedIn profiles
  const linkedinMatches = text.match(CONTACT_PATTERNS.linkedin);
  if (linkedinMatches) {
    result.linkedin = [...new Set(linkedinMatches.map(url => {
      const match = url.match(/linkedin\.com\/in\/([A-Za-z0-9-_]+)/);
      return match ? `https://linkedin.com/in/${match[1]}` : url;
    }))];
  }
  
  // Extract GitHub profiles
  const githubMatches = text.match(CONTACT_PATTERNS.github);
  if (githubMatches) {
    result.github = [...new Set(githubMatches.map(url => {
      const match = url.match(/github\.com\/([A-Za-z0-9-_]+)/);
      return match ? `https://github.com/${match[1]}` : url;
    }))];
  }
  
  // Extract websites (excluding linkedin and github)
  const websiteMatches = text.match(CONTACT_PATTERNS.website);
  if (websiteMatches) {
    result.websites = [...new Set(websiteMatches.filter(url => 
      !url.includes('linkedin.com') && !url.includes('github.com')
    ))];
  }
  
  // Extract addresses
  const addressMatches = text.match(CONTACT_PATTERNS.address);
  if (addressMatches) {
    result.addresses = [...new Set(addressMatches.map(addr => addr.trim()))];
  }
  
  return result;
};

/**
 * Determine skill level from context
 */
export const determineSkillLevel = (skillContext: string): SkillLevel => {
  const context = skillContext.toLowerCase();
  
  if (SKILL_LEVEL_PATTERNS.expert.test(context)) return 'expert';
  if (SKILL_LEVEL_PATTERNS.advanced.test(context)) return 'advanced';
  if (SKILL_LEVEL_PATTERNS.beginner.test(context)) return 'beginner';
  
  return 'intermediate'; // Default
};

/**
 * Determine language proficiency level from context
 */
export const determineLanguageLevel = (languageContext: string): LanguageLevel => {
  const context = languageContext.toLowerCase();
  
  if (LANGUAGE_LEVEL_PATTERNS.native.test(context)) return 'native';
  if (LANGUAGE_LEVEL_PATTERNS.full_professional.test(context)) return 'full_professional';
  if (LANGUAGE_LEVEL_PATTERNS.limited_working.test(context)) return 'limited_working';
  if (LANGUAGE_LEVEL_PATTERNS.elementary.test(context)) return 'elementary';
  
  return 'professional_working'; // Default
};

/**
 * Normalize company names
 */
export const normalizeCompanyName = (companyName: string): string => {
  if (!companyName) return '';
  
  let normalized = companyName.trim();
  
  // Check for exact matches in normalization mapping
  if (COMPANY_PATTERNS.normalizations[normalized]) {
    return COMPANY_PATTERNS.normalizations[normalized];
  }
  
  // Remove common suffixes
  normalized = normalized.replace(COMPANY_PATTERNS.suffixes, '');
  
  return normalized.trim();
};

/**
 * Categorize skills
 */
export const categorizeSkill = (skillName: string): string => {
  const skill = skillName.toLowerCase();
  
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.some(s => s.toLowerCase() === skill || skill.includes(s.toLowerCase()))) {
      return category;
    }
  }
  
  return 'general';
};

/**
 * Normalize job titles
 */
export const normalizeJobTitle = (title: string): string => {
  if (!title) return '';
  
  const normalized = title.trim();
  
  for (const [standardTitle, variations] of Object.entries(JOB_TITLE_MAPPING)) {
    if (variations.some(variation => 
      normalized.toLowerCase() === variation.toLowerCase() ||
      normalized.toLowerCase().includes(variation.toLowerCase())
    )) {
      return standardTitle;
    }
  }
  
  return normalized;
};

// Helper functions
const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getMonthNumber = (monthName: string): number => {
  const months = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12,
  };
  
  return months[monthName.toLowerCase()] || 1;
};

const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +1, remove it for US numbers
  if (cleaned.startsWith('+1')) {
    return cleaned.substring(2);
  }
  
  // If it starts with 1 and has 11 digits, remove the 1
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return cleaned.substring(1);
  }
  
  return cleaned;
};