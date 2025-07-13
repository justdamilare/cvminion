import { Profile, Education, Experience, Skill, Language, Project, Certification } from '../types/profile';
import { SkillLevel, LanguageLevel } from '../types/application';

// LinkedIn export data structures
interface LinkedInBasicInfo {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumbers?: Array<{ number: string; type: string }>;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  summary?: string;
  headline?: string;
  industry?: string;
  websites?: Array<{ url: string; type: string }>;
}

interface LinkedInPosition {
  companyName?: string;
  title?: string;
  description?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  startDate?: {
    month?: number;
    year?: number;
  };
  endDate?: {
    month?: number;
    year?: number;
  };
  isCurrent?: boolean;
}

interface LinkedInEducation {
  schoolName?: string;
  degreeName?: string;
  fieldOfStudy?: string;
  startDate?: {
    month?: number;
    year?: number;
  };
  endDate?: {
    month?: number;
    year?: number;
  };
  activities?: string;
  notes?: string;
}

interface LinkedInSkill {
  name?: string;
  endorsementCount?: number;
}

interface LinkedInLanguage {
  name?: string;
  proficiency?: string;
}

interface LinkedInCertification {
  name?: string;
  authority?: string;
  startDate?: {
    month?: number;
    year?: number;
  };
  endDate?: {
    month?: number;
    year?: number;
  };
  url?: string;
}

interface LinkedInProject {
  title?: string;
  description?: string;
  startDate?: {
    month?: number;
    year?: number;
  };
  endDate?: {
    month?: number;
    year?: number;
  };
  url?: string;
}

interface LinkedInCSVRow {
  [key: string]: string;
}

interface LinkedInExportData {
  profile?: LinkedInBasicInfo;
  positions?: LinkedInPosition[];
  education?: LinkedInEducation[];
  skills?: LinkedInSkill[];
  languages?: LinkedInLanguage[];
  certifications?: LinkedInCertification[];
  projects?: LinkedInProject[];
  profileJson?: any;
  basicInfo?: any;
  // CSV data
  Profile?: LinkedInCSVRow[];
  Positions?: LinkedInCSVRow[];
  Education?: LinkedInCSVRow[];
  Skills?: LinkedInCSVRow[];
  Languages?: LinkedInCSVRow[];
  Certifications?: LinkedInCSVRow[];
  Projects?: LinkedInCSVRow[];
}

/**
 * Utility functions for data normalization
 */
const generateId = (): string => Math.random().toString(36).substr(2, 9);

const formatDate = (dateObj?: { month?: number; year?: number }): string => {
  if (!dateObj || !dateObj.year) return '';
  const month = dateObj.month ? String(dateObj.month).padStart(2, '0') : '01';
  return `${dateObj.year}-${month}-01`;
};

const cleanText = (text?: string): string => {
  if (!text) return '';
  return text.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
};

const parseLocation = (location?: { city?: string; state?: string; country?: string } | string): string => {
  if (typeof location === 'string') return location;
  if (!location) return '';
  
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.join(', ');
};

const normalizeSkillLevel = (endorsementCount?: number): SkillLevel => {
  if (!endorsementCount || endorsementCount === 0) return 'Beginner';
  if (endorsementCount < 5) return 'Intermediate';
  if (endorsementCount < 15) return 'Advanced';
  return 'Expert';
};

const normalizeLanguageLevel = (proficiency?: string): LanguageLevel => {
  if (!proficiency) return 'Intermediate';
  
  const prof = proficiency.toLowerCase();
  if (prof.includes('native') || prof.includes('mother tongue')) return 'Native';
  if (prof.includes('fluent') || prof.includes('professional')) return 'Advanced';
  if (prof.includes('conversational') || prof.includes('intermediate')) return 'Intermediate';
  if (prof.includes('basic') || prof.includes('elementary')) return 'Beginner';
  
  return 'Intermediate';
};

/**
 * CSV parsing helpers
 */
const parseCSVProfile = (csvData: LinkedInCSVRow[]): Partial<LinkedInBasicInfo> => {
  if (!csvData || csvData.length === 0) return {};
  
  const row = csvData[0]; // Profile CSV usually has one row
  return {
    firstName: row['First Name'] || row['firstName'],
    lastName: row['Last Name'] || row['lastName'],
    emailAddress: row['Email Address'] || row['email'],
    headline: row['Headline'] || row['headline'],
    summary: cleanText(row['Summary'] || row['summary']),
    industry: row['Industry'] || row['industry']
  };
};

