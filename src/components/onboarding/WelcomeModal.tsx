import React from 'react';
import { Brain, Sparkles, Zap, Target, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userProfile: any;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onComplete,
  userProfile
}) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      title: 'AI-Powered CV Generation',
      description: 'Create professional CVs tailored to any job description in seconds'
    },
    {
      icon: <Target className="w-6 h-6 text-green-400" />,
      title: 'ATS Optimization',
      description: 'Ensure your CV passes through Applicant Tracking Systems'
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      title: 'Smart Templates',
      description: 'Choose from professional templates that make you stand out'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-light rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome to CVMinion! 🎉
            </h2>
            <p className="text-gray-400 text-lg">
              Let's get you set up to create amazing CVs that get you hired
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Information */}
          {userProfile?.subscription_tier && (
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Your Plan</h4>
                  <p className="text-sm text-gray-400">
                    You're on the{' '}
                    <span className="text-primary font-semibold capitalize">
                      {userProfile.subscription_tier}
                    </span>{' '}
                    plan
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-primary font-semibold">
                    {userProfile.available_credits || 0} credits
                  </div>
                  <div className="text-xs text-gray-400">Available</div>
                </div>
              </div>
            </div>
          )}

          {/* Getting Started */}
          <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg p-6 mb-8 border border-primary/30">
            <h3 className="text-white font-semibold mb-3">What's Next?</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Complete your profile setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Create your first professional CV</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Start applying to your dream jobs</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center">
            <button
              onClick={onComplete}
              className="inline-flex items-center space-x-2 bg-primary text-dark font-semibold px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <span>Let's Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              You can access this information anytime from the help section
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};