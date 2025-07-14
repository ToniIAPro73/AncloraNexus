import { 
  VideoFile, 
  VideoConversionOptions, 
  VideoConversionJob, 
  VideoValidationResult,
  VideoFormat,
  VideoPlatform,
  VideoConversionHistory,
  VideoConversionStats
} from '../types/video';
import { VideoConversionEngine } from '../utils/videoConversionEngine';
import { VideoMetadataExtractor } from '../utils/videoMetadataExtractor';
import { videoFormatUtils, videoPathFinder } from '../utils/videoConversionMaps';

export class VideoConversionService {
  private static instance: VideoConversionService;
  private conversionEngine: VideoConversionEngine;
  private metadataExtractor: VideoMetadataExtractor;
  private conversionHistory: VideoConversionHistory;

  private constructor() {
    this.conversionEngine = VideoConversionEngine.getInstance();
    this.metadataExtractor = VideoMetadataExtractor.getInstance();
    this.conversionHistory = this.loadConversionHistory();
  }

  public static getInstance(): VideoConversionService {
    if (!VideoConversionService.instance) {
      VideoConversionService.instance = new VideoConversionService();
    }
    return VideoConversionService.instance;
  }

  /**
   * Valida un archivo de video
   */
  async validateFile(file: File): Promise<{
    success: boolean;
    data?: VideoValidationResult;
    error?: string;
  }> {
    try {
      // Validación básica del archivo
      const basicValidation = await this.metadataExtractor.validateVideoFile(file);
      
      if (!basicValidation.isValid) {
        return {
          success: false,
          error: basicValidation.error || 'Archivo de video inválido'
        };
      }

      const format = basicValidation.format!;

      // Extraer metadatos completos
      const metadata = await this.metadataExtractor.extractMetadata(file);
      
      // Analizar calidad
      const qualityAnalysis = this.metadataExtractor.analyzeVideoQuality(metadata);
      
      // Obtener formatos de salida soportados
      const supportedOutputFormats = videoPathFinder.getDirectConversions(format);

      // Generar recomendaciones
      const recommendations = await this.generateRecommendations(file, metadata);

      const validationResult: VideoValidationResult = {
        isValid: true,
        format,
        metadata,
        issues: qualityAnalysis.issues.map(issue => ({
          type: 'warning',
          code: 'QUALITY_ISSUE',
          message: issue,
          description: issue
        })),
        recommendations,
        supportedOutputFormats
      };

      return {
        success: true,
        data: validationResult
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error validando archivo de video'
      };
    }
  }

