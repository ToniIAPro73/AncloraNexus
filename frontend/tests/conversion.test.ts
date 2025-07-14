import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestFiles, cleanupTestFiles } from './utils/testFileGenerator';
import { ConversionEngine } from '../utils/conversionEngine';
import { EbookConversionEngine } from '../utils/ebookConversionEngine';
import { validateConversion } from './utils/conversionValidator';

describe('Conversion Tests - Real File Processing', () => {
  let testFiles: Record<string, string> = {};
  
  beforeAll(async () => {
    // Crear archivos de prueba para cada categoría
    testFiles = await createTestFiles();
  });

  afterAll(async () => {
    // Limpiar archivos de prueba
    await cleanupTestFiles(testFiles);
  });

  describe('Universal Converter - Image Conversions', () => {
    it('should convert JPG to PNG', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.jpg,
        outputFormat: 'png',
        category: 'image'
      });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBeDefined();
      
      const validation = await validateConversion(result.outputPath!, 'png');
      expect(validation.isValid).toBe(true);
      expect(validation.format).toBe('png');
    });

    it('should convert PNG to WEBP', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.png,
        outputFormat: 'webp',
        category: 'image'
      });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBeDefined();
      
      const validation = await validateConversion(result.outputPath!, 'webp');
      expect(validation.isValid).toBe(true);
      expect(validation.compressionRatio).toBeGreaterThan(0.1);
    });

    it('should handle large image files', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.largeImage,
        outputFormat: 'jpg',
        category: 'image',
        options: {
          quality: 85,
          maxWidth: 1920,
          maxHeight: 1080
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'jpg');
      expect(validation.dimensions.width).toBeLessThanOrEqual(1920);
      expect(validation.dimensions.height).toBeLessThanOrEqual(1080);
    });
  });

  describe('Universal Converter - Document Conversions', () => {
    it('should convert PDF to DOCX', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.pdf,
        outputFormat: 'docx',
        category: 'document'
      });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBeDefined();
      
      const validation = await validateConversion(result.outputPath!, 'docx');
      expect(validation.isValid).toBe(true);
      expect(validation.pageCount).toBeGreaterThan(0);
    });

    it('should convert DOCX to PDF with formatting preservation', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.docx,
        outputFormat: 'pdf',
        category: 'document',
        options: {
          preserveFormatting: true,
          embedFonts: true
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'pdf');
      expect(validation.isValid).toBe(true);
      expect(validation.hasEmbeddedFonts).toBe(true);
    });

    it('should handle password-protected documents', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.protectedPdf,
        outputFormat: 'txt',
        category: 'document',
        options: {
          password: 'testpassword123'
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'txt');
      expect(validation.textContent.length).toBeGreaterThan(0);
    });
  });

  describe('Universal Converter - Audio Conversions', () => {
    it('should convert MP3 to WAV', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.mp3,
        outputFormat: 'wav',
        category: 'audio'
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'wav');
      expect(validation.isValid).toBe(true);
      expect(validation.duration).toBeGreaterThan(0);
      expect(validation.sampleRate).toBe(44100);
    });

    it('should convert with quality settings', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.wav,
        outputFormat: 'mp3',
        category: 'audio',
        options: {
          bitrate: 320,
          quality: 'high'
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'mp3');
      expect(validation.bitrate).toBe(320);
      expect(validation.quality).toBe('high');
    });
  });

  describe('Universal Converter - Video Conversions', () => {
    it('should convert MP4 to AVI', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.mp4,
        outputFormat: 'avi',
        category: 'video'
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'avi');
      expect(validation.isValid).toBe(true);
      expect(validation.duration).toBeGreaterThan(0);
    });

    it('should handle resolution changes', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.mp4,
        outputFormat: 'mp4',
        category: 'video',
        options: {
          resolution: '720p',
          codec: 'h264'
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'mp4');
      expect(validation.resolution.height).toBe(720);
      expect(validation.codec).toBe('h264');
    });
  });

  describe('E-book Converter - Specialized Conversions', () => {
    it('should convert EPUB to MOBI with metadata preservation', async () => {
      const result = await EbookConversionEngine.convert({
        inputFile: testFiles.epub,
        outputFormat: 'mobi',
        options: {
          preserveMetadata: true,
          optimizeForKindle: true
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'mobi');
      expect(validation.isValid).toBe(true);
      expect(validation.metadata.title).toBeDefined();
      expect(validation.metadata.author).toBeDefined();
      expect(validation.kindleOptimized).toBe(true);
    });

    it('should convert PDF to EPUB with chapter detection', async () => {
      const result = await EbookConversionEngine.convert({
        inputFile: testFiles.ebookPdf,
        outputFormat: 'epub',
        options: {
          detectChapters: true,
          generateTOC: true,
          preserveImages: true
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'epub');
      expect(validation.hasTableOfContents).toBe(true);
      expect(validation.chapterCount).toBeGreaterThan(1);
      expect(validation.imageCount).toBeGreaterThan(0);
    });

    it('should handle complex formatting in DOCX to EPUB', async () => {
      const result = await EbookConversionEngine.convert({
        inputFile: testFiles.formattedDocx,
        outputFormat: 'epub',
        options: {
          preserveFormatting: true,
          convertFootnotes: true,
          embedFonts: false
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'epub');
      expect(validation.hasFormatting).toBe(true);
      expect(validation.footnoteCount).toBeGreaterThan(0);
    });
  });

  describe('Performance and Limits Tests', () => {
    it('should handle concurrent conversions', async () => {
      const conversions = [
        ConversionEngine.convert({
          inputFile: testFiles.jpg,
          outputFormat: 'png',
          category: 'image'
        }),
        ConversionEngine.convert({
          inputFile: testFiles.mp3,
          outputFormat: 'wav',
          category: 'audio'
        }),
        ConversionEngine.convert({
          inputFile: testFiles.pdf,
          outputFormat: 'txt',
          category: 'document'
        })
      ];

      const results = await Promise.all(conversions);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.processingTime).toBeLessThan(30000); // 30 segundos max
      });
    });

    it('should respect file size limits', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.largeFile, // > 100MB
        outputFormat: 'pdf',
        category: 'document'
      });

      // Para usuarios gratuitos debería fallar
      expect(result.success).toBe(false);
      expect(result.error).toContain('file size limit');
    });

    it('should track conversion metrics', async () => {
      const startTime = Date.now();
      
      const result = await ConversionEngine.convert({
        inputFile: testFiles.jpg,
        outputFormat: 'png',
        category: 'image'
      });

      expect(result.metrics).toBeDefined();
      expect(result.metrics.processingTime).toBeGreaterThan(0);
      expect(result.metrics.inputSize).toBeGreaterThan(0);
      expect(result.metrics.outputSize).toBeGreaterThan(0);
      expect(result.metrics.compressionRatio).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle corrupted files gracefully', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.corruptedImage,
        outputFormat: 'png',
        category: 'image'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('corrupted');
      expect(result.errorCode).toBe('INVALID_FILE');
    });

    it('should handle unsupported format combinations', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.mp3,
        outputFormat: 'docx', // Audio to document - invalid
        category: 'audio'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('unsupported conversion');
      expect(result.errorCode).toBe('UNSUPPORTED_CONVERSION');
    });

    it('should handle network timeouts', async () => {
      // Simular timeout en conversión larga
      const result = await ConversionEngine.convert({
        inputFile: testFiles.largeVideo,
        outputFormat: 'mp4',
        category: 'video',
        options: {
          timeout: 1000 // 1 segundo - muy poco para video grande
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
      expect(result.errorCode).toBe('CONVERSION_TIMEOUT');
    });
  });

  describe('Quality Assurance Tests', () => {
    it('should maintain image quality in lossless conversions', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.png,
        outputFormat: 'png',
        category: 'image',
        options: {
          quality: 100,
          lossless: true
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'png');
      expect(validation.qualityScore).toBeGreaterThan(0.95);
    });

    it('should preserve document structure in conversions', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.structuredPdf,
        outputFormat: 'docx',
        category: 'document',
        options: {
          preserveStructure: true,
          maintainLayout: true
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'docx');
      expect(validation.structurePreserved).toBe(true);
      expect(validation.layoutAccuracy).toBeGreaterThan(0.8);
    });

    it('should maintain audio fidelity in high-quality conversions', async () => {
      const result = await ConversionEngine.convert({
        inputFile: testFiles.highQualityAudio,
        outputFormat: 'flac',
        category: 'audio',
        options: {
          quality: 'lossless',
          preserveDynamicRange: true
        }
      });

      expect(result.success).toBe(true);
      
      const validation = await validateConversion(result.outputPath!, 'flac');
      expect(validation.isLossless).toBe(true);
      expect(validation.dynamicRange).toBeGreaterThan(60); // dB
    });
  });
});

