import React, { useState, useCallback, useRef, useMemo } from 'react';
import { 
  User, 
  Briefcase, 
  Star, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  FileText,
  Download,
  Upload,
  Brain,
  Zap
} from 'lucide-react';
import { Profile, CreateProfileData } from '../../types/profile';
import { EditableField } from '../ui/EditableField';
import { LinkedInImport } from './LinkedInImport';
import { PDFResumeImport } from './PDFResumeImport';

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

type ImportChoice = 'manual' | 'linkedin' | 'pdf' | null;

// Move step components outside to prevent re-creation on each render
const PersonalInfoStep: React.FC<{ 
  data: Partial<Profile>; 
  onChange: (data: Partial<Profile>) => void;
  onBlur: (data: Partial<Profile>) => void;
}> = React.memo(({ data, onChange, onBlur }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <User className="w-16 h-16 text-primary mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Let's start with the basics</h2>
      <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Tell us about yourself so we can create your professional profile</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Full Name *</label>
          <input
            type="text"
            value={data.full_name || ''}
            onChange={(e) => onChange({ full_name: e.target.value })}
            onBlur={(e) => onBlur({ full_name: e.target.value })}
            className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Email Address *</label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            onBlur={(e) => onBlur({ email: e.target.value })}
            className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Phone Number *</label>
          <input
            type="tel"
            value={data.phone_number || ''}
            onChange={(e) => onChange({ phone_number: e.target.value })}
            onBlur={(e) => onBlur({ phone_number: e.target.value })}
            className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Professional Title *</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            onBlur={(e) => onBlur({ title: e.target.value })}
            className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
            placeholder="Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Location *</label>
          <input
            type="text"
            value={data.address || ''}
            onChange={(e) => onChange({ address: e.target.value })}
            onBlur={(e) => onBlur({ address: e.target.value })}
            className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
            placeholder="San Francisco, CA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">LinkedIn Profile</label>
          <input
            type="url"
            value={data.linkedin || ''}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            onBlur={(e) => onBlur({ linkedin: e.target.value })}
            className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
      </div>
    </div>
  </div>
));

// Professional Summary Step Component
const SummaryStep: React.FC<{ 
  data: Partial<Profile>; 
  onChange: (data: Partial<Profile>) => void;
  onBlur: (data: Partial<Profile>) => void;
}> = React.memo(({ data, onChange, onBlur }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Tell your professional story</h2>
      <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Write a compelling summary that highlights your key strengths and career objectives (optional)</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
        Professional Summary
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 transition-colors duration-300">
          ({(data.summary || '').length}/500 characters)
        </span>
      </label>
      <textarea
        value={data.summary || ''}
        onChange={(e) => onChange({ summary: e.target.value })}
        onBlur={(e) => onBlur({ summary: e.target.value })}
        className="w-full h-40 bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
        placeholder="I am a passionate software engineer with 5+ years of experience in full-stack development. I specialize in React, Node.js, and cloud technologies, with a track record of delivering high-quality solutions that drive business growth..."
        maxLength={500}
      />
    </div>

    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 transition-colors duration-300">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">💡 Tips for a great summary:</h3>
      <ul className="text-sm text-gray-700 dark:text-gray-400 space-y-1 transition-colors duration-300">
        <li>• Start with your current role and years of experience</li>
        <li>• Highlight your key skills and technologies</li>
        <li>• Mention notable achievements or projects</li>
        <li>• End with your career goals or what you're looking for</li>
      </ul>
    </div>
  </div>
));

