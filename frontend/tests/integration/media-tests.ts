import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import ffmpeg from '@ts-ffmpeg/fluent-ffmpeg'; // Para validaciÃ³n de media
import {
  fileExists,
  measureConversionTime,
  createTempFile,
  cleanupTempFiles,
  createTestReport
} from '@test/utils/test-helpers';
import { AncloraNexus } from '@/AncloraNexus';

describe('Conversiones de Media (Audio/Video)', () => {
  let converter: AncloraNexus;
  let tempFiles: string[] = [];
  let testResults: any[] = [];

  beforeAll(async () => {
    converter = new AncloraNexus({
      ffmpegPath: '/usr/local/bin/ffmpeg',
      enableHardwareAcceleration: true,
      maxVideoDuration: 3600, // 1 hora
      maxAudioDuration: 7200, // 2 horas
      preserveQuality: true
    });
    await converter.initialize();
  });

  afterAll(async () => {
    await cleanupTempFiles(tempFiles);
    console.log(createTestReport('Media', testResults));
  });

  describe('Conversiones de Audio', () => {
    describe('MP3 conversiones', () => {
      const mp3Path = path.join(__dirname, '../../fixtures/media/valid/test-audio.mp3');

      it('debe convertir MP3 a WAV', async () => {
        const outputPath = await createTempFile('wav');
        tempFiles.push(outputPath);

        const { result, duration } = await measureConversionTime(async () => {
          return await converter.convert({
            inputPath: mp3Path,
            outputPath,
            targetFormat: 'wav',
            options: {
              audioCodec: 'pcm_s16le',
              sampleRate: 44100,
              channels: 2
            }
          });
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
        
        // Validar propiedades del audio
        const metadata = await getAudioMetadata(outputPath);
        expect(metadata.format).toBe('wav');
        expect(metadata.sampleRate).toBe(44100);

        testResults.push({
          conversion: 'MP3 â†’ WAV',
          success: true,
          duration
        });
      });

      it('debe convertir MP3 a AAC', async () => {
        const outputPath = await createTempFile('aac');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp3Path,
          outputPath,
          targetFormat: 'aac',
          options: {
            audioBitrate: '192k',
            audioQuality: 5
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir MP3 a FLAC', async () => {
        const outputPath = await createTempFile('flac');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp3Path,
          outputPath,
          targetFormat: 'flac',
          options: {
            compressionLevel: 5
          }
        });

        expect(result.success).toBe(true);
        
        // FLAC debe ser mÃ¡s grande que MP3 (sin pÃ©rdida)
        const [mp3Size, flacSize] = await Promise.all([
          fs.stat(mp3Path).then(s => s.size),
          fs.stat(outputPath).then(s => s.size)
        ]);
        expect(flacSize).toBeGreaterThan(mp3Size);
      });

      it('debe convertir MP3 a OGG Vorbis', async () => {
        const outputPath = await createTempFile('ogg');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp3Path,
          outputPath,
          targetFormat: 'ogg',
          options: {
            audioCodec: 'libvorbis',
            audioQuality: 6
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir MP3 a M4A', async () => {
        const outputPath = await createTempFile('m4a');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp3Path,
          outputPath,
          targetFormat: 'm4a',
          options: {
            audioCodec: 'aac',
            audioBitrate: '256k'
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir MP3 a WMA', async () => {
        const outputPath = await createTempFile('wma');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp3Path,
          outputPath,
          targetFormat: 'wma',
          options: {
            audioCodec: 'wmav2',
            audioBitrate: '192k'
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('Conversiones de audio sin pÃ©rdida', () => {
      const flacPath = path.join(__dirname, '../../fixtures/media/valid/test-audio.flac');

      it('debe convertir FLAC a ALAC', async () => {
        const outputPath = await createTempFile('m4a');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: flacPath,
          outputPath,
          targetFormat: 'm4a',
          options: {
            audioCodec: 'alac',
            preserveMetadata: true
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir FLAC a WAV manteniendo calidad', async () => {
        const outputPath = await createTempFile('wav');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: flacPath,
          outputPath,
          targetFormat: 'wav',
          options: {
            bitsPerSample: 24,
            sampleRate: 96000
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getAudioMetadata(outputPath);
        expect(metadata.bitsPerSample).toBe(24);
        expect(metadata.sampleRate).toBe(96000);
      });
    });

    describe('Procesamiento de audio', () => {
      const audioPath = path.join(__dirname, '../../fixtures/media/valid/test-audio.mp3');

      it('debe cambiar sample rate durante conversiÃ³n', async () => {
        const outputPath = await createTempFile('mp3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: audioPath,
          outputPath,
          targetFormat: 'mp3',
          options: {
            sampleRate: 22050,
            resampleFilter: 'sinc'
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getAudioMetadata(outputPath);
        expect(metadata.sampleRate).toBe(22050);
      });

      it('debe convertir estÃ©reo a mono', async () => {
        const outputPath = await createTempFile('mp3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: audioPath,
          outputPath,
          targetFormat: 'mp3',
          options: {
            channels: 1,
            audioMixdown: 'average'
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getAudioMetadata(outputPath);
        expect(metadata.channels).toBe(1);
      });

      it('debe normalizar volumen durante conversiÃ³n', async () => {
        const outputPath = await createTempFile('mp3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: audioPath,
          outputPath,
          targetFormat: 'mp3',
          options: {
            normalize: true,
            targetLevel: -23, // LUFS
            peakLimit: -1    // dBFS
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.normalized).toBe(true);
      });

      it('debe aplicar fade in/out', async () => {
        const outputPath = await createTempFile('mp3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: audioPath,
          outputPath,
          targetFormat: 'mp3',
          options: {
            fadeIn: 2,  // 2 segundos
            fadeOut: 3  // 3 segundos
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe recortar audio', async () => {
        const outputPath = await createTempFile('mp3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: audioPath,
          outputPath,
          targetFormat: 'mp3',
          options: {
            startTime: 5,   // Comenzar en segundo 5
            duration: 10    // DuraciÃ³n de 10 segundos
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getAudioMetadata(outputPath);
        expect(metadata.duration).toBeCloseTo(10, 1);
      });

      it('debe aplicar filtros de audio', async () => {
        const outputPath = await createTempFile('mp3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: audioPath,
          outputPath,
          targetFormat: 'mp3',
          options: {
            audioFilters: {
              equalizer: {
                bass: 5,
                treble: 3
              },
              compressor: {
                threshold: -20,
                ratio: 4,
                attack: 5,
                release: 50
              },
              noiseReduction: {
                level: 0.3
              }
            }
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('Conversiones de audio multicanal', () => {
      const surroundPath = path.join(__dirname, '../../fixtures/media/valid/test-audio-multichannel.ac3');

      it('debe convertir AC3 5.1 a estÃ©reo', async () => {
        const outputPath = await createTempFile('mp3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: surroundPath,
          outputPath,
          targetFormat: 'mp3',
          options: {
            channels: 2,
            audioMixdown: 'dolby'
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe preservar canales 5.1 en conversiÃ³n', async () => {
        const outputPath = await createTempFile('ac3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: surroundPath,
          outputPath,
          targetFormat: 'ac3',
          options: {
            preserveChannels: true,
            audioBitrate: '448k'
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getAudioMetadata(outputPath);
        expect(metadata.channels).toBe(6); // 5.1 = 6 canales
      });
    });
  });

  describe('Conversiones de Video', () => {
    describe('MP4 conversiones', () => {
      const mp4Path = path.join(__dirname, '../../fixtures/media/valid/test-video.mp4');

      it('debe convertir MP4 a AVI', async () => {
        const outputPath = await createTempFile('avi');
        tempFiles.push(outputPath);

        const { result, duration } = await measureConversionTime(async () => {
          return await converter.convert({
            inputPath: mp4Path,
            outputPath,
            targetFormat: 'avi',
            options: {
              videoCodec: 'libxvid',
              audioCodec: 'mp3',
              videoBitrate: '2M'
            }
          });
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);

        testResults.push({
          conversion: 'MP4 â†’ AVI',
          success: true,
          duration
        });
      });

      it('debe convertir MP4 a MOV', async () => {
        const outputPath = await createTempFile('mov');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp4Path,
          outputPath,
          targetFormat: 'mov',
          options: {
            videoCodec: 'prores',
            profile: 'hq',
            pixelFormat: 'yuv422p10le'
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir MP4 a WebM', async () => {
        const outputPath = await createTempFile('webm');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp4Path,
          outputPath,
          targetFormat: 'webm',
          options: {
            videoCodec: 'libvpx-vp9',
            audioCodec: 'libopus',
            crf: 30,
            speed: 4
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir MP4 a MKV', async () => {
        const outputPath = await createTempFile('mkv');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp4Path,
          outputPath,
          targetFormat: 'mkv',
          options: {
            videoCodec: 'copy', // Sin recodificar
            audioCodec: 'copy',
            subtitleCodec: 'copy'
          }
        });

        expect(result.success).toBe(true);
        
        // ConversiÃ³n sin recodificar debe ser rÃ¡pida
        expect(result.metadata?.processingTime).toBeLessThan(5000);
      });

      it('debe convertir MP4 a WMV', async () => {
        const outputPath = await createTempFile('wmv');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp4Path,
          outputPath,
          targetFormat: 'wmv',
          options: {
            videoCodec: 'wmv2',
            audioCodec: 'wmav2',
            videoBitrate: '2M'
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe convertir MP4 a FLV', async () => {
        const outputPath = await createTempFile('flv');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: mp4Path,
          outputPath,
          targetFormat: 'flv',
          options: {
            videoCodec: 'flv',
            audioCodec: 'mp3',
            videoSize: '640x480'
          }
        });

        expect(result.success).toBe(true);
      });
    });

    describe('Procesamiento de video', () => {
      const videoPath = path.join(__dirname, '../../fixtures/media/valid/test-video.mp4');

      it('debe cambiar resoluciÃ³n de video', async () => {
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: videoPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            videoSize: '1280x720',
            scaleFilter: 'lanczos',
            maintainAspectRatio: true
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getVideoMetadata(outputPath);
        expect(metadata.width).toBe(1280);
        expect(metadata.height).toBe(720);
      });

      it('debe cambiar frame rate', async () => {
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: videoPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            fps: 24,
            interpolation: 'mci' // Motion compensated interpolation
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getVideoMetadata(outputPath);
        expect(metadata.fps).toBe(24);
      });

      it('debe recortar video', async () => {
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: videoPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            startTime: 10,  // Comenzar en segundo 10
            endTime: 25,    // Terminar en segundo 25
            accurate: true  // Corte preciso
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getVideoMetadata(outputPath);
        expect(metadata.duration).toBeCloseTo(15, 1);
      });

      it('debe agregar marca de agua a video', async () => {
        const watermarkPath = path.join(__dirname, '../../fixtures/images/valid/watermark.png');
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: videoPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            watermark: {
              path: watermarkPath,
              position: 'bottom-right',
              margin: 10,
              opacity: 0.5,
              scale: 0.2
            }
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe aplicar filtros de video', async () => {
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: videoPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            videoFilters: {
              brightness: 0.1,
              contrast: 1.2,
              saturation: 1.1,
              gamma: 0.9,
              hue: 10,
              sharpen: true,
              denoise: 'light'
            }
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe rotar video', async () => {
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: videoPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            rotation: 90,
            transpose: true // Ajustar dimensiones
          }
        });

        expect(result.success).toBe(true);
        
        const originalMeta = await getVideoMetadata(videoPath);
        const rotatedMeta = await getVideoMetadata(outputPath);
        expect(rotatedMeta.width).toBe(originalMeta.height);
        expect(rotatedMeta.height).toBe(originalMeta.width);
      });

      it('debe estabilizar video', async () => {
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: videoPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            stabilize: {
              smoothing: 10,
              accuracy: 15,
              stepSize: 6,
              minContrast: 0.3
            }
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.stabilized).toBe(true);
      });
    });

    describe('ExtracciÃ³n de componentes', () => {
      const videoPath = path.join(__dirname, '../../fixtures/media/valid/test-video.mp4');

      it('debe extraer audio de video', async () => {
        const outputPath = await createTempFile('mp3');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: videoPath,
          outputPath,
          targetFormat: 'mp3',
          options: {
            noVideo: true,
            audioCodec: 'libmp3lame',
            audioBitrate: '192k'
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getAudioMetadata(outputPath);
        expect(metadata.hasVideo).toBe(false);
      });

      it('debe extraer frames de video', async () => {
        const outputDir = path.join(process.cwd(), 'temp', 'frames');
        await fs.mkdir(outputDir, { recursive: true });

        const result = await converter.extractFrames({
          inputPath: videoPath,
          outputDirectory: outputDir,
          options: {
            fps: 1,          // 1 frame por segundo
            format: 'png',
            quality: 95,
            namePattern: 'frame_%04d.png'
          }
        });

        expect(result.success).toBe(true);
        expect(result.framesExtracted).toBeGreaterThan(0);
        
        // Agregar frames a limpieza
        const files = await fs.readdir(outputDir);
        files.forEach(file => tempFiles.push(path.join(outputDir, file)));
      });

      it('debe extraer thumbnail de video', async () => {
        const outputPath = await createTempFile('jpg');
        tempFiles.push(outputPath);

        const result = await converter.extractThumbnail({
          inputPath: videoPath,
          outputPath,
          options: {
            timestamp: '00:00:05', // 5 segundos
            size: '320x240',
            quality: 85
          }
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
      });

      it('debe extraer subtÃ­tulos de video', async () => {
        const videoWithSubs = path.join(__dirname, '../../fixtures/media/valid/test-video-subs.mkv');
        const outputPath = await createTempFile('srt');
        tempFiles.push(outputPath);

        const result = await converter.extractSubtitles({
          inputPath: videoWithSubs,
          outputPath,
          options: {
            streamIndex: 0,  // Primera pista de subtÃ­tulos
            format: 'srt'
          }
        });

        expect(result.success).toBe(true);
        expect(await fileExists(outputPath)).toBe(true);
      });
    });

    describe('Conversiones avanzadas', () => {
      it('debe convertir video HDR a SDR', async () => {
        const hdrPath = path.join(__dirname, '../../fixtures/media/valid/test-video-hdr.mp4');
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: hdrPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            tonemapping: 'hable',
            colorSpace: 'bt709',
            colorTransfer: 'bt709',
            colorPrimaries: 'bt709',
            peakLuminance: 100
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.tonemapped).toBe(true);
      });

      it('debe convertir video entrelazado a progresivo', async () => {
        const interlacedPath = path.join(__dirname, '../../fixtures/media/valid/test-video-interlaced.mp4');
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: interlacedPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            deinterlace: 'yadif',
            deinterlaceMode: 'send_frame',
            doubleFrameRate: false
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.deinterlaced).toBe(true);
      });

      it('debe convertir video 3D a 2D', async () => {
        const video3dPath = path.join(__dirname, '../../fixtures/media/valid/test-video-3d.mp4');
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath: video3dPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            stereo3dMode: 'sbs2l', // Side-by-side to left eye
            outputMode: '2d'
          }
        });

        expect(result.success).toBe(true);
      });

      it('debe crear video desde imÃ¡genes', async () => {
        const imagesDir = path.join(__dirname, '../../fixtures/images/sequence');
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.createVideoFromImages({
          inputPattern: path.join(imagesDir, 'frame_%04d.png'),
          outputPath,
          options: {
            fps: 30,
            videoCodec: 'libx264',
            pixelFormat: 'yuv420p',
            duration: 10
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getVideoMetadata(outputPath);
        expect(metadata.duration).toBeCloseTo(10, 1);
      });

      it('debe concatenar mÃºltiples videos', async () => {
        const videos = [
          path.join(__dirname, '../../fixtures/media/valid/test-video-1.mp4'),
          path.join(__dirname, '../../fixtures/media/valid/test-video-2.mp4'),
          path.join(__dirname, '../../fixtures/media/valid/test-video-3.mp4')
        ];
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.concatenateVideos({
          inputs: videos,
          outputPath,
          options: {
            reencodeIfNeeded: true,
            transitionEffect: 'fade',
            transitionDuration: 1
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.segmentsConcatenated).toBe(3);
      });
    });

    describe('Streaming y optimizaciÃ³n', () => {
      it('debe optimizar video para streaming web', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/media/valid/test-video.mp4');
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const result = await converter.convert({
          inputPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            webOptimized: true,
            fastStart: true,
            videoCodec: 'libx264',
            preset: 'fast',
            profile: 'baseline',
            level: '3.0'
          }
        });

        expect(result.success).toBe(true);
        expect(result.metadata?.webOptimized).toBe(true);
      });

      it('debe crear HLS playlist', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/media/valid/test-video.mp4');
        const outputDir = path.join(process.cwd(), 'temp', 'hls');
        await fs.mkdir(outputDir, { recursive: true });

        const result = await converter.createHLS({
          inputPath,
          outputDirectory: outputDir,
          options: {
            segmentDuration: 10,
            playlistType: 'vod',
            variants: [
              { bandwidth: 800000, resolution: '640x360' },
              { bandwidth: 1200000, resolution: '854x480' },
              { bandwidth: 2500000, resolution: '1280x720' }
            ]
          }
        });

        expect(result.success).toBe(true);
        expect(result.variantsCreated).toBe(3);
        
        // Verificar archivos creados
        const files = await fs.readdir(outputDir);
        expect(files).toContain('master.m3u8');
        
        // Agregar archivos a limpieza
        files.forEach(file => tempFiles.push(path.join(outputDir, file)));
      });

      it('debe crear DASH manifest', async () => {
        const inputPath = path.join(__dirname, '../../fixtures/media/valid/test-video.mp4');
        const outputDir = path.join(process.cwd(), 'temp', 'dash');
        await fs.mkdir(outputDir, { recursive: true });

        const result = await converter.createDASH({
          inputPath,
          outputDirectory: outputDir,
          options: {
            segmentDuration: 4,
            profiles: ['live', 'onDemand'],
            representations: [
              { width: 640, height: 360, bitrate: 800000 },
              { width: 1280, height: 720, bitrate: 2500000 }
            ]
          }
        });

        expect(result.success).toBe(true);
        expect(result.representationsCreated).toBe(2);
        
        // Verificar manifest
        const files = await fs.readdir(outputDir);
        expect(files.some(f => f.endsWith('.mpd'))).toBe(true);
      });
    });

    describe('Conversiones por lotes de media', () => {
      it('debe convertir mÃºltiples audios a formato uniforme', async () => {
        const inputDir = path.join(__dirname, '../../fixtures/media/valid/audio-batch');
        const outputDir = path.join(process.cwd(), 'temp', 'audio-normalized');
        await fs.mkdir(outputDir, { recursive: true });

        const result = await converter.batchConvert({
          inputDirectory: inputDir,
          outputDirectory: outputDir,
          targetFormat: 'mp3',
          options: {
            audioBitrate: '192k',
            sampleRate: 44100,
            normalize: true,
            preserveMetadata: true
          }
        });

        expect(result.successful).toBeGreaterThan(0);
        expect(result.failed).toBe(0);
      });

      it('debe crear proxies de video para ediciÃ³n', async () => {
        const videos = [
          path.join(__dirname, '../../fixtures/media/valid/raw-video-1.mov'),
          path.join(__dirname, '../../fixtures/media/valid/raw-video-2.mov')
        ];

        const results = await converter.createProxies({
          inputs: videos,
          options: {
            proxyCodec: 'prores',
            proxyProfile: 'proxy',
            resolution: '1280x720',
            preserveTimecode: true
          }
        });

        expect(results.created).toBe(2);
        
        // Agregar archivos a limpieza
        results.files.forEach((file: { path: string }) => tempFiles.push(file.path));
      });
    });

    describe('Manejo de archivos media corrompidos', () => {
      describe('Media subsanable', () => {
        it('debe reparar MP4 con Ã­ndice corrupto', async () => {
          const corruptedPath = path.join(__dirname, '../../fixtures/media/corrupted-fixable/bad-index.mp4');
          const outputPath = await createTempFile('mp4');
          tempFiles.push(outputPath);

          const result = await converter.convert({
            inputPath: corruptedPath,
            outputPath,
            targetFormat: 'mp4',
            options: {
              repairMode: true,
              rebuildIndex: true,
              ignoreErrors: ['index']
            }
          });

          expect(result.success).toBe(true);
          expect(result.metadata?.repaired).toBe(true);
        });

        it('debe manejar audio con header corrupto', async () => {
          const corruptedPath = path.join(__dirname, '../../fixtures/media/corrupted-fixable/bad-header.mp3');
          const outputPath = await createTempFile('mp3');
          tempFiles.push(outputPath);

          const result = await converter.convert({
            inputPath: corruptedPath,
            outputPath,
            targetFormat: 'mp3',
            options: {
              skipDamagedFrames: true,
              fixHeaders: true
            }
          });

          expect(result.success).toBe(true);
        });

        it('debe recuperar video truncado', async () => {
          const truncatedPath = path.join(__dirname, '../../fixtures/media/corrupted-fixable/truncated.avi');
          const outputPath = await createTempFile('mp4');
          tempFiles.push(outputPath);

          const result = await converter.convert({
            inputPath: truncatedPath,
            outputPath,
            targetFormat: 'mp4',
            options: {
              stopAtFirstError: false,
              recoverTruncated: true
            }
          });

          expect(result.success).toBe(true);
          expect(result.metadata?.recoveredDuration).toBeGreaterThan(0);
        });
      });

      describe('Media insubsanable', () => {
        it('debe fallar con archivo completamente corrupto', async () => {
          const corruptedPath = path.join(__dirname, '../../fixtures/media/corrupted-unfixable/severe-corruption.mp4');
          const outputPath = await createTempFile('avi');
          tempFiles.push(outputPath);

          const result = await converter.convert({
            inputPath: corruptedPath,
            outputPath,
            targetFormat: 'avi'
          });

          expect(result.success).toBe(false);
          expect(result.error).toContain('corrupto');
        });

        it('debe fallar con archivo encriptado DRM', async () => {
          const drmPath = path.join(__dirname, '../../fixtures/media/corrupted-unfixable/drm-protected.m4v');
          const outputPath = await createTempFile('mp4');
          tempFiles.push(outputPath);

          const result = await converter.convert({
            inputPath: drmPath,
            outputPath,
            targetFormat: 'mp4'
          });

          expect(result.success).toBe(false);
          expect(result.error).toContain('DRM');
        });
      });
    });

    describe('Validaciones y lÃ­mites de media', () => {
      it('debe rechazar videos que excedan duraciÃ³n mÃ¡xima', async () => {
        const longVideoPath = path.join(__dirname, '../../fixtures/media/valid/long-video.mp4');
        const outputPath = await createTempFile('avi');
        tempFiles.push(outputPath);

        const converterWithLimit = new AncloraNexus({
          maxVideoDuration: 300 // 5 minutos
        });

        const result = await converterWithLimit.convert({
          inputPath: longVideoPath,
          outputPath,
          targetFormat: 'avi'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('duraciÃ³n mÃ¡xima');
      });

      it('debe manejar lÃ­mites de resoluciÃ³n', async () => {
        const video4kPath = path.join(__dirname, '../../fixtures/media/valid/test-video-4k.mp4');
        const outputPath = await createTempFile('mp4');
        tempFiles.push(outputPath);

        const converterWithLimit = new AncloraNexus({
          maxVideoResolution: '1920x1080'
        });

        const result = await converterWithLimit.convert({
          inputPath: video4kPath,
          outputPath,
          targetFormat: 'mp4',
          options: {
            autoDownscale: true
          }
        });

        expect(result.success).toBe(true);
        
        const metadata = await getVideoMetadata(outputPath);
        expect(metadata.width).toBeLessThanOrEqual(1920);
        expect(metadata.height).toBeLessThanOrEqual(1080);
      });
    });
  });
});

// Funciones auxiliares para obtener metadata
async function getAudioMetadata(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else {
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        resolve({
          format: metadata.format.format_name,
          duration: metadata.format.duration,
          bitrate: metadata.format.bit_rate,
          sampleRate: audioStream?.sample_rate,
          channels: audioStream?.channels,
          codec: audioStream?.codec_name,
          bitsPerSample: audioStream?.bits_per_sample,
          hasVideo: metadata.streams.some(s => s.codec_type === 'video')
        });
      }
    });
  });
}

async function getVideoMetadata(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          format: metadata.format.format_name,
          duration: metadata.format.duration,
          bitrate: metadata.format.bit_rate,
          width: videoStream?.width,
          height: videoStream?.height,
          fps: eval(videoStream?.r_frame_rate || '0'),
          codec: videoStream?.codec_name,
          pixelFormat: videoStream?.pix_fmt
        });
      }
    });
  });
}
