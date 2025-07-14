#!/usr/bin/env node

/**
 * Generador de Archivos Reales para Testing
 * 
 * Este script genera archivos reales con contenido variado para probar
 * todas las conversiones posibles y detectar problemas antes del lanzamiento.
 */

const fs = require('fs').promises;
const path = require('path');
const { createCanvas } = require('canvas');

const TEST_FILES_DIR = path.join(__dirname, 'real-test-files');

// Configuración de archivos de prueba
const FILE_CONFIGS = {
  images: {
    tiny: { width: 32, height: 32, size: '< 5KB' },
    small: { width: 300, height: 200, size: '< 50KB' },
    medium: { width: 1920, height: 1080, size: '< 500KB' },
    large: { width: 4000, height: 3000, size: '< 5MB' },
    huge: { width: 8000, height: 6000, size: '< 20MB' }
  },
  documents: {
    minimal: { pages: 1, words: 100, size: '< 50KB' },
    short: { pages: 5, words: 1000, size: '< 200KB' },
    medium: { pages: 20, words: 5000, size: '< 1MB' },
    long: { pages: 100, words: 25000, size: '< 5MB' },
    massive: { pages: 500, words: 125000, size: '< 25MB' }
  },
  audio: {
    short: { duration: 10, quality: 'low', size: '< 500KB' },
    medium: { duration: 180, quality: 'medium', size: '< 5MB' },
    long: { duration: 600, quality: 'high', size: '< 20MB' },
    hq: { duration: 300, quality: 'lossless', size: '< 50MB' }
  },
  video: {
    clip: { duration: 10, resolution: '480p', size: '< 10MB' },
    short: { duration: 60, resolution: '720p', size: '< 50MB' },
    medium: { duration: 300, resolution: '1080p', size: '< 200MB' },
    long: { duration: 600, resolution: '1080p', size: '< 500MB' }
  }
};

