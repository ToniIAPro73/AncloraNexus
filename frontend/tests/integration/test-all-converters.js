/**
 * Script de Pruebas Automatizadas - Todos los Conversores
 * Ejecuta: node test-all-converters.js
 */

const fs = require('fs');
const path = require('path');

// Importar conversores (ajustar rutas según tu estructura)
const TxtToHtmlConverter = require('../../converters/TxtToHtmlConverter.js');
const TxtToDocConverter = require('../../converters/TxtToDocConverter.js');
const TxtToMarkdownConverter = require('../../converters/TxtToMarkdownConverter.js');
const TxtToRtfConverter = require('../../converters/TxtToRtfConverter.js');
const TxtToOdtConverter = require('../../converters/TxtToOdtConverter.js');

// Texto de prueba
const testText = `TÍTULO PRINCIPAL
Este es un documento de prueba para verificar las conversiones.

Subtítulo Importante
Aquí hay un párrafo con texto normal.

Lista de elementos:
- Primer elemento
- Segundo elemento
- Tercer elemento

Lista numerada:
1. Primera opción
2. Segunda opción
3. Tercera opción

Texto especial:
→ Texto indentado
→ Otra línea

Características:
• Unicode: áéíóú ñ ¿¡
• Especiales: @#$%&*()

CONCLUSIÓN
Fin del documento de prueba.`;

// Función para ejecutar pruebas
async function runTests() {
    console.log('🧪 INICIANDO PRUEBAS DE CONVERSORES ANCLORA');
    console.log('=' .repeat(50));
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        details: []
    };

    // Crear directorio de resultados
    const outputDir = './test-results';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Prueba HTML
    console.log('\n📄 Probando TXT → HTML...');
    try {
        const htmlConverter = new TxtToHtmlConverter();
        const htmlResult = htmlConverter.convert(testText, { title: 'Prueba HTML' });
        
        if (htmlResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.html'), htmlResult.content);
            console.log('✅ HTML: ÉXITO (' + htmlResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'HTML', status: 'ÉXITO', size: htmlResult.content.length });
        } else {
            throw new Error(htmlResult.error);
        }
    } catch (error) {
        console.log('❌ HTML: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'HTML', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Prueba DOC
    console.log('\n📄 Probando TXT → DOC...');
    try {
        const docConverter = new TxtToDocConverter();
        const docResult = docConverter.convert(testText, { title: 'Prueba DOC' });
        
        if (docResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.docx'), docResult.content);
            console.log('✅ DOC: ÉXITO (' + docResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'DOC', status: 'ÉXITO', size: docResult.content.length });
        } else {
            throw new Error(docResult.error);
        }
    } catch (error) {
        console.log('❌ DOC: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'DOC', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Prueba Markdown
    console.log('\n📄 Probando TXT → MD...');
    try {
        const mdConverter = new TxtToMarkdownConverter();
        const mdResult = mdConverter.convert(testText, { title: 'Prueba MD' });
        
        if (mdResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.md'), mdResult.content);
            console.log('✅ MD: ÉXITO (' + mdResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'MD', status: 'ÉXITO', size: mdResult.content.length });
        } else {
            throw new Error(mdResult.error);
        }
    } catch (error) {
        console.log('❌ MD: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'MD', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Prueba RTF
    console.log('\n📄 Probando TXT → RTF...');
    try {
        const rtfConverter = new TxtToRtfConverter();
        const rtfResult = rtfConverter.convert(testText, { title: 'Prueba RTF' });
        
        if (rtfResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.rtf'), rtfResult.content);
            console.log('✅ RTF: ÉXITO (' + rtfResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'RTF', status: 'ÉXITO', size: rtfResult.content.length });
        } else {
            throw new Error(rtfResult.error);
        }
    } catch (error) {
        console.log('❌ RTF: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'RTF', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Prueba ODT
    console.log('\n📄 Probando TXT → ODT...');
    try {
        const odtConverter = new TxtToOdtConverter();
        const odtResult = await odtConverter.convert(testText, { title: 'Prueba ODT' });
        
        if (odtResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.odt'), odtResult.content);
            console.log('✅ ODT: ÉXITO (' + odtResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'ODT', status: 'ÉXITO', size: odtResult.content.length });
        } else {
            throw new Error(odtResult.error);
        }
    } catch (error) {
        console.log('❌ ODT: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'ODT', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Resumen final
    console.log('\n' + '=' .repeat(50));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('=' .repeat(50));
    console.log(`Total de pruebas: ${results.total}`);
    console.log(`✅ Exitosas: ${results.passed}`);
    console.log(`❌ Fallidas: ${results.failed}`);
    console.log(`📈 Tasa de éxito: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    // Detalles por formato
    console.log('\n📋 DETALLES POR FORMATO:');
    results.details.forEach(detail => {
        if (detail.status === 'ÉXITO') {
            console.log(`  ${detail.format}: ✅ ${detail.size} bytes`);
        } else {
            console.log(`  ${detail.format}: ❌ ${detail.error}`);
        }
    });

    // Archivos generados
    console.log('\n📁 ARCHIVOS GENERADOS:');
    console.log(`  Directorio: ${path.resolve(outputDir)}`);
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
        const stats = fs.statSync(path.join(outputDir, file));
        console.log(`  - ${file} (${stats.size} bytes)`);
    });

    // Guardar reporte JSON
    const reportPath = path.join(outputDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        results: results,
        testText: testText
    }, null, 2));
    
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);

    // Resultado final
    if (results.failed === 0) {
        console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! Los conversores están listos.');
    } else {
        console.log(`\n⚠️  ${results.failed} prueba(s) fallaron. Revisa los errores arriba.`);
    }

    return results;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runTests().catch(error => {
        console.error('💥 Error ejecutando pruebas:', error);
        process.exit(1);
    });
}

module.exports = { runTests };

