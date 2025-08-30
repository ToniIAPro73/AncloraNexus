/**
 * Conversor TxtToOdtConverter - Anclora Nexus
 * Tu Contenido, Reinventado
 */

// Importar JSZip para crear el archivo ODT
const JSZip = (typeof require !== 'undefined') ? require('jszip') : window.JSZip;

class TxtToOdtConverter {
  constructor() {
    this.name = 'Anclora Nexus - TxtToOdtConverter';
    this.version = '1.0.0';
    this.brand = 'Anclora Nexus';
    this.tagline = 'Tu Contenido, Reinventado';
  }

  /**
   * Convierte contenido de texto a ODT
   * @param {string} textContent - Contenido del archivo TXT
   * @param {Object} options - Opciones de conversiÃ³n
   * @returns {Object} - Resultado de la conversiÃ³n
   */
  async convert(textContent, options = {}) {
    try {
      // Validar entrada
      if (!textContent || typeof textContent !== 'string') {
        throw new Error('Contenido de texto invÃ¡lido');
      }

      if (textContent.trim() === '') {
        throw new Error('El archivo estÃ¡ vacÃ­o');
      }

      // Opciones por defecto
      const defaultOptions = {
        title: 'Documento Convertido',
        author: 'Anclora Converter',
        subject: 'Documento convertido desde TXT',
        language: 'es-ES',
        fontSize: '12pt',
        fontFamily: 'Liberation Serif',
        detectTitles: true,
        preserveFormatting: true,
        addMetadata: true
      };

      const config = { ...defaultOptions, ...options };

      // Crear el archivo ODT
      const odtBlob = await this.createOdtFile(textContent, config);

      return {
        success: true,
        content: odtBlob,
        mimeType: 'application/vnd.oasis.opendocument.text',
        extension: '.odt',
        size: odtBlob.size
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
   * Crea el archivo ODT completo
   * @param {string} textContent - Contenido original
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {Blob} - Archivo ODT como Blob
   */
  async createOdtFile(textContent, config) {
    const zip = new JSZip();

    // Crear estructura de archivos ODT
    zip.file('mimetype', 'application/vnd.oasis.opendocument.text');
    
    // META-INF/manifest.xml
    zip.folder('META-INF').file('manifest.xml', this.createManifest());
    
    // meta.xml
    zip.file('meta.xml', this.createMeta(config));
    
    // styles.xml
    zip.file('styles.xml', this.createStyles(config));
    
    // content.xml (contenido principal)
    zip.file('content.xml', this.createContent(textContent, config));

    // Generar el archivo ZIP/ODT
    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Crea el archivo manifest.xml
   * @returns {string} - Contenido del manifest
   */
  createManifest() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;
  }

  /**
   * Crea el archivo meta.xml
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {string} - Contenido de metadatos
   */
  createMeta(config) {
    const currentDate = new Date().toISOString();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" 
                     xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" 
                     xmlns:dc="http://purl.org/dc/elements/1.1/" 
                     office:version="1.2">
  <office:meta>
    <meta:generator>Anclora Converter v${this.version}</meta:generator>
    this.brand = 'Anclora Nexus';
    this.tagline = 'Tu Contenido, Reinventado';
    <dc:title>${this.escapeXml(config.title)}</dc:title>
    <dc:creator>${this.escapeXml(config.author)}</dc:creator>
    <dc:subject>${this.escapeXml(config.subject)}</dc:subject>
    <dc:language>${config.language}</dc:language>
    <meta:creation-date>${currentDate}</meta:creation-date>
    <dc:date>${currentDate}</dc:date>
  </office:meta>
</office:document-meta>`;
  }

  /**
   * Crea el archivo styles.xml
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {string} - Contenido de estilos
   */
  createStyles(config) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" 
                       xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" 
                       xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" 
                       office:version="1.2">
  <office:styles>
    <!-- Estilo de pÃ¡gina por defecto -->
    <style:default-style style:family="paragraph">
      <style:paragraph-properties fo:text-align="justify"/>
      <style:text-properties style:font-name="${config.fontFamily}" 
                            fo:font-size="${config.fontSize}" 
                            fo:language="${config.language.split('-')[0]}" 
                            fo:country="${config.language.split('-')[1]}"/>
    </style:default-style>
    
    <!-- Estilo de pÃ¡rrafo normal -->
    <style:style style:name="Standard" style:family="paragraph" style:class="text">
      <style:paragraph-properties fo:margin-bottom="0.212cm"/>
    </style:style>
    
    <!-- Estilo de tÃ­tulo principal -->
    <style:style style:name="Title" style:family="paragraph" style:class="title">
      <style:paragraph-properties fo:text-align="center" fo:margin-bottom="0.423cm"/>
      <style:text-properties fo:font-size="18pt" fo:font-weight="bold"/>
    </style:style>
    
    <!-- Estilo de encabezado 1 -->
    <style:style style:name="Heading_20_1" style:display-name="Heading 1" style:family="paragraph" style:class="text">
      <style:paragraph-properties fo:margin-top="0.423cm" fo:margin-bottom="0.212cm"/>
      <style:text-properties fo:font-size="16pt" fo:font-weight="bold" fo:color="#000080"/>
    </style:style>
    
    <!-- Estilo de encabezado 2 -->
    <style:style style:name="Heading_20_2" style:display-name="Heading 2" style:family="paragraph" style:class="text">
      <style:paragraph-properties fo:margin-top="0.353cm" fo:margin-bottom="0.176cm"/>
      <style:text-properties fo:font-size="14pt" fo:font-weight="bold" fo:color="#000080"/>
    </style:style>
    
    <!-- Estilo de lista -->
    <style:style style:name="List" style:family="paragraph" style:class="list">
      <style:paragraph-properties fo:margin-left="0.635cm" fo:text-indent="-0.318cm"/>
    </style:style>
    
    <!-- Estilo de cita -->
    <style:style style:name="Quote" style:family="paragraph" style:class="text">
      <style:paragraph-properties fo:margin-left="1.27cm" fo:margin-right="1.27cm" fo:margin-bottom="0.212cm"/>
      <style:text-properties fo:font-style="italic" fo:color="#666666"/>
    </style:style>
    
    <!-- Estilo de cÃ³digo -->
    <style:style style:name="Code" style:family="paragraph" style:class="text">
      <style:paragraph-properties fo:margin-left="0.635cm" fo:background-color="#f5f5f5" fo:padding="0.176cm"/>
      <style:text-properties style:font-name="Liberation Mono" fo:font-size="10pt"/>
    </style:style>
  </office:styles>
  
  <office:automatic-styles>
    <style:page-layout style:name="pm1">
      <style:page-layout-properties fo:page-width="21.001cm" fo:page-height="29.7cm" 
                                   style:num-format="1" style:print-orientation="portrait" 
                                   fo:margin-top="2cm" fo:margin-bottom="2cm" 
                                   fo:margin-left="2cm" fo:margin-right="2cm"/>
    </style:page-layout>
  </office:automatic-styles>
  
  <office:master-styles>
    <style:master-page style:name="Standard" style:page-layout-name="pm1"/>
  </office:master-styles>
</office:document-styles>`;
  }

  /**
   * Crea el archivo content.xml
   * @param {string} textContent - Contenido original
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {string} - Contenido principal del documento
   */
  createContent(textContent, config) {
    const bodyContent = this.processTextToOdt(textContent, config);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" 
                        xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" 
                        xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" 
                        xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" 
                        office:version="1.2">
  <office:automatic-styles/>
  <office:body>
    <office:text>
      ${bodyContent}
    </office:text>
  </office:body>
</office:document-content>`;
  }

  /**
   * Procesa el contenido de texto y lo convierte a formato ODT
   * @param {string} textContent - Contenido original
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {string} - Contenido procesado en XML ODT
   */
  processTextToOdt(textContent, config) {
    const lines = textContent.split('\n');
    let odtContent = [];

    // Agregar tÃ­tulo principal si estÃ¡ habilitado
    if (config.addMetadata) {
      odtContent.push(`<text:p text:style-name="Title">${this.escapeXml(config.title)}</text:p>`);
      odtContent.push('<text:p text:style-name="Standard"/>'); // LÃ­nea vacÃ­a
    }

    // Procesar cada lÃ­nea
    let inList = false;
    let listLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
      const prevLine = i > 0 ? lines[i - 1] : '';

      // LÃ­neas vacÃ­as
      if (trimmedLine === '') {
        if (inList) {
          odtContent.push('</text:list>');
          inList = false;
        }
        odtContent.push('<text:p text:style-name="Standard"/>');
        continue;
      }

      // Detectar tÃ­tulos
      if (config.detectTitles) {
        const headerLevel = this.detectHeaderLevel(line, nextLine, prevLine, i);
        if (headerLevel > 0) {
          if (inList) {
            odtContent.push('</text:list>');
            inList = false;
          }
          const styleName = headerLevel === 1 ? 'Heading_20_1' : 'Heading_20_2';
          odtContent.push(`<text:p text:style-name="${styleName}">${this.escapeXml(trimmedLine)}</text:p>`);
          continue;
        }
      }

      // Detectar listas
      const listInfo = this.detectListItem(line);
      if (listInfo.isList) {
        if (!inList || listInfo.level !== listLevel) {
          if (inList) {
            odtContent.push('</text:list>');
          }
          odtContent.push('<text:list text:style-name="List">');
          inList = true;
          listLevel = listInfo.level;
        }
        odtContent.push(`<text:list-item><text:p text:style-name="List">${this.escapeXml(listInfo.content)}</text:p></text:list-item>`);
        continue;
      } else if (inList) {
        odtContent.push('</text:list>');
        inList = false;
      }

      // Detectar texto con indentaciÃ³n (citas)
      if (this.isIndentedText(line)) {
        odtContent.push(`<text:p text:style-name="Quote">${this.escapeXml(trimmedLine)}</text:p>`);
        continue;
      }

      // Detectar cÃ³digo
      if (this.looksLikeCode(line)) {
        odtContent.push(`<text:p text:style-name="Code">${this.escapeXml(line)}</text:p>`);
        continue;
      }

      // Texto normal con formato inline
      const formattedText = this.applyInlineFormatting(trimmedLine);
      odtContent.push(`<text:p text:style-name="Standard">${formattedText}</text:p>`);
    }

    // Cerrar lista si quedÃ³ abierta
    if (inList) {
      odtContent.push('</text:list>');
    }

    // Agregar pie de pÃ¡gina
    if (config.addMetadata) {
      odtContent.push('<text:p text:style-name="Standard"/>');
      odtContent.push('<text:p text:style-name="Standard">___________________________</text:p>');
      odtContent.push('<text:p text:style-name="Standard"/>');
      const footerText = `Generado por ${config.author} - ${new Date().toLocaleDateString('es-ES')}`;
      odtContent.push(`<text:p text:style-name="Standard"><text:span text:style-name="Emphasis">${this.escapeXml(footerText)}</text:span></text:p>`);
    }

    return odtContent.join('\n      ');
  }

  /**
   * Detecta el nivel de encabezado de una lÃ­nea
   * @param {string} line - LÃ­nea actual
   * @param {string} nextLine - LÃ­nea siguiente
   * @param {string} prevLine - LÃ­nea anterior
   * @param {number} index - Ãndice de la lÃ­nea
   * @returns {number} - Nivel de encabezado (0 si no es encabezado)
   */
  detectHeaderLevel(line, nextLine, prevLine, index) {
    const trimmed = line.trim();
    
    if (!trimmed) return 0;
    
    // TÃ­tulos al inicio del documento
    if (index < 3 && trimmed.length < 60 && !trimmed.includes('.') && !trimmed.includes(',')) {
      return 1;
    }
    
    // LÃ­neas que terminan con ':'
    if (trimmed.endsWith(':') && trimmed.length < 80 && !trimmed.includes(',')) {
      return 2;
    }
    
    // LÃ­neas en mayÃºsculas
    if (trimmed === trimmed.toUpperCase() && 
        trimmed.length > 3 && 
        trimmed.length < 60 && 
        /^[A-Z\s\d]+$/.test(trimmed)) {
      return 2;
    }
    
    // TÃ­tulos de secciÃ³n
    if (trimmed.match(/^(capÃ­tulo|chapter|secciÃ³n|section|parte|part)\s+\d+/i)) {
      return 1;
    }
    
    return 0;
  }

  /**
   * Detecta si una lÃ­nea es parte de una lista
   * @param {string} line - LÃ­nea a evaluar
   * @returns {Object} - InformaciÃ³n de la lista
   */
  detectListItem(line) {
    const match = line.match(/^(\s*)([-*+â€¢]|\d+\.)\s+(.+)$/);
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

    return { isList: false };
  }

  /**
   * Detecta si una lÃ­nea tiene indentaciÃ³n significativa
   * @param {string} line - LÃ­nea a evaluar
   * @returns {boolean} - Tiene indentaciÃ³n
   */
  isIndentedText(line) {
    return line.match(/^    /) && !this.detectListItem(line).isList && !this.looksLikeCode(line);
  }

  /**
   * Determina si una lÃ­nea parece cÃ³digo
   * @param {string} line - LÃ­nea a evaluar
   * @returns {boolean} - Parece cÃ³digo
   */
  looksLikeCode(line) {
    const codePatterns = [
      /[{}();]/,
      /^\s*(function|class|def|var|let|const|import|export)/,
      /[=<>!]+/,
      /^\s*[#//]\s/,
      /^\s*<[^>]+>/,
      /^\s*\w+\s*[:=]\s*["\d]/
    ];

    return codePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Aplica formato inline al texto
   * @param {string} text - Texto original
   * @returns {string} - Texto con formato ODT aplicado
   */
  applyInlineFormatting(text) {
    let formatted = this.escapeXml(text);

    // Detectar texto en mayÃºsculas como Ã©nfasis
    formatted = formatted.replace(/\b[A-Z]{3,}\b/g, '<text:span text:style-name="Strong">$&</text:span>');

    // Detectar texto entre comillas como cÃ³digo inline
    formatted = formatted.replace(/"([^"]+)"/g, '<text:span text:style-name="Code_20_Inline">$1</text:span>');

    // Detectar URLs
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<text:a xlink:href="$1">$1</text:a>');

    return formatted;
  }

  /**
   * Escapa caracteres especiales para XML
   * @param {string} text - Texto original
   * @returns {string} - Texto escapado
   */
  escapeXml(text) {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
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

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { valid: false, error: 'El archivo es demasiado grande (mÃ¡ximo 10MB)' };
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
}

// Exportar para uso en Node.js y navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TxtToOdtConverter;
} else if (typeof window !== 'undefined') {
  window.TxtToOdtConverter = TxtToOdtConverter;
}


