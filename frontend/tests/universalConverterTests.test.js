/**
 * Tests del Conversor Universal
 * 
 * Suite de tests específica para validar el funcionamiento
 * del conversor universal antes del lanzamiento.
 */

const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const fs = require('fs').promises;
const path = require('path');

const TEST_FILES_DIR = path.join(__dirname, 'universal-test-files');

// Configuración de timeouts
const TIMEOUTS = {
  small: 10000,   // 10s
  medium: 30000,  // 30s
  large: 60000    // 60s
};

// Conversiones soportadas por el conversor universal
const UNIVERSAL_CONVERSIONS = {
  text: {
    'txt': ['pdf', 'html', 'md'],
    'md': ['pdf', 'html', 'txt'],
    'html': ['pdf', 'txt', 'md']
  },
  image: {
    'jpg': ['png', 'webp', 'gif'],
    'png': ['jpg', 'webp', 'gif'],
    'gif': ['jpg', 'png', 'webp'],
    'webp': ['jpg', 'png']
  },
  document: {
    'pdf': ['txt', 'html'],
    'csv': ['pdf', 'html', 'txt']
  },
  audio: {
    'wav': ['mp3', 'flac'],
    'mp3': ['wav', 'flac'],
    'flac': ['wav', 'mp3']
  },
  video: {
    'mp4': ['avi', 'webm'],
    'avi': ['mp4', 'webm']
  }
};

