import { EbookConversionJob, EbookConversionOptions, EbookFile } from '../types/ebook';
import { findBestConversionPath, getAvailableConversions } from './ebookConversionMaps';

// Interfaz para el resultado de conversión
interface ConversionResult {
  success: boolean;
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

// Interfaz para callbacks de progreso
interface ProgressCallback {
  (progress: number, status: string): void;
}

// Motor de conversión de e-books
export class EbookConversionEngine {
  private static instance: EbookConversionEngine;
  private activeJobs: Map<string, EbookConversionJob> = new Map();
  private progressCallbacks: Map<string, ProgressCallback> = new Map();

  private constructor() {}

  static getInstance(): EbookConversionEngine {
    if (!EbookConversionEngine.instance) {
      EbookConversionEngine.instance = new EbookConversionEngine();
    }
    return EbookConversionEngine.instance;
  }

  /**
   * Inicia una conversión de e-book
   */
  async startConversion(
    inputFile: EbookFile,
    outputFormat: string,
    options: EbookConversionOptions,
    progressCallback?: ProgressCallback
  ): Promise<string> {
    const jobId = this.generateJobId();
    
    const job: EbookConversionJob = {
      id: jobId,
      inputFile,
      outputFormat: outputFormat.toLowerCase(),
      options,
      status: 'pending',
      progress: 0,
      startedAt: new Date()
    };

    this.activeJobs.set(jobId, job);
    
    if (progressCallback) {
      this.progressCallbacks.set(jobId, progressCallback);
    }

    // Iniciar conversión asíncrona
    this.processConversion(jobId);
    
    return jobId;
  }

  /**
   * Obtiene el estado de una conversión
   */
  getJobStatus(jobId: string): EbookConversionJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Cancela una conversión en progreso
   */
  cancelConversion(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (job && job.status === 'processing') {
      job.status = 'failed';
      job.error = {
        code: 'CANCELLED',
        message: 'Conversión cancelada por el usuario'
      };
      this.updateProgress(jobId, 0, 'Cancelado');
      return true;
    }
    return false;
  }

  /**
   * Obtiene las conversiones disponibles para un formato
   */
  getAvailableFormats(inputFormat: string): string[] {
    return getAvailableConversions(inputFormat);
  }

  /**
   * Valida si una conversión es posible
   */
  canConvert(fromFormat: string, toFormat: string): boolean {
    const path = findBestConversionPath(fromFormat, toFormat);
    return path !== null;
  }

  /**
   * Estima el tiempo de conversión
   */
  estimateConversionTime(fromFormat: string, toFormat: string, fileSize: number): number {
    const path = findBestConversionPath(fromFormat, toFormat);
    if (!path) return 0;
    
    // Ajustar tiempo base según el tamaño del archivo
    const sizeMultiplier = Math.max(1, fileSize / (1024 * 1024)); // MB
    return Math.round(path.estimatedTime * sizeMultiplier);
  }

  /**
   * Procesa la conversión de manera asíncrona
   */
  private async processConversion(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    try {
      // Actualizar estado a procesando
      job.status = 'processing';
      this.updateProgress(jobId, 10, 'Iniciando conversión...');

      // Validar formatos
      const conversionPath = findBestConversionPath(
        job.inputFile.format,
        job.outputFormat
      );

      if (!conversionPath) {
        throw new Error(`No se puede convertir de ${job.inputFile.format} a ${job.outputFormat}`);
      }

      this.updateProgress(jobId, 20, 'Validando archivo...');

      // Simular validación del archivo
      await this.delay(500);

      this.updateProgress(jobId, 30, 'Preparando conversión...');

      // Determinar método de conversión
      if (conversionPath.method === 'direct') {
        await this.performDirectConversion(jobId, job);
      } else {
        await this.performIntermediateConversion(jobId, job, conversionPath.intermediateFormat!);
      }

      // Finalizar conversión
      job.status = 'completed';
      job.completedAt = new Date();
      job.outputFile = {
        path: `/converted/${jobId}.${job.outputFormat}`,
        size: Math.round(job.inputFile.size * 0.8), // Estimación
        downloadUrl: `#download-${jobId}`
      };

      this.updateProgress(jobId, 100, 'Conversión completada');

    } catch (error) {
      job.status = 'failed';
      job.error = {
        code: 'CONVERSION_ERROR',
        message: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      };
      this.updateProgress(jobId, 0, 'Error en la conversión');
    }
  }

  /**
   * Realiza conversión directa
   */
  private async performDirectConversion(jobId: string, job: EbookConversionJob): Promise<void> {
    const steps = [
      { progress: 40, message: 'Leyendo archivo fuente...' },
      { progress: 60, message: 'Aplicando conversión...' },
      { progress: 80, message: 'Optimizando salida...' },
      { progress: 95, message: 'Finalizando...' }
    ];

    for (const step of steps) {
      this.updateProgress(jobId, step.progress, step.message);
      await this.delay(800); // Simular tiempo de procesamiento
    }
  }

  /**
   * Realiza conversión con formato intermedio
   */
  private async performIntermediateConversion(
    jobId: string, 
    job: EbookConversionJob, 
    intermediateFormat: string
  ): Promise<void> {
    const steps = [
      { progress: 35, message: `Convirtiendo a ${intermediateFormat.toUpperCase()}...` },
      { progress: 50, message: 'Procesando formato intermedio...' },
      { progress: 70, message: `Convirtiendo a ${job.outputFormat.toUpperCase()}...` },
      { progress: 85, message: 'Optimizando resultado...' },
      { progress: 95, message: 'Finalizando...' }
    ];

    for (const step of steps) {
      this.updateProgress(jobId, step.progress, step.message);
      await this.delay(1000); // Conversión intermedia toma más tiempo
    }
  }

  /**
   * Actualiza el progreso de una conversión
   */
  private updateProgress(jobId: string, progress: number, status: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.progress = progress;
    }

    const callback = this.progressCallbacks.get(jobId);
    if (callback) {
      callback(progress, status);
    }
  }

  /**
   * Genera un ID único para el trabajo
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utilidad para simular delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpia trabajos completados antiguos
   */
  cleanupOldJobs(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 horas por defecto
    const now = new Date().getTime();
    
    for (const [jobId, job] of this.activeJobs.entries()) {
      if (job.completedAt) {
        const jobAge = now - job.completedAt.getTime();
        if (jobAge > maxAge) {
          this.activeJobs.delete(jobId);
          this.progressCallbacks.delete(jobId);
        }
      }
    }
  }

  /**
   * Obtiene estadísticas de conversiones
   */
  getConversionStats(): {
    total: number;
    completed: number;
    failed: number;
    processing: number;
  } {
    const jobs = Array.from(this.activeJobs.values());
    
    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      processing: jobs.filter(j => j.status === 'processing').length
    };
  }

  /**
   * Obtiene el historial de conversiones
   */
  getConversionHistory(limit: number = 10): EbookConversionJob[] {
    return Array.from(this.activeJobs.values())
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0))
      .slice(0, limit);
  }
}

