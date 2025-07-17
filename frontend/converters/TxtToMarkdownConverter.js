/**
 * Conversor TxtToMarkdownConverter - Anclora Metaform
 * Tu Contenido, Reinventado
 */

class TxtToMarkdownConverter {
  constructor() {
    this.name = 'Anclora Metaform - TxtToMarkdownConverter';
    this.version = '1.0.0';
    this.brand = 'Anclora Metaform';
    this.tagline = 'Tu Contenido, Reinventado';
  }

  /**
   * Convierte contenido de texto a Markdown
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
        addMetadata: true,
        detectLists: true,
        detectCodeBlocks: true,
        detectTables: true,
        preserveLineBreaks: true,
        addTOC: false,
        headerLevel: 1
      };

      const config = { ...defaultOptions, ...options };

      // Procesar contenido
      const markdownContent = this.processTextToMarkdown(textContent, config);

      return {
        success: true,
        content: markdownContent,
        mimeType: 'text/markdown',
        extension: '.md',
        size: new Blob([markdownContent]).size
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
   * Procesa el contenido de texto y lo convierte a Markdown
   * @param {string} textContent - Contenido original
   * @param {Object} config - Configuración
   * @returns {string} - Contenido en Markdown
   */
  processTextToMarkdown(textContent, config) {
    let lines = textContent.split('\n');
    let markdownLines = [];

    // Agregar metadatos si está habilitado
    if (config.addMetadata) {
      markdownLines.push('---');
      markdownLines.push(`title: "${config.title}"`);
      markdownLines.push(`date: ${new Date().toISOString().split('T')[0]}`);
      markdownLines.push('generator: Anclora Converter');
      markdownLines.push('---');
      markdownLines.push('');
    }

    // Agregar título principal
    markdownLines.push(`${'#'.repeat(config.headerLevel)} ${config.title}`);
    markdownLines.push('');

    // Procesar cada línea
    let inCodeBlock = false;
    let inList = false;
    let listIndentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
      const prevLine = i > 0 ? lines[i - 1] : '';

      // Detectar bloques de código
      if (config.detectCodeBlocks && this.isCodeBlock(line, lines, i)) {
        if (!inCodeBlock) {
          markdownLines.push('```');
          inCodeBlock = true;
        }
        markdownLines.push(line);
        continue;
      } else if (inCodeBlock && (trimmedLine === '' || !this.looksLikeCode(line))) {
        markdownLines.push('```');
        markdownLines.push('');
        inCodeBlock = false;
      }

      // Si estamos en un bloque de código, no procesar más
      if (inCodeBlock) {
        markdownLines.push(line);
        continue;
      }

      // Líneas vacías
      if (trimmedLine === '') {
        markdownLines.push('');
        inList = false;
        continue;
      }

      // Detectar títulos
      const headerLevel = this.detectHeaderLevel(line, nextLine, prevLine, i);
      if (headerLevel > 0) {
        markdownLines.push(`${'#'.repeat(headerLevel + config.headerLevel)} ${trimmedLine}`);
        markdownLines.push('');
        inList = false;
        continue;
      }

      // Detectar listas
      if (config.detectLists) {
        const listInfo = this.detectListItem(line);
        if (listInfo.isList) {
          const indent = '  '.repeat(listInfo.level);
          markdownLines.push(`${indent}- ${listInfo.content}`);
          inList = true;
          listIndentLevel = listInfo.level;
          continue;
        }
      }

      // Detectar tablas simples
      if (config.detectTables && this.isTableRow(line, lines, i)) {
        const tableRow = this.formatTableRow(line);
        markdownLines.push(tableRow);
        
        // Agregar separador de tabla si es la primera fila
        if (i === 0 || !this.isTableRow(prevLine, lines, i - 1)) {
          const separatorRow = this.createTableSeparator(line);
          markdownLines.push(separatorRow);
        }
        continue;
      }

      // Detectar citas (líneas que empiezan con espacios significativos)
      if (this.isQuote(line)) {
        markdownLines.push(`> ${trimmedLine}`);
        continue;
      }

      // Detectar texto con formato especial
      const formattedLine = this.applyInlineFormatting(line);
      
      // Línea normal de párrafo
      markdownLines.push(formattedLine);
      
      // Agregar línea vacía después de párrafos si la siguiente línea no está vacía
      if (nextLine.trim() !== '' && !this.isListItem(nextLine) && !inList) {
        markdownLines.push('');
      }
    }

    // Cerrar bloque de código si quedó abierto
    if (inCodeBlock) {
      markdownLines.push('```');
    }

    // Agregar pie de página
    markdownLines.push('');
    markdownLines.push('---');
    markdownLines.push('');
    markdownLines.push('*Generado por Anclora Converter*');

    return markdownLines.join('\n');
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
    