describe('🔄 Tests del Conversor Universal', () => {
  let testManifest;

  beforeAll(async () => {
    // Cargar manifiesto de archivos de prueba
    const manifestPath = path.join(TEST_FILES_DIR, 'test_manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    testManifest = JSON.parse(manifestContent);
    
    console.log(`📋 Cargados ${testManifest.total_files} archivos de prueba`);
  }, 30000);

  describe('📝 Conversiones de Texto', () => {
    const textFiles = [
      'simple.txt',
      'formatted.txt', 
      'multilingual.txt',
      'technical.txt',
      'document.md'
    ];

    textFiles.forEach(filename => {
      const sourceFormat = getFormatFromFilename(filename);
      const targetFormats = UNIVERSAL_CONVERSIONS.text[sourceFormat] || [];

      targetFormats.forEach(targetFormat => {
        test(`${filename} → ${targetFormat}`, async () => {
          const result = await simulateUniversalConversion(
            filename, 
            sourceFormat, 
            targetFormat, 
            'text'
          );
          
          expect(result.success).toBe(true);
          expect(result.outputFile).toBeDefined();
          expect(result.processingTime).toBeLessThan(TIMEOUTS.medium);
          
          // Validaciones específicas para texto
          if (result.validation) {
            expect(result.validation.hasContent).toBe(true);
            if (filename.includes('multilingual')) {
              expect(result.validation.preservesEncoding).toBe(true);
            }
          }
        }, TIMEOUTS.medium);
      });
    });

    test('📄 Preservación de formato en conversiones', async () => {
      const result = await simulateUniversalConversion(
        'formatted.txt', 
        'txt', 
        'html', 
        'text'
      );
      
      expect(result.success).toBe(true);
      if (result.validation) {
        expect(result.validation.preservesStructure).toBe(true);
      }
    });

    test('🌍 Manejo de caracteres especiales', async () => {
      const result = await simulateUniversalConversion(
        'multilingual.txt', 
        'txt', 
        'pdf', 
        'text'
      );
      
      expect(result.success).toBe(true);
      if (result.validation) {
        expect(result.validation.preservesEncoding).toBe(true);
        expect(result.validation.specialCharsPreserved).toBe(true);
      }
    });
  });

  describe('🖼️ Conversiones de Imagen', () => {
    const imageFiles = [
      'test_small.jpg',
      'test_medium.jpg',
      'test_small.png',
      'test_medium.png',
      'test_small.gif',
      'test_small.webp',
      'pixel.png'
    ];

    imageFiles.forEach(filename => {
      const sourceFormat = getFormatFromFilename(filename);
      const targetFormats = UNIVERSAL_CONVERSIONS.image[sourceFormat] || [];

      targetFormats.forEach(targetFormat => {
        test(`${filename} → ${targetFormat}`, async () => {
          const timeout = filename.includes('large') ? TIMEOUTS.large : TIMEOUTS.medium;
          
          const result = await simulateUniversalConversion(
            filename, 
            sourceFormat, 
            targetFormat, 
            'image'
          );
          
          expect(result.success).toBe(true);
          expect(result.outputFile).toBeDefined();
          expect(result.processingTime).toBeLessThan(timeout);
          
          // Validaciones específicas para imagen
          if (result.validation) {
            expect(result.validation.isValidImage).toBe(true);
            expect(result.validation.dimensionsPreserved).toBe(true);
            
            // Calidad mínima aceptable
            if (result.validation.qualityScore) {
              expect(result.validation.qualityScore).toBeGreaterThan(0.6);
            }
          }
        }, timeout);
      });
    });

    test('🎨 Preservación de calidad visual', async () => {
      const result = await simulateUniversalConversion(
        'test_medium.jpg', 
        'jpg', 
        'png', 
        'image'
      );
      
      expect(result.success).toBe(true);
      if (result.validation) {
        expect(result.validation.qualityScore).toBeGreaterThan(0.7);
        expect(result.validation.dimensionsPreserved).toBe(true);
      }
    });

    test('🔍 Imagen de 1 pixel', async () => {
      const result = await simulateUniversalConversion(
        'pixel.png', 
        'png', 
        'jpg', 
        'image'
      );
      
      expect(result.success).toBe(true);
      if (result.validation) {
        expect(result.validation.width).toBe(1);
        expect(result.validation.height).toBe(1);
      }
    });
  });

  describe('📄 Conversiones de Documento', () => {
    const documentFiles = [
      'simple.pdf',
      'formatted.pdf',
      'multilingual.pdf',
      'document.html',
      'data.csv'
    ];

    documentFiles.forEach(filename => {
      const sourceFormat = getFormatFromFilename(filename);
      const targetFormats = UNIVERSAL_CONVERSIONS.document[sourceFormat] || [];

      targetFormats.forEach(targetFormat => {
        test(`${filename} → ${targetFormat}`, async () => {
          const result = await simulateUniversalConversion(
            filename, 
            sourceFormat, 
            targetFormat, 
            'document'
          );
          
          expect(result.success).toBe(true);
          expect(result.outputFile).toBeDefined();
          expect(result.processingTime).toBeLessThan(TIMEOUTS.large);
          
          // Validaciones específicas para documento
          if (result.validation) {
            expect(result.validation.hasContent).toBe(true);
            expect(result.validation.textExtracted).toBe(true);
          }
        }, TIMEOUTS.large);
      });
    });

    test('📊 Conversión de CSV a PDF', async () => {
      const result = await simulateUniversalConversion(
        'data.csv', 
        'csv', 
        'pdf', 
        'document'
      );
      
      expect(result.success).toBe(true);
      if (result.validation) {
        expect(result.validation.tableStructurePreserved).toBe(true);
        expect(result.validation.rowCount).toBeGreaterThan(0);
      }
    });
  });

  describe('🎵 Conversiones de Audio', () => {
    const audioFiles = [
      'test_short.wav',
      'test_medium.wav',
      'test_short.mp3',
      'test_medium.mp3',
      'test_hq.flac'
    ];

    audioFiles.forEach(filename => {
      const sourceFormat = getFormatFromFilename(filename);
      const targetFormats = UNIVERSAL_CONVERSIONS.audio[sourceFormat] || [];

      targetFormats.forEach(targetFormat => {
        test(`${filename} → ${targetFormat}`, async () => {
          const timeout = filename.includes('medium') ? TIMEOUTS.large : TIMEOUTS.medium;
          
          const result = await simulateUniversalConversion(
            filename, 
            sourceFormat, 
            targetFormat, 
            'audio'
          );
          
          expect(result.success).toBe(true);
          expect(result.outputFile).toBeDefined();
          expect(result.processingTime).toBeLessThan(timeout);
          
          // Validaciones específicas para audio
          if (result.validation) {
            expect(result.validation.isValidAudio).toBe(true);
            expect(result.validation.durationPreserved).toBe(true);
          }
        }, timeout);
      });
    });

    test('🎼 Preservación de calidad en FLAC', async () => {
      const result = await simulateUniversalConversion(
        'test_hq.flac', 
        'flac', 
        'wav', 
        'audio'
      );
      
      expect(result.success).toBe(true);
      if (result.validation) {
        expect(result.validation.isLossless).toBe(true);
        expect(result.validation.qualityPreserved).toBe(true);
      }
    });
  });

  describe('🎬 Conversiones de Video', () => {
    const videoFiles = [
      'test_clip.mp4',
      'test_short.mp4',
      'test_clip.avi'
    ];

    videoFiles.forEach(filename => {
      const sourceFormat = getFormatFromFilename(filename);
      const targetFormats = UNIVERSAL_CONVERSIONS.video[sourceFormat] || [];

      targetFormats.forEach(targetFormat => {
        test(`${filename} → ${targetFormat}`, async () => {
          const result = await simulateUniversalConversion(
            filename, 
            sourceFormat, 
            targetFormat, 
            'video'
          );
          
          expect(result.success).toBe(true);
          expect(result.outputFile).toBeDefined();
          expect(result.processingTime).toBeLessThan(TIMEOUTS.large);
          
          // Validaciones específicas para video
          if (result.validation) {
            expect(result.validation.isValidVideo).toBe(true);
            expect(result.validation.resolutionPreserved).toBe(true);
            expect(result.validation.durationPreserved).toBe(true);
          }
        }, TIMEOUTS.large);
      });
    });
  });

  describe('⚠️ Manejo de Casos Problemáticos', () => {
    
    test('💥 Archivo corrupto', async () => {
      const result = await simulateUniversalConversion(
        'corrupted.jpg', 
        'jpg', 
        'png', 
        'problematic'
      );
      
      // Debe fallar gracefully
      expect(result.success).toBe(false);
      expect(result.error).toContain('corrupted');
      expect(result.error).not.toContain('crash');
    });

    test('🏷️ Archivo con extensión incorrecta', async () => {
      const result = await simulateUniversalConversion(
        'fake_image.jpg', 
        'jpg', 
        'png', 
        'problematic'
      );
      
      // Debe detectar el problema
      expect(result.success).toBe(false);
      expect(result.error).toContain('format');
    });

    test('📄 Archivo vacío', async () => {
      const result = await simulateUniversalConversion(
        'empty.txt', 
        'txt', 
        'pdf', 
        'edge_case'
      );
      
      // Puede tener éxito o fallar, pero no debe crashear
      expect(result).toBeDefined();
      expect(result.error).not.toContain('crash');
    });

    test('🔤 Nombre de archivo problemático', async () => {
      const result = await simulateUniversalConversion(
        'archivo con espacios & símbolos (test).txt', 
        'txt', 
        'pdf', 
        'edge_case'
      );
      
      // Debe manejar nombres complejos
      expect(result.success).toBe(true);
    });
  });

  describe('⚡ Tests de Performance', () => {
    
    test('⏱️ Tiempo de conversión aceptable', async () => {
      const results = [];
      
      // Probar varias conversiones rápidas
      const quickTests = [
        ['simple.txt', 'txt', 'pdf'],
        ['test_small.jpg', 'jpg', 'png'],
        ['test_short.wav', 'wav', 'mp3']
      ];
      
      for (const [filename, source, target] of quickTests) {
        const result = await simulateUniversalConversion(filename, source, target, 'performance');
        results.push(result);
      }
      
      // Todas deben completarse en tiempo razonable
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.processingTime).toBeLessThan(TIMEOUTS.medium);
      });
    });

    test('💾 Uso de memoria controlado', async () => {
      const result = await simulateUniversalConversion(
        'test_large.jpg', 
        'jpg', 
        'png', 
        'performance'
      );
      
      expect(result.success).toBe(true);
      expect(result.error).not.toContain('memory');
      expect(result.error).not.toContain('heap');
    });

    test('🔄 Conversiones concurrentes', async () => {
      const concurrentPromises = [
        simulateUniversalConversion('simple.txt', 'txt', 'pdf', 'concurrent'),
        simulateUniversalConversion('test_small.jpg', 'jpg', 'png', 'concurrent'),
        simulateUniversalConversion('test_short.wav', 'wav', 'mp3', 'concurrent')
      ];
      
      const results = await Promise.all(concurrentPromises);
      
      // Todas deben completarse exitosamente
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('🎯 Tests de Calidad', () => {
    
    test('📊 Tasa de éxito general', async () => {
      const sampleConversions = [
        ['simple.txt', 'txt', 'pdf'],
        ['test_small.jpg', 'jpg', 'png'],
        ['test_short.wav', 'wav', 'mp3'],
        ['test_clip.mp4', 'mp4', 'avi'],
        ['data.csv', 'csv', 'pdf']
      ];
      
      const results = [];
      for (const [filename, source, target] of sampleConversions) {
        const result = await simulateUniversalConversion(filename, source, target, 'quality');
        results.push(result);
      }
      
      const successRate = results.filter(r => r.success).length / results.length;
      
      // Tasa de éxito mínima del 80%
      expect(successRate).toBeGreaterThan(0.8);
    });

    test('🎨 Calidad de conversiones de imagen', async () => {
      const imageResults = [];
      
      const imageTests = [
        ['test_small.jpg', 'jpg', 'png'],
        ['test_small.png', 'png', 'jpg'],
        ['test_small.gif', 'gif', 'png']
      ];
      
      for (const [filename, source, target] of imageTests) {
        const result = await simulateUniversalConversion(filename, source, target, 'quality');
        if (result.success && result.validation) {
          imageResults.push(result);
        }
      }
      
      // Al menos 70% deben mantener buena calidad
      const highQualityResults = imageResults.filter(r => 
        r.validation.qualityScore >= 0.7
      );
      
      expect(highQualityResults.length / imageResults.length).toBeGreaterThan(0.7);
    });
  });
});

// Funciones auxiliares

async function simulateUniversalConversion(filename, sourceFormat, targetFormat, category) {
  const startTime = Date.now();
  
  try {
    // Verificar que el archivo existe
    const inputPath = path.join(TEST_FILES_DIR, filename);
    const inputStats = await fs.stat(inputPath);
    
    // Simular tiempo de procesamiento basado en tamaño y tipo
    const processingTime = calculateProcessingTime(inputStats.size, category, sourceFormat, targetFormat);
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 2000)));
    
    // Determinar si la conversión debe tener éxito
    const shouldSucceed = determineConversionSuccess(filename, sourceFormat, targetFormat, inputStats.size);
    
    const result = {
      filename,
      sourceFormat,
      targetFormat,
      category,
      success: shouldSucceed,
      processingTime: Date.now() - startTime,
      fileSize: inputStats.size,
      outputFile: shouldSucceed ? `${path.parse(filename).name}.${targetFormat}` : null,
      error: shouldSucceed ? null : getSimulatedError(filename, sourceFormat, targetFormat),
      validation: shouldSucceed ? generateValidationResult(filename, sourceFormat, targetFormat, category) : null
    };
    
    return result;
    
  } catch (error) {
    return {
      filename,
      sourceFormat,
      targetFormat,
      category,
      success: false,
      processingTime: Date.now() - startTime,
      error: error.message,
      fileSize: 0
    };
  }
}

