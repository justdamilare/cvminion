import React, { useRef, useEffect, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { Application } from '../../types/application';
import { ResumeTemplate } from './templates/TemplateBase';

interface PDFResumeProps {
  resume: NonNullable<Application['generatedResume']>['tailored_resume'];
  template: ResumeTemplate;
}

export const PDFResume: React.FC<PDFResumeProps> = ({ resume, template }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // A4 aspect ratio is approximately 1:1.414 (width:height)
        const a4Ratio = 1 / 1.414;
        
        // Calculate dimensions to fit A4 within container
        let width, height;
        
        if (containerWidth / containerHeight > a4Ratio) {
          // Container is wider than A4 ratio, fit to height
          height = containerHeight;
          width = height * a4Ratio;
        } else {
          // Container is taller than A4 ratio, fit to width
          width = containerWidth;
          height = width / a4Ratio;
        }
        
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <div className="shadow-lg rounded-lg overflow-hidden bg-white">
          <PDFViewer 
            style={{ 
              width: `${dimensions.width}px`, 
              height: `${dimensions.height}px`,
              border: 'none'
            }}
            showToolbar={false}
          >
            {template.render({ resume })}
          </PDFViewer>
        </div>
      )}
    </div>
  );
};
