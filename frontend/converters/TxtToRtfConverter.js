/**
 * Conversor TxtToRtfConverter - Anclora Metaform
 * Tu Contenido, Reinventado
 */

class TxtToRtfConverter {
  constructor() {
    this.name = 'Anclora Metaform - TxtToRtfConverter';
    this.version = '1.0.0';
    this.brand = 'Anclora Metaform';
    this.tagline = 'Tu Contenido, Reinventado';
  }

  /**
   * Convierte contenido de texto a RTF
   * @param {string} textContent - Contenido del archivo TXT
   * @param {Object} options - Opciones de conversión
   * @returns {Object} - Resultado de la conversión
   */
  convert(textContent, options = {}) {
    try {
      // Validar entrada
      if (!textContent || typeof textContent !== 'string') {
        throw new Error('Contenido de texto inválido');
      }

      if (textContent.trim() === '') {
        throw new Error('El archivo está vacío');
      }

      // Opciones por defecto
      const defaultOptions = {
        title: 'Documento Convertido',
        author: 'Anclora Converter',
        fontSize: 12,
        fontFamily: 'Times New Roman',
        pageMargins: {
          top: 1440,    // 1 inch = 1440 twips
          bottom: 1440,
          left: 1440,
          right: 1440
        },
        detectTitles: true,
        preserveFormatting: true,
        addMetadata: true
      };

      const config = { ...defaultOptions, ...options };

      // Procesar contenido
      const rtfContent = this.processTextToRtf(textContent, config);

      return {
        success: true,
        content: rtfContent,
        mimeType: 'application/rtf',
        extension: '.rtf',
        size: new Blob([rtfContent]).size
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
   * Procesa el contenido de texto y lo convierte a RTF
   * @param {string} textContent - Contenido original
   * @param {Object} config - Configuración
   * @returns {string} - Contenido en RTF
   */
  processTextToRtf(textContent, config) {
    const lines = textContent.split('\n');
    
    // Construir documento RTF
    let rtf = this.buildRtfHeader(config);
    
    // Agregar título principal si está habilitado
    if (config.addMetadata) {
      rtf += this.formatTitle(config.title, config);
      rtf += this.formatSeparator();
    }

    // Procesar cada línea
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
      const prevLine = i > 0 ? lines[i - 1] : '';

      // Líneas vacías
      if (trimmedLine === '') {
        rtf += '\\par ';
        continue;
      }

      // Detectar títulos
      if (config.detectTitles) {
        const headerLevel = this.detectHeaderLevel(line, nextLine, prevLine, i);
        if (headerLevel > 0) {
          rtf += this.formatHeader(trimmedLine, headerLevel, config);
          continue;
        }
      }

      // Detectar listas
      const listInfo = this.detectListItem(line);
      if (listInfo.isList) {
        rtf += this.formatListItem(listInfo, config);
        continue;
      }

      // Detectar texto con indentación (citas)
      if (this.isIndentedText(line)) {
        rtf += this.formatQuote(trimmedLine, config);
        continue;
      }

      // Texto normal
      rtf += this.formatParagraph(line, config);
    }

    // Agregar pie de página
    if (config.addMetadata) {
      rtf += this.formatSeparator();
      rtf += this.formatFooter(config);
    }

    // Cerrar documento RTF
    rtf += '}';

    return rtf;
  }

  /**
   * Construye el encabezado RTF
   * @param {Object} config - Configuración
   * @returns {string} - Encabezado RTF
   */
  buildRtfHeader(config) {
    const fontTable = this.buildFontTable(config);
    const colorTable = this.buildColorTable();
    const documentInfo = this.buildDocumentInfo(config);
    
    return `{\\rtf1\\ansi\\deff0 ${fontTable}${colorTable}${documentInfo}\\viewkind4\\uc1\\pard`;
  }

  /**
   * Construye la tabla de fuentes
   * @param {Object} config - Configuración
   * @returns {string} - Tabla de fuentes RTF
   */
  buildFontTable(config) {
    return `{\\fonttbl{\\f0\\froman\\fcharset0 ${config.fontFamily};}{\\f1\\fswiss\\fcharset0 Arial;}{\\f2\\fmodern\\fcharset0 Courier New;}}`;
  }

  /**
   * Construye la tabla de colores
   * @returns {string} - Tabla de colores RTF
   */
  buildColorTable() {
    return '{\\colortbl ;\\red0\\green0\\blue0;\\red128\\green128\\blue128;\\red255\\green0\\blue0;\\red0\\green128\\blue0;\\red0\\green0\\blue255;}';
  }

  /**
   * Construye la información del documento
   * @param {Object} config - Configuración
   * @returns {string} - Información del documento RTF
   */
  buildDocumentInfo(config) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();

    return `{\\info{\\title ${this.escapeRtfText(config.title)}}{\\author ${this.escapeRtfText(config.author)}}{\\creatim\\yr${year}\\mo${month}\\dy${day}\\hr${hour}\\min${minute}}}`;
  }

  /**
   * Detecta el nivel de encabezado de una línea
   * @param {string} line - Línea actual
   * @param {string} nextLine - Línea siguiente
   * @param {string} prevLine - Línea anterior
   * @param {number} index - Índice de la línea
   * @returns {number} - Nivel de encabezado (0 si no es encabezado)
   */
  detectHeaderLevel(line, nextLine, prevLine, index) {
    const trimmed = line.trim();
    
    // Líneas vacías no son títulos
    if (!trimmed) return 0;
    
    // Títulos al inicio del documento
    if (index < 3 && trimmed.length < 60 && !trimmed.includes('.') && !trimmed.includes(',')) {
      return 1;
    }
    
    // Líneas que terminan con ':'
    if (trimmed.endsWith(':') && trimmed.length < 80 && !trimmed.includes(',')) {
      return 2;
    }
    
    // Líneas en mayúsculas (títulos)
    if (trimmed === trimmed.toUpperCase() && 
        trimmed.length > 3 && 
        trimmed.length < 60 && 
        /^[A-Z\s\d]+$/.test(trimmed)) {
      return 2;
    }
    
    // Líneas que parecen títulos de sección
    if (trimmed.match(/^(capítulo|chapter|sección|section|parte|part)\s+\d+/i)) {
      return 1;
    }
    
    return 0;
  }

  /**
   * Detecta si una línea es parte de una lista
   * @param {string} line - Línea a evaluar
   * @returns {Object} - Información de la lista
   */
  detectListItem(line) {
    const match = line.match(/^(\s*)([-*+•]|\d+\.)\s+(.+)$/);
    if (match) {
      const indent = match[1];
      const marker = match[2];
      const content = match[3];
      const level = Math.floor(indent.length / 2);
      
      return {
        isList: true,
        level: level,
        marker: marker,
        content: content,
        isNumbered: /\d+\./.test(marker)
      };
    }

    return { isList: false };
  }

  /**
   * Detecta si una línea tiene indentación significativa
   * @param {string} line - Línea a evaluar
   * @returns {boolean} - Tiene indentación
   */
  isIndentedText(line) {
    return line.match(/^    /) && !this.detectListItem(line).isList;
  }

  /**
   * Formatea un título
   * @param {string} title - Texto del título
   * @param {Object} config - Configuración
   * @returns {string} - Título formateado en RTF
   */
  formatTitle(title, config) {
    const fontSize = Math.round(config.fontSize * 1.5 * 2); // RTF usa half-points
    return `\\pard\\qc\\f0\\fs${fontSize}\\b ${this.escapeRtfText(title)}\\b0\\par\\par `;
  }

  /**
   * Formatea un encabezado
   * @param {string} text - Texto del encabezado
   * @param {number} level - Nivel del encabezado
   * @param {Object} config - Configuración
   * @returns {string} - Encabezado formateado en RTF
   */
  formatHeader(text, level, config) {
    const baseFontSize = config.fontSize * 2;
    const fontSize = level === 1 ? baseFontSize + 8 : baseFontSize + 4;
    const spacing = level === 1 ? '\\sb240\\sa120' : '\\sb180\\sa90';
    
    return `\\pard${spacing}\\f0\\fs${fontSize}\\b\\cf4 ${this.escapeRtfText(text)}\\b0\\cf1\\par `;
  }

  /**
   * Formatea un elemento de lista
   * @param {Object} listInfo - Información de la lista
   * @param {Object} config - Configuración
   * @returns {string} - Elemento de lista formateado en RTF
   */
  formatListItem(listInfo, config) {
    const indent = 720 + (listInfo.level * 360); // 720 twips = 0.5 inch
    const fontSize = config.fontSize * 2;
    const bullet = listInfo.isNumbered ? '\\pntext\\tab' : '\\bullet\\tab';
    
    return `\\pard\\fi-360\\li${indent}\\f0\\fs${fontSize} ${bullet}${this.escapeRtfText(listInfo.content)}\\par `;
  }

  /**
   * Formatea una cita (texto indentado)
   * @param {string} text - Texto de la cita
   * @param {Object} config - Configuración
   * @returns {string} - Cita formateada en RTF
   */
  formatQuote(text, config) {
    const fontSize = config.fontSize * 2;
    return `\\pard\\li720\\ri720\\f0\\fs${fontSize}\\i\\cf2 ${this.escapeRtfText(text)}\\i0\\cf1\\par `;
  }

  /**
   * Formatea un párrafo normal
   * @param {string} text - Texto del párrafo
   * @param {Object} config - Configuración
   * @returns {string} - Párrafo formateado en RTF
   */
  formatParagraph(text, config) {
    const fontSize = config.fontSize * 2;
    const processedText = this.applyInlineFormatting(text);
    return `\\pard\\f0\\fs${fontSize} ${processedText}\\par `;
  }

  /**
   * Aplica formato inline al texto
   * @param {string} text - Texto original
   * @returns {string} - Texto con formato RTF aplicado
   */
  applyInlineFormatting(text) {
    let formatted = this.escapeRtfText(text);

    // Detectar texto en mayúsculas como énfasis
    formatted = formatted.replace(/\b[A-Z]{3,}\b/g, '\\b $&\\b0 ');

    // Detectar texto entre comillas como código
    formatted = formatted.replace(/"([^"]+)"/g, '\\f2 $1\\f0 ');

    // Detectar URLs (simplificado)
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '\\cf5\\ul $1\\ul0\\cf1 ');

