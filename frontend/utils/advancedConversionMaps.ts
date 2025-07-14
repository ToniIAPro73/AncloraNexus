export enum FileCategory {
  Audio = 'audio',
  Video = 'video', 
  Image = 'image',
  Document = 'document',
  Archive = 'archive',
  Presentation = 'presentation',
  Font = 'font',
  // Nota: Ebook excluido intencionalmente para esta entrega
}

// Matriz expandida SOLO para conversor universal (sin e-books)
export const advancedConversionMatrix: Record<string, string[]> = {
  // === AUDIO FORMATS ===
  // WAV como hub central para audio sin pérdida
  'mp3': ['wav', 'aac', 'flac', 'm4a'],
  'wav': ['mp3', 'flac', 'aac', 'm4a', 'mp4'], // WAV puede ir a video
  'flac': ['wav', 'mp3', 'aac'],
  'aac': ['mp3', 'wav', 'm4a'],
  'm4a': ['mp3', 'wav', 'aac'],
  'wma': ['wav', 'mp3'],
  'au': ['wav'],
  'aiff': ['wav'],
  'amr': ['wav', 'mp3'],

  // === VIDEO FORMATS ===
  // MP4 como hub central para video
  'mp4': ['mov', 'webm', 'avi', 'mkv', 'wav', 'mp3'], // Video puede extraer audio
  'mov': ['mp4', 'webm', 'avi'],
  'webm': ['mp4', 'mov'],
  'avi': ['mp4', 'mov', 'webm'],
  'mkv': ['mp4', 'mov'],
  'wmv': ['mp4'],
  'flv': ['mp4'],
  'm4v': ['mp4'],

  // === IMAGE FORMATS ===
  // PNG como hub para transparencia, JPG para fotos, PDF como puente a documentos
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
  // PDF como hub universal para documentos
  'pdf': ['docx', 'txt', 'html', 'rtf', 'jpg', 'png'], // PDF es el hub central
  'docx': ['pdf', 'txt', 'html', 'rtf', 'odt'],
  'doc': ['docx', 'pdf', 'txt'],
  'txt': ['pdf', 'html', 'md', 'rtf', 'docx'],
  'html': ['pdf', 'txt', 'md', 'docx'],
  'md': ['html', 'pdf', 'txt', 'docx'],
  'rtf': ['docx', 'pdf', 'txt'],
  'odt': ['docx', 'pdf'],
  'abw': ['txt', 'pdf'],

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
  description: string;
}

