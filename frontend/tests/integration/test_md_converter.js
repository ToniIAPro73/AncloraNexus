/**
 * Script de pruebas para TxtToMarkdownConverter
 * Prueba con documentos reales y casos edge
 */

const fs = require('fs');
const path = require('path');
const TxtToMarkdownConverter = require('../../converters/TxtToMarkdownConverter.js');

// FunciÃ³n de pruebas
async function runTests() {
  console.log('ðŸ§ª Iniciando pruebas del conversor TXT â†’ MD\n');
  
  const converter = new TxtToMarkdownConverter();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Texto simple
  totalTests++;
  console.log('Test 1: Texto simple');
  const simpleText = 'Hola mundo\nEsta es una prueba simple.\nTercera lÃ­nea de texto.';
  
  try {
    const result1 = converter.convert(simpleText, { title: 'Prueba Simple' });
    
    if (result1.success && result1.content && result1.content.includes('# Prueba Simple')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_simple.md', result1.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result1.error || 'Contenido incorrecto');
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
Y otra lÃ­nea.

OTRA SECCIÃ“N
Contenido de la otra secciÃ³n.`;
  
  try {
    const result2 = converter.convert(titleText, { title: 'Prueba TÃ­tulos' });
    
    if (result2.success && result2.content && result2.content.includes('##')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_titles.md', result2.content);
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
  - Subelemento 2.2
- Elemento 3

Lista numerada:
1. Primer item
2. Segundo item
3. Tercer item`;
  
  try {
    const result3 = converter.convert(listText, { title: 'Prueba Listas' });
    
    if (result3.success && result3.content && result3.content.includes('- Elemento')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_lists.md', result3.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result3.error || 'No detecta listas');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 4: Texto con cÃ³digo
  totalTests++;
  console.log('\nTest 4: Texto con bloques de cÃ³digo');
  const codeText = `Ejemplo de cÃ³digo:

    function ejemplo() {
        console.log("Hola mundo");
        return true;
    }

Y tambiÃ©n cÃ³digo inline con "variables" y funciones.`;
  
  try {
    const result4 = converter.convert(codeText, { title: 'Prueba CÃ³digo' });
    
    if (result4.success && result4.content && result4.content.includes('```')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_code.md', result4.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result4.error || 'No detecta cÃ³digo');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 5: Texto vacÃ­o
  totalTests++;
  console.log('\nTest 5: Texto vacÃ­o');
  
  try {
    const result5 = converter.convert('');
    
    if (!result5.success) {
      console.log('âœ… PASADO (correctamente rechazado)');
      passedTests++;
    } else {
      console.log('âŒ FALLIDO: DeberÃ­a rechazar texto vacÃ­o');
    }
  } catch (error) {
    console.log('âœ… PASADO (correctamente rechazado):', error.message);
    passedTests++;
  }

  // Test 6: Texto con tablas
  totalTests++;
  console.log('\nTest 6: Texto con tablas');
  const tableText = `Datos de ejemplo:

Nombre    Edad    Ciudad
Juan      25      Madrid
MarÃ­a     30      Barcelona
Pedro     28      Valencia

Otra tabla con pipes:
| Producto | Precio | Stock |
| Laptop   | 800â‚¬   | 5     |
| Mouse    | 20â‚¬    | 50    |`;
  
  try {
    const result6 = converter.convert(tableText, { title: 'Prueba Tablas' });
    
    if (result6.success && result6.content && result6.content.includes('|')) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_tables.md', result6.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result6.error || 'No detecta tablas');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 7: Archivo real del usuario
  totalTests++;
  console.log('\nTest 7: Archivo real del usuario');
  
  try {
    const userFileContent = fs.readFileSync('/home/ubuntu/upload/Promptmejoraretratoenflux-prokontext.txt', 'utf8');
    const result7 = converter.convert(userFileContent, { 
      title: 'Prompt mejora retrato en flux-pro kontext',
      addMetadata: true,
      detectCodeBlocks: true
    });
    
    if (result7.success && result7.content && result7.content.length > 0) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/prompt_convertido.md', result7.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result7.error || 'No convierte archivo real');
    }
  } catch (error) {
    console.log('âŒ FALLIDO:', error.message);
  }

  // Test 8: Texto largo
  totalTests++;
  console.log('\nTest 8: Texto largo');
  const longText = `DOCUMENTO EXTENSO

IntroducciÃ³n:
Este es un documento largo para probar el rendimiento del conversor.

${'PÃ¡rrafo repetido para prueba de texto largo.\n'.repeat(50)}

ConclusiÃ³n:
El documento ha sido procesado correctamente.`;
  
  try {
    const result8 = converter.convert(longText, { title: 'Prueba Texto Largo' });
    
    if (result8.success && result8.content && result8.content.length > 1000) {
      console.log('âœ… PASADO');
      fs.writeFileSync('/home/ubuntu/test_long.md', result8.content);
      passedTests++;
    } else {
      console.log('âŒ FALLIDO:', result8.error || `TamaÃ±o insuficiente: ${result8.content ? result8.content.length : 0} chars`);
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
    console.log('\nðŸŽ‰ Â¡TODAS LAS PRUEBAS PASARON! El conversor MD estÃ¡ listo.');
  } else {
    console.log('\nâš ï¸  Algunas pruebas fallaron. Revisar implementaciÃ³n.');
  }

  // Mostrar archivos generados
  console.log('\nðŸ“ Archivos generados:');
  const generatedFiles = [
    'test_simple.md',
    'test_titles.md', 
    'test_lists.md',
    'test_code.md',
    'test_tables.md',
    'test_long.md',
    'prompt_convertido.md'
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


