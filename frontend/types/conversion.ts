// Tipos TypeScript para el sistema de conversión extendido
// Integrando e-books con el sistema existente de Anclora
import { FileCategory } from '../utils/conversionMaps';
import { EbookFormat, EbookConversionRequest, EbookConversionResult } from './ebook';
export interface ConversionTask {
  id: string;
  type: 'general' | 'ebook';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  progress: number;
}
export interface GeneralConversionTask extends ConversionTask {
  type: 'general';
  sourceFile: {
    name: string;
    extension: string;
    category: FileCategory;
    size: number;
  };
  targetExtension: string;
  targetCategory: FileCategory;
}
export interface EbookConversionTask extends ConversionTask {
  type: 'ebook';
  conversionRequest: EbookConversionRequest;
  result?: EbookConversionResult;
}
export type ConversionTaskUnion = GeneralConversionTask | EbookConversionTask;
// Extensión del sistema de rutas de conversión para e-books
export interface ExtendedConversionResult {
  optimal: boolean;
  path: string[] | null;
  isEbookConversion: boolean;
  recommendedMethod?: 'calibre' | 'epub-gen' | 'pdf-lib' | 'native';
  estimatedQuality: 'high' | 'medium' | 'low';
  preservesMetadata: boolean;
}
// Configuración para el motor de conversión extendido
export interface ConversionEngineConfig {
  enableEbookOptimizations: boolean;
  preferredEbookMethod: 'calibre' | 'mixed';
  maxFileSize: number; // en MB
  timeoutDuration: number; // en segundos
  retryAttempts: number;
  preserveOriginalMetadata: boolean;
}
// Tipos para estadísticas de conversión
export interface ConversionStats {
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  averageConversionTime: number;
  popularConversions: Array<{
    from: string;
    to: string;
    count: number;
  }>;
  ebookConversionStats: {
    totalEbookConversions: number;
    mostRequestedFormat: EbookFormat;
    averageEbookConversionTime: number;
  };
}