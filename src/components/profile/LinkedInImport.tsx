import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download, Eye, Loader, Users } from 'lucide-react';
import { Profile } from '../../types/profile';
import { parseLinkedInData, validateLinkedInData, getDataCompleteness } from '../../lib/linkedinParser';
import { processFileWithProgress, FileProcessingResult } from '../../lib/fileProcessing';
import toast from 'react-hot-toast';

interface LinkedInImportProps {
  onImport: (data: Partial<Profile>) => Promise<void>;
  onClose?: () => void;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  status: string;
}

interface ImportState {
  file: File | null;
  processedData: Partial<Profile> | null;
  errors: string[];
  warnings: string[];
  completeness: number;
  showPreview: boolean;
}

export const LinkedInImport: React.FC<LinkedInImportProps> = ({ onImport, onClose }) => {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    status: ''
  });
  const [importState, setImportState] = useState<ImportState>({
    file: null,
    processedData: null,
    errors: [],
    warnings: [],
    completeness: 0,
    showPreview: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setImportState({
      file: null,
      processedData: null,
      errors: [],
      warnings: [],
      completeness: 0,
      showPreview: false
    });
    setProcessing({
      isProcessing: false,
      progress: 0,
      status: ''
    });
  }, []);

  const processFile = useCallback(async (file: File) => {
    setProcessing({ isProcessing: true, progress: 0, status: 'Starting...' });
    
    try {
      const result: FileProcessingResult = await processFileWithProgress(
        file,
        (progress: number, status: string) => {
          setProcessing(prev => ({ ...prev, progress, status }));
        }
      );

      if (!result.success) {
        setImportState(prev => ({
          ...prev,
          errors: [result.error || 'Unknown error occurred']
        }));
        return;
      }

      // Parse LinkedIn data
      setProcessing(prev => ({ ...prev, status: 'Parsing LinkedIn data...' }));
      const profileData = parseLinkedInData(result.data);
      
      // Validate data
      const validation = validateLinkedInData(profileData);
      const completeness = getDataCompleteness(profileData);
      
      setImportState({
        file,
        processedData: profileData,
        errors: validation.errors,
        warnings: validation.valid ? [] : ['Some data validation issues found'],
        completeness,
        showPreview: true
      });
      
      if (validation.valid) {
        toast.success(`LinkedIn data processed successfully! ${completeness}% complete.`);
      } else {
        toast.error('Data validation issues found. Please review before importing.');
      }
      
    } catch (error) {
      console.error('File processing error:', error);
      setImportState(prev => ({
        ...prev,
        errors: [error instanceof Error ? error.message : 'Failed to process file']
      }));
      toast.error('Failed to process LinkedIn file');
    } finally {
      setProcessing({ isProcessing: false, progress: 100, status: 'Complete' });
    }
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    resetState();
    processFile(file);
  }, [processFile, resetState]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleImport = useCallback(async () => {
    if (!importState.processedData) return;
    
    try {
      await onImport(importState.processedData);
      toast.success('LinkedIn profile imported successfully!');
      resetState();
      onClose?.();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import profile data');
    }
  }, [importState.processedData, onImport, onClose, resetState]);

  const DataPreview: React.FC<{ data: Partial<Profile> }> = ({ data }) => (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="bg-dark rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Basic Information
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Name:</span>
            <span className="text-white ml-2">{data.full_name || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="text-white ml-2">{data.email || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-400">Phone:</span>
            <span className="text-white ml-2">{data.phone_number || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-400">Location:</span>
            <span className="text-white ml-2">{data.address || 'Not provided'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400">Title:</span>
            <span className="text-white ml-2">{data.title || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="bg-dark rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Professional Summary</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {data.summary.substring(0, 200)}
            {data.summary.length > 200 && '...'}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-dark rounded-lg p-3 text-center">
          <div className="text-primary font-semibold">{data.experience?.length || 0}</div>
          <div className="text-gray-400 text-sm">Experience</div>
        </div>
        <div className="bg-dark rounded-lg p-3 text-center">
          <div className="text-primary font-semibold">{data.education?.length || 0}</div>
          <div className="text-gray-400 text-sm">Education</div>
        </div>
        <div className="bg-dark rounded-lg p-3 text-center">
          <div className="text-primary font-semibold">{data.skills?.length || 0}</div>
          <div className="text-gray-400 text-sm">Skills</div>
        </div>
        <div className="bg-dark rounded-lg p-3 text-center">
          <div className="text-primary font-semibold">{importState.completeness}%</div>
          <div className="text-gray-400 text-sm">Complete</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-light rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Import from LinkedIn</h2>
            <p className="text-gray-400 text-sm mt-1">
              Upload your LinkedIn export file to quickly populate your profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!importState.showPreview ? (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-dark rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">How to get your LinkedIn data:</h3>
                <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Go to LinkedIn Settings & Privacy</li>
                  <li>Click "Data Privacy" → "Get a copy of your data"</li>
                  <li>Select "Want something in particular?" and choose relevant sections</li>
                  <li>Request the download and wait for LinkedIn to prepare your file</li>
                  <li>Download the ZIP file and upload it here</li>
                </ol>
                <div className="mt-3 text-xs text-gray-400">
                  Supported formats: ZIP (LinkedIn export), JSON, or individual CSV files
                </div>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-primary bg-primary/10'
                    : processing.isProcessing
                    ? 'border-gray-600 bg-gray-800/50'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.json,.csv"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                
                {processing.isProcessing ? (
                  <div className="space-y-4">
                    <Loader className="w-12 h-12 text-primary mx-auto animate-spin" />
                    <div>
                      <div className="text-white font-medium">{processing.status}</div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processing.progress}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{processing.progress}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <div className="text-white font-medium">Drop your LinkedIn export file here</div>
                      <div className="text-gray-400 text-sm mt-1">or click to browse</div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>

              {/* Errors */}
              {importState.errors.length > 0 && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                    <AlertCircle className="w-5 h-5" />
                    Errors Found
                  </div>
                  <ul className="text-red-300 text-sm space-y-1">
                    {importState.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-green-400 font-medium">Data processed successfully!</div>
                    <div className="text-green-300 text-sm">
                      {importState.file?.name} • {importState.completeness}% profile completeness
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {importState.warnings.length > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
                    <AlertCircle className="w-5 h-5" />
                    Warnings
                  </div>
                  <ul className="text-yellow-300 text-sm space-y-1">
                    {importState.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Preview */}
              {importState.processedData && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <h3 className="text-white font-semibold">Preview Import Data</h3>
                  </div>
                  <DataPreview data={importState.processedData} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={resetState}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Upload Different File
                </button>
                <button
                  onClick={handleImport}
                  disabled={importState.errors.length > 0}
                  className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import Profile Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};