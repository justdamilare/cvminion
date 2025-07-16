import React, { useState } from 'react';
import { Save, X, Plus, Trash2, User, Mail, Phone, MapPin, Edit3, Briefcase, GraduationCap, Award, Code, Globe, FolderOpen } from 'lucide-react';
import { Application } from '../../types/application';
import { toast } from 'react-hot-toast';

interface ResumeEditorProps {
  resume: NonNullable<Application['generatedResume']>['tailored_resume'];
  onSave: (resume: NonNullable<Application['generatedResume']>['tailored_resume']) => Promise<void>;
  onCancel: () => void;
}

type TabType = 'basic' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages';

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  onSave,
  onCancel,
}) => {
  const [editedResume, setEditedResume] = useState(resume);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const tabs: Array<{ id: TabType; label: string; icon: any; count?: number }> = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase, count: editedResume.experience?.length || 0 },
    { id: 'education', label: 'Education', icon: GraduationCap, count: editedResume.education?.length || 0 },
    { id: 'skills', label: 'Skills', icon: Code, count: editedResume.skills?.length || 0 },
    { id: 'projects', label: 'Projects', icon: FolderOpen, count: editedResume.projects?.length || 0 },
    { id: 'certifications', label: 'Certifications', icon: Award, count: editedResume.certifications?.length || 0 },
    { id: 'languages', label: 'Languages', icon: Globe, count: editedResume.languages?.length || 0 },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(editedResume);
      toast.success('Resume updated successfully');
    } catch (err) {
      console.error('Failed to update resume:', err);
      toast.error('Failed to update resume');
    } finally {
      setLoading(false);
    }
  };

  const updateExperience = (index: number, field: keyof NonNullable<Application['generatedResume']>['tailored_resume']['experience'][0], value: string | string[]) => {
    setEditedResume(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const updateEducation = (index: number, field: keyof NonNullable<Application['generatedResume']>['tailored_resume']['education'][0], value: string | string[]) => {
    setEditedResume(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addLanguage = () => {
    setEditedResume(prev => ({
      ...prev,
      languages: [...(prev.languages || []), { name: '', level: 'Intermediate' }]
    }));
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    setEditedResume(prev => ({
      ...prev,
      languages: (prev.languages || []).map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const removeLanguage = (index: number) => {
    setEditedResume(prev => ({
      ...prev,
      languages: (prev.languages || []).filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    setEditedResume(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 'Intermediate' }]
    }));
  };

  const updateSkill = (index: number, field: string, value: string) => {
    setEditedResume(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (index: number) => {
    setEditedResume(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    setEditedResume(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { 
        title: '', 
        description: '',
        start_date: '',
        end_date: ''
      }]
    }));
  };

  const updateProject = (index: number, field: keyof NonNullable<Application['generatedResume']>['tailored_resume']['projects'][0], value: string) => {
    setEditedResume(prev => ({
      ...prev,
      projects: (prev.projects || []).map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (index: number) => {
    setEditedResume(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setEditedResume(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), { 
        name: '', 
        organization: '',
      }]
    }));
  };

  const updateCertification = (index: number, field: keyof NonNullable<Application['generatedResume']>['tailored_resume']['certifications'][0], value: string) => {
    setEditedResume(prev => ({
      ...prev,
      certifications: (prev.certifications || []).map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index: number) => {
    setEditedResume(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index)
    }));
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={editedResume.full_name}
              onChange={(e) => setEditedResume(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={editedResume.email}
              onChange={(e) => setEditedResume(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={editedResume.phone_number}
              onChange={(e) => setEditedResume(prev => ({ ...prev, phone_number: e.target.value }))}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={editedResume.address}
              onChange={(e) => setEditedResume(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Professional Summary
        </label>
        <textarea
          value={editedResume.summary}
          onChange={(e) => setEditedResume(prev => ({ ...prev, summary: e.target.value }))}
          className="w-full h-32 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors resize-none"
          placeholder="Write a compelling professional summary..."
        />
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Work Experience
        </h3>
        <button
          onClick={() => setEditedResume(prev => ({
            ...prev,
            experience: [...prev.experience, {
              position: '',
              company: '',
              company_description: '',
              start_date: '',
              end_date: '',
              location: '',
              key_achievements: [],
              responsibilities: []
            }]
          }))}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      <div className="space-y-6">
        {editedResume.experience.map((exp, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Experience #{index + 1}
              </h4>
              <button
                onClick={() => setEditedResume(prev => ({
                  ...prev,
                  experience: prev.experience.filter((_, i) => i !== index)
                }))}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., Google"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={exp.start_date}
                    onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., Jan 2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={exp.end_date}
                    onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., Present"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Description
              </label>
              <textarea
                value={exp.company_description}
                onChange={(e) => updateExperience(index, 'company_description', e.target.value)}
                className="w-full h-20 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="Brief description of the company..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Achievements
              </label>
              <textarea
                value={exp.key_achievements.join('\n')}
                onChange={(e) => updateExperience(index, 'key_achievements', e.target.value.split('\n').filter(line => line.trim()))}
                className="w-full h-32 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="• Increased team productivity by 40%&#10;• Led migration to microservices architecture&#10;• Mentored 5 junior developers"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">One achievement per line</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsibilities
              </label>
              <textarea
                value={exp.responsibilities.join('\n')}
                onChange={(e) => updateExperience(index, 'responsibilities', e.target.value.split('\n').filter(line => line.trim()))}
                className="w-full h-32 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="• Developed and maintained web applications&#10;• Collaborated with cross-functional teams&#10;• Conducted code reviews and testing"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">One responsibility per line</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education
        </h3>
        <button
          onClick={() => setEditedResume(prev => ({
            ...prev,
            education: [...prev.education, {
              degree: '',
              field: '',
              institution: '',
              start_date: '',
              end_date: '',
              relevant_coursework: [],
              other_details: []
            }]
          }))}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      <div className="space-y-6">
        {editedResume.education.map((edu, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Education #{index + 1}
              </h4>
              <button
                onClick={() => setEditedResume(prev => ({
                  ...prev,
                  education: prev.education.filter((_, i) => i !== index)
                }))}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Degree
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., Stanford University"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={edu.start_date}
                    onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., Sep 2016"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={edu.end_date}
                    onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., May 2020"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Relevant Coursework
              </label>
              <textarea
                value={(edu.relevant_coursework || []).join('\n')}
                onChange={(e) => updateEducation(index, 'relevant_coursework', e.target.value.split('\n').filter(line => line.trim()))}
                className="w-full h-24 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="• Data Structures and Algorithms&#10;• Machine Learning&#10;• Software Engineering"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">One course per line</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Other Details
              </label>
              <textarea
                value={(edu.other_details || []).join('\n')}
                onChange={(e) => updateEducation(index, 'other_details', e.target.value.split('\n').filter(line => line.trim()))}
                className="w-full h-24 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="• GPA: 3.8/4.0&#10;• Dean's List&#10;• Magna Cum Laude"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">One detail per line</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Code className="w-5 h-5" />
          Skills & Technologies
        </h3>
        <button
          onClick={addSkill}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editedResume.skills.map((skill, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={skill.name}
                onChange={(e) => updateSkill(index, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                placeholder="e.g., React, Python, AWS"
              />
              <select
                value={skill.level}
                onChange={(e) => updateSkill(index, 'level', e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                onClick={() => removeSkill(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editedResume.skills.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No skills added yet. Click "Add Skill" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Projects
        </h3>
        <button
          onClick={addProject}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-6">
        {(editedResume.projects || []).map((project, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Project #{index + 1}
              </h4>
              <button
                onClick={() => removeProject(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., E-commerce Platform"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={project.start_date || ''}
                    onChange={(e) => updateProject(index, 'start_date', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., Jan 2023"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={project.end_date || ''}
                    onChange={(e) => updateProject(index, 'end_date', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., Present"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={project.description}
                onChange={(e) => updateProject(index, 'description', e.target.value)}
                className="w-full h-32 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="Describe your project, technologies used, and key achievements..."
              />
            </div>
          </div>
        ))}
      </div>

      {(!editedResume.projects || editedResume.projects.length === 0) && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No projects added yet. Click "Add Project" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5" />
          Certifications & Awards
        </h3>
        <button
          onClick={addCertification}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      <div className="space-y-4">
        {(editedResume.certifications || []).map((cert, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., AWS Solutions Architect"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={cert.organization || ''}
                    onChange={(e) => updateCertification(index, 'organization', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>
              </div>
              <button
                onClick={() => removeCertification(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!editedResume.certifications || editedResume.certifications.length === 0) && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No certifications added yet. Click "Add Certification" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderLanguages = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Languages
        </h3>
        <button
          onClick={addLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Language
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(editedResume.languages || []).map((language, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={language.name}
                onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
                placeholder="e.g., English, Spanish, French"
              />
              <select
                value={language.level}
                onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-colors"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
                <option value="Native">Native</option>
              </select>
              <button
                onClick={() => removeLanguage(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!editedResume.languages || editedResume.languages.length === 0) && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No languages added yet. Click "Add Language" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      case 'projects':
        return renderProjects();
      case 'certifications':
        return renderCertifications();
      case 'languages':
        return renderLanguages();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-6 h-6" />
              Edit Resume
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customize your resume content and structure
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-all shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderCurrentTab()}
        </div>
      </div>
    </div>
  );
};
