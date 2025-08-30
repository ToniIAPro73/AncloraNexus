/**
 * Conversor TxtToHtmlConverter - Anclora Nexus
 * Tu Contenido, Reinventado
 * Tu Contenido, Reinventado
 */

class TxtToHtmlConverter {
  constructor() {
    this.name = 'Anclora Nexus - TxtToHtmlConverter';
    this.version = '1.0.0';
    this.brand = 'Anclora Nexus';
    this.tagline = 'Tu Contenido, Reinventado';
    this.brand = 'Anclora Nexus';
    this.tagline = 'Tu Contenido, Reinventado';
    this.tagline = 'Tu Contenido, Reinventado';
  }

  /**
   * Convierte contenido de texto a HTML
   * @param {string} textContent - Contenido del archivo TXT
   * @param {Object} options - Opciones de conversiÃ³n
   * @returns {string} - HTML generado
   */
  convert(textContent, options = {}) {
    try {
      // Validar entrada
      if (!textContent || typeof textContent !== 'string') {
        throw new Error('Contenido de texto invÃ¡lido');
      }

      // Opciones por defecto
      const defaultOptions = {
        title: 'Documento Convertido',
        preserveWhitespace: true,
        addLineNumbers: false,
        theme: 'default',
        encoding: 'UTF-8'
      };

      const config = { ...defaultOptions, ...options };

      // Escapar caracteres HTML
      const escapedContent = this.escapeHtml(textContent);

      // Procesar contenido segÃºn opciones
      let processedContent = escapedContent;
      
      if (config.preserveWhitespace) {
        processedContent = this.preserveFormatting(processedContent);
      }

      if (config.addLineNumbers) {
        processedContent = this.addLineNumbers(processedContent);
      }

      // Generar HTML completo
      const html = this.generateHtml(processedContent, config);

      return {
        success: true,
        content: html,
        mimeType: 'text/html',
        extension: '.html',
        size: html.length
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
   * Escapa caracteres HTML especiales
   * @param {string} text - Texto a escapar
   * @returns {string} - Texto escapado
   */
  escapeHtml(text) {
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, (match) => htmlEntities[match]);
  }

  /**
   * Preserva el formato del texto original
   * @param {string} content - Contenido a formatear
   * @returns {string} - Contenido formateado
   */
  preserveFormatting(content) {
    // Convertir saltos de lÃ­nea y espacios
    return content
      .replace(/\n/g, '<br>\n')
      .replace(/  /g, '&nbsp;&nbsp;')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  }

  /**
   * AÃ±ade nÃºmeros de lÃ­nea al contenido
   * @param {string} content - Contenido
   * @returns {string} - Contenido con nÃºmeros de lÃ­nea
   */
  addLineNumbers(content) {
    const lines = content.split('<br>');
    return lines
      .map((line, index) => {
        const lineNum = (index + 1).toString().padStart(3, '0');
        return `<span class="line-number">${lineNum}</span> ${line}`;
      })
      .join('<br>\n');
  }

  /**
   * Genera el HTML completo con estilos
   * @param {string} content - Contenido procesado
   * @param {Object} config - ConfiguraciÃ³n
   * @returns {string} - HTML completo
   */
  generateHtml(content, config) {
    const styles = this.getStyles(config.theme);
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="${config.encoding}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(config.title)}</title>
    <style>
        ${styles}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${this.escapeHtml(config.title)}</h1>
            <div class="meta">
                <span>Convertido de TXT a HTML</span>
                <span>Fecha: ${new Date().toLocaleDateString('es-ES')}</span>
            </div>
        </header>
        <main>
            <div class="content">
                ${content}
            </div>
        </main>
        <footer>
            <p>Generado por Anclora Converter</p>
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Obtiene los estilos CSS segÃºn el tema
   * @param {string} theme - Tema seleccionado
   * @returns {string} - CSS
   */
  getStyles(theme) {
    const baseStyles = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 100vh;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }

        header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            opacity: 0.9;
        }

        main {
            padding: 2rem;
        }

        .content {
            background-color: #fafafa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1.5rem;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            white-space: pre-wrap;
            overflow-x: auto;
        }

        .line-number {
            color: #999;
            margin-right: 1rem;
            user-select: none;
        }

        footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 1rem;
            color: #666;
            font-size: 0.9rem;
            border-top: 1px solid #e0e0e0;
        }

        @media (max-width: 768px) {
            .container {
                margin: 0;
                box-shadow: none;
            }
            
            header, main {
                padding: 1rem;
            }
            
            .meta {
                flex-direction: column;
                gap: 0.5rem;
            }
        }
    `;

    // Temas adicionales
    const themes = {
      dark: `
        body { background-color: #1a1a1a; }
        .container { background-color: #2d2d2d; }
        .content { 
          background-color: #1e1e1e; 
          color: #e0e0e0; 
          border-color: #444; 
        }
        header { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); }
      `,
      minimal: `
        header { background: #fff; color: #333; border-bottom: 2px solid #eee; }
        .content { border: none; background: transparent; }
      `
    };

    return baseStyles + (themes[theme] || '');
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
  module.exports = TxtToHtmlConverter;
} else if (typeof window !== 'undefined') {
  window.TxtToHtmlConverter = TxtToHtmlConverter;
}