export const GuidedProfileWizard: React.FC<GuidedProfileWizardProps> = React.memo(({
  profile,
  onUpdate,
  onComplete,
  isNewUser = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<Partial<Profile>>(profile || {});
  const [importChoice, setImportChoice] = useState<ImportChoice>(null);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileDataRef = useRef<Partial<Profile>>(profile || {});

  // Update ref when profileData changes
  React.useEffect(() => {
    profileDataRef.current = profileData;
  }, [profileData]);

  // Auto-save function that properly saves data
  const autoSave = useCallback(async (data: Partial<Profile>) => {
    try {
      // Use the proper onUpdate function to ensure data is saved correctly
      await onUpdate(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [onUpdate]);

  // Import Choice Step Component
  const ImportChoiceStep: React.FC<{ data: Partial<Profile>; onChange: (data: Partial<Profile>) => void }> = ({ 
    data, 
    onChange 
  }) => {
    const handleImportComplete = async (importedData: Partial<Profile>) => {
      const mergedData = { ...data, ...importedData };
      onChange(mergedData);
      setImportChoice('manual'); // Continue with manual steps after import
      await autoSave(mergedData);
      // Skip to summary step if basic info is complete
      if (importedData.full_name && importedData.email) {
        setCurrentStep(2); // Skip to summary step
      } else {
        setCurrentStep(1); // Go to personal info step
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Quick Setup</h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Import your professional data from LinkedIn or upload your PDF resume to quickly populate your profile.
          </p>
        </div>

        {/* Import Options */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-dark rounded-lg p-6 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white font-semibold text-lg mb-2 transition-colors duration-300">Import from LinkedIn (beta)</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md transition-colors duration-300">
                  Upload your LinkedIn data export to automatically fill in your experience, education, skills, and more.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Instant setup</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Supports ZIP & JSON</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLinkedInModal(true)}
                className="w-full max-w-xs px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Import LinkedIn Data
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-dark rounded-lg p-6 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white font-semibold text-lg mb-2 transition-colors duration-300">Import PDF Resume (beta)</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md transition-colors duration-300">
                  Upload your existing PDF resume and let our AI extract your experience, education, skills, and more automatically.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    <span>AI-powered extraction</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>PDF files only</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPDFModal(true)}
                className="w-full max-w-xs px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Upload PDF Resume
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700 transition-colors duration-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-light text-gray-600 dark:text-gray-400 transition-colors duration-300">or</span>
            </div>
          </div>

          <div className="bg-white dark:bg-dark rounded-lg p-6 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600 dark:text-gray-400 transition-colors duration-300" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white font-semibold text-lg mb-2 transition-colors duration-300">Manual Setup</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md transition-colors duration-300">
                  Fill out your profile step by step with our guided wizard.
                </p>
              </div>
              <button
                onClick={() => {
                  setImportChoice('manual');
                  setCurrentStep(1);
                }}
                className="w-full max-w-xs px-6 py-3 bg-gray-700 dark:bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                Start Manual Setup
              </button>
            </div>
          </div>
        </div>

        {/* Import Modals */}
        {showLinkedInModal && (
          <LinkedInImport 
            onImport={handleImportComplete} 
            onClose={() => setShowLinkedInModal(false)} 
          />
        )}

        {showPDFModal && (
          <PDFResumeImport 
            onImport={handleImportComplete} 
            onClose={() => setShowPDFModal(false)} 
          />
        )}
      </div>
    );
  };



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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Share your work experience</h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Add your most recent and relevant work experiences</p>
        </div>

        {/* Existing experiences */}
        {data.experience && data.experience.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Your Experiences</h3>
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 transition-colors duration-300">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{exp.position}</h4>
                  <button
                    onClick={() => {
                      const updatedExp = data.experience!.filter((_, i) => i !== index);
                      onChange({ experience: updatedExp });
                    }}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{exp.company}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
                  {exp.start_date} - {exp.end_date || 'Present'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add new experience form */}
        <div className="bg-gray-50 dark:bg-dark-light rounded-lg p-6 border border-gray-300 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Add Work Experience</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Company *</label>
              <input
                type="text"
                value={newExperience.company}
                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
                placeholder="Google"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Position *</label>
              <input
                type="text"
                value={newExperience.position}
                onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
                placeholder="Senior Software Engineer"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Start Date *</label>
              <input
                type="month"
                value={newExperience.start_date}
                onChange={(e) => setNewExperience(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">End Date</label>
              <input
                type="month"
                value={newExperience.end_date}
                onChange={(e) => setNewExperience(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
                placeholder="Leave empty if current"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Company Description</label>
            <textarea
              value={newExperience.company_description}
              onChange={(e) => setNewExperience(prev => ({ ...prev, company_description: e.target.value }))}
              className="w-full h-24 bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Showcase your skills</h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Add the technical and soft skills that make you stand out</p>
        </div>

        <div className="bg-gray-50 dark:bg-dark-light rounded-lg p-6 border border-gray-300 dark:border-gray-700 transition-colors duration-300">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
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
                  className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-full transition-colors duration-300"
                >
                  <span>{skill.name}</span>
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-gray-600 dark:text-gray-400 hover:text-red-500 ml-1 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg transition-colors duration-300">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">💡 Skill suggestions:</h4>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Project Management', 'Leadership', 'Communication'].map(skill => (
                <button
                  key={skill}
                  onClick={() => setSkillInput(skill)}
                  className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
      id: 'import',
      title: 'Quick Setup',
      description: 'Choose how to build your profile',
      icon: Zap,
      component: ImportChoiceStep,
      isComplete: (data) => importChoice !== null
    },
    {
      id: 'personal',
      title: 'Personal Info',
      description: 'Basic contact details and professional title',
      icon: User,
      component: PersonalInfoStep,
      isComplete: (data) => !!(data.full_name && data.email && data.phone_number && data.title)
    },
    {
      id: 'summary',
      title: 'Summary',
      description: 'Tell your professional story (optional)',
      icon: FileText,
      component: SummaryStep,
      isComplete: () => true // Make summary optional
    },
    {
      id: 'experience',
      title: 'Experience',
      description: 'Your professional background',
      icon: Briefcase,
      component: ExperienceStep,
      isComplete: (data) => !!(data.experience && data.experience.length > 0)
    },
    {
      id: 'skills',
      title: 'Skills',
      description: 'Showcase your abilities',
      icon: Star,
      component: SkillsStep,
      isComplete: (data) => !!(data.skills && data.skills.length >= 3)
    }
  ];

  const currentStepData = steps[currentStep];
  const StepComponent = useMemo(() => currentStepData.component, [currentStepData.component]);

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

  // Debounced save for onChange events - use ref to avoid dependency on profileData
  const debouncedSave = useCallback((data: Partial<Profile>) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for debounced save (2 seconds after typing stops)
    saveTimeoutRef.current = setTimeout(() => {
      const updatedData = { ...profileDataRef.current, ...data };
      autoSave(updatedData);
    }, 2000);
  }, [autoSave]);

  const updateStepData = useCallback((data: Partial<Profile>) => {
    setProfileData(prev => ({ ...prev, ...data }));
    // Trigger debounced save when data changes
    debouncedSave(data);
  }, [debouncedSave]);

  const saveOnBlur = useCallback((data: Partial<Profile>) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Save immediately on blur using current ref data
    const updatedData = { ...profileDataRef.current, ...data };
    autoSave(updatedData);
  }, [autoSave]);

  const isCurrentStepComplete = currentStepData.isComplete(profileData);
  const completedSteps = steps.filter(step => step.isComplete(profileData)).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {isNewUser ? 'Welcome! Let\'s build your profile' : 'Profile Setup Wizard'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Overall Progress</div>
            <div className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mb-6 transition-colors duration-300">
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
                    : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <div className={`text-xs text-center ${
                  isCurrent ? 'text-gray-900 dark:text-white' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                } transition-colors duration-300`}>
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-50 dark:bg-dark-light rounded-xl p-8 border border-gray-300 dark:border-gray-700 mb-8 transition-colors duration-300">
        <StepComponent 
          data={profileData} 
          onChange={updateStepData}
          onBlur={saveOnBlur}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-4">
          {currentStep > 0 && (
            <button
              onClick={() => autoSave(profileData)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Save Progress
            </button>
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
});