  /**
   * Inicia una conversión de video
   */
  async startConversion(
    file: File,
    options: VideoConversionOptions
  ): Promise<{
    success: boolean;
    data?: string; // jobId
    error?: string;
  }> {
    try {
      // Validar archivo primero
      const validation = await this.validateFile(file);
      if (!validation.success || !validation.data) {
        return {
          success: false,
          error: validation.error || 'Archivo inválido'
        };
      }

      // Crear VideoFile
      const videoFile: VideoFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        format: validation.data.format,
        file,
        metadata: validation.data.metadata
      };

      // Generar thumbnail
      try {
        const thumbnail = await this.metadataExtractor.generateThumbnail(file);
        videoFile.thumbnail = thumbnail;
      } catch (error) {
        console.warn('No se pudo generar thumbnail:', error);
      }

      // Validar opciones de conversión
      const validationError = this.validateConversionOptions(options, validation.data);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      // Iniciar conversión
      const jobId = await this.conversionEngine.startConversion(videoFile, options);

      // Agregar al historial
      this.addToHistory(videoFile, options, jobId);

      return {
        success: true,
        data: jobId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error iniciando conversión'
      };
    }
  }

  /**
   * Obtiene el estado de una conversión
   */
  getConversionStatus(jobId: string): VideoConversionJob | null {
    return this.conversionEngine.getJobStatus(jobId);
  }

  /**
   * Cancela una conversión
   */
  cancelConversion(jobId: string): boolean {
    return this.conversionEngine.cancelJob(jobId);
  }

  /**
   * Obtiene todas las conversiones activas
   */
  getActiveConversions(): VideoConversionJob[] {
    return this.conversionEngine.getActiveJobs();
  }

  /**
   * Obtiene el historial de conversiones
   */
  getConversionHistory(): VideoConversionHistory {
    return this.conversionHistory;
  }

  /**
   * Limpia el historial de conversiones
   */
  clearHistory(): void {
    this.conversionHistory = {
      jobs: [],
      stats: this.calculateStats([]),
      lastUpdated: new Date()
    };
    this.saveConversionHistory();
  }

  /**
   * Obtiene formatos soportados para un archivo
   */
  getSupportedFormats(inputFormat: VideoFormat): VideoFormat[] {
    return videoPathFinder.getDirectConversions(inputFormat);
  }

  /**
   * Obtiene presets de plataforma
   */
  getPlatformPresets(): Array<{
    platform: VideoPlatform;
    name: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        platform: 'youtube',
        name: 'YouTube',
        description: 'Optimizado para YouTube en alta calidad',
        icon: '📺'
      },
      {
        platform: 'instagram',
        name: 'Instagram',
        description: 'Formato cuadrado para feed de Instagram',
        icon: '📷'
      },
      {
        platform: 'tiktok',
        name: 'TikTok',
        description: 'Formato vertical para TikTok',
        icon: '🎵'
      },
      {
        platform: 'twitter',
        name: 'Twitter',
        description: 'Optimizado para Twitter',
        icon: '🐦'
      },
      {
        platform: 'web',
        name: 'Web',
        description: 'Optimizado para reproducción web',
        icon: '🌐'
      }
    ];
  }

  /**
   * Obtiene configuración recomendada para una plataforma
   */
  getPlatformConfiguration(platform: VideoPlatform): Partial<VideoConversionOptions> | null {
    const preset = videoFormatUtils.getPlatformPreset(platform);
    if (!preset) return null;

    return {
      outputFormat: preset.recommendedFormat,
      videoCodec: preset.recommendedCodec,
      videoBitrate: preset.recommendedBitrate,
      customWidth: preset.maxWidth,
      customHeight: preset.maxHeight,
      fps: preset.fps,
      platform,
      optimizeForWeb: true,
      preserveAspectRatio: true
    };
  }

  /**
   * Estima el tamaño del archivo de salida
   */
  estimateOutputSize(
    inputMetadata: any,
    options: VideoConversionOptions
  ): {
    estimatedSize: number;
    compressionRatio: number;
    formattedSize: string;
  } {
    const duration = inputMetadata.duration;
    const videoBitrate = options.videoBitrate || 2000;
    const audioBitrate = options.removeAudio ? 0 : (options.audioBitrate || 128);
    
    const estimatedSize = videoFormatUtils.estimateFileSize(duration, videoBitrate, audioBitrate);
    const compressionRatio = inputMetadata.fileSize > 0 ? estimatedSize / inputMetadata.fileSize : 1;
    const formattedSize = videoFormatUtils.formatFileSize(estimatedSize);

    return {
      estimatedSize,
      compressionRatio,
      formattedSize
    };
  }

  /**
   * Suscribirse a eventos de conversión
   */
  addEventListener(jobId: string, callback: (event: any) => void): void {
    this.conversionEngine.addEventListener(jobId, callback);
  }

  /**
   * Desuscribirse de eventos
   */
  removeEventListener(jobId: string): void {
    this.conversionEngine.removeEventListener(jobId);
  }

  // Métodos privados

  private async generateRecommendations(file: File, metadata: any): Promise<any[]> {
    const recommendations = [];

    // Recomendación de formato
    if (metadata.width >= 1920 && metadata.height >= 1080) {
      recommendations.push({
        type: 'format',
        title: 'Formato recomendado',
        description: 'Para videos HD, recomendamos MP4 con H.264 para máxima compatibilidad',
        action: 'Usar MP4'
      });
    }

    // Recomendación de plataforma
    const aspectRatio = metadata.width / metadata.height;
    if (Math.abs(aspectRatio - 1) < 0.1) {
      recommendations.push({
        type: 'platform',
        title: 'Formato cuadrado detectado',
        description: 'Este formato es ideal para Instagram Feed',
        action: 'Optimizar para Instagram'
      });
    } else if (aspectRatio < 0.7) {
      recommendations.push({
        type: 'platform',
        title: 'Formato vertical detectado',
        description: 'Este formato es ideal para TikTok o Instagram Stories',
        action: 'Optimizar para TikTok'
      });
    }

    // Recomendación de calidad
    if (metadata.bitrate > 10000) {
      recommendations.push({
        type: 'optimization',
        title: 'Archivo grande detectado',
        description: 'Puedes reducir el tamaño sin perder calidad significativa',
        action: 'Comprimir video'
      });
    }

    return recommendations;
  }

  private validateConversionOptions(
    options: VideoConversionOptions,
    validation: VideoValidationResult
  ): string | null {
    // Verificar que el formato de salida sea soportado
    if (!validation.supportedOutputFormats.includes(options.outputFormat)) {
      return `No se puede convertir ${validation.format} a ${options.outputFormat}`;
    }

    // Verificar dimensiones personalizadas
    if (options.customWidth && options.customWidth < 1) {
      return 'El ancho debe ser mayor a 0';
    }

    if (options.customHeight && options.customHeight < 1) {
      return 'La altura debe ser mayor a 0';
    }

    // Verificar tiempos de recorte
    if (options.startTime && options.startTime < 0) {
      return 'El tiempo de inicio no puede ser negativo';
    }

    if (options.endTime && options.endTime <= 0) {
      return 'El tiempo de fin debe ser mayor a 0';
    }

    if (options.startTime && options.endTime && options.startTime >= options.endTime) {
      return 'El tiempo de inicio debe ser menor al tiempo de fin';
    }

    if (options.endTime && options.endTime > validation.metadata.duration) {
      return 'El tiempo de fin no puede ser mayor a la duración del video';
    }

    return null;
  }

  private addToHistory(
    videoFile: VideoFile,
    options: VideoConversionOptions,
    jobId: string
  ): void {
    // Agregar al historial cuando el job complete
    this.conversionEngine.addEventListener(jobId, (event) => {
      if (event.type === 'completed') {
        this.conversionHistory.jobs.unshift(event.data);
        this.conversionHistory.stats = this.calculateStats(this.conversionHistory.jobs);
        this.conversionHistory.lastUpdated = new Date();
        this.saveConversionHistory();
      }
    });
  }

  private calculateStats(jobs: VideoConversionJob[]): VideoConversionStats {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const failedJobs = jobs.filter(job => job.status === 'failed');

    const totalProcessingTime = completedJobs.reduce((total, job) => {
      if (job.endTime && job.startTime) {
        return total + (job.endTime.getTime() - job.startTime.getTime()) / 1000;
      }
      return total;
    }, 0);

    const averageProcessingTime = completedJobs.length > 0 
      ? totalProcessingTime / completedJobs.length 
      : 0;

    const totalInputSize = completedJobs.reduce((total, job) => total + job.inputFile.size, 0);
    const totalOutputSize = completedJobs.reduce((total, job) => {
      return total + (job.outputFile?.size || 0);
    }, 0);

    const compressionRatio = totalInputSize > 0 ? (totalOutputSize / totalInputSize) * 100 : 100;

    // Formatos populares
    const formatCounts = new Map<VideoFormat, number>();
    completedJobs.forEach(job => {
      const format = job.options.outputFormat;
      formatCounts.set(format, (formatCounts.get(format) || 0) + 1);
    });

    const popularFormats = Array.from(formatCounts.entries())
      .map(([format, count]) => ({ format, count }))
      .sort((a, b) => b.count - a.count);

    // Plataformas populares
    const platformCounts = new Map<VideoPlatform, number>();
    completedJobs.forEach(job => {
      if (job.options.platform) {
        const platform = job.options.platform;
        platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1);
      }
    });

    const popularPlatforms = Array.from(platformCounts.entries())
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      totalProcessingTime,
      averageProcessingTime,
      totalInputSize,
      totalOutputSize,
      compressionRatio,
      popularFormats,
      popularPlatforms
    };
  }

  private loadConversionHistory(): VideoConversionHistory {
    try {
      const stored = localStorage.getItem('anclora_video_conversion_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        };
      }
    } catch (error) {
      console.warn('Error cargando historial de conversiones:', error);
    }

    return {
      jobs: [],
      stats: this.calculateStats([]),
      lastUpdated: new Date()
    };
  }

  private saveConversionHistory(): void {
    try {
      // Mantener solo los últimos 100 trabajos
      const historyToSave = {
        ...this.conversionHistory,
        jobs: this.conversionHistory.jobs.slice(0, 100)
      };
      
      localStorage.setItem('anclora_video_conversion_history', JSON.stringify(historyToSave));
    } catch (error) {
      console.warn('Error guardando historial de conversiones:', error);
    }
  }
}

