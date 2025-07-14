import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Edit3, Eye, Download, Loader2 } from 'lucide-react';
import { Profile } from '../../types/profile';
import { parsePDF, isPDFFile, estimatePDFType } from '../../lib/pdfParser';
import { extractResumeDataWithAI, ExtractedResumeData } from '../../lib/aiResumeExtractor';
import { estimateExtractionConfidence } from '../../lib/aiResumeExtractor';
import { getOpenAIConfig } from '../../config/env';
import toast from 'react-hot-toast';

interface PDFResumeImportProps {
  onImport: (data: Partial<Profile>) => Promise<void>;
  onClose: () => void;
}

interface ProcessingStage {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
}

export const PDFResumeImport: React.FC<PDFResumeImportProps> = ({ onImport, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedResumeData | null>(null);
  const [currentStage, setCurrentStage] = useState<'upload' | 'processing' | 'preview' | 'editing'>('upload');
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>([]);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initializeProcessingStages = () => {
    setProcessingStages([
      { id: 'validation', name: 'Validating PDF file', status: 'pending', progress: 0 },
      { id: 'extraction', name: 'Extracting text from PDF', status: 'pending', progress: 0 },
      { id: 'ai-parsing', name: 'Analyzing resume content', status: 'pending', progress: 0 },
      { id: 'structuring', name: 'Structuring data', status: 'pending', progress: 0 },
    ]);
  };

  const updateStage = (stageId: string, status: ProcessingStage['status'], progress: number, message?: string) => {
    setProcessingStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, status, progress, message }
        : stage
    ));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    if (!isPDFFile(file)) {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    processResume(file);
  };

  const processResume = async (file: File) => {
    setCurrentStage('processing');
    initializeProcessingStages();

    try {
      // Stage 1: Validation
      updateStage('validation', 'processing', 20);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      
      const pdfType = await estimatePDFType(file);
      updateStage('validation', 'completed', 100, `PDF type: ${pdfType}`);

      // Stage 2: Text extraction
      updateStage('extraction', 'processing', 0, 'Extracting text...');
      
      const pdfResult = await parsePDF(file, {
        method: 'auto',
        enableOCRFallback: true,
      });

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'Failed to extract text from PDF');
      }

      setExtractedText(pdfResult.text);
      updateStage('extraction', 'completed', 100, `Extracted ${pdfResult.text.length} characters`);

      // Stage 3: AI parsing
      updateStage('ai-parsing', 'processing', 0, 'Analyzing resume content...');
      
      const confidence = estimateExtractionConfidence(pdfResult.text);
      
      // Get OpenAI API key from configuration
      const openAIConfig = getOpenAIConfig();
      
      const aiResult = await extractResumeDataWithAI(pdfResult.text, {
        apiKey: openAIConfig.apiKey,
        enableFallbackParsing: true,
      });

      updateStage('ai-parsing', 'completed', 100, `Confidence: ${confidence}%`);

      // Stage 4: Structuring
      updateStage('structuring', 'processing', 50, 'Organizing extracted data...');
      
      setExtractedData(aiResult);
      updateStage('structuring', 'completed', 100, 'Data structured successfully');

      setCurrentStage('preview');
      toast.success('Resume processed successfully!');

    } catch (error) {
      console.error('Resume processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Update the current stage as error
      const currentProcessingStage = processingStages.find(stage => stage.status === 'processing');
      if (currentProcessingStage) {
        updateStage(currentProcessingStage.id, 'error', 0, errorMessage);
      }
      
      toast.error(`Failed to process resume: ${errorMessage}`);
    }
  };

  const handleImport = async () => {
    if (!extractedData) return;

    setIsImporting(true);
    try {
      // Convert extracted data to Profile format
      const profileData: Partial<Profile> = {
        full_name: extractedData.personalInfo.fullName || '',
        email: extractedData.personalInfo.email || '',
        phone_number: extractedData.personalInfo.phone || '',
        address: extractedData.personalInfo.address || '',
        summary: extractedData.personalInfo.summary || '',
        title: extractedData.personalInfo.title || '',
        website: extractedData.personalInfo.website,
        linkedin: extractedData.personalInfo.linkedin,
        github: extractedData.personalInfo.github,
        experience: extractedData.experience.map(exp => ({
          ...exp,
          id: crypto.randomUUID(),
        })),
        education: extractedData.education.map(edu => ({
          ...edu,
          id: crypto.randomUUID(),
        })),
        skills: extractedData.skills.map(skill => ({
          ...skill,
          id: crypto.randomUUID(),
        })),
        languages: extractedData.languages.map(lang => ({
          ...lang,
          id: crypto.randomUUID(),
        })),
        projects: extractedData.projects.map(proj => ({
          ...proj,
          id: crypto.randomUUID(),
        })),
        certifications: extractedData.certifications.map(cert => ({
          ...cert,
          id: crypto.randomUUID(),
        })),
      };

      await onImport(profileData);
      toast.success('Resume data imported successfully!');
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import resume data');
    } finally {
      setIsImporting(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStageIcon = (status: ProcessingStage['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  if (currentStage === 'upload') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Import PDF Resume (beta)</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-gray-500'}
            `}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white mb-2">Drag and drop your resume here</p>
            <p className="text-gray-400 text-sm mb-4">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Choose PDF File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
              className="hidden"
            />
          </div>

          <div className="mt-4 text-xs text-gray-400">
            <p>• Supports PDF files up to 50MB</p>
            <p>• Works with text-based and scanned PDFs</p>
            <p>• AI-powered extraction for high accuracy</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStage === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Processing Resume</h3>
            <FileText className="w-6 h-6 text-primary" />
          </div>

          <div className="space-y-4">
            {processingStages.map((stage) => (
              <div key={stage.id} className="flex items-center gap-3">
                {getStageIcon(stage.status)}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">{stage.name}</span>
                    {stage.status === 'processing' && (
                      <span className="text-blue-500 text-xs">{stage.progress}%</span>
                    )}
                  </div>
                  {stage.message && (
                    <p className="text-gray-400 text-xs mt-1">{stage.message}</p>
                  )}
                  {stage.status === 'processing' && (
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedFile && (
            <div className="mt-6 p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStage === 'preview' && extractedData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">Review Extracted Data</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Overall confidence: <span className={getConfidenceColor(extractedData.confidence.overall)}>
                    {extractedData.confidence.overall}%
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTextPreview(!showTextPreview)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="View extracted text"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Warnings */}
            {extractedData.warnings.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-medium">Extraction Warnings</span>
                </div>
                <ul className="text-yellow-200 text-sm space-y-1">
                  {extractedData.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personal Information */}
            <section>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                Personal Information
                <span className={`text-sm ${getConfidenceColor(extractedData.confidence.personalInfo)}`}>
                  ({extractedData.confidence.personalInfo}%)
                </span>
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(extractedData.personalInfo).map(([key, value]) => (
                  value && (
                    <div key={key} className="bg-gray-800 rounded-lg p-3">
                      <label className="text-gray-400 text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <p className="text-white mt-1">{value}</p>
                    </div>
                  )
                ))}
              </div>
            </section>

            {/* Experience */}
            {extractedData.experience.length > 0 && (
              <section>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  Work Experience
                  <span className={`text-sm ${getConfidenceColor(extractedData.confidence.experience)}`}>
                    ({extractedData.confidence.experience}%)
                  </span>
                </h4>
                <div className="space-y-4">
                  {extractedData.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="text-white font-medium">{exp.position}</h5>
                          <p className="text-gray-300">{exp.company}</p>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </div>
                      </div>
                      {exp.highlights.length > 0 && (
                        <ul className="text-gray-300 text-sm mt-2 space-y-1">
                          {exp.highlights.map((highlight, hIndex) => (
                            <li key={hIndex}>• {highlight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {extractedData.education.length > 0 && (
              <section>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  Education
                  <span className={`text-sm ${getConfidenceColor(extractedData.confidence.education)}`}>
                    ({extractedData.confidence.education}%)
                  </span>
                </h4>
                <div className="space-y-3">
                  {extractedData.education.map((edu, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-white font-medium">{edu.degree}</h5>
                          <p className="text-gray-300">{edu.institution}</p>
                          <p className="text-gray-400 text-sm">{edu.field}</p>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          {edu.start_date} - {edu.end_date || 'Present'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {extractedData.skills.length > 0 && (
              <section>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  Skills
                  <span className={`text-sm ${getConfidenceColor(extractedData.confidence.skills)}`}>
                    ({extractedData.confidence.skills}%)
                  </span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {extractedData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                    >
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Text Preview */}
            {showTextPreview && (
              <section>
                <h4 className="text-lg font-semibold text-white mb-3">Extracted Text</h4>
                <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap">{extractedText}</pre>
                </div>
              </section>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStage('upload')}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Upload Different File
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Import Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
