'use client';

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ResumeTemplate } from './TemplateBase';
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
    fontSize: 11,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
    lineHeight: 1.3,
  },
  header: {
    textAlign: "center",
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 20,
    marginBottom: 24,
  },
  name: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: 1,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    marginBottom: 16,
    color: "#4a4a4a",
    fontWeight: 500,
  },
  contact: {
    fontSize: 10,
    color: "#666666",
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "0.5px solid #e0e0e0",
    paddingBottom: 4,
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  company: {
    fontSize: 11,
    color: "#4a4a4a",
    fontWeight: 500,
    marginBottom: 8,
  },
  achievementList: {
    marginLeft: 16,
    marginBottom: 16,
  },
  achievementItem: {
    fontSize: 11,
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  bullet: {
    fontSize: 8,
    marginRight: 8,
  },
  skillsGrid: {
    flexDirection: "column",
    gap: 8,
  },
  skillCategory: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  skillCategoryTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1a1a1a",
    marginRight: 8,
    width: 80,
  },
  skillList: {
    fontSize: 11,
    color: "#4a4a4a",
    flex: 1,
    lineHeight: 1.4,
  },
  degree: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  institution: {
    fontSize: 11,
    color: "#4a4a4a",
    marginBottom: 16,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 11,
    color: "#4a4a4a",
    lineHeight: 1.4,
    marginBottom: 16,
  },
  summary: {
    fontSize: 11,
    color: "#1a1a1a",
    lineHeight: 1.4,
    marginBottom: 0,
  },
});

const CleanPDFDocument = ({ resume }: { resume: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{resume.full_name.toUpperCase()}</Text>
        <Text style={styles.title}>Software Engineer</Text>
        <View style={styles.contact}>
          <Text>
            {resume.email} • {resume.phone_number} • {resume.address}
          </Text>
          {(resume.linkedin || resume.website) && (
            <Text>
              {resume.linkedin && cleanLinkedInUrl(resume.linkedin)}
              {resume.linkedin && resume.website && " • "}
              {resume.website}
            </Text>
          )}
        </View>
      </View>

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
            <View key={index} style={{ marginBottom: 16 }}>
              <Text style={styles.jobTitle}>{exp.position}</Text>
              <Text style={styles.company}>
                {exp.company} • {exp.location} • {formatDateRange(exp.start_date, exp.end_date)}
              </Text>
              <View style={styles.achievementList}>
                {exp.key_achievements?.map((achievement: string, i: number) => (
                  <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.achievementItem}>{achievement}</Text>
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
              <Text style={styles.institution}>
                {edu.institution} • {formatDateRange(edu.start_date, edu.end_date)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Technical Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          <View style={styles.skillsGrid}>
            {/* Group skills by level/category */}
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>Skills:</Text>
              <Text style={styles.skillList}>
                {resume.skills.map((skill: any) => skill.name).join(", ")}
              </Text>
            </View>
          </View>
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
                {project.start_date && ` • ${formatDateRange(project.start_date, project.end_date)}`}
              </Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {resume.certifications.map((cert: any, index: number) => (
            <Text key={index} style={styles.achievementItem}>
              {cert.name}
              {cert.organization && ` • ${cert.organization}`}
            </Text>
          ))}
        </View>
      )}

      {/* Languages */}
      {resume.languages && resume.languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.skillList}>
            {resume.languages.map((lang: any) => `${lang.name} (${lang.level})`).join(", ")}
          </Text>
        </View>
      )}
    </Page>
  </Document>
);

export const CleanTemplate: ResumeTemplate = {
  id: "clean",
  name: "Clean",
  description: "Simple single-column layout with clean typography",
  style: {
    layout: "Single Column",
    theme: "Professional",
  },
  render: CleanPDFDocument,
};