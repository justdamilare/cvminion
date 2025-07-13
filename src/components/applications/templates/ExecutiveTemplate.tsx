'use client';

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeTemplate } from './TemplateBase';
import { formatDateRange } from './dateUtils';
import { getContactWithIcon, cleanLinkedInUrl } from './contactIcons';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333333",
    backgroundColor: "#FFFFFF",
    lineHeight: 1.4,
    flexDirection: "row",
  },
  leftColumn: {
    width: 180,
    backgroundColor: "#F8F8F8",
    padding: 20,
    marginRight: 20,
  },
  rightColumn: {
    width: 315.28,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    color: "#000000",
    letterSpacing: 0.5,
    marginBottom: 6,
    lineHeight: 1.2,
  },
  title: {
    fontSize: 10,
    fontWeight: 400,
    color: "#666666",
    letterSpacing: 1,
    marginBottom: 15,
    textTransform: "uppercase",
  },
  contactSection: {
    marginBottom: 18,
  },
  contactTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#333333",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    borderBottom: "1px solid #E0E0E0",
    paddingBottom: 3,
  },
  contactItem: {
    fontSize: 9,
    color: "#333333",
    marginBottom: 6,
    lineHeight: 1.3,
  },
  sidebarSection: {
    marginBottom: 15,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#333333",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    borderBottom: "1px solid #E0E0E0",
    paddingBottom: 3,
  },
  skillItem: {
    fontSize: 9,
    color: "#333333",
    backgroundColor: "#FFFFFF",
    padding: "3 6",
    marginBottom: 4,
    borderLeft: "3px solid #CCCCCC",
    paddingLeft: 8,
  },
  languageItem: {
    fontSize: 9,
    color: "#333333",
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  languageName: {
    fontWeight: 600,
  },
  languageLevel: {
    color: "#666666",
    fontSize: 8,
  },
  certItem: {
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    padding: 6,
    borderLeft: "2px solid #E0E0E0",
  },
  certTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: "#000000",
    marginBottom: 2,
  },
  certIssuer: {
    fontSize: 8,
    color: "#666666",
  },
  mainContent: {
    backgroundColor: "#FFFFFF",
  },
  section: {
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    backgroundColor: "#F8F8F8",
    padding: 5,
    marginBottom: 8,
    borderLeft: "3px solid #333333",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#333333",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.4,
    textAlign: "justify",
  },
  experienceItem: {
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #F0F0F0",
    paddingBottom: 12,
  },
  companyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  company: {
    fontSize: 11,
    fontWeight: 700,
    color: "#000000",
  },
  position: {
    fontSize: 10,
    fontWeight: 500,
    color: "#333333",
    marginBottom: 3,
  },
  dates: {
    fontSize: 9,
    fontWeight: 400,
    color: "#666666",
    textAlign: "right",
  },
  location: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  description: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.3,
    marginBottom: 6,
  },
  achievementContainer: {
    backgroundColor: "#FAFAFA",
    padding: 8,
    marginTop: 6,
  },
  achievementTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: "#333333",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  bulletPoint: {
    fontSize: 9,
    color: "#333333",
    marginBottom: 2,
    lineHeight: 1.3,
    flexDirection: "row",
  },
  bullet: {
    marginRight: 6,
    color: "#666666",
    fontSize: 8,
  },
  educationItem: {
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderLeft: "2px solid #E8E8E8",
    paddingLeft: 10,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  institution: {
    fontSize: 11,
    fontWeight: 700,
    color: "#000000",
    marginBottom: 1,
  },
  degree: {
    fontSize: 10,
    fontWeight: 400,
    color: "#333333",
    marginBottom: 3,
  },
  educationDates: {
    fontSize: 10,
    color: "#666666",
    textAlign: "right",
  },
  details: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.3,
    marginTop: 3,
  },
  projectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  projectItem: {
    width: "48%",
    marginBottom: 8,
    backgroundColor: "#F8F8F8",
    padding: 8,
  },
  projectTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#000000",
    marginBottom: 3,
  },
  projectDescription: {
    fontSize: 8,
    color: "#333333",
    lineHeight: 1.3,
    marginBottom: 3,
  },
  projectDates: {
    fontSize: 8,
    color: "#666666",
  },
});

