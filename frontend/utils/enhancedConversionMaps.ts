export enum FileCategory {
  Audio = 'audio',
  Video = 'video', 
  Image = 'image',
  Document = 'document',
  Archive = 'archive',
  Presentation = 'presentation',
  Font = 'font',
  Ebook = 'ebook',
}

// Matriz expandida con más conexiones para rutas multi-paso
export const enhancedConversionMatrix: Record<string, string[]> = {
  // === AUDIO FORMATS ===
  // Formatos de audio con WAV como hub central para calidad
  'mp3': ['wav', 'aac', 'flac', 'm4a'],
  'wav': ['mp3', 'flac', 'aac', 'm4a', 'mp4'], // WAV puede ir a video
  'flac': ['wav', 'mp3', 'aac'],
  'aac': ['mp3', 'wav', 'm4a'],
  'm4a': ['mp3', 'wav', 'aac'],
  'wma': ['wav', 'mp3'],
  'au': ['wav'],
  'aiff': ['wav'],

  // === VIDEO FORMATS ===
  // Formatos de video con MP4 como hub central
  'mp4': ['mov', 'webm', 'avi', 'mkv', 'wav', 'mp3'], // Video puede extraer audio
  'mov': ['mp4', 'webm', 'avi'],
  'webm': ['mp4', 'mov'],
  'avi': ['mp4', 'mov', 'webm'],
  'mkv': ['mp4', 'mov'],
  'wmv': ['mp4'],
  'flv': ['mp4'],
  'm4v': ['mp4'],

  // === IMAGE FORMATS ===
  // Formatos de imagen con PNG como hub para transparencia y JPG para fotos
  'jpg': ['png', 'webp', 'gif', 'bmp', 'tiff', 'pdf'], // JPG puede ir a documento
  'jpeg': ['png', 'webp', 'gif', 'bmp', 'tiff', 'pdf'],
  'png': ['jpg', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'svg'],
  'webp': ['jpg', 'png', 'gif'],
  'gif': ['png', 'jpg', 'webp'],
  'bmp': ['png', 'jpg'],
  'tiff': ['png', 'jpg', 'pdf'],
  'svg': ['png', 'pdf'],
  'ico': ['png'],
  'heic': ['jpg', 'png'],
  'psd': ['png', 'jpg'],
  'ai': ['svg', 'pdf'],

  // === DOCUMENT FORMATS ===
  // Formatos de documento con PDF como hub universal
  'pdf': ['docx', 'txt', 'html', 'rtf', 'jpg', 'png', 'epub'], // PDF es el hub central
  'docx': ['pdf', 'txt', 'html', 'rtf', 'odt'],
  'doc': ['docx', 'pdf', 'txt'],
  'txt': ['pdf', 'html', 'md', 'rtf', 'docx'],
  'html': ['pdf', 'txt', 'md', 'docx'],
  'md': ['html', 'pdf', 'txt', 'docx'],
  'rtf': ['docx', 'pdf', 'txt'],
  'odt': ['docx', 'pdf'],
  'abw': ['txt', 'pdf'],

  // === EBOOK FORMATS ===
  // Formatos de ebook con EPUB como estándar
  'epub': ['mobi', 'azw3', 'pdf', 'html', 'txt'],
  'mobi': ['epub', 'azw3', 'pdf'],
  'azw3': ['epub', 'mobi', 'pdf'],
  'azw': ['epub', 'mobi'],
  'pdb': ['epub', 'txt'],
  'lrf': ['epub'],
  'oeb': ['epub'],

  // === PRESENTATION FORMATS ===
  'pptx': ['pdf', 'ppt', 'odp', 'jpg'], // Presentación puede exportar como imagen
  'ppt': ['pptx', 'pdf'],
  'odp': ['pptx', 'pdf'],
  'key': ['pptx', 'pdf'],

  // === ARCHIVE FORMATS ===
  'zip': ['7z', 'tar', 'rar'],
  '7z': ['zip'],
  'tar': ['zip', '7z'],
  'rar': ['zip'],
  'gz': ['zip'],
  'bz2': ['zip'],

  // === FONT FORMATS ===
  'ttf': ['otf', 'woff', 'woff2'],
  'otf': ['ttf', 'woff'],
  'woff': ['ttf', 'otf', 'woff2'],
  'woff2': ['woff', 'ttf'],
  'eot': ['ttf'],
};

