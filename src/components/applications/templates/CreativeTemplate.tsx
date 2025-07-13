'use client';

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ResumeTemplate } from './TemplateBase';
import { formatDateRange } from './dateUtils';
import { getContactWithIcon, cleanLinkedInUrl } from './contactIcons';

// Register fonts
Font.register({
  family: "Poppins",
  fonts: [
    { 
      src: "https://zhlpovxcsalhfxzjfcun.supabase.co/storage/v1/object/public/fonts/Poppins/Poppins-Regular.ttf" 
    },
    { 
      src: "https://zhlpovxcsalhfxzjfcun.supabase.co/storage/v1/object/public/fonts/Poppins/Poppins-Medium.ttf", 
      fontWeight: 500 
    },
    { 
      src: "https://zhlpovxcsalhfxzjfcun.supabase.co/storage/v1/object/public/fonts/Poppins/Poppins-Bold.ttf", 
      fontWeight: 700 
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Poppins",
    fontSize: 10,
    color: "#333",
    flexDirection: "row",
  },
  sidebar: {
    width: "35%",
    backgroundColor: "#6366f1",
    color: "white",
    padding: 20,
  },
  mainContent: {
    width: "65%",
    padding: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 5,
    marginTop: 20,
  },
  title: {
    fontSize: 12,
    marginBottom: 20,
    opacity: 0.8,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
    paddingBottom: 5,
  },
  contactInfo: {
    marginBottom: 5,
  },
  contactItem: {
    marginBottom: 8,
    fontSize: 9,
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    color: "#6366f1",
  },
  experienceItem: {
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 700,
  },
  company: {
    fontSize: 11,
    fontWeight: 500,
  },
  period: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 5,
  },
  description: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  bulletPoint: {
    marginBottom: 3,
    flexDirection: "row",
  },
  bullet: {
    marginRight: 5,
    color: "#666",
  },
  skillBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  skillName: {
    width: "40%",
    fontSize: 9,
  },
  skillLevel: {
    width: "60%",
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
  },
  skillFill: {
    height: 5,
    backgroundColor: "white",
    borderRadius: 3,
  },
  educationItem: {
    marginBottom: 10,
  },
  degree: {
    fontSize: 12,
    fontWeight: 700,
  },
  school: {
    fontSize: 11,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366f1",
    marginRight: 10,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  timelineContent: {
    flex: 1,
  },
  projectItem: {
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6366f1",
  },
});

export const CreativeTemplate: ResumeTemplate = {
  id: 'creative',
  name: 'Creative',
  description: 'Bold and modern design with sidebar layout',
  preview: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400&q=80',
  style: {
    name: 'Creative',
    description: 'Creative design with color accent and timeline',
    preview: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400&q=80',
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
    
    // Helper function to calculate skill level percentage
    const getSkillLevel = (level: string): number => {
      const lowerLevel = level.toLowerCase();
      if (lowerLevel.includes('expert') || lowerLevel.includes('advanced')) return 90;
      if (lowerLevel.includes('intermediate')) return 60;
      if (lowerLevel.includes('beginner')) return 30;
      return 70; // Default level
    };

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <Text style={styles.name}>{resume.full_name || 'Name not provided'}</Text>
            {resume.experience && resume.experience.length > 0 && resume.experience[0].position && (
              <Text style={styles.title}>{resume.experience[0].position}</Text>
            )}

            {/* Contact Information */}
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Contact</Text>
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

            {/* Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Skills</Text>
                {resume.skills.map((skill, index) => (
                  <View key={index} style={styles.skillBar}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <View style={styles.skillLevel}>
                      <View style={[styles.skillFill, { width: `${getSkillLevel(skill.level)}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            {resume.languages && resume.languages.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Languages</Text>
                {resume.languages.map((language, index) => (
                  <View key={index} style={styles.skillBar}>
                    <Text style={styles.skillName}>{language.name}</Text>
                    <View style={styles.skillLevel}>
                      <View
                        style={[
                          styles.skillFill,
                          {
                            width: language.level.toLowerCase().includes("native")
                              ? "100%"
                              : language.level.toLowerCase().includes("expert")
                              ? "90%"
                              : language.level.toLowerCase().includes("advanced")
                              ? "75%"
                              : language.level.toLowerCase().includes("intermediate")
                              ? "50%"
                              : "30%",
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Certifications</Text>
                {resume.certifications.map((cert, index) => (
                  <View key={index} style={{ marginBottom: 5 }}>
                    <Text style={{ fontSize: 9, fontWeight: 700 }}>
                      {cert.name}
                    </Text>
                    {cert.organization && (
                      <Text style={{ fontSize: 8 }}>{cert.organization}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Summary */}
            {resume.summary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Text style={styles.description}>{resume.summary}</Text>
              </View>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Work Experience</Text>
                {resume.experience.map((exp, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.jobTitle}>{exp.position}</Text>
                      <Text style={styles.company}>{exp.company}</Text>
                                    {(exp.start_date || exp.end_date) && (
                <Text style={styles.period}>
                  {formatDateRange(exp.start_date, exp.end_date)}
                </Text>
              )}
                      {showCompanyDescription && exp.company_description && (
                        <Text style={styles.description}>{exp.company_description}</Text>
                      )}
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
                <Text style={styles.sectionTitle}>Education</Text>
                {resume.education.map((edu, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.degree}>{edu.degree} {edu.field}</Text>
                      <Text style={styles.school}>{edu.institution}</Text>
                                    {(edu.start_date || edu.end_date) && (
                <Text style={styles.period}>
                  {formatDateRange(edu.start_date, edu.end_date)}
                </Text>
              )}
                      {edu.other_details && Array.isArray(edu.other_details) && edu.other_details.length > 0 && (
                        <Text style={styles.description}>{edu.other_details.join(', ')}</Text>
                      )}
                    </View>
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
