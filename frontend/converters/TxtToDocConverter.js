/**
 * Conversor TxtToDocConverter - Anclora Nexus
 * Tu Contenido, Reinventado
 */

// Para Node.js
let Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType;

if (typeof require !== 'undefined') {
  try {
    const docx = require('docx');
    Document = docx.Document;
    Packer = docx.Packer;
    Paragraph = docx.Paragraph;
    TextRun = docx.TextRun;
    HeadingLevel = docx.HeadingLevel;
    AlignmentType = docx.AlignmentType;
  } catch (e) {
    console.warn('docx library not available in Node.js environment');
  }
}

class TxtToDocConverter {
  constructor() {
    this.name = 'Anclora Nexus - TxtToDocConverter';
    this.version = '1.0.0';
    this.brand = 'Anclora Nexus';
    this.tagline = 'Tu Contenido, Reinventado';
  }

  /**
   * Convierte contenido de texto a documento Word
   * @param {string} textContent - Contenido del archivo TXT
   * @param {Object} options - Opciones de conversiÃ³n
   * @returns {Promise<Object>} - Resultado de la conversiÃ³n
   */
  async convert(textContent, options = {}) {
    try {
      // Validar entrada
      if (!textContent || typeof textContent !== 'string') {
        throw new Error('Contenido de texto invÃ¡lido');
      }

      // Verificar disponibilidad de la librerÃ­a
      if (!Document) {
        throw new Error('LibrerÃ­a docx no disponible');
      }

      // Opciones por defecto
      const defaultOptions = {
        title: 'Documento Convertido',
        author: 'Anclora Converter',
        subject: 'Documento convertido de TXT',
        preserveFormatting: true,
        addHeader: true,
        addFooter: true,
        fontSize: 12,
        fontFamily: 'Calibri'
      };

      const config = { ...defaultOptions, ...options };

      // Procesar contenido
      const processedContent = this.processTextContent(textContent, config);

      // Crear documento Word
      const doc = await this.createWordDocument(processedContent, config);

      // Generar buffer
      const buffer = await Packer.toBuffer(doc);

      return {
        success: true,
        content: buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: '.docx',
        size: buffer.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  /**
   * Procesa el contenido de texto para el documento
   * @param {string} textContent - Contenido original
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {Array} - LÃ­neas procesadas
   */
  processTextContent(textContent, config) {
    // Dividir en lÃ­neas
    let lines = textContent.split('\n');

    // Procesar cada lÃ­nea
    const processedLines = lines.map((line, index) => {
      return {
        text: line,
        isEmpty: line.trim() === '',
        isTitle: this.detectTitle(line, index, lines),
        indentLevel: this.detectIndentation(line),
        originalIndex: index
      };
    });

    return processedLines;
  }

  /**
   * Detecta si una lÃ­nea es un tÃ­tulo
   * @param {string} line - LÃ­nea a evaluar
   * @param {number} index - Ãndice de la lÃ­nea
   * @param {Array} allLines - Todas las lÃ­neas
   * @returns {boolean} - Es tÃ­tulo
   */
  detectTitle(line, index, allLines) {
    const trimmed = line.trim();
    
    // LÃ­neas vacÃ­as no son tÃ­tulos
    if (!trimmed) return false;
    
    // LÃ­neas cortas al inicio del documento
    if (index < 3 && trimmed.length < 50 && !trimmed.includes('.')) {
      return true;
    }
    
    // LÃ­neas que terminan con ':'
    if (trimmed.endsWith(':') && trimmed.length < 100) {
      return true;
    }
    
    // LÃ­neas en mayÃºsculas
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 80) {
      return true;
    }
    
    return false;
  }

  /**
   * Detecta el nivel de indentaciÃ³n
   * @param {string} line - LÃ­nea a evaluar
   * @returns {number} - Nivel de indentaciÃ³n
   */
  detectIndentation(line) {
    const match = line.match(/^(\s*)/);
    if (!match) return 0;
    
    const spaces = match[1];
    const tabCount = (spaces.match(/\t/g) || []).length;
    const spaceCount = spaces.length - tabCount;
    
    // Cada tab = 4 espacios
    return Math.floor((spaceCount + tabCount * 4) / 4);
  }

  /**
   * Crea el documento Word
   * @param {Array} processedLines - LÃ­neas procesadas
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {Document} - Documento Word
   */
  async createWordDocument(processedLines, config) {
    const children = [];

    // Agregar encabezado si estÃ¡ habilitado
    if (config.addHeader) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: config.title,
              bold: true,
              size: Math.round(config.fontSize * 1.5 * 2), // Half-points
              font: config.fontFamily
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // LÃ­nea separadora
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'â”€'.repeat(50),
              color: '666666',
              size: config.fontSize * 2
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );
    }

    // Procesar cada lÃ­nea
    for (const lineData of processedLines) {
      if (lineData.isEmpty) {
        // LÃ­nea vacÃ­a - agregar espacio
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 100 }
          })
        );
        continue;
      }

      // Crear pÃ¡rrafo segÃºn el tipo de lÃ­nea
      if (lineData.isTitle) {
        children.push(this.createTitleParagraph(lineData.text, config));
      } else {
        children.push(this.createTextParagraph(lineData.text, lineData.indentLevel, config));
      }
    }

    // Agregar pie de pÃ¡gina si estÃ¡ habilitado
    if (config.addFooter) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'â”€'.repeat(50),
              color: '666666',
              size: config.fontSize * 2
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 }
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Generado por Anclora Converter - ${new Date().toLocaleDateString('es-ES')}`,
              italics: true,
              size: (config.fontSize - 2) * 2,
              color: '666666',
              font: config.fontFamily
            })
          ],
          alignment: AlignmentType.CENTER
        })
      );
    }

    // Crear documento
    const doc = new Document({
      creator: config.author,
      title: config.title,
      subject: config.subject,
      description: 'Documento convertido de TXT a DOCX usando Anclora Converter',
      sections: [
        {
          properties: {},
          children: children
        }
      ]
    });

    return doc;
  }

  /**
   * Crea un pÃ¡rrafo de tÃ­tulo
   * @param {string} text - Texto del tÃ­tulo
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {Paragraph} - PÃ¡rrafo de tÃ­tulo
   */
  createTitleParagraph(text, config) {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          bold: true,
          size: Math.round(config.fontSize * 1.2 * 2),
          color: '2E4057',
          font: config.fontFamily
        })
      ],
      spacing: { before: 300, after: 200 }
    });
  }

  /**
   * Crea un pÃ¡rrafo de texto normal
   * @param {string} text - Texto del pÃ¡rrafo
   * @param {number} indentLevel - Nivel de indentaciÃ³n
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {Paragraph} - PÃ¡rrafo de texto
   */
  createTextParagraph(text, indentLevel, config) {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          size: config.fontSize * 2,
          font: config.fontFamily
        })
      ],
      indent: {
        left: indentLevel * 720 // 720 twips = 0.5 inch
      },
      spacing: { after: 120 }
    });
  }

  /**
   * Valida el archivo de entrada
   * @param {File} file - Archivo a validar
   * @returns {Object} - Resultado de validaciÃ³n
   */
  validateInput(file) {
    if (!file) {
      return { valid: false, error: 'No se proporcionÃ³ archivo' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'El archivo estÃ¡ vacÃ­o' };
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      return { valid: false, error: 'El archivo es demasiado grande (mÃ¡ximo 50MB)' };
    }

    const allowedTypes = ['text/plain', 'text/txt', ''];
    if (file.type && !allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de archivo no soportado' };
    }

    return { valid: true };
  }

  /**
   * Procesa un archivo completo
   * @param {File} file - Archivo a procesar
   * @param {Object} options - Opciones
   * @returns {Promise<Object>} - Resultado de la conversiÃ³n
   */
  async processFile(file, options = {}) {
    try {
      // Validar archivo
      const validation = this.validateInput(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Leer contenido del archivo
      const content = await this.readFileContent(file);
      
      // Configurar opciones con nombre del archivo
      const fileOptions = {
        title: file.name.replace(/\.[^/.]+$/, '') || 'Documento',
        ...options
      };

      // Convertir
      return await this.convert(content, fileOptions);

    } catch (error) {
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  /**
   * Lee el contenido de un archivo
   * @param {File} file - Archivo a leer
   * @returns {Promise<string>} - Contenido del archivo
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Convierte buffer a blob para descarga en navegador
   * @param {Buffer} buffer - Buffer del documento
   * @returns {Blob} - Blob para descarga
   */
  bufferToBlob(buffer) {
    if (typeof window !== 'undefined') {
      return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    }
    return buffer;
  }
}

// Exportar para uso en Node.js y navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TxtToDocConverter;
} else if (typeof window !== 'undefined') {
  window.TxtToDocConverter = TxtToDocConverter;
}


