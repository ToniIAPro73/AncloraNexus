import { EbookFormat, EbookConversionPath } from '../types/ebook';

// Definición de formatos de e-books soportados
export const EBOOK_FORMATS: Record<string, EbookFormat> = {
  epub: {
    extension: 'epub',
    name: 'EPUB',
    description: 'Formato estándar abierto para libros electrónicos',
    mimeType: 'application/epub+zip',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: true,
    isProprietaryFormat: false
  },
  pdf: {
    extension: 'pdf',
    name: 'PDF',
    description: 'Formato de documento portátil',
    mimeType: 'application/pdf',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: true,
    isProprietaryFormat: false
  },
  mobi: {
    extension: 'mobi',
    name: 'MOBI',
    description: 'Formato Mobipocket para dispositivos Kindle',
    mimeType: 'application/x-mobipocket-ebook',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: true,
    isProprietaryFormat: true
  },
  azw: {
    extension: 'azw',
    name: 'AZW',
    description: 'Formato Amazon Kindle (basado en MOBI)',
    mimeType: 'application/vnd.amazon.ebook',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: true,
    isProprietaryFormat: true
  },
  azw3: {
    extension: 'azw3',
    name: 'AZW3',
    description: 'Formato Amazon Kindle KF8',
    mimeType: 'application/vnd.amazon.ebook',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: true,
    isProprietaryFormat: true
  },
  txt: {
    extension: 'txt',
    name: 'TXT',
    description: 'Texto plano',
    mimeType: 'text/plain',
    supportsMetadata: false,
    supportsImages: false,
    supportsDRM: false,
    isProprietaryFormat: false
  },
  rtf: {
    extension: 'rtf',
    name: 'RTF',
    description: 'Rich Text Format',
    mimeType: 'application/rtf',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: false,
    isProprietaryFormat: false
  },
  doc: {
    extension: 'doc',
    name: 'DOC',
    description: 'Microsoft Word 97-2003',
    mimeType: 'application/msword',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: false,
    isProprietaryFormat: true
  },
  docx: {
    extension: 'docx',
    name: 'DOCX',
    description: 'Microsoft Word 2007+',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: false,
    isProprietaryFormat: true
  },
  html: {
    extension: 'html',
    name: 'HTML',
    description: 'HyperText Markup Language',
    mimeType: 'text/html',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: false,
    isProprietaryFormat: false
  },
  lrf: {
    extension: 'lrf',
    name: 'LRF',
    description: 'Sony Portable Reader Format',
    mimeType: 'application/x-sony-bbeb',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: true,
    isProprietaryFormat: true
  },
  pdb: {
    extension: 'pdb',
    name: 'PDB',
    description: 'Palm Database Format',
    mimeType: 'application/vnd.palm',
    supportsMetadata: true,
    supportsImages: false,
    supportsDRM: false,
    isProprietaryFormat: true
  },
  oeb: {
    extension: 'oeb',
    name: 'OEB',
    description: 'Open eBook Format',
    mimeType: 'application/oebps-package+xml',
    supportsMetadata: true,
    supportsImages: true,
    supportsDRM: false,
    isProprietaryFormat: false
  }
};

// Rutas de conversión optimizadas para e-books
export const EBOOK_CONVERSION_PATHS: EbookConversionPath[] = [
  // Conversiones directas más comunes
  { from: 'pdf', to: 'epub', method: 'direct', estimatedTime: 30, qualityLoss: 'minimal' },
  { from: 'epub', to: 'pdf', method: 'direct', estimatedTime: 25, qualityLoss: 'minimal' },
  { from: 'epub', to: 'mobi', method: 'direct', estimatedTime: 20, qualityLoss: 'none' },
  { from: 'mobi', to: 'epub', method: 'direct', estimatedTime: 20, qualityLoss: 'none' },
  { from: 'epub', to: 'azw3', method: 'direct', estimatedTime: 25, qualityLoss: 'none' },
  { from: 'azw3', to: 'epub', method: 'direct', estimatedTime: 25, qualityLoss: 'none' },
  
  // Conversiones desde documentos
  { from: 'doc', to: 'epub', method: 'intermediate', intermediateFormat: 'html', estimatedTime: 45, qualityLoss: 'moderate' },
  { from: 'docx', to: 'epub', method: 'intermediate', intermediateFormat: 'html', estimatedTime: 40, qualityLoss: 'moderate' },
  { from: 'rtf', to: 'epub', method: 'intermediate', intermediateFormat: 'html', estimatedTime: 35, qualityLoss: 'moderate' },
  { from: 'html', to: 'epub', method: 'direct', estimatedTime: 15, qualityLoss: 'minimal' },
  { from: 'txt', to: 'epub', method: 'direct', estimatedTime: 10, qualityLoss: 'none' },
  
  // Conversiones a PDF
  { from: 'doc', to: 'pdf', method: 'direct', estimatedTime: 20, qualityLoss: 'minimal' },
  { from: 'docx', to: 'pdf', method: 'direct', estimatedTime: 20, qualityLoss: 'minimal' },
  { from: 'rtf', to: 'pdf', method: 'direct', estimatedTime: 25, qualityLoss: 'minimal' },
  { from: 'html', to: 'pdf', method: 'direct', estimatedTime: 15, qualityLoss: 'minimal' },
  { from: 'txt', to: 'pdf', method: 'direct', estimatedTime: 10, qualityLoss: 'none' },
  
  // Conversiones a texto plano
  { from: 'epub', to: 'txt', method: 'direct', estimatedTime: 15, qualityLoss: 'high' },
  { from: 'pdf', to: 'txt', method: 'direct', estimatedTime: 20, qualityLoss: 'high' },
  { from: 'mobi', to: 'txt', method: 'direct', estimatedTime: 15, qualityLoss: 'high' },
  { from: 'azw3', to: 'txt', method: 'direct', estimatedTime: 15, qualityLoss: 'high' },
  
  // Conversiones a RTF
  { from: 'epub', to: 'rtf', method: 'intermediate', intermediateFormat: 'html', estimatedTime: 30, qualityLoss: 'moderate' },
  { from: 'pdf', to: 'rtf', method: 'intermediate', intermediateFormat: 'txt', estimatedTime: 35, qualityLoss: 'high' },
  
  // Formatos legacy
  { from: 'lrf', to: 'epub', method: 'direct', estimatedTime: 30, qualityLoss: 'minimal' },
  { from: 'pdb', to: 'epub', method: 'direct', estimatedTime: 25, qualityLoss: 'minimal' },
  { from: 'oeb', to: 'epub', method: 'direct', estimatedTime: 20, qualityLoss: 'none' },
  
  // Conversiones entre formatos Kindle
  { from: 'azw', to: 'mobi', method: 'direct', estimatedTime: 15, qualityLoss: 'none' },
  { from: 'mobi', to: 'azw', method: 'direct', estimatedTime: 15, qualityLoss: 'none' },
  { from: 'azw', to: 'azw3', method: 'direct', estimatedTime: 20, qualityLoss: 'none' },
  { from: 'azw3', to: 'azw', method: 'direct', estimatedTime: 20, qualityLoss: 'minimal' }
];

