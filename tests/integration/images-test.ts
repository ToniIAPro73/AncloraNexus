import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp'; // Para validación de imágenes
import {
  fileExists,
  validateFileStructure,
  measureConversionTime,
  createTempFile,
  cleanupTempFiles,
  getActualMimeType,
  createTestReport
} from '@test/utils/test-helpers';
import { AncloraMetaform } from '@/AncloraMetaform';

describe('Conversiones de Imágenes', () => {
  let converter: AncloraMetaform;
  let tempFiles: string[] = [];
  let testResults: any[] = [];

  beforeAll(async () => {
    converter = new AncloraMetaform({
      maxImageDimension: 10000,
      supportedColorSpaces: ['sRGB', 'CMYK', 'Grayscale'],
      enableGPUAcceleration: true,
      preserveMetadata: true
    });
    await converter.initialize();
  });

  afterAll(async () => {
    await cleanupTempFiles(tempFiles);
    console.log(createTestReport('Imágenes', testResults));
  });

  describe('Conversiones de formatos rasterizados', () => {
    describe('JPEG conversiones', () => {
      const jpegPath = path.join(__dirname, '../../fixtures/images/valid/test-image.jpg');

      it('debe convertir JPEG a PNG', async () => {
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const { result, duration } = await measureConversionTime(async () => {
          return await converter.convert({
            inputPath: jpegPath,
            outputPath,
            targetFormat: 'png',
            options: {
              quality: 95,
              compression: 6
            }
          });
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
        
        // Validar dimensiones preservadas
        const metadata = await sharp(outputPath).metadata();
        const originalMetadata = await sharp(jpegPath).metadata();
        expect(metadata.width).toBe(originalMetadata.width);
        expect(metadata.height).toBe(originalMetadata.height);

        testResults.push({
          conversion: 'JPEG → PNG',
          success: true,
          duration
        });
      });

      it('debe convertir JPEG a WebP', async () => {
        const outputPath = await createTempFile('webp');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: jpegPath,
          outputPath,
          targetFormat: 'webp',
          options: {
            quality: 85,
            lossless: false,
            nearLossless: true
          }
        });

        expect(result.success).toBe(true);
        
        // Verificar que WebP es más pequeño
        const [originalSize, webpSize] = await Promise.all([
          fs.stat(jpegPath).then(s => s.size),
          fs.stat(outputPath).then(s => s.size)
        ]);
        expect(webpSize).toBeLessThan(originalSize);
      });

      it('debe convertir JPEG a TIFF', async () => {
        const outputPath = await createTempFile('tiff');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: jpegPath,
          outputPath,
          targetFormat: 'tiff',
          options: {
            compression: 'lzw',
            predictor: 'horizontal'
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir JPEG a BMP', async () => {
        const outputPath = await createTempFile('bmp');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: jpegPath,
          outputPath,
          targetFormat: 'bmp'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir JPEG a GIF', async () => {
        const outputPath = await createTempFile('gif');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: jpegPath,
          outputPath,
          targetFormat: 'gif',
          options: {
            colors: 256,
            dither: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir JPEG a PDF', async () => {
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: jpegPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            pageSize: 'A4',
            fitToPage: true,
            margin: 20
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir JPEG a ICO', async () => {
        const outputPath = await createTempFile('ico');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: jpegPath,
          outputPath,
          targetFormat: 'ico',
          options: {
            sizes: [16, 32, 48, 256]
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('PNG conversiones', () => {
      const pngPath = path.join(__dirname, '../../fixtures/images/valid/test-image.png');

      it('debe convertir PNG a JPEG', async () => {
        const outputPath = await createTempFile('jpg');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pngPath,
          outputPath,
          targetFormat: 'jpg',
          options: {
            quality: 90,
            progressive: true,
            mozjpeg: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe manejar transparencia PNG a JPEG', async () => {
        const pngWithAlpha = path.join(__dirname, '../../fixtures/images/valid/test-image-alpha.png');
        const outputPath = await createTempFile('jpg');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pngWithAlpha,
          outputPath,
          targetFormat: 'jpg',
          options: {
            backgroundColor: '#FFFFFF'
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.alphaRemoved).toBe(true);
      });

      it('debe preservar transparencia PNG a WebP', async () => {
        const pngWithAlpha = path.join(__dirname, '../../fixtures/images/valid/test-image-alpha.png');
        const outputPath = await createTempFile('webp');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: pngWithAlpha,
          outputPath,
          targetFormat: 'webp',
          options: {
            alphaQuality: 100
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await sharp(outputPath).metadata();
        expect(metadata.hasAlpha).toBe(true);
      });
    });

    describe('WebP conversiones', () => {
      const webpPath = path.join(__dirname, '../../fixtures/images/valid/test-image.webp');

      it('debe convertir WebP a PNG', async () => {
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: webpPath,
          outputPath,
          targetFormat: 'png'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir WebP a JPEG', async () => {
        const outputPath = await createTempFile('jpg');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: webpPath,
          outputPath,
          targetFormat: 'jpg'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir WebP animado a GIF', async () => {
        const animatedWebP = path.join(__dirname, '../../fixtures/images/valid/test-animated.webp');
        const outputPath = await createTempFile('gif');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: animatedWebP,
          outputPath,
          targetFormat: 'gif',
          options: {
            loop: 0,
            delay: 100
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.framesExtracted).toBeGreaterThan(1);
      });
    });

    describe('TIFF conversiones', () => {
      const tiffPath = path.join(__dirname, '../../fixtures/images/valid/test-image.tiff');

      it('debe convertir TIFF multipágina a PDF', async () => {
        const multiPageTiff = path.join(__dirname, '../../fixtures/images/valid/test-multipage.tiff');
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: multiPageTiff,
          outputPath,
          targetFormat: 'pdf',
          options: {
            mergePages: true
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.pagesProcessed).toBeGreaterThan(1);
      });

      it('debe extraer páginas de TIFF a PNG', async () => {
        const multiPageTiff = path.join(__dirname, '../../fixtures/images/valid/test-multipage.tiff');
        const outputDir = path.join(process.cwd(), 'temp', 'tiff-pages');
        await fs.mkdir(outputDir, { recursive: true });

        const result = await converter.convert({
          inputPath: multiPageTiff,
          outputPath: outputDir,
          targetFormat: 'png',
          options: {
            extractPages: true,
            pagePrefix: 'page_'
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.filesCreated).toBeGreaterThan(1);
        
        // Limpiar archivos creados
        const files = await fs.readdir(outputDir);
        for (const file of files) {
          tempFiles.push(path.join(outputDir, file));
        }
      });
    });

    describe('GIF conversiones', () => {
      const gifPath = path.join(__dirname, '../../fixtures/images/valid/test-image.gif');

      it('debe convertir GIF animado a video MP4', async () => {
        const animatedGif = path.join(__dirname, '../../fixtures/images/valid/test-animated.gif');
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: animatedGif,
          outputPath,
          targetFormat: 'mp4',
          options: {
            fps: 10,
            codec: 'h264',
            preset: 'slow'
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe extraer frames de GIF animado', async () => {
        const animatedGif = path.join(__dirname, '../../fixtures/images/valid/test-animated.gif');
        const outputDir = path.join(process.cwd(), 'temp', 'gif-frames');
        await fs.mkdir(outputDir, { recursive: true });

        const result = await converter.convert({
          inputPath: animatedGif,
          outputPath: outputDir,
          targetFormat: 'png',
          options: {
            extractFrames: true,
            framePrefix: 'frame_'
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.framesExtracted).toBeGreaterThan(1);
      });

      it('debe convertir GIF a WebP animado', async () => {
        const animatedGif = path.join(__dirname, '../../fixtures/images/valid/test-animated.gif');
        const outputPath = await createTempFile('webp');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: animatedGif,
          outputPath,
          targetFormat: 'webp',
          options: {
            animated: true,
            quality: 85,
            method: 6
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('BMP conversiones', () => {
      const bmpPath = path.join(__dirname, '../../fixtures/images/valid/test-image.bmp');

      it('debe convertir BMP a PNG', async () => {
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: bmpPath,
          outputPath,
          targetFormat: 'png'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir BMP a JPEG con compresión', async () => {
        const outputPath = await createTempFile('jpg');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: bmpPath,
          outputPath,
          targetFormat: 'jpg',
          options: {
            quality: 75
          }
        });

        expect(result.success).toBe(true);
        
        // Verificar reducción de tamaño
        const [bmpSize, jpegSize] = await Promise.all([
          fs.stat(bmpPath).then(s => s.size),
          fs.stat(outputPath).then(s => s.size)
        ]);
        expect(jpegSize).toBeLessThan(bmpSize * 0.5);
      });
    });
  });

  describe('Conversiones de formatos vectoriales', () => {
    describe('SVG conversiones', () => {
      const svgPath = path.join(__dirname, '../../fixtures/images/valid/test-image.svg');

      it('debe convertir SVG a PNG', async () => {
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: svgPath,
          outputPath,
          targetFormat: 'png',
          options: {
            width: 1920,
            height: 1080,
            density: 300
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await sharp(outputPath).metadata();
        expect(metadata.width).toBe(1920);
        expect(metadata.height).toBe(1080);
      });

      it('debe convertir SVG a PDF vectorial', async () => {
        const outputPath = await createTempFile('pdf');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: svgPath,
          outputPath,
          targetFormat: 'pdf',
          options: {
            preserveVector: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir SVG a múltiples tamaños PNG', async () => {
        const sizes = [16, 32, 64, 128, 256, 512];
        const outputPaths = [];

        for (const size of sizes) {
          const outputPath = await createTempFile(`png`);
          tempFiles.push(outputPath);
          outputPaths.push(outputPath);

          const result = await converter.convert({
            inputPath: svgPath,
            outputPath,
            targetFormat: 'png',
            options: {
              width: size,
              height: size,
              fit: 'contain',
              background: 'transparent'
            }
          });

          expect(result.success).toBe(true);
          
          const metadata = await sharp(outputPath).metadata();
          expect(Math.max(metadata.width!, metadata.height!)).toBe(size);
        }
      });
    });
  });

  describe('Conversiones con procesamiento de imagen', () => {
    const testImagePath = path.join(__dirname, '../../fixtures/images/valid/test-image.jpg');

    it('debe redimensionar durante conversión', async () => {
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          resize: {
            width: 800,
            height: 600,
            fit: 'cover',
            position: 'center'
          }
        }
      });

      expect(result.success).toBe(true);
      
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(600);
    });

    it('debe aplicar marca de agua durante conversión', async () => {
      const watermarkPath = path.join(__dirname, '../../fixtures/images/valid/watermark.png');
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          watermark: {
            path: watermarkPath,
            position: 'bottom-right',
            opacity: 0.7,
            scale: 0.3
          }
        }
      });

      expect(result.success).toBe(true);
    });

    it('debe aplicar filtros durante conversión', async () => {
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          filters: {
            grayscale: true,
            blur: 2,
            sharpen: 1.5,
            brightness: 1.1,
            contrast: 1.2
          }
        }
      });

      expect(result.success).toBe(true);
      
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.space).toBe('b-w'); // Escala de grises
    });

    it('debe rotar y voltear durante conversión', async () => {
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          rotate: 90,
          flip: true,
          flop: false
        }
      });

      expect(result.success).toBe(true);
      
      const originalMeta = await sharp(testImagePath).metadata();
      const rotatedMeta = await sharp(outputPath).metadata();
      // Después de rotar 90°, ancho y alto se intercambian
      expect(rotatedMeta.width).toBe(originalMeta.height);
      expect(rotatedMeta.height).toBe(originalMeta.width);
    });

    it('debe recortar durante conversión', async () => {
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          crop: {
            left: 100,
            top: 100,
            width: 400,
            height: 300
          }
        }
      });

      expect(result.success).toBe(true);
      
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.width).toBe(400);
      expect(metadata.height).toBe(300);
    });
  });

  describe('Conversiones de espacios de color', () => {
    it('debe convertir CMYK a RGB', async () => {
      const cmykPath = path.join(__dirname, '../../fixtures/images/valid/test-image-cmyk.jpg');
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: cmykPath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          colorSpace: 'srgb',
          iccProfile: 'default'
        }
      });

      expect(result.success).toBe(true);
      
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.space).toBe('srgb');
    });

    it('debe convertir RGB a escala de grises', async () => {
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          colorSpace: 'grayscale'
        }
      });

      expect(result.success).toBe(true);
      
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.channels).toBe(1);
    });

    it('debe aplicar perfil ICC personalizado', async () => {
      const iccPath = path.join(__dirname, '../../fixtures/images/valid/custom-profile.icc');
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          iccProfile: iccPath
        }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Manejo de metadatos', () => {
    it('debe preservar metadatos EXIF', async () => {
      const imageWithExif = path.join(__dirname, '../../fixtures/images/valid/test-image-metadata.jpg');
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: imageWithExif,
        outputPath,
        targetFormat: 'jpg',
        options: {
          preserveMetadata: true
        }
      });

      expect(result.success).toBe(true);
      
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.exif).toBeDefined();
    });

    it('debe eliminar metadatos sensibles', async () => {
      const imageWithExif = path.join(__dirname, '../../fixtures/images/valid/test-image-metadata.jpg');
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: imageWithExif,
        outputPath,
        targetFormat: 'jpg',
        options: {
          stripMetadata: true,
          keepCopyright: false
        }
      });

      expect(result.success).toBe(true);
      
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.exif).toBeUndefined();
    });

    it('debe actualizar metadatos durante conversión', async () => {
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          metadata: {
            copyright: '© 2024 Anclora Metaform',
            author: 'Test Suite',
            description: 'Imagen convertida para pruebas',
            keywords: ['test', 'conversion', 'anclora']
          }
        }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Conversiones de formatos especiales', () => {
    it('debe convertir RAW (CR2) a JPEG', async () => {
      const rawPath = path.join(__dirname, '../../fixtures/images/valid/test-image.cr2');
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: rawPath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          rawOptions: {
            whiteBalance: 'auto',
            exposure: 0,
            highlights: -50,
            shadows: 50,
            vibrance: 20
          }
        }
      });

      expect(result.success).toBe(true);
    });

    it('debe convertir PSD a PNG con capas aplanadas', async () => {
      const psdPath = path.join(__dirname, '../../fixtures/images/valid/test-image-layers.psd');
      const outputPath = await createTempFile('png');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: psdPath,
        outputPath,
        targetFormat: 'png',
        options: {
          flattenLayers: true,
          preserveTransparency: true
        }
      });

      expect(result.success).toBe(true);
    });

    it('debe convertir HEIC a JPEG', async () => {
      const heicPath = path.join(__dirname, '../../fixtures/images/valid/test-image.heic');
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: heicPath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          quality: 90
        }
      });

      expect(result.success).toBe(true);
    });

    it('debe crear ICO con múltiples resoluciones', async () => {
      const outputPath = await createTempFile('ico');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: testImagePath,
        outputPath,
        targetFormat: 'ico',
        options: {
          sizes: [16, 32, 48, 64, 128, 256],
          compression: 'png'
        }
      });

      expect(result.success).toBe(true);
      expect(result.metadata?.sizesCreated).toHaveLength(6);
    });
  });

  describe('Conversiones por lotes de imágenes', () => {
    it('debe procesar múltiples imágenes a miniatura', async () => {
      const inputDir = path.join(__dirname, '../../fixtures/images/valid/batch');
      const outputDir = path.join(process.cwd(), 'temp', 'thumbnails');
      await fs.mkdir(outputDir, { recursive: true });

      const result = await converter.batchConvert({
        inputDirectory: inputDir,
        outputDirectory: outputDir,
        targetFormat: 'jpg',
        options: {
          resize: {
            width: 150,
            height: 150,
            fit: 'cover'
          },
          quality: 80,
          prefix: 'thumb_'
        }
      });

      expect(result.successful).toBeGreaterThan(0);
      expect(result.failed).toBe(0);

      // Limpiar archivos creados
      const files = await fs.readdir(outputDir);
      for (const file of files) {
        tempFiles.push(path.join(outputDir, file));
      }
    });

    it('debe optimizar imágenes para web', async () => {
      const inputImages = [
        path.join(__dirname, '../../fixtures/images/valid/product-1.jpg'),
        path.join(__dirname, '../../fixtures/images/valid/product-2.png'),
        path.join(__dirname, '../../fixtures/images/valid/product-3.jpg')
      ];

      const results = await converter.webOptimizeBatch({
        inputs: inputImages,
        formats: ['webp', 'jpg'],
        sizes: [
          { width: 320, suffix: '-mobile' },
          { width: 768, suffix: '-tablet' },
          { width: 1920, suffix: '-desktop' }
        ],
        quality: {
          webp: 85,
          jpg: 80
        }
      });

      expect(results.totalGenerated).toBe(18); // 3 imágenes × 2 formatos × 3 tamaños
      
      // Agregar archivos a limpieza
      results.files.forEach(file => tempFiles.push(file.path));
    });
  });

  describe('Manejo de archivos corrompidos', () => {
    describe('Imágenes subsanables', () => {
      it('debe reparar JPEG truncado', async () => {
        const corruptedPath = path.join(__dirname, '../../fixtures/images/corrupted-fixable/truncated.jpg');
        const outputPath = await createTempFile('jpg');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: corruptedPath,
          outputPath,
          targetFormat: 'jpg',
          options: {
            repairMode: true,
            fillMissingData: true
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.repaired).toBe(true);
        expect(result.metadata?.dataRecovered).toBeGreaterThan(90);
      });

      it('debe corregir PNG con CRC inválido', async () => {
        const corruptedPath = path.join(__dirname, '../../fixtures/images/corrupted-fixable/bad-crc.png');
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: corruptedPath,
          outputPath,
          targetFormat: 'png',
          options: {
            ignoreCRCErrors: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe manejar perfil de color corrupto', async () => {
        const corruptedPath = path.join(__dirname, '../../fixtures/images/corrupted-fixable/bad-profile.jpg');
        const outputPath = await createTempFile('jpg');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: corruptedPath,
          outputPath,
          targetFormat: 'jpg',
          options: {
            stripCorruptProfile: true,
            assignProfile: 'sRGB'
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('Imágenes insubsanables', () => {
      it('debe fallar con archivo completamente corrupto', async () => {
        const corruptedPath = path.join(__dirname, '../../fixtures/images/corrupted-unfixable/severe-corruption.jpg');
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: corruptedPath,
          outputPath,
          targetFormat: 'png'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('no se puede leer');
      });

      it('debe fallar con imagen encriptada', async () => {
        const encryptedPath = path.join(__dirname, '../../fixtures/images/corrupted-unfixable/encrypted.jpg');
        const outputPath = await createTempFile('png');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: encryptedPath,
          outputPath,
          targetFormat: 'png'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('encriptado');
      });
    });
  });

  describe('Validaciones y límites', () => {
    it('debe rechazar imágenes que excedan dimensiones máximas', async () => {
      const oversizedPath = path.join(__dirname, '../../fixtures/images/valid/oversized.jpg');
      const outputPath = await createTempFile('png');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: oversizedPath,
        outputPath,
        targetFormat: 'png'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('dimensiones máximas');
    });

    it('debe manejar conversión con límite de memoria', async () => {
      const largePath = path.join(__dirname, '../../fixtures/images/valid/large-image.tiff');
      const outputPath = await createTempFile('jpg');
      tempFiles.push(outputPath);

      const converterWithLimit = new AncloraMetaform({
        maxMemoryUsage: 100 * 1024 * 1024 // 100MB
      });

      const result = await converterWithLimit.convert({
        inputPath: largePath,
        outputPath,
        targetFormat: 'jpg',
        options: {
          tileProcessing: true,
          tileSize: 512
        }
      });

      expect(result.success).toBe(true);
      expect(result.metadata?.tiledProcessing).toBe(true);
    });

    it('debe validar formatos de salida soportados', async () => {
      const outputPath = await createTempFile('xyz');
      tempFiles.push(outputPath);

      await expect(
        converter.convert({
          inputPath: testImagePath,
          outputPath,
          targetFormat: 'xyz' // Formato no soportado
        })
      ).rejects.toThrow('formato no soportado');
    });
  });
});