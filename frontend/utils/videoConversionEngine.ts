import { 
  VideoConversionJob, 
  VideoConversionOptions, 
  VideoFile, 
  VideoConversionProgress,
  VideoConversionEvent,
  VideoFormat,
  VideoBatchJob
} from '../types/video';
import { videoPathFinder, videoFormatUtils } from './videoConversionMaps';
import { VideoMetadataExtractor } from './videoMetadataExtractor';

export class VideoConversionEngine {
  private static instance: VideoConversionEngine;
  private activeJobs: Map<string, VideoConversionJob> = new Map();
  private eventListeners: Map<string, (event: VideoConversionEvent) => void> = new Map();
  private metadataExtractor: VideoMetadataExtractor;

  private constructor() {
    this.metadataExtractor = VideoMetadataExtractor.getInstance();
  }

  public static getInstance(): VideoConversionEngine {
    if (!VideoConversionEngine.instance) {
      VideoConversionEngine.instance = new VideoConversionEngine();
    }
    return VideoConversionEngine.instance;
  }

  /**
   * Inicia una conversión de video
   */
  async startConversion(
    inputFile: VideoFile,
    options: VideoConversionOptions
  ): Promise<string> {
    const jobId = this.generateJobId();
    
    const job: VideoConversionJob = {
      id: jobId,
      inputFile,
      options,
      status: 'pending',
      progress: 0,
      startTime: new Date(),
      currentStep: 'Iniciando conversión...'
    };

    this.activeJobs.set(jobId, job);
    this.emitEvent({ type: 'started', data: { jobId } });

    // Procesar conversión de forma asíncrona
    this.processConversion(job).catch(error => {
      this.handleConversionError(jobId, error);
    });

    return jobId;
  }

  /**
   * Procesa la conversión de video
   */
  private async processConversion(job: VideoConversionJob): Promise<void> {
    try {
      const { inputFile, options } = job;

      // Paso 1: Validar entrada
      this.updateJobProgress(job.id, 5, 'Validando archivo de entrada...');
      await this.validateInput(inputFile, options);

      // Paso 2: Analizar video
      this.updateJobProgress(job.id, 15, 'Analizando video...');
      const analysis = await this.analyzeVideo(inputFile);

      // Paso 3: Optimizar configuración
      this.updateJobProgress(job.id, 25, 'Optimizando configuración...');
      const optimizedOptions = await this.optimizeConversionOptions(options, analysis);

      // Paso 4: Preparar conversión
      this.updateJobProgress(job.id, 35, 'Preparando conversión...');
      const conversionConfig = await this.prepareConversion(inputFile, optimizedOptions);

      // Paso 5: Ejecutar conversión
      this.updateJobProgress(job.id, 45, 'Convirtiendo video...');
      const outputFile = await this.executeConversion(inputFile, conversionConfig);

      // Paso 6: Post-procesamiento
      this.updateJobProgress(job.id, 85, 'Finalizando...');
      const finalOutput = await this.postProcess(outputFile, optimizedOptions);

      // Paso 7: Completar
      this.updateJobProgress(job.id, 100, 'Conversión completada');
      this.completeJob(job.id, finalOutput);

    } catch (error) {
      this.handleConversionError(job.id, error);
    }
  }

  /**
   * Valida la entrada de conversión
   */
  private async validateInput(
    inputFile: VideoFile, 
    options: VideoConversionOptions
  ): Promise<void> {
    // Verificar que el formato de entrada sea soportado
    if (!videoFormatUtils.isFormatSupported(inputFile.format)) {
      throw new Error(`Formato de entrada no soportado: ${inputFile.format}`);
    }

    // Verificar que la conversión sea posible
    const conversionPath = videoPathFinder.findConversionPath(
      inputFile.format, 
      options.outputFormat
    );
    
    if (!conversionPath) {
      throw new Error(
        `No se puede convertir de ${inputFile.format} a ${options.outputFormat}`
      );
    }

    // Validar opciones de conversión
    if (options.customWidth && options.customWidth < 1) {
      throw new Error('Ancho personalizado debe ser mayor a 0');
    }

    if (options.customHeight && options.customHeight < 1) {
      throw new Error('Alto personalizado debe ser mayor a 0');
    }

    if (options.startTime && options.endTime && options.startTime >= options.endTime) {
      throw new Error('Tiempo de inicio debe ser menor al tiempo de fin');
    }
  }

  /**
   * Analiza el video de entrada
   */
  private async analyzeVideo(inputFile: VideoFile): Promise<{
    metadata: any;
    quality: any;
    motion: any;
  }> {
    const metadata = inputFile.metadata || await this.metadataExtractor.extractMetadata(inputFile.file);
    const quality = this.metadataExtractor.analyzeVideoQuality(metadata);
    const motion = await this.metadataExtractor.analyzeMotionLevel(inputFile.file);

    return { metadata, quality, motion };
  }