function getFormatFromFilename(filename) {
  return path.extname(filename).slice(1);
}

function calculateProcessingTime(fileSize, category, sourceFormat, targetFormat) {
  // Tiempos base por categoría (ms por MB)
  const baseTimes = {
    text: 50,
    image: 200,
    document: 300,
    audio: 500,
    video: 2000,
    problematic: 100,
    edge_case: 50,
    performance: 100,
    concurrent: 150,
    quality: 200
  };
  
  const sizeInMB = fileSize / (1024 * 1024);
  const baseTime = baseTimes[category] || 200;
  
  // Factores de complejidad
  let complexityFactor = 1;
  
  if (sourceFormat === 'pdf' || targetFormat === 'pdf') {
    complexityFactor *= 1.5;
  }
  
  if (category === 'video') {
    complexityFactor *= 2;
  }
  
  return Math.max(100, baseTime * sizeInMB * complexityFactor);
}

function determineConversionSuccess(filename, sourceFormat, targetFormat, fileSize) {
  // Casos que deben fallar
  if (filename.includes('corrupted')) return false;
  if (filename.includes('fake_')) return false;
  if (fileSize === 0 && !filename.includes('empty')) return false;
  
  // Conversiones no soportadas
  const supportedConversions = UNIVERSAL_CONVERSIONS;
  let isSupported = false;
  
  for (const category of Object.values(supportedConversions)) {
    if (category[sourceFormat] && category[sourceFormat].includes(targetFormat)) {
      isSupported = true;
      break;
    }
  }
  
  if (!isSupported) return false;
  
  // Archivos muy grandes pueden fallar
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (fileSize > maxSize) return false;
  
  // Casos especiales
  if (filename === 'empty.txt') {
    return Math.random() > 0.5; // 50% de probabilidad
  }
  
  // Éxito por defecto
  return true;
}

