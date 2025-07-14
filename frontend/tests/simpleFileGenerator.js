#!/usr/bin/env node

/**
 * Generador Simplificado de Archivos de Prueba
 * 
 * Genera archivos de prueba sin dependencias nativas para testing
 * del conversor universal en cualquier entorno.
 */

const fs = require('fs').promises;
const path = require('path');

const TEST_FILES_DIR = path.join(__dirname, 'universal-test-files');

// Contenido de prueba para diferentes tipos
const TEST_CONTENT = {
  simple_text: 'Este es un archivo de texto simple para pruebas de conversión.',
  
  formatted_text: `# Documento de Prueba

## Introducción
Este documento contiene **texto formateado** para probar conversiones.

### Lista de elementos:
- Elemento 1 con **negrita**
- Elemento 2 con *cursiva*
- Elemento 3 con \`código\`

### Tabla de ejemplo:
| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Dato 1    | Dato 2    | Dato 3    |
| Dato 4    | Dato 5    | Dato 6    |

### Caracteres especiales:
áéíóú ñ ¿¡ «» ‹› €£$¥ ©®™

### Final del documento
Este es el final del documento de prueba.`,

  multilingual_text: `# Documento Multiidioma

## Español
Este texto contiene caracteres especiales: áéíóú ñ ¿¡

## English
This text contains special characters: àèìòù ç

## Français
Ce texte contient des caractères spéciaux: âêîôû ç œæ

## Deutsch
Dieser Text enthält Sonderzeichen: äöü ß

## 中文
这个文档包含中文字符测试

## العربية
هذا النص يحتوي على أحرف عربية

## Русский
Этот текст содержит русские символы`,

  technical_content: `# Documento Técnico

## Código JavaScript:
\`\`\`javascript
function convertFile(input, output) {
    try {
        const result = processConversion(input, output);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
\`\`\`

## Fórmulas matemáticas:
- E = mc²
- a² + b² = c²
- ∑(i=1 to n) i = n(n+1)/2

## Datos estructurados:
{
  "conversion": {
    "input": "document.pdf",
    "output": "document.docx",
    "status": "completed"
  }
}

## URLs y enlaces:
- https://example.com/api/convert
- mailto:test@example.com
- ftp://files.example.com/uploads/`
};

class SimpleFileGenerator {
  constructor() {
    this.outputDir = TEST_FILES_DIR;
    this.generatedFiles = [];
  }

