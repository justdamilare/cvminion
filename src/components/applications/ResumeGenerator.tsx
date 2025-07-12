import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader, Edit2, FileText, Code } from 'lucide-react';
import { Profile } from '../../types/profile';
import { Application, Resume } from '../../types/application';
import { tailorResume } from '../../lib/resume';
import { consumeCredits } from '../../lib/credits';
import { toast } from 'react-hot-toast';
import { ResumeEditor } from './ResumeEditor';
import { PDFResume } from './PDFResume';
import { ResumeTemplates } from './ResumeTemplates';
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
  const [showJSON, setShowJSON] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(ModernTemplate);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { hasEnoughCredits } = useCredits(userId || undefined);

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
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Resume Preview</h3>
          <button
            onClick={() => setShowPDF(false)}
            className="text-gray-400 hover:text-white"
          >
            Back to Resume
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-4">Select Template</h4>
          <ResumeTemplates
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        </div>

        <PDFResume 
          resume={application.generatedResume.tailored_resume}
          template={selectedTemplate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {application.generatedResume?.ats_score && (
        <div className="bg-dark-light p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">ATS Analysis</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
                Edit Resume
              </button>
              <button
                onClick={() => setShowPDF(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <FileText className="w-4 h-4" />
                View PDF
              </button>
              <button
                onClick={() => setShowJSON(!showJSON)}
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <Code className="w-4 h-4" />
                {showJSON ? 'Hide' : 'Show'} JSON
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Overall Score</div>
              <div className="text-2xl font-bold text-primary">
                {application.generatedResume.ats_score.overall_score}%
              </div>
            </div>
            <div className="bg-dark p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Keyword Match</div>
              <div className="text-2xl font-bold text-blue-400">
                {application.generatedResume.ats_score.keyword_match_score}%
              </div>
            </div>
            <div className="bg-dark p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Format Score</div>
              <div className="text-2xl font-bold text-green-400">
                {application.generatedResume.ats_score.format_score}%
              </div>
            </div>
            <div className="bg-dark p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Content Quality</div>
              <div className="text-2xl font-bold text-yellow-400">
                {application.generatedResume.ats_score.content_quality_score}%
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {application.generatedResume.ats_score.missing_keywords.map((keyword: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Improvement Suggestions</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {application.generatedResume.ats_score.improvement_suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {showJSON && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Raw JSON Response</h4>
              <pre className="bg-dark p-4 rounded-lg overflow-auto max-h-96 text-sm text-gray-400">
                {JSON.stringify(application.generatedResume, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Generate Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
};