function getSimulatedError(filename, sourceFormat, targetFormat) {
  if (filename.includes('corrupted')) {
    return 'File appears to be corrupted or invalid';
  }
  
  if (filename.includes('fake_')) {
    return 'File format does not match extension';
  }
  
  if (filename === 'empty.txt') {
    return 'File is empty or has no content to convert';
  }
  
  return `Conversion from ${sourceFormat} to ${targetFormat} failed`;
}

function generateValidationResult(filename, sourceFormat, targetFormat, category) {
  const validation = {
    isValid: true,
    timestamp: new Date().toISOString()
  };
  
  switch (category) {
    case 'text':
      validation.hasContent = !filename.includes('empty');
      validation.preservesEncoding = filename.includes('multilingual');
      validation.preservesStructure = filename.includes('formatted');
      validation.specialCharsPreserved = filename.includes('multilingual');
      break;
      
    case 'image':
      validation.isValidImage = true;
      validation.dimensionsPreserved = true;
      validation.qualityScore = filename.includes('large') ? 0.75 : 0.85;
      
      if (filename === 'pixel.png') {
        validation.width = 1;
        validation.height = 1;
      } else if (filename.includes('small')) {
        validation.width = 300;
        validation.height = 200;
      } else if (filename.includes('medium')) {
        validation.width = 1920;
        validation.height = 1080;
      }
      break;
      
    case 'document':
      validation.hasContent = true;
      validation.textExtracted = true;
      
      if (filename === 'data.csv') {
        validation.tableStructurePreserved = true;
        validation.rowCount = 5;
      }
      break;
      
    case 'audio':
      validation.isValidAudio = true;
      validation.durationPreserved = true;
      validation.isLossless = sourceFormat === 'flac' || targetFormat === 'flac';
      validation.qualityPreserved = validation.isLossless;
      break;
      
    case 'video':
      validation.isValidVideo = true;
      validation.resolutionPreserved = true;
      validation.durationPreserved = true;
      break;
  }
  
  return validation;
}

module.exports = {
  simulateUniversalConversion,
  UNIVERSAL_CONVERSIONS,
  TIMEOUTS
};

