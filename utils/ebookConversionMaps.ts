// Mapas de conversión específicos para libros electrónicos
// Siguiendo estructura del sistema existente y guía de estilos Anclora
import { EbookFormat } from '../types/ebook';
export type EbookConversionMatrix = Record<EbookFormat, EbookFormat[]>;
// Matriz de conversiones directas optimizadas para e-books
const ebookDirectConversions: EbookConversionMatrix = {
  // PDF conversions (prioritarias según requisitos)
  [EbookFormat.PDF]: [
    EbookFormat.EPUB,    // PDF a EPUB - conversión popular
    EbookFormat.MOBI,    // PDF a MOBI - Kindle
    EbookFormat.AZW3,    // PDF a AZW3 - Kindle moderno  
    EbookFormat.DOC,     // PDF a DOC
    EbookFormat.DOCX,    // PDF a DOCX
    EbookFormat.TXT,     // PDF a TXT - solo texto
    EbookFormat.RTF,     // PDF a RTF
    EbookFormat.PDB,     // PDF a PDB
    EbookFormat.HTML     // PDF a HTML
  ],
  // EPUB conversions (prioritarias según requisitos)
  [EbookFormat.EPUB]: [
    EbookFormat.PDF,     // EPUB a PDF
    EbookFormat.MOBI,    // EPUB a MOBI - Kindle
    EbookFormat.AZW3,    // EPUB a AZW3 - Kindle moderno
    EbookFormat.AZW,     // EPUB a AZW - Kindle básico
    EbookFormat.TXT,     // EPUB a TXT
    EbookFormat.RTF,     // EPUB a RTF
    EbookFormat.HTML,    // EPUB a HTML
    EbookFormat.DOCX     // EPUB a DOCX
  ],
  // MOBI conversions (prioritarias según requisitos)
  [EbookFormat.MOBI]: [
    EbookFormat.EPUB,    // MOBI a EPUB
    EbookFormat.AZW3,    // MOBI a AZW3 - Kindle moderno
    EbookFormat.PDF,     // MOBI a PDF
    EbookFormat.TXT,     // MOBI a TXT
    EbookFormat.AZW,     // MOBI a AZW
    EbookFormat.HTML     // MOBI a HTML
  ],
  // AZW3 conversions (Kindle moderno)
  [EbookFormat.AZW3]: [
    EbookFormat.EPUB,    // AZW3 a EPUB
    EbookFormat.MOBI,    // AZW3 a MOBI
    EbookFormat.PDF,     // AZW3 a PDF
    EbookFormat.TXT,     // AZW3 a TXT
    EbookFormat.AZW,     // AZW3 a AZW
    EbookFormat.HTML     // AZW3 a HTML
  ],
  // AZW conversions (Kindle básico)
  [EbookFormat.AZW]: [
    EbookFormat.EPUB,    // AZW a EPUB
    EbookFormat.MOBI,    // AZW a MOBI
    EbookFormat.AZW3,    // AZW a AZW3
    EbookFormat.PDF,     // AZW a PDF
    EbookFormat.TXT      // AZW a TXT
  ],
  // DOC conversions
  [EbookFormat.DOC]: [
    EbookFormat.EPUB,    // DOC a EPUB
    EbookFormat.PDF,     // DOC a PDF
    EbookFormat.MOBI,    // DOC a MOBI
    EbookFormat.DOCX,    // DOC a DOCX
    EbookFormat.RTF,     // DOC a RTF
    EbookFormat.TXT,     // DOC a TXT
    EbookFormat.HTML     // DOC a HTML
  ],
  // DOCX conversions
  [EbookFormat.DOCX]: [
    EbookFormat.EPUB,    // DOCX a EPUB
    EbookFormat.PDF,     // DOCX a PDF
    EbookFormat.MOBI,    // DOCX a MOBI
    EbookFormat.DOC,     // DOCX a DOC
    EbookFormat.RTF,     // DOCX a RTF
    EbookFormat.TXT,     // DOCX a TXT
    EbookFormat.HTML     // DOCX a HTML
  ],
  // HTML conversions
  [EbookFormat.HTML]: [
    EbookFormat.EPUB,    // HTML a EPUB - excelente con epub-gen
    EbookFormat.PDF,     // HTML a PDF
    EbookFormat.MOBI,    // HTML a MOBI
    EbookFormat.TXT,     // HTML a TXT
    EbookFormat.RTF,     // HTML a RTF
    EbookFormat.DOCX     // HTML a DOCX
  ],
  // RTF conversions
  [EbookFormat.RTF]: [
    EbookFormat.EPUB,    // RTF a EPUB
    EbookFormat.PDF,     // RTF a PDF
    EbookFormat.MOBI,    // RTF a MOBI
    EbookFormat.DOCX,    // RTF a DOCX
    EbookFormat.DOC,     // RTF a DOC
    EbookFormat.TXT,     // RTF a TXT
    EbookFormat.HTML     // RTF a HTML
  ],
  // TXT conversions
  [EbookFormat.TXT]: [
    EbookFormat.EPUB,    // TXT a EPUB - bueno con epub-gen
    EbookFormat.PDF,     // TXT a PDF
    EbookFormat.MOBI,    // TXT a MOBI
    EbookFormat.RTF,     // TXT a RTF
    EbookFormat.HTML,    // TXT a HTML
    EbookFormat.DOCX     // TXT a DOCX
  ],
  // PDB conversions (Palm Pilot)
  [EbookFormat.PDB]: [
    EbookFormat.EPUB,    // PDB a EPUB
    EbookFormat.TXT,     // PDB a TXT
    EbookFormat.PDF,     // PDB a PDF
    EbookFormat.HTML     // PDB a HTML
  ],
  // LRF conversions (Sony Reader)
  [EbookFormat.LRF]: [
    EbookFormat.EPUB,    // LRF a EPUB
    EbookFormat.PDF,     // LRF a PDF
    EbookFormat.MOBI,    // LRF a MOBI
    EbookFormat.TXT,     // LRF a TXT
    EbookFormat.HTML     // LRF a HTML
  ],
  // OEB conversions (Open eBook)
  [EbookFormat.OEB]: [
    EbookFormat.EPUB,    // OEB a EPUB - excelente compatibilidad
    EbookFormat.PDF,     // OEB a PDF
    EbookFormat.MOBI,    // OEB a MOBI
    EbookFormat.HTML,    // OEB a HTML
    EbookFormat.TXT      // OEB a TXT
  ]
};
// Calidad esperada para cada conversión (para recomendaciones)
interface ConversionQuality {
  from: EbookFormat;
  to: EbookFormat;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  preservesFormatting: boolean;
  preservesImages: boolean;
  preservesMetadata: boolean;
}
export const ebookConversionQualities: ConversionQuality[] = [
  // Conversiones de alta calidad (excellent)
  { from: EbookFormat.EPUB, to: EbookFormat.MOBI, quality: 'excellent', preservesFormatting: true, preservesImages: true, preservesMetadata: true },
  { from: EbookFormat.EPUB, to: EbookFormat.AZW3, quality: 'excellent', preservesFormatting: true, preservesImages: true, preservesMetadata: true },
  { from: EbookFormat.MOBI, to: EbookFormat.EPUB, quality: 'excellent', preservesFormatting: true, preservesImages: true, preservesMetadata: true },
  { from: EbookFormat.AZW3, to: EbookFormat.EPUB, quality: 'excellent', preservesFormatting: true, preservesImages: true, preservesMetadata: true },
  { from: EbookFormat.DOCX, to: EbookFormat.EPUB, quality: 'excellent', preservesFormatting: true, preservesImages: true, preservesMetadata: true },
  { from: EbookFormat.HTML, to: EbookFormat.EPUB, quality: 'excellent', preservesFormatting: true, preservesImages: true, preservesMetadata: false },
  { from: EbookFormat.OEB, to: EbookFormat.EPUB, quality: 'excellent', preservesFormatting: true, preservesImages: true, preservesMetadata: true },
  // Conversiones de buena calidad (good)
  { from: EbookFormat.PDF, to: EbookFormat.EPUB, quality: 'good', preservesFormatting: false, preservesImages: true, preservesMetadata: true },
  { from: EbookFormat.PDF, to: EbookFormat.MOBI, quality: 'good', preservesFormatting: false, preservesImages: true, preservesMetadata: true },
  { from: EbookFormat.EPUB, to: EbookFormat.PDF, quality: 'good', preservesFormatting: true, preservesImages: true, preservesMetadata: true },
  { from: EbookFormat.TXT, to: EbookFormat.EPUB, quality: 'good', preservesFormatting: false, preservesImages: false, preservesMetadata: false },
  { from: EbookFormat.RTF, to: EbookFormat.EPUB, quality: 'good', preservesFormatting: true, preservesImages: false, preservesMetadata: false },
  // Conversiones aceptables (fair)
  { from: EbookFormat.PDF, to: EbookFormat.TXT, quality: 'fair', preservesFormatting: false, preservesImages: false, preservesMetadata: false },
  { from: EbookFormat.PDF, to: EbookFormat.RTF, quality: 'fair', preservesFormatting: false, preservesImages: false, preservesMetadata: true },
  { from: EbookFormat.PDF, to: EbookFormat.DOCX, quality: 'fair', preservesFormatting: false, preservesImages: true, preservesMetadata: true },
  // Conversiones limitadas (poor)
  { from: EbookFormat.PDF, to: EbookFormat.PDB, quality: 'poor', preservesFormatting: false, preservesImages: false, preservesMetadata: false },
  { from: EbookFormat.PDB, to: EbookFormat.EPUB, quality: 'poor', preservesFormatting: false, preservesImages: false, preservesMetadata: false }
];
// Conversiones más populares según requisitos del usuario
export const popularEbookConversions = [
  // PDF conversions (más populares)
  { from: EbookFormat.PDF, to: EbookFormat.EPUB, popularity: 95 },
  { from: EbookFormat.PDF, to: EbookFormat.MOBI, popularity: 85 },
  { from: EbookFormat.PDF, to: EbookFormat.AZW3, popularity: 80 },
  { from: EbookFormat.PDF, to: EbookFormat.TXT, popularity: 70 },
  { from: EbookFormat.PDF, to: EbookFormat.RTF, popularity: 65 },
  { from: EbookFormat.PDF, to: EbookFormat.DOC, popularity: 60 },
  { from: EbookFormat.PDF, to: EbookFormat.PDB, popularity: 55 },
  // EPUB conversions
  { from: EbookFormat.EPUB, to: EbookFormat.PDF, popularity: 90 },
  { from: EbookFormat.EPUB, to: EbookFormat.MOBI, popularity: 85 },
  { from: EbookFormat.EPUB, to: EbookFormat.AZW3, popularity: 80 },
  // MOBI conversions
  { from: EbookFormat.MOBI, to: EbookFormat.EPUB, popularity: 88 },
  { from: EbookFormat.MOBI, to: EbookFormat.AZW3, popularity: 75 }
];
// Método recomendado para cada conversión
interface ConversionMethod {
  from: EbookFormat;
  to: EbookFormat;
  method: 'calibre' | 'epub-gen' | 'pdf-lib';
  reason: string;
}
export const ebookConversionMethods: ConversionMethod[] = [
  // Calibre es óptimo para la mayoría de conversiones
  { from: EbookFormat.PDF, to: EbookFormat.EPUB, method: 'calibre', reason: 'Análisis avanzado de PDF y generación EPUB optimizada' },
  { from: EbookFormat.EPUB, to: EbookFormat.MOBI, method: 'calibre', reason: 'Conversión nativa entre formatos de e-book' },
  { from: EbookFormat.MOBI, to: EbookFormat.EPUB, method: 'calibre', reason: 'Preserva metadatos y estructura' },
  
  // epub-gen para generación desde texto/HTML
  { from: EbookFormat.HTML, to: EbookFormat.EPUB, method: 'epub-gen', reason: 'Especializado en crear EPUB desde HTML' },
  { from: EbookFormat.TXT, to: EbookFormat.EPUB, method: 'epub-gen', reason: 'Mejor control sobre estructura EPUB desde texto' },
  
  // pdf-lib para generación de PDF
  { from: EbookFormat.HTML, to: EbookFormat.PDF, method: 'pdf-lib', reason: 'Generación PDF optimizada desde HTML' },
  { from: EbookFormat.TXT, to: EbookFormat.PDF, method: 'pdf-lib', reason: 'Control preciso sobre formato PDF' }
];
/**
 * Obtiene todos los formatos de salida disponibles para un formato de entrada
 */
