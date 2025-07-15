import React from 'react';
import { Check, FileText, Layout, Zap, Download } from 'lucide-react';

interface ResumeProgressProps {
  currentStep: number;
  steps?: Array<{
    id: number;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }>;
}

const defaultSteps = [
  {
    id: 1,
    title: 'Job Description',
    subtitle: 'Add job details',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 2,
    title: 'Pick Template',
    subtitle: 'Choose your style',
    icon: <Layout className="w-5 h-5" />
  },
  {
    id: 3,
    title: 'Generate',
    subtitle: 'AI optimization',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 4,
    title: 'Download',
    subtitle: 'Ready to apply',
    icon: <Download className="w-5 h-5" />
  }
];

export const ResumeProgress: React.FC<ResumeProgressProps> = ({ 
  currentStep, 
  steps = defaultSteps 
}) => {
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'active':
        return 'bg-gradient-to-br from-primary to-primary-dark text-white';
      case 'pending':
      default:
        return 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400';
    }
  };

  const getConnectorClasses = (stepId: number) => {
    return stepId < currentStep 
      ? 'bg-green-500' 
      : 'bg-gray-300 dark:bg-gray-600';
  };

  return (
    <div className="bg-white dark:bg-dark-light border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isLast = index === steps.length - 1;
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step */}
                  <div className="flex items-center">
                    <div className={`
                      step-indicator w-10 h-10 rounded-full flex items-center justify-center 
                      font-semibold text-sm transition-all duration-300 ${getStepClasses(status)}
                    `}>
                      {status === 'completed' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`
                        text-sm font-medium transition-colors duration-300
                        ${status === 'pending' 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                        }
                      `}>
                        {step.title}
                      </p>
                      <p className={`
                        text-xs transition-colors duration-300
                        ${status === 'completed' 
                          ? 'text-green-600 dark:text-green-400' 
                          : status === 'active'
                          ? 'text-primary'
                          : 'text-gray-400 dark:text-gray-500'
                        }
                      `}>
                        {status === 'completed' ? 'Completed' : step.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  {!isLast && (
                    <div className={`
                      w-16 h-0.5 hidden sm:block transition-all duration-300
                      ${getConnectorClasses(step.id)}
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        
        {/* Mobile Step Indicator */}
        <div className="sm:hidden mt-4">
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {steps.map((step) => {
                const status = getStepStatus(step.id);
                return (
                  <div
                    key={step.id}
                    className={`
                      w-3 h-3 rounded-full transition-all duration-300
                      ${status === 'completed' 
                        ? 'bg-green-500' 
                        : status === 'active'
                        ? 'bg-primary'
                        : 'bg-gray-300 dark:bg-gray-600'
                      }
                    `}
                  />
                );
              })}
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {steps.find(s => s.id === currentStep)?.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};