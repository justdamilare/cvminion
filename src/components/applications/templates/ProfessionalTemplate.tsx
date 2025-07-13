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
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottom: "2px solid #E0E0E0",
    paddingBottom: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    color: "#000000",
    letterSpacing: 0.5,
    marginBottom: 3,
    lineHeight: 1.2,
  },
  title: {
    fontSize: 11,
    fontWeight: 400,
    color: "#666666",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 10,
  },
  contactItem: {
    fontSize: 10,
    color: "#333333",
    marginRight: 15,
    marginBottom: 2,
  },
  section: {
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    backgroundColor: "#E8E8E8",
    padding: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#333333",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  experienceItem: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  companyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
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
    marginBottom: 1,
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
  },
  description: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.3,
    marginBottom: 4,
  },
  bulletContainer: {
    paddingLeft: 10,
    marginTop: 3,
  },
  bulletPoint: {
    fontSize: 9,
    color: "#333333",
    marginBottom: 2,
    lineHeight: 1.3,
    flexDirection: "row",
  },
  bullet: {
    marginRight: 8,
    color: "#666666",
    fontSize: 8,
  },
  educationItem: {
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
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
    marginBottom: 1,
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
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skill: {
    fontSize: 10,
    color: "#333333",
    backgroundColor: "#F8F8F8",
    padding: "4 8",
    marginRight: 8,
    marginBottom: 4,
  },
  twoColumnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftColumn: {
    width: "48%",
  },
  rightColumn: {
    width: "48%",
  },
  projectItem: {
    marginBottom: 12,
    backgroundColor: "#F5F5F5",
    padding: 8,
  },
  projectTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#000000",
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  projectDates: {
    fontSize: 9,
    color: "#666666",
  },
  certItem: {
    marginBottom: 8,
    backgroundColor: "#F8F8F8",
    padding: 6,
  },
  certTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#000000",
    marginBottom: 2,
  },
  certIssuer: {
    fontSize: 10,
    color: "#666666",
  },
});

export const ProfessionalTemplate: ResumeTemplate = {
  id: 'professional',
  name: 'Professional',
  description: 'Clean single-column with gray section headers',
  preview: '',
  style: {
    name: 'Professional',
    description: 'Professional design with structured gray section headers',
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
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>{resume.full_name || 'Name not provided'}</Text>
            {resume.experience && resume.experience.length > 0 && resume.experience[0].position && (
              <Text style={styles.title}>{resume.experience[0].position}</Text>
            )}
            <View style={styles.contactInfo}>
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
          </View>

          {/* Summary */}
          {resume.summary && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Executive Summary</Text>
              </View>
              <Text style={styles.description}>{resume.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {resume.experience && resume.experience.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Professional Experience</Text>
              </View>
              {resume.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.companyHeader}>
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
                  <View style={styles.bulletContainer}>
                    {showKeyAchievements && exp.key_achievements && exp.key_achievements.map((item, i) => (
                      <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.description}>{item}</Text>
                      </View>
                    ))}
                    {showResponsibilities && exp.responsibilities && exp.responsibilities.map((item, i) => (
                      <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.description}>{item}</Text>
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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Education & Qualifications</Text>
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

          {/* Two Column Section for Skills and Languages */}
          <View style={styles.twoColumnContainer}>
            {/* Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <View style={[styles.section, styles.leftColumn]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Core Competencies</Text>
                </View>
                <View style={styles.skillsGrid}>
                  {resume.skills.map((skill, index) => (
                    <Text key={index} style={styles.skill}>
                      {skill.name}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Languages */}
            {resume.languages && resume.languages.length > 0 && (
              <View style={[styles.section, styles.rightColumn]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Languages</Text>
                </View>
                <View style={styles.skillsGrid}>
                  {resume.languages.map((language, index) => (
                    <Text key={index} style={styles.skill}>
                      {language.name} - {language.level}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Key Projects</Text>
              </View>
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
          )}

          {/* Certifications */}
          {resume.certifications && resume.certifications.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Professional Certifications</Text>
              </View>
              <View style={styles.twoColumnContainer}>
                {resume.certifications.map((cert, index) => (
                  <View key={index} style={[styles.certItem, { width: "48%", marginRight: index % 2 === 0 ? "4%" : 0 }]}>
                    <Text style={styles.certTitle}>{cert.name}</Text>
                    {cert.organization && (
                      <Text style={styles.certIssuer}>{cert.organization}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
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
