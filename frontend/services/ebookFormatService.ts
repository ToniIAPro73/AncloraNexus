import { EbookFormat, EPUBConfig, PDFConfig, MOBIConfig, FormatSpecificConfig } from '../types/ebook';
import { EBOOK_FORMATS, RECOMMENDED_SETTINGS } from '../utils/ebookConversionMaps';

// Interfaz para información detallada de formato
interface FormatDetails extends EbookFormat {
  advantages: string[];
  disadvantages: string[];
  bestUseCase: string;
  deviceCompatibility: string[];
  conversionComplexity: 'low' | 'medium' | 'high';
}

// Interfaz para configuración de conversión específica
interface ConversionConfig {
  format: string;
  settings: FormatSpecificConfig;
  optimizations: string[];
}

/**
 * Servicio para manejo específico de formatos de e-books
 */
export class EbookFormatService {
  private static instance: EbookFormatService;
  private formatDetails: Map<string, FormatDetails> = new Map();

  private constructor() {
    this.initializeFormatDetails();
  }

  static getInstance(): EbookFormatService {
    if (!EbookFormatService.instance) {
      EbookFormatService.instance = new EbookFormatService();
    }
    return EbookFormatService.instance;
  }

  /**
   * Obtiene información detallada de un formato
   */
  getFormatDetails(format: string): FormatDetails | null {
    return this.formatDetails.get(format.toLowerCase()) || null;
  }

  /**
   * Obtiene todos los formatos soportados con detalles
   */
  getAllFormats(): FormatDetails[] {
    return Array.from(this.formatDetails.values());
  }

  /**
   * Obtiene formatos recomendados para un dispositivo específico
   */
  getRecommendedFormats(device: string): FormatDetails[] {
    const allFormats = this.getAllFormats();
    
    return allFormats.filter(format => 
      format.deviceCompatibility.includes(device.toLowerCase()) ||
      format.deviceCompatibility.includes('universal')
    ).sort((a, b) => {
      // Priorizar formatos con menor complejidad de conversión
      const complexityOrder = { low: 0, medium: 1, high: 2 };
      return complexityOrder[a.conversionComplexity] - complexityOrder[b.conversionComplexity];
    });
  }

  /**
   * Obtiene configuración optimizada para conversión
   */
  getOptimalConfig(targetFormat: string, sourceFormat?: string, fileSize?: number): ConversionConfig | null {
    const format = this.getFormatDetails(targetFormat);
    if (!format) return null;

    const baseSettings = RECOMMENDED_SETTINGS[targetFormat] || {};
    const optimizations: string[] = [];

    // Configuraciones específicas por formato
    let settings: FormatSpecificConfig;

    switch (targetFormat.toLowerCase()) {
      case 'epub':
        settings = this.getEpubConfig(sourceFormat, fileSize);
        optimizations.push(...this.getEpubOptimizations(sourceFormat, fileSize));
        break;
      case 'pdf':
        settings = this.getPdfConfig(sourceFormat, fileSize);
        optimizations.push(...this.getPdfOptimizations(sourceFormat, fileSize));
        break;
      case 'mobi':
      case 'azw3':
        settings = this.getMobiConfig(sourceFormat, fileSize);
        optimizations.push(...this.getMobiOptimizations(sourceFormat, fileSize));
        break;
      default:
        settings = baseSettings;
    }

    return {
      format: targetFormat,
      settings,
      optimizations
    };
  }

  /**
   * Compara formatos y sugiere el mejor para un uso específico
   */
  compareFormats(formats: string[], useCase: 'reading' | 'archival' | 'distribution' | 'mobile'): {
    recommended: string;
    comparison: Array<{
      format: string;
      score: number;
      pros: string[];
      cons: string[];
    }>;
  } {
    const comparison = formats.map(format => {
      const details = this.getFormatDetails(format);
      if (!details) return null;

      let score = 50; // Base score
      const pros: string[] = [];
      const cons: string[] = [];

      // Scoring based on use case
      switch (useCase) {
        case 'reading':
          if (details.extension === 'epub') { score += 30; pros.push('Excelente para lectura'); }
          if (details.extension === 'pdf') { score -= 10; cons.push('Menos flexible en dispositivos móviles'); }
          if (details.supportsMetadata) { score += 10; pros.push('Soporte completo de metadatos'); }
          break;
        case 'archival':
          if (details.extension === 'pdf') { score += 25; pros.push('Excelente para archivo'); }
          if (!details.isProprietaryFormat) { score += 15; pros.push('Formato abierto'); }
          if (details.supportsDRM) { score -= 5; cons.push('Puede tener restricciones DRM'); }
          break;
        case 'distribution':
          if (details.extension === 'epub') { score += 20; pros.push('Amplia compatibilidad'); }
          if (details.isProprietaryFormat) { score -= 15; cons.push('Formato propietario'); }
          break;
        case 'mobile':
          if (details.extension === 'epub') { score += 25; pros.push('Optimizado para móviles'); }
          if (details.extension === 'pdf') { score -= 15; cons.push('Problemas en pantallas pequeñas'); }
          break;
      }

      // Additional scoring factors
      if (details.supportsImages) { score += 5; pros.push('Soporte de imágenes'); }
      if (details.conversionComplexity === 'low') { score += 10; pros.push('Conversión sencilla'); }
      if (details.conversionComplexity === 'high') { score -= 10; cons.push('Conversión compleja'); }

      return {
        format,
        score,
        pros: [...pros, ...details.advantages],
        cons: [...cons, ...details.disadvantages]
      };
    }).filter(Boolean) as Array<{
      format: string;
      score: number;
      pros: string[];
      cons: string[];
    }>;

    // Sort by score
    comparison.sort((a, b) => b.score - a.score);

    return {
      recommended: comparison[0]?.format || formats[0],
      comparison
    };
  }