// Contenido de prueba variado
const TEST_CONTENT = {
  texts: {
    simple: 'Este es un texto simple para pruebas de conversión.',
    
    multilingual: `
# Documento Multiidioma / Multilingual Document

## Español
Este documento contiene texto en múltiples idiomas para probar la conversión.
Incluye caracteres especiales: áéíóú ñ ¿¡ «» 

## English  
This document contains text in multiple languages to test conversion.
Special characters: àèìòù ç €£$¥

## Français
Ce document contient du texte en plusieurs langues pour tester la conversion.
Caractères spéciaux: âêîôû ç œæ

## Deutsch
Dieses Dokument enthält Text in mehreren Sprachen zum Testen der Konvertierung.
Sonderzeichen: äöü ß €

## 中文
这个文档包含多种语言的文本来测试转换功能。
特殊字符：中文汉字测试

## العربية
تحتوي هذه الوثيقة على نص بلغات متعددة لاختبار التحويل.
أحرف خاصة: العربية اختبار

## Русский
Этот документ содержит текст на нескольких языках для тестирования конвертации.
Специальные символы: русский тест
`,

    formatted: `
# Documento con Formato Complejo

## Introducción
Este documento contiene **formato complejo** para probar la *preservación* de estilos.

### Lista con viñetas:
- Elemento 1 con **negrita**
- Elemento 2 con *cursiva*
- Elemento 3 con ~~tachado~~
- Elemento 4 con \`código\`

### Lista numerada:
1. Primer elemento
2. Segundo elemento con [enlace](https://example.com)
3. Tercer elemento con imagen: ![alt text](image.jpg)

### Tabla:
| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Dato 1    | Dato 2    | Dato 3    |
| Dato 4    | Dato 5    | Dato 6    |

### Código:
\`\`\`javascript
function test() {
    console.log("Código de prueba");
    return true;
}
\`\`\`

### Cita:
> Esta es una cita importante que debe preservarse
> en múltiples líneas para probar el formato.

### Texto con formato especial:
- **Negrita importante**
- *Cursiva elegante*
- ***Negrita y cursiva***
- \`código inline\`
- ~~Texto tachado~~

### Caracteres especiales:
© ® ™ § ¶ † ‡ • … ‰ ′ ″ ‹ › « » ¡ ¿ ¢ £ ¤ ¥ ¦ § ¨ © ª « ¬ ® ¯ ° ± ² ³ ´ µ ¶ · ¸ ¹ º » ¼ ½ ¾ ¿

### Emojis:
🚀 📄 🔄 ✅ ❌ ⚠️ 💡 🎯 📊 🔧 🎨 📱 💻 🌐 📈 📉 🔍 ⭐ 🎉 🔥
`,

    technical: `
# Documento Técnico de Prueba

## Especificaciones Técnicas

### Fórmulas Matemáticas:
- E = mc²
- a² + b² = c²
- ∫₀^∞ e^(-x²) dx = √π/2
- ∑(i=1 to n) i = n(n+1)/2

### Código de Programación:

#### JavaScript:
\`\`\`javascript
class ConversionEngine {
    constructor(options = {}) {
        this.options = { ...defaultOptions, ...options };
        this.queue = new Map();
    }
    
    async convert(file, targetFormat) {
        try {
            const result = await this.processFile(file, targetFormat);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
\`\`\`

#### Python:
\`\`\`python
import asyncio
from typing import Dict, Any, Optional

class FileConverter:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.supported_formats = {
            'image': ['jpg', 'png', 'webp', 'gif'],
            'document': ['pdf', 'docx', 'txt', 'md'],
            'audio': ['mp3', 'wav', 'flac', 'ogg'],
            'video': ['mp4', 'avi', 'mov', 'webm']
        }
    
    async def convert_file(self, input_path: str, output_format: str) -> Optional[str]:
        """Convert file to specified format"""
        try:
            # Validation logic here
            result = await self._process_conversion(input_path, output_format)
            return result
        except Exception as e:
            logger.error(f"Conversion failed: {e}")
            return None
\`\`\`

#### SQL:
\`\`\`sql
-- Consulta compleja para análisis de conversiones
SELECT 
    u.id as user_id,
    u.email,
    COUNT(c.id) as total_conversions,
    AVG(c.processing_time) as avg_processing_time,
    SUM(c.input_size) as total_input_size,
    SUM(c.output_size) as total_output_size,
    (SUM(c.output_size) / SUM(c.input_size)) as compression_ratio
FROM users u
LEFT JOIN conversions c ON u.id = c.user_id
WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND c.status = 'completed'
GROUP BY u.id, u.email
HAVING total_conversions > 10
ORDER BY total_conversions DESC, avg_processing_time ASC
LIMIT 100;
\`\`\`

### Diagramas ASCII:
\`\`\`
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   Upload    │───▶│  Validate   │───▶│   Convert   │
    │    File     │    │    File     │    │    File     │
    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   Check     │    │   Extract   │    │   Download  │
    │   Limits    │    │  Metadata   │    │   Result    │
    └─────────────┘    └─────────────┘    └─────────────┘
\`\`\`

### Datos Estructurados:
\`\`\`json
{
  "conversion_job": {
    "id": "conv_123456789",
    "user_id": "user_987654321",
    "input_file": {
      "name": "document.pdf",
      "size": 2048576,
      "type": "application/pdf",
      "checksum": "sha256:abc123..."
    },
    "output_format": "docx",
    "options": {
      "preserve_formatting": true,
      "extract_images": true,
      "quality": "high"
    },
    "status": "processing",
    "progress": 45,
    "estimated_completion": "2025-01-15T10:30:00Z",
    "metadata": {
      "pages": 25,
      "images": 8,
      "tables": 3,
      "fonts": ["Arial", "Times New Roman", "Calibri"]
    }
  }
}
\`\`\`

### Configuración YAML:
\`\`\`yaml
conversion_engine:
  max_file_size: 100MB
  timeout: 300s
  concurrent_jobs: 5
  
  formats:
    image:
      - jpg: { quality: [1-100], max_dimension: 8000 }
      - png: { compression: [0-9], transparency: true }
      - webp: { quality: [1-100], lossless: true }
    
    document:
      - pdf: { version: "1.7", encryption: optional }
      - docx: { compatibility: "2016+", macros: false }
    
  quality_presets:
    web: { compression: high, size_limit: 1MB }
    print: { compression: low, dpi: 300 }
    archive: { compression: lossless, metadata: preserve }
\`\`\`
`,

    problematic: `
# Documento con Contenido Problemático

## Caracteres Especiales y Unicode
- Emojis: 🚀📄🔄✅❌⚠️💡🎯📊🔧🎨📱💻🌐📈📉🔍⭐🎉🔥
- Símbolos matemáticos: ∑∏∫∂∆∇√∞≈≠≤≥±×÷∈∉⊂⊃∪∩
- Caracteres griegos: αβγδεζηθικλμνξοπρστυφχψω
- Caracteres cirílicos: абвгдежзийклмнопрстуфхцчшщъыьэюя
- Caracteres árabes: ابتثجحخدذرزسشصضطظعغفقكلمنهوي
- Caracteres chinos: 中文汉字测试一二三四五六七八九十
- Caracteres japoneses: ひらがなカタカナ漢字テスト
- Caracteres coreanos: 한글테스트가나다라마바사아자차카타파하

## Texto con Formato Extremo
**TEXTO EN MAYÚSCULAS CON NEGRITA**
*texto en minúsculas con cursiva*
***TEXTO CON NEGRITA Y CURSIVA***
~~texto tachado con línea~~
\`código con formato especial\`

## Líneas Muy Largas
Esta es una línea extremadamente larga que contiene muchísimo texto para probar cómo se comporta el sistema de conversión cuando se encuentra con líneas que exceden los límites normales de ancho y que podrían causar problemas de renderizado o procesamiento en algunos sistemas de conversión de documentos que no están preparados para manejar este tipo de contenido extenso sin saltos de línea apropiados.

## Espaciado    Irregular    y    Tabulaciones
Texto    con    espacios    múltiples
	Texto	con	tabulaciones
		Texto		con		tabulaciones		múltiples

## Caracteres de Control y Especiales
- Comillas: "dobles" 'simples' «francesas» „alemanas" 
- Guiones: - – — ― 
- Espacios especiales:   (no-break space)
- Caracteres invisibles: ­ (soft hyphen)

## URLs y Enlaces Complejos
- http://example.com/path?param=value&other=123#anchor
- https://subdomain.example-site.com:8080/very/long/path/to/resource.html?query=test&filter=active&sort=date&limit=100&offset=50#section-header
- mailto:test@example.com?subject=Test%20Subject&body=Test%20Body
- ftp://user:password@ftp.example.com/path/to/file.txt

## Código con Caracteres Especiales
\`\`\`javascript
// Código con caracteres problemáticos
const specialChars = "áéíóú ñ ¿¡ «» ‹› „" '' "" – — … † ‡ • ‰ ′ ″";
const unicodeTest = "🚀 Test with emojis 📄 and symbols ∑∏∫";
const regex = /[\\u0000-\\u001F\\u007F-\\u009F]/g; // Control characters
\`\`\`

## Listas Anidadas Complejas
1. Primer nivel
   1.1. Segundo nivel
       1.1.1. Tercer nivel
             1.1.1.1. Cuarto nivel
                   - Viñeta en cuarto nivel
                     - Viñeta en quinto nivel
                       * Asterisco en sexto nivel
                         + Plus en séptimo nivel

## Tabla con Contenido Complejo
| Columna con **formato** | Columna con *cursiva* | Columna con \`código\` |
|-------------------------|----------------------|----------------------|
| Celda con [enlace](http://example.com) | Celda con emoji 🚀 | Celda con "comillas" |
| Celda con<br>salto de línea | Celda con    espacios | Celda con ~~tachado~~ |
| Celda muy larga que contiene muchísimo texto para probar el comportamiento | Celda con números: 123,456.789 | Celda con símbolos: @#$%^&*() |

## Contenido Potencialmente Problemático
- Texto que parece HTML: <script>alert('test')</script>
- Texto que parece XML: <?xml version="1.0"?><root><element>value</element></root>
- Texto que parece JSON: {"key": "value", "number": 123, "boolean": true}
- Texto que parece CSS: .class { color: red; font-size: 16px; }
- Texto que parece SQL: SELECT * FROM users WHERE id = 1; DROP TABLE users;

## Final del Documento
Este es el final del documento de prueba con contenido problemático.
`
  },

  metadata: {
    ebook: {
      title: 'Libro de Prueba para Conversión',
      author: 'Sistema de Testing Anclora',
      isbn: '978-0-123456-78-9',
      language: 'es',
      publisher: 'Anclora Testing Suite',
      description: 'Este es un libro electrónico de prueba creado específicamente para validar el sistema de conversión de e-books.',
      subjects: ['Testing', 'Conversión', 'E-books', 'Calidad'],
      rights: '© 2025 Anclora Testing Suite. Todos los derechos reservados.'
    }
  }
};