  /**
   * Optimiza las opciones de conversión
   */
  private async optimizeConversionOptions(
    options: VideoConversionOptions,
    analysis: any
  ): Promise<VideoConversionOptions> {
    const optimized = { ...options };
    const { metadata, quality, motion } = analysis;

    // Optimizar bitrate basado en el análisis
    if (!optimized.videoBitrate) {
      const targetWidth = optimized.customWidth || metadata.width;
      const targetHeight = optimized.customHeight || metadata.height;
      const targetFps = optimized.fps || metadata.fps;
      
      optimized.videoBitrate = videoFormatUtils.calculateOptimalBitrate(
        targetWidth, 
        targetHeight, 
        targetFps
      );

      // Ajustar según nivel de movimiento
      if (motion.level === 'high') {
        optimized.videoBitrate *= 1.3;
      } else if (motion.level === 'low') {
        optimized.videoBitrate *= 0.8;
      }
    }

    // Optimizar codec según formato
    if (!optimized.videoCodec) {
      const recommended = videoFormatUtils.getRecommendedCodec(optimized.outputFormat);
      optimized.videoCodec = recommended.video;
    }

    if (!optimized.audioCodec && !optimized.removeAudio) {
      const recommended = videoFormatUtils.getRecommendedCodec(optimized.outputFormat);
      optimized.audioCodec = recommended.audio;
    }

    // Optimizar para plataforma específica
    if (optimized.platform && optimized.platform !== 'custom') {
      const preset = videoFormatUtils.getPlatformPreset(optimized.platform);
      if (preset) {
        optimized.videoBitrate = Math.min(optimized.videoBitrate, preset.recommendedBitrate);
        
        if (preset.maxWidth && preset.maxHeight) {
          optimized.customWidth = Math.min(optimized.customWidth || metadata.width, preset.maxWidth);
          optimized.customHeight = Math.min(optimized.customHeight || metadata.height, preset.maxHeight);
        }
      }
    }

    return optimized;
  }

  /**
   * Prepara la configuración de conversión
   */
  private async prepareConversion(
    inputFile: VideoFile,
    options: VideoConversionOptions
  ): Promise<any> {
    // En una implementación real, aquí se prepararían los parámetros
    // para FFmpeg o la librería de conversión utilizada
    
    const config = {
      input: inputFile,
      output: {
        format: options.outputFormat,
        codec: options.videoCodec,
        audioCodec: options.audioCodec,
        width: options.customWidth,
        height: options.customHeight,
        fps: options.fps,
        videoBitrate: options.videoBitrate,
        audioBitrate: options.audioBitrate,
        preserveAspectRatio: options.preserveAspectRatio,
        removeAudio: options.removeAudio
      },
      filters: [],
      trim: options.startTime || options.endTime ? {
        start: options.startTime || 0,
        end: options.endTime
      } : undefined
    };

    return config;
  }

  /**
   * Ejecuta la conversión (simulada)
   */
  private async executeConversion(
    inputFile: VideoFile,
    config: any
  ): Promise<any> {
    // Simular conversión con progreso
    const steps = 10;
    const stepDuration = 1000; // 1 segundo por paso
    
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      const progress = 45 + (i + 1) * (40 / steps); // 45% a 85%
      const step = `Procesando frame ${i * 100 + 100}/${steps * 100}...`;
      
      this.updateJobProgress(inputFile.name, progress, step);
    }

    // Simular archivo de salida
    const outputFileName = this.generateOutputFileName(inputFile.name, config.output.format);
    const estimatedSize = videoFormatUtils.estimateFileSize(
      inputFile.metadata?.duration || 60,
      config.output.videoBitrate || 2000,
      config.output.audioBitrate || 128
    );

