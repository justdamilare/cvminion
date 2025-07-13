import React, { useState } from 'react';
import { LinkedInImport } from './LinkedInImport';
import { Profile } from '../../types/profile';
import { Download, FileText, Zap } from 'lucide-react';

interface ImportSectionProps {
  onImport: (data: Partial<Profile>) => Promise<void>;
}

export const ImportSection: React.FC<ImportSectionProps> = ({ onImport }) => {
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Quick Setup</h3>
        <p className="text-gray-400 text-sm">
          Import your professional data from LinkedIn to quickly populate your profile.
        </p>
      </div>
      
      {/* Import Options */}
      <div className="grid md:grid-cols-1 gap-4">
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
                onClick={() => setShowImportModal(true)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Import LinkedIn Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <LinkedInImport 
          onImport={onImport} 
          onClose={() => setShowImportModal(false)} 
        />
      )}
    </div>
  );
};