export function getEbookTargetFormats(sourceFormat: EbookFormat): EbookFormat[] {
  return ebookDirectConversions[sourceFormat] || [];
}
/**
 * Verifica si una conversión específica es posible
 */
export function canConvertEbook(from: EbookFormat, to: EbookFormat): boolean {
  const targets = ebookDirectConversions[from];
  return targets ? targets.includes(to) : false;
}
/**
 * Obtiene la calidad esperada para una conversión
 */
export function getEbookConversionQuality(from: EbookFormat, to: EbookFormat): ConversionQuality | null {
  return ebookConversionQualities.find(q => q.from === from && q.to === to) || null;
}
/**
 * Obtiene el método recomendado para una conversión
 */
export function getEbookConversionMethod(from: EbookFormat, to: EbookFormat): ConversionMethod | null {
  return ebookConversionMethods.find(m => m.from === from && m.to === to) || null;
}
/**
 * Obtiene las conversiones más populares
 */
export function getPopularEbookConversions() {
  return popularEbookConversions.sort((a, b) => b.popularity - a.popularity);
}
/**
 * Obtiene todas las conversiones disponibles desde un formato
 */
export function getAllConversionsFrom(format: EbookFormat) {
  const targets = getEbookTargetFormats(format);
  return targets.map(target => ({
    from: format,
    to: target,
    quality: getEbookConversionQuality(format, target),
    method: getEbookConversionMethod(format, target),
    popularity: popularEbookConversions.find(p => p.from === format && p.to === target)?.popularity || 0
  }));
}
export { ebookDirectConversions };