    return formatted;
  }

  /**
   * Formatea un separador
   * @returns {string} - Separador en RTF
   */
  formatSeparator() {
    return '\\pard\\qc\\f0\\fs20\\cf2 ________________________________\\cf1\\par\\par ';
  }

  /**
   * Formatea el pie de página
   * @param {Object} config - Configuración
   * @returns {string} - Pie de página en RTF
   */
  formatFooter(config) {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const footerText = `Generado por ${config.author} - ${currentDate}`;
    return `\\pard\\qc\\f0\\fs18\\i\\cf2 ${this.escapeRtfText(footerText)}\\i0\\cf1\\par `;
  }

  /**
   * Escapa caracteres especiales para RTF
   * @param {string} text - Texto original
   * @returns {string} - Texto escapado
   */
  escapeRtfText(text) {
    if (!text) return '';
    
    return text
      .replace(/\\/g, '\\\\')     // Backslash
      .replace(/\{/g, '\\{')      // Llave izquierda
      .replace(/\}/g, '\\}')      // Llave derecha
      .replace(/\n/g, '\\par ')   // Nueva línea
      .replace(/\t/g, '\\tab ')   // Tab
      // Caracteres Unicode
      .replace(/[^\x00-\x7F]/g, (char) => {
        const code = char.charCodeAt(0);
        return `\\u${code}?`;
      });
  }

  /**
   * Valida el archivo de entrada
   * @param {File} file - Archivo a validar
   * @returns {Object} - Resultado de validación
   */
  validateInput(file) {
    if (!file) {
      return { valid: false, error: 'No se proporcionó archivo' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'El archivo está vacío' };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { valid: false, error: 'El archivo es demasiado grande (máximo 10MB)' };
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
   * @returns {Promise<Object>} - Resultado de la conversión
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
      return this.convert(content, fileOptions);

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
}

// Exportar para uso en Node.js y navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TxtToRtfConverter;
} else if (typeof window !== 'undefined') {
  window.TxtToRtfConverter = TxtToRtfConverter;
}

