/**
 * PDF parsing utilities for resume text extraction
 * Uses pdf-parse for reliable PDF text extraction without build issues
 */

// Browser-compatible PDF text extraction
// We'll create a simple PDF text extractor without Node.js dependencies

export interface PDFParsingOptions {
  method: 'pdfjs' | 'ocr' | 'auto';
  ocrLanguage?: string;
  preserveLayout?: boolean;
  enableOCRFallback?: boolean;
}

export interface PDFParsingResult {
  success: boolean;
  text: string;
  pages: string[];
  metadata?: {
    title?: string;
    author?: string;
    creator?: string;
    subject?: string;
    keywords?: string;
    pageCount: number;
    method: string;
    hasImages: boolean;
    hasText: boolean;
    confidence?: number;
  };
  error?: string;
}

export interface PDFTextLayout {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

const DEFAULT_OPTIONS: PDFParsingOptions = {
  method: 'auto',
  ocrLanguage: 'eng',
  preserveLayout: false,
  enableOCRFallback: true,
};

/**
 * Main PDF parsing function that handles different extraction methods
 */
export const parsePDF = async (
  file: File | ArrayBuffer,
  options: Partial<PDFParsingOptions> = {}
): Promise<PDFParsingResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    
    if (opts.method === 'auto') {
      // Try simple parser first, fallback to OCR if needed
      const pdfResult = await extractTextWithSimpleParser(arrayBuffer, opts);
      
      if (pdfResult.success && pdfResult.text.trim().length > 50) {
        return pdfResult;
      } else if (opts.enableOCRFallback) {
        console.log('PDF parsing insufficient, falling back to OCR...');
        return await extractTextWithOCR(arrayBuffer, opts);
      } else {
        return pdfResult;
      }
    } else if (opts.method === 'pdfjs') {
      return await extractTextWithSimpleParser(arrayBuffer, opts);
    } else if (opts.method === 'ocr') {
      return await extractTextWithOCR(arrayBuffer, opts);
    } else {
      throw new Error(`Unsupported parsing method: ${opts.method}`);
    }
  } catch (error) {
    return {
      success: false,
      text: '',
      pages: [],
      error: error instanceof Error ? error.message : 'Unknown PDF parsing error'
    };
  }
};

/**
 * Simple PDF text extraction for browser (basic implementation)
 */