export const ExecutiveTemplate: ResumeTemplate = {
  id: 'executive',
  name: 'Executive',
  description: 'Two-column layout with elegant typography and subtle backgrounds',
  preview: '',
  style: {
    name: 'Executive',
    description: 'Executive-level design with sophisticated two-column layout',
    preview: '',
    styles,
    layout: 'double',
    theme: 'modern',
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
        <Page size="A4" style={styles.page}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Header */}
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{resume.full_name || 'Name not provided'}</Text>
              {resume.experience && resume.experience.length > 0 && resume.experience[0].position && (
                <Text style={styles.title}>{resume.experience[0].position}</Text>
              )}
            </View>

            {/* Contact Information */}
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Contact</Text>
              {resume.email && <Text style={styles.contactItem}>{getContactWithIcon('email', resume.email, 'simple')}</Text>}
              {resume.phone_number && <Text style={styles.contactItem}>{getContactWithIcon('phone', resume.phone_number, 'simple')}</Text>}
              {resume.address && <Text style={styles.contactItem}>{getContactWithIcon('address', resume.address, 'simple')}</Text>}
              {resume.website && (
                <Text style={styles.contactItem}>{getContactWithIcon('website', resume.website.replace(/^https?:\/\//, ""), 'simple')}</Text>
              )}
              {resume.linkedin && (
                <Text style={styles.contactItem}>{getContactWithIcon('linkedin', cleanLinkedInUrl(resume.linkedin), 'simple')}</Text>
              )}
            </View>

            {/* Core Competencies */}
            {resume.skills && resume.skills.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Core Competencies</Text>
                {resume.skills.map((skill, index) => (
                  <Text key={index} style={styles.skillItem}>
                    {skill.name}
                  </Text>
                ))}
              </View>
            )}

            {/* Languages */}
            {resume.languages && resume.languages.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Languages</Text>
                {resume.languages.map((language, index) => (
                  <View key={index} style={styles.languageItem}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageLevel}>{language.level}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Certifications</Text>
                {resume.certifications.map((cert, index) => (
                  <View key={index} style={styles.certItem}>
                    <Text style={styles.certTitle}>{cert.name}</Text>
                    {cert.organization && (
                      <Text style={styles.certIssuer}>{cert.organization}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            <View style={styles.mainContent}>
              {/* Executive Summary */}
              {resume.summary && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Executive Summary</Text>
                  </View>
                  <Text style={styles.summaryText}>{resume.summary}</Text>
                </View>
              )}

              {/* Professional Experience */}
              {resume.experience && resume.experience.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Professional Experience</Text>
                  </View>
                  {resume.experience.map((exp, index) => (
                    <View key={index} style={styles.experienceItem}>
                      <View style={styles.companyRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.company}>{exp.company}</Text>
                          <Text style={styles.position}>{exp.position}</Text>
                        </View>
                        <View>
                                          {(exp.start_date || exp.end_date) && (
                  <Text style={styles.dates}>
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </Text>
                )}
                        </View>
                      </View>
                      {exp.location && (
                        <Text style={styles.location}>{exp.location}</Text>
                      )}
                      {showCompanyDescription && exp.company_description && (
                        <Text style={styles.description}>{exp.company_description}</Text>
                      )}
                      
                      {(showKeyAchievements && exp.key_achievements && exp.key_achievements.length > 0) && (
                        <View style={styles.achievementContainer}>
                          <Text style={styles.achievementTitle}>Key Achievements</Text>
                          {exp.key_achievements.map((item, i) => (
                            <View key={i} style={styles.bulletPoint}>
                              <Text style={styles.bullet}>•</Text>
                              <Text style={styles.description}>{item}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      
                      {showResponsibilities && exp.responsibilities && exp.responsibilities.length > 0 && (
                        <View>
                          {exp.responsibilities.map((item, i) => (
                            <View key={i} style={styles.bulletPoint}>
                              <Text style={styles.bullet}>•</Text>
                              <Text style={styles.description}>{item}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Education */}
              {resume.education && resume.education.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Education</Text>
                  </View>
                  {resume.education.map((edu, index) => (
                    <View key={index} style={styles.educationItem}>
                      <View style={styles.educationHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.institution}>{edu.institution}</Text>
                          <Text style={styles.degree}>{edu.degree} {edu.field}</Text>
                        </View>
                        <View>
                                          {(edu.start_date || edu.end_date) && (
                  <Text style={styles.educationDates}>
                    {formatDateRange(edu.start_date, edu.end_date)}
                  </Text>
                )}
                        </View>
                      </View>
                      {edu.relevant_coursework && Array.isArray(edu.relevant_coursework) && edu.relevant_coursework.length > 0 && (
                        <Text style={styles.details}>Relevant Coursework: {edu.relevant_coursework.join(', ')}</Text>
                      )}
                      {edu.other_details && Array.isArray(edu.other_details) && edu.other_details.length > 0 && (
                        <Text style={styles.details}>{edu.other_details.join(', ')}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Key Projects */}
              {resume.projects && resume.projects.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Key Projects</Text>
                  </View>
                  <View style={styles.projectGrid}>
                    {resume.projects.map((project, index) => (
                      <View key={index} style={styles.projectItem}>
                        <Text style={styles.projectTitle}>{project.title}</Text>
                        {project.description && (
                          <Text style={styles.projectDescription}>{project.description}</Text>
                        )}
                                        {(project.start_date || project.end_date) && (
                  <Text style={styles.projectDates}>
                    {formatDateRange(project.start_date, project.end_date)}
                  </Text>
                )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
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