    // Líneas seguidas de líneas de guiones o iguales (estilo Setext)
    if (nextLine && (nextLine.match(/^=+$/) || nextLine.match(/^-+$/))) {
      return nextLine.match(/^=+$/) ? 1 : 2;
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
        content: content
      };
    }

    // Detectar listas con guiones simples
    const simpleMatch = line.match(/^(\s*)-\s+(.+)$/);
    if (simpleMatch) {
      return {
        isList: true,
        level: Math.floor(simpleMatch[1].length / 2),
        marker: '-',
        content: simpleMatch[2]
      };
    }

    return { isList: false };
  }

  /**
   * Detecta si una línea parece ser código
   * @param {string} line - Línea a evaluar
   * @param {Array} lines - Todas las líneas
   * @param {number} index - Índice actual
   * @returns {boolean} - Es código
   */
  isCodeBlock(line, lines, index) {
    // Líneas que empiezan con muchos espacios
    if (line.match(/^    /)) {
      return true;
    }

    // Líneas que parecen código (contienen símbolos de programación)
    if (this.looksLikeCode(line)) {
      // Verificar contexto - si las líneas adyacentes también parecen código
      const prevLine = index > 0 ? lines[index - 1] : '';
      const nextLine = index < lines.length - 1 ? lines[index + 1] : '';
      
      if (this.looksLikeCode(prevLine) || this.looksLikeCode(nextLine)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determina si una línea parece código
   * @param {string} line - Línea a evaluar
   * @returns {boolean} - Parece código
   */
  looksLikeCode(line) {
    const codePatterns = [
      /[{}();]/,                    // Llaves, paréntesis, punto y coma
      /^\s*(function|class|def|var|let|const|import|export)/,  // Palabras clave
      /[=<>!]+/,                    // Operadores
      /^\s*[#//]\s/,                // Comentarios
      /^\s*<[^>]+>/,                // Tags HTML/XML
      /^\s*\w+\s*[:=]\s*["\d]/      // Asignaciones
    ];

    return codePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Detecta si una línea es parte de una tabla
   * @param {string} line - Línea a evaluar
   * @param {Array} lines - Todas las líneas
   * @param {number} index - Índice actual
   * @returns {boolean} - Es fila de tabla
   */
  isTableRow(line, lines, index) {
    // Líneas con múltiples separadores (|, \t, múltiples espacios)
    const separators = (line.match(/\|/g) || []).length;
    const tabs = (line.match(/\t/g) || []).length;
    const multiSpaces = (line.match(/\s{3,}/g) || []).length;

    return separators >= 2 || tabs >= 2 || multiSpaces >= 2;
  }

  /**
   * Formatea una línea como fila de tabla Markdown
   * @param {string} line - Línea original
   * @returns {string} - Fila de tabla formateada
   */
  formatTableRow(line) {
    // Si ya tiene pipes, limpiar y formatear
    if (line.includes('|')) {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      return `| ${cells.join(' | ')} |`;
    }

    // Si tiene tabs, convertir
    if (line.includes('\t')) {
      const cells = line.split('\t').map(cell => cell.trim()).filter(cell => cell);
      return `| ${cells.join(' | ')} |`;
    }

    // Si tiene múltiples espacios, convertir
    const cells = line.split(/\s{3,}/).map(cell => cell.trim()).filter(cell => cell);
    return `| ${cells.join(' | ')} |`;
  }

  /**
   * Crea el separador de tabla Markdown
   * @param {string} line - Línea de referencia
   * @returns {string} - Separador de tabla
   */
  createTableSeparator(line) {
    const cellCount = this.formatTableRow(line).split('|').length - 2;
    const separators = Array(cellCount).fill('---');
    return `| ${separators.join(' | ')} |`;
  }

  /**
   * Detecta si una línea es una cita
   * @param {string} line - Línea a evaluar
   * @returns {boolean} - Es cita
   */
  isQuote(line) {
    // Líneas con indentación significativa que no son listas ni código
    return line.match(/^    /) && !this.looksLikeCode(line) && !this.detectListItem(line).isList;
  }

  /**
   * Detecta si una línea es item de lista
   * @param {string} line - Línea a evaluar
   * @returns {boolean} - Es item de lista
   */
  isListItem(line) {
    return this.detectListItem(line).isList;
  }

  /**
   * Aplica formato inline a una línea
   * @param {string} line - Línea original
   * @returns {string} - Línea con formato aplicado
   */
  applyInlineFormatting(line) {
    let formatted = line;

    // Detectar texto en mayúsculas como énfasis
    formatted = formatted.replace(/\b[A-Z]{3,}\b/g, '**$&**');

    // Detectar URLs
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)');

    // Detectar emails
    formatted = formatted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[$&](mailto:$&)');

    // Detectar texto entre comillas como código inline
    formatted = formatted.replace(/"([^"]+)"/g, '`$1`');

    return formatted;
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
  module.exports = TxtToMarkdownConverter;
} else if (typeof window !== 'undefined') {
  window.TxtToMarkdownConverter = TxtToMarkdownConverter;
}