export const extractTextWithSimpleParser = async (
  arrayBuffer: ArrayBuffer,
  options: PDFParsingOptions
): Promise<PDFParsingResult> => {
  try {
    // Convert ArrayBuffer to string for basic text extraction
    const uint8Array = new Uint8Array(arrayBuffer);
    let pdfString = '';
    
    // Convert to binary string
    for (let i = 0; i < uint8Array.length; i++) {
      pdfString += String.fromCharCode(uint8Array[i]);
    }
    
    // Basic PDF text extraction using regex patterns
    const textMatches = pdfString.match(/\(([^)]+)\)/g) || [];
    let extractedText = '';
    
    textMatches.forEach(match => {
      // Remove parentheses and clean up the text
      const text = match.slice(1, -1)
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\/g, '')
        .trim();
      
      if (text && text.length > 1) {
        extractedText += text + ' ';
      }
    });
    
    // Also try to extract text from stream objects
    const streamMatches = pdfString.match(/stream\s*([\s\S]*?)\s*endstream/g) || [];
    streamMatches.forEach(stream => {
      const streamText = stream
        .replace(/stream\s*/, '')
        .replace(/\s*endstream/, '')
        .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII
        .replace(/\s+/g, ' ')
        .trim();
      
      if (streamText && streamText.length > 10) {
        extractedText += streamText + ' ';
      }
    });
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\s]/g, '') // Remove non-printable characters
      .trim();
    
    const hasText = extractedText.length > 50;
    
    return {
      success: hasText,
      text: extractedText,
      pages: [extractedText],
      metadata: {
        pageCount: 1,
        method: 'simple-parser',
        hasImages: false,
        hasText,
      }
    };
  } catch (error) {
    throw new Error(`Simple PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Extract text using OCR (works for image-based PDFs and scanned documents)
 * Note: This is a simplified implementation without PDF.js page rendering
 */
export const extractTextWithOCR = async (
  arrayBuffer: ArrayBuffer,
  options: PDFParsingOptions
): Promise<PDFParsingResult> => {
  try {
    // OCR functionality disabled for now due to PDF.js dependency
    // Would require PDF.js for page rendering to canvas
    console.warn('OCR extraction not available - requires PDF.js for page rendering');
    
    return {
      success: false,
      text: '',
      pages: [],
      error: 'OCR extraction not available - please use text-based PDFs or upload as images'
    };
  } catch (error) {
    throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validates if a file is a valid PDF
 */
export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

/**
 * Estimates if a PDF is text-based or image-based
 * Simplified version without PDF.js dependency
 */
export const estimatePDFType = async (file: File): Promise<'text' | 'image' | 'mixed' | 'unknown'> => {
  try {
    // Simple heuristic based on file size and content
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string for pattern matching
    let pdfContent = '';
    for (let i = 0; i < Math.min(uint8Array.length, 10000); i++) { // Check first 10KB
      pdfContent += String.fromCharCode(uint8Array[i]);
    }
    
    // Check if PDF contains text streams
    const hasTextStreams = pdfContent.includes('/Type/Font') || pdfContent.includes('BT') || pdfContent.includes('Tj');
    const hasImages = pdfContent.includes('/Type/XObject') || pdfContent.includes('/Subtype/Image');
    
    if (hasTextStreams && !hasImages) return 'text';
    if (hasImages && !hasTextStreams) return 'image';
    if (hasTextStreams && hasImages) return 'mixed';
    
    // Fallback to assuming text-based
    return 'text';
  } catch (error) {
    console.warn('Failed to estimate PDF type:', error);
    return 'unknown';
  }
};

/**
 * Preprocesses extracted text to improve AI parsing
 */
export const preprocessResumeText = (text: string): string => {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Fix common OCR issues
  cleaned = cleaned
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
    .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between numbers and letters
    .replace(/([A-Za-z])(\d)/g, '$1 $2') // Add space between letters and numbers
    .replace(/\s*[-—–]\s*/g, ' - ') // Normalize dashes
    .replace(/\s*[•·]\s*/g, ' • ') // Normalize bullet points
    .replace(/\s*[@]\s*/g, '@') // Fix email addresses
    .replace(/\s*[.]\s*com/g, '.com') // Fix domain extensions
    .replace(/\s*[.]\s*edu/g, '.edu')
    .replace(/\s*[.]\s*org/g, '.org')
    .replace(/\s*[.]\s*net/g, '.net');
  
  // Normalize phone numbers
  cleaned = cleaned.replace(/(\d{3})\s*[-.]?\s*(\d{3})\s*[-.]?\s*(\d{4})/g, '$1-$2-$3');
  
  // Fix common section headers
  const sectionHeaders = [
    'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
    'EDUCATION', 'ACADEMIC BACKGROUND',
    'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
    'CERTIFICATIONS', 'LICENSES',
    'PROJECTS', 'NOTABLE PROJECTS',
    'LANGUAGES', 'LANGUAGE SKILLS',
    'SUMMARY', 'PROFILE', 'OBJECTIVE'
  ];
  
  sectionHeaders.forEach(header => {
    const regex = new RegExp(`\\b${header.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    cleaned = cleaned.replace(regex, `\n\n${header}\n`);
  });
  
  return cleaned;
};

/**
 * Splits resume text into logical sections
 */
export const detectResumeSections = (text: string): { [key: string]: string } => {
  const sections: { [key: string]: string } = {};
  
  const sectionPatterns = {
    contact: /(?:CONTACT|PERSONAL\s+INFORMATION|CONTACT\s+INFORMATION)/i,
    summary: /(?:SUMMARY|PROFILE|OBJECTIVE|CAREER\s+OBJECTIVE|PROFESSIONAL\s+SUMMARY)/i,
    experience: /(?:EXPERIENCE|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY)/i,
    education: /(?:EDUCATION|ACADEMIC\s+BACKGROUND|EDUCATIONAL\s+BACKGROUND)/i,
    skills: /(?:SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|COMPETENCIES)/i,
    certifications: /(?:CERTIFICATIONS?|LICENSES?|CREDENTIALS?)/i,
    projects: /(?:PROJECTS?|NOTABLE\s+PROJECTS?|PERSONAL\s+PROJECTS?)/i,
    languages: /(?:LANGUAGES?|LANGUAGE\s+SKILLS?)/i,
  };
  
  const lines = text.split('\n');
  let currentSection = 'other';
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if this line is a section header
    let isHeader = false;
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine)) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        
        currentSection = sectionName;
        currentContent = [];
        isHeader = true;
        break;
      }
    }
    
    if (!isHeader) {
      currentContent.push(trimmedLine);
    }
  }
  
  // Save final section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
};