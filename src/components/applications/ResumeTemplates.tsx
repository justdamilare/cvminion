import React from 'react';
import { Check, FileText, Layout, Palette, Zap, Briefcase, Crown, Star } from 'lucide-react';
import { ResumeTemplate } from './templates/TemplateBase';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { CleanTemplate } from './templates/CleanTemplate';
import { TemplateCarousel } from './TemplateCarousel';
import { Application } from '../../types/application';

interface ResumeTemplatesProps {
  selectedTemplate: ResumeTemplate;
  onSelect: (template: ResumeTemplate) => void;
  showPreview?: boolean;
  resume?: NonNullable<Application['generatedResume']>['tailored_resume'];
}

const templates: ResumeTemplate[] = [
  ProfessionalTemplate,
  CleanTemplate,
  ModernTemplate,
  ClassicTemplate,
];

const getTemplateIcon = (templateId: string) => {
  switch (templateId) {
    case 'clean':
      return <FileText className="w-6 h-6" />;
    case 'professional':
      return <Briefcase className="w-6 h-6" />;
    case 'modern':
      return <Layout className="w-6 h-6" />;
    case 'classic':
      return <FileText className="w-6 h-6" />;
    default:
      return <FileText className="w-6 h-6" />;
  }
};

const getTemplateColor = (templateId: string) => {
  switch (templateId) {
    case 'clean':
      return 'from-slate-500 to-slate-700';
    case 'professional':
      return 'from-indigo-500 to-indigo-700';
    case 'modern':
      return 'from-blue-500 to-blue-700';
    case 'classic':
      return 'from-slate-500 to-slate-700';
    default:
      return 'from-gray-500 to-gray-700';
  }
};

const getTemplateStats = (templateId: string) => {
  switch (templateId) {
    case 'clean':
      return { rating: 4.9, users: '2,100+', badge: 'Most Popular' };
    case 'professional':
      return { rating: 4.8, users: '1,800+', badge: 'Business' };
    case 'modern':
      return { rating: 4.9, users: '12,500+', badge: 'Modern' };
    case 'classic':
      return { rating: 4.6, users: '15,300+', badge: 'ATS Safe' };
    default:
      return { rating: 4.5, users: '1,000+', badge: 'Standard' };
  }
};

export const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({
  selectedTemplate,
  onSelect,
  showPreview = true,
  resume
}) => {
  const handleTemplateSelect = (template: ResumeTemplate) => {
    onSelect(template);
  };

  // Use carousel for full preview mode, compact grid for sidebar mode
  if (showPreview) {
    return (
      <div className="space-y-8">
        <TemplateCarousel
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelect={handleTemplateSelect}
          resume={resume}
        />

        {/* Selected Template Details */}
        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${getTemplateColor(selectedTemplate.id)} rounded-lg flex items-center justify-center text-white`}>
              {getTemplateIcon(selectedTemplate.id)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                {selectedTemplate.name} Template
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {selectedTemplate.description}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                  ATS-Optimized formatting
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                  {selectedTemplate.style.layout} layout
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                  Professional {selectedTemplate.style.theme} theme
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                  Skills highlighting
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg transition-colors duration-300">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {getTemplateStats(selectedTemplate.id).users}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                95%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Success Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact grid for sidebar/modal use
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {templates.map((template, index) => {
        const stats = getTemplateStats(template.id);
        const isSelected = selectedTemplate.id === template.id;
        
        return (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className={`
              template-card cursor-pointer group relative overflow-hidden rounded-xl transition-all duration-200 transform
              ${isSelected 
                ? 'scale-105 shadow-xl ring-2 ring-primary dark:ring-primary' 
                : 'hover:scale-102 hover:shadow-lg hover:-translate-y-1'
              }
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`
              relative aspect-[4/5] bg-gradient-to-br ${getTemplateColor(template.id)} 
              flex flex-col items-center justify-center p-4 text-white
            `}>
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10 animate-scale-in">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Template Content */}
              <div className="text-center flex-1 flex flex-col justify-center">
                {/* Icon */}
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2 mx-auto backdrop-blur-sm">
                  {getTemplateIcon(template.id)}
                </div>
                
                {/* Template Info */}
                <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                <p className="text-xs opacity-90 mb-2 line-clamp-2">{template.description}</p>
                
                {/* Mini Preview */}
                <div className="bg-white/10 rounded p-1 text-xs space-y-0.5 backdrop-blur-sm">
                  <div className="bg-white/30 h-0.5 w-full rounded"></div>
                  <div className="bg-white/30 h-0.5 w-3/4 rounded"></div>
                  <div className="bg-white/30 h-0.5 w-1/2 rounded"></div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                    <span>{stats.rating}</span>
                  </div>
                  <span className="bg-white/20 px-1 py-0.5 rounded-full backdrop-blur-sm text-xs">
                    {stats.badge}
                  </span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
