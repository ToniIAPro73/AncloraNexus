// Extractor de metadatos para libros electrónicos
// Siguiendo guía de estilos Anclora
import { EbookFormat, EbookMetadata } from '../types/ebook';
interface MetadataExtractionResult {
  success: boolean;
  metadata?: EbookMetadata;
  error?: string;
  warnings: string[];
}
interface FormatSpecificExtractor {
  format: EbookFormat;
  extractMetadata: (filePath: string, fileBuffer?: Buffer) => Promise<Partial<EbookMetadata>>;
  validateStructure: (filePath: string, fileBuffer?: Buffer) => Promise<boolean>;
}
class EbookMetadataExtractor {
  private extractors: Map<EbookFormat, FormatSpecificExtractor>;
  constructor() {
    this.extractors = new Map();
    this.initializeExtractors();
  }
  /**
   * Extrae metadatos de un archivo de e-book
   */
  async extractMetadata(filePath: string, format: EbookFormat, fileBuffer?: Buffer): Promise<MetadataExtractionResult> {
    const warnings: string[] = [];
    
    try {
      const extractor = this.extractors.get(format);
      if (!extractor) {
        return {
          success: false,
          error: `No hay extractor disponible para el formato ${format}`,
          warnings
        };
      }
      // Validar estructura del archivo
      const isValidStructure = await extractor.validateStructure(filePath, fileBuffer);
      if (!isValidStructure) {
        warnings.push(`La estructura del archivo ${format} puede no ser estándar`);
      }
      // Extraer metadatos específicos del formato
      const formatMetadata = await extractor.extractMetadata(filePath, fileBuffer);
      
      // Metadatos base
      const baseMetadata: EbookMetadata = {
        format,
        fileSize: fileBuffer?.length || 0
      };
      // Combinar metadatos
      const metadata: EbookMetadata = {
        ...baseMetadata,
        ...formatMetadata
      };
      // Validar y limpiar metadatos
      const validatedMetadata = this.validateAndCleanMetadata(metadata);
      const validationWarnings = this.getMetadataWarnings(validatedMetadata);
      warnings.push(...validationWarnings);
      return {
        success: true,
        metadata: validatedMetadata,
        warnings
      };
    } catch (error) {
      return {
        success: false,
        error: `Error extrayendo metadatos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        warnings
      };
    }
  }
  /**
   * Detecta el formato de un archivo basado en su contenido
   */
  async detectFormatFromContent(filePath: string, fileBuffer: Buffer): Promise<EbookFormat | null> {
    try {
      // Verificar signatures de archivos
      const signatures = this.getFileSignatures();
      
      for (const [format, signature] of signatures) {
        if (this.checkSignature(fileBuffer, signature)) {
          return format;
        }
      }
      // Verificaciones adicionales basadas en contenido
      return await this.detectFormatByContent(fileBuffer);
      
    } catch (error) {
      console.warn(`Error detectando formato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return null;
    }
  }
  /**
   * Obtiene información completa de un archivo de e-book
   */
  async getCompleteFileInfo(filePath: string, fileBuffer: Buffer): Promise<{
    detectedFormat: EbookFormat | null;
    metadata: EbookMetadata | null;
    isValid: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];
    // Detectar formato
    const detectedFormat = await this.detectFormatFromContent(filePath, fileBuffer);
    if (!detectedFormat) {
      errors.push('No se pudo detectar el formato del archivo');
      return { detectedFormat: null, metadata: null, isValid: false, warnings, errors };
    }
    // Extraer metadatos
    const metadataResult = await this.extractMetadata(filePath, detectedFormat, fileBuffer);
    if (!metadataResult.success) {
      errors.push(metadataResult.error || 'Error extrayendo metadatos');
    }
    warnings.push(...metadataResult.warnings);
    return {
      detectedFormat,
      metadata: metadataResult.metadata || null,
      isValid: metadataResult.success,
      warnings,
      errors
    };
  }
  /**
   * Inicializa los extractores específicos por formato
   */
  private initializeExtractors(): void {
    // Extractor para EPUB
    this.extractors.set(EbookFormat.EPUB, {
      format: EbookFormat.EPUB,
      extractMetadata: this.extractEpubMetadata.bind(this),
      validateStructure: this.validateEpubStructure.bind(this)
    });
    // Extractor para PDF
    this.extractors.set(EbookFormat.PDF, {
      format: EbookFormat.PDF,
      extractMetadata: this.extractPdfMetadata.bind(this),
      validateStructure: this.validatePdfStructure.bind(this)
    });
    // Extractor para MOBI
    this.extractors.set(EbookFormat.MOBI, {
      format: EbookFormat.MOBI,
      extractMetadata: this.extractMobiMetadata.bind(this),
      validateStructure: this.validateMobiStructure.bind(this)
    });
    // Extractor para AZW/AZW3
    this.extractors.set(EbookFormat.AZW, {
      format: EbookFormat.AZW,
      extractMetadata: this.extractAzwMetadata.bind(this),
      validateStructure: this.validateAzwStructure.bind(this)
    });
    this.extractors.set(EbookFormat.AZW3, {
      format: EbookFormat.AZW3,
      extractMetadata: this.extractAzwMetadata.bind(this),
      validateStructure: this.validateAzwStructure.bind(this)
    });
    // Extractores para formatos simples
    this.extractors.set(EbookFormat.TXT, {
      format: EbookFormat.TXT,
      extractMetadata: this.extractTextMetadata.bind(this),
      validateStructure: this.validateTextStructure.bind(this)
    });
    this.extractors.set(EbookFormat.HTML, {
      format: EbookFormat.HTML,
      extractMetadata: this.extractHtmlMetadata.bind(this),
      validateStructure: this.validateHtmlStructure.bind(this)
    });
    this.extractors.set(EbookFormat.RTF, {
      format: EbookFormat.RTF,
      extractMetadata: this.extractRtfMetadata.bind(this),
      validateStructure: this.validateRtfStructure.bind(this)
    });
  }
  /**
   * Extractores específicos por formato
   */
  private async extractEpubMetadata(filePath: string, fileBuffer?: Buffer): Promise<Partial<EbookMetadata>> {
    // En implementación real, usar librería como node-epub o yauzl para leer el ZIP
    // y parsear el archivo OPF para extraer metadatos
    
    return {
      title: 'Título extraído del EPUB',
      author: 'Autor extraído del EPUB',
      language: 'es',
      publisher: 'Editorial EPUB',
      description: 'Descripción extraída del EPUB'
    };
  }
  private async extractPdfMetadata(filePath: string, fileBuffer?: Buffer): Promise<Partial<EbookMetadata>> {
    // En implementación real, usar pdf-lib o pdf2pic para extraer metadatos PDF
    
    return {
      title: 'Título extraído del PDF',
      author: 'Autor extraído del PDF',
      pageCount: 100
    };
  }
  private async extractMobiMetadata(filePath: string, fileBuffer?: Buffer): Promise<Partial<EbookMetadata>> {
    // En implementación real, analizar el header MOBI binario
    
    return {
      title: 'Título extraído del MOBI',
      author: 'Autor extraído del MOBI'
    };
  }
  private async extractAzwMetadata(filePath: string, fileBuffer?: Buffer): Promise<Partial<EbookMetadata>> {
    // Formato similar a MOBI para metadatos
    
    return {
      title: 'Título extraído del AZW',
      author: 'Autor extraído del AZW'
    };
  }
  private async extractTextMetadata(filePath: string, fileBuffer?: Buffer): Promise<Partial<EbookMetadata>> {
    // Para archivos de texto, intentar extraer título de las primeras líneas
    
    if (fileBuffer) {
      const content = fileBuffer.toString('utf-8', 0, 500); // Primeros 500 caracteres
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length > 0) {
        return {
          title: lines[0].trim(),
          description: lines.length > 1 ? lines[1].trim() : undefined
        };
      }
    }
    return {};
  }
  private async extractHtmlMetadata(filePath: string, fileBuffer?: Buffer): Promise<Partial<EbookMetadata>> {
    // Extraer metadatos HTML de tags meta y title
    
    if (fileBuffer) {
      const content = fileBuffer.toString('utf-8');
      
      // Extraer título
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : undefined;
      
      // Extraer meta author
      const authorMatch = content.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
      const author = authorMatch ? authorMatch[1].trim() : undefined;
      
      // Extraer meta description
      const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = descMatch ? descMatch[1].trim() : undefined;
      
      return { title, author, description };
    }
    return {};
  }
  private async extractRtfMetadata(filePath: string, fileBuffer?: Buffer): Promise<Partial<EbookMetadata>> {
    // RTF metadata está en el header del documento
    
    if (fileBuffer) {
      const content = fileBuffer.toString('utf-8', 0, 2000); // Primeros 2000 caracteres
      
      // Buscar campos RTF de metadatos
      const titleMatch = content.match(/\\title\s+([^}\\]+)/);
      const authorMatch = content.match(/\\author\s+([^}\\]+)/);
      
      return {
        title: titleMatch ? titleMatch[1].trim() : undefined,
        author: authorMatch ? authorMatch[1].trim() : undefined
      };
    }
    return {};
  }
  /**
   * Validadores de estructura por formato
   */
  private async validateEpubStructure(filePath: string, fileBuffer?: Buffer): Promise<boolean> {
    // Validar que sea un ZIP válido con estructura EPUB
    if (!fileBuffer) return false;
    
    // Verificar signature ZIP
    const zipSignature = fileBuffer.subarray(0, 4);
    return zipSignature[0] === 0x50 && zipSignature[1] === 0x4B;
  }
  private async validatePdfStructure(filePath: string, fileBuffer?: Buffer): Promise<boolean> {
    // Validar header PDF
    if (!fileBuffer) return false;
    
    const pdfHeader = fileBuffer.toString('ascii', 0, 5);
    return pdfHeader === '%PDF-';
  }
  private async validateMobiStructure(filePath: string, fileBuffer?: Buffer): Promise<boolean> {
    // Validar header MOBI/PalmDOC
    if (!fileBuffer || fileBuffer.length < 78) return false;
    
    const mobiSignature = fileBuffer.toString('ascii', 60, 64);
    return mobiSignature === 'MOBI' || fileBuffer.toString('ascii', 0, 8) === 'BOOKMOBI';
  }
  private async validateAzwStructure(filePath: string, fileBuffer?: Buffer): Promise<boolean> {
    // AZW es similar a MOBI
    return this.validateMobiStructure(filePath, fileBuffer);
  }
  private async validateTextStructure(filePath: string, fileBuffer?: Buffer): Promise<boolean> {
    // Validar que sea texto UTF-8 válido
    if (!fileBuffer) return false;
    
    try {
      fileBuffer.toString('utf-8');
      return true;
    } catch {
      return false;
    }
  }
  private async validateHtmlStructure(filePath: string, fileBuffer?: Buffer): Promise<boolean> {
    // Validar estructura HTML básica
    if (!fileBuffer) return false;
    
    const content = fileBuffer.toString('utf-8', 0, 1000);
    return content.includes('<html') || content.includes('<!DOCTYPE html');
  }
  private async validateRtfStructure(filePath: string, fileBuffer?: Buffer): Promise<boolean> {
    // Validar header RTF
    if (!fileBuffer) return false;
    
    const rtfHeader = fileBuffer.toString('ascii', 0, 5);
    return rtfHeader === '{\\rtf';
  }
  /**
   * Utilidades auxiliares
   */
  private getFileSignatures(): Map<EbookFormat, Buffer> {
    return new Map([
      [EbookFormat.PDF, Buffer.from('%PDF-', 'ascii')],
      [EbookFormat.EPUB, Buffer.from([0x50, 0x4B, 0x03, 0x04])], // ZIP signature
      [EbookFormat.MOBI, Buffer.from('BOOKMOBI', 'ascii')]
    ]);
  }
  private checkSignature(fileBuffer: Buffer, signature: Buffer): boolean {
    if (fileBuffer.length < signature.length) return false;
    
    for (let i = 0; i < signature.length; i++) {
      if (fileBuffer[i] !== signature[i]) return false;
    }
    
    return true;
  }
  private async detectFormatByContent(fileBuffer: Buffer): Promise<EbookFormat | null> {
    const content = fileBuffer.toString('utf-8', 0, 1000).toLowerCase();
    
    // Detectar HTML
    if (content.includes('<html') || content.includes('<!doctype html')) {
      return EbookFormat.HTML;
    }
    
    // Detectar RTF
    if (content.startsWith('{\\rtf')) {
      return EbookFormat.RTF;
    }
    
    // Por defecto, asumir texto plano si es válido UTF-8
    try {
      fileBuffer.toString('utf-8');
      return EbookFormat.TXT;
    } catch {
      return null;
    }
  }
  private validateAndCleanMetadata(metadata: EbookMetadata): EbookMetadata {
    return {
      ...metadata,
      title: metadata.title?.trim() || undefined,
      author: metadata.author?.trim() || undefined,
      publisher: metadata.publisher?.trim() || undefined,
      description: metadata.description?.trim() || undefined,
      language: metadata.language?.toLowerCase() || undefined,
      genre: metadata.genre?.filter(g => g.trim()) || undefined
    };
  }
  private getMetadataWarnings(metadata: EbookMetadata): string[] {
    const warnings: string[] = [];
    
    if (!metadata.title) {
      warnings.push('No se encontró título en el archivo');
    }
    
    if (!metadata.author) {
      warnings.push('No se encontró información del autor');
    }
    
    if (!metadata.language) {
      warnings.push('No se detectó el idioma del contenido');
    }
    
    return warnings;
  }
}
export const ebookMetadataExtractor = new EbookMetadataExtractor();
export default ebookMetadataExtractor;