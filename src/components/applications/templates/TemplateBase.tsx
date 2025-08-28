import { Application } from '../../../types/application';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';

export interface TemplateProps {
  resume: NonNullable<Application['generatedResume']>['tailored_resume'];
  options?: {
    showCompanyDescription?: boolean;
    showKeyAchievements?: boolean;
    showResponsibilities?: boolean;
  };
}

export interface TemplateStyle {
  name: string;
  description: string;
  preview: string;
  styles: ReturnType<typeof StyleSheet.create>;
  layout: 'single' | 'double' | 'creative';
  theme: 'light' | 'dark' | 'modern';
  sections: {
    header: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    languages: boolean;
    projects: boolean;
    certifications: boolean;
  };
  customSections?: string[];
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: TemplateStyle;
  render: (props: TemplateProps) => JSX.Element;
  defaultOptions?: TemplateProps['options'];
}

// Utility function to calculate dynamic page height based on content
export const calculateDynamicPageHeight = (resume: NonNullable<Application['generatedResume']>['tailored_resume']): number => {
  // Simple but effective approach: base height + content-based additions
  let estimatedHeight = 1300; // Safe base height
  
  // Add height based on major content sections
  if (resume.experience && resume.experience.length > 0) {
    // Add height for experience section based on number of jobs and content
    estimatedHeight += resume.experience.length * 50;
    
    // Add for achievements and responsibilities
    resume.experience.forEach(exp => {
      if (exp.key_achievements) {
        estimatedHeight += exp.key_achievements.length * 15;
      }
      if (exp.responsibilities) {
        estimatedHeight += exp.responsibilities.length * 15;
      }
    });
  }
  
  // Add for other major sections
  if (resume.projects && resume.projects.length > 0) {
    estimatedHeight += resume.projects.length * 40;
  }
  
  if (resume.education && resume.education.length > 0) {
    estimatedHeight += resume.education.length * 30;
  }
  
  // Cap the height at reasonable limits
  const MIN_HEIGHT = 1300; // Ensure single page
  const MAX_HEIGHT = 1800; // Keep it reasonable
  
  const finalHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, estimatedHeight));
  
  return finalHeight;
};

export const BaseTemplate: ResumeTemplate = {
  id: 'base',
  name: 'Base Template',
  description: 'Base template for all resume templates',
  preview: '',
  style: {
    name: 'Base',
    description: 'Base template style',
    preview: '',
    styles: StyleSheet.create({
      page: {
        padding: 30,
        fontFamily: 'Inter',
        fontSize: 10,
        color: '#333',
        backgroundColor: '#fff',
      },
    }),
    layout: 'single',
    theme: 'light',
    sections: {
      header: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      languages: true,
      projects: true,
      certifications: true,
    },
  },
  render: () => (
    <Document>
      <Page size="A4" style={BaseTemplate.style.styles.page}>
        {/* Template specific content will go here */}
      </Page>
    </Document>
  ),
  defaultOptions: {
    showCompanyDescription: true,
    showKeyAchievements: true,
    showResponsibilities: true,
  },
}; 
