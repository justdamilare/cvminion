import React, { useState, useCallback } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Star, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Award,
  Languages,
  FolderOpen
} from 'lucide-react';
import { Profile, CreateProfileData } from '../../types/profile';
import { EditableField } from '../ui/EditableField';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
  isComplete: (data: Partial<Profile>) => boolean;
}

interface GuidedProfileWizardProps {
  profile: Profile | null;
  onUpdate: (data: Partial<Profile>) => Promise<void>;
  onComplete?: () => void;
  isNewUser?: boolean;
}

export const GuidedProfileWizard: React.FC<GuidedProfileWizardProps> = ({
  profile,
  onUpdate,
  onComplete,
  isNewUser = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<Partial<Profile>>(profile || {});
  const [saving, setSaving] = useState(false);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (data: Partial<Profile>) => {
    try {
      setSaving(true);
      await onUpdate(data);
      setProfileData(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [onUpdate]);

  // Personal Information Step Component
  const PersonalInfoStep: React.FC<{ data: Partial<Profile>; onChange: (data: Partial<Profile>) => void }> = ({ 
    data, 
    onChange 
  }) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Let's start with the basics</h2>
        <p className="text-gray-400">Tell us about yourself so we can create your professional profile</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
            <input
              type="text"
              value={data.full_name || ''}
              onChange={(e) => onChange({ full_name: e.target.value })}
              className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={data.phone_number || ''}
              onChange={(e) => onChange({ phone_number: e.target.value })}
              className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Professional Title *</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
              placeholder="Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
            <input
              type="text"
              value={data.address || ''}
              onChange={(e) => onChange({ address: e.target.value })}
              className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
              placeholder="San Francisco, CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Profile</label>
            <input
              type="url"
              value={data.linkedin || ''}
              onChange={(e) => onChange({ linkedin: e.target.value })}
              className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Professional Summary Step Component
  const SummaryStep: React.FC<{ data: Partial<Profile>; onChange: (data: Partial<Profile>) => void }> = ({ 
    data, 
    onChange 
  }) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Tell your professional story</h2>
        <p className="text-gray-400">Write a compelling summary that highlights your key strengths and career objectives</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Professional Summary * 
          <span className="text-xs text-gray-500 ml-2">
            ({(data.summary || '').length}/500 characters)
          </span>
        </label>
        <textarea
          value={data.summary || ''}
          onChange={(e) => onChange({ summary: e.target.value })}
          className="w-full h-40 bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none border border-gray-700"
          placeholder="I am a passionate software engineer with 5+ years of experience in full-stack development. I specialize in React, Node.js, and cloud technologies, with a track record of delivering high-quality solutions that drive business growth..."
          maxLength={500}
        />
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-2">💡 Tips for a great summary:</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Start with your current role and years of experience</li>
          <li>• Highlight your key skills and technologies</li>
          <li>• Mention notable achievements or projects</li>
          <li>• End with your career goals or what you're looking for</li>
        </ul>
      </div>
    </div>
  );

  // Experience Step Component
  const ExperienceStep: React.FC<{ data: Partial<Profile>; onChange: (data: Partial<Profile>) => void }> = ({ 
    data, 
    onChange 
  }) => {
    const [newExperience, setNewExperience] = useState({
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      company_description: '',
      highlights: ['']
    });

    const addExperience = () => {
      if (newExperience.company && newExperience.position) {
        const experience = data.experience || [];
        onChange({
          experience: [...experience, {
            id: crypto.randomUUID(),
            ...newExperience,
            highlights: newExperience.highlights.filter(h => h.trim())
          }]
        });
        setNewExperience({
          company: '',
          position: '',
          start_date: '',
          end_date: '',
          company_description: '',
          highlights: ['']
        });
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Briefcase className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Share your work experience</h2>
          <p className="text-gray-400">Add your most recent and relevant work experiences</p>
        </div>

        {/* Existing experiences */}
        {data.experience && data.experience.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white">Your Experiences</h3>
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">{exp.position}</h4>
                  <button
                    onClick={() => {
                      const updatedExp = data.experience!.filter((_, i) => i !== index);
                      onChange({ experience: updatedExp });
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-gray-300">{exp.company}</p>
                <p className="text-gray-400 text-sm">
                  {exp.start_date} - {exp.end_date || 'Present'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add new experience form */}
        <div className="bg-dark-light rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add Work Experience</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
              <input
                type="text"
                value={newExperience.company}
                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
                placeholder="Google"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Position *</label>
              <input
                type="text"
                value={newExperience.position}
                onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
                placeholder="Senior Software Engineer"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
              <input
                type="month"
                value={newExperience.start_date}
                onChange={(e) => setNewExperience(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="month"
                value={newExperience.end_date}
                onChange={(e) => setNewExperience(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
                placeholder="Leave empty if current"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Company Description</label>
            <textarea
              value={newExperience.company_description}
              onChange={(e) => setNewExperience(prev => ({ ...prev, company_description: e.target.value }))}
              className="w-full h-24 bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none border border-gray-700"
              placeholder="Brief description of the company and your role..."
            />
          </div>

          <button
            onClick={addExperience}
            disabled={!newExperience.company || !newExperience.position}
            className="w-full bg-primary text-dark font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Experience
          </button>
        </div>
      </div>
    );
  };

  // Skills Step Component
  const SkillsStep: React.FC<{ data: Partial<Profile>; onChange: (data: Partial<Profile>) => void }> = ({ 
    data, 
    onChange 
  }) => {
    const [skillInput, setSkillInput] = useState('');
    
    const addSkill = () => {
      if (skillInput.trim()) {
        const skills = data.skills || [];
        onChange({
          skills: [...skills, {
            id: crypto.randomUUID(),
            name: skillInput.trim(),
            level: 'intermediate'
          }]
        });
        setSkillInput('');
      }
    };

    const removeSkill = (index: number) => {
      const skills = data.skills || [];
      onChange({ skills: skills.filter((_, i) => i !== index) });
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Star className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Showcase your skills</h2>
          <p className="text-gray-400">Add the technical and soft skills that make you stand out</p>
        </div>

        <div className="bg-dark-light rounded-lg p-6 border border-gray-700">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 bg-dark text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-700"
              placeholder="Add a skill (e.g., React, Project Management, Python)"
            />
            <button
              onClick={addSkill}
              disabled={!skillInput.trim()}
              className="bg-primary text-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {data.skills && data.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-full"
                >
                  <span>{skill.name}</span>
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-gray-400 hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">💡 Skill suggestions:</h4>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Project Management', 'Leadership', 'Communication'].map(skill => (
                <button
                  key={skill}
                  onClick={() => setSkillInput(skill)}
                  className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Define wizard steps
  const steps: WizardStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic contact details and professional title',
      icon: User,
      component: PersonalInfoStep,
      isComplete: (data) => !!(data.full_name && data.email && data.phone_number && data.title)
    },
    {
      id: 'summary',
      title: 'Professional Summary',
      description: 'Tell your professional story',
      icon: FileText,
      component: SummaryStep,
      isComplete: (data) => !!(data.summary && data.summary.length > 50)
    },
    {
      id: 'experience',
      title: 'Work Experience',
      description: 'Your professional background',
      icon: Briefcase,
      component: ExperienceStep,
      isComplete: (data) => !!(data.experience && data.experience.length > 0)
    },
    {
      id: 'skills',
      title: 'Skills & Expertise',
      description: 'Showcase your abilities',
      icon: Star,
      component: SkillsStep,
      isComplete: (data) => !!(data.skills && data.skills.length >= 3)
    }
  ];

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;

  const handleNext = async () => {
    await autoSave(profileData);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateStepData = (data: Partial<Profile>) => {
    const updatedData = { ...profileData, ...data };
    setProfileData(updatedData);
    // Auto-save after a short delay
    setTimeout(() => autoSave(updatedData), 1000);
  };

  const isCurrentStepComplete = currentStepData.isComplete(profileData);
  const completedSteps = steps.filter(step => step.isComplete(profileData)).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isNewUser ? 'Welcome! Let\'s build your profile' : 'Profile Setup Wizard'}
            </h1>
            <p className="text-gray-400">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Overall Progress</div>
            <div className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.isComplete(profileData);
            const isCurrent = index === currentStep;
            
            return (
              <div 
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                onClick={() => index <= currentStep && setCurrentStep(index)}
              >
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-primary border-primary text-dark' 
                    : 'bg-gray-800 border-gray-600 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <div className={`text-xs text-center ${
                  isCurrent ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-dark-light rounded-xl p-8 border border-gray-700 mb-8">
        <StepComponent 
          data={profileData} 
          onChange={updateStepData}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-4">
          {saving && (
            <div className="text-sm text-gray-400">Saving...</div>
          )}
          
          <button
            onClick={handleNext}
            disabled={!isCurrentStepComplete}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};