  /**
   * Valida compatibilidad entre formatos
   */
  checkCompatibility(sourceFormat: string, targetFormat: string): {
    compatible: boolean;
    difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
    warnings: string[];
    dataLoss: string[];
  } {
    const source = this.getFormatDetails(sourceFormat);
    const target = this.getFormatDetails(targetFormat);

    if (!source || !target) {
      return {
        compatible: false,
        difficulty: 'impossible',
        warnings: ['Formato no soportado'],
        dataLoss: []
      };
    }

    const warnings: string[] = [];
    const dataLoss: string[] = [];
    let difficulty: 'easy' | 'medium' | 'hard' | 'impossible' = 'easy';

    // Check metadata compatibility
    if (source.supportsMetadata && !target.supportsMetadata) {
      dataLoss.push('Metadatos se perderán');
      difficulty = 'medium';
    }

    // Check image support
    if (source.supportsImages && !target.supportsImages) {
      dataLoss.push('Imágenes se perderán');
      difficulty = 'medium';
    }

    // Check DRM compatibility
    if (source.supportsDRM && !target.supportsDRM) {
      warnings.push('Protección DRM se eliminará');
    }

    // Format-specific compatibility checks
    if (sourceFormat === 'pdf' && targetFormat !== 'pdf') {
      warnings.push('La conversión desde PDF puede afectar el formato');
      difficulty = 'hard';
    }

    if (targetFormat === 'txt') {
      dataLoss.push('Formato y estructura se perderán');
      difficulty = 'medium';
    }

    return {
      compatible: true,
      difficulty,
      warnings,
      dataLoss
    };
  }

  // Métodos privados para configuraciones específicas

  private getEpubConfig(sourceFormat?: string, fileSize?: number): EPUBConfig {
    const config: EPUBConfig = {
      version: '3.0',
      includeNCX: true,
      splitChapters: true,
      chapterSplitSize: 250
    };

    // Ajustes basados en el archivo fuente
    if (fileSize && fileSize > 10 * 1024 * 1024) { // > 10MB
      config.splitChapters = true;
      config.chapterSplitSize = 200; // Capítulos más pequeños
    }

    if (sourceFormat === 'pdf') {
      config.version = '3.0'; // Mejor soporte para contenido complejo
    }

    return config;
  }

  private getPdfConfig(sourceFormat?: string, fileSize?: number): PDFConfig {
    const config: PDFConfig = {
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      embedFonts: true,
      imageQuality: 85
    };

    // Ajustes para optimizar tamaño
    if (fileSize && fileSize > 20 * 1024 * 1024) { // > 20MB
      config.imageQuality = 70; // Reducir calidad para archivos grandes
    }

    if (sourceFormat === 'epub' || sourceFormat === 'mobi') {
      config.pageSize = 'A4'; // Tamaño estándar para e-books
    }

    return config;
  }

  private getMobiConfig(sourceFormat?: string, fileSize?: number): MOBIConfig {
    const config: MOBIConfig = {
      kindleGeneration: 'new',
      compression: 'medium',
      includeOriginalImages: true
    };

    // Ajustes para archivos grandes
    if (fileSize && fileSize > 15 * 1024 * 1024) { // > 15MB
      config.compression = 'high';
      config.includeOriginalImages = false;
    }

    return config;
  }

