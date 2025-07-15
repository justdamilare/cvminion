'use client';

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ResumeTemplate } from './TemplateBase';
import { formatDateRange } from './dateUtils';
import { getContactWithIcon, cleanLinkedInUrl } from './contactIcons';

// Use built-in fonts for reliability
// Font.register is commented out to avoid external dependencies

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#2c3e50",
    backgroundColor: "#ffffff",
    lineHeight: 1.3,
    flexDirection: "row",
  },
  sidebar: {
    width: "35%",
    backgroundColor: "#f8f9fa",
    padding: 25,
    paddingRight: 15,
  },
  mainContent: {
    width: "65%",
    padding: 25,
    paddingLeft: 15,
  },
  header: {
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: "#34495e",
    fontWeight: 500,
    marginBottom: 16,
  },
  contact: {
    fontSize: 10,
    color: "#34495e",
    lineHeight: 1.4,
  },
  contactLine: {
    marginBottom: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#2c3e50",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1px solid #3498db",
    paddingBottom: 4,
    marginBottom: 16,
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#2c3e50",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "0.5px solid #bdc3c7",
    paddingBottom: 4,
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#2c3e50",
    marginBottom: 4,
  },
  company: {
    fontSize: 11,
    color: "#34495e",
    fontWeight: 500,
    marginBottom: 2,
  },
  dateRange: {
    fontSize: 10,
    color: "#34495e",
    fontStyle: "italic",
    marginBottom: 8,
  },
  achievementList: {
    marginLeft: 16,
    marginBottom: 16,
  },
  experienceItem: {
    marginBottom: 16,
    breakInside: "avoid",
  },
  achievementItem: {
    fontSize: 11,
    color: "#2c3e50",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  bullet: {
    fontSize: 8,
    marginRight: 8,
  },
  skillCategory: {
    marginBottom: 12,
  },
  skillCategoryTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#2c3e50",
    marginBottom: 4,
  },
  skillList: {
    fontSize: 10,
    color: "#34495e",
    lineHeight: 1.4,
  },
  skillItem: {
    marginBottom: 2,
  },
  degree: {
    fontSize: 12,
    fontWeight: 600,
    color: "#2c3e50",
    marginBottom: 4,
  },
  institution: {
    fontSize: 11,
    color: "#34495e",
    marginBottom: 2,
  },
  institutionDate: {
    fontSize: 10,
    color: "#34495e",
    marginBottom: 16,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#2c3e50",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 11,
    color: "#34495e",
    lineHeight: 1.4,
    marginBottom: 16,
  },
  summary: {
    fontSize: 11,
    color: "#2c3e50",
    lineHeight: 1.4,
    marginBottom: 0,
  },
  certificationItem: {
    marginBottom: 12,
  },
  certificationName: {
    fontSize: 10,
    fontWeight: 600,
    color: "#2c3e50",
    marginBottom: 2,
  },
  certificationOrg: {
    fontSize: 10,
    color: "#34495e",
  },
  languageList: {
    fontSize: 10,
    color: "#34495e",
    lineHeight: 1.4,
  },
});