class RealFileGenerator {
  constructor() {
    this.outputDir = TEST_FILES_DIR;
  }

  async initialize() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log(`📁 Directorio de pruebas creado: ${this.outputDir}`);
    } catch (error) {
      console.error('Error creando directorio:', error);
    }
  }

  // Generar todas las categorías de archivos
  async generateAllFiles() {
    console.log('🚀 Iniciando generación de archivos de prueba...\n');
    
    const results = {
      images: await this.generateImages(),
      documents: await this.generateDocuments(),
      audio: await this.generateAudio(),
      video: await this.generateVideo(),
      ebooks: await this.generateEbooks(),
      problematic: await this.generateProblematicFiles(),
      edge_cases: await this.generateEdgeCases()
    };

    await this.generateTestManifest(results);
    
    console.log('\n✅ Generación completa. Archivos creados:');
    Object.entries(results).forEach(([category, files]) => {
      console.log(`  ${category}: ${files.length} archivos`);
    });

    return results;
  }

  // Generar imágenes de diferentes tamaños y formatos
  async generateImages() {
    console.log('🖼️  Generando imágenes...');
    const images = [];

    for (const [size, config] of Object.entries(FILE_CONFIGS.images)) {
      // PNG con diferentes contenidos
      const pngPath = await this.createTestImage(
        `image_${size}.png`, 
        config.width, 
        config.height, 
        'png',
        this.getImageContent(size)
      );
      images.push(pngPath);

      // JPEG con diferentes calidades
      const jpegPath = await this.createTestImage(
        `image_${size}.jpg`, 
        config.width, 
        config.height, 
        'jpeg',
        this.getImageContent(size)
      );
      images.push(jpegPath);

      // WebP para pruebas de formato moderno
      if (size !== 'huge') { // WebP muy grandes pueden ser problemáticos
        const webpPath = await this.createTestImage(
          `image_${size}.webp`, 
          config.width, 
          config.height, 
          'webp',
          this.getImageContent(size)
        );
        images.push(webpPath);
      }
    }

    // Imágenes especiales
    images.push(await this.createTransparentPNG());
    images.push(await this.createAnimatedGIF());
    images.push(await this.createGrayscaleImage());
    images.push(await this.createHighContrastImage());

    return images;
  }

  // Generar documentos con contenido variado
  async generateDocuments() {
    console.log('📄 Generando documentos...');
    const documents = [];

    for (const [size, config] of Object.entries(FILE_CONFIGS.documents)) {
      // PDF con diferentes contenidos
      const pdfPath = await this.createTestPDF(
        `document_${size}.pdf`,
        config.pages,
        this.getDocumentContent(size, config.words)
      );
      documents.push(pdfPath);

      // TXT con diferentes encodings
      const txtPath = await this.createTestTXT(
        `document_${size}.txt`,
        this.getDocumentContent(size, config.words)
      );
      documents.push(txtPath);

      // Markdown con formato
      const mdPath = await this.createTestMarkdown(
        `document_${size}.md`,
        this.getDocumentContent(size, config.words)
      );
      documents.push(mdPath);
    }

    // Documentos especiales
    documents.push(await this.createPasswordProtectedPDF());
    documents.push(await this.createMultiLanguageDocument());
    documents.push(await this.createFormattedDocument());

    return documents;
  }

  // Generar archivos de audio
  async generateAudio() {
    console.log('🎵 Generando archivos de audio...');
    const audioFiles = [];

    for (const [type, config] of Object.entries(FILE_CONFIGS.audio)) {
      // WAV sin compresión
      const wavPath = await this.createTestWAV(
        `audio_${type}.wav`,
        config.duration,
        config.quality
      );
      audioFiles.push(wavPath);

      // MP3 con diferentes bitrates
      const mp3Path = await this.createTestMP3(
        `audio_${type}.mp3`,
        config.duration,
        config.quality
      );
      audioFiles.push(mp3Path);

      if (config.quality === 'lossless') {
        // FLAC para alta calidad
        const flacPath = await this.createTestFLAC(
          `audio_${type}.flac`,
          config.duration
        );
        audioFiles.push(flacPath);
      }
    }

    return audioFiles;
  }

  // Generar archivos de video
  async generateVideo() {
    console.log('🎬 Generando archivos de video...');
    const videoFiles = [];

    for (const [type, config] of Object.entries(FILE_CONFIGS.video)) {
      if (type === 'long') continue; // Evitar videos muy largos en testing inicial

      // MP4 con H.264
      const mp4Path = await this.createTestMP4(
        `video_${type}.mp4`,
        config.duration,
        config.resolution
      );
      videoFiles.push(mp4Path);

      // AVI para compatibilidad
      if (type === 'clip' || type === 'short') {
        const aviPath = await this.createTestAVI(
          `video_${type}.avi`,
          config.duration,
          config.resolution
        );
        videoFiles.push(aviPath);
      }
    }

    return videoFiles;
  }

  // Generar e-books
  async generateEbooks() {
    console.log('📚 Generando e-books...');
    const ebooks = [];

    // EPUB con diferentes estructuras
    ebooks.push(await this.createTestEPUB('simple_book.epub', 'simple'));
    ebooks.push(await this.createTestEPUB('complex_book.epub', 'complex'));
    ebooks.push(await this.createTestEPUB('multilingual_book.epub', 'multilingual'));

    // MOBI para Kindle
    ebooks.push(await this.createTestMOBI('kindle_book.mobi'));

    // PDF optimizado para e-book
    ebooks.push(await this.createEbookPDF('ebook_formatted.pdf'));

    return ebooks;
  }

  // Generar archivos problemáticos
  async generateProblematicFiles() {
    console.log('⚠️  Generando archivos problemáticos...');
    const problematic = [];

    // Archivos corruptos
    problematic.push(await this.createCorruptedFile('corrupted_image.jpg', 'image'));
    problematic.push(await this.createCorruptedFile('corrupted_document.pdf', 'document'));
    problematic.push(await this.createCorruptedFile('corrupted_audio.mp3', 'audio'));

    // Archivos con extensión incorrecta
    problematic.push(await this.createMislabeledFile('fake_image.jpg', 'text'));
    problematic.push(await this.createMislabeledFile('fake_pdf.pdf', 'image'));

    // Archivos vacíos
    problematic.push(await this.createEmptyFile('empty.txt'));
    problematic.push(await this.createEmptyFile('empty.pdf'));

    // Archivos con nombres problemáticos
    problematic.push(await this.createFileWithProblematicName());

    return problematic;
  }

  // Generar casos extremos
  async generateEdgeCases() {
    console.log('🔬 Generando casos extremos...');
    const edgeCases = [];

    // Archivo de 1 byte
    edgeCases.push(await this.createMinimalFile('minimal.txt', 1));

    // Archivo justo en el límite de tamaño
    edgeCases.push(await this.createFileAtSizeLimit('limit_test.txt', 10 * 1024 * 1024)); // 10MB

    // Imagen de 1x1 pixel
    edgeCases.push(await this.createTestImage('pixel.png', 1, 1, 'png', 'minimal'));

    // Documento con una sola palabra
    edgeCases.push(await this.createTestTXT('single_word.txt', 'palabra'));

    // Audio de 1 segundo
    edgeCases.push(await this.createTestWAV('one_second.wav', 1, 'low'));

    return edgeCases;
  }

  // Métodos auxiliares para crear archivos específicos

  async createTestImage(filename, width, height, format, contentType) {
    const filePath = path.join(this.outputDir, filename);
    
    try {
      // Usar canvas para crear imagen real
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Generar contenido según el tipo
      this.drawImageContent(ctx, width, height, contentType);

      // Guardar según formato
      let buffer;
      if (format === 'png') {
        buffer = canvas.toBuffer('image/png');
      } else if (format === 'jpeg') {
        buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
      } else if (format === 'webp') {
        buffer = canvas.toBuffer('image/webp', { quality: 0.8 });
      }

      await fs.writeFile(filePath, buffer);
      console.log(`  ✅ ${filename} (${width}x${height})`);
      return filePath;
    } catch (error) {
      console.error(`  ❌ Error creando ${filename}:`, error.message);
      return null;
    }
  }

  drawImageContent(ctx, width, height, contentType) {
    // Fondo
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    switch (contentType) {
      case 'tiny':
        // Imagen muy simple
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, width/2, height);
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(width/2, 0, width/2, height);
        break;

      case 'small':
        // Patrón de cuadrícula
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 20) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 20) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;

      case 'medium':
        // Gradiente y texto
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(1, '#0000ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.min(width, height) / 10}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('TEST IMAGE', width/2, height/2);
        break;

      case 'large':
      case 'huge':
        // Imagen compleja con muchos detalles
        for (let i = 0; i < 1000; i++) {
          ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
          ctx.fillRect(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 50,
            Math.random() * 50
          );
        }
        break;

      case 'minimal':
        // Un solo pixel de color
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1, 1);
        break;
    }
  }

  async createTestPDF(filename, pages, content) {
    const filePath = path.join(this.outputDir, filename);
    
    // Crear PDF simple usando texto
    const pdfContent = this.generatePDFContent(pages, content);
    await fs.writeFile(filePath, pdfContent);
    
    console.log(`  ✅ ${filename} (${pages} páginas)`);
    return filePath;
  }

  generatePDFContent(pages, textContent) {
    // PDF mínimo válido con contenido
    let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [`;

    // Referencias a páginas
    for (let i = 0; i < pages; i++) {
      pdfContent += `${3 + i} 0 R `;
    }

    pdfContent += `]
/Count ${pages}
>>
endobj

`;

    // Generar páginas
    for (let i = 0; i < pages; i++) {
      const pageNum = 3 + i;
      const contentNum = pageNum + pages;
      
      pdfContent += `${pageNum} 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents ${contentNum} 0 R
>>
endobj

`;
    }

    // Generar contenido de páginas
    for (let i = 0; i < pages; i++) {
      const contentNum = 3 + pages + i;
      const pageContent = `Página ${i + 1}\\n${textContent.substring(0, 200)}...`;
      
      pdfContent += `${contentNum} 0 obj
<<
/Length ${pageContent.length + 50}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${pageContent}) Tj
ET
endstream
endobj

