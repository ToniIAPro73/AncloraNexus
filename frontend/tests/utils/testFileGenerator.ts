import fs from 'fs/promises';
import path from 'path';

export interface TestFiles {
  // Images
  jpg: string;
  png: string;
  gif: string;
  webp: string;
  largeImage: string;
  corruptedImage: string;

  // Documents
  pdf: string;
  docx: string;
  txt: string;
  protectedPdf: string;
  structuredPdf: string;
  formattedDocx: string;

  // Audio
  mp3: string;
  wav: string;
  flac: string;
  highQualityAudio: string;

  // Video
  mp4: string;
  avi: string;
  largeVideo: string;

  // E-books
  epub: string;
  mobi: string;
  ebookPdf: string;

  // Large files for testing limits
  largeFile: string;
}

const TEST_FILES_DIR = path.join(process.cwd(), 'tests', 'fixtures');

export async function createTestFiles(): Promise<TestFiles> {
  // Crear directorio de fixtures si no existe
  await fs.mkdir(TEST_FILES_DIR, { recursive: true });

  const testFiles: TestFiles = {
    // Images
    jpg: await createTestImage('test-image.jpg', 'jpeg'),
    png: await createTestImage('test-image.png', 'png'),
    gif: await createTestImage('test-image.gif', 'gif'),
    webp: await createTestImage('test-image.webp', 'webp'),
    largeImage: await createLargeTestImage('large-image.jpg'),
    corruptedImage: await createCorruptedFile('corrupted.jpg'),

    // Documents
    pdf: await createTestPDF('test-document.pdf'),
    docx: await createTestDOCX('test-document.docx'),
    txt: await createTestTXT('test-document.txt'),
    protectedPdf: await createProtectedPDF('protected.pdf', 'testpassword123'),
    structuredPdf: await createStructuredPDF('structured.pdf'),
    formattedDocx: await createFormattedDOCX('formatted.docx'),

    // Audio
    mp3: await createTestAudio('test-audio.mp3', 'mp3'),
    wav: await createTestAudio('test-audio.wav', 'wav'),
    flac: await createTestAudio('test-audio.flac', 'flac'),
    highQualityAudio: await createHighQualityAudio('hq-audio.wav'),

    // Video
    mp4: await createTestVideo('test-video.mp4', 'mp4'),
    avi: await createTestVideo('test-video.avi', 'avi'),
    largeVideo: await createLargeTestVideo('large-video.mp4'),

    // E-books
    epub: await createTestEPUB('test-book.epub'),
    mobi: await createTestMOBI('test-book.mobi'),
    ebookPdf: await createEbookPDF('ebook.pdf'),

    // Large files
    largeFile: await createLargeFile('large-file.pdf', 100 * 1024 * 1024) // 100MB
  };

  return testFiles;
}

export async function cleanupTestFiles(testFiles: TestFiles): Promise<void> {
  const filePaths = Object.values(testFiles);
  
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignorar errores si el archivo no existe
      console.warn(`Could not delete test file: ${filePath}`);
    }
  }

  try {
    await fs.rmdir(TEST_FILES_DIR);
  } catch (error) {
    // Directorio puede no estar vacío o no existir
  }
}

// Funciones auxiliares para crear archivos de prueba

async function createTestImage(filename: string, format: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear una imagen simple de 100x100 píxeles
  const imageData = createSimpleImageData(100, 100, format);
  await fs.writeFile(filePath, imageData);
  
  return filePath;
}

async function createLargeTestImage(filename: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear una imagen grande de 4000x3000 píxeles
  const imageData = createSimpleImageData(4000, 3000, 'jpeg');
  await fs.writeFile(filePath, imageData);
  
  return filePath;
}

async function createTestPDF(filename: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear un PDF simple con contenido de prueba
  const pdfContent = createSimplePDFContent();
  await fs.writeFile(filePath, pdfContent);
  
  return filePath;
}

async function createTestDOCX(filename: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear un DOCX simple
  const docxContent = createSimpleDOCXContent();
  await fs.writeFile(filePath, docxContent);
  
  return filePath;
}

async function createTestTXT(filename: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  const content = `Test Document
  
This is a test document for conversion testing.
It contains multiple lines and paragraphs.

Features to test:
- Text formatting
- Line breaks
- Special characters: áéíóú ñ ¿¡
- Numbers: 123456789
- Symbols: @#$%^&*()

End of test document.`;

  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

async function createTestAudio(filename: string, format: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear un archivo de audio simple (tono de 440Hz por 3 segundos)
  const audioData = createSimpleAudioData(format, 3);
  await fs.writeFile(filePath, audioData);
  
  return filePath;
}

async function createTestVideo(filename: string, format: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear un video simple (5 segundos, 720p)
  const videoData = createSimpleVideoData(format, 5, 1280, 720);
  await fs.writeFile(filePath, videoData);
  
  return filePath;
}

async function createTestEPUB(filename: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear un EPUB simple con estructura básica
  const epubContent = createSimpleEPUBContent();
  await fs.writeFile(filePath, epubContent);
  
  return filePath;
}

async function createCorruptedFile(filename: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear un archivo con datos corruptos
  const corruptedData = Buffer.from('This is not a valid image file content');
  await fs.writeFile(filePath, corruptedData);
  
  return filePath;
}

async function createProtectedPDF(filename: string, password: string): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear un PDF protegido con contraseña
  const protectedPDFContent = createProtectedPDFContent(password);
  await fs.writeFile(filePath, protectedPDFContent);
  
  return filePath;
}