// Configuración de calidad por tipo de conversión
export interface ConversionQuality {
  lossless: boolean;
  qualityScore: number; // 0-100
  recommendedSteps: number; // máximo de pasos recomendados
}

export const conversionQualityMap: Record<string, Record<string, ConversionQuality>> = {
  // Audio conversions
  'wav': {
    'mp3': { lossless: false, qualityScore: 85, recommendedSteps: 1 },
    'flac': { lossless: true, qualityScore: 100, recommendedSteps: 1 },
  },
  'mp3': {
    'wav': { lossless: false, qualityScore: 90, recommendedSteps: 1 },
    'flac': { lossless: false, qualityScore: 85, recommendedSteps: 2 }, // mp3→wav→flac
  },
  
  // Image conversions
  'png': {
    'jpg': { lossless: false, qualityScore: 90, recommendedSteps: 1 },
    'webp': { lossless: false, qualityScore: 95, recommendedSteps: 1 },
  },
  'jpg': {
    'png': { lossless: false, qualityScore: 85, recommendedSteps: 1 },
    'pdf': { lossless: true, qualityScore: 95, recommendedSteps: 1 },
  },

  // Document conversions
  'txt': {
    'pdf': { lossless: true, qualityScore: 95, recommendedSteps: 1 },
    'jpg': { lossless: false, qualityScore: 80, recommendedSteps: 2 }, // txt→pdf→jpg
    'png': { lossless: false, qualityScore: 85, recommendedSteps: 2 }, // txt→pdf→png
  },
  'docx': {
    'pdf': { lossless: true, qualityScore: 98, recommendedSteps: 1 },
    'jpg': { lossless: false, qualityScore: 85, recommendedSteps: 2 }, // docx→pdf→jpg
  },
};

// Límites de pasos para evitar degradación excesiva
export const MAX_CONVERSION_STEPS = 5;
export const RECOMMENDED_MAX_STEPS = 3;

// Formatos que actúan como "hubs" para conversiones multi-paso
export const HUB_FORMATS = {
  universal: 'pdf',    // Hub universal para documentos e imágenes
  audio: 'wav',        // Hub para audio sin pérdida
  video: 'mp4',        // Hub para video
  image: 'png',        // Hub para imágenes con transparencia
  document: 'pdf',     // Hub para documentos
  web: 'html',         // Hub para contenido web
  ebook: 'epub',       // Hub para libros electrónicos
};

// Penalizaciones por paso adicional (para calcular calidad final)
export const STEP_PENALTY = 5; // -5% de calidad por cada paso adicional

export function calculateFinalQuality(baseQuality: number, steps: number): number {
  const penalty = Math.max(0, (steps - 1) * STEP_PENALTY);
  return Math.max(50, baseQuality - penalty); // Mínimo 50% de calidad
}

// Función para verificar si una ruta es recomendada
export function isRecommendedRoute(path: string[]): boolean {
  return path.length <= RECOMMENDED_MAX_STEPS;
}

// Función para obtener la descripción de la ruta
export function getRouteDescription(path: string[]): string {
  if (path.length === 2) {
    return `Conversión directa: ${path[0].toUpperCase()} → ${path[1].toUpperCase()}`;
  } else if (path.length <= RECOMMENDED_MAX_STEPS) {
    return `Ruta optimizada (${path.length - 1} pasos): ${path.map(f => f.toUpperCase()).join(' → ')}`;
  } else {
    return `Ruta compleja (${path.length - 1} pasos): ${path.map(f => f.toUpperCase()).join(' → ')}`;
  }
}

