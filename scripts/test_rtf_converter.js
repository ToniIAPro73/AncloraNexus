/**
 * Script de pruebas para TxtToRtfConverter
 * Prueba con documentos reales y casos edge
 */

const fs = require('fs');
const TxtToRtfConverter = require('./converters/TxtToRtfConverter.js');

async function runTests() {
  console.log('🧪 Iniciando pruebas del conversor TXT → RTF\n');
  
  const converter = new TxtToRtfConverter();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Texto simple
  totalTests++;
  console.log('Test 1: Texto simple');
  const simpleText = 'Hola mundo\nEsta es una prueba simple.\nTercera línea de texto.';
  
  try {
    const result1 = converter.convert(simpleText, { title: 'Prueba Simple' });
    
    if (result1.success && result1.content && result1.content.includes('\\rtf1')) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_simple.rtf', result1.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result1.error || 'Contenido RTF inválido');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
  }

  // Test 2: Texto con títulos
  totalTests++;
  console.log('\nTest 2: Texto con títulos detectados');
  const titleText = `TÍTULO PRINCIPAL
Este es el contenido bajo el título.

Subtítulo:
Más contenido aquí.
Y otra línea.`;
  
  try {
    const result2 = converter.convert(titleText, { title: 'Prueba Títulos' });
    
    if (result2.success && result2.content && result2.content.includes('\\b')) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_titles.rtf', result2.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result2.error || 'No detecta títulos');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
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
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_lists.rtf', result3.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result3.error || 'No detecta listas');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
  }

  // Test 4: Texto vacío
  totalTests++;
  console.log('\nTest 4: Texto vacío');
  
  try {
    const result4 = converter.convert('');
    
    if (!result4.success) {
      console.log('✅ PASADO (correctamente rechazado)');
      passedTests++;
    } else {
      console.log('❌ FALLIDO: Debería rechazar texto vacío');
    }
  } catch (error) {
    console.log('✅ PASADO (correctamente rechazado):', error.message);
    passedTests++;
  }

  // Test 5: Texto con caracteres especiales
  totalTests++;
  console.log('\nTest 5: Texto con caracteres especiales');
  const specialText = 'Texto con {llaves} y \\backslash y "comillas" y acentos: café, niño, corazón ♥';
  
  try {
    const result5 = converter.convert(specialText, { title: 'Prueba Especiales' });
    
    if (result5.success && result5.content && result5.content.includes('\\{') && result5.content.includes('\\\\')) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_special.rtf', result5.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result5.error || 'No escapa caracteres especiales');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
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
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/prompt_convertido.rtf', result6.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result6.error || 'No convierte archivo real');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
  }

  // Test 7: Texto largo
  totalTests++;
  console.log('\nTest 7: Texto largo');
  const longText = `DOCUMENTO EXTENSO

Introducción:
Este es un documento largo para probar el rendimiento del conversor RTF.

${'Párrafo repetido para prueba de texto largo.\n'.repeat(30)}

Conclusión:
El documento ha sido procesado correctamente.`;
  
  try {
    const result7 = converter.convert(longText, { title: 'Prueba Texto Largo' });
    
    if (result7.success && result7.content && result7.content.length > 2000) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_long.rtf', result7.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result7.error || `Tamaño insuficiente: ${result7.content ? result7.content.length : 0} chars`);
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
  }

  // Test 8: Texto con indentación (citas)
  totalTests++;
  console.log('\nTest 8: Texto con indentación');
  const indentedText = `Texto normal.

    Esta es una cita indentada.
    Continúa en la siguiente línea.

Texto normal otra vez.`;
  
  try {
    const result8 = converter.convert(indentedText, { title: 'Prueba Indentación' });
    
    if (result8.success && result8.content && result8.content.includes('\\i')) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_indent.rtf', result8.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result8.error || 'No detecta indentación');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
  }

  // Resumen
  console.log('\n📊 RESUMEN DE PRUEBAS:');
  console.log(`✅ Pasadas: ${passedTests}/${totalTests}`);
  console.log(`❌ Fallidas: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Tasa de éxito: ${((passedTests/totalTests)*100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El conversor RTF está listo.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar implementación.');
  }

  // Mostrar archivos generados
  console.log('\n📁 Archivos generados:');
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
      console.log(`  ✅ ${file} (${stats.size} bytes)`);
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

