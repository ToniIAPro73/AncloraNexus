/**
 * Script de pruebas para TxtToDocConverter
 * Prueba con documentos reales y casos edge
 */

const fs = require('fs');
const path = require('path');
const TxtToDocConverter = require('../../converters/TxtToDocConverter.js');

// FunciÃ³n de pruebas
async function runTests() {
  console.log('ðŸ§ª Iniciando pruebas del conversor TXT â†’ DOC\n');
  
  const converter = new TxtToDocConverter();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Texto simple
  totalTests++;
  console.log('Test 1: Texto simple');
  const simpleText = 'Hola mundo\nEsta es una prueba simple.\nTercera lÃ­nea de texto.';
  
  try {
    const result1 = await converter.convert(simpleText, { title: 'Prueba Simple' });
    
    if (result1.success && result1.content && result1.content.length > 0) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_simple.docx', result1.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result1.error || 'Contenido vacÃ­o');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 2: Texto con tÃ­tulos
  totalTests++;
  console.log('\nTest 2: Texto con tÃ­tulos detectados');
  const titleText = `TÃTULO PRINCIPAL
Este es el contenido bajo el tÃ­tulo.

SubtÃ­tulo:
MÃ¡s contenido aquÃ­.
Y otra lÃ­nea.`;
  
  try {
    const result2 = await converter.convert(titleText, { title: 'Prueba TÃ­tulos' });
    
    if (result2.success && result2.content && result2.content.length > 0) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_titles.docx', result2.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result2.error || 'Contenido vacÃ­o');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 3: Texto con indentaciÃ³n
  totalTests++;
  console.log('\nTest 3: Texto con indentaciÃ³n');
  const indentedText = `LÃ­nea normal
    LÃ­nea indentada
        LÃ­nea mÃ¡s indentada
    Vuelta a indentaciÃ³n menor
LÃ­nea normal otra vez`;
  
  try {
    const result3 = await converter.convert(indentedText, { title: 'Prueba IndentaciÃ³n' });
    
    if (result3.success && result3.content && result3.content.length > 0) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_indent.docx', result3.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result3.error || 'Contenido vacÃ­o');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 4: Texto vacÃ­o
  totalTests++;
  console.log('\nTest 4: Texto vacÃ­o');
  
  try {
    const result4 = await converter.convert('');
    
    if (!result4.success) {
      console.log('âœ… PASADO (correctamente rechazado)');
      passedTests++;
    } else {
      console.log('âŒ FALLIDO: DeberÃ­a rechazar texto vacÃ­o');
    }
  } catch (error) {
    console.log('âœ… PASADO (correctamente rechazado):', error.message);
    passedTests++;
  }

  // Test 5: Texto largo
  totalTests++;
  console.log('\nTest 5: Texto largo');
  const longText = 'LÃ­nea repetida para prueba de texto largo.\n'.repeat(100);
  
  try {
    const result5 = await converter.convert(longText, { title: 'Prueba Texto Largo' });
    
    if (result5.success && result5.content && result5.content.length > 5000) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_long.docx', result5.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result5.error || `TamaÃ±o insuficiente: ${result5.content ? result5.content.length : 0} bytes`);
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 6: Caracteres especiales
  totalTests++;
  console.log('\nTest 6: Caracteres especiales y Unicode');
  const specialText = `Caracteres especiales: Ã¡Ã©Ã­Ã³Ãº Ã± Ã§
Emojis: ðŸš€ ðŸŽ¯ âœ…
SÃ­mbolos: â‚¬Â£Â¥ Â©Â®â„¢
Comillas: "texto" 'texto'`;
  
  try {
    const result6 = await converter.convert(specialText, { title: 'Prueba Caracteres Especiales' });
    
    if (result6.success && result6.content && result6.content.length > 0) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_special.docx', result6.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result6.error || 'No maneja caracteres especiales');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 7: Archivo real del usuario
  totalTests++;
  console.log('\nTest 7: Archivo real del usuario');
  
  try {
    const userFileContent = fs.readFileSync('/home/ubuntu/upload/Promptmejoraretratoenflux-prokontext.txt', 'utf8');
    const result7 = await converter.convert(userFileContent, { 
      title: 'Prompt mejora retrato en flux-pro kontext',
      author: 'Usuario Anclora'
    });
    
    if (result7.success && result7.content && result7.content.length > 0) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/prompt_convertido.docx', result7.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result7.error || 'No convierte archivo real');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Resumen
  console.log('\nðŸ“Š RESUMEN DE PRUEBAS:');
  console.log(`âœ… Pasadas: ${passedTests}/${totalTests}`);
  console.log(`âŒ Fallidas: ${totalTests - passedTests}/${totalTests}`);
  console.log(`ðŸ“ˆ Tasa de Ã©xito: ${((passedTests/totalTests)*100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\nðŸŽ‰ Â¡TODAS LAS PRUEBAS PASARON! El conversor DOC estÃ¡ listo.');
  } else {
    console.log('\nâš ï¸  Algunas pruebas fallaron. Revisar implementaciÃ³n.');
  }

  // Mostrar archivos generados
  console.log('\nðŸ“ Archivos generados:');
  const generatedFiles = [
    'test_simple.docx',
    'test_titles.docx', 
    'test_indent.docx',
    'test_long.docx',
    'test_special.docx',
    'prompt_convertido.docx'
  ];

  generatedFiles.forEach(file => {
    const filePath = `/home/ubuntu/${file}`;
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  âœ… ${file} (${stats.size} bytes)`);
    }
  });

  return passedTests === totalTests;
}

// Ejecutar pruebas
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error en las pruebas:', error);
  process.exit(1);
});


