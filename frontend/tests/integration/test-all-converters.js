﻿/**
 * Script de Pruebas Automatizadas - Todos los Conversores
 * Ejecuta: node test-all-converters.js
 */

const fs = require('fs');
const path = require('path');

// Importar conversores (ajustar rutas segÃºn tu estructura)
const TxtToHtmlConverter = require('../../converters/TxtToHtmlConverter.js');
const TxtToDocConverter = require('../../converters/TxtToDocConverter.js');
const TxtToMarkdownConverter = require('../../converters/TxtToMarkdownConverter.js');
const TxtToRtfConverter = require('../../converters/TxtToRtfConverter.js');
const TxtToOdtConverter = require('../../converters/TxtToOdtConverter.js');

// Texto de prueba
const testText = `TÃTULO PRINCIPAL
Este es un documento de prueba para verificar las conversiones.

SubtÃ­tulo Importante
AquÃ­ hay un pÃ¡rrafo con texto normal.

Lista de elementos:
- Primer elemento
- Segundo elemento
- Tercer elemento

Lista numerada:
1. Primera opciÃ³n
2. Segunda opciÃ³n
3. Tercera opciÃ³n

Texto especial:
â†’ Texto indentado
â†’ Otra lÃ­nea

CaracterÃ­sticas:
â€¢ Unicode: Ã¡Ã©Ã­Ã³Ãº Ã± Â¿Â¡
â€¢ Especiales: @#$%&*()

CONCLUSIÃ“N
Fin del documento de prueba.`;

// FunciÃ³n para ejecutar pruebas
async function runTests() {
    console.log('ðŸ§ª INICIANDO PRUEBAS DE CONVERSORES ANCLORA');
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
    console.log('\nðŸ“„ Probando TXT â†’ HTML...');
    try {
        const htmlConverter = new TxtToHtmlConverter();
        const htmlResult = htmlConverter.convert(testText, { title: 'Prueba HTML' });
        
        if (htmlResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.html'), htmlResult.content);
            console.log('âœ… HTML: Ã‰XITO (' + htmlResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'HTML', status: 'Ã‰XITO', size: htmlResult.content.length });
        } else {
            throw new Error(htmlResult.error);
        }
    } catch (error) {
        console.log('âŒ HTML: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'HTML', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Prueba DOC
    console.log('\nðŸ“„ Probando TXT â†’ DOC...');
    try {
        const docConverter = new TxtToDocConverter();
        const docResult = docConverter.convert(testText, { title: 'Prueba DOC' });
        
        if (docResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.docx'), docResult.content);
            console.log('âœ… DOC: Ã‰XITO (' + docResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'DOC', status: 'Ã‰XITO', size: docResult.content.length });
        } else {
            throw new Error(docResult.error);
        }
    } catch (error) {
        console.log('âŒ DOC: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'DOC', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Prueba Markdown
    console.log('\nðŸ“„ Probando TXT â†’ MD...');
    try {
        const mdConverter = new TxtToMarkdownConverter();
        const mdResult = mdConverter.convert(testText, { title: 'Prueba MD' });
        
        if (mdResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.md'), mdResult.content);
            console.log('âœ… MD: Ã‰XITO (' + mdResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'MD', status: 'Ã‰XITO', size: mdResult.content.length });
        } else {
            throw new Error(mdResult.error);
        }
    } catch (error) {
        console.log('âŒ MD: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'MD', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Prueba RTF
    console.log('\nðŸ“„ Probando TXT â†’ RTF...');
    try {
        const rtfConverter = new TxtToRtfConverter();
        const rtfResult = rtfConverter.convert(testText, { title: 'Prueba RTF' });
        
        if (rtfResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.rtf'), rtfResult.content);
            console.log('âœ… RTF: Ã‰XITO (' + rtfResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'RTF', status: 'Ã‰XITO', size: rtfResult.content.length });
        } else {
            throw new Error(rtfResult.error);
        }
    } catch (error) {
        console.log('âŒ RTF: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'RTF', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Prueba ODT
    console.log('\nðŸ“„ Probando TXT â†’ ODT...');
    try {
        const odtConverter = new TxtToOdtConverter();
        const odtResult = await odtConverter.convert(testText, { title: 'Prueba ODT' });
        
        if (odtResult.success) {
            fs.writeFileSync(path.join(outputDir, 'test.odt'), odtResult.content);
            console.log('âœ… ODT: Ã‰XITO (' + odtResult.content.length + ' bytes)');
            results.passed++;
            results.details.push({ format: 'ODT', status: 'Ã‰XITO', size: odtResult.content.length });
        } else {
            throw new Error(odtResult.error);
        }
    } catch (error) {
        console.log('âŒ ODT: FALLO - ' + error.message);
        results.failed++;
        results.details.push({ format: 'ODT', status: 'FALLO', error: error.message });
    }
    results.total++;

    // Resumen final
    console.log('\n' + '=' .repeat(50));
    console.log('ðŸ“Š RESUMEN DE PRUEBAS');
    console.log('=' .repeat(50));
    console.log(`Total de pruebas: ${results.total}`);
    console.log(`âœ… Exitosas: ${results.passed}`);
    console.log(`âŒ Fallidas: ${results.failed}`);
    console.log(`ðŸ“ˆ Tasa de Ã©xito: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    // Detalles por formato
    console.log('\nðŸ“‹ DETALLES POR FORMATO:');
    results.details.forEach(detail => {
        if (detail.status === 'Ã‰XITO') {
            console.log(`  ${detail.format}: âœ… ${detail.size} bytes`);
        } else {
            console.log(`  ${detail.format}: âŒ ${detail.error}`);
        }
    });

    // Archivos generados
    console.log('\nðŸ“ ARCHIVOS GENERADOS:');
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
    
    console.log(`\nðŸ“„ Reporte guardado en: ${reportPath}`);

    // Resultado final
    if (results.failed === 0) {
        console.log('\nðŸŽ‰ Â¡TODAS LAS PRUEBAS PASARON! Los conversores estÃ¡n listos.');
    } else {
        console.log(`\nâš ï¸  ${results.failed} prueba(s) fallaron. Revisa los errores arriba.`);
    }

    return results;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runTests().catch(error => {
        console.error('ðŸ’¥ Error ejecutando pruebas:', error);
        process.exit(1);
    });
}

module.exports = { runTests };