const parseCSVPositions = (csvData: LinkedInCSVRow[]): LinkedInPosition[] => {
  if (!csvData) return [];
  
  return csvData.map(row => ({
    companyName: row['Company Name'] || row['company'],
    title: row['Title'] || row['position'] || row['title'],
    description: cleanText(row['Description'] || row['description']),
    location: { city: row['Location'] || row['location'] },
    startDate: parseCSVDate(row['Started On'] || row['start_date']),
    endDate: parseCSVDate(row['Finished On'] || row['end_date']),
    isCurrent: !row['Finished On'] && !row['end_date']
  }));
};

const parseCSVEducation = (csvData: LinkedInCSVRow[]): LinkedInEducation[] => {
  if (!csvData) return [];
  
  return csvData.map(row => ({
    schoolName: row['School Name'] || row['institution'] || row['school'],
    degreeName: row['Degree Name'] || row['degree'],
    fieldOfStudy: row['Field Of Study'] || row['field'] || row['major'],
    startDate: parseCSVDate(row['Start Date'] || row['start_date']),
    endDate: parseCSVDate(row['End Date'] || row['end_date']),
    activities: cleanText(row['Activities'] || row['activities']),
    notes: cleanText(row['Notes'] || row['description'])
  }));
};

const parseCSVSkills = (csvData: LinkedInCSVRow[]): LinkedInSkill[] => {
  if (!csvData) return [];
  
  return csvData.map(row => ({
    name: row['Skill Name'] || row['name'] || row['skill'],
    endorsementCount: parseInt(row['Endorsement Count'] || row['endorsements'] || '0', 10)
  }));
};

const parseCSVLanguages = (csvData: LinkedInCSVRow[]): LinkedInLanguage[] => {
  if (!csvData) return [];
  
  return csvData.map(row => ({
    name: row['Language'] || row['name'],
    proficiency: row['Proficiency'] || row['level'] || 'Intermediate'
  }));
};

const parseCSVDate = (dateStr?: string): { month?: number; year?: number } | undefined => {
  if (!dateStr) return undefined;
  
  // Handle various date formats: "Jan 2020", "2020", "01/2020", etc.
  const year = parseInt(dateStr.match(/\d{4}/)?.[0] || '', 10);
  if (!year) return undefined;
  
  const monthMatch = dateStr.match(/\b(\d{1,2})\b/);
  const month = monthMatch ? parseInt(monthMatch[0], 10) : undefined;
  
  return { year, month };
};

/**
 * Main parsing functions
 */
export const parseLinkedInData = (data: LinkedInExportData): Partial<Profile> => {
  try {
    // Determine data source and extract basic info
    let basicInfo: Partial<LinkedInBasicInfo> = {};
    
    if (data.profileJson) {
      basicInfo = data.profileJson;
    } else if (data.basicInfo) {
      basicInfo = data.basicInfo;
    } else if (data.profile) {
      basicInfo = data.profile;
    } else if (data.Profile) {
      basicInfo = parseCSVProfile(data.Profile);
    }

    // Parse positions/experience
    let positions: LinkedInPosition[] = [];
    if (data.positions) {
      positions = data.positions;
    } else if (data.Positions) {
      positions = parseCSVPositions(data.Positions);
    }

    // Parse education
    let education: LinkedInEducation[] = [];
    if (data.education) {
      education = data.education;
    } else if (data.Education) {
      education = parseCSVEducation(data.Education);
    }

    // Parse skills
    let skills: LinkedInSkill[] = [];
    if (data.skills) {
      skills = data.skills;
    } else if (data.Skills) {
      skills = parseCSVSkills(data.Skills);
    }

    // Parse languages
    let languages: LinkedInLanguage[] = [];
    if (data.languages) {
      languages = data.languages;
    } else if (data.Languages) {
      languages = parseCSVLanguages(data.Languages);
    }

    // Parse certifications
    let certifications: LinkedInCertification[] = [];
    if (data.certifications) {
      certifications = data.certifications;
    }

    // Parse projects
    let projects: LinkedInProject[] = [];
    if (data.projects) {
      projects = data.projects;
    }

    return mapToProfile({
      basicInfo,
      positions,
      education,
      skills,
      languages,
      certifications,
      projects
    });
  } catch (error) {
    console.error('LinkedIn parsing error:', error);
    throw new Error('Failed to parse LinkedIn data. Please ensure you uploaded a valid LinkedIn export file.');
  }
};

