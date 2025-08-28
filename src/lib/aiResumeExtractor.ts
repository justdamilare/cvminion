/**
 * AI-powered resume data extraction service
 * Uses OpenAI API to intelligently extract structured data from resume text
 */

import type { Education, Experience, Skill, Language, Project, Certification } from '../types/profile';
import type { SkillLevel, LanguageLevel } from '../types/application';

export interface ExtractedResumeData {
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    title?: string;
    summary?: string;
  };
  experience: Omit<Experience, 'id'>[];
  education: Omit<Education, 'id'>[];
  skills: Omit<Skill, 'id'>[];
  languages: Omit<Language, 'id'>[];
  projects: Omit<Project, 'id'>[];
  certifications: Omit<Certification, 'id'>[];
  confidence: {
    overall: number;
    personalInfo: number;
    experience: number;
    education: number;
    skills: number;
    languages: number;
    projects: number;
    certifications: number;
  };
  warnings: string[];
}

export interface AIExtractionOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableFallbackParsing?: boolean;
  customPrompt?: string;
}

const DEFAULT_OPTIONS: AIExtractionOptions = {
  model: 'gpt-3.5-turbo',
  temperature: 0.1,
  maxTokens: 3000, // Reduced to avoid token limit issues
  enableFallbackParsing: true,
};

/**
 * Main function to extract structured data from resume text using AI
 */
export const extractResumeDataWithAI = async (
  resumeText: string,
  options: AIExtractionOptions = {}
): Promise<ExtractedResumeData> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Try Supabase Edge Function first, fallback to direct OpenAI if needed
    let extractedData: ExtractedResumeData;
    
    try {
      extractedData = await extractWithSupabaseFunction(resumeText);
    } catch (supabaseError) {
      console.warn('Supabase function failed, trying direct OpenAI:', supabaseError);
      
      // Fallback to direct OpenAI call with improved prompts
      if (!opts.apiKey) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (apiKey) {
          opts.apiKey = apiKey;
        } else {
          throw new Error('No OpenAI API key available');
        }
      }
      
      extractedData = await extractWithImprovedOpenAI(resumeText, opts);
    }
    
    // Validate and clean the extracted data
    return validateAndCleanData(extractedData);
    
  } catch (error) {
    console.error('AI extraction failed:', error);
    
    if (opts.enableFallbackParsing) {
      return await fallbackResumeExtraction(resumeText);
    } else {
      throw error;
    }
  }
};

/**
 * Extract data using Supabase Edge Function (secure)
 */
