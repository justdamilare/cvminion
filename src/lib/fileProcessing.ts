/**
 * File processing utilities for LinkedIn import functionality
 * Handles file upload, validation, and processing for various LinkedIn export formats
 */

import JSZip from 'jszip';

export interface FileProcessingOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  validateContent?: boolean;
}

export interface FileProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    processedAt: Date;
  };
}

export const DEFAULT_OPTIONS: FileProcessingOptions = {
  maxSizeBytes: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['application/zip', 'application/json', 'text/plain', 'application/pdf'],
  validateContent: true,
};

/**
 * Validates uploaded file against size and type constraints
 */
export const validateFile = (file: File, options: FileProcessingOptions = DEFAULT_OPTIONS): { valid: boolean; error?: string } => {
  const { maxSizeBytes, allowedTypes } = { ...DEFAULT_OPTIONS, ...options };

  // Check file size
  if (maxSizeBytes && file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum allowed size of ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB`
    };
  }

  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Reads file content as text or ArrayBuffer based on file type
 */
export const readFileContent = (file: File): Promise<string | ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    
    // Read as ArrayBuffer for ZIP files, text for others
    if (file.type === 'application/zip') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
};

/**
 * Processes LinkedIn ZIP export files
 */
export const processLinkedInZip = async (arrayBuffer: ArrayBuffer): Promise<any> => {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const linkedInData: any = {};

    // Common LinkedIn export file names
    const fileMap = {
      'Profile.csv': 'profile',
      'Positions.csv': 'positions',
      'Education.csv': 'education',
      'Skills.csv': 'skills',
      'Languages.csv': 'languages',
      'Certifications.csv': 'certifications',
      'Projects.csv': 'projects',
      'Contacts.csv': 'contacts',
      'Basic_Information.json': 'basicInfo',
      'profile.json': 'profileJson'
    };

    // Process each file in the ZIP
    for (const [fileName, dataKey] of Object.entries(fileMap)) {
      const file = zip.file(fileName);
      if (file) {
        try {
          const content = await file.async('text');
          if (fileName.endsWith('.json')) {
            linkedInData[dataKey] = JSON.parse(content);
          } else if (fileName.endsWith('.csv')) {
            linkedInData[dataKey] = parseCSV(content);
          }
        } catch (error) {
          console.warn(`Failed to process ${fileName}:`, error);
        }
      }
    }

    return linkedInData;
  } catch (error) {
    throw new Error(`Failed to process LinkedIn ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Simple CSV parser for LinkedIn export files
 */
export const parseCSV = (csvText: string): any[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }

  return rows;
};

/**
 * Parse a single CSV line handling quoted values and commas
 */
const parseCSVLine = (line: string): string[] => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
};

/**
 * Processes different file types for LinkedIn import
 */
export const processLinkedInFile = async (
  file: File,
  options: FileProcessingOptions = DEFAULT_OPTIONS
): Promise<FileProcessingResult> => {
  try {
    // Validate file
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Read file content
    const content = await readFileContent(file);
    let processedData: any = null;

    // Process based on file type
    switch (file.type) {
      case 'application/zip':
        processedData = await processLinkedInZip(content as ArrayBuffer);
        break;
        
      case 'application/json':
      case 'text/plain':
        try {
          processedData = JSON.parse(content as string);
        } catch {
          // If not JSON, treat as plain text
          processedData = { rawText: content };
        }
        break;
        
      case 'application/pdf':
        // For PDF files, we'll need to extract text
        // This would require a PDF parsing library
        throw new Error('PDF processing not yet implemented. Please use JSON or ZIP exports from LinkedIn.');
        
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }

    return {
      success: true,
      data: processedData,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processedAt: new Date()
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during file processing'
    };
  }
};

/**
 * Progress callback type for file processing
 */
export type ProgressCallback = (progress: number, status: string) => void;

/**
 * Processes file with progress updates
 */
export const processFileWithProgress = async (
  file: File,
  onProgress: ProgressCallback,
  options: FileProcessingOptions = DEFAULT_OPTIONS
): Promise<FileProcessingResult> => {
  try {
    onProgress(0, 'Validating file...');
    
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    onProgress(20, 'Reading file content...');
    const content = await readFileContent(file);
    
    onProgress(50, 'Processing LinkedIn data...');
    let processedData: any = null;
    
    switch (file.type) {
      case 'application/zip':
        onProgress(60, 'Extracting ZIP contents...');
        processedData = await processLinkedInZip(content as ArrayBuffer);
        break;
        
      case 'application/json':
      case 'text/plain':
        onProgress(70, 'Parsing JSON data...');
        try {
          processedData = JSON.parse(content as string);
        } catch {
          processedData = { rawText: content };
        }
        break;
        
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    onProgress(90, 'Finalizing...');
    
    onProgress(100, 'Complete!');
    return {
      success: true,
      data: processedData,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processedAt: new Date()
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};