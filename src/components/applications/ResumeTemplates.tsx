import React from 'react';
import { Check, FileText, Layout, Palette, Zap, Briefcase, Crown } from 'lucide-react';
import { ResumeTemplate } from './templates/TemplateBase';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { NovaTemplate } from './templates/NovaTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';

interface ResumeTemplatesProps {
  selectedTemplate: ResumeTemplate;
  onSelect: (template: ResumeTemplate) => void;
}

const templates: ResumeTemplate[] = [
  CreativeTemplate,
  NovaTemplate,
  ModernTemplate,
  ExecutiveTemplate,
  ProfessionalTemplate,
  ClassicTemplate,
];

const getTemplateIcon = (templateId: string) => {
  switch (templateId) {
    case 'modern':
      return <Layout className="w-8 h-8" />;
    case 'creative':
      return <Palette className="w-8 h-8" />;
    case 'nova':
      return <Zap className="w-8 h-8" />;
    case 'classic':
      return <FileText className="w-8 h-8" />;
    case 'professional':
      return <Briefcase className="w-8 h-8" />;
    case 'executive':
      return <Crown className="w-8 h-8" />;
    default:
      return <FileText className="w-8 h-8" />;
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

export const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({
  selectedTemplate,
  onSelect
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => onSelect(template)}
          className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${
            selectedTemplate.id === template.id
              ? 'ring-2 ring-primary shadow-lg'
              : 'hover:ring-2 hover:ring-gray-400'
          }`}
        >
          <div className={`aspect-[4/5] bg-gradient-to-br ${getTemplateColor(template.id)} flex flex-col items-center justify-center p-6 text-white`}>
            <div className="mb-4 opacity-80">
              {getTemplateIcon(template.id)}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-sm opacity-90 mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  {template.style.layout}
                </span>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  {template.style.theme}
                </span>
              </div>
            </div>
          </div>
          {selectedTemplate.id === template.id && (
            <div className="absolute top-2 right-2 bg-primary text-dark rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
