import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import crypto from 'crypto';
import {
  fileExists,
  validateFileStructure,
  measureConversionTime,
  createTempFile,
  cleanupTempFiles,
  getFileHash,
  createTestReport
} from '@test/utils/test-helpers';
import { AncloraMetaform } from '@/AncloraMetaform';

describe('Conversiones de Archivos Comprimidos', () => {
  let converter: AncloraMetaform;
  let tempFiles: string[] = [];
  let tempDirs: string[] = [];
  let testResults: any[] = [];

  beforeAll(async () => {
    converter = new AncloraMetaform({
      maxArchiveSize: 500 * 1024 * 1024, // 500MB
      maxExtractionSize: 2 * 1024 * 1024 * 1024, // 2GB
      supportEncryption: true,
      preservePermissions: true,
      handleSymlinks: true
    });
    await converter.initialize();
  });

  afterAll(async () => {
    // Limpiar directorios temporales
    for (const dir of tempDirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch (e) {
        // Ignorar errores
      }
    }
    await cleanupTempFiles(tempFiles);
    console.log(createTestReport('Archivos Comprimidos', testResults));
  });

  describe('Conversiones entre formatos de archivo', () => {
    describe('ZIP conversiones', () => {
      const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');

      it('debe convertir ZIP a RAR', async () => {
        const outputPath = await createTempFile('rar');
        tempFiles.push(outputPath);

        const { result, duration } = await measureConversionTime(async () => {
          return await converter.convert({
            inputPath: zipPath,
            outputPath,
            targetFormat: 'rar',
            options: {
              compressionLevel: 5,
              recoveryRecord: 3
            }
          });
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);

        testResults.push({
          conversion: 'ZIP → RAR',
          success: true,
          duration
        });
      });

      it('debe convertir ZIP a 7Z', async () => {
        const outputPath = await createTempFile('7z');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: zipPath,
          outputPath,
          targetFormat: '7z',
          options: {
            compressionMethod: 'lzma2',
            compressionLevel: 9,
            solidArchive: true,
            dictionarySize: '64m'
          }
        });

        expect(result.success).toBe(true);
        
        // 7Z debe lograr mejor compresión
        const [zipSize, sevenZipSize] = await Promise.all([
          fs.stat(zipPath).then(s => s.size),
          fs.stat(outputPath).then(s => s.size)
        ]);
        expect(sevenZipSize).toBeLessThan(zipSize);
      });

      it('debe convertir ZIP a TAR.GZ', async () => {
        const outputPath = await createTempFile('tar.gz');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: zipPath,
          outputPath,
          targetFormat: 'tar.gz',
          options: {
            gzipLevel: 6,
            preserveTimestamps: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir ZIP a TAR.BZ2', async () => {
        const outputPath = await createTempFile('tar.bz2');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: zipPath,
          outputPath,
          targetFormat: 'tar.bz2',
          options: {
            bzipBlockSize: 9
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir ZIP a TAR.XZ', async () => {
        const outputPath = await createTempFile('tar.xz');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: zipPath,
          outputPath,
          targetFormat: 'tar.xz',
          options: {
            xzPreset: 6,
            threads: 0 // Auto
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir ZIP a CAB', async () => {
        const outputPath = await createTempFile('cab');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: zipPath,
          outputPath,
          targetFormat: 'cab',
          options: {
            compressionType: 'mszip'
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('RAR conversiones', () => {
      const rarPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.rar');

      it('debe convertir RAR a ZIP', async () => {
        const outputPath = await createTempFile('zip');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: rarPath,
          outputPath,
          targetFormat: 'zip',
          options: {
            compressionMethod: 'deflate',
            compressionLevel: 9
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir RAR a 7Z', async () => {
        const outputPath = await createTempFile('7z');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: rarPath,
          outputPath,
          targetFormat: '7z'
        });

        expect(result.success).toBe(true);
      });

      it('debe manejar RAR con recovery record', async () => {
        const rarWithRecovery = path.join(__dirname, '../../fixtures/archives/valid/test-archive-recovery.rar');
        const outputPath = await createTempFile('zip');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: rarWithRecovery,
          outputPath,
          targetFormat: 'zip',
          options: {
            verifyIntegrity: true
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.recoveryRecordUsed).toBe(false);
      });
    });

    describe('7Z conversiones', () => {
      const sevenZipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.7z');

      it('debe convertir 7Z a ZIP', async () => {
        const outputPath = await createTempFile('zip');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: sevenZipPath,
          outputPath,
          targetFormat: 'zip'
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir 7Z solid a archivos individuales', async () => {
        const solidPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive-solid.7z');
        const outputPath = await createTempFile('tar');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: solidPath,
          outputPath,
          targetFormat: 'tar',
          options: {
            noCompression: true // TAR sin comprimir para acceso rápido
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('TAR y variantes', () => {
      const tarPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.tar');

      it('debe convertir TAR a ZIP', async () => {
        const outputPath = await createTempFile('zip');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: tarPath,
          outputPath,
          targetFormat: 'zip'
        });

        expect(result.success).toBe(true);
      });

      it('debe comprimir TAR a TAR.GZ', async () => {
        const outputPath = await createTempFile('tar.gz');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: tarPath,
          outputPath,
          targetFormat: 'tar.gz',
          options: {
            gzipLevel: 9,
            gzipStrategy: 'huffman'
          }
        });

        expect(result.success).toBe(true);
        
        // Verificar compresión
        const [tarSize, gzSize] = await Promise.all([
          fs.stat(tarPath).then(s => s.size),
          fs.stat(outputPath).then(s => s.size)
        ]);
        expect(gzSize).toBeLessThan(tarSize);
      });

      it('debe convertir TAR.GZ a TAR.XZ', async () => {
        const tarGzPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.tar.gz');
        const outputPath = await createTempFile('tar.xz');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: tarGzPath,
          outputPath,
          targetFormat: 'tar.xz'
        });

        expect(result.success).toBe(true);
        
        // XZ generalmente comprime mejor que GZ
        const [gzSize, xzSize] = await Promise.all([
          fs.stat(tarGzPath).then(s => s.size),
          fs.stat(outputPath).then(s => s.size)
        ]);
        expect(xzSize).toBeLessThan(gzSize);
      });
    });

    describe('Conversiones especiales', () => {
      it('debe convertir ISO a ZIP', async () => {
        const isoPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.iso');
        const outputPath = await createTempFile('zip');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: isoPath,
          outputPath,
          targetFormat: 'zip',
          options: {
            preserveStructure: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe crear ISO desde directorio comprimido', async () => {
        const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');
        const outputPath = await createTempFile('iso');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: zipPath,
          outputPath,
          targetFormat: 'iso',
          options: {
            volumeId: 'ANCLORA_TEST',
            isoLevel: 3,
            joliet: true,
            rockRidge: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir SFX a archivo normal', async () => {
        const sfxPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive-sfx.exe');
        const outputPath = await createTempFile('zip');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: sfxPath,
          outputPath,
          targetFormat: 'zip',
          options: {
            stripSfxStub: true
          }
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Operaciones de extracción', () => {
    it('debe extraer contenido de ZIP', async () => {
      const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');
      const extractDir = path.join(process.cwd(), 'temp', 'extract-zip');
      tempDirs.push(extractDir);

      const result = await converter.extract({
        inputPath: zipPath,
        outputDirectory: extractDir,
        options: {
          overwrite: true,
          preserveTimestamps: true,
          filter: {
            include: ['*.txt', '*.pdf']
          }
        }
      });

      expect(result.success).toBe(true);
      expect(result.filesExtracted).toBeGreaterThan(0);
      
      // Verificar archivos extraídos
      const files = await fs.readdir(extractDir, { recursive: true });
      expect(files.some(f => f.endsWith('.txt'))).toBe(true);
    });

    it('debe extraer con preservación de permisos', async () => {
      const tarPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive-permissions.tar');
      const extractDir = path.join(process.cwd(), 'temp', 'extract-perms');
      tempDirs.push(extractDir);

      const result = await converter.extract({
        inputPath: tarPath,
        outputDirectory: extractDir,
        options: {
          preservePermissions: true,
          preserveOwnership: false // No requiere root
        }
      });

      expect(result.success).toBe(true);
      
      // Verificar permisos en sistemas Unix
      if (process.platform !== 'win32') {
        const executablePath = path.join(extractDir, 'secure', 'executable');
        const stats = await fs.stat(executablePath);
        expect(stats.mode & 0o111).toBeGreaterThan(0); // Ejecutable
      }
    });

    it('debe manejar enlaces simbólicos', async () => {
      const tarPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive-links.tar.gz');
      const extractDir = path.join(process.cwd(), 'temp', 'extract-links');
      tempDirs.push(extractDir);

      const result = await converter.extract({
        inputPath: tarPath,
        outputDirectory: extractDir,
        options: {
          handleSymlinks: 'preserve',
          resolveBrokenLinks: false
        }
      });

      expect(result.success).toBe(true);
      expect(result.metadata?.symlinksProcessed).toBeGreaterThan(0);
    });

    it('debe extraer archivos específicos', async () => {
      const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');
      const extractDir = path.join(process.cwd(), 'temp', 'extract-specific');
      tempDirs.push(extractDir);

      const result = await converter.extractFiles({
        inputPath: zipPath,
        outputDirectory: extractDir,
        files: ['documents/report.pdf', 'images/logo.png'],
        options: {
          createDirectories: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.filesExtracted).toBe(2);
    });
  });

  describe('Operaciones de compresión', () => {
    it('debe crear archivo desde directorio', async () => {
      const sourceDir = path.join(__dirname, '../../fixtures/test-files');
      const outputPath = await createTempFile('zip');
      tempFiles.push(outputPath);

      const result = await converter.compress({
        inputPath: sourceDir,
        outputPath,
        format: 'zip',
        options: {
          compressionLevel: 9,
          includeHidden: false,
          followSymlinks: false,
          exclude: ['*.tmp', '*.log']
        }
      });

      expect(result.success).toBe(true);
      expect(result.filesCompressed).toBeGreaterThan(0);
    });

    it('debe crear archivo desde lista de archivos', async () => {
      const files = [
        path.join(__dirname, '../../fixtures/documents/valid/test-document.pdf'),
        path.join(__dirname, '../../fixtures/images/valid/test-image.jpg'),
        path.join(__dirname, '../../fixtures/media/valid/test-audio.mp3')
      ];
      const outputPath = await createTempFile('7z');
      tempFiles.push(outputPath);

      const result = await converter.compressFiles({
        files,
        outputPath,
        format: '7z',
        options: {
          solidArchive: true,
          compressionLevel: 9
        }
      });

      expect(result.success).toBe(true);
      expect(result.filesCompressed).toBe(3);
    });

    it('debe actualizar archivo existente', async () => {
      const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');
      const tempZip = await createTempFile('zip');
      await fs.copyFile(zipPath, tempZip);
      tempFiles.push(tempZip);

      const newFile = path.join(__dirname, '../../fixtures/documents/valid/new-file.txt');

      const result = await converter.updateArchive({
        archivePath: tempZip,
        operation: 'add',
        files: [newFile],
        options: {
          compressionLevel: 5,
          targetPath: 'documents/'
        }
      });

      expect(result.success).toBe(true);
      expect(result.filesAdded).toBe(1);
    });

    it('debe eliminar archivos de archivo', async () => {
      const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');
      const tempZip = await createTempFile('zip');
      await fs.copyFile(zipPath, tempZip);
      tempFiles.push(tempZip);

      const result = await converter.updateArchive({
        archivePath: tempZip,
        operation: 'delete',
        files: ['documents/readme.txt'],
        options: {
          backup: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.filesDeleted).toBe(1);
    });
  });

  describe('Manejo de archivos encriptados', () => {
    it('debe convertir ZIP encriptado', async () => {
      const encryptedZip = path.join(__dirname, '../../fixtures/archives/valid/test-archive-encrypted.zip');
      const outputPath = await createTempFile('7z');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: encryptedZip,
        outputPath,
        targetFormat: '7z',
        options: {
          password: 'test123',
          outputPassword: 'newpass456',
          encryptionMethod: 'aes256'
        }
      });

      expect(result.success).toBe(true);
    });

    it('debe crear archivo encriptado', async () => {
      const sourceDir = path.join(__dirname, '../../fixtures/test-files');
      const outputPath = await createTempFile('zip');
      tempFiles.push(outputPath);

      const result = await converter.compress({
        inputPath: sourceDir,
        outputPath,
        format: 'zip',
        options: {
          password: 'secure123',
          encryptionMethod: 'aes256',
          encryptFilenames: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.metadata?.encrypted).toBe(true);
    });

    it('debe fallar con contraseña incorrecta', async () => {
      const encryptedZip = path.join(__dirname, '../../fixtures/archives/valid/test-archive-encrypted.zip');
      const outputPath = await createTempFile('rar');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: encryptedZip,
        outputPath,
        targetFormat: 'rar',
        options: {
          password: 'wrongpassword'
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('contraseña');
    });
  });

  describe('Manejo de archivos multi-volumen', () => {
    it('debe unir archivos divididos', async () => {
      const splitParts = [
        path.join(__dirname, '../../fixtures/archives/valid/test-archive-split.z01'),
        path.join(__dirname, '../../fixtures/archives/valid/test-archive-split.z02'),
        path.join(__dirname, '../../fixtures/archives/valid/test-archive-split.z03'),
        path.join(__dirname, '../../fixtures/archives/valid/test-archive-split.zip')
      ];
      const outputPath = await createTempFile('zip');
      tempFiles.push(outputPath);

      const result = await converter.joinSplitArchive({
        parts: splitParts,
        outputPath,
        options: {
          verifyIntegrity: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.totalSize).toBeGreaterThan(150 * 1024 * 1024); // >150MB
    });

    it('debe dividir archivo grande', async () => {
      const largeArchive = path.join(__dirname, '../../fixtures/archives/valid/large-archive.zip');
      const outputDir = path.join(process.cwd(), 'temp', 'split');
      await fs.mkdir(outputDir, { recursive: true });
      tempDirs.push(outputDir);

      const result = await converter.splitArchive({
        inputPath: largeArchive,
        outputDirectory: outputDir,
        options: {
          volumeSize: '50M',
          format: 'zip',
          namePattern: 'part-{index}.zip'
        }
      });

      expect(result.success).toBe(true);
      expect(result.partsCreated).toBeGreaterThan(1);
      
      // Agregar partes a limpieza
      result.parts.forEach(part => tempFiles.push(part));
    });

    it('debe manejar RAR multi-volumen', async () => {
      const rarParts = Array.from({ length: 5 }, (_, i) => 
        path.join(__dirname, `../../fixtures/archives/valid/anclora.part${i + 1}.rar`)
      );
      const outputPath = await createTempFile('zip');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: rarParts[0], // Primera parte
        outputPath,
        targetFormat: 'zip',
        options: {
          handleMultiVolume: true
        }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Archivos especiales y casos extremos', () => {
    it('debe manejar nombres Unicode', async () => {
      const unicodeZip = path.join(__dirname, '../../fixtures/archives/valid/test-archive-unicode.zip');
      const extractDir = path.join(process.cwd(), 'temp', 'unicode');
      tempDirs.push(extractDir);

      const result = await converter.extract({
        inputPath: unicodeZip,
        outputDirectory: extractDir,
        options: {
          encoding: 'utf8',
          fallbackEncoding: 'cp437'
        }
      });

      expect(result.success).toBe(true);
      
      // Verificar nombres preservados
      const files = await fs.readdir(extractDir, { recursive: true });
      expect(files.some(f => f.includes('ñ'))).toBe(true);
      expect(files.some(f => f.includes('中文'))).toBe(true);
    });

    it('debe extraer archivos anidados recursivamente', async () => {
      const nestedZip = path.join(__dirname, '../../fixtures/archives/valid/test-archive-nested.zip');
      const extractDir = path.join(process.cwd(), 'temp', 'nested');
      tempDirs.push(extractDir);

      const result = await converter.extractNested({
        inputPath: nestedZip,
        outputDirectory: extractDir,
        options: {
          maxDepth: 5,
          extractAll: true,
          deleteAfterExtract: false
        }
      });

      expect(result.success).toBe(true);
      expect(result.levelsExtracted).toBeGreaterThan(1);
    });

    it('debe manejar archivos sparse', async () => {
      const sparseTar = path.join(__dirname, '../../fixtures/archives/valid/test-archive-sparse.tar');
      const outputPath = await createTempFile('7z');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: sparseTar,
        outputPath,
        targetFormat: '7z',
        options: {
          handleSparse: true,
          sparseThreshold: 4096
        }
      });

      expect(result.success).toBe(true);
      expect(result.metadata?.sparseFilesOptimized).toBeGreaterThan(0);
    });

    it('debe validar integridad de archivo', async () => {
      const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');

      const result = await converter.verifyArchive({
        inputPath: zipPath,
        options: {
          checkCRC: true,
          testExtraction: true,
          verbose: true
        }
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.filesChecked).toBeGreaterThan(0);
    });
  });

  describe('Conversiones con optimización', () => {
    it('debe recomprimir para mejor ratio', async () => {
      const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');
      const outputPath = await createTempFile('7z');
      tempFiles.push(outputPath);

      const result = await converter.recompress({
        inputPath: zipPath,
        outputPath,
        targetFormat: '7z',
        options: {
          analyze: true,
          optimizeForSize: true,
          useSolidBlocks: true,
          sortByExtension: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.compressionImprovement).toBeGreaterThan(10); // >10% mejora
    });

    it('debe optimizar para acceso rápido', async () => {
      const sevenZipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive-solid.7z');
      const outputPath = await createTempFile('zip');
      tempFiles.push(outputPath);

      const result = await converter.convert({
        inputPath: sevenZipPath,
        outputPath,
        targetFormat: 'zip',
        options: {
          optimizeForSpeed: true,
          compressionLevel: 1,
          disableSolid: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.metadata?.accessOptimized).toBe(true);
    });
  });

  describe('Manejo de archivos corrompidos', () => {
    describe('Archivos reparables', () => {
      it('debe reparar ZIP con CRC incorrecto', async () => {
        const corruptedZip = path.join(__dirname, '../../fixtures/archives/corrupted-fixable/crc-error.zip');
        const outputPath = await createTempFile('zip');
        tempFiles.push(outputPath);

        const result = await converter.repair({
          inputPath: corruptedZip,
          outputPath,
          options: {
            ignoreCRCErrors: true,
            rebuildCentralDirectory: true,
            recoverPartialFiles: true
          }
        });

        expect(result.success).toBe(true);
        expect(result.filesRecovered).toBeGreaterThan(0);
        expect(result.dataLoss).toBeLessThan(10); // <10% pérdida
      });

      it('debe recuperar RAR con recovery record', async () => {
        const damagedRar = path.join(__dirname, '../../fixtures/archives/corrupted-fixable/damaged-with-recovery.rar');
        const outputPath = await createTempFile('rar');
        tempFiles.push(outputPath);

        const result = await converter.repair({
          inputPath: damagedRar,
          outputPath,
          options: {
            useRecoveryRecord: true,
            maxRecoveryAttempts: 3
          }
        });

        expect(result.success).toBe(true);
        expect(result.recoveryRecordUsed).toBe(true);
      });

      it('debe reconstruir header de 7Z', async () => {
        const corrupted7z = path.join(__dirname, '../../fixtures/archives/corrupted-fixable/header-damaged.7z');
        const outputPath = await createTempFile('7z');
        tempFiles.push(outputPath);

        const result = await converter.repair({
          inputPath: corrupted7z,
          outputPath,
          options: {
            rebuildHeaders: true,
            scanForSignatures: true
          }
        });

        expect(result.success).toBe(true);
        expect(result.headersRebuilt).toBe(true);
      });
    });

    describe('Archivos irreparables', () => {
      it('debe fallar con archivo severamente corrupto', async () => {
        const severelyCorrupted = path.join(__dirname, '../../fixtures/archives/corrupted-unfixable/severe.rar');
        const outputPath = await createTempFile('zip');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: severelyCorrupted,
          outputPath,
          targetFormat: 'zip'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('corrupto');
      });

      it('debe fallar con archivo encriptado sin clave', async () => {
        const encryptedNoKey = path.join(__dirname, '../../fixtures/archives/corrupted-unfixable/encrypted-lost-key.zip');
        const outputPath = await createTempFile('rar');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: encryptedNoKey,
          outputPath,
          targetFormat: 'rar'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('encriptado');
      });
    });
  });

  describe('Operaciones por lotes', () => {
    it('debe convertir múltiples archivos', async () => {
      const archives = [
        path.join(__dirname, '../../fixtures/archives/valid/archive1.zip'),
        path.join(__dirname, '../../fixtures/archives/valid/archive2.rar'),
        path.join(__dirname, '../../fixtures/archives/valid/archive3.7z')
      ];
      const outputDir = path.join(process.cwd(), 'temp', 'batch-convert');
      await fs.mkdir(outputDir, { recursive: true });
      tempDirs.push(outputDir);

      const result = await converter.batchConvert({
        inputs: archives,
        outputDirectory: outputDir,
        targetFormat: 'zip',
        options: {
          preserveNames: true,
          compressionLevel: 5
        }
      });

      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      
      // Verificar archivos creados
      const files = await fs.readdir(outputDir);
      expect(files.filter(f => f.endsWith('.zip'))).toHaveLength(3);
    });

    it('debe extraer múltiples archivos', async () => {
      const archives = [
        path.join(__dirname, '../../fixtures/archives/valid/test1.zip'),
        path.join(__dirname, '../../fixtures/archives/valid/test2.zip')
      ];
      const baseExtractDir = path.join(process.cwd(), 'temp', 'batch-extract');
      await fs.mkdir(baseExtractDir, { recursive: true });
      tempDirs.push(baseExtractDir);

      const result = await converter.batchExtract({
        inputs: archives,
        outputDirectory: baseExtractDir,
        options: {
          createSubfolders: true,
          skipExisting: true
        }
      });

      expect(result.archivesProcessed).toBe(2);
      expect(result.totalFilesExtracted).toBeGreaterThan(0);
    });
  });

  describe('Información y metadatos', () => {
    it('debe listar contenido de archivo', async () => {
      const zipPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.zip');

      const result = await converter.listContents({
        inputPath: zipPath,
        options: {
          detailed: true,
          sortBy: 'size',
          includeDirectories: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.entries).toBeInstanceOf(Array);
      expect(result.entries.length).toBeGreaterThan(0);
      expect(result.totalSize).toBeGreaterThan(0);
      expect(result.totalCompressedSize).toBeGreaterThan(0);
    });

    it('debe obtener información detallada de archivo', async () => {
      const rarPath = path.join(__dirname, '../../fixtures/archives/valid/test-archive.rar');

      const info = await converter.getArchiveInfo({
        inputPath: rarPath,
        options: {
          calculateHashes: true,
          checkIntegrity: true
        }
      });

      expect(info.format).toBe('rar');
      expect(info.compression).toBeDefined();
      expect(info.encrypted).toBeDefined();
      expect(info.solid).toBeDefined();
      expect(info.fileCount).toBeGreaterThan(0);
      expect(info.hash).toBeDefined();
    });

    it('debe comparar archivos', async () => {
      const archive1 = path.join(__dirname, '../../fixtures/archives/valid/test1.zip');
      const archive2 = path.join(__dirname, '../../fixtures/archives/valid/test2.zip');

      const comparison = await converter.compareArchives({
        archive1,
        archive2,
        options: {
          compareContent: true,
          compareAttributes: true,
          ignoreTimestamps: false
        }
      });

      expect(comparison.identical).toBeDefined();
      expect(comparison.differences).toBeInstanceOf(Array);
      expect(comparison.onlyInFirst).toBeInstanceOf(Array);
      expect(comparison.onlyInSecond).toBeInstanceOf(Array);
    });
  });

  describe('Validaciones y límites', () => {
    it('debe rechazar archivos que excedan tamaño máximo', async () => {
      const largeArchive = path.join(__dirname, '../../fixtures/archives/valid/huge-archive.zip');
      const outputPath = await createTempFile('7z');
      tempFiles.push(outputPath);

      const converterWithLimit = new AncloraMetaform({
        maxArchiveSize: 100 * 1024 * 1024 // 100MB
      });

      const result = await converterWithLimit.convert({
        inputPath: largeArchive,
        outputPath,
        targetFormat: '7z'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('tamaño máximo');
    });

    it('debe prevenir zip bombs', async () => {
      const zipBomb = path.join(__dirname, '../../fixtures/archives/valid/potential-bomb.zip');
      const extractDir = path.join(process.cwd(), 'temp', 'bomb-test');
      tempDirs.push(extractDir);

      const result = await converter.extract({
        inputPath: zipBomb,
        outputDirectory: extractDir,
        options: {
          maxExtractionRatio: 100, // Máximo 100:1
          maxExtractedSize: 1024 * 1024 * 1024 // 1GB
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('ratio de compresión');
    });

    it('debe limitar profundidad de archivos anidados', async () => {
      const deeplyNested = path.join(__dirname, '../../fixtures/archives/valid/deeply-nested.zip');
      const extractDir = path.join(process.cwd(), 'temp', 'deep-extract');
      tempDirs.push(extractDir);

      const result = await converter.extractNested({
        inputPath: deeplyNested,
        outputDirectory: extractDir,
        options: {
          maxDepth: 3,
          extractAll: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.levelsExtracted).toBeLessThanOrEqual(3);
    });
  });
});