import React, { useState } from 'react';
import { LinkedInImport } from './LinkedInImport';
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
        <h3 className="text-lg font-semibold text-white mb-2">Quick Setup</h3>
        <p className="text-gray-400 text-sm">
          Import your professional data from LinkedIn or upload your PDF resume to quickly populate your profile.
        </p>
      </div>
      
      {/* Import Options */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-dark rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-2">Import from LinkedIn</h4>
              <p className="text-gray-400 text-sm mb-4">
                Upload your LinkedIn data export to automatically fill in your experience, education, skills, and more.
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Instant setup</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Supports ZIP & JSON</span>
                </div>
              </div>
              <button
                onClick={() => setShowLinkedInImportModal(true)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Import LinkedIn Data
              </button>
            </div>
          </div>
        </div>

        {/* PDF Resume Import */}
        <div className="bg-dark rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-2">Import PDF Resume</h4>
              <p className="text-gray-400 text-sm mb-4">
                Upload your existing PDF resume and let our AI extract your experience, education, skills, and more automatically.
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span>AI-powered extraction</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>PDF files only</span>
                </div>
              </div>
              <button
                onClick={() => setShowPDFImportModal(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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