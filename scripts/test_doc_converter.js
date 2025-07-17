/**
 * Script de pruebas para TxtToDocConverter
 * Prueba con documentos reales y casos edge
 */

const fs = require('fs');
const path = require('path');
const TxtToDocConverter = require('./converters/TxtToDocConverter.js');

// Función de pruebas
async function runTests() {
  console.log('🧪 Iniciando pruebas del conversor TXT → DOC\n');
  
  const converter = new TxtToDocConverter();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Texto simple
  totalTests++;
  console.log('Test 1: Texto simple');
  const simpleText = 'Hola mundo\nEsta es una prueba simple.\nTercera línea de texto.';
  
  try {
    const result1 = await converter.convert(simpleText, { title: 'Prueba Simple' });
    
    if (result1.success && result1.content && result1.content.length > 0) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_simple.docx', result1.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result1.error || 'Contenido vacío');
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
    const result2 = await converter.convert(titleText, { title: 'Prueba Títulos' });
    
    if (result2.success && result2.content && result2.content.length > 0) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_titles.docx', result2.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result2.error || 'Contenido vacío');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
  }

  // Test 3: Texto con indentación
  totalTests++;
  console.log('\nTest 3: Texto con indentación');
  const indentedText = `Línea normal
    Línea indentada
        Línea más indentada
    Vuelta a indentación menor
Línea normal otra vez`;
  
  try {
    const result3 = await converter.convert(indentedText, { title: 'Prueba Indentación' });
    
    if (result3.success && result3.content && result3.content.length > 0) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_indent.docx', result3.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result3.error || 'Contenido vacío');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
  }

  // Test 4: Texto vacío
  totalTests++;
  console.log('\nTest 4: Texto vacío');
  
  try {
    const result4 = await converter.convert('');
    
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

  // Test 5: Texto largo
  totalTests++;
  console.log('\nTest 5: Texto largo');
  const longText = 'Línea repetida para prueba de texto largo.\n'.repeat(100);
  
  try {
    const result5 = await converter.convert(longText, { title: 'Prueba Texto Largo' });
    
    if (result5.success && result5.content && result5.content.length > 5000) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_long.docx', result5.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result5.error || `Tamaño insuficiente: ${result5.content ? result5.content.length : 0} bytes`);
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
  }

  // Test 6: Caracteres especiales
  totalTests++;
  console.log('\nTest 6: Caracteres especiales y Unicode');
  const specialText = `Caracteres especiales: áéíóú ñ ç
Emojis: 🚀 🎯 ✅
Símbolos: €£¥ ©®™
Comillas: "texto" 'texto'`;
  
  try {
    const result6 = await converter.convert(specialText, { title: 'Prueba Caracteres Especiales' });
    
    if (result6.success && result6.content && result6.content.length > 0) {
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/test_special.docx', result6.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result6.error || 'No maneja caracteres especiales');
    }
  } catch (error) {
    console.log('❌ FALLIDO:', error.message);
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
      console.log('✅ PASADO');
      fs.writeFileSync('/home/ubuntu/prompt_convertido.docx', result7.content);
      passedTests++;
    } else {
      console.log('❌ FALLIDO:', result7.error || 'No convierte archivo real');
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
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El conversor DOC está listo.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar implementación.');
  }

  // Mostrar archivos generados
  console.log('\n📁 Archivos generados:');
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
      console.log(`  ✅ ${file} (${stats.size} bytes)`);
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

