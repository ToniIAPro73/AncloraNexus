// Tipos específicos para funcionalidad de conversión de video

export type VideoFormat = 
  | 'mp4' | 'webm' | 'mov' | 'avi' | 'mkv' | 'wmv' | 'flv' 
  | '3gp' | 'ogv' | 'gif' | 'm4v' | 'asf' | 'vob' | 'ts';

export type VideoCodec = 
  | 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1' | 'xvid' | 'divx';

export type AudioCodec = 
  | 'aac' | 'mp3' | 'opus' | 'vorbis' | 'ac3' | 'dts';

export type VideoQuality = 'low' | 'medium' | 'high' | 'ultra' | 'custom';

export type VideoResolution = 
  | '480p' | '720p' | '1080p' | '1440p' | '4k' | 'custom';

export type VideoPlatform = 
  | 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' 
  | 'linkedin' | 'whatsapp' | 'telegram' | 'web' | 'custom';

export interface VideoMetadata {
  duration: number; // en segundos
  width: number;
  height: number;
  fps: number;
  bitrate: number; // kbps
  codec: string;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
  fileSize: number; // bytes
  hasAudio: boolean;
  hasVideo: boolean;
  aspectRatio: string;
  colorSpace?: string;
  profile?: string;
  level?: string;
}

export interface VideoFile {
  name: string;
  size: number;
  type: string;
  format: VideoFormat;
  file: File;
  metadata?: VideoMetadata;
  thumbnail?: string; // base64 o URL
  preview?: string; // URL del preview
}

export interface VideoConversionOptions {
  outputFormat: VideoFormat;
  quality: VideoQuality;
  resolution?: VideoResolution;
  customWidth?: number;
  customHeight?: number;
  fps?: number;
  videoBitrate?: number; // kbps
  audioBitrate?: number; // kbps
  videoCodec?: VideoCodec;
  audioCodec?: AudioCodec;
  startTime?: number; // segundos para recorte
  endTime?: number; // segundos para recorte
  preserveAspectRatio: boolean;
  removeAudio: boolean;
  optimizeForWeb: boolean;
  platform?: VideoPlatform;
}

export interface VideoPlatformPreset {
  platform: VideoPlatform;
  name: string;
  description: string;
  maxWidth: number;
  maxHeight: number;
  maxDuration?: number; // segundos
  maxFileSize?: number; // MB
  recommendedFormat: VideoFormat;
  recommendedCodec: VideoCodec;
  recommendedBitrate: number;
  aspectRatio?: string;
  fps?: number;
  icon: string;
}

export interface VideoConversionJob {
  id: string;
  inputFile: VideoFile;
  options: VideoConversionOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startTime: Date;
  endTime?: Date;
  outputFile?: {
    name: string;
    size: number;
    url: string;
    downloadUrl: string;
  };
  error?: string;
  estimatedTimeRemaining?: number; // segundos
  currentStep?: string;
}

export interface VideoValidationResult {
  isValid: boolean;
  format: VideoFormat;
  metadata: VideoMetadata;
  issues: VideoValidationIssue[];
  recommendations: VideoRecommendation[];
  supportedOutputFormats: VideoFormat[];
}

export interface VideoValidationIssue {
  type: 'warning' | 'error' | 'info';
  code: string;
  message: string;
  description?: string;
  suggestion?: string;
}

export interface VideoRecommendation {
  type: 'quality' | 'format' | 'platform' | 'optimization';
  title: string;
  description: string;
  action?: string;
  preset?: VideoPlatformPreset;
}

export interface VideoConversionProgress {
  jobId: string;
  progress: number;
  currentStep: string;
  estimatedTimeRemaining: number;
  processedFrames?: number;
  totalFrames?: number;
  currentFps?: number;
  outputSize?: number;
}

export interface VideoEditingOptions {
  trim?: {
    start: number; // segundos
    end: number; // segundos
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotate?: 0 | 90 | 180 | 270;
  flip?: 'horizontal' | 'vertical' | 'both';
  filters?: VideoFilter[];
  watermark?: {
    text?: string;
    image?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number; // 0-1
  };
}

export interface VideoFilter {
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sharpen' | 'noise';
  value: number; // -100 a 100 o 0-100 según el filtro
}

export interface VideoConversionStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalProcessingTime: number; // segundos
  averageProcessingTime: number; // segundos
  totalInputSize: number; // bytes
  totalOutputSize: number; // bytes
  compressionRatio: number; // porcentaje
  popularFormats: { format: VideoFormat; count: number }[];
  popularPlatforms: { platform: VideoPlatform; count: number }[];
}

