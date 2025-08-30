/**
 * Debug del problema con texto largo en DOC converter
 */

const TxtToDocConverter = require('../../converters/TxtToDocConverter.js');

async function debugLongText() {
  console.log('ðŸ” Debuggeando problema con texto largo...\n');
  
  const converter = new TxtToDocConverter();
  const longText = 'LÃ­nea repetida para prueba de texto largo.\n'.repeat(100);
  
  console.log(`ðŸ“ Longitud del texto: ${longText.length} caracteres`);
  console.log(`ðŸ“„ NÃºmero de lÃ­neas: ${longText.split('\n').length}`);
  
  try {
    console.log('ðŸ”„ Iniciando conversiÃ³n...');
    const result = await converter.convert(longText, { title: 'Prueba Texto Largo Debug' });
    
    console.log('ðŸ“Š Resultado:');
    console.log(`  - Success: ${result.success}`);
    console.log(`  - Error: ${result.error || 'ninguno'}`);
    console.log(`  - Content length: ${result.content ? result.content.length : 0}`);
    console.log(`  - Size: ${result.size || 0} bytes`);
    
    if (result.success && result.content) {
      const fs = require('fs');
      fs.writeFileSync('/home/ubuntu/debug_long.docx', result.content);
      console.log('âœ… Archivo guardado como debug_long.docx');
      
      // Verificar el archivo
      const stats = fs.statSync('/home/ubuntu/debug_long.docx');
      console.log(`ðŸ“ TamaÃ±o del archivo: ${stats.size} bytes`);
      
      if (stats.size > 10000) {
        console.log('âœ… El archivo es suficientemente grande');
      } else {
        console.log('âš ï¸  El archivo parece pequeÃ±o para el contenido');
      }
    }
    
  } catch (error) {
    console.log('âŒ Error durante la conversiÃ³n:', error.message);
    console.log('ðŸ“‹ Stack trace:', error.stack);
  }
}

debugLongText();


