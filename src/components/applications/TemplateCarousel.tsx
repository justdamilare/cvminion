import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ResumeTemplate } from './templates/TemplateBase';
import { TemplatePreviewCard } from './TemplatePreviewCard';
import { Application } from '../../types/application';

interface TemplateCarouselProps {
  templates: ResumeTemplate[];
  selectedTemplate: ResumeTemplate;
  onSelect: (template: ResumeTemplate) => void;
  resume?: NonNullable<Application['generatedResume']>['tailored_resume'];
}

export const TemplateCarousel: React.FC<TemplateCarouselProps> = ({
  templates,
  selectedTemplate,
  onSelect,
  resume
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [templatesPerView, setTemplatesPerView] = useState(3);

  // Responsive templates per view
  useEffect(() => {
    const updateTemplatesPerView = () => {
      if (window.innerWidth >= 1536) {
        setTemplatesPerView(4); // 2xl
      } else if (window.innerWidth >= 1280) {
        setTemplatesPerView(3); // xl
      } else if (window.innerWidth >= 1024) {
        setTemplatesPerView(2); // lg
      } else {
        setTemplatesPerView(1); // sm/md
      }
    };

    updateTemplatesPerView();
    window.addEventListener('resize', updateTemplatesPerView);
    return () => window.removeEventListener('resize', updateTemplatesPerView);
  }, []);

  // Ensure selected template is visible
  useEffect(() => {
    const selectedIndex = templates.findIndex(t => t.id === selectedTemplate.id);
    if (selectedIndex !== -1) {
      const maxStartIndex = Math.max(0, templates.length - templatesPerView);
      const idealStartIndex = Math.max(0, selectedIndex - Math.floor(templatesPerView / 2));
      setCurrentIndex(Math.min(idealStartIndex, maxStartIndex));
    }
  }, [selectedTemplate.id, templates, templatesPerView]);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < templates.length - templatesPerView;

  const goToPrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToSlide = (index: number) => {
    const maxIndex = Math.max(0, templates.length - templatesPerView);
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const visibleTemplates = templates.slice(currentIndex, currentIndex + templatesPerView);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
          Choose Your Resume Template
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Select from our professional templates with live preview
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        {templates.length > templatesPerView && (
          <>
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={`
                absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                w-12 h-12 rounded-full shadow-lg flex items-center justify-center
                transition-all duration-200 transform
                ${canGoPrevious 
                  ? 'bg-white dark:bg-dark-light text-gray-700 dark:text-gray-300 hover:scale-110 hover:shadow-xl' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`
                absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                w-12 h-12 rounded-full shadow-lg flex items-center justify-center
                transition-all duration-200 transform
                ${canGoNext 
                  ? 'bg-white dark:bg-dark-light text-gray-700 dark:text-gray-300 hover:scale-110 hover:shadow-xl' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Templates Grid */}
        <div 
          className="grid gap-6 transition-all duration-500 ease-out"
          style={{ 
            gridTemplateColumns: `repeat(${templatesPerView}, 1fr)`,
          }}
        >
          {visibleTemplates.map((template, index) => (
            <div
              key={template.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TemplatePreviewCard
                template={template}
                isSelected={selectedTemplate.id === template.id}
                onSelect={onSelect}
                resume={resume}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {templates.length > templatesPerView && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.ceil(templates.length / templatesPerView) }).map((_, index) => {
            const slideStart = index * templatesPerView;
            const isActive = currentIndex >= slideStart && currentIndex < slideStart + templatesPerView;
            
            return (
              <button
                key={index}
                onClick={() => goToSlide(slideStart)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${isActive 
                    ? 'bg-primary scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }
                `}
              />
            );
          })}
        </div>
      )}

      {/* Template Count Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
        Showing {visibleTemplates.length} of {templates.length} templates
      </div>
    </div>
  );
};