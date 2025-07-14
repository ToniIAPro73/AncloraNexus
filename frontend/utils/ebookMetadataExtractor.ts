import { EbookMetadata } from '../types/ebook';

// Interfaz para el resultado de extracción de metadatos
interface MetadataExtractionResult {
  success: boolean;
  metadata?: EbookMetadata;
  error?: string;
}

// Clase principal para extracción de metadatos
export class EbookMetadataExtractor {
  
  /**
   * Extrae metadatos de un archivo e-book
   * @param file - Archivo del e-book
   * @param format - Formato del archivo
   * @returns Promise con los metadatos extraídos
   */
  static async extractMetadata(file: File, format: string): Promise<MetadataExtractionResult> {
    try {
      const normalizedFormat = format.toLowerCase();
      
      switch (normalizedFormat) {
        case 'epub':
          return await this.extractEpubMetadata(file);
        case 'pdf':
          return await this.extractPdfMetadata(file);
        case 'mobi':
        case 'azw':
        case 'azw3':
          return await this.extractMobiMetadata(file);
        case 'txt':
          return await this.extractTextMetadata(file);
        case 'rtf':
          return await this.extractRtfMetadata(file);
        case 'doc':
        case 'docx':
          return await this.extractDocMetadata(file);
        case 'html':
          return await this.extractHtmlMetadata(file);
        default:
          return await this.extractBasicMetadata(file, format);
      }
    } catch (error) {
      return {
        success: false,
        error: `Error extrayendo metadatos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Extrae metadatos de archivos EPUB
   */
  private static async extractEpubMetadata(file: File): Promise<MetadataExtractionResult> {
    try {
      // Para EPUB necesitaríamos una librería como epub-parser
      // Por ahora simulamos la extracción
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Verificar firma EPUB (PK + mimetype)
      const isValidEpub = this.verifyEpubSignature(uint8Array);
      
      if (!isValidEpub) {
        return {
          success: false,
          error: 'Archivo EPUB inválido'
        };
      }

      // Simulación de extracción de metadatos EPUB
      // En implementación real se usaría JSZip para extraer y parsear el OPF
      const metadata: EbookMetadata = {
        format: 'epub',
        title: this.extractTitleFromFilename(file.name),
        fileSize: file.size,
        // Aquí se extraerían los metadatos reales del archivo OPF
      };

      return {
        success: true,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: `Error procesando EPUB: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Extrae metadatos de archivos PDF
   */
  private static async extractPdfMetadata(file: File): Promise<MetadataExtractionResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Verificar firma PDF
      const isValidPdf = this.verifyPdfSignature(uint8Array);
      
      if (!isValidPdf) {
        return {
          success: false,
          error: 'Archivo PDF inválido'
        };
      }

      // Buscar metadatos en el PDF
      const pdfText = new TextDecoder('latin1').decode(uint8Array);
      const metadata: EbookMetadata = {
        format: 'pdf',
        title: this.extractPdfTitle(pdfText) || this.extractTitleFromFilename(file.name),
        author: this.extractPdfAuthor(pdfText),
        fileSize: file.size,
        pageCount: this.estimatePdfPages(pdfText)
      };

      return {
        success: true,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: `Error procesando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Extrae metadatos de archivos MOBI/AZW
   */
  private static async extractMobiMetadata(file: File): Promise<MetadataExtractionResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Verificar firma MOBI
      const isValidMobi = this.verifyMobiSignature(uint8Array);
      
      if (!isValidMobi) {
        return {
          success: false,
          error: 'Archivo MOBI/AZW inválido'
        };
      }

      const metadata: EbookMetadata = {
        format: file.name.split('.').pop()?.toLowerCase() || 'mobi',
        title: this.extractTitleFromFilename(file.name),
        fileSize: file.size,
        // Aquí se extraerían los metadatos reales del header MOBI
      };

      return {
        success: true,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: `Error procesando MOBI: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Extrae metadatos de archivos de texto
   */
  private static async extractTextMetadata(file: File): Promise<MetadataExtractionResult> {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const wordCount = text.split(/\s+/).length;
      
      const metadata: EbookMetadata = {
        format: 'txt',
        title: this.extractTitleFromFilename(file.name),
        fileSize: file.size,
        description: `Archivo de texto con ${lines.length} líneas y ${wordCount} palabras`
      };

      return {
        success: true,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: `Error procesando texto: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Extrae metadatos de archivos RTF
   */
  private static async extractRtfMetadata(file: File): Promise<MetadataExtractionResult> {
    try {
      const text = await file.text();
      
      // Verificar que es un archivo RTF válido
      if (!text.startsWith('{\\rtf')) {
        return {
          success: false,
          error: 'Archivo RTF inválido'
        };
      }

      const metadata: EbookMetadata = {
        format: 'rtf',
        title: this.extractRtfTitle(text) || this.extractTitleFromFilename(file.name),
        author: this.extractRtfAuthor(text),
        fileSize: file.size
      };

      return {
        success: true,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: `Error procesando RTF: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Extrae metadatos de archivos DOC/DOCX
   */
  private static async extractDocMetadata(file: File): Promise<MetadataExtractionResult> {
    try {
      // Para archivos DOC/DOCX se necesitaría una librería especializada
      // Por ahora extraemos información básica
      const metadata: EbookMetadata = {
        format: file.name.split('.').pop()?.toLowerCase() || 'doc',
        title: this.extractTitleFromFilename(file.name),
        fileSize: file.size
      };

      return {
        success: true,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: `Error procesando documento: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Extrae metadatos de archivos HTML
   */
  private static async extractHtmlMetadata(file: File): Promise<MetadataExtractionResult> {
    try {
      const html = await file.text();
      
      const metadata: EbookMetadata = {
        format: 'html',
        title: this.extractHtmlTitle(html) || this.extractTitleFromFilename(file.name),
        author: this.extractHtmlAuthor(html),
        description: this.extractHtmlDescription(html),
        fileSize: file.size
      };

      return {
        success: true,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: `Error procesando HTML: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Extrae metadatos básicos para formatos no específicamente soportados
   */
  private static async extractBasicMetadata(file: File, format: string): Promise<MetadataExtractionResult> {
    const metadata: EbookMetadata = {
      format: format.toLowerCase(),
      title: this.extractTitleFromFilename(file.name),
      fileSize: file.size
    };

    return {
      success: true,
      metadata
    };
  }

  // Métodos auxiliares para verificación de firmas de archivo
  private static verifyEpubSignature(data: Uint8Array): boolean {
    // EPUB es un ZIP que debe contener "mimetype" como primer archivo
    return data[0] === 0x50 && data[1] === 0x4B; // PK signature
  }

  private static verifyPdfSignature(data: Uint8Array): boolean {
    // PDF signature: %PDF-
    return data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46;
  }

  private static verifyMobiSignature(data: Uint8Array): boolean {
    // MOBI signature en offset 60
    if (data.length < 68) return false;
    const mobiSignature = new TextDecoder().decode(data.slice(60, 64));
    return mobiSignature === 'MOBI' || mobiSignature === 'TPZ3';
  }

  // Métodos auxiliares para extracción de metadatos específicos
  private static extractTitleFromFilename(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  }

  private static extractPdfTitle(pdfText: string): string | undefined {
    const titleMatch = pdfText.match(/\/Title\s*\(([^)]+)\)/);
    return titleMatch ? titleMatch[1] : undefined;
  }

  private static extractPdfAuthor(pdfText: string): string | undefined {
    const authorMatch = pdfText.match(/\/Author\s*\(([^)]+)\)/);
    return authorMatch ? authorMatch[1] : undefined;
  }

  private static estimatePdfPages(pdfText: string): number {
    const pageMatches = pdfText.match(/\/Type\s*\/Page\b/g);
    return pageMatches ? pageMatches.length : 0;
  }

  private static extractRtfTitle(rtfText: string): string | undefined {
    const titleMatch = rtfText.match(/\\title\s+([^}]+)}/);
    return titleMatch ? titleMatch[1].trim() : undefined;
  }

  private static extractRtfAuthor(rtfText: string): string | undefined {
    const authorMatch = rtfText.match(/\\author\s+([^}]+)}/);
    return authorMatch ? authorMatch[1].trim() : undefined;
  }

  private static extractHtmlTitle(html: string): string | undefined {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : undefined;
  }

  private static extractHtmlAuthor(html: string): string | undefined {
    const authorMatch = html.match(/<meta[^>]+name=['"]author['"][^>]+content=['"]([^'"]+)['"]/i);
    return authorMatch ? authorMatch[1] : undefined;
  }

  private static extractHtmlDescription(html: string): string | undefined {
    const descMatch = html.match(/<meta[^>]+name=['"]description['"][^>]+content=['"]([^'"]+)['"]/i);
    return descMatch ? descMatch[1] : undefined;
  }
}

