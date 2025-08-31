/**
 * Script de Pruebas TEX Converter - Paquete de IntegraciÃ³n
 * Ejecuta: node test-tex-converter.js
 */

const TxtToTexConverter = require('../../converters/TxtToTexConverter.js');
const fs = require('fs');

console.log('ðŸŽ“ PRUEBAS DEL CONVERSOR TEX (LaTeX) - PAQUETE ANCLORA');
console.log('=' .repeat(60));

// Crear instancia del conversor
const texConverter = new TxtToTexConverter();

// Texto de prueba acadÃ©mico
const academicSample = `ANÃLISIS COMPARATIVO DE ALGORITMOS DE MACHINE LEARNING

RESUMEN
Este estudio presenta un anÃ¡lisis exhaustivo de diferentes algoritmos de aprendizaje automÃ¡tico aplicados a problemas de clasificaciÃ³n.

INTRODUCCIÃ“N
El machine learning ha revolucionado mÃºltiples campos de la ciencia y la tecnologÃ­a.

Objetivos del Estudio
1. Comparar la eficiencia de algoritmos supervisados
2. Evaluar la precisiÃ³n en diferentes datasets
3. Analizar la complejidad computacional

METODOLOGÃA
Se utilizaron los siguientes algoritmos:
- Support Vector Machines (SVM)
- Random Forest
- Neural Networks
- Naive Bayes

MÃ©tricas de EvaluaciÃ³n
    precision = TP / (TP + FP)
    recall = TP / (TP + FN)
    f1_score = 2 * (precision * recall) / (precision + recall)

RESULTADOS
Los experimentos mostraron que **Random Forest** obtuvo el mejor rendimiento promedio.

AnÃ¡lisis EstadÃ­stico
La *significancia estadÃ­stica* fue evaluada usando pruebas t-student.

CONCLUSIONES
Los resultados sugieren que la elecciÃ³n del algoritmo depende del contexto especÃ­fico.

REFERENCIAS
[Mitchell1997] Machine Learning
[Bishop2006] Pattern Recognition and Machine Learning`;

// FunciÃ³n de prueba
function testTexConverter() {
    console.log('\nðŸ“„ Probando conversiÃ³n TXT â†’ TEX...');
    
    try {
        const result = texConverter.convert(academicSample, {
            title: 'AnÃ¡lisis Comparativo de Algoritmos de ML',
            author: 'Dr. Investigador',
            documentClass: 'article',
            language: 'spanish'
        });
        
        if (result.success) {
            console.log('âœ… ConversiÃ³n exitosa');
            console.log(`ðŸ“ TamaÃ±o: ${result.content.length} caracteres`);
            console.log(`ðŸ“‹ TÃ­tulo: ${result.metadata.title}`);
            console.log(`ðŸ‘¤ Autor: ${result.metadata.author}`);
            
            // Validar LaTeX
            const validation = texConverter.validateLatex(result.content);
            if (validation.valid) {
                console.log('âœ… LaTeX vÃ¡lido');
            } else {
                console.log(`âŒ LaTeX invÃ¡lido: ${validation.error}`);
                return false;
            }
            
            // Guardar archivo
            const outputDir = './test-results';
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            
            const filename = `${outputDir}/sample_academic.tex`;
            fs.writeFileSync(filename, result.content);
            console.log(`ðŸ’¾ Guardado como: ${filename}`);
            
            // Mostrar preview del LaTeX generado
            console.log('\nðŸ“– PREVIEW DEL LATEX GENERADO:');
            console.log('-' .repeat(40));
            const lines = result.content.split('\n');
            const preview = lines.slice(0, 20).join('\n');
            console.log(preview);
            console.log('...(contenido truncado)...');
            
            return true;
        } else {
            console.log(`âŒ Error: ${result.error}`);
            return false;
        }
    } catch (error) {
        console.log(`ðŸ’¥ ExcepciÃ³n: ${error.message}`);
        return false;
    }
}

// Ejecutar prueba
const success = testTexConverter();

// InformaciÃ³n del conversor
console.log('\nðŸ“‹ INFORMACIÃ“N DEL CONVERSOR TEX:');
const info = texConverter.getInfo();
console.log(`Nombre: ${info.name}`);
console.log(`VersiÃ³n: ${info.version}`);
console.log(`Formato: ${info.inputFormat} â†’ ${info.outputFormat}`);

console.log('\nðŸŽ¯ CARACTERÃSTICAS ACADÃ‰MICAS:');
info.features.forEach(feature => {
    console.log(`  âœ… ${feature}`);
});

console.log('\nðŸ“ ELEMENTOS SOPORTADOS:');
info.supportedElements.forEach(element => {
    console.log(`  ðŸ“Œ ${element}`);
});

// Resultado final
if (success) {
    console.log('\nðŸŽ‰ Â¡CONVERSOR TEX LISTO PARA INTEGRACIÃ“N!');
    console.log('ðŸŽ“ Perfecto para documentos acadÃ©micos y cientÃ­ficos');
    console.log('ðŸ“š Compatible con LaTeX estÃ¡ndar');
} else {
    console.log('\nâŒ Error en las pruebas del conversor TEX');
}

console.log('\nðŸš€ PRÃ“XIMO PASO:');
console.log('Integrar TxtToTexConverter.js en tu proyecto Anclora');
console.log('Actualizar UniversalConverter.tsx con soporte TEX');

module.exports = { testTexConverter };


