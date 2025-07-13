// Tipos TypeScript para funcionalidad de conversión de libros electrónicos
// Siguiendo convenciones de la guía de estilos Anclora
export enum EbookFormat {
  EPUB = 'epub',
  MOBI = 'mobi',
  AZW = 'azw',
  AZW3 = 'azw3',
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  HTML = 'html',
  RTF = 'rtf',
  TXT = 'txt',
  PDB = 'pdb',
  LRF = 'lrf',
  OEB = 'oeb'
}
export interface EbookMetadata {
  title?: string;
  author?: string;
  publisher?: string;
  publishedDate?: string;
  isbn?: string;
  language?: string;
  description?: string;
  genre?: string[];
  coverImage?: string;
  pageCount?: number;
  fileSize?: number;
  format: EbookFormat;
}
export interface EbookFile {
  id: string;
  name: string;
  originalName: string;
  format: EbookFormat;
  size: number;
  uploadDate: Date;
  metadata: EbookMetadata;
  filePath: string;
}
export interface EbookConversionRequest {
  sourceFile: EbookFile;
  targetFormat: EbookFormat;
  preserveMetadata: boolean;
  optimizeForDevice?: 'kindle' | 'kobo' | 'generic';
  compressionLevel?: 'low' | 'medium' | 'high';
  customOptions?: Record<string, any>;
}
export interface EbookConversionResult {
  success: boolean;
  outputFile?: {
    name: string;
    format: EbookFormat;
    size: number;
    downloadUrl: string;
  };
  metadata?: EbookMetadata;
  conversionTime?: number;
  error?: string;
  warnings?: string[];
}
export interface EbookConversionProgress {
  stage: 'upload' | 'analyzing' | 'converting' | 'optimizing' | 'complete' | 'error';
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
}
// Tipos para rutas de conversión específicas de e-books
export interface EbookConversionPath {
  from: EbookFormat;
  to: EbookFormat;
  method: 'direct' | 'intermediate';
  intermediateFormat?: EbookFormat;
  difficulty: 'easy' | 'medium' | 'hard';
  qualityRetention: 'high' | 'medium' | 'low';
  preservesFormatting: boolean;
  preservesImages: boolean;
  preservesMetadata: boolean;
}
// Configuración para conversiones populares
export interface PopularConversion {
  id: string;
  name: string;
  description: string;
  from: EbookFormat;
  to: EbookFormat;
  icon: string;
  popularity: number;
  recommendedSettings: Partial<EbookConversionRequest>;
}