// Matriz de compatibilidad para conversiones
export const EBOOK_COMPATIBILITY_MATRIX: Record<string, string[]> = {
  epub: ['pdf', 'mobi', 'azw3', 'txt', 'rtf', 'html'],
  pdf: ['epub', 'txt', 'rtf', 'html'],
  mobi: ['epub', 'azw', 'azw3', 'txt', 'rtf'],
  azw: ['epub', 'mobi', 'azw3', 'txt', 'rtf'],
  azw3: ['epub', 'mobi', 'azw', 'txt', 'rtf'],
  txt: ['epub', 'pdf', 'rtf', 'html'],
  rtf: ['epub', 'pdf', 'txt', 'html'],
  doc: ['epub', 'pdf', 'txt', 'rtf', 'html'],
  docx: ['epub', 'pdf', 'txt', 'rtf', 'html'],
  html: ['epub', 'pdf', 'txt', 'rtf'],
  lrf: ['epub', 'pdf', 'txt'],
  pdb: ['epub', 'txt'],
  oeb: ['epub', 'pdf', 'txt']
};

// Configuraciones recomendadas por formato
export const RECOMMENDED_SETTINGS: Record<string, any> = {
  epub: {
    version: '3.0',
    includeNCX: true,
    splitChapters: true,
    chapterSplitSize: 250 // KB
  },
  pdf: {
    pageSize: 'A4',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    embedFonts: true,
    imageQuality: 85
  },
  mobi: {
    kindleGeneration: 'new',
    compression: 'medium',
    includeOriginalImages: true
  }
};

// Función para obtener rutas de conversión disponibles
export function getAvailableConversions(fromFormat: string): string[] {
  return EBOOK_COMPATIBILITY_MATRIX[fromFormat.toLowerCase()] || [];
}

// Función para encontrar la mejor ruta de conversión
export function findBestConversionPath(from: string, to: string): EbookConversionPath | null {
  const directPath = EBOOK_CONVERSION_PATHS.find(
    path => path.from === from.toLowerCase() && path.to === to.toLowerCase()
  );
  
  if (directPath) {
    return directPath;
  }
  
  // Buscar ruta indirecta si no hay directa
  const intermediatePaths = EBOOK_CONVERSION_PATHS.filter(
    path => path.from === from.toLowerCase() && path.method === 'intermediate'
  );
  
  for (const intermediatePath of intermediatePaths) {
    const secondPath = EBOOK_CONVERSION_PATHS.find(
      path => path.from === intermediatePath.intermediateFormat && path.to === to.toLowerCase()
    );
    
    if (secondPath) {
      return {
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        method: 'intermediate',
        intermediateFormat: intermediatePath.intermediateFormat,
        estimatedTime: intermediatePath.estimatedTime + secondPath.estimatedTime,
        qualityLoss: intermediatePath.qualityLoss === 'high' || secondPath.qualityLoss === 'high' 
          ? 'high' 
          : intermediatePath.qualityLoss === 'moderate' || secondPath.qualityLoss === 'moderate'
          ? 'moderate'
          : 'minimal'
      };
    }
  }
  
  return null;
}

// Función para validar si un formato es soportado
export function isSupportedFormat(format: string): boolean {
  return format.toLowerCase() in EBOOK_FORMATS;
}

// Función para obtener información de un formato
export function getFormatInfo(format: string): EbookFormat | null {
  return EBOOK_FORMATS[format.toLowerCase()] || null;
}