    return {
      name: outputFileName,
      size: estimatedSize,
      url: `blob:${window.location.origin}/${Date.now()}`,
      downloadUrl: `blob:${window.location.origin}/${Date.now()}`
    };
  }

  /**
   * Post-procesamiento
   */
  private async postProcess(outputFile: any, options: VideoConversionOptions): Promise<any> {
    // Aquí se podrían aplicar filtros adicionales, optimizaciones, etc.
    
    if (options.optimizeForWeb) {
      // Optimizar para web (mover metadatos al inicio del archivo, etc.)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return outputFile;
  }

  /**
   * Actualiza el progreso de un trabajo
   */
  private updateJobProgress(jobId: string, progress: number, step: string): void {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    job.progress = Math.min(100, Math.max(0, progress));
    job.currentStep = step;
    job.status = 'processing';

    // Estimar tiempo restante
    const elapsed = Date.now() - job.startTime.getTime();
    const estimatedTotal = elapsed / (progress / 100);
    job.estimatedTimeRemaining = Math.max(0, (estimatedTotal - elapsed) / 1000);

    this.activeJobs.set(jobId, job);
    
    this.emitEvent({
      type: 'progress',
      data: {
        jobId,
        progress: job.progress,
        currentStep: step,
        estimatedTimeRemaining: job.estimatedTimeRemaining || 0
      }
    });
  }

  /**
   * Completa un trabajo exitosamente
   */
  private completeJob(jobId: string, outputFile: any): void {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    job.status = 'completed';
    job.progress = 100;
    job.endTime = new Date();
    job.outputFile = outputFile;
    job.currentStep = 'Completado';

    this.activeJobs.set(jobId, job);
    this.emitEvent({ type: 'completed', data: job });
  }

  /**
   * Maneja errores de conversión
   */
  private handleConversionError(jobId: string, error: any): void {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    job.status = 'failed';
    job.endTime = new Date();
    job.error = error.message || 'Error desconocido en la conversión';

    this.activeJobs.set(jobId, job);
    this.emitEvent({ 
      type: 'failed', 
      data: { jobId, error: job.error } 
    });
  }

  /**
   * Cancela un trabajo
   */
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    job.status = 'cancelled';
    job.endTime = new Date();
    this.activeJobs.set(jobId, job);
    
    this.emitEvent({ type: 'cancelled', data: { jobId } });
    return true;
  }

  /**
   * Obtiene el estado de un trabajo
   */
  getJobStatus(jobId: string): VideoConversionJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Obtiene todos los trabajos activos
   */
  getActiveJobs(): VideoConversionJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Limpia trabajos completados
   */
  cleanupCompletedJobs(): void {
    for (const [jobId, job] of this.activeJobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        const timeSinceEnd = job.endTime ? Date.now() - job.endTime.getTime() : 0;
        if (timeSinceEnd > 3600000) { // 1 hora
          this.activeJobs.delete(jobId);
        }
      }
    }
  }

  /**
   * Suscribirse a eventos de conversión
   */
  addEventListener(jobId: string, callback: (event: VideoConversionEvent) => void): void {
    this.eventListeners.set(jobId, callback);
  }

  /**
   * Desuscribirse de eventos
   */
  removeEventListener(jobId: string): void {
    this.eventListeners.delete(jobId);
  }

  /**
   * Emite un evento
   */
  private emitEvent(event: VideoConversionEvent): void {
    // Emitir a listeners específicos del job
    if ('jobId' in event.data) {
      const callback = this.eventListeners.get(event.data.jobId);
      if (callback) {
        callback(event);
      }
    }

    // Emitir a listeners globales
    const globalCallback = this.eventListeners.get('*');
    if (globalCallback) {
      globalCallback(event);
    }
  }

  /**
   * Procesamiento por lotes
   */
  async startBatchConversion(
    files: VideoFile[],
    options: VideoConversionOptions
  ): Promise<string> {
    const batchId = this.generateJobId();
    
    const batchJob: VideoBatchJob = {
      id: batchId,
      files,
      options,
      status: 'pending',
      progress: 0,
      completedFiles: 0,
      totalFiles: files.length,
      startTime: new Date(),
      results: []
    };

    // Procesar archivos secuencialmente
    for (let i = 0; i < files.length; i++) {
      try {
        batchJob.currentFile = files[i].name;
        batchJob.status = 'processing';
        
        const jobId = await this.startConversion(files[i], options);
        
        // Esperar a que complete
        await this.waitForJobCompletion(jobId);
        
        const result = this.getJobStatus(jobId);
        if (result) {
          batchJob.results.push(result);
        }
        
        batchJob.completedFiles = i + 1;
        batchJob.progress = (batchJob.completedFiles / batchJob.totalFiles) * 100;
        
      } catch (error) {
        console.error(`Error procesando archivo ${files[i].name}:`, error);
      }
    }

    batchJob.status = 'completed';
    batchJob.endTime = new Date();
    
    return batchId;
  }

  /**
   * Espera a que un trabajo complete
   */
  private async waitForJobCompletion(jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        const job = this.getJobStatus(jobId);
        if (!job) {
          reject(new Error('Trabajo no encontrado'));
          return;
        }

        if (job.status === 'completed') {
          resolve();
        } else if (job.status === 'failed') {
          reject(new Error(job.error || 'Conversión falló'));
        } else {
          setTimeout(checkStatus, 1000);
        }
      };

      checkStatus();
    });
  }

  // Métodos auxiliares

  private generateJobId(): string {
    return `video_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOutputFileName(inputName: string, outputFormat: VideoFormat): string {
    const baseName = inputName.replace(/\.[^/.]+$/, '');
    return `${baseName}_converted.${outputFormat}`;
  }
}