const extractWithSupabaseFunction = async (resumeText: string): Promise<ExtractedResumeData> => {
  const { getSupabaseClient } = await import('./supabase');
  const supabase = getSupabaseClient();
  
  // Get the user's session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${supabase.supabaseUrl}/functions/v1/ai-resume-extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': supabase.supabaseKey,
    },
    body: JSON.stringify({
      resumeText
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`AI extraction failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Check if fallback was used
  if (data.fallback) {
    throw new Error(data.error || 'AI extraction failed, using fallback');
  }
  
  return data;
};

/**
 * Improved OpenAI extraction with latest best practices
 */
const extractWithImprovedOpenAI = async (
  resumeText: string,
  options: AIExtractionOptions
): Promise<ExtractedResumeData> => {
  // Validate API key
  if (!options.apiKey || !options.apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format');
  }

  // Truncate resume text if too long - increased limit for better extraction
  const maxResumeLength = 12000; 
  const truncatedText = resumeText.length > maxResumeLength 
    ? resumeText.substring(0, maxResumeLength) + '...'
    : resumeText;

  const systemPrompt = `You are an expert resume parser with deep understanding of professional documents. Your task is to extract structured data from resumes with maximum accuracy and attention to detail.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON that matches the exact schema provided
2. Extract ALL information present - do not miss any details
3. For missing information, use null (not empty strings)
4. Pay special attention to names, job titles, companies, and dates
5. Ensure all dates are in YYYY-MM-DD format
6. Be thorough with work experience and skills extraction

EXTRACTION PRIORITIES:
- Personal information (name, contact details, job title)
- Complete work history with accurate dates and descriptions
- All skills mentioned (technical and soft skills)
- Education background
- Projects and certifications if present`;

  const userPrompt = createImprovedExtractionPrompt(truncatedText);
  
  const requestBody = {
    model: 'gpt-4o-mini', // Latest and most cost-effective model
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 0.1, // Low temperature for consistent extraction
    max_tokens: 4000, // Increased for comprehensive extraction
    response_format: { type: "json_object" as const } // Ensure JSON response
  };

  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage += ` - ${errorData.error.message || errorData.error.code || 'Unknown error'}`;
      }
    } catch {
      // If we can't parse the error response, just use the status
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from OpenAI API');
  }
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError);
    throw new Error('Failed to parse AI response as JSON');
  }
};

/**
 * Extract data using OpenAI API (DEPRECATED - use improved version)
 */
const extractWithOpenAI = async (
  resumeText: string,
  options: AIExtractionOptions
): Promise<ExtractedResumeData> => {
  // Validate API key
  if (!options.apiKey || !options.apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format');
  }

  // Truncate resume text if too long to avoid token limits
  const maxResumeLength = 8000; // Conservative limit
  const truncatedText = resumeText.length > maxResumeLength 
    ? resumeText.substring(0, maxResumeLength) + '...'
    : resumeText;

  const prompt = options.customPrompt || createExtractionPrompt(truncatedText);
  
  const requestBody = {
    model: options.model,
    messages: [
      {
        role: 'system',
        content: `You are an expert resume parser. Extract structured data from resumes with high accuracy. Always return valid JSON that matches the exact schema provided. If information is unclear or missing, use null or empty arrays rather than making assumptions.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: options.temperature,
    max_tokens: options.maxTokens,
  };

  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage += ` - ${errorData.error.message || errorData.error.code || 'Unknown error'}`;
      }
    } catch {
      // If we can't parse the error response, just use the status
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from OpenAI API');
  }
  
  try {
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from the response if it's wrapped in markdown
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error('Failed to parse JSON response from OpenAI');
  }
};

/**
 * Create improved extraction prompt with better instructions
 */
const createImprovedExtractionPrompt = (resumeText: string): string => {
  return `Extract ALL data from this resume into the following JSON schema. Be extremely thorough and accurate, especially with personal information and work experience:

{
  "personalInfo": {
    "fullName": "string or null",
    "email": "string or null", 
    "phone": "string or null",
    "address": "string or null",
    "website": "string or null",
    "linkedin": "string or null",
    "github": "string or null",
    "title": "string or null",
    "summary": "string or null"
  },
  "experience": [
    {
      "company": "string",
      "position": "string", 
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null for current",
      "company_description": "string",
      "highlights": ["array of key achievements and responsibilities"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string", 
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null",
      "description": "string or null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "beginner|intermediate|advanced|expert"
    }
  ],
  "languages": [
    {
      "name": "string", 
      "level": "elementary|limited_working|professional_working|full_professional|native"
    }
  ],
  "projects": [
    {
      "title": "string",
      "start_date": "YYYY-MM-DD or null",
      "end_date": "YYYY-MM-DD or null"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "organization": "string or null"
    }
  ],
  "confidence": {
    "overall": 85,
    "personalInfo": 95,
    "experience": 90, 
    "education": 85,
    "skills": 75,
    "languages": 80,
    "projects": 70,
    "certifications": 85
  },
  "warnings": ["array of any extraction issues or uncertainties"]
}

IMPORTANT EXTRACTION GUIDELINES:
- Extract the person's FULL NAME from the header/top of the resume
- Find ALL contact information (email, phone, address, LinkedIn, etc.)
- Extract EVERY job position with complete details
- Include ALL skills mentioned, both technical and soft skills
- Convert all dates to YYYY-MM-DD format (use 01 for day if only month/year given)
- For current positions, set end_date to null
- Extract all education details with institutions and degrees
- Include any projects or certifications mentioned
- Provide confidence scores based on how clear the information is

RESUME TEXT:
${resumeText}`;
};

/**
 * Create the extraction prompt for OpenAI (DEPRECATED)
 */
