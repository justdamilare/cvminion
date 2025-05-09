import { Document, Page, StyleSheet, View, Text } from '@react-pdf/renderer';
import { ResumeTemplate } from './TemplateBase';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    backgroundColor: '#0A0A0A',
    color: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #2A2A2A',
    paddingBottom: 20,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    color: '#A0A0A0',
    marginBottom: 15,
  },
  contact: {
    fontSize: 11,
    color: '#808080',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    borderBottom: '1px solid #2A2A2A',
    paddingBottom: 6,
  },
  experience: {
    marginBottom: 15,
    paddingLeft: 12,
    borderLeft: '2px solid #2A2A2A',
  },
  company: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  role: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#808080',
    marginBottom: 6,
  },
  description: {
    fontSize: 10,
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 1.5,
  },
  bulletPoint: {
    marginBottom: 4,
    paddingLeft: 12,
    position: 'relative',
  },
  skills: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skill: {
    fontSize: 10,
    color: '#FFFFFF',
    backgroundColor: '#2A2A2A',
    padding: '4px 8px',
    borderRadius: 4,
  },
  education: {
    marginBottom: 15,
    paddingLeft: 12,
    borderLeft: '2px solid #2A2A2A',
  },
  degree: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  institution: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  languages: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  language: {
    fontSize: 11,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  languageLevel: {
    fontSize: 10,
    color: '#808080',
  },
  projects: {
    marginBottom: 15,
    paddingLeft: 12,
    borderLeft: '2px solid #2A2A2A',
  },
  projectTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  certifications: {
    marginBottom: 12,
  },
  certification: {
    fontSize: 11,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  organization: {
    fontSize: 10,
    color: '#808080',
  },
});

export const NovaTemplate: ResumeTemplate = {
  id: 'nova',
  name: 'Nova',
  description: 'A sleek, space-inspired design with subtle gradients and modern typography',
  preview: '/templates/nova-preview.png',
  style: {
    name: 'Nova',
    description: 'Space-inspired modern design',
    preview: '/templates/nova-preview.png',
    styles,
    layout: 'single',
    theme: 'dark',
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
  render: ({ resume, options }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.full_name}</Text>
          <Text style={styles.title}>{resume.experience[0]?.position}</Text>
          <View style={styles.contact}>
            <Text>{resume.email}</Text>
            <Text>{resume.phone_number}</Text>
            <Text>{resume.address}</Text>
            {resume.website && <Text>{resume.website}</Text>}
            {resume.linkedin && <Text>{resume.linkedin}</Text>}
          </View>
        </View>

        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.description}>{resume.summary}</Text>
          </View>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, index) => (
              <View key={index} style={styles.experience}>
                <Text style={styles.company}>{exp.company}</Text>
                <Text style={styles.role}>{exp.position}</Text>
                <Text style={styles.date}>
                  {exp.start_date} - {exp.end_date || 'Present'}
                </Text>
                {options?.showCompanyDescription && exp.company_description && (
                  <Text style={styles.description}>{exp.company_description}</Text>
                )}
                {options?.showKeyAchievements && exp.key_achievements && exp.key_achievements.length > 0 && (
                  <View>
                    {exp.key_achievements.map((achievement, i) => (
                      <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.description}>• {achievement}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {options?.showResponsibilities && exp.responsibilities && exp.responsibilities.length > 0 && (
                  <View>
                    {exp.responsibilities.map((responsibility, i) => (
                      <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.description}>• {responsibility}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {resume.education && resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, index) => (
              <View key={index} style={styles.education}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.institution}>{edu.institution}</Text>
                <Text style={styles.date}>
                  {edu.start_date} - {edu.end_date || 'Present'}
                </Text>
                {edu.other_details && (
                  <Text style={styles.description}>{edu.other_details}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skills}>
              {resume.skills.map((skill, index) => (
                <Text key={index} style={styles.skill}>
                  {skill.name} {skill.level && `(${skill.level})`}
                </Text>
              ))}
            </View>
          </View>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.languages}>
              {resume.languages.map((lang, index) => (
                <View key={index}>
                  <Text style={styles.language}>{lang.name}</Text>
                  <Text style={styles.languageLevel}>{lang.level}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, index) => (
              <View key={index} style={styles.projects}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.date}>
                  {project.start_date} - {project.end_date || 'Present'}
                </Text>
                <Text style={styles.description}>{project.description}</Text>
              </View>
            ))}
          </View>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, index) => (
              <View key={index} style={styles.certifications}>
                <Text style={styles.certification}>{cert.name}</Text>
                <Text style={styles.organization}>{cert.organization}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  ),
  defaultOptions: {
    showCompanyDescription: true,
    showKeyAchievements: true,
    showResponsibilities: true,
  },
}; 
