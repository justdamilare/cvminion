import React, { useState } from 'react';
import { LinkedInImport } from './LinkedInImport';
import { LinkedInOAuthImport } from './LinkedInOAuthImport';
import { PDFResumeImport } from './PDFResumeImport';
import { Profile } from '../../types/profile';
import { Download, FileText, Zap, Upload, Brain } from 'lucide-react';

interface ImportSectionProps {
  onImport: (data: Partial<Profile>) => Promise<void>;
}

export const ImportSection: React.FC<ImportSectionProps> = ({ onImport }) => {
  const [showLinkedInImportModal, setShowLinkedInImportModal] = useState(false);
  const [showPDFImportModal, setShowPDFImportModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Quick Setup</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
          Import your professional data from LinkedIn or upload your PDF resume to quickly populate your profile.
        </p>
      </div>
      
      {/* LinkedIn OAuth Quick Import */}
      <LinkedInOAuthImport 
        onImportComplete={() => window.location.reload()} 
        className="max-w-4xl mx-auto mb-6" 
      />

      {/* Import Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div className="bg-gray-50 dark:bg-dark rounded-lg p-6 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-300">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white font-semibold transition-colors duration-300">Import from LinkedIn (beta)</h4>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed transition-colors duration-300">
                  Upload your LinkedIn data export to automatically fill in your experience, education, skills, and more.
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-500 mb-6 transition-colors duration-300">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Instant setup</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Supports ZIP & JSON</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLinkedInImportModal(true)}
                className="w-full px-4 py-3 bg-primary text-dark font-medium rounded-lg hover:bg-primary/90 transition-colors mt-auto"
              >
                Import LinkedIn Data
              </button>
            </div>
          </div>
        </div>

        {/* PDF Resume Import */}
        <div className="bg-gray-50 dark:bg-dark rounded-lg p-6 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-300">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-white font-semibold transition-colors duration-300">Import PDF Resume (beta)</h4>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed transition-colors duration-300">
                  Upload your existing PDF resume and let our AI extract your experience, education, skills, and more automatically.
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-500 mb-6 transition-colors duration-300">
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    <span>AI-powered extraction</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>PDF files only</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPDFImportModal(true)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium mt-auto"
              >
                Upload PDF Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modals */}
      {showLinkedInImportModal && (
        <LinkedInImport 
          onImport={onImport} 
          onClose={() => setShowLinkedInImportModal(false)} 
        />
      )}

      {showPDFImportModal && (
        <PDFResumeImport 
          onImport={onImport} 
          onClose={() => setShowPDFImportModal(false)} 
        />
      )}
    </div>
  );
};