const createExtractionPrompt = (resumeText: string): string => {
  return `Extract structured data from the following resume text. Return a JSON object that exactly matches this schema:

{
  "personalInfo": {
    "fullName": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null",
    "website": "string or null",
    "linkedin": "string or null",
    "github": "string or null",
    "title": "string or null",
    "summary": "string or null"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "start_date": "YYYY-MM-DD format",
      "end_date": "YYYY-MM-DD format or null for current",
      "company_description": "string",
      "highlights": ["string array of achievements"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "start_date": "YYYY-MM-DD format",
      "end_date": "YYYY-MM-DD format or null",
      "description": "string or null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "beginner|intermediate|advanced|expert"
    }
  ],
  "languages": [
    {
      "name": "string",
      "level": "elementary|limited_working|professional_working|full_professional|native"
    }
  ],
  "projects": [
    {
      "title": "string",
      "start_date": "YYYY-MM-DD format or null",
      "end_date": "YYYY-MM-DD format or null"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "organization": "string or null"
    }
  ],
  "confidence": {
    "overall": 85,
    "personalInfo": 95,
    "experience": 90,
    "education": 85,
    "skills": 75,
    "languages": 80,
    "projects": 70,
    "certifications": 85
  },
  "warnings": ["array of strings describing any extraction issues"]
}

Important guidelines:
- Use exact date formats (YYYY-MM-DD). If only month/year is available, use YYYY-MM-01
- For current positions/education, set end_date to null
- Extract ALL work experience, education, and skills mentioned
- For skill levels, infer from context (years of experience, project complexity, etc.)
- For language levels, infer from context or use "professional_working" as default
- Include confidence scores (0-100) for each section based on text clarity
- Add warnings for any ambiguous or missing information
- Normalize company names, job titles, and institutions
- Extract achievements and responsibilities into highlights array

Resume text:
${resumeText}`;
};

/**
 * Fallback extraction using rule-based parsing
 */
const fallbackResumeExtraction = async (resumeText: string): Promise<ExtractedResumeData> => {
  // Note: lines variable was removed as it's not used in the current implementation
  
  const result: ExtractedResumeData = {
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    confidence: {
      overall: 50,
      personalInfo: 40,
      experience: 50,
      education: 45,
      skills: 60,
      languages: 30,
      projects: 35,
      certifications: 40,
    },
    warnings: ['Used fallback parsing - results may be less accurate'],
  };
  
  // Extract personal information
  result.personalInfo = extractPersonalInfoFallback(resumeText);
  
  // Extract experience
  result.experience = extractExperienceFallback(resumeText);
  
  // Extract education
  result.education = extractEducationFallback(resumeText);
  
  // Extract skills
  result.skills = extractSkillsFallback(resumeText);
  
  // Extract languages
  result.languages = extractLanguagesFallback(resumeText);
  
  // Extract projects
  result.projects = extractProjectsFallback(resumeText);
  
  // Extract certifications
  result.certifications = extractCertificationsFallback(resumeText);
  
  return result;
};

/**
 * Extract personal information using regex patterns
 */
const extractPersonalInfoFallback = (text: string): ExtractedResumeData['personalInfo'] => {
  const info: ExtractedResumeData['personalInfo'] = {};
  
  // Email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) info.email = emailMatch[0];
  
  // Phone
  const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
  if (phoneMatch) info.phone = phoneMatch[0];
  
  // LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)([A-Za-z0-9-_]+)/);
  if (linkedinMatch) info.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
  
  // GitHub
  const githubMatch = text.match(/(?:github\.com\/)([A-Za-z0-9-_]+)/);
  if (githubMatch) info.github = `https://github.com/${githubMatch[1]}`;
  
  // Website
  const websiteMatch = text.match(/https?:\/\/(?!linkedin|github)[^\s]+/);
  if (websiteMatch) info.website = websiteMatch[0];
  
  // Name (assume first non-empty line that doesn't contain email/phone)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !line.match(/\d{3}/) && line.length > 5 && line.length < 50) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        info.fullName = line;
        break;
      }
    }
  }
  
  return info;
};

