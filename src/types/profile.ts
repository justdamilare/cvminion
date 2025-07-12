import { LanguageLevel, SkillLevel } from "./application";


export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  company_description: string;
  highlights: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface Language {
  id: string;
  name: string;
  level: LanguageLevel;
}

export interface Project {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
}

export interface Certification {
  id: string;
  name: string;
  organization: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  summary: string;
  title: string;
  website?: string;
  linkedin?: string;
  github?: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
  subscription_tier?: 'free' | 'plus' | 'pro';
  total_credits?: number;
  available_credits?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  title: string;
  website?: string;
  linkedin?: string;
  github?: string;
}
