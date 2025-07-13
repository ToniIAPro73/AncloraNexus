// Servicio de validación y análisis de metadatos para libros electrónicos
// Siguiendo convenciones de la guía de estilos Anclora
import { EbookFormat, EbookMetadata, EbookFile } from '../types/ebook';
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: EbookMetadata;
}
interface FormatValidationRules {
  maxFileSize: number; // en MB
  requiredExtensions: string[];
  supportedMimeTypes: string[];
  metadataFields: string[];
}
class EbookValidationService {
  private formatRules: Record<EbookFormat, FormatValidationRules>;
  constructor() {
    this.formatRules = this.initializeFormatRules();
  }
  /**
   * Valida un archivo de e-book y extrae metadatos
   * @param file Archivo a validar
   * @returns Resultado de validación con metadatos
   */
  async validateEbookFile(file: File | EbookFile): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    try {
      // Detectar formato del archivo
      const detectedFormat = this.detectFormat(file.name);
      if (!detectedFormat) {
        errors.push('Formato de archivo no soportado');
        return { isValid: false, errors, warnings };
      }
      // Validar tamaño del archivo
      const sizeValidation = this.validateFileSize(file.size, detectedFormat);
      if (!sizeValidation.isValid) {
        errors.push(...sizeValidation.errors);
      }
      // Validar estructura del archivo
      const structureValidation = await this.validateFileStructure(file, detectedFormat);
      if (!structureValidation.isValid) {
        errors.push(...structureValidation.errors);
        warnings.push(...structureValidation.warnings);
      }
      // Extraer metadatos
      const metadata = await this.extractMetadata(file, detectedFormat);
      if (metadata) {
        const metadataValidation = this.validateMetadata(metadata, detectedFormat);
        warnings.push(...metadataValidation.warnings);
      }
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata
      };
    } catch (error) {
      errors.push(`Error durante validación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return { isValid: false, errors, warnings };
    }
  }
  /**
   * Detecta el formato de un archivo basado en su nombre
   */
  detectFormat(fileName: string): EbookFormat | null {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const formatMap: Record<string, EbookFormat> = {
      'epub': EbookFormat.EPUB,
      'mobi': EbookFormat.MOBI,
      'azw': EbookFormat.AZW,
      'azw3': EbookFormat.AZW3,
      'pdf': EbookFormat.PDF,
      'doc': EbookFormat.DOC,
      'docx': EbookFormat.DOCX,
      'html': EbookFormat.HTML,
      'htm': EbookFormat.HTML,
      'rtf': EbookFormat.RTF,
      'txt': EbookFormat.TXT,
      'pdb': EbookFormat.PDB,
      'lrf': EbookFormat.LRF,
      'oeb': EbookFormat.OEB
    };
    return extension ? formatMap[extension] || null : null;
  }
  /**
   * Valida el tamaño del archivo
   */
  private validateFileSize(size: number, format: EbookFormat): ValidationResult {
    const rules = this.formatRules[format];
    const sizeInMB = size / (1024 * 1024);
    const errors: string[] = [];
    if (sizeInMB > rules.maxFileSize) {
      errors.push(`Archivo demasiado grande. Máximo permitido: ${rules.maxFileSize}MB`);
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  }
  /**
   * Valida la estructura interna del archivo
   */
  private async validateFileStructure(file: File | EbookFile, format: EbookFormat): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    try {
      switch (format) {
        case EbookFormat.EPUB:
          return await this.validateEpubStructure(file);
        case EbookFormat.PDF:
          return await this.validatePdfStructure(file);
        case EbookFormat.MOBI:
        case EbookFormat.AZW:
        case EbookFormat.AZW3:
          return await this.validateMobiStructure(file);
        default:
          // Para formatos simples (TXT, RTF, HTML), validación básica
          return { isValid: true, errors, warnings };
      }
    } catch (error) {
      errors.push(`Error al validar estructura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return { isValid: false, errors, warnings };
    }
  }
  /**
   * Valida estructura de archivo EPUB
   */
  private async validateEpubStructure(file: File | EbookFile): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    // En una implementación real, aquí se validaría:
    // - Presencia de mimetype file
    // - Estructura META-INF/container.xml
    // - Validez del OPF file
    // - Estructura de directorios
    // Placeholder para validación EPUB
    // Esto requeriría una librería como yauzl para leer ZIP/EPUB
    
    return { isValid: true, errors, warnings };
  }
  /**
   * Valida estructura de archivo PDF
   */
  private async validatePdfStructure(file: File | EbookFile): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Validación básica de PDF
    // En implementación real, se verificaría:
    // - Headers PDF válidos
    // - Estructura de objetos
    // - Presencia de metadatos
    return { isValid: true, errors, warnings };
  }
  /**
   * Valida estructura de archivos MOBI/AZW
   */
  private async validateMobiStructure(file: File | EbookFile): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Validación MOBI requiere análisis binario específico
    // En implementación real se verificaría:
    // - MOBI header
    // - PalmDOC header
    // - Estructura de registros
    return { isValid: true, errors, warnings };
  }
  /**
   * Extrae metadatos del archivo
   */
  private async extractMetadata(file: File | EbookFile, format: EbookFormat): Promise<EbookMetadata | null> {
    try {
      const baseMetadata: EbookMetadata = {
        format,
        fileSize: file.size
      };
      switch (format) {
        case EbookFormat.EPUB:
          return await this.extractEpubMetadata(file, baseMetadata);
        case EbookFormat.PDF:
          return await this.extractPdfMetadata(file, baseMetadata);
        case EbookFormat.MOBI:
        case EbookFormat.AZW:
        case EbookFormat.AZW3:
          return await this.extractMobiMetadata(file, baseMetadata);
        default:
          return baseMetadata;
      }
    } catch (error) {
      console.warn(`Error extrayendo metadatos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return null;
    }
  }
  /**
   * Extrae metadatos de EPUB
   */
  private async extractEpubMetadata(file: File | EbookFile, baseMetadata: EbookMetadata): Promise<EbookMetadata> {
    // En implementación real, se usaría una librería para leer el OPF del EPUB
    // y extraer título, autor, ISBN, etc.
    
    return {
      ...baseMetadata,
      title: 'Título extraído del EPUB', // Placeholder
      author: 'Autor extraído',
      language: 'es'
    };
  }
  /**
   * Extrae metadatos de PDF
   */
  private async extractPdfMetadata(file: File | EbookFile, baseMetadata: EbookMetadata): Promise<EbookMetadata> {
    // En implementación real, se usaría pdf-lib o similar
    // para extraer metadatos del PDF
    
    return {
      ...baseMetadata,
      title: 'Título extraído del PDF',
      author: 'Autor extraído'
    };
  }
  /**
   * Extrae metadatos de MOBI/AZW
   */
  private async extractMobiMetadata(file: File | EbookFile, baseMetadata: EbookMetadata): Promise<EbookMetadata> {
    // Extracción de metadatos MOBI requiere análisis binario específico
    
    return {
      ...baseMetadata,
      title: 'Título extraído del MOBI',
      author: 'Autor extraído'
    };
  }
  /**
   * Valida metadatos extraídos
   */
  private validateMetadata(metadata: EbookMetadata, format: EbookFormat): { warnings: string[] } {
    const warnings: string[] = [];
    const rules = this.formatRules[format];
    // Verificar campos obligatorios según el formato
    if (!metadata.title) {
      warnings.push('El archivo no contiene título');
    }
    if (!metadata.author) {
      warnings.push('El archivo no contiene información del autor');
    }
    if (!metadata.language) {
      warnings.push('El archivo no especifica idioma');
    }
    return { warnings };
  }
  /**
   * Inicializa las reglas de validación por formato
   */
  private initializeFormatRules(): Record<EbookFormat, FormatValidationRules> {
    return {
      [EbookFormat.EPUB]: {
        maxFileSize: 100,
        requiredExtensions: ['epub'],
        supportedMimeTypes: ['application/epub+zip'],
        metadataFields: ['title', 'author', 'language', 'publisher']
      },
      [EbookFormat.MOBI]: {
        maxFileSize: 50,
        requiredExtensions: ['mobi'],
        supportedMimeTypes: ['application/x-mobipocket-ebook'],
        metadataFields: ['title', 'author']
      },
      [EbookFormat.AZW]: {
        maxFileSize: 50,
        requiredExtensions: ['azw'],
        supportedMimeTypes: ['application/vnd.amazon.ebook'],
        metadataFields: ['title', 'author']
      },
      [EbookFormat.AZW3]: {
        maxFileSize: 50,
        requiredExtensions: ['azw3'],
        supportedMimeTypes: ['application/vnd.amazon.ebook'],
        metadataFields: ['title', 'author']
      },
      [EbookFormat.PDF]: {
        maxFileSize: 200,
        requiredExtensions: ['pdf'],
        supportedMimeTypes: ['application/pdf'],
        metadataFields: ['title', 'author', 'subject']
      },
      [EbookFormat.DOC]: {
        maxFileSize: 100,
        requiredExtensions: ['doc'],
        supportedMimeTypes: ['application/msword'],
        metadataFields: ['title', 'author']
      },
      [EbookFormat.DOCX]: {
        maxFileSize: 100,
        requiredExtensions: ['docx'],
        supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        metadataFields: ['title', 'author']
      },
      [EbookFormat.HTML]: {
        maxFileSize: 50,
        requiredExtensions: ['html', 'htm'],
        supportedMimeTypes: ['text/html'],
        metadataFields: ['title']
      },
      [EbookFormat.RTF]: {
        maxFileSize: 50,
        requiredExtensions: ['rtf'],
        supportedMimeTypes: ['application/rtf'],
        metadataFields: ['title', 'author']
      },
      [EbookFormat.TXT]: {
        maxFileSize: 10,
        requiredExtensions: ['txt'],
        supportedMimeTypes: ['text/plain'],
        metadataFields: []
      },
      [EbookFormat.PDB]: {
        maxFileSize: 20,
        requiredExtensions: ['pdb'],
        supportedMimeTypes: ['application/vnd.palm'],
        metadataFields: ['title']
      },
      [EbookFormat.LRF]: {
        maxFileSize: 30,
        requiredExtensions: ['lrf'],
        supportedMimeTypes: ['application/x-sony-bbeb'],
        metadataFields: ['title', 'author']
      },
      [EbookFormat.OEB]: {
        maxFileSize: 50,
        requiredExtensions: ['oeb'],
        supportedMimeTypes: ['text/xml'],
        metadataFields: ['title', 'author']
      }
    };
  }
  /**
   * Obtiene información sobre formatos soportados
   */
  getSupportedFormats(): Array<{ format: EbookFormat; extensions: string[]; maxSize: number }> {
    return Object.entries(this.formatRules).map(([format, rules]) => ({
      format: format as EbookFormat,
      extensions: rules.requiredExtensions,
      maxSize: rules.maxFileSize
    }));
  }
}
export const ebookValidationService = new EbookValidationService();
export default ebookValidationService;