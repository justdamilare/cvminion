'use client';

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ResumeTemplate, calculateDynamicPageHeight } from './TemplateBase';
import { formatDateRange } from './dateUtils';
import { getContactWithIcon, cleanLinkedInUrl } from './contactIcons';

// Register fonts
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://zhlpovxcsalhfxzjfcun.supabase.co/storage/v1/object/public/fonts/Inter/static/Inter_18pt-Regular.ttf",
    },
    {
      src: "https://zhlpovxcsalhfxzjfcun.supabase.co/storage/v1/object/public/fonts/Inter/static/Inter_18pt-SemiBold.ttf",
      fontWeight: 600,
    },
    {
      src: "https://zhlpovxcsalhfxzjfcun.supabase.co/storage/v1/object/public/fonts/Inter/static/Inter_18pt-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
    overflow: "hidden", // Standard overflow handling
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: 20,
  },
  name: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: 1,
    color: "#1a1a1a",
  },
  title: {
    fontSize: 14,
    marginTop: 8,
    color: "#666",
    fontWeight: 600,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    gap: 15,
  },
  contactItem: {
    fontSize: 10,
    color: "#666",
  },
  link: {
    color: "#1a1a1a",
    textDecoration: "none",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#1a1a1a",
    borderBottom: "1px solid #f0f0f0",
    paddingBottom: 5,
  },
  experienceItem: {
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  company: {
    fontSize: 12,
    color: "#666",
  },
  period: {
    fontSize: 10,
    color: "#666",
    marginBottom: 8,
    marginTop: 2,
  },
  description: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#333",
  },
  bulletPoint: {
    marginBottom: 4,
    flexDirection: "row",
  },
  bullet: {
    marginRight: 5,
    color: "#666",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skill: {
    fontSize: 9,
    padding: "4 8",
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
    color: "#333",
  },
  educationItem: {
    marginBottom: 12,
  },
  degree: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  institution: {
    fontSize: 11,
    color: "#666",
  },
  projectItem: {
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  divider: {
    borderBottom: "1px solid #f0f0f0",
    marginVertical: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  gridItem: {
    width: "48%",
  },
});

export const ModernTemplate: ResumeTemplate = {
  id: 'modern',
  name: 'Modern',
  description: 'Clean, modern design with flexible layout',
  preview: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400&q=80',
  style: {
    name: 'Modern',
    description: 'Contemporary design with emphasis on readability',
    preview: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400&q=80',
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
    const dynamicHeight = calculateDynamicPageHeight(resume);
    
    return (
      <Document>
        <Page 
          size={[595.28, dynamicHeight]} // Dynamic height based on content
          style={styles.page}
        >
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
                <Text style={styles.contactItem}>
                  <Text style={styles.link}>{getContactWithIcon('website', resume.website.replace(/^https?:\/\//, ""), 'simple')}</Text>
                </Text>
              )}
              {resume.linkedin && (
                <Text style={styles.contactItem}>
                  <Text style={styles.link}>{getContactWithIcon('linkedin', cleanLinkedInUrl(resume.linkedin), 'simple')}</Text>
                </Text>
              )}
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              {/* Summary */}
              {resume.summary && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Profile</Text>
                  <Text style={styles.description}>{resume.summary}</Text>
                </View>
              )}

              {/* Experience */}
              {resume.experience && resume.experience.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Experience</Text>
                  {resume.experience.map((exp, index) => (
                    <View key={index} style={styles.experienceItem}>
                      <Text>
                        <Text style={styles.jobTitle}>{exp.position}</Text>
                        <Text style={styles.company}>, {exp.company}</Text>
                      </Text>
                                    {(exp.start_date || exp.end_date) && (
                <Text style={styles.period}>
                  {formatDateRange(exp.start_date, exp.end_date)}
                </Text>
              )}
                      {showCompanyDescription && exp.company_description && (
                        <Text style={styles.description}>{exp.company_description}</Text>
                      )}
                      {showKeyAchievements && exp.key_achievements?.map((item, i) => (
                        <View key={i} style={styles.bulletPoint}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.description}>{item}</Text>
                        </View>
                      ))}
                      {showResponsibilities && exp.responsibilities?.map((item, i) => (
                        <View key={i} style={styles.bulletPoint}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.description}>{item}</Text>
                        </View>
                      ))}
                      {index < resume.experience.length - 1 && <View style={styles.divider} />}
                    </View>
                  ))}
                </View>
              )}

              {/* Projects */}
              {resume.projects && resume.projects.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Projects</Text>
                  {resume.projects.map((project, index) => (
                    <View key={index} style={styles.projectItem}>
                      <Text style={styles.projectTitle}>{project.title}</Text>
                      {project.description && (
                        <Text style={styles.description}>{project.description}</Text>
                      )}
                                    {(project.start_date || project.end_date) && (
                <Text style={styles.period}>
                  {formatDateRange(project.start_date, project.end_date)}
                </Text>
              )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.gridItem}>
              {/* Education */}
              {resume.education && resume.education.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Education</Text>
                  {resume.education.map((edu, index) => (
                    <View key={index} style={styles.educationItem}>
                      <Text style={styles.degree}>{edu.degree}</Text>
                      <Text style={styles.degree}>{edu.field}</Text>
                      <Text style={styles.institution}>{edu.institution}</Text>
                                    {(edu.start_date || edu.end_date) && (
                <Text style={styles.period}>
                  {formatDateRange(edu.start_date, edu.end_date)}
                </Text>
              )}
                      {edu.other_details && Array.isArray(edu.other_details) && edu.other_details.length > 0 && (
                        <Text style={styles.description}>{edu.other_details.join(', ')}</Text>
                      )}
                      {index < resume.education.length - 1 && <View style={styles.divider} />}
                    </View>
                  ))}
                </View>
              )}

              {/* Skills */}
              {resume.skills && resume.skills.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <View style={styles.skillsContainer}>
                    {resume.skills.map((skill, index) => (
                      <Text key={index} style={styles.skill}>
                        {skill.name} ({skill.level})
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {/* Languages */}
              {resume.languages && resume.languages.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Languages</Text>
                  {resume.languages.map((language, index) => (
                    <View key={index} style={styles.bulletPoint}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.description}>
                        {language.name} - {language.level}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Certifications */}
              {resume.certifications && resume.certifications.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Certifications</Text>
                  {resume.certifications.map((certification, index) => (
                    <View key={index} style={styles.bulletPoint}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.description}>
                        {certification.name}{certification.organization ? ` - ${certification.organization}` : ''}
                      </Text>
                    </View>
                  ))}
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
