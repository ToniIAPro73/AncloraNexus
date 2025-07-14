import { VideoFormat, VideoCodec, AudioCodec, VideoPlatformPreset, PLATFORM_PRESETS } from '../types/video';

// Mapas de conversión entre formatos de video
export const videoConversionMap: Record<VideoFormat, VideoFormat[]> = {
  'mp4': ['webm', 'mov', 'avi', 'mkv', 'gif', 'ogv', '3gp'],
  'webm': ['mp4', 'mov', 'avi', 'mkv', 'gif', 'ogv'],
  'mov': ['mp4', 'webm', 'avi', 'mkv', 'gif', 'ogv'],
  'avi': ['mp4', 'webm', 'mov', 'mkv', 'gif', 'ogv'],
  'mkv': ['mp4', 'webm', 'mov', 'avi', 'gif', 'ogv'],
  'wmv': ['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'],
  'flv': ['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'],
  '3gp': ['mp4', 'webm', 'mov', 'avi', 'gif'],
  'ogv': ['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'],
  'gif': ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  'm4v': ['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'],
  'asf': ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  'vob': ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  'ts': ['mp4', 'webm', 'mov', 'avi', 'mkv']
};

// Codecs compatibles por formato
export const formatCodecMap: Record<VideoFormat, { video: VideoCodec[]; audio: AudioCodec[] }> = {
  'mp4': {
    video: ['h264', 'h265', 'av1'],
    audio: ['aac', 'mp3', 'ac3']
  },
  'webm': {
    video: ['vp8', 'vp9', 'av1'],
    audio: ['vorbis', 'opus']
  },
  'mov': {
    video: ['h264', 'h265'],
    audio: ['aac', 'mp3', 'ac3']
  },
  'avi': {
    video: ['h264', 'xvid', 'divx'],
    audio: ['mp3', 'ac3', 'aac']
  },
  'mkv': {
    video: ['h264', 'h265', 'vp9', 'av1'],
    audio: ['aac', 'mp3', 'opus', 'vorbis', 'ac3', 'dts']
  },
  'wmv': {
    video: ['h264'],
    audio: ['aac', 'mp3']
  },
  'flv': {
    video: ['h264'],
    audio: ['aac', 'mp3']
  },
  '3gp': {
    video: ['h264'],
    audio: ['aac', 'mp3']
  },
  'ogv': {
    video: ['vp8', 'vp9'],
    audio: ['vorbis', 'opus']
  },
  'gif': {
    video: [],
    audio: []
  },
  'm4v': {
    video: ['h264', 'h265'],
    audio: ['aac', 'ac3']
  },
  'asf': {
    video: ['h264'],
    audio: ['aac', 'mp3']
  },
  'vob': {
    video: ['h264'],
    audio: ['ac3', 'mp3']
  },
  'ts': {
    video: ['h264', 'h265'],
    audio: ['aac', 'mp3', 'ac3']
  }
};

// Configuraciones de calidad predefinidas
export const qualityPresets = {
  low: {
    videoBitrate: 500, // kbps
    audioBitrate: 64,
    maxWidth: 640,
    maxHeight: 480,
    fps: 24,
    description: 'Calidad baja - Archivo pequeño'
  },
  medium: {
    videoBitrate: 1500,
    audioBitrate: 128,
    maxWidth: 1280,
    maxHeight: 720,
    fps: 30,
    description: 'Calidad media - Recomendado'
  },
  high: {
    videoBitrate: 4000,
    audioBitrate: 192,
    maxWidth: 1920,
    maxHeight: 1080,
    fps: 30,
    description: 'Calidad alta - Mejor calidad'
  },
  ultra: {
    videoBitrate: 8000,
    audioBitrate: 320,
    maxWidth: 3840,
    maxHeight: 2160,
    fps: 60,
    description: 'Calidad ultra - 4K'
  }
};

