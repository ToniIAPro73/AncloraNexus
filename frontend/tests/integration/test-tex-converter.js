/**
 * Script de Pruebas TEX Converter - Paquete de Integración
 * Ejecuta: node test-tex-converter.js
 */

const TxtToTexConverter = require('../../converters/TxtToTexConverter.js');
const fs = require('fs');

console.log('🎓 PRUEBAS DEL CONVERSOR TEX (LaTeX) - PAQUETE ANCLORA');
console.log('=' .repeat(60));

// Crear instancia del conversor
const texConverter = new TxtToTexConverter();

// Texto de prueba académico
const academicSample = `ANÁLISIS COMPARATIVO DE ALGORITMOS DE MACHINE LEARNING

RESUMEN
Este estudio presenta un análisis exhaustivo de diferentes algoritmos de aprendizaje automático aplicados a problemas de clasificación.

INTRODUCCIÓN
El machine learning ha revolucionado múltiples campos de la ciencia y la tecnología.

Objetivos del Estudio
1. Comparar la eficiencia de algoritmos supervisados
2. Evaluar la precisión en diferentes datasets
3. Analizar la complejidad computacional

METODOLOGÍA
Se utilizaron los siguientes algoritmos:
- Support Vector Machines (SVM)
- Random Forest
- Neural Networks
- Naive Bayes

Métricas de Evaluación
    precision = TP / (TP + FP)
    recall = TP / (TP + FN)
    f1_score = 2 * (precision * recall) / (precision + recall)

RESULTADOS
Los experimentos mostraron que **Random Forest** obtuvo el mejor rendimiento promedio.

Análisis Estadístico
La *significancia estadística* fue evaluada usando pruebas t-student.

CONCLUSIONES
Los resultados sugieren que la elección del algoritmo depende del contexto específico.

REFERENCIAS
[Mitchell1997] Machine Learning
[Bishop2006] Pattern Recognition and Machine Learning`;

// Función de prueba
function testTexConverter() {
    console.log('\n📄 Probando conversión TXT → TEX...');
    
    try {
        const result = texConverter.convert(academicSample, {
            title: 'Análisis Comparativo de Algoritmos de ML',
            author: 'Dr. Investigador',
            documentClass: 'article',
            language: 'spanish'
        });
        
        if (result.success) {
            console.log('✅ Conversión exitosa');
            console.log(`📏 Tamaño: ${result.content.length} caracteres`);
            console.log(`📋 Título: ${result.metadata.title}`);
            console.log(`👤 Autor: ${result.metadata.author}`);
            
            // Validar LaTeX
            const validation = texConverter.validateLatex(result.content);
            if (validation.valid) {
                console.log('✅ LaTeX válido');
            } else {
                console.log(`❌ LaTeX inválido: ${validation.error}`);
                return false;
            }
            
            // Guardar archivo
            const outputDir = './test-results';
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            
            const filename = `${outputDir}/sample_academic.tex`;
            fs.writeFileSync(filename, result.content);
            console.log(`💾 Guardado como: ${filename}`);
            
            // Mostrar preview del LaTeX generado
            console.log('\n📖 PREVIEW DEL LATEX GENERADO:');
            console.log('-' .repeat(40));
            const lines = result.content.split('\n');
            const preview = lines.slice(0, 20).join('\n');
            console.log(preview);
            console.log('...(contenido truncado)...');
            
            return true;
        } else {
            console.log(`❌ Error: ${result.error}`);
            return false;
        }
    } catch (error) {
        console.log(`💥 Excepción: ${error.message}`);
        return false;
    }
}

// Ejecutar prueba
const success = testTexConverter();

// Información del conversor
console.log('\n📋 INFORMACIÓN DEL CONVERSOR TEX:');
const info = texConverter.getInfo();
console.log(`Nombre: ${info.name}`);
console.log(`Versión: ${info.version}`);
console.log(`Formato: ${info.inputFormat} → ${info.outputFormat}`);

console.log('\n🎯 CARACTERÍSTICAS ACADÉMICAS:');
info.features.forEach(feature => {
    console.log(`  ✅ ${feature}`);
});

console.log('\n📝 ELEMENTOS SOPORTADOS:');
info.supportedElements.forEach(element => {
    console.log(`  📌 ${element}`);
});

// Resultado final
if (success) {
    console.log('\n🎉 ¡CONVERSOR TEX LISTO PARA INTEGRACIÓN!');
    console.log('🎓 Perfecto para documentos académicos y científicos');
    console.log('📚 Compatible con LaTeX estándar');
} else {
    console.log('\n❌ Error en las pruebas del conversor TEX');
}

console.log('\n🚀 PRÓXIMO PASO:');
console.log('Integrar TxtToTexConverter.js en tu proyecto Anclora');
console.log('Actualizar UniversalConverter.tsx con soporte TEX');

module.exports = { testTexConverter };