async function createLargeFile(filename: string, sizeInBytes: number): Promise<string> {
  const filePath = path.join(TEST_FILES_DIR, filename);
  
  // Crear un archivo grande con contenido repetitivo
  const chunkSize = 1024 * 1024; // 1MB chunks
  const chunk = Buffer.alloc(chunkSize, 'A');
  
  const fileHandle = await fs.open(filePath, 'w');
  
  let written = 0;
  while (written < sizeInBytes) {
    const remainingBytes = sizeInBytes - written;
    const writeSize = Math.min(chunkSize, remainingBytes);
    
    await fileHandle.write(chunk, 0, writeSize);
    written += writeSize;
  }
  
  await fileHandle.close();
  return filePath;
}

// Funciones para crear contenido de archivos específicos

function createSimpleImageData(width: number, height: number, format: string): Buffer {
  // Crear datos de imagen simple (placeholder)
  // En una implementación real, usarías una librería como sharp o canvas
  const headerSize = 100;
  const pixelData = width * height * 3; // RGB
  const totalSize = headerSize + pixelData;
  
  const buffer = Buffer.alloc(totalSize);
  
  // Escribir header simple según formato
  if (format === 'jpeg') {
    buffer.write('\xFF\xD8\xFF\xE0', 0, 'binary'); // JPEG magic number
  } else if (format === 'png') {
    buffer.write('\x89PNG\r\n\x1A\n', 0, 'binary'); // PNG magic number
  }
  
  // Llenar con datos de píxeles (patrón simple)
  for (let i = headerSize; i < totalSize; i += 3) {
    buffer[i] = Math.floor(Math.random() * 256);     // R
    buffer[i + 1] = Math.floor(Math.random() * 256); // G
    buffer[i + 2] = Math.floor(Math.random() * 256); // B
  }
  
  return buffer;
}

function createSimplePDFContent(): Buffer {
  // Crear un PDF mínimo válido
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF Content) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000189 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
284
%%EOF`;

  return Buffer.from(pdfContent);
}

function createSimpleDOCXContent(): Buffer {
  // Crear un DOCX mínimo (ZIP con estructura XML)
  // En una implementación real, usarías una librería como docx
  const content = 'Test DOCX content for conversion testing';
  return Buffer.from(content);
}

function createSimpleAudioData(format: string, durationSeconds: number): Buffer {
  // Crear datos de audio simple
  const sampleRate = 44100;
  const samples = sampleRate * durationSeconds;
  const headerSize = 44; // WAV header
  const dataSize = samples * 2; // 16-bit samples
  
  const buffer = Buffer.alloc(headerSize + dataSize);
  
  // WAV header
  if (format === 'wav') {
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
  }
  
  // Generar tono de 440Hz
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 32767;
    buffer.writeInt16LE(sample, headerSize + i * 2);
  }
  
  return buffer;
}

function createSimpleVideoData(format: string, durationSeconds: number, width: number, height: number): Buffer {
  // Crear datos de video simple (placeholder)
  // En una implementación real, usarías ffmpeg o similar
  const frameRate = 30;
  const frames = frameRate * durationSeconds;
  const frameSize = width * height * 3; // RGB
  const totalSize = 1000 + frames * frameSize; // Header + frames
  
  return Buffer.alloc(totalSize, 0);
}

function createSimpleEPUBContent(): Buffer {
  // Crear un EPUB mínimo (ZIP con estructura)
  // En una implementación real, usarías una librería como epub-gen
  const content = `Test EPUB content
  
Chapter 1: Introduction
This is a test e-book for conversion testing.

Chapter 2: Content
More test content here.

The End.`;
  
  return Buffer.from(content);
}

function createProtectedPDFContent(password: string): Buffer {
  // Crear un PDF protegido (simplificado)
  const content = createSimplePDFContent();
  // En una implementación real, aplicarías encriptación con la contraseña
  return content;
}

function createHighQualityAudio(filename: string): Promise<string> {
  // Crear audio de alta calidad (96kHz, 24-bit)
  return createTestAudio(filename, 'wav');
}

function createStructuredPDF(filename: string): Promise<string> {
  // Crear PDF con estructura (headings, TOC, etc.)
  return createTestPDF(filename);
}

function createFormattedDOCX(filename: string): Promise<string> {
  // Crear DOCX con formato complejo
  return createTestDOCX(filename);
}

function createEbookPDF(filename: string): Promise<string> {
  // Crear PDF optimizado para e-book
  return createTestPDF(filename);
}

function createTestMOBI(filename: string): Promise<string> {
  // Crear archivo MOBI de prueba
  return createTestEPUB(filename); // Placeholder
}

function createLargeTestVideo(filename: string): Promise<string> {
  // Crear video grande para pruebas de timeout
  return createTestVideo(filename, 'mp4');
}