// Formatos recomendados por uso
export const formatRecommendations = {
  web: {
    primary: 'mp4' as VideoFormat,
    fallback: 'webm' as VideoFormat,
    description: 'MP4 con H.264 para máxima compatibilidad web'
  },
  mobile: {
    primary: 'mp4' as VideoFormat,
    fallback: '3gp' as VideoFormat,
    description: 'MP4 optimizado para dispositivos móviles'
  },
  social: {
    primary: 'mp4' as VideoFormat,
    fallback: 'mov' as VideoFormat,
    description: 'MP4 con configuraciones específicas por plataforma'
  },
  streaming: {
    primary: 'mp4' as VideoFormat,
    fallback: 'webm' as VideoFormat,
    description: 'Formatos optimizados para streaming'
  },
  archive: {
    primary: 'mkv' as VideoFormat,
    fallback: 'mov' as VideoFormat,
    description: 'Formatos sin pérdida para archivo'
  },
  gif: {
    primary: 'gif' as VideoFormat,
    fallback: 'mp4' as VideoFormat,
    description: 'GIF animado para clips cortos'
  }
};

// Configuraciones específicas por plataforma
export const platformConfigurations = {
  youtube: {
    formats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'] as VideoFormat[],
    maxFileSize: 256 * 1024 * 1024 * 1024, // 256GB
    maxDuration: 12 * 60 * 60, // 12 horas
    recommendedCodec: 'h264' as VideoCodec,
    recommendedAudioCodec: 'aac' as AudioCodec,
    aspectRatios: ['16:9', '4:3', '1:1', '9:16'],
    resolutions: ['480p', '720p', '1080p', '1440p', '4k']
  },
  instagram: {
    feed: {
      formats: ['mp4', 'mov'] as VideoFormat[],
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxDuration: 60,
      aspectRatio: '1:1',
      minResolution: { width: 600, height: 600 },
      maxResolution: { width: 1080, height: 1080 }
    },
    stories: {
      formats: ['mp4', 'mov'] as VideoFormat[],
      maxFileSize: 100 * 1024 * 1024,
      maxDuration: 15,
      aspectRatio: '9:16',
      minResolution: { width: 720, height: 1280 },
      maxResolution: { width: 1080, height: 1920 }
    },
    reels: {
      formats: ['mp4', 'mov'] as VideoFormat[],
      maxFileSize: 100 * 1024 * 1024,
      maxDuration: 90,
      aspectRatio: '9:16',
      minResolution: { width: 720, height: 1280 },
      maxResolution: { width: 1080, height: 1920 }
    }
  },
  tiktok: {
    formats: ['mp4', 'mov'] as VideoFormat[],
    maxFileSize: 500 * 1024 * 1024, // 500MB
    maxDuration: 180,
    aspectRatio: '9:16',
    minResolution: { width: 720, height: 1280 },
    maxResolution: { width: 1080, height: 1920 },
    recommendedFps: 30
  },
  twitter: {
    formats: ['mp4', 'mov'] as VideoFormat[],
    maxFileSize: 512 * 1024 * 1024, // 512MB
    maxDuration: 140,
    aspectRatios: ['16:9', '1:1', '9:16'],
    maxResolution: { width: 1280, height: 720 },
    recommendedBitrate: 2000
  },
  facebook: {
    formats: ['mp4', 'mov', 'avi'] as VideoFormat[],
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
    maxDuration: 240 * 60, // 240 minutos
    aspectRatios: ['16:9', '1:1', '4:5', '9:16'],
    maxResolution: { width: 1920, height: 1080 }
  },
  linkedin: {
    formats: ['mp4', 'mov', 'avi'] as VideoFormat[],
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
    maxDuration: 10 * 60, // 10 minutos
    aspectRatios: ['16:9', '1:1', '9:16'],
    maxResolution: { width: 1920, height: 1080 }
  }
};

// Algoritmo BFS para encontrar rutas de conversión
export class VideoConversionPathFinder {
  private graph: Map<VideoFormat, VideoFormat[]>;

  constructor() {
    this.graph = new Map();
    this.buildGraph();
  }

  private buildGraph(): void {
    Object.entries(videoConversionMap).forEach(([source, targets]) => {
      this.graph.set(source as VideoFormat, targets);
    });
  }

