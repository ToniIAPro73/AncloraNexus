// Tipos específicos para funcionalidad de e-books

export interface EbookMetadata {
  title?: string;
  author?: string;
  publisher?: string;
  publishDate?: string;
  isbn?: string;
  language?: string;
  description?: string;
  coverImage?: string;
  pageCount?: number;
  fileSize?: number;
  format: string;
}

export interface EbookFile {
  id: string;
  name: string;
  size: number;
  format: string;
  path: string;
  metadata?: EbookMetadata;
  uploadedAt: Date;
}

export interface EbookConversionOptions {
  outputFormat: string;
  quality?: 'low' | 'medium' | 'high';
  preserveMetadata?: boolean;
  optimizeForDevice?: 'kindle' | 'kobo' | 'generic';
  customCss?: string;
  embedFonts?: boolean;
  compressImages?: boolean;
}

export interface EbookConversionJob {
  id: string;
  inputFile: EbookFile;
  outputFormat: string;
  options: EbookConversionOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  outputFile?: {
    path: string;
    size: number;
    downloadUrl: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface EbookFormat {
  extension: string;
  name: string;
  description: string;
  mimeType: string;
  supportsMetadata: boolean;
  supportsImages: boolean;
  supportsDRM: boolean;
  isProprietaryFormat: boolean;
}

export interface EbookConversionPath {
  from: string;
  to: string;
  method: 'direct' | 'intermediate';
  intermediateFormat?: string;
  estimatedTime: number; // en segundos
  qualityLoss: 'none' | 'minimal' | 'moderate' | 'high';
}

export interface EbookValidationResult {
  isValid: boolean;
  format: string;
  errors: string[];
  warnings: string[];
  metadata?: EbookMetadata;
  fileInfo: {
    size: number;
    lastModified: Date;
    encoding?: string;
  };
}

// Tipos para configuración de formatos específicos
export interface EPUBConfig {
  version: '2.0' | '3.0';
  includeNCX: boolean;
  splitChapters: boolean;
  chapterSplitSize?: number; // en KB
}

export interface PDFConfig {
  pageSize: 'A4' | 'Letter' | 'Custom';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  embedFonts: boolean;
  imageQuality: number; // 0-100
}

export interface MOBIConfig {
  kindleGeneration: 'old' | 'new';
  compression: 'none' | 'low' | 'medium' | 'high';
  includeOriginalImages: boolean;
}

export type FormatSpecificConfig = EPUBConfig | PDFConfig | MOBIConfig;

// Eventos para tracking de conversión
export interface EbookConversionEvent {
  jobId: string;
  type: 'started' | 'progress' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  data?: any;
}

// Estadísticas de uso
export interface EbookConversionStats {
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  mostPopularFormats: {
    input: Record<string, number>;
    output: Record<string, number>;
  };
  averageConversionTime: number;
  totalDataProcessed: number; // en bytes
}

