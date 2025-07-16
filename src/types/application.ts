export type ApplicationStatus = 'Draft' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface ATSScore {
  overall_score: number;
  keyword_match_score: number;
  format_score: number;
  content_quality_score: number;
  missing_keywords: string[];
  improvement_suggestions: string[];
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
interface Skill {
  name: string;
  level: SkillLevel;
}

export type LanguageLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Native';
interface Language {
  name: string;
  level: LanguageLevel;
}

interface Certification {
  name: string;
  organization: string | null;
}

interface Project {
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
}

interface Experience {
  position: string;
  company: string;
  company_description: string;
  start_date: string;
  end_date: string;
  location: string;
  key_achievements: string[];
  responsibilities: string[];
}

interface Education {
  degree: string;
  field: string;
  institution: string;
  start_date: string;
  end_date: string;
  relevant_coursework?: string[];
  other_details?: string[];
}
export interface Resume {
  full_name: string;
  phone_number: string;
  address: string;
  email: string;
  website: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  skills: Skill[];
  education: Education[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
  improvements_made?: {
    section: string;
    improvement: string;
    reason: string;
  }[];
};
export interface Application {
  id: string;
  company: string;
  position: string;
  jobDescription: string;
  status: ApplicationStatus;
  atsScore: number;
  appliedDate: string;
  createdAt: string;
  updatedAt: string;
  ats_score: ATSScore;
  lastGeneratedAt?: string;
  generatedResume?: {
    tailored_resume: Resume;
    ats_score: ATSScore;
  };
}