export const ProfessionalTemplate: ResumeTemplate = {
  id: "professional",
  name: "Professional",
  description: "Two-column layout with sidebar for skills and contact info",
  preview: '',
  style: {
    name: 'Professional',
    description: 'Two-column layout with sidebar for skills and contact info',
    preview: '',
    styles,
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
  render: ({ resume, options = {} }) => {
    const { showCompanyDescription = true, showKeyAchievements = true, showResponsibilities = true } = options;
    
    return (
      <Document>
        <Page 
          size={[595.28, 1200]} // Custom height to allow for more content while maintaining A4 width
          style={styles.page}
        >
          {/* Sidebar */}
          <View style={styles.sidebar}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.name}>{resume.full_name.toUpperCase()}</Text>
              <Text style={styles.title}>
                {resume.experience && resume.experience.length > 0 && resume.experience[0].position 
                  ? resume.experience[0].position 
                  : 'Software Engineer'}
              </Text>
              <View style={styles.contact}>
                <View style={styles.contactLine}>
                  <Text>{resume.email}</Text>
                </View>
                <View style={styles.contactLine}>
                  <Text>{resume.phone_number}</Text>
                </View>
                <View style={styles.contactLine}>
                  <Text>{resume.address}</Text>
                </View>
                {resume.linkedin && (
                  <View style={styles.contactLine}>
                    <Text>{cleanLinkedInUrl(resume.linkedin)}</Text>
                  </View>
                )}
                {resume.website && (
                  <View style={styles.contactLine}>
                    <Text>{resume.website}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Technical Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sidebarSectionTitle}>Technical Skills</Text>
                <View style={styles.skillCategory}>
                  <Text style={styles.skillCategoryTitle}>Languages</Text>
                  <View style={styles.skillList}>
                    {resume.skills.slice(0, 5).map((skill: any, index: number) => (
                      <View key={index} style={styles.skillItem}>
                        <Text>• {skill.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {resume.skills.length > 5 && (
                  <View style={styles.skillCategory}>
                    <Text style={styles.skillCategoryTitle}>Frameworks</Text>
                    <View style={styles.skillList}>
                      {resume.skills.slice(5, 10).map((skill: any, index: number) => (
                        <View key={index} style={styles.skillItem}>
                          <Text>• {skill.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                {resume.skills.length > 10 && (
                  <View style={styles.skillCategory}>
                    <Text style={styles.skillCategoryTitle}>Tools & Cloud</Text>
                    <View style={styles.skillList}>
                      {resume.skills.slice(10).map((skill: any, index: number) => (
                        <View key={index} style={styles.skillItem}>
                          <Text>• {skill.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sidebarSectionTitle}>Certifications</Text>
                {resume.certifications.map((cert: any, index: number) => (
                  <View key={index} style={styles.certificationItem}>
                    <Text style={styles.certificationName}>{cert.name}</Text>
                    {cert.organization && (
                      <Text style={styles.certificationOrg}>{cert.organization}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            {resume.languages && resume.languages.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sidebarSectionTitle}>Languages</Text>
                <View style={styles.languageList}>
                  {resume.languages.map((lang: any, index: number) => (
                    <Text key={index}>
                      {lang.name} ({lang.level}){index < resume.languages.length - 1 ? '\n' : ''}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Professional Summary */}
            {resume.summary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Professional Summary</Text>
                <Text style={styles.summary}>{resume.summary}</Text>
              </View>
            )}

            {/* Work Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Work Experience</Text>
                {resume.experience.map((exp: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{exp.position}</Text>
                    <Text style={styles.company}>{exp.company}</Text>
                    <Text style={styles.dateRange}>
                      {exp.location} • {formatDateRange(exp.start_date, exp.end_date)}
                    </Text>
                    <View style={styles.achievementList}>
                      {showCompanyDescription && exp.company_description && (
                        <Text style={styles.achievementItem}>{exp.company_description}</Text>
                      )}
                      {showKeyAchievements && exp.key_achievements?.map((achievement: string, i: number) => (
                        <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.achievementItem}>{achievement}</Text>
                        </View>
                      ))}
                      {showResponsibilities && exp.responsibilities?.map((responsibility: string, i: number) => (
                        <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.achievementItem}>{responsibility}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                {resume.education.map((edu: any, index: number) => (
                  <View key={index}>
                    <Text style={styles.degree}>
                      {edu.degree} in {edu.field}
                    </Text>
                    <Text style={styles.institution}>{edu.institution}</Text>
                    <Text style={styles.institutionDate}>
                      {formatDateRange(edu.start_date, edu.end_date)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Projects</Text>
                {resume.projects.map((project: any, index: number) => (
                  <View key={index}>
                    <Text style={styles.projectTitle}>
                      {project.title}
                      {project.start_date && ` (${formatDateRange(project.start_date, project.end_date)})`}
                    </Text>
                    <Text style={styles.projectDescription}>{project.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Page>
      </Document>
    );
  },
  defaultOptions: {
    showCompanyDescription: true,
    showKeyAchievements: true,
    showResponsibilities: true,
  },
};
