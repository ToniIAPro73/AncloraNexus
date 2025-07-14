import { EbookConversionJob, EbookConversionOptions, EbookFile } from '../types/ebook';
import { EbookConversionEngine } from '../utils/ebookConversionEngine';
import { EbookMetadataExtractor } from '../utils/ebookMetadataExtractor';

// Interfaz para el resultado del servicio
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Interfaz para configuración del servicio
interface ServiceConfig {
  maxFileSize: number; // en bytes
  allowedFormats: string[];
  maxConcurrentJobs: number;
}

/**
 * Servicio principal para conversión de e-books
 * Actúa como fachada para todas las operaciones relacionadas con e-books
 */
export class EbookConversionService {
  private static instance: EbookConversionService;
  private conversionEngine: EbookConversionEngine;
  private config: ServiceConfig;
  private activeJobsCount: number = 0;

  private constructor() {
    this.conversionEngine = EbookConversionEngine.getInstance();
    this.config = {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedFormats: ['epub', 'pdf', 'mobi', 'azw', 'azw3', 'txt', 'rtf', 'doc', 'docx', 'html'],
      maxConcurrentJobs: 5
    };
  }

  static getInstance(): EbookConversionService {
    if (!EbookConversionService.instance) {
      EbookConversionService.instance = new EbookConversionService();
    }
    return EbookConversionService.instance;
  }

