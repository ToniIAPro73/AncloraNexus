// Servicio de manejo específico por formato de e-books
// Implementaciones especializadas siguiendo guía de estilos Anclora
import { EbookFormat, EbookMetadata, EbookConversionRequest } from '../types/ebook';
interface FormatHandler {
  canRead: boolean;
  canWrite: boolean;
  preservesMetadata: boolean;
  preservesFormatting: boolean;
  preservesImages: boolean;
  recommendedFor: string[];
}
interface ConversionCapability {
  from: EbookFormat;
  to: EbookFormat;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  method: 'direct' | 'calibre' | 'epub-gen' | 'pdf-lib';
  notes?: string;
}
class EbookFormatService {
  private formatHandlers: Record<EbookFormat, FormatHandler>;
  private conversionMatrix: ConversionCapability[];
  constructor() {
    this.formatHandlers = this.initializeFormatHandlers();
    this.conversionMatrix = this.initializeConversionMatrix();
  }
  /**
   * Obtiene información sobre un formato específico
   */
  getFormatInfo(format: EbookFormat): FormatHandler {
    return this.formatHandlers[format];
  }
  /**
   * Obtiene todas las conversiones posibles desde un formato
   */
  getConversionsFrom(format: EbookFormat): ConversionCapability[] {
    return this.conversionMatrix.filter(conv => conv.from === format);
  }
  /**
   * Obtiene todas las conversiones posibles hacia un formato
   */
  getConversionsTo(format: EbookFormat): ConversionCapability[] {
    return this.conversionMatrix.filter(conv => conv.to === format);
  }
  /**
   * Encuentra la mejor ruta de conversión entre dos formatos
   */
  getBestConversionPath(from: EbookFormat, to: EbookFormat): ConversionCapability | null {
    // Buscar conversión directa
    const directConversion = this.conversionMatrix.find(
      conv => conv.from === from && conv.to === to
    );
    if (directConversion) {
      return directConversion;
    }
    // Si no hay conversión directa, buscar mediante formato intermedio
    // Por ahora retornamos null, pero se podría implementar pathfinding
    return null;
  }
  /**
   * Valida si una conversión específica es posible
   */
  canConvert(from: EbookFormat, to: EbookFormat): boolean {
    return this.conversionMatrix.some(conv => conv.from === from && conv.to === to);
  }
  /**
   * Obtiene recomendaciones específicas para una conversión
   */
  getConversionRecommendations(from: EbookFormat, to: EbookFormat): string[] {
    const conversion = this.getBestConversionPath(from, to);
    if (!conversion) {
      return ['Conversión no soportada directamente'];
    }
    const recommendations: string[] = [];
    // Recomendaciones basadas en calidad
    switch (conversion.quality) {
      case 'excellent':
        recommendations.push('✅ Conversión de alta calidad, se preserva todo el contenido');
        break;
      case 'good':
        recommendations.push('✅ Buena conversión, se preserva la mayoría del contenido');
        break;
      case 'fair':
        recommendations.push('⚠️ Conversión aceptable, posible pérdida menor de formato');
        break;
      case 'poor':
        recommendations.push('⚠️ Conversión limitada, posible pérdida significativa de formato');
        break;
    }
    // Recomendaciones específicas por formato
    if (from === EbookFormat.PDF) {
      recommendations.push('📄 PDF a otros formatos: el resultado depende de si el PDF contiene texto seleccionable');
      if (to === EbookFormat.EPUB) {
        recommendations.push('📖 Para mejores resultados en EPUB, use PDFs con texto estructurado');
      }
    }
    if (to === EbookFormat.MOBI || to === EbookFormat.AZW3) {
      recommendations.push('📱 Formato optimizado para dispositivos Kindle');
    }
    if (to === EbookFormat.EPUB) {
      recommendations.push('📱 Formato estándar compatible con la mayoría de lectores');
    }
    if (conversion.notes) {
      recommendations.push(`ℹ️ ${conversion.notes}`);
    }
    return recommendations;
  }
  /**
   * Obtiene configuraciones optimizadas para una conversión específica
   */
  getOptimizedSettings(from: EbookFormat, to: EbookFormat, device?: string): Partial<EbookConversionRequest> {
    const settings: Partial<EbookConversionRequest> = {
      preserveMetadata: true
    };
    // Configuraciones específicas por formato destino
    switch (to) {
      case EbookFormat.MOBI:
      case EbookFormat.AZW3:
        settings.optimizeForDevice = 'kindle';
        settings.customOptions = {
          'mobi-file-type': 'both',
          'prefer-metadata-cover': true
        };
        break;
      case EbookFormat.EPUB:
        settings.customOptions = {
          'epub-version': '3',
          'flow-size': '260',
          'pretty-print': true
        };
        break;
      case EbookFormat.PDF:
        settings.customOptions = {
          'pdf-page-numbers': true,
          'preserve-cover-aspect-ratio': true,
          'pdf-add-toc': true
        };
        break;
    }
    // Configuraciones específicas por formato origen
    if (from === EbookFormat.PDF) {
      settings.customOptions = {
        ...settings.customOptions,
        'pdf-engine': 'calibre',
        'remove-paragraph-spacing': false
      };
    }
    // Configuraciones por dispositivo
    if (device) {
      switch (device) {
        case 'kindle':
          settings.optimizeForDevice = 'kindle';
          settings.customOptions = {
            ...settings.customOptions,
            'output-profile': 'kindle'
          };
          break;
        case 'kobo':
          settings.optimizeForDevice = 'kobo';
          break;
      }
    }
    return settings;
  }
  /**
   * Inicializa los manejadores de formato
   */
  private initializeFormatHandlers(): Record<EbookFormat, FormatHandler> {
    return {
      [EbookFormat.EPUB]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: true,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Lectura general', 'Dispositivos múltiples', 'Estándar abierto']
      },
      [EbookFormat.MOBI]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: true,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Kindle antiguo', 'Compatibilidad Amazon']
      },
      [EbookFormat.AZW]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: true,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Kindle', 'DRM Amazon']
      },
      [EbookFormat.AZW3]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: true,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Kindle moderno', 'Formato avanzado Amazon']
      },
      [EbookFormat.PDF]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: true,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Diseño fijo', 'Documentos técnicos', 'Impresión']
      },
      [EbookFormat.DOC]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: false,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Edición', 'Compatibilidad Office antigua']
      },
      [EbookFormat.DOCX]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: true,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Edición moderna', 'Microsoft Word']
      },
      [EbookFormat.HTML]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: false,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Web', 'Conversión intermedia']
      },
      [EbookFormat.RTF]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: false,
        preservesFormatting: true,
        preservesImages: false,
        recommendedFor: ['Compatibilidad universal', 'Texto enriquecido simple']
      },
      [EbookFormat.TXT]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: false,
        preservesFormatting: false,
        preservesImages: false,
        recommendedFor: ['Texto plano', 'Máxima compatibilidad', 'Tamaño mínimo']
      },
      [EbookFormat.PDB]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: false,
        preservesFormatting: false,
        preservesImages: false,
        recommendedFor: ['Palm Pilot', 'Dispositivos antiguos']
      },
      [EbookFormat.LRF]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: true,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Sony Reader', 'Dispositivos Sony']
      },
      [EbookFormat.OEB]: {
        canRead: true,
        canWrite: true,
        preservesMetadata: true,
        preservesFormatting: true,
        preservesImages: true,
        recommendedFor: ['Estándar antiguo', 'Conversión intermedia']
      }
    };
  }
  /**
   * Inicializa la matriz de conversiones
   */
  private initializeConversionMatrix(): ConversionCapability[] {
    return [
      // Conversiones desde PDF (prioritarias según requisitos)
      { from: EbookFormat.PDF, to: EbookFormat.EPUB, quality: 'good', method: 'calibre' },
      { from: EbookFormat.PDF, to: EbookFormat.MOBI, quality: 'good', method: 'calibre', notes: 'Optimizado para Kindle' },
      { from: EbookFormat.PDF, to: EbookFormat.AZW3, quality: 'good', method: 'calibre', notes: 'Kindle moderno' },
      { from: EbookFormat.PDF, to: EbookFormat.DOC, quality: 'fair', method: 'calibre' },
      { from: EbookFormat.PDF, to: EbookFormat.DOCX, quality: 'fair', method: 'calibre' },
      { from: EbookFormat.PDF, to: EbookFormat.TXT, quality: 'fair', method: 'calibre', notes: 'Solo texto, sin formato' },
      { from: EbookFormat.PDF, to: EbookFormat.RTF, quality: 'fair', method: 'calibre' },
      { from: EbookFormat.PDF, to: EbookFormat.PDB, quality: 'poor', method: 'calibre' },
      // Conversiones desde EPUB (prioritarias según requisitos)
      { from: EbookFormat.EPUB, to: EbookFormat.PDF, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.EPUB, to: EbookFormat.MOBI, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.EPUB, to: EbookFormat.AZW3, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.EPUB, to: EbookFormat.AZW, quality: 'good', method: 'calibre' },
      // Conversiones desde MOBI (prioritarias según requisitos)
      { from: EbookFormat.MOBI, to: EbookFormat.EPUB, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.MOBI, to: EbookFormat.AZW3, quality: 'excellent', method: 'calibre', notes: 'Kindle a Kindle moderno' },
      // Conversiones desde otros formatos
      { from: EbookFormat.DOC, to: EbookFormat.EPUB, quality: 'good', method: 'calibre' },
      { from: EbookFormat.DOC, to: EbookFormat.PDF, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.DOC, to: EbookFormat.MOBI, quality: 'good', method: 'calibre' },
      
      { from: EbookFormat.DOCX, to: EbookFormat.EPUB, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.DOCX, to: EbookFormat.PDF, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.DOCX, to: EbookFormat.MOBI, quality: 'good', method: 'calibre' },
      { from: EbookFormat.HTML, to: EbookFormat.EPUB, quality: 'excellent', method: 'epub-gen' },
      { from: EbookFormat.HTML, to: EbookFormat.PDF, quality: 'good', method: 'pdf-lib' },
      { from: EbookFormat.HTML, to: EbookFormat.MOBI, quality: 'good', method: 'calibre' },
      { from: EbookFormat.RTF, to: EbookFormat.EPUB, quality: 'good', method: 'calibre' },
      { from: EbookFormat.RTF, to: EbookFormat.PDF, quality: 'good', method: 'calibre' },
      { from: EbookFormat.RTF, to: EbookFormat.MOBI, quality: 'good', method: 'calibre' },
      { from: EbookFormat.TXT, to: EbookFormat.EPUB, quality: 'good', method: 'epub-gen' },
      { from: EbookFormat.TXT, to: EbookFormat.PDF, quality: 'good', method: 'pdf-lib' },
      { from: EbookFormat.TXT, to: EbookFormat.MOBI, quality: 'good', method: 'calibre' },
      // Conversiones hacia formatos comunes desde otros
      { from: EbookFormat.AZW, to: EbookFormat.EPUB, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.AZW, to: EbookFormat.PDF, quality: 'good', method: 'calibre' },
      { from: EbookFormat.AZW, to: EbookFormat.MOBI, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.AZW3, to: EbookFormat.EPUB, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.AZW3, to: EbookFormat.PDF, quality: 'good', method: 'calibre' },
      { from: EbookFormat.AZW3, to: EbookFormat.MOBI, quality: 'excellent', method: 'calibre' },
      // Conversiones con formatos menos comunes
      { from: EbookFormat.PDB, to: EbookFormat.EPUB, quality: 'fair', method: 'calibre' },
      { from: EbookFormat.PDB, to: EbookFormat.TXT, quality: 'good', method: 'calibre' },
      { from: EbookFormat.LRF, to: EbookFormat.EPUB, quality: 'good', method: 'calibre' },
      { from: EbookFormat.LRF, to: EbookFormat.PDF, quality: 'good', method: 'calibre' },
      { from: EbookFormat.OEB, to: EbookFormat.EPUB, quality: 'excellent', method: 'calibre' },
      { from: EbookFormat.OEB, to: EbookFormat.PDF, quality: 'good', method: 'calibre' }
    ];
  }
  /**
   * Obtiene estadísticas sobre las capacidades de conversión
   */
  getConversionStats() {
    const totalConversions = this.conversionMatrix.length;
    const qualityStats = this.conversionMatrix.reduce((acc, conv) => {
      acc[conv.quality] = (acc[conv.quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const methodStats = this.conversionMatrix.reduce((acc, conv) => {
      acc[conv.method] = (acc[conv.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      totalConversions,
      qualityDistribution: qualityStats,
      methodDistribution: methodStats,
      supportedFormats: Object.keys(this.formatHandlers).length
    };
  }
}
export const ebookFormatService = new EbookFormatService();
export default ebookFormatService;