import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import {
  fileExists,
  validateFileStructure,
  measureConversionTime,
  createTempFile,
  cleanupTempFiles,
  verifyContentIntegrity
} from '@test/utils/test-helpers';
import { AncloraMetaform } from '@/AncloraMetaform';

describe('Conversiones Secuenciales Complejas', () => {
  let converter: AncloraMetaform;
  let tempFiles: string[] = [];

  beforeAll(async () => {
    converter = new AncloraMetaform({
      enableSequentialConversion: true,
      preserveIntermediateFiles: true,
      maxSequenceLength: 5
    });
    await converter.initialize();
  });

  afterAll(async () => {
    await cleanupTempFiles(tempFiles);
  });

  describe('Secuencias de 2 pasos', () => {
    it('debe realizar conversión PDF → Word → HTML', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');
      const intermediateDocx = await createTempFile('docx');
      const finalHtml = await createTempFile('html');
      tempFiles.push(intermediateDocx, finalHtml);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { format: 'docx', outputPath: intermediateDocx },
          { format: 'html', outputPath: finalHtml }
        ]
      });

      expect(sequence.success).toBe(true);
      expect(sequence.completedSteps).toBe(2);
      expect(await fileExists(finalHtml)).toBe(true);
      
      // Verificar que el contenido HTML sea válido
      const htmlContent = await fs.readFile(finalHtml, 'utf-8');
      expect(htmlContent).toContain('<!DOCTYPE html>');
    });

    it('debe realizar conversión Excel → CSV → JSON', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-spreadsheet.xlsx');
      const intermediateCsv = await createTempFile('csv');
      const finalJson = await createTempFile('json');
      tempFiles.push(intermediateCsv, finalJson);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { format: 'csv', outputPath: intermediateCsv },
          { format: 'json', outputPath: finalJson }
        ]
      });

      expect(sequence.success).toBe(true);
      expect(sequence.completedSteps).toBe(2);
      
      // Verificar estructura JSON
      const jsonContent = await fs.readFile(finalJson, 'utf-8');
      const data = JSON.parse(jsonContent);
      expect(Array.isArray(data) || typeof data === 'object').toBe(true);
    });

    it('debe realizar conversión Word → RTF → PDF', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.docx');
      const intermediateRtf = await createTempFile('rtf');
      const finalPdf = await createTempFile('pdf');
      tempFiles.push(intermediateRtf, finalPdf);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { format: 'rtf', outputPath: intermediateRtf },
          { format: 'pdf', outputPath: finalPdf }
        ]
      });

      expect(sequence.success).toBe(true);
      const pdfValidation = await validateFileStructure(finalPdf, 'pdf');
      expect(pdfValidation.isValid).toBe(true);
    });

    it('debe realizar conversión HTML → Markdown → PDF', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.html');
      const intermediateMd = await createTempFile('md');
      const finalPdf = await createTempFile('pdf');
      tempFiles.push(intermediateMd, finalPdf);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { 
            format: 'md', 
            outputPath: intermediateMd,
            options: { preserveLinks: true }
          },
          { 
            format: 'pdf', 
            outputPath: finalPdf,
            options: { renderMarkdown: true }
          }
        ]
      });

      expect(sequence.success).toBe(true);
      expect(await fileExists(finalPdf)).toBe(true);
    });
  });

  describe('Secuencias de 3 pasos', () => {
    it('debe realizar conversión PDF → Image → OCR → Word', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');
      const imagePath = await createTempFile('png');
      const ocrPath = await createTempFile('txt');
      const finalDocx = await createTempFile('docx');
      tempFiles.push(imagePath, ocrPath, finalDocx);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { 
            format: 'png', 
            outputPath: imagePath,
            options: { dpi: 300, page: 1 }
          },
          { 
            format: 'txt', 
            outputPath: ocrPath,
            options: { useOCR: true, language: 'spa' }
          },
          { 
            format: 'docx', 
            outputPath: finalDocx
          }
        ]
      });

      expect(sequence.success).toBe(true);
      expect(sequence.completedSteps).toBe(3);
    });

    it('debe realizar conversión Excel → XML → Transform → HTML', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-spreadsheet.xlsx');
      const xmlPath = await createTempFile('xml');
      const transformedXml = await createTempFile('xml');
      const finalHtml = await createTempFile('html');
      tempFiles.push(xmlPath, transformedXml, finalHtml);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { format: 'xml', outputPath: xmlPath },
          { 
            format: 'xml', 
            outputPath: transformedXml,
            options: { 
              transform: 'normalize',
              removeEmptyNodes: true 
            }
          },
          { 
            format: 'html', 
            outputPath: finalHtml,
            options: { generateTable: true }
          }
        ]
      });

      expect(sequence.success).toBe(true);
      
      const htmlContent = await fs.readFile(finalHtml, 'utf-8');
      expect(htmlContent).toContain('<table');
    });

    it('debe realizar conversión PowerPoint → PDF → Images → Video', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-presentation.pptx');
      const pdfPath = await createTempFile('pdf');
      const imagesDir = path.join(process.cwd(), 'temp', 'images');
      const videoPath = await createTempFile('mp4');
      tempFiles.push(pdfPath, videoPath);

      await fs.mkdir(imagesDir, { recursive: true });

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { format: 'pdf', outputPath: pdfPath },
          { 
            format: 'png', 
            outputPath: imagesDir,
            options: { 
              multiPage: true,
              prefix: 'slide_'
            }
          },
          { 
            format: 'mp4', 
            outputPath: videoPath,
            options: { 
              fps: 1,
              duration: 5 // 5 segundos por slide
            }
          }
        ]
      });

      expect(sequence.success).toBe(true);
      expect(sequence.completedSteps).toBe(3);
    });
  });

  describe('Secuencias de 4+ pasos', () => {
    it('debe realizar conversión compleja de migración documental', async () => {
      // Simula migración de sistema legacy
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/legacy-format.doc');
      const step1 = await createTempFile('docx');
      const step2 = await createTempFile('xml');
      const step3 = await createTempFile('json');
      const step4 = await createTempFile('pdf');
      tempFiles.push(step1, step2, step3, step4);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { 
            format: 'docx', 
            outputPath: step1,
            options: { modernize: true }
          },
          { 
            format: 'xml', 
            outputPath: step2,
            options: { extractMetadata: true }
          },
          { 
            format: 'json', 
            outputPath: step3,
            options: { 
              includeMetadata: true,
              structuredOutput: true 
            }
          },
          { 
            format: 'pdf', 
            outputPath: step4,
            options: { 
              pdfA: true,
              embedMetadata: true 
            }
          }
        ]
      });

      expect(sequence.success).toBe(true);
      expect(sequence.completedSteps).toBe(4);
      
      // Verificar PDF/A compliance
      const pdfValidation = await validateFileStructure(step4, 'pdf');
      expect(pdfValidation.metadata.version).toContain('PDF/A');
    });

    it('debe realizar procesamiento de datos complejos', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/data-source.csv');
      const steps = [];
      
      // CSV → Excel → Pivote → Gráfico → PDF → Compresión
      const excelPath = await createTempFile('xlsx');
      const pivotPath = await createTempFile('xlsx');
      const chartPath = await createTempFile('png');
      const reportPath = await createTempFile('pdf');
      const compressedPath = await createTempFile('zip');
      
      tempFiles.push(excelPath, pivotPath, chartPath, reportPath, compressedPath);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { 
            format: 'xlsx', 
            outputPath: excelPath,
            options: { createTable: true }
          },
          { 
            format: 'xlsx', 
            outputPath: pivotPath,
            options: { 
              createPivot: true,
              pivotConfig: {
                rows: ['category'],
                values: ['amount']
              }
            }
          },
          { 
            format: 'png', 
            outputPath: chartPath,
            options: { 
              chartType: 'bar',
              includeData: true 
            }
          },
          { 
            format: 'pdf', 
            outputPath: reportPath,
            options: { 
              template: 'report',
              includeChart: true 
            }
          },
          { 
            format: 'zip', 
            outputPath: compressedPath,
            options: { 
              includeSource: true,
              compression: 'high' 
            }
          }
        ]
      });

      expect(sequence.success).toBe(true);
      expect(sequence.completedSteps).toBe(5);
    });
  });

  describe('Manejo de errores en secuencias', () => {
    it('debe manejar fallo en paso intermedio', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');
      const step1 = await createTempFile('xyz'); // Formato inválido
      const step2 = await createTempFile('docx');
      tempFiles.push(step1, step2);

      const sequence = await converter.sequentialConvert({
        inputPath,
        sequence: [
          { format: 'xyz', outputPath: step1 }, // Esto fallará
          { format: 'docx', outputPath: step2 }
        ]
      });

      expect(sequence.success).toBe(false);
      expect(sequence.completedSteps).toBe(0);
      expect(sequence.failedAtStep).toBe(0);
      expect(sequence.error).toContain('formato no soportado');
    });

    it('debe continuar con errores si se configura', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');
      const outputs = [];
      
      for (let i = 0; i < 4; i++) {
        const ext = i === 2 ? 'invalid' : 'txt';
        const output = await createTempFile(ext);
        outputs.push(output);
        tempFiles.push(output);
      }

      const sequence = await converter.sequentialConvert({
        inputPath,
        continueOnError: true,
        sequence: [
          { format: 'txt', outputPath: outputs[0] },
          { format: 'html', outputPath: outputs[1] },
          { format: 'invalid', outputPath: outputs[2] }, // Fallará
          { format: 'pdf', outputPath: outputs[3] }
        ]
      });

      expect(sequence.completedSteps).toBe(3);
      expect(sequence.errors).toHaveLength(1);
      expect(sequence.errors[0].step).toBe(2);
    });

    it('debe validar longitud máxima de secuencia', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');
      const tooManySteps = [];
      
      // Intentar crear secuencia de 10 pasos (máximo es 5)
      for (let i = 0; i < 10; i++) {
        tooManySteps.push({
          format: 'txt',
          outputPath: await createTempFile('txt')
        });
      }

      await expect(
        converter.sequentialConvert({
          inputPath,
          sequence: tooManySteps
        })
      ).rejects.toThrow('excede el máximo permitido');
    });
  });

  describe('Optimización de secuencias', () => {
    it('debe detectar y optimizar rutas de conversión', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');
      const finalPath = await createTempFile('html');
      tempFiles.push(finalPath);

      // La aplicación debería optimizar PDF → DOCX → HTML a PDF → HTML directamente
      const result = await converter.optimizeAndConvert({
        inputPath,
        targetFormat: 'html',
        outputPath: finalPath,
        suggestedSequence: ['docx', 'html']
      });

      expect(result.optimized).toBe(true);
      expect(result.stepsUsed).toBe(1); // Conversión directa
      expect(result.stepsProposed).toBe(2);
    });

    it('debe usar caché para conversiones repetidas', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');
      const output1 = await createTempFile('docx');
      const output2 = await createTempFile('docx');
      tempFiles.push(output1, output2);

      // Primera conversión
      const time1 = await measureConversionTime(async () => {
        return await converter.convert({
          inputPath,
          outputPath: output1,
          targetFormat: 'docx'
        });
      });

      // Segunda conversión (debería usar caché)
      const time2 = await measureConversionTime(async () => {
        return await converter.convert({
          inputPath,
          outputPath: output2,
          targetFormat: 'docx',
          useCache: true
        });
      });

      expect(time2.duration).toBeLessThan(time1.duration * 0.5);
    });
  });

  describe('Conversiones paralelas en secuencias', () => {
    it('debe procesar ramas paralelas cuando sea posible', async () => {
      const inputPath = path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf');
      
      // PDF → [DOCX, PNG, TXT] → ZIP
      const docxPath = await createTempFile('docx');
      const pngPath = await createTempFile('png');
      const txtPath = await createTempFile('txt');
      const zipPath = await createTempFile('zip');
      
      tempFiles.push(docxPath, pngPath, txtPath, zipPath);

      const result = await converter.parallelSequenceConvert({
        inputPath,
        branches: [
          { format: 'docx', outputPath: docxPath },
          { format: 'png', outputPath: pngPath },
          { format: 'txt', outputPath: txtPath }
        ],
        finalStep: {
          format: 'zip',
          outputPath: zipPath,
          options: {
            includeAll: true
          }
        }
      });

      expect(result.success).toBe(true);
      expect(result.branchesCompleted).toBe(3);
      expect(await fileExists(zipPath)).toBe(true);
    });
  });

  describe('Casos de uso empresariales complejos', () => {
    it('debe ejecutar flujo de digitalización de facturas', async () => {
      const scanPath = path.join(__dirname, '../../fixtures/documents/valid/invoice-scan.jpg');
      
      // Imagen → OCR → PDF → Extracción → Excel → ERP (simulado)
      const ocrText = await createTempFile('txt');
      const pdfPath = await createTempFile('pdf');
      const dataPath = await createTempFile('json');
      const excelPath = await createTempFile('xlsx');
      const erpPath = await createTempFile('xml');
      
      tempFiles.push(ocrText, pdfPath, dataPath, excelPath, erpPath);

      const sequence = await converter.sequentialConvert({
        inputPath: scanPath,
        sequence: [
          { 
            format: 'txt', 
            outputPath: ocrText,
            options: { 
              useOCR: true,
              language: 'spa',
              enhanceImage: true
            }
          },
          { 
            format: 'pdf', 
            outputPath: pdfPath,
            options: { searchable: true }
          },
          { 
            format: 'json', 
            outputPath: dataPath,
            options: { 
              extractInvoiceData: true,
              fields: ['numero', 'fecha', 'total', 'items']
            }
          },
          { 
            format: 'xlsx', 
            outputPath: excelPath,
            options: { 
              template: 'invoice',
              autoFormat: true
            }
          },
          { 
            format: 'xml', 
            outputPath: erpPath,
            options: { 
              schema: 'SAP',
              validate: true
            }
          }
        ]
      });

      expect(sequence.success).toBe(true);
      expect(sequence.completedSteps).toBe(5);
      
      // Verificar que se extrajo data estructurada
      const invoiceData = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
      expect(invoiceData).toHaveProperty('numero');
      expect(invoiceData).toHaveProperty('total');
    });

    it('debe ejecutar flujo de publicación multicanal', async () => {
      const sourcePath = path.join(__dirname, '../../fixtures/documents/valid/marketing-content.docx');
      
      // DOCX → [Web, Print, Mobile] → Optimizado
      const webHtml = await createTempFile('html');
      const printPdf = await createTempFile('pdf');
      const mobileJson = await createTempFile('json');
      const webOptimized = await createTempFile('html');
      const printOptimized = await createTempFile('pdf');
      const mobileOptimized = await createTempFile('json');
      
      tempFiles.push(webHtml, printPdf, mobileJson, webOptimized, printOptimized, mobileOptimized);

      const result = await converter.multiChannelPublish({
        inputPath: sourcePath,
        channels: {
          web: {
            format: 'html',
            outputPath: webHtml,
            optimization: {
              outputPath: webOptimized,
              options: {
                minify: true,
                inlineCSS: true,
                optimizeImages: true
              }
            }
          },
          print: {
            format: 'pdf',
            outputPath: printPdf,
            optimization: {
              outputPath: printOptimized,
              options: {
                cmyk: true,
                highResolution: true,
                bleeds: 3
              }
            }
          },
          mobile: {
            format: 'json',
            outputPath: mobileJson,
            optimization: {
              outputPath: mobileOptimized,
              options: {
                compress: true,
                stripMetadata: true,
                mobileOptimized: true
              }
            }
          }
        }
      });

      expect(result.success).toBe(true);
      expect(result.channelsProcessed).toBe(3);
      expect(result.optimizationsApplied).toBe(3);
    });
  });
});