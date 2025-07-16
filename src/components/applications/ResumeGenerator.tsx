import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader, Edit2, FileText, Zap, Settings, Lightbulb, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Profile } from '../../types/profile';
import { Application, Resume } from '../../types/application';
import { tailorResume } from '../../lib/resume';
import { consumeCredits } from '../../lib/credits';
import { toast } from 'react-hot-toast';
import { ResumeEditor } from './ResumeEditor';
import { PDFResume } from './PDFResume';
import { ResumeTemplates } from './ResumeTemplates';
import { ResumeProgress } from './ResumeProgress';
import { ResumeTemplate } from './templates/TemplateBase';
import { ModernTemplate } from './templates/ModernTemplate';
import { useCredits } from '../../hooks/useCredits';
import { getSupabaseClient } from '../../lib/supabase';

interface ResumeGeneratorProps {
  profile: Profile;
  application: Application;
  onUpdate: (id: string, data: Partial<Application>) => Promise<void>;
}

export const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ 
  profile, 
  application,
  onUpdate 
}) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(ModernTemplate);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { hasEnoughCredits } = useCredits(userId || undefined);

  // Format section names for better display
  const formatSectionName = (sectionName: string): string => {
    return sectionName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\bAts\b/g, 'ATS')
      .replace(/\bPdf\b/g, 'PDF')
      .replace(/\bApi\b/g, 'API')
      .replace(/\bUrl\b/g, 'URL')
      .replace(/\bId\b/g, 'ID');
  };

  // Add keyword to resume skills
  const addKeywordToResume = async (keyword: string) => {
    if (!application.generatedResume) return;
    
    const updatedResume = {
      ...application.generatedResume.tailored_resume,
      skills: [
        ...application.generatedResume.tailored_resume.skills,
        { name: keyword, level: 'Intermediate' as const }
      ]
    };

    await onUpdate(application.id, {
      generatedResume: {
        ...application.generatedResume,
        tailored_resume: updatedResume
      }
    });
    
    toast.success(`Added "${keyword}" to your skills`);
  };

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleGenerate = async () => {
    if (!userId) {
      toast.error('Please log in to generate a resume.');
      return;
    }

    // Check if user has enough credits
    if (!hasEnoughCredits(1)) {
      toast.error('Insufficient credits. Please purchase more credits to generate a resume.');
      return;
    }

    setLoading(true);
    try {
      // First, consume the credit
      const creditConsumed = await consumeCredits(userId, 1);
      
      if (!creditConsumed) {
        toast.error('Failed to consume credits. Please try again.');
        return;
      }

      // Then generate the resume
      const response = await tailorResume(profile, application);
      
      if (response.status === 'error') {
        // If resume generation fails, we should ideally refund the credit
        // For now, we'll just show the error
        throw new Error(response.error);
      }

      if (!response.tailored_resume || !response.ats_score) {
        throw new Error('Invalid response from resume generation service');
      }

      await onUpdate(application.id, {
        generatedResume: {
          tailored_resume: response.tailored_resume as unknown as Resume,
          ats_score: response.ats_score
        },
        atsScore: response.ats_score.overall_score,
        lastGeneratedAt: new Date().toISOString()
      });
      
      toast.success('Resume generated successfully! 1 credit consumed.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async (editedResume: NonNullable<Application['generatedResume']>['tailored_resume']) => {
    if (!application.generatedResume) return;
    
    await onUpdate(application.id, {
      generatedResume: {
        ...application.generatedResume,
        tailored_resume: editedResume
      }
    });
    
    setIsEditing(false);
  };

  if (isEditing && application.generatedResume) {
    return (
      <ResumeEditor
        resume={application.generatedResume.tailored_resume}
        onSave={handleSaveEdits}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (showPDF && application.generatedResume) {
    return (
      <div className="space-y-6">
        {/* Progress Steps */}
        <ResumeProgress currentStep={4} />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Resume Preview
            </h3>
            <button
              onClick={() => setShowPDF(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
            >
              Back to Generator
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* PDF Preview */}
            <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="aspect-[1/1.414] w-full">
                <PDFResume 
                  resume={application.generatedResume.tailored_resume}
                  template={selectedTemplate}
                  showDownloadButton={true}
                />
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Change Template
                </h4>
                <ResumeTemplates
                  selectedTemplate={selectedTemplate}
                  onSelect={setSelectedTemplate}
                  showPreview={false}
                  resume={application.generatedResume?.tailored_resume}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentStep = () => {
    if (application.generatedResume) return 3;
    return 2; // Template selection step
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <ResumeProgress currentStep={getCurrentStep()} />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Template Selection */}
        {!application.generatedResume && (
          <div className="space-y-8">
            <ResumeTemplates
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
              showPreview={true}
            />
            
            {/* Action Panel */}
            <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                      Ready to generate your resume?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      This will consume 1 credit from your account
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Customize
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 inline mr-2" />
                        Generate Resume
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Pro Tip */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 transition-colors duration-300">
                      💡 Pro Tip
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm transition-colors duration-300">
                      The {selectedTemplate.name} template works best for {selectedTemplate.style.theme.toLowerCase()} roles. 
                      The clean layout ensures high ATS compatibility while maintaining visual appeal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATS Analysis Results */}
        {application.generatedResume?.ats_score && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                    ATS Analysis Results
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Your resume has been optimized for Applicant Tracking Systems
                  </p>
                </div>
                <div className="flex gap-3">
                  <PDFDownloadLink
                    document={selectedTemplate.render({ resume: application.generatedResume.tailored_resume })}
                    fileName={`${application.generatedResume.tailored_resume.full_name?.replace(/\s+/g, '_') || 'resume'}_resume_${new Date().toISOString().split('T')[0]}.pdf`}
                  >
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                      <Download className="w-4 h-4" />
                      Download Resume
                    </button>
                  </PDFDownloadLink>
                  <button
                    onClick={() => setShowPDF(true)}
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-all shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
                  >
                    <FileText className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-all shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
              
              {/* ATS Score Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 rounded-lg border border-primary/20">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Overall Score</div>
                  <div className="text-2xl font-bold text-primary">
                    {application.generatedResume.ats_score.overall_score}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Keyword Match</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {application.generatedResume.ats_score.keyword_match_score}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Format Score</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {application.generatedResume.ats_score.format_score}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 dark:from-yellow-500/20 dark:to-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Content Quality</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {application.generatedResume.ats_score.content_quality_score}%
                  </div>
                </div>
              </div>

              {/* Improvements Made Section */}
              {application.generatedResume.tailored_resume.improvements_made && 
               application.generatedResume.tailored_resume.improvements_made.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        {application.generatedResume.tailored_resume.improvements_made.length} Improvements Applied
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-200">
                        Your resume has been automatically optimized for this job
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {application.generatedResume.tailored_resume.improvements_made.map((improvement, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                              {formatSectionName(improvement.section)}
                            </span>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            {improvement.improvement}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Keywords */}
              {application.generatedResume.ats_score.missing_keywords.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-300">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Boost Your ATS Score
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                    Click to add relevant keywords to your skills section
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {application.generatedResume.ats_score.missing_keywords.slice(0, 8).map((keyword: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => addKeywordToResume(keyword)}
                        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium transition-all duration-300 hover:bg-blue-200 dark:hover:bg-blue-700 hover:shadow-md transform hover:scale-105"
                      >
                        + {keyword}
                      </button>
                    ))}
                    {application.generatedResume.ats_score.missing_keywords.length > 8 && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 bg-blue-200 dark:bg-blue-700 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium transition-all duration-300 hover:bg-blue-300 dark:hover:bg-blue-600"
                      >
                        +{application.generatedResume.ats_score.missing_keywords.length - 8} more in editor
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Regenerate Button */}
            <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                    Want to try a different approach?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Generate a new version with different optimizations
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Regenerate Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