`;
    }

    // Tabla xref y trailer
    pdfContent += `xref
0 ${3 + pages * 2}
0000000000 65535 f 
`;

    // Calcular offsets (simplificado)
    for (let i = 1; i < 3 + pages * 2; i++) {
      pdfContent += `${String(i * 100).padStart(10, '0')} 00000 n 
`;
    }

    pdfContent += `trailer
<<
/Size ${3 + pages * 2}
/Root 1 0 R
>>
startxref
${pdfContent.length + 100}
%%EOF`;

    return Buffer.from(pdfContent);
  }

  async createTestTXT(filename, content) {
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`  ✅ ${filename}`);
    return filePath;
  }

  async createTestMarkdown(filename, content) {
    const filePath = path.join(this.outputDir, filename);
    const mdContent = `# ${filename.replace('.md', '')}

${content}

## Información del Archivo
- **Nombre**: ${filename}
- **Generado**: ${new Date().toISOString()}
- **Propósito**: Testing de conversión
`;
    
    await fs.writeFile(filePath, mdContent, 'utf-8');
    console.log(`  ✅ ${filename}`);
    return filePath;
  }

  async createTestWAV(filename, duration, quality) {
    const filePath = path.join(this.outputDir, filename);
    
    // Generar audio WAV simple
    const sampleRate = quality === 'hq' ? 96000 : 44100;
    const samples = sampleRate * duration;
    const headerSize = 44;
    const dataSize = samples * 2; // 16-bit
    
    const buffer = Buffer.alloc(headerSize + dataSize);
    
    // Header WAV
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
    
    // Generar tono de prueba (440Hz + 880Hz)
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * 440 * t) * 0.3 + 
                    Math.sin(2 * Math.PI * 880 * t) * 0.2;
      buffer.writeInt16LE(sample * 32767, headerSize + i * 2);
    }
    
    await fs.writeFile(filePath, buffer);
    console.log(`  ✅ ${filename} (${duration}s, ${quality})`);
    return filePath;
  }

  async createTestMP3(filename, duration, quality) {
    // Para MP3 real necesitaríamos un encoder
    // Por ahora creamos un archivo con header MP3 válido
    const filePath = path.join(this.outputDir, filename);
    
    const mp3Header = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, // MP3 header
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00
    ]);
    
    // Simular datos de audio
    const dataSize = duration * 16000; // Aproximado
    const audioData = Buffer.alloc(dataSize);
    for (let i = 0; i < dataSize; i++) {
      audioData[i] = Math.floor(Math.random() * 256);
    }
    
    const fullBuffer = Buffer.concat([mp3Header, audioData]);
    await fs.writeFile(filePath, fullBuffer);
    
    console.log(`  ✅ ${filename} (${duration}s, ${quality})`);
    return filePath;
  }

  async createTestFLAC(filename, duration) {
    const filePath = path.join(this.outputDir, filename);
    
    // Header FLAC básico
    const flacHeader = Buffer.from('fLaC', 'ascii');
    const metadataBlock = Buffer.alloc(38);
    metadataBlock[0] = 0x80; // Last metadata block
    
    // Simular datos de audio comprimidos
    const dataSize = duration * 50000; // FLAC comprimido
    const audioData = Buffer.alloc(dataSize);
    for (let i = 0; i < dataSize; i++) {
      audioData[i] = Math.floor(Math.random() * 256);
    }
    
    const fullBuffer = Buffer.concat([flacHeader, metadataBlock, audioData]);
    await fs.writeFile(filePath, fullBuffer);
    
    console.log(`  ✅ ${filename} (${duration}s, lossless)`);
    return filePath;
  }

  async createTestMP4(filename, duration, resolution) {
    const filePath = path.join(this.outputDir, filename);
    
    // Crear MP4 básico con estructura de boxes
    const ftypBox = this.createMP4Box('ftyp', Buffer.from('isom\x00\x00\x02\x00isomiso2avc1mp41', 'binary'));
    const mdatBox = this.createMP4Box('mdat', Buffer.alloc(duration * 100000)); // Datos simulados
    
    const fullBuffer = Buffer.concat([ftypBox, mdatBox]);
    await fs.writeFile(filePath, fullBuffer);
    
    console.log(`  ✅ ${filename} (${duration}s, ${resolution})`);
    return filePath;
  }

  createMP4Box(type, data) {
    const size = 8 + data.length;
    const header = Buffer.alloc(8);
    header.writeUInt32BE(size, 0);
    header.write(type, 4, 4, 'ascii');
    return Buffer.concat([header, data]);
  }

  async createTestAVI(filename, duration, resolution) {
    const filePath = path.join(this.outputDir, filename);
    
    // Header AVI básico
    const aviHeader = Buffer.from('RIFF', 'ascii');
    const fileSize = Buffer.alloc(4);
    fileSize.writeUInt32LE(duration * 200000, 0);
    const aviType = Buffer.from('AVI ', 'ascii');
    
    // Datos simulados
    const videoData = Buffer.alloc(duration * 100000);
    
    const fullBuffer = Buffer.concat([aviHeader, fileSize, aviType, videoData]);
    await fs.writeFile(filePath, fullBuffer);
    
    console.log(`  ✅ ${filename} (${duration}s, ${resolution})`);
    return filePath;
  }

  async createTestEPUB(filename, complexity) {
    const filePath = path.join(this.outputDir, filename);
    
    // EPUB es un ZIP con estructura específica
    // Por simplicidad, creamos un archivo que simula la estructura
    const epubContent = this.generateEPUBContent(complexity);
    await fs.writeFile(filePath, epubContent);
    
    console.log(`  ✅ ${filename} (${complexity})`);
    return filePath;
  }

  generateEPUBContent(complexity) {
    const metadata = TEST_CONTENT.metadata.ebook;
    
    let content = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title>${metadata.title}</dc:title>
    <dc:creator>${metadata.author}</dc:creator>
    <dc:language>${metadata.language}</dc:language>
    <dc:identifier>${metadata.isbn}</dc:identifier>
  </metadata>
  <manifest>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="chapter1"/>
  </spine>
</package>

CHAPTER CONTENT:
`;

    switch (complexity) {
      case 'simple':
        content += TEST_CONTENT.texts.simple;
        break;
      case 'complex':
        content += TEST_CONTENT.texts.formatted;
        break;
      case 'multilingual':
        content += TEST_CONTENT.texts.multilingual;
        break;
    }

    return Buffer.from(content, 'utf-8');
  }

  async createTestMOBI(filename) {
    const filePath = path.join(this.outputDir, filename);
    
    // Header MOBI básico
    const mobiHeader = Buffer.alloc(232);
    mobiHeader.write('BOOKMOBI', 60, 8, 'ascii');
    
    // Contenido simulado
    const content = Buffer.from(TEST_CONTENT.texts.simple, 'utf-8');
    
    const fullBuffer = Buffer.concat([mobiHeader, content]);
    await fs.writeFile(filePath, fullBuffer);
    
    console.log(`  ✅ ${filename}`);
    return filePath;
  }

  async createEbookPDF(filename) {
    // PDF optimizado para e-book (páginas más pequeñas)
    return await this.createTestPDF(filename, 50, TEST_CONTENT.texts.formatted);
  }

  async createCorruptedFile(filename, type) {
    const filePath = path.join(this.outputDir, filename);
    
    // Crear archivo con header válido pero datos corruptos
    let header;
    switch (type) {
      case 'image':
        header = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
        break;
      case 'document':
        header = Buffer.from('%PDF-1.4', 'ascii');
        break;
      case 'audio':
        header = Buffer.from([0xFF, 0xFB, 0x90, 0x00]); // MP3 header
        break;
    }
    
    // Datos corruptos
    const corruptedData = Buffer.alloc(1000);
    for (let i = 0; i < 1000; i++) {
      corruptedData[i] = Math.floor(Math.random() * 256);
    }
    
    const fullBuffer = Buffer.concat([header, corruptedData]);
    await fs.writeFile(filePath, fullBuffer);
    
    console.log(`  ✅ ${filename} (corrupted)`);
    return filePath;
  }

  async createMislabeledFile(filename, actualType) {
    const filePath = path.join(this.outputDir, filename);
    
    let content;
    switch (actualType) {
      case 'text':
        content = Buffer.from('Este es un archivo de texto con extensión incorrecta', 'utf-8');
        break;
      case 'image':
        content = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG header
        break;
    }
    
    await fs.writeFile(filePath, content);
    console.log(`  ✅ ${filename} (mislabeled as ${actualType})`);
    return filePath;
  }

  async createEmptyFile(filename) {
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, Buffer.alloc(0));
    console.log(`  ✅ ${filename} (empty)`);
    return filePath;
  }

  async createFileWithProblematicName() {
    const problematicName = 'archivo con espacios & símbolos (test) [2025].txt';
    const filePath = path.join(this.outputDir, problematicName);
    await fs.writeFile(filePath, 'Contenido de archivo con nombre problemático', 'utf-8');
    console.log(`  ✅ ${problematicName} (problematic name)`);
    return filePath;
  }

  async createMinimalFile(filename, bytes) {
    const filePath = path.join(this.outputDir, filename);
    const content = Buffer.alloc(bytes, 'A');
    await fs.writeFile(filePath, content);
    console.log(`  ✅ ${filename} (${bytes} bytes)`);
    return filePath;
  }

  async createFileAtSizeLimit(filename, sizeBytes) {
    const filePath = path.join(this.outputDir, filename);
    const content = Buffer.alloc(sizeBytes, 'X');
    await fs.writeFile(filePath, content);
    console.log(`  ✅ ${filename} (${Math.round(sizeBytes / 1024 / 1024)}MB)`);
    return filePath;
  }

  async createTransparentPNG() {
    const filename = 'transparent.png';
    const filePath = path.join(this.outputDir, filename);
    
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    // Fondo transparente con formas
    ctx.clearRect(0, 0, 100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(25, 25, 50, 50);
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filePath, buffer);
    
    console.log(`  ✅ ${filename} (transparent)`);
    return filePath;
  }

  async createAnimatedGIF() {
    const filename = 'animated.gif';
    const filePath = path.join(this.outputDir, filename);
    
    // GIF header básico (no animado real, pero estructura válida)
    const gifHeader = Buffer.from('GIF89a', 'ascii');
    const screenDescriptor = Buffer.alloc(7);
    screenDescriptor.writeUInt16LE(100, 0); // width
    screenDescriptor.writeUInt16LE(100, 2); // height
    
    // Datos simulados
    const imageData = Buffer.alloc(1000);
    
    const fullBuffer = Buffer.concat([gifHeader, screenDescriptor, imageData]);
    await fs.writeFile(filePath, fullBuffer);
    
    console.log(`  ✅ ${filename} (animated structure)`);
    return filePath;
  }

  async createGrayscaleImage() {
    const filename = 'grayscale.png';
    const filePath = path.join(this.outputDir, filename);
    
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    
    // Gradiente en escala de grises
    for (let x = 0; x < 200; x++) {
      const gray = Math.floor((x / 200) * 255);
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(x, 0, 1, 200);
    }
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filePath, buffer);
    
    console.log(`  ✅ ${filename} (grayscale)`);
    return filePath;
  }

  async createHighContrastImage() {
    const filename = 'high_contrast.png';
    const filePath = path.join(this.outputDir, filename);
    
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    
    // Patrón de alto contraste
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 200, 200);
    
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 200; i += 20) {
      ctx.fillRect(i, 0, 10, 200);
    }
    
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filePath, buffer);
    
    console.log(`  ✅ ${filename} (high contrast)`);
    return filePath;
  }

  async createPasswordProtectedPDF() {
    // Simular PDF protegido (en realidad sería necesario usar una librería específica)
    const filename = 'protected.pdf';
    const filePath = path.join(this.outputDir, filename);
    
    const pdfContent = this.generatePDFContent(1, 'Contenido protegido con contraseña: testpassword123');
    await fs.writeFile(filePath, pdfContent);
    
    console.log(`  ✅ ${filename} (password: testpassword123)`);
    return filePath;
  }

  async createMultiLanguageDocument() {
    const filename = 'multilingual.txt';
    const filePath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filePath, TEST_CONTENT.texts.multilingual, 'utf-8');
    console.log(`  ✅ ${filename} (multilingual)`);
    return filePath;
  }

  async createFormattedDocument() {
    const filename = 'formatted.md';
    const filePath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filePath, TEST_CONTENT.texts.formatted, 'utf-8');
    console.log(`  ✅ ${filename} (complex formatting)`);
    return filePath;
  }

  getImageContent(size) {
    return size;
  }

  getDocumentContent(size, wordCount) {
    const baseTexts = [
      TEST_CONTENT.texts.simple,
      TEST_CONTENT.texts.multilingual,
      TEST_CONTENT.texts.formatted,
      TEST_CONTENT.texts.technical,
      TEST_CONTENT.texts.problematic
    ];

    let content = '';
    let currentWords = 0;
    let textIndex = 0;

    while (currentWords < wordCount) {
      const text = baseTexts[textIndex % baseTexts.length];
      content += text + '\n\n';
      currentWords += text.split(' ').length;
      textIndex++;
    }

    return content.substring(0, content.length * (wordCount / currentWords));
  }

  async generateTestManifest(results) {
    const manifest = {
      generated_at: new Date().toISOString(),
      total_files: Object.values(results).flat().length,
      categories: {},
      test_scenarios: {
        size_tests: [
          'tiny files (< 5KB)',
          'small files (< 50KB)', 
          'medium files (< 1MB)',
          'large files (< 10MB)',
          'huge files (< 50MB)'
        ],
        format_tests: [
          'common formats (jpg, png, pdf, txt, mp3, mp4)',
          'modern formats (webp, flac)',
          'legacy formats (avi, gif)',
          'specialized formats (epub, mobi)'
        ],
        content_tests: [
          'simple content',
          'multilingual content',
          'formatted content',
          'technical content',
          'problematic content'
        ],
        edge_cases: [
          'empty files',
          'minimal files (1 byte)',
          'corrupted files',
          'mislabeled files',
          'files with problematic names'
        ]
      },
      replit_considerations: {
        memory_limits: 'Test files sized to work within Replit memory constraints',
        timeout_limits: 'Conversion times estimated for Replit processing power',
        storage_limits: 'Total test suite under 500MB for Replit storage',
        network_limits: 'No external dependencies for core conversion tests'
      }
    };

    Object.entries(results).forEach(([category, files]) => {
      manifest.categories[category] = {
        count: files.length,
        files: files.map(f => path.basename(f))
      };
    });

    const manifestPath = path.join(this.outputDir, 'test_manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`\n📋 Manifiesto de pruebas creado: ${manifestPath}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const generator = new RealFileGenerator();
  
  generator.initialize()
    .then(() => generator.generateAllFiles())
    .then((results) => {
      console.log('\n🎉 ¡Generación de archivos de prueba completada!');
      console.log(`📁 Archivos guardados en: ${TEST_FILES_DIR}`);
      console.log(`📊 Total de archivos: ${Object.values(results).flat().length}`);
    })
    .catch(error => {
      console.error('❌ Error durante la generación:', error);
      process.exit(1);
    });
}

module.exports = { RealFileGenerator, TEST_CONTENT, FILE_CONFIGS };

