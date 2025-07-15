import React, { useRef, useEffect, useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Application } from '../../types/application';
import { ResumeTemplate } from './templates/TemplateBase';

interface PDFResumeProps {
  resume: NonNullable<Application['generatedResume']>['tailored_resume'];
  template: ResumeTemplate;
  showDownloadButton?: boolean;
}

export const PDFResume: React.FC<PDFResumeProps> = ({ resume, template, showDownloadButton = false }) => {
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

  const generateFileName = () => {
    const name = resume.full_name?.replace(/\s+/g, '_') || 'resume';
    const date = new Date().toISOString().split('T')[0];
    return `${name}_resume_${date}.pdf`;
  };

  return (
    <div className="relative w-full h-full">
      {/* Download Button */}
      {showDownloadButton && (
        <div className="absolute top-4 right-4 z-10">
          <PDFDownloadLink
            document={template.render({ resume })}
            fileName={generateFileName()}
          >
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </PDFDownloadLink>
        </div>
      )}

      {/* PDF Viewer */}
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
    </div>
  );
};