export interface VideoConversionHistory {
  jobs: VideoConversionJob[];
  stats: VideoConversionStats;
  lastUpdated: Date;
}

// Tipos para configuración avanzada
export interface VideoAdvancedOptions {
  twoPass: boolean; // codificación en dos pasadas
  constantRateFactor?: number; // CRF para h264/h265
  bufferSize?: number; // buffer de video
  maxBitrate?: number; // bitrate máximo
  minBitrate?: number; // bitrate mínimo
  keyframeInterval?: number; // intervalo de keyframes
  bFrames?: number; // número de B-frames
  profile?: string; // perfil del codec
  level?: string; // nivel del codec
  pixelFormat?: string; // formato de pixel
  colorSpace?: string; // espacio de color
  colorRange?: 'tv' | 'pc'; // rango de color
  threads?: number; // número de threads
  preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';
}

// Tipos para análisis de video
export interface VideoAnalysis {
  scenes: VideoScene[];
  motionLevel: 'low' | 'medium' | 'high';
  complexityScore: number; // 0-100
  recommendedBitrate: number;
  recommendedCodec: VideoCodec;
  qualityScore: number; // 0-100
  audioQualityScore?: number; // 0-100
  issues: VideoValidationIssue[];
}

export interface VideoScene {
  startTime: number;
  endTime: number;
  motionLevel: number; // 0-100
  complexity: number; // 0-100
  thumbnail?: string;
}

// Tipos para batch processing
export interface VideoBatchJob {
  id: string;
  files: VideoFile[];
  options: VideoConversionOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  completedFiles: number;
  totalFiles: number;
  currentFile?: string;
  startTime: Date;
  endTime?: Date;
  results: VideoConversionJob[];
  error?: string;
}

export type VideoConversionEvent = 
  | { type: 'progress'; data: VideoConversionProgress }
  | { type: 'completed'; data: VideoConversionJob }
  | { type: 'failed'; data: { jobId: string; error: string } }
  | { type: 'started'; data: { jobId: string } }
  | { type: 'cancelled'; data: { jobId: string } };

// Constantes útiles
export const VIDEO_FORMATS: VideoFormat[] = [
  'mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'flv', 
  '3gp', 'ogv', 'gif', 'm4v', 'asf', 'vob', 'ts'
];

export const VIDEO_CODECS: VideoCodec[] = [
  'h264', 'h265', 'vp8', 'vp9', 'av1', 'xvid', 'divx'
];

export const AUDIO_CODECS: AudioCodec[] = [
  'aac', 'mp3', 'opus', 'vorbis', 'ac3', 'dts'
];

export const VIDEO_RESOLUTIONS = {
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 }
};

export const PLATFORM_PRESETS: VideoPlatformPreset[] = [
  {
    platform: 'youtube',
    name: 'YouTube HD',
    description: 'Optimizado para YouTube en alta calidad',
    maxWidth: 1920,
    maxHeight: 1080,
    recommendedFormat: 'mp4',
    recommendedCodec: 'h264',
    recommendedBitrate: 8000,
    fps: 30,
    icon: '📺'
  },
  {
    platform: 'instagram',
    name: 'Instagram Feed',
    description: 'Formato cuadrado para feed de Instagram',
    maxWidth: 1080,
    maxHeight: 1080,
    maxDuration: 60,
    maxFileSize: 100,
    recommendedFormat: 'mp4',
    recommendedCodec: 'h264',
    recommendedBitrate: 3500,
    aspectRatio: '1:1',
    fps: 30,
    icon: '📷'
  },
  {
    platform: 'tiktok',
    name: 'TikTok Vertical',
    description: 'Formato vertical para TikTok',
    maxWidth: 1080,
    maxHeight: 1920,
    maxDuration: 180,
    maxFileSize: 500,
    recommendedFormat: 'mp4',
    recommendedCodec: 'h264',
    recommendedBitrate: 4000,
    aspectRatio: '9:16',
    fps: 30,
    icon: '🎵'
  },
  {
    platform: 'twitter',
    name: 'Twitter Video',
    description: 'Optimizado para Twitter',
    maxWidth: 1280,
    maxHeight: 720,
    maxDuration: 140,
    maxFileSize: 512,
    recommendedFormat: 'mp4',
    recommendedCodec: 'h264',
    recommendedBitrate: 2000,
    fps: 30,
    icon: '🐦'
  },
  {
    platform: 'web',
    name: 'Web Optimizado',
    description: 'Optimizado para reproducción web',
    maxWidth: 1920,
    maxHeight: 1080,
    recommendedFormat: 'mp4',
    recommendedCodec: 'h264',
    recommendedBitrate: 2500,
    fps: 30,
    icon: '🌐'
  }
];