/**
 * Extract work experience using pattern matching
 */
const extractExperienceFallback = (text: string): Omit<Experience, 'id'>[] => {
  const experiences: Omit<Experience, 'id'>[] = [];
  
  // Look for job patterns
  const jobPatterns = [
    /(.+?)\s+(?:at|@)\s+(.+?)\s+(?:\d{4}|\d{1,2}\/\d{4})/gi,
    /(.+?)\s*\n\s*(.+?)\s*\n\s*(\d{4}|\d{1,2}\/\d{4})/gi,
  ];
  
  jobPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const position = match[1]?.trim();
      const company = match[2]?.trim();
      
      if (position && company && position.length < 100 && company.length < 100) {
        experiences.push({
          position,
          company,
          start_date: '2020-01-01', // Default date
          end_date: undefined,
          company_description: company,
          highlights: [],
        });
      }
    }
  });
  
  return experiences.slice(0, 10); // Limit to 10 experiences
};

/**
 * Extract education using pattern matching
 */
const extractEducationFallback = (text: string): Omit<Education, 'id'>[] => {
  const education: Omit<Education, 'id'>[] = [];
  
  const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'degree', 'diploma', 'certificate', 'bs', 'ba', 'ms', 'ma', 'mba'];
  const lines = text.split('\n').map(l => l.trim());
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (degreeKeywords.some(keyword => line.includes(keyword))) {
      const degree = lines[i].trim();
      const institution = lines[i + 1]?.trim() || 'Unknown Institution';
      
      education.push({
        degree,
        institution,
        field: 'General',
        start_date: '2018-01-01',
        end_date: '2022-01-01',
      });
    }
  }
  
  return education.slice(0, 5); // Limit to 5 education entries
};

/**
 * Extract skills using keyword matching
 */
const extractSkillsFallback = (text: string): Omit<Skill, 'id'>[] => {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'HTML', 'CSS', 'TypeScript', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Linux', 'Windows',
    'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'InDesign',
    'Excel', 'PowerPoint', 'Word', 'Tableau', 'Power BI',
  ];
  
  const skills: Omit<Skill, 'id'>[] = [];
  const lowerText = text.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.push({
        name: skill,
        level: 'intermediate' as SkillLevel,
      });
    }
  });
  
  return skills.slice(0, 20); // Limit to 20 skills
};

/**
 * Extract languages using pattern matching
 */
const extractLanguagesFallback = (text: string): Omit<Language, 'id'>[] => {
  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese',
    'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi', 'Dutch', 'Swedish',
  ];
  
  const languages: Omit<Language, 'id'>[] = [];
  const lowerText = text.toLowerCase();
  
  commonLanguages.forEach(language => {
    if (lowerText.includes(language.toLowerCase())) {
      languages.push({
        name: language,
        level: 'professional_working' as LanguageLevel,
      });
    }
  });
  
  return languages.slice(0, 5); // Limit to 5 languages
};

/**
 * Extract projects using pattern matching
 */
const extractProjectsFallback = (text: string): Omit<Project, 'id'>[] => {
  const projects: Omit<Project, 'id'>[] = [];
  
  // Look for project-like patterns
  const projectKeywords = ['project', 'developed', 'built', 'created', 'designed'];
  const lines = text.split('\n').map(l => l.trim());
  
  lines.forEach(line => {
    if (projectKeywords.some(keyword => line.toLowerCase().includes(keyword)) && line.length > 10) {
      projects.push({
        title: line.substring(0, 100), // Truncate if too long
        start_date: null,
        end_date: null,
      });
    }
  });
  
  return projects.slice(0, 5); // Limit to 5 projects
};

/**
 * Extract certifications using pattern matching
 */
const extractCertificationsFallback = (text: string): Omit<Certification, 'id'>[] => {
  const certifications: Omit<Certification, 'id'>[] = [];
  
  const certKeywords = ['certified', 'certification', 'certificate', 'license', 'credential'];
  const lines = text.split('\n').map(l => l.trim());
  
  lines.forEach(line => {
    if (certKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      certifications.push({
        name: line.substring(0, 100), // Truncate if too long
        organization: null,
      });
    }
  });
  
  return certifications.slice(0, 10); // Limit to 10 certifications
};

