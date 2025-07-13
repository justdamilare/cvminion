import React, { useState } from 'react';
import { User, FileText, CheckCircle, ArrowRight, X, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileSetupGuideProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  userProfile: any;
}

export const ProfileSetupGuide: React.FC<ProfileSetupGuideProps> = ({
  isOpen,
  onComplete,
  onSkip,
  userProfile
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <User className="w-8 h-8 text-blue-400" />,
      title: 'Complete Your Profile',
      description: 'Add your personal information, experience, and skills to create better CVs',
      action: 'Go to Profile',
      link: '/profile',
      completed: false // You can check this based on profile completion
    },
    {
      icon: <Linkedin className="w-8 h-8 text-blue-600" />,
      title: 'Import from LinkedIn',
      description: 'Quickly populate your profile by importing your LinkedIn data',
      action: 'Import LinkedIn',
      link: '/profile',
      completed: false
    },
    {
      icon: <FileText className="w-8 h-8 text-green-400" />,
      title: 'Create Your First CV',
      description: 'Use our AI to generate a professional CV tailored to your target job',
      action: 'Create CV',
      link: '/dashboard',
      completed: false
    }
  ];

  const handleStepAction = (link: string) => {
    // Close the modal and navigate
    onComplete();
    // Navigation will be handled by the Link component
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-light rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Complete Your Setup
              </h2>
              <p className="text-gray-400">
                Follow these steps to get the most out of CVMinion
              </p>
            </div>
            <button
              onClick={onSkip}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Setup Progress</span>
              <span className="text-sm text-gray-400">0 of {steps.length} completed</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                  <Link
                    to={step.link}
                    onClick={() => handleStepAction(step.link)}
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                  >
                    <span>{step.action}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                {step.completed && (
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-6 mb-8 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-3">💡 Quick Tips</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Complete your profile for better CV generation results</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Import from LinkedIn to save time on data entry</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Use specific job descriptions for better ATS optimization</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                onClick={() => onComplete()}
                className="bg-primary text-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Start with Profile
              </Link>
              <Link
                to="/dashboard"
                onClick={() => onComplete()}
                className="border border-primary text-primary font-semibold px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              You can access these setup steps anytime from your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};