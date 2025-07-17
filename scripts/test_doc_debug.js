/**
 * Debug del problema con texto largo en DOC converter
 */

const TxtToDocConverter = require('./converters/TxtToDocConverter.js');

async function debugLongText() {
  console.log('🔍 Debuggeando problema con texto largo...\n');
  
  const converter = new TxtToDocConverter();
  const longText = 'Línea repetida para prueba de texto largo.\n'.repeat(100);
  
  console.log(`📏 Longitud del texto: ${longText.length} caracteres`);
  console.log(`📄 Número de líneas: ${longText.split('\n').length}`);
  
  try {
    console.log('🔄 Iniciando conversión...');
    const result = await converter.convert(longText, { title: 'Prueba Texto Largo Debug' });
    
    console.log('📊 Resultado:');
    console.log(`  - Success: ${result.success}`);
    console.log(`  - Error: ${result.error || 'ninguno'}`);
    console.log(`  - Content length: ${result.content ? result.content.length : 0}`);
    console.log(`  - Size: ${result.size || 0} bytes`);
    
    if (result.success && result.content) {
      const fs = require('fs');
      fs.writeFileSync('/home/ubuntu/debug_long.docx', result.content);
      console.log('✅ Archivo guardado como debug_long.docx');
      
      // Verificar el archivo
      const stats = fs.statSync('/home/ubuntu/debug_long.docx');
      console.log(`📁 Tamaño del archivo: ${stats.size} bytes`);
      
      if (stats.size > 10000) {
        console.log('✅ El archivo es suficientemente grande');
      } else {
        console.log('⚠️  El archivo parece pequeño para el contenido');
      }
    }
    
  } catch (error) {
    console.log('❌ Error durante la conversión:', error.message);
    console.log('📋 Stack trace:', error.stack);
  }
}

debugLongText();

