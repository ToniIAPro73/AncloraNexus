/**
 * Script de pruebas para TxtToHtmlConverter
 * Prueba con documentos reales y casos edge
 */

const fs = require('fs');
const path = require('path');

// Simular el conversor para Node.js
class TxtToHtmlConverter {
  constructor() {
    this.name = 'TXT to HTML Converter';
    this.version = '1.0.0';
  }

  convert(textContent, options = {}) {
    try {
      if (!textContent || typeof textContent !== 'string') {
        throw new Error('Contenido de texto inválido');
      }

      const defaultOptions = {
        title: 'Documento Convertido',
        preserveWhitespace: true,
        addLineNumbers: false,
        theme: 'default',
        encoding: 'UTF-8'
      };

      const config = { ...defaultOptions, ...options };
      const escapedContent = this.escapeHtml(textContent);
      let processedContent = escapedContent;
      
      if (config.preserveWhitespace) {
        processedContent = this.preserveFormatting(processedContent);
      }

      if (config.addLineNumbers) {
        processedContent = this.addLineNumbers(processedContent);
      }

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

  preserveFormatting(content) {
    return content
      .replace(/\n/g, '<br>\n')
      .replace(/  /g, '&nbsp;&nbsp;')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  }

  addLineNumbers(content) {
    const lines = content.split('<br>');
    return lines
      .map((line, index) => {
        const lineNum = (index + 1).toString().padStart(3, '0');
        return `<span class="line-number">${lineNum}</span> ${line}`;
      })
      .join('<br>\n');
  }

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

  getStyles(theme) {
    return `
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
  }
}

// Función de pruebas
async function runTests() {
  console.log('🧪 Iniciando pruebas del conversor TXT → HTML\n');
  
  const converter = new TxtToHtmlConverter();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Texto simple
  totalTests++;
  console.log('Test 1: Texto simple');
  const simpleText = 'Hola mundo\nEsta es una prueba simple.';
  const result1 = converter.convert(simpleText, { title: 'Prueba Simple' });
  
  if (result1.success && result1.content.includes('Hola mundo')) {
    console.log('✅ PASADO');
    passedTests++;
  } else {
    console.log('❌ FALLIDO:', result1.error || 'Contenido incorrecto');
  }

  // Test 2: Caracteres especiales
  totalTests++;
  console.log('\nTest 2: Caracteres especiales');
  const specialText = 'Caracteres especiales: <>&"\'';
  const result2 = converter.convert(specialText);
  
  if (result2.success && result2.content.includes('&lt;&gt;&amp;&quot;&#39;')) {
    console.log('✅ PASADO');
    passedTests++;
  } else {
    console.log('❌ FALLIDO:', result2.error || 'Escape incorrecto');
  }

  // Test 3: Texto con formato
  totalTests++;
  console.log('\nTest 3: Texto con formato (espacios y tabs)');
  const formattedText = 'Línea 1\n  Línea indentada\n\tLínea con tab';
  const result3 = converter.convert(formattedText, { preserveWhitespace: true });
  
  if (result3.success && result3.content.includes('&nbsp;&nbsp;') && result3.content.includes('<br>')) {
    console.log('✅ PASADO');
    passedTests++;
  } else {
    console.log('❌ FALLIDO:', result3.error || 'Formato incorrecto');
  }

  // Test 4: Números de línea
  totalTests++;
  console.log('\nTest 4: Números de línea');
  const lineText = 'Línea 1\nLínea 2\nLínea 3';
  const result4 = converter.convert(lineText, { addLineNumbers: true });
  
  if (result4.success && result4.content.includes('line-number') && result4.content.includes('001')) {
    console.log('✅ PASADO');
    passedTests++;
  } else {
    console.log('❌ FALLIDO:', result4.error || 'Números de línea incorrectos');
  }

  // Test 5: Texto vacío
  totalTests++;
  console.log('\nTest 5: Texto vacío');
  const result5 = converter.convert('');
  
  if (!result5.success) {
    console.log('✅ PASADO (correctamente rechazado)');
    passedTests++;
  } else {
    console.log('❌ FALLIDO: Debería rechazar texto vacío');
  }

  // Test 6: Texto muy largo
  totalTests++;
  console.log('\nTest 6: Texto largo');
  const longText = 'Línea repetida\n'.repeat(1000);
  const result6 = converter.convert(longText);
  
  if (result6.success && result6.content.length > 10000) {
    console.log('✅ PASADO');
    passedTests++;
  } else {
    console.log('❌ FALLIDO:', result6.error || 'No maneja texto largo');
  }

  // Test 7: Caracteres Unicode
  totalTests++;
  console.log('\nTest 7: Caracteres Unicode');
  const unicodeText = 'Texto con emojis: 🚀 🎯 ✅\nAcentos: áéíóú ñ\nSímbolos: €£¥';
  const result7 = converter.convert(unicodeText);
  
  if (result7.success && result7.content.includes('🚀') && result7.content.includes('áéíóú')) {
    console.log('✅ PASADO');
    passedTests++;
  } else {
    console.log('❌ FALLIDO:', result7.error || 'Unicode incorrecto');
  }

  // Guardar resultados de prueba
  if (result1.success) {
    fs.writeFileSync('/home/ubuntu/test_output_simple.html', result1.content);
  }
  if (result4.success) {
    fs.writeFileSync('/home/ubuntu/test_output_lines.html', result4.content);
  }
  if (result7.success) {
    fs.writeFileSync('/home/ubuntu/test_output_unicode.html', result7.content);
  }

  // Resumen
  console.log('\n📊 RESUMEN DE PRUEBAS:');
  console.log(`✅ Pasadas: ${passedTests}/${totalTests}`);
  console.log(`❌ Fallidas: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Tasa de éxito: ${((passedTests/totalTests)*100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El conversor está listo.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar implementación.');
  }

  return passedTests === totalTests;
}

// Ejecutar pruebas
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error en las pruebas:', error);
  process.exit(1);
});