  findConversionPath(from: VideoFormat, to: VideoFormat): VideoFormat[] | null {
    if (from === to) return [from];

    const queue: { format: VideoFormat; path: VideoFormat[] }[] = [
      { format: from, path: [from] }
    ];
    const visited = new Set<VideoFormat>([from]);

    while (queue.length > 0) {
      const { format, path } = queue.shift()!;
      const neighbors = this.graph.get(format) || [];

      for (const neighbor of neighbors) {
        if (neighbor === to) {
          return [...path, neighbor];
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({
            format: neighbor,
            path: [...path, neighbor]
          });
        }
      }
    }

    return null; // No se encontró ruta
  }

  getDirectConversions(from: VideoFormat): VideoFormat[] {
    return this.graph.get(from) || [];
  }

  getAllSupportedFormats(): VideoFormat[] {
    return Array.from(this.graph.keys());
  }

  isConversionSupported(from: VideoFormat, to: VideoFormat): boolean {
    return this.findConversionPath(from, to) !== null;
  }

  getConversionComplexity(from: VideoFormat, to: VideoFormat): number {
    const path = this.findConversionPath(from, to);
    if (!path) return -1;
    return path.length - 1; // Número de pasos de conversión
  }
}

// Utilidades para validación de formatos
export const videoFormatUtils = {
  isFormatSupported(format: string): format is VideoFormat {
    return videoConversionMap.hasOwnProperty(format.toLowerCase());
  },

  getFormatFromMimeType(mimeType: string): VideoFormat | null {
    const mimeToFormat: Record<string, VideoFormat> = {
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/x-matroska': 'mkv',
      'video/x-ms-wmv': 'wmv',
      'video/x-flv': 'flv',
      'video/3gpp': '3gp',
      'video/ogg': 'ogv',
      'image/gif': 'gif',
      'video/x-m4v': 'm4v'
    };

    return mimeToFormat[mimeType.toLowerCase()] || null;
  },

  getFormatFromExtension(filename: string): VideoFormat | null {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension) return null;

    const extToFormat: Record<string, VideoFormat> = {
      'mp4': 'mp4',
      'webm': 'webm',
      'mov': 'mov',
      'avi': 'avi',
      'mkv': 'mkv',
      'wmv': 'wmv',
      'flv': 'flv',
      '3gp': '3gp',
      'ogv': 'ogv',
      'gif': 'gif',
      'm4v': 'm4v',
      'asf': 'asf',
      'vob': 'vob',
      'ts': 'ts'
    };

    return extToFormat[extension] || null;
  },

  getMimeTypeFromFormat(format: VideoFormat): string {
    const formatToMime: Record<VideoFormat, string> = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      '3gp': 'video/3gpp',
      'ogv': 'video/ogg',
      'gif': 'image/gif',
      'm4v': 'video/x-m4v',
      'asf': 'video/x-ms-asf',
      'vob': 'video/dvd',
      'ts': 'video/mp2t'
    };

    return formatToMime[format] || 'video/mp4';
  },

  getRecommendedCodec(format: VideoFormat): { video: VideoCodec; audio: AudioCodec } {
    const codecMap = formatCodecMap[format];
    return {
      video: codecMap.video[0] || 'h264',
      audio: codecMap.audio[0] || 'aac'
    };
  },

  getPlatformPreset(platform: string): VideoPlatformPreset | null {
    return PLATFORM_PRESETS.find(preset => preset.platform === platform) || null;
  },

  calculateOptimalBitrate(width: number, height: number, fps: number): number {
    // Fórmula básica para calcular bitrate óptimo
    const pixels = width * height;
    const baseRate = pixels * fps * 0.1; // Factor base
    
    // Ajustes según resolución
    if (pixels <= 640 * 480) return Math.max(500, baseRate); // 480p
    if (pixels <= 1280 * 720) return Math.max(1500, baseRate); // 720p
    if (pixels <= 1920 * 1080) return Math.max(4000, baseRate); // 1080p
    if (pixels <= 2560 * 1440) return Math.max(8000, baseRate); // 1440p
    return Math.max(15000, baseRate); // 4K+
  },

  estimateFileSize(
    duration: number, 
    videoBitrate: number, 
    audioBitrate: number = 128
  ): number {
    // Estima el tamaño del archivo en bytes
    const totalBitrate = videoBitrate + audioBitrate; // kbps
    return Math.round((totalBitrate * duration * 1000) / 8); // bytes
  },

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

// Instancia global del path finder
export const videoPathFinder = new VideoConversionPathFinder();

