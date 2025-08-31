import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  metadata?: {
    originalFormat: string;
    targetFormat: string;
    processingTime: number;
    fileSize: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  format: string;
  errors: string[];
  warnings: string[];
  metadata: Record<string, any>;
}

/**
 * Valida que un archivo existe y tiene contenido
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size > 0;
  } catch {
    return false;
  }
}

/**
 * Calcula el hash MD5 de un archivo para comparaciones
 */
export async function getFileHash(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Obtiene el tipo MIME real de un archivo
 */
export async function getActualMimeType(filePath: string): Promise<string | undefined> {
  const buffer = await fs.readFile(filePath);
  const fileType = await fileTypeFromBuffer(buffer);
  return fileType?.mime;
}

/**
 * Valida la estructura bÃ¡sica de diferentes tipos de archivo
 */
export async function validateFileStructure(filePath: string, expectedFormat: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: false,
    format: expectedFormat,
    errors: [],
    warnings: [],
    metadata: {}
  };

  try {
    const exists = await fileExists(filePath);
    if (!exists) {
      result.errors.push('El archivo no existe o estÃ¡ vacÃ­o');
      return result;
    }

    const stats = await fs.stat(filePath);
    result.metadata.fileSize = stats.size;

    // ValidaciÃ³n especÃ­fica por formato
    switch (expectedFormat.toLowerCase()) {
      case 'pdf':
        result.isValid = await validatePDF(filePath, result);
        break;
      case 'docx':
      case 'xlsx':
      case 'pptx':
        result.isValid = await validateOfficeXML(filePath, result);
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'tiff':
        result.isValid = await validateImage(filePath, result);
        break;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'mkv':
        result.isValid = await validateVideo(filePath, result);
        break;
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
      case 'ogg':
        result.isValid = await validateAudio(filePath, result);
        break;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        result.isValid = await validateArchive(filePath, result);
        break;
      default:
        result.warnings.push(`Formato ${expectedFormat} no tiene validaciÃ³n especÃ­fica`);
        result.isValid = true;
    }
  } catch (error) {
    result.errors.push(`Error durante validaciÃ³n: ${error}`);
  }

  return result;
}

async function validatePDF(filePath: string, result: ValidationResult): Promise<boolean> {
  const buffer = await fs.readFile(filePath, { encoding: 'binary' });
  
  // Verificar cabecera PDF
  if (!buffer.startsWith('%PDF-')) {
    result.errors.push('No tiene cabecera PDF vÃ¡lida');
    return false;
  }
  
  // Verificar final de archivo
  if (!buffer.includes('%%EOF')) {
    result.warnings.push('No tiene marcador EOF estÃ¡ndar');
  }
  
  result.metadata.version = buffer.substring(5, 8);
  return true;
}

async function validateOfficeXML(filePath: string, result: ValidationResult): Promise<boolean> {
  const buffer = await fs.readFile(filePath);
  
  // Los archivos Office modernos son ZIP con estructura XML
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
    result.errors.push('No es un archivo ZIP vÃ¡lido (Office XML)');
    return false;
  }
  
  return true;
}

async function validateImage(filePath: string, result: ValidationResult): Promise<boolean> {
  const mimeType = await getActualMimeType(filePath);
  
  if (!mimeType || !mimeType.startsWith('image/')) {
    result.errors.push('No es una imagen vÃ¡lida');
    return false;
  }
  
  result.metadata.mimeType = mimeType;
  return true;
}

async function validateVideo(filePath: string, result: ValidationResult): Promise<boolean> {
  const mimeType = await getActualMimeType(filePath);
  
  if (!mimeType || !mimeType.startsWith('video/')) {
    result.errors.push('No es un video vÃ¡lido');
    return false;
  }
  
  result.metadata.mimeType = mimeType;
  return true;
}

async function validateAudio(filePath: string, result: ValidationResult): Promise<boolean> {
  const mimeType = await getActualMimeType(filePath);
  
  if (!mimeType || !mimeType.startsWith('audio/')) {
    result.errors.push('No es un archivo de audio vÃ¡lido');
    return false;
  }
  
  result.metadata.mimeType = mimeType;
  return true;
}

async function validateArchive(filePath: string, result: ValidationResult): Promise<boolean> {
  const buffer = await fs.readFile(filePath);
  const signatures = {
    zip: [0x50, 0x4B, 0x03, 0x04],
    rar: [0x52, 0x61, 0x72, 0x21],
    '7z': [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C],
    gz: [0x1F, 0x8B]
  };
  
  for (const [format, signature] of Object.entries(signatures)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      result.metadata.archiveFormat = format;
      return true;
    }
  }
  
  result.errors.push('No se reconoce como archivo comprimido vÃ¡lido');
  return false;
}

/**
 * Genera un archivo temporal con nombre Ãºnico
 */
export async function createTempFile(extension: string): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp', 'test');
  await fs.mkdir(tempDir, { recursive: true });
  
  const fileName = `test_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
  return path.join(tempDir, fileName);
}

/**
 * Limpia archivos temporales despuÃ©s de las pruebas
 */
export async function cleanupTempFiles(files: string[]): Promise<void> {
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch {
      // Ignorar errores de limpieza
    }
  }
}

/**
 * Mide el tiempo de ejecuciÃ³n de una conversiÃ³n
 */
export async function measureConversionTime<T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await operation();
  const duration = performance.now() - start;
  
  return { result, duration };
}

/**
 * Verifica que un archivo convertido mantiene el contenido esperado
 */
export async function verifyContentIntegrity(
  originalPath: string,
  convertedPath: string,
  conversionType: string
): Promise<boolean> {
  // Esta funciÃ³n necesitarÃ­a implementaciÃ³n especÃ­fica segÃºn el tipo de conversiÃ³n
  // Por ahora retorna true si ambos archivos existen y tienen contenido
  const [originalExists, convertedExists] = await Promise.all([
    fileExists(originalPath),
    fileExists(convertedPath)
  ]);
  
  return originalExists && convertedExists;
}

/**
 * Crea un reporte de prueba detallado
 */
export function createTestReport(
  testName: string,
  results: Array<{
    conversion: string;
    success: boolean;
    duration?: number;
    error?: string;
  }>
): string {
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const successRate = (successfulTests / totalTests * 100).toFixed(2);
  
  let report = `\n=== Reporte de Prueba: ${testName} ===\n`;
  report += `Total de pruebas: ${totalTests}\n`;
  report += `Exitosas: ${successfulTests}\n`;
  report += `Fallidas: ${failedTests}\n`;
  report += `Tasa de Ã©xito: ${successRate}%\n\n`;
  
  report += 'Detalles:\n';
  results.forEach((result, index) => {
    const status = result.success ? 'âœ“' : 'âœ—';
    const duration = result.duration ? ` (${result.duration.toFixed(2)}ms)` : '';
    const error = result.error ? ` - Error: ${result.error}` : '';
    report += `  ${status} ${result.conversion}${duration}${error}\n`;
  });
  
  return report;
}
