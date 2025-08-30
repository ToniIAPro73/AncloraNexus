import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import {
  fileExists,
  validateFileStructure,
  measureConversionTime,
  createTempFile,
  cleanupTempFiles,
  createTestReport
} from '@test/utils/test-helpers';
import { AncloraNexus } from '@/AncloraNexus';

// Helper function to create temporary test paths
const createTempPath = (...segments: string[]) => {
  return path.join(process.cwd(), 'temp', ...segments);
};

// Helper function to create temporary test file path with extension
const createTempFilePath = (extension: string) => {
  const filename = `test-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  return createTempPath(filename);
};

export { createTempPath, createTempFilePath };

describe('Conversiones de Documentos', () => {
  let converter: AncloraNexus;
  let tempFiles: string[] = [];
  let testResults: any[] = [];

  beforeAll(async () => {
    converter = new AncloraNexus({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      timeout: 60000,
      enableLogging: true
    });
    await converter.initialize();
  });

  afterAll(async () => {
    await cleanupTempFiles(tempFiles);
    console.log(createTestReport('Documentos', testResults));
  });

  beforeEach(() => {
    tempFiles = [];
  });

  describe('Conversiones PDF', () => {
    describe('PDF como origen', () => {
      const pdfPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');

      it('debe convertir PDF a Word (DOCX)', async () => {
        const outputPath = await createTempFile('docx');
        tempFiles.push(outputPath);

        const { result, duration } = await measureConversionTime(async () => {
          return await converter.convert({
            inputPath: pdfPath,
            outputPath,
            targetFormat: 'docx'
          });
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
        
        const validation = await validateFileStructure(outputPath, 'docx');
        expect(validation.isValid).toBe(true);

        testResults.push({
          conversion: 'PDF â†’ DOCX',
          success: true,
          duration
        });
      });

      it('debe convertir PDF a Excel (XLSX)', async () => {
        const outputPath = await createTempFile('xlsx');
        tempFiles.push(outputPath);

        const { result, duration } = await measureConversionTime(async () => {
          return await converter.convert({
            inputPath: pdfPath,
            outputPath,
            targetFormat: 'xlsx',
            options: {
              detectTables: true,
              preserveFormatting: false
            }
          });
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);

        testResults.push({
          conversion: 'PDF â†’ XLSX',
          success: result.success,
          duration
        });
      });

      it('debe convertir PDF a PowerPoint (PPTX)', async () => {
        const outputPath = await createTempFile('pptx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pdfPath,
          outputPath,
          targetFormat: 'pptx',
          options: {
            slidesPerPage: 1
          }
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
      });

      it('debe convertir PDF a HTML', async () => {
        const outputPath = await createTempFile('html');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pdfPath,
          outputPath,
          targetFormat: 'html',
          options: {
            includeImages: true,
            generateCSS: true
          }
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
        
        const content = await fs.readFile(outputPath, 'utf-8');
        expect(content).toContain('<!DOCTYPE html>');
      });

      it('debe convertir PDF a TXT', async () => {
        const outputPath = await createTempFile('txt');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pdfPath,
          outputPath,
          targetFormat: 'txt'
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
      });

      it('debe convertir PDF a RTF', async () => {
        const outputPath = await createTempFile('rtf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pdfPath,
          outputPath,
          targetFormat: 'rtf'
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
      });

      it('debe convertir PDF a imagen (PNG)', async () => {
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pdfPath,
          outputPath,
          targetFormat: 'png',
          options: {
            page: 1,
            dpi: 300
          }
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
      });

      it('debe convertir PDF a XML', async () => {
        const outputPath = await createTempFile('xml');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pdfPath,
          outputPath,
          targetFormat: 'xml',
          options: {
            structuredOutput: true
          }
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
      });
    });

    describe('PDF como destino', () => {
      it('debe convertir Word (DOCX) a PDF', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.docx');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            embedFonts: true,
            compression: 'high'
          }
        });

        expect(result.success).toBe(true);
        const validation = await validateFileStructure(outputPath, 'pdf');
        expect(validation.isValid).toBe(true);
      });

      it('debe convertir Excel (XLSX) a PDF', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-spreadsheet.xlsx');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            fitToPage: true,
            orientation: 'landscape'
          }
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
      });

      it('debe convertir PowerPoint (PPTX) a PDF', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-presentation.pptx');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            includeNotes: false,
            slidesPerPage: 1
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir HTML a PDF', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.html');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            printBackground: true,
            margin: { top: 20, bottom: 20, left: 20, right: 20 }
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir TXT a PDF', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.txt');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            fontSize: 12,
            fontFamily: 'Arial'
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir RTF a PDF', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.rtf');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir Markdown a PDF', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.md');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            syntaxHighlighting: true,
            tableOfContents: true
          }
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Conversiones Word (DOCX)', () => {
    describe('DOCX a otros formatos', () => {
      const docxPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.docx');

      it('debe convertir DOCX a HTML', async () => {
        const outputPath = await createTempFile('html');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: docxPath,
          outputPath,
          targetFormat: 'html',
          options: {
            extractImages: true,
            preserveStyles: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir DOCX a TXT', async () => {
        const outputPath = await createTempFile('txt');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: docxPath,
          outputPath,
          targetFormat: 'txt'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir DOCX a RTF', async () => {
        const outputPath = await createTempFile('rtf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: docxPath,
          outputPath,
          targetFormat: 'rtf'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir DOCX a ODT', async () => {
        const outputPath = await createTempFile('odt');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: docxPath,
          outputPath,
          targetFormat: 'odt'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir DOCX a Markdown', async () => {
        const outputPath = await createTempFile('md');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: docxPath,
          outputPath,
          targetFormat: 'md',
          options: {
            preserveTables: true,
            imageHandling: 'reference'
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('Otros formatos a DOCX', () => {
      it('debe convertir HTML a DOCX', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.html');
        const outputPath = await createTempFile('docx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'docx'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir TXT a DOCX', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.txt');
        const outputPath = await createTempFile('docx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'docx',
          options: {
            applyDefaultStyles: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir RTF a DOCX', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.rtf');
        const outputPath = await createTempFile('docx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'docx'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir ODT a DOCX', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.odt');
        const outputPath = await createTempFile('docx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'docx'
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Conversiones Excel (XLSX)', () => {
    describe('XLSX a otros formatos', () => {
      const xlsxPath = path.join(__dirname, '../../fixtures/documents/valid/test-spreadsheet.xlsx');

      it('debe convertir XLSX a CSV', async () => {
        const outputPath = await createTempFile('csv');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: xlsxPath,
          outputPath,
          targetFormat: 'csv',
          options: {
            delimiter: ',',
            encoding: 'utf-8',
            sheet: 0
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir XLSX a HTML', async () => {
        const outputPath = await createTempFile('html');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: xlsxPath,
          outputPath,
          targetFormat: 'html',
          options: {
            includeStyles: true,
            responsiveTable: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir XLSX a XML', async () => {
        const outputPath = await createTempFile('xml');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: xlsxPath,
          outputPath,
          targetFormat: 'xml'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir XLSX a ODS', async () => {
        const outputPath = await createTempFile('ods');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: xlsxPath,
          outputPath,
          targetFormat: 'ods'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir XLSX a TSV', async () => {
        const outputPath = await createTempFile('tsv');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: xlsxPath,
          outputPath,
          targetFormat: 'tsv',
          options: {
            sheet: 'all'
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('Otros formatos a XLSX', () => {
      it('debe convertir CSV a XLSX', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.csv');
        const outputPath = await createTempFile('xlsx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'xlsx',
          options: {
            headerRow: true,
            autoDetectTypes: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir HTML (tabla) a XLSX', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-table.html');
        const outputPath = await createTempFile('xlsx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'xlsx',
          options: {
            extractTables: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir XML a XLSX', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-data.xml');
        const outputPath = await createTempFile('xlsx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'xlsx'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir TSV a XLSX', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.tsv');
        const outputPath = await createTempFile('xlsx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'xlsx'
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Conversiones PowerPoint (PPTX)', () => {
    describe('PPTX a otros formatos', () => {
      const pptxPath = path.join(__dirname, '../../fixtures/documents/valid/test-presentation.pptx');

      it('debe convertir PPTX a HTML', async () => {
        const outputPath = await createTempFile('html');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pptxPath,
          outputPath,
          targetFormat: 'html',
          options: {
            slideNavigation: true,
            preserveAnimations: false
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir PPTX a imÃ¡genes (PNG)', async () => {
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pptxPath,
          outputPath,
          targetFormat: 'png',
          options: {
            slideIndex: 1,
            resolution: 1920
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir PPTX a ODP', async () => {
        const outputPath = await createTempFile('odp');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pptxPath,
          outputPath,
          targetFormat: 'odp'
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Conversiones de formatos especiales', () => {
    it('debe convertir Markdown a HTML', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.md');
      const outputPath = await createTempFile('html');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath,
        outputPath,
        targetFormat: 'html',
        options: {
          githubFlavored: true,
          syntaxHighlighting: true
        }
      });

      expect(result.success).toBe(true);
    });

    it('debe convertir XML a JSON', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.xml');
      const outputPath = await createTempFile('json');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath,
        outputPath,
        targetFormat: 'json',
        options: {
          preserveAttributes: true,
          prettyPrint: true
        }
      });

      expect(result.success).toBe(true);
    });

    it('debe convertir JSON a XML', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-data.json');
      const outputPath = await createTempFile('xml');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath,
        outputPath,
        targetFormat: 'xml',
        options: {
          rootElement: 'data',
          indent: true
        }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Manejo de archivos corrompidos', () => {
    describe('Archivos subsanables', () => {
      it('debe recuperar PDF con EOF faltante', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/corrupted-fixable/missing-eof.pdf');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            repairMode: true
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.repaired).toBe(true);
      });

      it('debe manejar HTML mal formado', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/corrupted-fixable/malformed.html');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            strictParsing: false
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe corregir problemas de codificaciÃ³n', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/corrupted-fixable/encoding-issue.txt');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            autoDetectEncoding: true
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('Archivos insubsanables', () => {
      it('debe fallar con archivo binario corrupto', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/corrupted-unfixable/binary-corrupt.pdf');
        const outputPath = await createTempFile('docx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'docx'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('corrupto');
      });

      it('debe fallar con archivo encriptado sin clave', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/corrupted-unfixable/encrypted.pdf');
        const outputPath = await createTempFile('docx');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'docx'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('encriptado');
      });

      it('debe fallar con archivo severamente truncado', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/documents/corrupted-unfixable/truncated.docx');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'pdf'
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe('Conversiones por lotes (batch)', () => {
    it('debe convertir mÃºltiples documentos PDF a DOCX', async () => {
      const inputFiles = [
        path.join(__dirname, '../../fixtures/documents/valid/test-document-1.pdf'),
        path.join(__dirname, '../../fixtures/documents/valid/test-document-2.pdf'),
        path.join(__dirname, '../../fixtures/documents/valid/test-document-3.pdf')
      ];

      const results = await converter.batchConvert({
          inputs: inputFiles,
          targetFormat: 'docx',
          outputDirectory: path.join(process.cwd(), 'temp', 'batch-output'),
          options: {
              preserveNames: false,
              compressionLevel: 0
          }
      });

      expect(results.successful).toBe(3);
      expect(results.failed).toBe(0);
      expect(results.files).toHaveLength(3);

      // Agregar archivos a limpieza
      tempFiles.push(...results.files.map((f: { outputPath: string }) => f.outputPath));
    });

    it('debe manejar conversiones mixtas en lote', async () => {
      const conversions = [
        { input: 'test.pdf', output: 'test.docx', format: 'docx' },
        { input: 'test.docx', output: 'test.html', format: 'html' },
        { input: 'test.xlsx', output: 'test.csv', format: 'csv' }
      ];

      const results = await converter.batchConvert(conversions);
      
      expect(results.total).toBe(3);
      expect(results.successful).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validaciones de lÃ­mites', () => {
    it('debe rechazar archivos que excedan el tamaÃ±o mÃ¡ximo', async () => {
      const largeFilePath = path.join(__dirname, '../../fixtures/documents/valid/large-file.pdf');
      const outputPath = await createTempFile('docx');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: largeFilePath,
        outputPath,
        targetFormat: 'docx'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('tamaÃ±o mÃ¡ximo');
    });

    it('debe manejar timeouts en conversiones lentas', async () => {
      const complexFilePath = path.join(__dirname, '../../fixtures/documents/valid/complex-document.pdf');
      const outputPath = await createTempFile('docx');
      tempFiles.push(outputPath);

      const converterWithShortTimeout = new AncloraNexus({
        timeout: 100 // 100ms timeout muy corto
      });

      const result = await converterWithShortTimeout.convert({
        inputPath: complexFilePath,
        outputPath,
        targetFormat: 'docx'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });
});
