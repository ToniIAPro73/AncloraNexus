/**
 * Script de pruebas para TxtToRtfConverter
 * Prueba con documentos reales y casos edge
 */

const fs = require('fs');
const TxtToRtfConverter = require('../../converters/TxtToRtfConverter.js');

async function runTests() {
  console.log('ðŸ§ª Iniciando pruebas del conversor TXT â†’ RTF\n');
  
  const converter = new TxtToRtfConverter();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Texto simple
  totalTests++;
  console.log('Test 1: Texto simple');
  const simpleText = 'Hola mundo\nEsta es una prueba simple.\nTercera lÃ­nea de texto.';
  
  try {
    const result1 = converter.convert(simpleText, { title: 'Prueba Simple' });
    
    if (result1.success && result1.content && result1.content.includes('\\rtf1')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_simple.rtf', result1.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result1.error || 'Contenido RTF invÃ¡lido');
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
    const result2 = converter.convert(titleText, { title: 'Prueba TÃ­tulos' });
    
    if (result2.success && result2.content && result2.content.includes('\\b')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_titles.rtf', result2.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result2.error || 'No detecta tÃ­tulos');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 3: Texto con listas
  totalTests++;
  console.log('\nTest 3: Texto con listas');
  const listText = `Lista de elementos:
- Elemento 1
- Elemento 2
  - Subelemento 2.1
- Elemento 3

Lista numerada:
1. Primer item
2. Segundo item`;
  
  try {
    const result3 = converter.convert(listText, { title: 'Prueba Listas' });
    
    if (result3.success && result3.content && result3.content.includes('\\bullet')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_lists.rtf', result3.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result3.error || 'No detecta listas');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 4: Texto vacÃ­o
  totalTests++;
  console.log('\nTest 4: Texto vacÃ­o');
  
  try {
    const result4 = converter.convert('');
    
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

  // Test 5: Texto con caracteres especiales
  totalTests++;
  console.log('\nTest 5: Texto con caracteres especiales');
  const specialText = 'Texto con {llaves} y \\backslash y "comillas" y acentos: cafÃ©, niÃ±o, corazÃ³n â™¥';
  
  try {
    const result5 = converter.convert(specialText, { title: 'Prueba Especiales' });
    
    if (result5.success && result5.content && result5.content.includes('\\{') && result5.content.includes('\\\\')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_special.rtf', result5.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result5.error || 'No escapa caracteres especiales');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 6: Archivo real del usuario
  totalTests++;
  console.log('\nTest 6: Archivo real del usuario');
  
  try {
    const userFileContent = fs.readFileSync('/home/ubuntu/upload/Promptmejoraretratoenflux-prokontext.txt', 'utf8');
    const result6 = converter.convert(userFileContent, { 
      title: 'Prompt mejora retrato en flux-pro kontext',
      fontSize: 11,
      detectTitles: true
    });
    
    if (result6.success && result6.content && result6.content.length > 1000) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/prompt_convertido.rtf', result6.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result6.error || 'No convierte archivo real');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 7: Texto largo
  totalTests++;
  console.log('\nTest 7: Texto largo');
  const longText = `DOCUMENTO EXTENSO

IntroducciÃ³n:
Este es un documento largo para probar el rendimiento del conversor RTF.

${'PÃ¡rrafo repetido para prueba de texto largo.\n'.repeat(30)}

ConclusiÃ³n:
El documento ha sido procesado correctamente.`;
  
  try {
    const result7 = converter.convert(longText, { title: 'Prueba Texto Largo' });
    
    if (result7.success && result7.content && result7.content.length > 2000) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_long.rtf', result7.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result7.error || `TamaÃ±o insuficiente: ${result7.content ? result7.content.length : 0} chars`);
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 8: Texto con indentaciÃ³n (citas)
  totalTests++;
  console.log('\nTest 8: Texto con indentaciÃ³n');
  const indentedText = `Texto normal.

    Esta es una cita indentada.
    ContinÃºa en la siguiente lÃ­nea.

Texto normal otra vez.`;
  
  try {
    const result8 = converter.convert(indentedText, { title: 'Prueba IndentaciÃ³n' });
    
    if (result8.success && result8.content && result8.content.includes('\\i')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_indent.rtf', result8.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result8.error || 'No detecta indentaciÃ³n');
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
    console.log('\nðŸŽ‰ Â¡TODAS LAS PRUEBAS PASARON! El conversor RTF estÃ¡ listo.');
  } else {
    console.log('\nâš ï¸  Algunas pruebas fallaron. Revisar implementaciÃ³n.');
  }

  // Mostrar archivos generados
  console.log('\nðŸ“ Archivos generados:');
  const generatedFiles = [
    'test_simple.rtf',
    'test_titles.rtf', 
    'test_lists.rtf',
    'test_special.rtf',
    'test_indent.rtf',
    'test_long.rtf',
    'prompt_convertido.rtf'
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

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error en las pruebas:', error);
  process.exit(1);
});