/**
 * Validate and clean extracted data
 */
const validateAndCleanData = (data: ExtractedResumeData): ExtractedResumeData => {
  // Clean personal info
  if (data.personalInfo.email && !isValidEmail(data.personalInfo.email)) {
    data.personalInfo.email = undefined;
    data.warnings.push('Invalid email format detected and removed');
  }
  
  if (data.personalInfo.phone && !isValidPhone(data.personalInfo.phone)) {
    data.personalInfo.phone = undefined;
    data.warnings.push('Invalid phone format detected and removed');
  }
  
  // Validate dates in experience
  data.experience = data.experience.filter(exp => {
    if (!exp.company || !exp.position) {
      data.warnings.push('Incomplete experience entry removed');
      return false;
    }
    
    if (exp.start_date && !isValidDate(exp.start_date)) {
      exp.start_date = '2020-01-01'; // Default date
      data.warnings.push('Invalid start date corrected in experience');
    }
    
    if (exp.end_date && !isValidDate(exp.end_date)) {
      exp.end_date = null;
      data.warnings.push('Invalid end date removed in experience');
    }
    
    return true;
  });
  
  // Validate education dates
  data.education = data.education.filter(edu => {
    if (!edu.institution || !edu.degree) {
      data.warnings.push('Incomplete education entry removed');
      return false;
    }
    
    if (edu.start_date && !isValidDate(edu.start_date)) {
      edu.start_date = '2018-01-01'; // Default date
      data.warnings.push('Invalid start date corrected in education');
    }
    
    if (edu.end_date && !isValidDate(edu.end_date)) {
      edu.end_date = null;
      data.warnings.push('Invalid end date removed in education');
    }
    
    return true;
  });
  
  // Validate skill levels
  const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  data.skills = data.skills.filter(skill => {
    if (!skill.name) return false;
    if (!validSkillLevels.includes(skill.level)) {
      skill.level = 'intermediate' as SkillLevel;
      data.warnings.push('Invalid skill level corrected');
    }
    return true;
  });
  
  // Validate language levels
  const validLanguageLevels = ['elementary', 'limited_working', 'professional_working', 'full_professional', 'native'];
  data.languages = data.languages.filter(lang => {
    if (!lang.name) return false;
    if (!validLanguageLevels.includes(lang.level)) {
      lang.level = 'professional_working' as LanguageLevel;
      data.warnings.push('Invalid language level corrected');
    }
    return true;
  });
  
  // Remove empty projects and certifications
  data.projects = data.projects.filter(project => project.title && project.title.trim().length > 0);
  data.certifications = data.certifications.filter(cert => cert.name && cert.name.trim().length > 0);
  
  return data;
};

// Helper validation functions
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string): boolean => {
  return /^[\d\s\-\(\)\+\.]{10,}$/.test(phone);
};

const isValidDate = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
};

/**
 * Estimates extraction confidence based on text quality and completeness
 */
export const estimateExtractionConfidence = (resumeText: string): number => {
  let score = 0;
  
  // Text length and structure
  if (resumeText.length > 500) score += 20;
  if (resumeText.length > 1000) score += 10;
  if (resumeText.length > 2000) score += 10;
  
  // Common resume sections
  const sections = ['experience', 'education', 'skills'];
  sections.forEach(section => {
    if (new RegExp(section, 'i').test(resumeText)) score += 10;
  });
  
  // Contact information
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeText)) score += 10;
  if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText)) score += 5;
  
  // Dates (indicating timeline information)
  const dateMatches = resumeText.match(/\b\d{4}\b/g);
  if (dateMatches && dateMatches.length > 2) score += 10;
  
  // Professional keywords
  const professionalKeywords = ['responsible', 'managed', 'developed', 'implemented', 'designed', 'led', 'collaborated'];
  const keywordCount = professionalKeywords.filter(keyword => 
    new RegExp(keyword, 'i').test(resumeText)
  ).length;
  score += Math.min(keywordCount * 2, 10);
  
  return Math.min(score, 100);
};