export const conversionQualityMap: Record<string, Record<string, ConversionQuality>> = {
  // === AUDIO CONVERSIONS ===
  'wav': {
    'mp3': { lossless: false, qualityScore: 85, recommendedSteps: 1, description: 'Compresión con pérdida mínima' },
    'flac': { lossless: true, qualityScore: 100, recommendedSteps: 1, description: 'Sin pérdida de calidad' },
    'aac': { lossless: false, qualityScore: 88, recommendedSteps: 1, description: 'Compresión eficiente' },
  },
  'mp3': {
    'wav': { lossless: false, qualityScore: 90, recommendedSteps: 1, description: 'Expansión a formato sin compresión' },
    'flac': { lossless: false, qualityScore: 85, recommendedSteps: 2, description: 'Vía WAV para mejor calidad' },
    'mp4': { lossless: false, qualityScore: 95, recommendedSteps: 1, description: 'Audio a contenedor de video' },
  },
  
  // === IMAGE CONVERSIONS ===
  'png': {
    'jpg': { lossless: false, qualityScore: 90, recommendedSteps: 1, description: 'Pérdida de transparencia' },
    'webp': { lossless: false, qualityScore: 95, recommendedSteps: 1, description: 'Formato web optimizado' },
    'pdf': { lossless: true, qualityScore: 98, recommendedSteps: 1, description: 'Imagen a documento' },
  },
  'jpg': {
    'png': { lossless: false, qualityScore: 85, recommendedSteps: 1, description: 'Añade soporte de transparencia' },
    'pdf': { lossless: true, qualityScore: 95, recommendedSteps: 1, description: 'Imagen a documento' },
    'webp': { lossless: false, qualityScore: 92, recommendedSteps: 1, description: 'Mejor compresión web' },
  },

  // === DOCUMENT CONVERSIONS ===
  'txt': {
    'pdf': { lossless: true, qualityScore: 95, recommendedSteps: 1, description: 'Texto a documento formateado' },
    'html': { lossless: true, qualityScore: 98, recommendedSteps: 1, description: 'Texto a formato web' },
    'jpg': { lossless: false, qualityScore: 80, recommendedSteps: 2, description: 'Texto a imagen vía PDF' },
    'png': { lossless: false, qualityScore: 85, recommendedSteps: 2, description: 'Texto a imagen vía PDF' },
  },
  'docx': {
    'pdf': { lossless: true, qualityScore: 98, recommendedSteps: 1, description: 'Preserva formato completamente' },
    'txt': { lossless: false, qualityScore: 75, recommendedSteps: 1, description: 'Solo texto, pierde formato' },
    'html': { lossless: false, qualityScore: 85, recommendedSteps: 1, description: 'Formato web con estilos básicos' },
    'jpg': { lossless: false, qualityScore: 85, recommendedSteps: 2, description: 'Documento a imagen vía PDF' },
  },
  'pdf': {
    'docx': { lossless: false, qualityScore: 80, recommendedSteps: 1, description: 'Puede perder formato complejo' },
    'txt': { lossless: false, qualityScore: 70, recommendedSteps: 1, description: 'Solo texto, pierde todo formato' },
    'jpg': { lossless: false, qualityScore: 90, recommendedSteps: 1, description: 'Documento a imagen' },
    'png': { lossless: false, qualityScore: 92, recommendedSteps: 1, description: 'Documento a imagen con transparencia' },
  },

  // === VIDEO CONVERSIONS ===
  'mp4': {
    'mov': { lossless: false, qualityScore: 95, recommendedSteps: 1, description: 'Cambio de contenedor' },
    'webm': { lossless: false, qualityScore: 90, recommendedSteps: 1, description: 'Formato web optimizado' },
    'wav': { lossless: false, qualityScore: 85, recommendedSteps: 1, description: 'Extracción de audio' },
    'mp3': { lossless: false, qualityScore: 80, recommendedSteps: 1, description: 'Audio comprimido' },
  },
};

// Límites de pasos para evitar degradación excesiva
export const MAX_CONVERSION_STEPS = 4; // Reducido para conversor universal
export const RECOMMENDED_MAX_STEPS = 3;

// Formatos que actúan como "hubs" para conversiones multi-paso
export const HUB_FORMATS = {
  universal: 'pdf',    // Hub universal para documentos e imágenes
  audio: 'wav',        // Hub para audio sin pérdida
  video: 'mp4',        // Hub para video
  image: 'png',        // Hub para imágenes con transparencia
  document: 'pdf',     // Hub para documentos
  web: 'html',         // Hub para contenido web
};

// Penalizaciones por paso adicional (para calcular calidad final)
export const STEP_PENALTY = 8; // -8% de calidad por cada paso adicional (más estricto)

export function calculateFinalQuality(baseQuality: number, steps: number): number {
  const penalty = Math.max(0, (steps - 1) * STEP_PENALTY);
  return Math.max(60, baseQuality - penalty); // Mínimo 60% de calidad
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

// Función para verificar si un formato está soportado en conversor universal
export function isSupportedInUniversal(format: string): boolean {
  const formatLower = format.toLowerCase();
  // Excluir formatos de e-book explícitamente
  const ebookFormats = ['epub', 'mobi', 'azw', 'azw3', 'pdb', 'lrf', 'oeb'];
  return !ebookFormats.includes(formatLower);
}

// Función para filtrar rutas que incluyan formatos de e-book
export function filterUniversalRoutes(path: string[]): boolean {
  return path.every(format => isSupportedInUniversal(format));
}