  private getEpubOptimizations(sourceFormat?: string, fileSize?: number): string[] {
    const optimizations: string[] = [];

    if (sourceFormat === 'pdf') {
      optimizations.push('Extraer texto de PDF');
      optimizations.push('Optimizar imágenes extraídas');
    }

    if (fileSize && fileSize > 10 * 1024 * 1024) {
      optimizations.push('Comprimir imágenes');
      optimizations.push('Dividir en capítulos');
    }

    return optimizations;
  }

  private getPdfOptimizations(sourceFormat?: string, fileSize?: number): string[] {
    const optimizations: string[] = [];

    optimizations.push('Optimizar para lectura');
    optimizations.push('Embebido de fuentes');

    if (fileSize && fileSize > 20 * 1024 * 1024) {
      optimizations.push('Comprimir imágenes');
      optimizations.push('Reducir calidad de imágenes');
    }

    return optimizations;
  }

  private getMobiOptimizations(sourceFormat?: string, fileSize?: number): string[] {
    const optimizations: string[] = [];

    optimizations.push('Optimizar para Kindle');
    
    if (sourceFormat === 'epub') {
      optimizations.push('Convertir metadatos EPUB');
    }

    if (fileSize && fileSize > 15 * 1024 * 1024) {
      optimizations.push('Comprimir contenido');
      optimizations.push('Optimizar imágenes para Kindle');
    }

    return optimizations;
  }

  private initializeFormatDetails(): void {
    // EPUB
    this.formatDetails.set('epub', {
      ...EBOOK_FORMATS.epub,
      advantages: [
        'Formato estándar abierto',
        'Excelente soporte de metadatos',
        'Reflowable text',
        'Amplia compatibilidad'
      ],
      disadvantages: [
        'Puede ser complejo para contenido con layout fijo',
        'Variaciones en renderizado entre dispositivos'
      ],
      bestUseCase: 'Lectura general en múltiples dispositivos',
      deviceCompatibility: ['universal', 'kobo', 'android', 'ios', 'web'],
      conversionComplexity: 'low'
    });

    // PDF
    this.formatDetails.set('pdf', {
      ...EBOOK_FORMATS.pdf,
      advantages: [
        'Preserva formato original',
        'Excelente para documentos con layout fijo',
        'Universal compatibility'
      ],
      disadvantages: [
        'No responsive en dispositivos móviles',
        'Difícil de leer en pantallas pequeñas',
        'Archivos grandes'
      ],
      bestUseCase: 'Documentos técnicos y archivo',
      deviceCompatibility: ['universal', 'desktop', 'tablet'],
      conversionComplexity: 'medium'
    });

    // MOBI
    this.formatDetails.set('mobi', {
      ...EBOOK_FORMATS.mobi,
      advantages: [
        'Optimizado para Kindle',
        'Buen soporte de metadatos',
        'Compresión eficiente'
      ],
      disadvantages: [
        'Formato propietario',
        'Limitado a ecosistema Amazon',
        'Tecnología más antigua'
      ],
      bestUseCase: 'Dispositivos Kindle antiguos',
      deviceCompatibility: ['kindle', 'amazon'],
      conversionComplexity: 'medium'
    });

    // AZW3
    this.formatDetails.set('azw3', {
      ...EBOOK_FORMATS.azw3,
      advantages: [
        'Formato moderno de Kindle',
        'Mejor soporte de HTML5 y CSS3',
        'Compresión avanzada'
      ],
      disadvantages: [
        'Formato propietario',
        'Limitado a ecosistema Amazon'
      ],
      bestUseCase: 'Dispositivos Kindle modernos',
      deviceCompatibility: ['kindle', 'amazon'],
      conversionComplexity: 'medium'
    });

    // TXT
    this.formatDetails.set('txt', {
      ...EBOOK_FORMATS.txt,
      advantages: [
        'Máxima compatibilidad',
        'Archivos muy pequeños',
        'Fácil de editar'
      ],
      disadvantages: [
        'Sin formato',
        'Sin metadatos',
        'Sin imágenes'
      ],
      bestUseCase: 'Texto simple y compatibilidad máxima',
      deviceCompatibility: ['universal'],
      conversionComplexity: 'low'
    });

    // RTF
    this.formatDetails.set('rtf', {
      ...EBOOK_FORMATS.rtf,
      advantages: [
        'Soporte de formato básico',
        'Compatible con procesadores de texto',
        'Metadatos básicos'
      ],
      disadvantages: [
        'Formato obsoleto',
        'Limitado soporte en e-readers',
        'Archivos grandes'
      ],
      bestUseCase: 'Intercambio con procesadores de texto',
      deviceCompatibility: ['desktop', 'universal'],
      conversionComplexity: 'low'
    });

    // Agregar más formatos según sea necesario...
  }
}