const mapToProfile = (data: {
  basicInfo: Partial<LinkedInBasicInfo>;
  positions: LinkedInPosition[];
  education: LinkedInEducation[];
  skills: LinkedInSkill[];
  languages: LinkedInLanguage[];
  certifications: LinkedInCertification[];
  projects: LinkedInProject[];
}): Partial<Profile> => {
  const { basicInfo, positions, education, skills, languages, certifications, projects } = data;

  // Extract contact info
  const phoneNumber = basicInfo.phoneNumbers?.[0]?.number || '';
  const linkedinUrl = basicInfo.websites?.find(w => w.type?.toLowerCase().includes('linkedin'))?.url || '';
  const websiteUrl = basicInfo.websites?.find(w => !w.type?.toLowerCase().includes('linkedin'))?.url || '';

  // Map experience
  const mappedExperience: Experience[] = positions.map(pos => ({
    id: generateId(),
    company: pos.companyName || '',
    position: pos.title || '',
    start_date: formatDate(pos.startDate),
    end_date: pos.isCurrent ? undefined : formatDate(pos.endDate),
    company_description: cleanText(pos.description) || '',
    highlights: pos.description ? [cleanText(pos.description)] : []
  }));

  // Map education
  const mappedEducation: Education[] = education.map(edu => ({
    id: generateId(),
    institution: edu.schoolName || '',
    degree: edu.degreeName || '',
    field: edu.fieldOfStudy || '',
    start_date: formatDate(edu.startDate),
    end_date: formatDate(edu.endDate),
    description: [edu.activities, edu.notes].filter(Boolean).join('\n')
  }));

  // Map skills
  const mappedSkills: Skill[] = skills.map(skill => ({
    id: generateId(),
    name: skill.name || '',
    level: normalizeSkillLevel(skill.endorsementCount)
  }));

  // Map languages
  const mappedLanguages: Language[] = languages.map(lang => ({
    id: generateId(),
    name: lang.name || '',
    level: normalizeLanguageLevel(lang.proficiency)
  }));

  // Map certifications
  const mappedCertifications: Certification[] = certifications.map(cert => ({
    id: generateId(),
    name: cert.name || '',
    organization: cert.authority || null
  }));

  // Map projects
  const mappedProjects: Project[] = projects.map(proj => ({
    id: generateId(),
    title: proj.title || '',
    start_date: formatDate(proj.startDate),
    end_date: formatDate(proj.endDate)
  }));

  return {
    full_name: basicInfo.firstName && basicInfo.lastName 
      ? `${basicInfo.firstName} ${basicInfo.lastName}`.trim()
      : '',
    email: basicInfo.emailAddress || '',
    phone_number: phoneNumber,
    address: parseLocation(basicInfo.location),
    summary: cleanText(basicInfo.summary) || '',
    title: basicInfo.headline || '',
    website: websiteUrl,
    linkedin: linkedinUrl,
    experience: mappedExperience,
    education: mappedEducation,
    skills: mappedSkills,
    languages: mappedLanguages,
    certifications: mappedCertifications,
    projects: mappedProjects
  };
};

/**
 * Validate parsed LinkedIn data
 */
export const validateLinkedInData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('No data provided');
    return { valid: false, errors };
  }
  
  // Check for basic required fields
  if (!data.full_name || data.full_name.trim() === '') {
    errors.push('Full name is required');
  }
  
  if (!data.email || data.email.trim() === '') {
    errors.push('Email address is required');
  }
  
  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get data completeness percentage
 */
export const getDataCompleteness = (data: Partial<Profile>): number => {
  const fields = [
    'full_name', 'email', 'phone_number', 'address', 'summary', 'title'
  ];
  
  const arrayFields = [
    'experience', 'education', 'skills'
  ];
  
  let completedFields = 0;
  let totalFields = fields.length + arrayFields.length;
  
  // Check text fields
  fields.forEach(field => {
    if (data[field as keyof Profile] && String(data[field as keyof Profile]).trim() !== '') {
      completedFields++;
    }
  });
  
  // Check array fields
  arrayFields.forEach(field => {
    const arr = data[field as keyof Profile] as any[];
    if (arr && Array.isArray(arr) && arr.length > 0) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / totalFields) * 100);
};