  /**
   * Valida un archivo antes de la conversión
   */
  async validateFile(file: File): Promise<ServiceResult<EbookFile>> {
    try {
      // Validar tamaño
      if (file.size > this.config.maxFileSize) {
        return {
          success: false,
          error: `El archivo es demasiado grande. Máximo permitido: ${this.config.maxFileSize / 1024 / 1024}MB`
        };
      }

      // Validar formato
      const format = this.extractFileFormat(file.name);
      if (!this.config.allowedFormats.includes(format)) {
        return {
          success: false,
          error: `Formato no soportado: ${format}. Formatos permitidos: ${this.config.allowedFormats.join(', ')}`
        };
      }

      // Extraer metadatos
      const metadataResult = await EbookMetadataExtractor.extractMetadata(file, format);
      
      if (!metadataResult.success) {
        return {
          success: false,
          error: metadataResult.error || 'Error extrayendo metadatos'
        };
      }

      // Crear objeto EbookFile
      const ebookFile: EbookFile = {
        id: this.generateFileId(),
        name: file.name,
        size: file.size,
        format: format,
        path: '', // Se asignará durante el upload
        metadata: metadataResult.metadata,
        uploadedAt: new Date()
      };

      return {
        success: true,
        data: ebookFile
      };

    } catch (error) {
      return {
        success: false,
        error: `Error validando archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Inicia una conversión de e-book
   */
  async startConversion(
    ebookFile: EbookFile,
    targetFormat: string,
    options: Partial<EbookConversionOptions> = {}
  ): Promise<ServiceResult<string>> {
    try {
      // Verificar límite de trabajos concurrentes
      if (this.activeJobsCount >= this.config.maxConcurrentJobs) {
        return {
          success: false,
          error: 'Demasiadas conversiones en progreso. Intenta más tarde.'
        };
      }

      // Validar que la conversión es posible
      if (!this.conversionEngine.canConvert(ebookFile.format, targetFormat)) {
        return {
          success: false,
          error: `No se puede convertir de ${ebookFile.format} a ${targetFormat}`
        };
      }

      // Configurar opciones por defecto
      const conversionOptions: EbookConversionOptions = {
        outputFormat: targetFormat,
        quality: options.quality || 'medium',
        preserveMetadata: options.preserveMetadata !== false,
        optimizeForDevice: options.optimizeForDevice || 'generic',
        embedFonts: options.embedFonts !== false,
        compressImages: options.compressImages !== false,
        ...options
      };

      // Iniciar conversión
      const jobId = await this.conversionEngine.startConversion(
        ebookFile,
        targetFormat,
        conversionOptions,
        (progress, status) => {
          // Callback de progreso - se puede usar para notificaciones en tiempo real
          console.log(`Job ${jobId}: ${progress}% - ${status}`);
        }
      );

      this.activeJobsCount++;

      // Configurar limpieza automática cuando termine el trabajo
      this.scheduleJobCleanup(jobId);

      return {
        success: true,
        data: jobId
      };

    } catch (error) {
      return {
        success: false,
        error: `Error iniciando conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene el estado de una conversión
   */
  getConversionStatus(jobId: string): ServiceResult<EbookConversionJob> {
    try {
      const job = this.conversionEngine.getJobStatus(jobId);
      
      if (!job) {
        return {
          success: false,
          error: 'Trabajo de conversión no encontrado'
        };
      }

      return {
        success: true,
        data: job
      };

    } catch (error) {
      return {
        success: false,
        error: `Error obteniendo estado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Cancela una conversión
   */
  cancelConversion(jobId: string): ServiceResult<boolean> {
    try {
      const cancelled = this.conversionEngine.cancelConversion(jobId);
      
      if (cancelled) {
        this.activeJobsCount = Math.max(0, this.activeJobsCount - 1);
      }

      return {
        success: true,
        data: cancelled
      };

    } catch (error) {
      return {
        success: false,
        error: `Error cancelando conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene formatos disponibles para conversión
   */
  getAvailableFormats(inputFormat: string): ServiceResult<string[]> {
    try {
      const formats = this.conversionEngine.getAvailableFormats(inputFormat);
      
      return {
        success: true,
        data: formats
      };

    } catch (error) {
      return {
        success: false,
        error: `Error obteniendo formatos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Estima el tiempo de conversión
   */
  estimateConversionTime(fromFormat: string, toFormat: string, fileSize: number): ServiceResult<number> {
    try {
      const estimatedTime = this.conversionEngine.estimateConversionTime(fromFormat, toFormat, fileSize);
      
      return {
        success: true,
        data: estimatedTime
      };

    } catch (error) {
      return {
        success: false,
        error: `Error estimando tiempo: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene el historial de conversiones
   */
  getConversionHistory(limit: number = 10): ServiceResult<EbookConversionJob[]> {
    try {
      const history = this.conversionEngine.getConversionHistory(limit);
      
      return {
        success: true,
        data: history
      };

    } catch (error) {
      return {
        success: false,
        error: `Error obteniendo historial: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getServiceStats(): ServiceResult<any> {
    try {
      const engineStats = this.conversionEngine.getConversionStats();
      
      const stats = {
        ...engineStats,
        activeJobs: this.activeJobsCount,
        maxConcurrentJobs: this.config.maxConcurrentJobs,
        supportedFormats: this.config.allowedFormats,
        maxFileSize: this.config.maxFileSize
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      return {
        success: false,
        error: `Error obteniendo estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Actualiza la configuración del servicio
   */
  updateConfig(newConfig: Partial<ServiceConfig>): ServiceResult<ServiceConfig> {
    try {
      this.config = { ...this.config, ...newConfig };
      
      return {
        success: true,
        data: this.config
      };

    } catch (error) {
      return {
        success: false,
        error: `Error actualizando configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  // Métodos privados auxiliares

  private extractFileFormat(filename: string): string {
    const extension = filename.split('.').pop();
    return extension ? extension.toLowerCase() : '';
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleJobCleanup(jobId: string): void {
    // Programar limpieza después de que el trabajo termine
    const checkInterval = setInterval(() => {
      const job = this.conversionEngine.getJobStatus(jobId);
      
      if (job && (job.status === 'completed' || job.status === 'failed')) {
        this.activeJobsCount = Math.max(0, this.activeJobsCount - 1);
        clearInterval(checkInterval);
        
        // Programar limpieza del trabajo después de 1 hora
        setTimeout(() => {
          this.conversionEngine.cleanupOldJobs(60 * 60 * 1000); // 1 hora
        }, 60 * 60 * 1000);
      }
    }, 1000);

    // Limpiar el intervalo después de 10 minutos si el trabajo no termina
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10 * 60 * 1000);
  }
}