// Tests específicos para límites de usuario
describe('User Limits and Authentication Tests', () => {
  describe('Free Tier Limits', () => {
    it('should enforce monthly conversion limits for free users', async () => {
      // Simular usuario gratuito con 9 conversiones ya realizadas
      const mockUser = {
        plan: 'free',
        monthlyConversions: 9,
        maxConversions: 10
      };

      // Primera conversión - debería funcionar
      let result = await ConversionEngine.convert({
        inputFile: testFiles.jpg,
        outputFormat: 'png',
        category: 'image',
        user: mockUser
      });

      expect(result.success).toBe(true);

      // Segunda conversión - debería fallar por límite
      result = await ConversionEngine.convert({
        inputFile: testFiles.jpg,
        outputFormat: 'webp',
        category: 'image',
        user: { ...mockUser, monthlyConversions: 10 }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('monthly limit');
      expect(result.upgradeRequired).toBe(true);
    });

    it('should enforce file size limits for free users', async () => {
      const mockUser = {
        plan: 'free',
        maxFileSize: 10 * 1024 * 1024 // 10MB
      };

      const result = await ConversionEngine.convert({
        inputFile: testFiles.largeFile, // 50MB
        outputFormat: 'pdf',
        category: 'document',
        user: mockUser
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('file size limit');
      expect(result.upgradeRequired).toBe(true);
    });
  });

  describe('Pro Tier Features', () => {
    it('should allow batch conversions for pro users', async () => {
      const mockUser = {
        plan: 'pro',
        features: ['batch_conversion', 'priority_processing']
      };

      const result = await ConversionEngine.batchConvert({
        files: [testFiles.jpg, testFiles.png, testFiles.gif],
        outputFormat: 'webp',
        category: 'image',
        user: mockUser
      });

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(3);
      expect(result.processingPriority).toBe('high');
    });

    it('should provide advanced options for pro users', async () => {
      const mockUser = {
        plan: 'pro',
        features: ['advanced_options', 'custom_quality']
      };

      const result = await ConversionEngine.convert({
        inputFile: testFiles.jpg,
        outputFormat: 'png',
        category: 'image',
        user: mockUser,
        options: {
          customDPI: 300,
          colorProfile: 'sRGB',
          compressionLevel: 9
        }
      });

      expect(result.success).toBe(true);
      expect(result.appliedOptions.customDPI).toBe(300);
    });
  });

  describe('Business Tier Features', () => {
    it('should provide API access for business users', async () => {
      const mockUser = {
        plan: 'business',
        features: ['api_access', 'webhook_notifications', 'priority_support']
      };

      const result = await ConversionEngine.convert({
        inputFile: testFiles.pdf,
        outputFormat: 'docx',
        category: 'document',
        user: mockUser,
        options: {
          webhookUrl: 'https://example.com/webhook',
          apiKey: 'test-api-key'
        }
      });

      expect(result.success).toBe(true);
      expect(result.webhookScheduled).toBe(true);
      expect(result.apiResponse).toBeDefined();
    });
  });
});

