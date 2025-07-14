import { VideoMetadata, VideoFile, VideoFormat } from '../types/video';
import { videoFormatUtils } from './videoConversionMaps';

export class VideoMetadataExtractor {
  private static instance: VideoMetadataExtractor;

  public static getInstance(): VideoMetadataExtractor {
    if (!VideoMetadataExtractor.instance) {
      VideoMetadataExtractor.instance = new VideoMetadataExtractor();
    }
    return VideoMetadataExtractor.instance;
  }

  /**
   * Extrae metadatos de un archivo de video usando la API de HTML5
   */
  async extractMetadata(file: File): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.preload = 'metadata';
      video.muted = true;

      const cleanup = () => {
        URL.revokeObjectURL(url);
        video.remove();
      };

      video.onloadedmetadata = () => {
        try {
          const metadata: VideoMetadata = {
            duration: video.duration || 0,
            width: video.videoWidth || 0,
            height: video.videoHeight || 0,
            fps: this.estimateFPS(video),
            bitrate: this.estimateBitrate(file.size, video.duration),
            codec: 'unknown', // No disponible en HTML5 API
            audioCodec: undefined,
            audioChannels: undefined,
            audioSampleRate: undefined,
            fileSize: file.size,
            hasAudio: this.hasAudioTrack(video),
            hasVideo: video.videoWidth > 0 && video.videoHeight > 0,
            aspectRatio: this.calculateAspectRatio(video.videoWidth, video.videoHeight),
            colorSpace: undefined,
            profile: undefined,
            level: undefined
          };

          cleanup();
          resolve(metadata);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Error al cargar el video para extraer metadatos'));
      };

      video.ontimeout = () => {
        cleanup();
        reject(new Error('Timeout al extraer metadatos del video'));
      };

      // Timeout de seguridad
      setTimeout(() => {
        if (video.readyState < 1) {
          cleanup();
          reject(new Error('Timeout al cargar metadatos del video'));
        }
      }, 10000);

      video.src = url;
    });
  }

  /**
   * Genera un thumbnail del video
   */
  async generateThumbnail(file: File, timeOffset: number = 1): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      video.preload = 'metadata';
      video.muted = true;

      const cleanup = () => {
        URL.revokeObjectURL(url);
        video.remove();
        canvas.remove();
      };

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = Math.min(timeOffset, video.duration * 0.1);
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          cleanup();
          resolve(thumbnail);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Error al generar thumbnail del video'));
      };

      video.src = url;
    });
  }

  /**
   * Genera múltiples thumbnails para preview
   */
  async generatePreviewThumbnails(file: File, count: number = 5): Promise<string[]> {
    const metadata = await this.extractMetadata(file);
    const duration = metadata.duration;
    const thumbnails: string[] = [];

    if (duration <= 0) {
      throw new Error('No se pudo determinar la duración del video');
    }

    const interval = duration / (count + 1);

    for (let i = 1; i <= count; i++) {
      try {
        const timeOffset = interval * i;
        const thumbnail = await this.generateThumbnail(file, timeOffset);
        thumbnails.push(thumbnail);
      } catch (error) {
        console.warn(`Error generando thumbnail ${i}:`, error);
        // Continuar con los demás thumbnails
      }
    }

    return thumbnails;
  }

  /**
   * Valida si el archivo es un video válido
   */
  async validateVideoFile(file: File): Promise<{
    isValid: boolean;
    format?: VideoFormat;
    error?: string;
  }> {
    try {
      // Verificar extensión
      const format = videoFormatUtils.getFormatFromExtension(file.name);
      if (!format) {
        return {
          isValid: false,
          error: 'Extensión de archivo no soportada'
        };
      }

      // Verificar MIME type
      const expectedMimeType = videoFormatUtils.getMimeTypeFromFormat(format);
      if (file.type && !file.type.startsWith('video/') && format !== 'gif') {
        return {
          isValid: false,
          error: 'Tipo de archivo no es video'
        };
      }

      // Verificar tamaño
      const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: 'Archivo demasiado grande (máximo 10GB)'
        };
      }

      // Intentar extraer metadatos básicos
      try {
        const metadata = await this.extractMetadata(file);
        
        if (metadata.duration <= 0 && format !== 'gif') {
          return {
            isValid: false,
            error: 'No se pudo determinar la duración del video'
          };
        }

        if (metadata.width <= 0 || metadata.height <= 0) {
          return {
            isValid: false,
            error: 'Dimensiones de video inválidas'
          };
        }

        return {
          isValid: true,
          format
        };
      } catch (metadataError) {
        return {
          isValid: false,
          error: 'Error al leer metadatos del video'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Error al validar el archivo de video'
      };
    }
  }

  /**
   * Analiza la calidad del video
   */
  analyzeVideoQuality(metadata: VideoMetadata): {
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Analizar resolución
    const pixels = metadata.width * metadata.height;
    if (pixels < 640 * 480) {
      score -= 20;
      issues.push('Resolución muy baja');
      recommendations.push('Considerar usar un video de mayor resolución');
    } else if (pixels < 1280 * 720) {
      score -= 10;
      issues.push('Resolución baja');
    }

    // Analizar bitrate
    const optimalBitrate = videoFormatUtils.calculateOptimalBitrate(
      metadata.width, 
      metadata.height, 
      metadata.fps
    );
    
    if (metadata.bitrate < optimalBitrate * 0.5) {
      score -= 15;
      issues.push('Bitrate muy bajo');
      recommendations.push('Aumentar el bitrate para mejor calidad');
    } else if (metadata.bitrate < optimalBitrate * 0.7) {
      score -= 8;
      issues.push('Bitrate bajo');
    }

    // Analizar FPS
    if (metadata.fps < 24) {
      score -= 10;
      issues.push('FPS muy bajo');
      recommendations.push('Usar al menos 24 FPS para video fluido');
    } else if (metadata.fps > 60) {
      recommendations.push('FPS alto - considerar reducir para menor tamaño de archivo');
    }

    // Analizar duración
    if (metadata.duration > 3600) { // > 1 hora
      recommendations.push('Video muy largo - considerar dividir en segmentos');
    }

    // Analizar tamaño de archivo
    const estimatedOptimalSize = videoFormatUtils.estimateFileSize(
      metadata.duration,
      optimalBitrate
    );
    
    if (metadata.fileSize > estimatedOptimalSize * 2) {
      score -= 5;
      recommendations.push('Archivo grande - considerar comprimir');
    }

    // Analizar aspect ratio
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio < 0.5 || aspectRatio > 3) {
      issues.push('Aspect ratio inusual');
      recommendations.push('Verificar que el aspect ratio sea correcto');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations
    };
  }

  /**
   * Detecta el nivel de movimiento en el video
   */
  async analyzeMotionLevel(file: File, sampleCount: number = 5): Promise<{
    level: 'low' | 'medium' | 'high';
    score: number; // 0-100
  }> {
    try {
      const metadata = await this.extractMetadata(file);
      const duration = metadata.duration;
      
      if (duration <= 0) {
        return { level: 'medium', score: 50 };
      }

      // Para una implementación completa, aquí se analizarían
      // múltiples frames del video para detectar cambios
      // Por ahora, estimamos basado en el bitrate y tipo de archivo
      
      const pixels = metadata.width * metadata.height;
      const bitratePerPixel = metadata.bitrate / pixels;
      
      let score = 50;
      
      if (bitratePerPixel > 0.1) {
        score = 80; // Alto movimiento probable
      } else if (bitratePerPixel > 0.05) {
        score = 60; // Movimiento medio
      } else {
        score = 30; // Bajo movimiento probable
      }

      let level: 'low' | 'medium' | 'high';
      if (score > 70) level = 'high';
      else if (score > 40) level = 'medium';
      else level = 'low';

      return { level, score };
    } catch (error) {
      console.warn('Error analizando nivel de movimiento:', error);
      return { level: 'medium', score: 50 };
    }
  }

  // Métodos privados auxiliares

  private estimateFPS(video: HTMLVideoElement): number {
    // HTML5 no proporciona FPS directamente
    // Estimamos basado en duración y características comunes
    const duration = video.duration;
    
    if (duration <= 0) return 30; // Default
    
    // Heurística básica - en una implementación real
    // se usaría una librería como FFmpeg.js
    return 30; // Asumimos 30 FPS por defecto
  }

  private estimateBitrate(fileSize: number, duration: number): number {
    if (duration <= 0) return 0;
    
    // Bitrate = (fileSize * 8) / duration / 1000 (para kbps)
    return Math.round((fileSize * 8) / duration / 1000);
  }

  private hasAudioTrack(video: HTMLVideoElement): boolean {
    // Verificar si el video tiene audio
    // En HTML5 esto es limitado, pero podemos hacer una estimación
    try {
      return video.mozHasAudio || 
             Boolean(video.webkitAudioDecodedByteCount) ||
             Boolean(video.audioTracks && video.audioTracks.length > 0);
    } catch {
      // Si no podemos determinar, asumimos que sí tiene audio
      return true;
    }
  }

  private calculateAspectRatio(width: number, height: number): string {
    if (width <= 0 || height <= 0) return '16:9';
    
    const gcd = this.greatestCommonDivisor(width, height);
    const ratioWidth = width / gcd;
    const ratioHeight = height / gcd;
    
    // Simplificar ratios comunes
    const commonRatios: Record<string, string> = {
      '16:9': '16:9',
      '4:3': '4:3',
      '1:1': '1:1',
      '9:16': '9:16',
      '3:4': '3:4',
      '21:9': '21:9'
    };
    
    const ratio = `${ratioWidth}:${ratioHeight}`;
    return commonRatios[ratio] || ratio;
  }

  private greatestCommonDivisor(a: number, b: number): number {
    return b === 0 ? a : this.greatestCommonDivisor(b, a % b);
  }
}

