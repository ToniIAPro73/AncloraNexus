import { EbookValidationResult, EbookMetadata } from '../types/ebook';
import { isSupportedFormat, getFormatInfo } from '../utils/ebookConversionMaps';

// Interfaz para reglas de validación
interface ValidationRule {
  name: string;
  check: (file: File, metadata?: EbookMetadata) => Promise<ValidationIssue[]>;
}

// Interfaz para problemas de validación
interface ValidationIssue {
  type: 'error' | 'warning';
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * Servicio de validación y análisis de e-books
 */
export class EbookValidationService {
  private static instance: EbookValidationService;
  private validationRules: ValidationRule[] = [];

  private constructor() {
    this.initializeValidationRules();
  }

  static getInstance(): EbookValidationService {
    if (!EbookValidationService.instance) {
      EbookValidationService.instance = new EbookValidationService();
    }
    return EbookValidationService.instance;
  }

  /**
   * Valida un archivo e-book completo
   */
  async validateEbook(file: File, metadata?: EbookMetadata): Promise<EbookValidationResult> {
    const result: EbookValidationResult = {
      isValid: true,
      format: this.extractFormat(file.name),
      errors: [],
      warnings: [],
      metadata,
      fileInfo: {
        size: file.size,
        lastModified: new Date(file.lastModified)
      }
    };

    try {
      // Ejecutar todas las reglas de validación
      for (const rule of this.validationRules) {
        const issues = await rule.check(file, metadata);
        
        for (const issue of issues) {
          if (issue.type === 'error') {
            result.errors.push(issue.message);
            result.isValid = false;
          } else {
            result.warnings.push(issue.message);
          }
        }
      }

      // Validaciones específicas por formato
      await this.validateFormatSpecific(file, result);

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Error durante la validación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    return result;
  }

  /**
   * Valida solo la estructura básica del archivo
   */
  async quickValidate(file: File): Promise<{ isValid: boolean; format: string; error?: string }> {
    try {
      const format = this.extractFormat(file.name);
      
      // Verificar formato soportado
      if (!isSupportedFormat(format)) {
        return {
          isValid: false,
          format,
          error: `Formato no soportado: ${format}`
        };
      }

      // Verificar tamaño mínimo
      if (file.size < 100) {
        return {
          isValid: false,
          format,
          error: 'Archivo demasiado pequeño'
        };
      }

      // Verificar firma del archivo
      const isValidSignature = await this.validateFileSignature(file, format);
      if (!isValidSignature) {
        return {
          isValid: false,
          format,
          error: 'Archivo corrupto o formato incorrecto'
        };
      }

      return {
        isValid: true,
        format
      };

    } catch (error) {
      return {
        isValid: false,
        format: 'unknown',
        error: `Error en validación rápida: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Analiza la calidad del e-book
   */
  async analyzeQuality(file: File, metadata?: EbookMetadata): Promise<{
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  }> {
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Analizar metadatos
      if (!metadata?.title || metadata.title.trim().length === 0) {
        score -= 10;
        issues.push('Falta título');
        recommendations.push('Agregar título descriptivo');
      }

      if (!metadata?.author || metadata.author.trim().length === 0) {
        score -= 5;
        issues.push('Falta autor');
        recommendations.push('Especificar autor del libro');
      }

      // Analizar tamaño del archivo
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > 50) {
        score -= 15;
        issues.push('Archivo muy grande');
        recommendations.push('Considerar comprimir imágenes o dividir el contenido');
      } else if (sizeMB < 0.1) {
        score -= 10;
        issues.push('Archivo muy pequeño');
        recommendations.push('Verificar que el contenido esté completo');
      }

      // Analizar formato
      const format = this.extractFormat(file.name);
      const formatInfo = getFormatInfo(format);
      
      if (formatInfo?.isProprietaryFormat) {
        score -= 5;
        issues.push('Formato propietario');
        recommendations.push('Considerar convertir a formato abierto como EPUB');
      }

      // Validaciones específicas por formato
      if (format === 'pdf') {
        score -= 5; // PDF no es ideal para e-books
        recommendations.push('PDF no es óptimo para lectura en dispositivos móviles');
      }

      if (format === 'txt') {
        score -= 10;
        issues.push('Formato muy básico');
        recommendations.push('Convertir a formato con mejor soporte de metadatos');
      }

    } catch (error) {
      score -= 20;
      issues.push('Error analizando calidad');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Sugiere mejores formatos para conversión
   */
  suggestOptimalFormats(currentFormat: string, targetDevice?: string): string[] {
    const suggestions: string[] = [];
    
    switch (targetDevice) {
      case 'kindle':
        suggestions.push('azw3', 'mobi', 'epub');
        break;
      case 'kobo':
        suggestions.push('epub', 'pdf');
        break;
      case 'mobile':
        suggestions.push('epub', 'pdf');
        break;
      default:
        // Sugerencias generales
        if (currentFormat !== 'epub') suggestions.push('epub');
        if (currentFormat !== 'pdf') suggestions.push('pdf');
        if (currentFormat !== 'mobi') suggestions.push('mobi');
    }

    // Filtrar el formato actual
    return suggestions.filter(format => format !== currentFormat);
  }

  // Métodos privados

  private initializeValidationRules(): void {
    this.validationRules = [
      {
        name: 'fileSize',
        check: async (file) => {
          const issues: ValidationIssue[] = [];
          const maxSize = 100 * 1024 * 1024; // 100MB
          const minSize = 100; // 100 bytes
          
          if (file.size > maxSize) {
            issues.push({
              type: 'error',
              code: 'FILE_TOO_LARGE',
              message: `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo: 100MB)`,
              suggestion: 'Comprimir el archivo o dividir el contenido'
            });
          }
          
          if (file.size < minSize) {
            issues.push({
              type: 'error',
              code: 'FILE_TOO_SMALL',
              message: 'Archivo demasiado pequeño para ser un e-book válido',
              suggestion: 'Verificar que el archivo no esté corrupto'
            });
          }
          
          return issues;
        }
      },
      {
        name: 'formatSupport',
        check: async (file) => {
          const issues: ValidationIssue[] = [];
          const format = this.extractFormat(file.name);
          
          if (!isSupportedFormat(format)) {
            issues.push({
              type: 'error',
              code: 'UNSUPPORTED_FORMAT',
              message: `Formato no soportado: ${format}`,
              suggestion: 'Convertir a un formato soportado antes de procesar'
            });
          }
          
          return issues;
        }
      },
      {
        name: 'fileName',
        check: async (file) => {
          const issues: ValidationIssue[] = [];
          
          if (file.name.length > 255) {
            issues.push({
              type: 'warning',
              code: 'FILENAME_TOO_LONG',
              message: 'Nombre de archivo muy largo',
              suggestion: 'Acortar el nombre del archivo'
            });
          }
          
          if (!/^[a-zA-Z0-9._\-\s]+$/.test(file.name)) {
            issues.push({
              type: 'warning',
              code: 'SPECIAL_CHARACTERS',
              message: 'El nombre contiene caracteres especiales',
              suggestion: 'Usar solo letras, números, guiones y puntos'
            });
          }
          
          return issues;
        }
      },
      {
        name: 'metadata',
        check: async (file, metadata) => {
          const issues: ValidationIssue[] = [];
          
          if (metadata) {
            if (!metadata.title || metadata.title.trim().length === 0) {
              issues.push({
                type: 'warning',
                code: 'MISSING_TITLE',
                message: 'Falta el título del libro',
                suggestion: 'Agregar título en los metadatos'
              });
            }
            
            if (!metadata.author || metadata.author.trim().length === 0) {
              issues.push({
                type: 'warning',
                code: 'MISSING_AUTHOR',
                message: 'Falta el autor del libro',
                suggestion: 'Especificar el autor en los metadatos'
              });
            }
          }
          
          return issues;
        }
      }
    ];
  }

  private async validateFormatSpecific(file: File, result: EbookValidationResult): Promise<void> {
    const format = result.format;
    
    try {
      switch (format) {
        case 'epub':
          await this.validateEpub(file, result);
          break;
        case 'pdf':
          await this.validatePdf(file, result);
          break;
        case 'mobi':
        case 'azw':
        case 'azw3':
          await this.validateMobi(file, result);
          break;
        default:
          // Validación genérica
          break;
      }
    } catch (error) {
      result.warnings.push(`Error en validación específica de formato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async validateEpub(file: File, result: EbookValidationResult): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Verificar firma ZIP
    if (uint8Array[0] !== 0x50 || uint8Array[1] !== 0x4B) {
      result.errors.push('Archivo EPUB corrupto: firma ZIP inválida');
      result.isValid = false;
    }
  }

  private async validatePdf(file: File, result: EbookValidationResult): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Verificar firma PDF
    if (uint8Array[0] !== 0x25 || uint8Array[1] !== 0x50 || 
        uint8Array[2] !== 0x44 || uint8Array[3] !== 0x46) {
      result.errors.push('Archivo PDF corrupto: firma inválida');
      result.isValid = false;
    }
  }

  private async validateMobi(file: File, result: EbookValidationResult): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Verificar firma MOBI en offset 60
    if (uint8Array.length >= 64) {
      const mobiSignature = new TextDecoder().decode(uint8Array.slice(60, 64));
      if (mobiSignature !== 'MOBI' && mobiSignature !== 'TPZ3') {
        result.warnings.push('Posible archivo MOBI corrupto: firma no encontrada');
      }
    }
  }

  private async validateFileSignature(file: File, format: string): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer.slice(0, 100)); // Primeros 100 bytes
      
      switch (format) {
        case 'epub':
          return uint8Array[0] === 0x50 && uint8Array[1] === 0x4B; // PK
        case 'pdf':
          return uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && 
                 uint8Array[2] === 0x44 && uint8Array[3] === 0x46; // %PDF
        case 'mobi':
        case 'azw':
        case 'azw3':
          // MOBI puede tener diferentes firmas, validación más flexible
          return uint8Array.length >= 64;
        default:
          return true; // Para otros formatos, asumir válido
      }
    } catch {
      return false;
    }
  }

  private extractFormat(filename: string): string {
    const extension = filename.split('.').pop();
    return extension ? extension.toLowerCase() : '';
  }
}

