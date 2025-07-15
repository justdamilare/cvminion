import React, { useState } from 'react';
import { Check, Star, Loader, FileText } from 'lucide-react';
import { ResumeTemplate } from './templates/TemplateBase';
import { Application } from '../../types/application';

interface TemplatePreviewCardProps {
  template: ResumeTemplate;
  isSelected: boolean;
  onSelect: (template: ResumeTemplate) => void;
  resume?: NonNullable<Application['generatedResume']>['tailored_resume'];
}

const getTemplateStats = (templateId: string) => {
  switch (templateId) {
    case 'modern':
      return { rating: 4.9, users: '12,500+', badge: 'Most Popular' };
    case 'creative':
      return { rating: 4.7, users: '8,200+', badge: 'Creative' };
    case 'nova':
      return { rating: 4.8, users: '6,100+', badge: 'New' };
    case 'classic':
      return { rating: 4.6, users: '15,300+', badge: 'ATS Safe' };
    case 'professional':
      return { rating: 4.8, users: '9,700+', badge: 'Business' };
    case 'executive':
      return { rating: 4.9, users: '4,500+', badge: 'Premium' };
    default:
      return { rating: 4.5, users: '1,000+', badge: 'Standard' };
  }
};

const getTemplateColor = (templateId: string) => {
  switch (templateId) {
    case 'modern':
      return 'from-blue-500 to-blue-700';
    case 'creative':
      return 'from-purple-500 to-purple-700';
    case 'nova':
      return 'from-green-500 to-green-700';
    case 'classic':
      return 'from-slate-500 to-slate-700';
    case 'professional':
      return 'from-indigo-500 to-indigo-700';
    case 'executive':
      return 'from-amber-500 to-amber-700';
    default:
      return 'from-gray-500 to-gray-700';
  }
};

export const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({
  template,
  isSelected,
  onSelect,
  resume
}) => {
  const [previewLoading, setPreviewLoading] = useState(false);
  const stats = getTemplateStats(template.id);

  const handleSelect = () => {
    onSelect(template);
  };

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300 transform
        ${isSelected 
          ? 'scale-105 shadow-2xl ring-2 ring-primary' 
          : 'hover:scale-102 hover:shadow-xl hover:-translate-y-2'
        }
      `}
      onClick={handleSelect}
    >
      {/* Main Card */}
      <div className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        
        {/* Header with selection indicator */}
        <div className={`relative px-4 py-3 bg-gradient-to-r ${getTemplateColor(template.id)} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{template.name}</h3>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Star className="w-3 h-3 fill-yellow-400" />
                <span>{stats.rating}</span>
                <span>•</span>
                <span>{stats.badge}</span>
              </div>
            </div>
            
            {isSelected && (
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>
        </div>

        {/* PDF Preview Area - A4 aspect ratio (1:1.414) */}
        <div className="relative aspect-[1/1.414] bg-gray-50 dark:bg-gray-800 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          {resume ? (
            <div className="w-full h-full relative">
              {previewLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              
              {/* Actual PDF Preview would go here */}
              <div className="w-full h-full bg-white dark:bg-gray-900 shadow-inner flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
                <FileText className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">Live Preview</p>
                <p className="text-xs">{template.name} Template</p>
                
                {/* Simulated resume content */}
                <div className="mt-4 w-3/4 space-y-2">
                  <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">Preview Available</p>
              <p className="text-xs">After Resume Generation</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 transition-colors duration-300">
            {template.description}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
              {stats.users} users
            </div>
            
            <button
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${isSelected 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>
      </div>

      {/* Glow effect for selected */}
      {isSelected && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-dark rounded-2xl opacity-20 animate-pulse" />
      )}
    </div>
  );
};