  async initialize() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log(`📁 Directorio de pruebas creado: ${this.outputDir}`);
    } catch (error) {
      console.error('Error creando directorio:', error);
    }
  }

  async generateAllFiles() {
    console.log('🚀 Generando archivos de prueba para conversor universal...\n');
    
    // Generar archivos de texto
    await this.generateTextFiles();
    
    // Generar archivos de imagen simulados
    await this.generateImageFiles();
    
    // Generar archivos de documento simulados
    await this.generateDocumentFiles();
    
    // Generar archivos de audio simulados
    await this.generateAudioFiles();
    
    // Generar archivos de video simulados
    await this.generateVideoFiles();
    
    // Generar archivos problemáticos
    await this.generateProblematicFiles();
    
    // Generar manifiesto
    await this.generateManifest();
    
    console.log(`\n✅ Generación completa. Total: ${this.generatedFiles.length} archivos`);
    return this.generatedFiles;
  }

  async generateTextFiles() {
    console.log('📝 Generando archivos de texto...');
    
    // TXT simples
    await this.createTextFile('simple.txt', TEST_CONTENT.simple_text);
    await this.createTextFile('formatted.txt', TEST_CONTENT.formatted_text);
    await this.createTextFile('multilingual.txt', TEST_CONTENT.multilingual_text);
    await this.createTextFile('technical.txt', TEST_CONTENT.technical_content);
    
    // Markdown
    await this.createTextFile('document.md', TEST_CONTENT.formatted_text);
    
    // Archivos de diferentes tamaños
    await this.createTextFile('tiny.txt', 'A');
    await this.createTextFile('small.txt', TEST_CONTENT.simple_text.repeat(10));
    await this.createTextFile('medium.txt', TEST_CONTENT.formatted_text.repeat(50));
    await this.createTextFile('large.txt', TEST_CONTENT.multilingual_text.repeat(200));
    
    // Archivo vacío
    await this.createTextFile('empty.txt', '');
  }

  async generateImageFiles() {
    console.log('🖼️  Generando archivos de imagen simulados...');
    
    // Crear headers de imagen válidos con datos mínimos
    await this.createImageFile('test_small.jpg', 'jpeg', 300, 200);
    await this.createImageFile('test_medium.jpg', 'jpeg', 1920, 1080);
    await this.createImageFile('test_large.jpg', 'jpeg', 4000, 3000);
    
    await this.createImageFile('test_small.png', 'png', 300, 200);
    await this.createImageFile('test_medium.png', 'png', 1920, 1080);
    
    await this.createImageFile('test_small.gif', 'gif', 300, 200);
    await this.createImageFile('test_small.webp', 'webp', 300, 200);
    
    // Imagen de 1 pixel
    await this.createImageFile('pixel.png', 'png', 1, 1);
  }

  async generateDocumentFiles() {
    console.log('📄 Generando archivos de documento simulados...');
    
    // PDFs simulados
    await this.createPDFFile('simple.pdf', TEST_CONTENT.simple_text);
    await this.createPDFFile('formatted.pdf', TEST_CONTENT.formatted_text);
    await this.createPDFFile('multilingual.pdf', TEST_CONTENT.multilingual_text);
    
    // HTML
    await this.createHTMLFile('document.html', TEST_CONTENT.formatted_text);
    
    // CSV
    await this.createCSVFile('data.csv');
  }

  async generateAudioFiles() {
    console.log('🎵 Generando archivos de audio simulados...');
    
    await this.createAudioFile('test_short.wav', 'wav', 10);
    await this.createAudioFile('test_medium.wav', 'wav', 180);
    
    await this.createAudioFile('test_short.mp3', 'mp3', 10);
    await this.createAudioFile('test_medium.mp3', 'mp3', 180);
    
    await this.createAudioFile('test_hq.flac', 'flac', 60);
  }

  async generateVideoFiles() {
    console.log('🎬 Generando archivos de video simulados...');
    
    await this.createVideoFile('test_clip.mp4', 'mp4', 10, '720p');
    await this.createVideoFile('test_short.mp4', 'mp4', 60, '1080p');
    
    await this.createVideoFile('test_clip.avi', 'avi', 10, '720p');
  }

  async generateProblematicFiles() {
    console.log('⚠️  Generando archivos problemáticos...');
    
    // Archivo corrupto
    await this.createCorruptedFile('corrupted.jpg', 'image');
    
    // Archivo con extensión incorrecta
    await this.createMislabeledFile('fake_image.jpg', 'text');
    
    // Archivo con nombre problemático
    await this.createTextFile('archivo con espacios & símbolos (test).txt', 'Contenido de prueba');
    
    // Archivo binario aleatorio
    await this.createRandomBinaryFile('random.bin', 1024);
  }

  // Métodos auxiliares para crear archivos específicos

  async createTextFile(filename, content) {
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    this.generatedFiles.push({ filename, type: 'text', size: Buffer.byteLength(content, 'utf-8') });
    console.log(`  ✅ ${filename}`);
  }

  async createImageFile(filename, format, width, height) {
    const filePath = path.join(this.outputDir, filename);
    let header;
    
    switch (format) {
      case 'jpeg':
        header = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
        break;
      case 'png':
        header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        break;
      case 'gif':
        header = Buffer.from('GIF89a', 'ascii');
        break;
      case 'webp':
        header = Buffer.from('RIFF', 'ascii');
        break;
      default:
        header = Buffer.alloc(10);
    }
    
    // Simular datos de imagen
    const imageSize = Math.max(1000, width * height / 100); // Tamaño aproximado
    const imageData = Buffer.alloc(imageSize);
    
    // Llenar con datos simulados
    for (let i = 0; i < imageSize; i++) {
      imageData[i] = Math.floor(Math.random() * 256);
    }
    
    const fullBuffer = Buffer.concat([header, imageData]);
    await fs.writeFile(filePath, fullBuffer);
    
    this.generatedFiles.push({ 
      filename, 
      type: 'image', 
      format, 
      width, 
      height, 
      size: fullBuffer.length 
    });
    console.log(`  ✅ ${filename} (${width}x${height})`);
  }

  async createPDFFile(filename, content) {
    const filePath = path.join(this.outputDir, filename);
    
    // PDF mínimo válido
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
/Length ${content.length + 50}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${content.substring(0, 100).replace(/[()\\]/g, '\\$&')}) Tj
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
${300 + content.length}
%%EOF`;

    await fs.writeFile(filePath, pdfContent);
    this.generatedFiles.push({ 
      filename, 
      type: 'document', 
      format: 'pdf', 
      size: Buffer.byteLength(pdfContent) 
    });
    console.log(`  ✅ ${filename}`);
  }

  async createHTMLFile(filename, content) {
    const filePath = path.join(this.outputDir, filename);
    
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento de Prueba</title>
</head>
<body>
    <div class="content">
        ${content.replace(/\n/g, '<br>')}
    </div>
</body>
</html>`;

    await fs.writeFile(filePath, htmlContent, 'utf-8');
    this.generatedFiles.push({ 
      filename, 
      type: 'document', 
      format: 'html', 
      size: Buffer.byteLength(htmlContent, 'utf-8') 
    });
    console.log(`  ✅ ${filename}`);
  }

  async createCSVFile(filename) {
    const filePath = path.join(this.outputDir, filename);
    
    const csvContent = `Nombre,Edad,Ciudad,Email
Juan Pérez,30,Madrid,juan@example.com
María García,25,Barcelona,maria@example.com
Carlos López,35,Valencia,carlos@example.com
Ana Martín,28,Sevilla,ana@example.com
Luis Rodríguez,32,Bilbao,luis@example.com`;

    await fs.writeFile(filePath, csvContent, 'utf-8');
    this.generatedFiles.push({ 
      filename, 
      type: 'document', 
      format: 'csv', 
      size: Buffer.byteLength(csvContent, 'utf-8') 
    });
    console.log(`  ✅ ${filename}`);
  }

  async createAudioFile(filename, format, duration) {
    const filePath = path.join(this.outputDir, filename);
    let header;
    
    switch (format) {
      case 'wav':
        header = Buffer.from('RIFF', 'ascii');
        const wavHeader = Buffer.alloc(44);
        wavHeader.write('RIFF', 0);
        wavHeader.write('WAVE', 8);
        wavHeader.write('fmt ', 12);
        break;
      case 'mp3':
        header = Buffer.from([0xFF, 0xFB, 0x90, 0x00]);
        break;
      case 'flac':
        header = Buffer.from('fLaC', 'ascii');
        break;
      default:
        header = Buffer.alloc(10);
    }
    
    // Simular datos de audio
    const audioSize = duration * 16000; // Aproximado
    const audioData = Buffer.alloc(audioSize);
    
    for (let i = 0; i < audioSize; i++) {
      audioData[i] = Math.floor(Math.random() * 256);
    }
    
    const fullBuffer = Buffer.concat([header, audioData]);
    await fs.writeFile(filePath, fullBuffer);
    
    this.generatedFiles.push({ 
      filename, 
      type: 'audio', 
      format, 
      duration, 
      size: fullBuffer.length 
    });
    console.log(`  ✅ ${filename} (${duration}s)`);
  }

  async createVideoFile(filename, format, duration, resolution) {
    const filePath = path.join(this.outputDir, filename);
    let header;
    
    switch (format) {
      case 'mp4':
        // MP4 box structure
        header = Buffer.alloc(32);
        header.writeUInt32BE(32, 0); // box size
        header.write('ftyp', 4);
        header.write('isom', 8);
        break;
      case 'avi':
        header = Buffer.from('RIFF', 'ascii');
        const aviHeader = Buffer.alloc(12);
        aviHeader.write('RIFF', 0);
        aviHeader.write('AVI ', 8);
        header = aviHeader;
        break;
      default:
        header = Buffer.alloc(20);
    }
    
    // Simular datos de video
    const videoSize = duration * 100000; // Aproximado
    const videoData = Buffer.alloc(videoSize);
    
    for (let i = 0; i < videoSize; i++) {
      videoData[i] = Math.floor(Math.random() * 256);
    }
    
    const fullBuffer = Buffer.concat([header, videoData]);
    await fs.writeFile(filePath, fullBuffer);
    
    this.generatedFiles.push({ 
      filename, 
      type: 'video', 
      format, 
      duration, 
      resolution, 
      size: fullBuffer.length 
    });
    console.log(`  ✅ ${filename} (${duration}s, ${resolution})`);
  }

  async createCorruptedFile(filename, type) {
    const filePath = path.join(this.outputDir, filename);
    
    // Crear archivo con header válido pero datos corruptos
    let header;
    if (type === 'image') {
      header = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
    } else {
      header = Buffer.from('%PDF-1.4', 'ascii');
    }
    
    // Datos corruptos
    const corruptedData = Buffer.alloc(500);
    for (let i = 0; i < 500; i++) {
      corruptedData[i] = Math.floor(Math.random() * 256);
    }
    
    const fullBuffer = Buffer.concat([header, corruptedData]);
    await fs.writeFile(filePath, fullBuffer);
    
    this.generatedFiles.push({ 
      filename, 
      type: 'problematic', 
      issue: 'corrupted', 
      size: fullBuffer.length 
    });
    console.log(`  ✅ ${filename} (corrupted)`);
  }

  async createMislabeledFile(filename, actualType) {
    const filePath = path.join(this.outputDir, filename);
    
    let content;
    if (actualType === 'text') {
      content = Buffer.from('Este es un archivo de texto con extensión incorrecta', 'utf-8');
    } else {
      content = Buffer.alloc(100, 0x42); // Datos binarios
    }
    
    await fs.writeFile(filePath, content);
    
    this.generatedFiles.push({ 
      filename, 
      type: 'problematic', 
      issue: 'mislabeled', 
      actualType, 
      size: content.length 
    });
    console.log(`  ✅ ${filename} (mislabeled as ${actualType})`);
  }

  async createRandomBinaryFile(filename, size) {
    const filePath = path.join(this.outputDir, filename);
    
    const data = Buffer.alloc(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }
    
    await fs.writeFile(filePath, data);
    
    this.generatedFiles.push({ 
      filename, 
      type: 'binary', 
      size 
    });
    console.log(`  ✅ ${filename} (${size} bytes)`);
  }

  async generateManifest() {
    const manifest = {
      generated_at: new Date().toISOString(),
      total_files: this.generatedFiles.length,
      categories: {
        text: this.generatedFiles.filter(f => f.type === 'text').length,
        image: this.generatedFiles.filter(f => f.type === 'image').length,
        document: this.generatedFiles.filter(f => f.type === 'document').length,
        audio: this.generatedFiles.filter(f => f.type === 'audio').length,
        video: this.generatedFiles.filter(f => f.type === 'video').length,
        problematic: this.generatedFiles.filter(f => f.type === 'problematic').length,
        binary: this.generatedFiles.filter(f => f.type === 'binary').length
      },
      files: this.generatedFiles,
      test_scenarios: [
        'Conversiones básicas de texto (TXT ↔ PDF ↔ HTML)',
        'Conversiones de imagen (JPG ↔ PNG ↔ WebP)',
        'Conversiones de documento (PDF ↔ TXT ↔ HTML)',
        'Conversiones de audio (WAV ↔ MP3 ↔ FLAC)',
        'Conversiones de video (MP4 ↔ AVI)',
        'Manejo de archivos corruptos',
        'Manejo de archivos con extensión incorrecta',
        'Archivos de diferentes tamaños',
        'Contenido multiidioma',
        'Caracteres especiales'
      ]
    };

    const manifestPath = path.join(this.outputDir, 'test_manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`\n📋 Manifiesto generado: ${manifestPath}`);
  }

  async cleanup() {
    try {
      const files = await fs.readdir(this.outputDir);
      for (const file of files) {
        await fs.unlink(path.join(this.outputDir, file));
      }
      await fs.rmdir(this.outputDir);
      console.log('🧹 Archivos de prueba limpiados');
    } catch (error) {
      console.warn('Advertencia al limpiar archivos:', error.message);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const generator = new SimpleFileGenerator();
  
  generator.initialize()
    .then(() => generator.generateAllFiles())
    .then((files) => {
      console.log('\n🎉 ¡Generación de archivos de prueba completada!');
      console.log(`📁 Archivos guardados en: ${TEST_FILES_DIR}`);
      console.log(`📊 Total de archivos: ${files.length}`);
      
      // Mostrar resumen por categoría
      const categories = {};
      files.forEach(file => {
        categories[file.type] = (categories[file.type] || 0) + 1;
      });
      
      console.log('\n📈 Resumen por categoría:');
      Object.entries(categories).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} archivos`);
      });
    })
    .catch(error => {
      console.error('❌ Error durante la generación:', error);
      process.exit(1);
    });
}

module.exports = { SimpleFileGenerator, TEST_CONTENT };

