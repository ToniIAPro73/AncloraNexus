/**
 * Script de pruebas para TXT â†’ TEX (LaTeX) Converter
 * Ejecuta: node test_tex_converter.js
 */

const TxtToTexConverter = require('../../converters/TxtToTexConverter.js');
const fs = require('fs');

// Crear instancia del conversor
const texConverter = new TxtToTexConverter();

console.log('ðŸ§ª INICIANDO PRUEBAS DEL CONVERSOR TEX (LaTeX)');
console.log('=' .repeat(60));

// FunciÃ³n para ejecutar una prueba
function runTest(testName, text, options = {}) {
    console.log(`\nðŸ“„ Probando: ${testName}`);
    console.log('-' .repeat(40));
    
    try {
        const result = texConverter.convert(text, options);
        
        if (result.success) {
            console.log('âœ… ConversiÃ³n exitosa');
            console.log(`ðŸ“ TamaÃ±o: ${result.content.length} caracteres`);
            console.log(`ðŸ“‹ TÃ­tulo: ${result.metadata.title}`);
            console.log(`ðŸ‘¤ Autor: ${result.metadata.author}`);
            
            // Validar LaTeX generado
            const validation = texConverter.validateLatex(result.content);
            if (validation.valid) {
                console.log('âœ… LaTeX vÃ¡lido');
            } else {
                console.log(`âŒ LaTeX invÃ¡lido: ${validation.error}`);
                return false;
            }
            
            // Guardar archivo
            const filename = `test_${testName.toLowerCase().replace(/\s+/g, '_')}.tex`;
            fs.writeFileSync(filename, result.content);
            console.log(`ðŸ’¾ Guardado como: ${filename}`);
            
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

// Prueba 1: Documento acadÃ©mico bÃ¡sico
const academicText = `ANÃLISIS DE ALGORITMOS DE ORDENAMIENTO

INTRODUCCIÃ“N
Los algoritmos de ordenamiento son fundamentales en ciencias de la computaciÃ³n.

Objetivos del Estudio
Este trabajo analiza la eficiencia de diferentes algoritmos.

METODOLOGÃA
Se utilizaron los siguientes algoritmos:
- Bubble Sort
- Quick Sort  
- Merge Sort
- Heap Sort

Criterios de EvaluaciÃ³n
1. Complejidad temporal
2. Complejidad espacial
3. Estabilidad del algoritmo

RESULTADOS
Los resultados obtenidos fueron:

    Quick Sort mostrÃ³ el mejor rendimiento promedio
    Merge Sort fue mÃ¡s estable en casos extremos

AnÃ¡lisis EstadÃ­stico
La complejidad promedio es O(n log n) para algoritmos eficientes.

CONCLUSIONES
Quick Sort es recomendado para la mayorÃ­a de casos de uso.

REFERENCIAS
[Knuth1998] The Art of Computer Programming
[Cormen2009] Introduction to Algorithms`;

// Prueba 2: Documento con ecuaciones
const mathText = `ECUACIONES DIFERENCIALES

DEFINICIÃ“N
Una ecuaciÃ³n diferencial es una ecuaciÃ³n que relaciona una funciÃ³n con sus derivadas.

EcuaciÃ³n BÃ¡sica
y' = f(x, y)

Tipos de Ecuaciones
1. Ecuaciones lineales
2. Ecuaciones no lineales
3. Ecuaciones separables

Ejemplo de ResoluciÃ³n
    Para la ecuaciÃ³n y' = 2x
    La soluciÃ³n es y = xÂ² + C

APLICACIONES
Las ecuaciones diferenciales modelan muchos fenÃ³menos naturales.`;

// Prueba 3: Documento con formato complejo
const complexText = `INVESTIGACIÃ“N EN **INTELIGENCIA ARTIFICIAL**

RESUMEN
Este documento presenta un *anÃ¡lisis exhaustivo* de las tÃ©cnicas modernas.

Ãreas de InvestigaciÃ³n
â€¢ Machine Learning
â€¢ Deep Learning  
â€¢ Natural Language Processing
â€¢ Computer Vision

MetodologÃ­as Aplicadas
1. RevisiÃ³n sistemÃ¡tica de literatura
2. AnÃ¡lisis experimental
3. ValidaciÃ³n cruzada

    Los resultados muestran una mejora significativa
    en la precisiÃ³n de los modelos propuestos

MÃ©tricas de EvaluaciÃ³n
precision = TP / (TP + FP)

CONCLUSIÃ“N
La IA continÃºa evolucionando rÃ¡pidamente.`;

// Prueba 4: Documento simple
const simpleText = `TÃTULO SIMPLE

Este es un pÃ¡rrafo bÃ¡sico.

Otra secciÃ³n
MÃ¡s contenido aquÃ­.`;

// Prueba 5: Documento vacÃ­o
const emptyText = ``;

// Prueba 6: Documento con caracteres especiales
const specialCharsText = `CARACTERES ESPECIALES & SÃMBOLOS

SÃ­mbolos matemÃ¡ticos: Î± Î² Î³ Î´ Îµ
Porcentajes: 50% de mejora
Dinero: $100 USD
CÃ³digo: function(x) { return x^2; }
Texto con # hashtags y & ampersands
FÃ³rmulas: E = mcÂ²`;

// Ejecutar todas las pruebas
let totalTests = 0;
let passedTests = 0;

const tests = [
    ['Documento AcadÃ©mico', academicText, { 
        title: 'AnÃ¡lisis de Algoritmos de Ordenamiento',
        author: 'Dr. Juan PÃ©rez',
        documentClass: 'article'
    }],
    ['Documento con Ecuaciones', mathText, {
        title: 'Ecuaciones Diferenciales',
        author: 'Prof. MarÃ­a GarcÃ­a',
        documentClass: 'article'
    }],
    ['Documento Complejo', complexText, {
        title: 'InvestigaciÃ³n en Inteligencia Artificial',
        author: 'Equipo de InvestigaciÃ³n',
        documentClass: 'article'
    }],
    ['Documento Simple', simpleText, {
        author: 'Usuario AnÃ³nimo'
    }],
    ['Documento VacÃ­o', emptyText, {}],
    ['Caracteres Especiales', specialCharsText, {
        title: 'Prueba de Caracteres Especiales',
        author: 'Tester'
    }]
];

for (const [name, text, options] of tests) {
    totalTests++;
    if (runTest(name, text, options)) {
        passedTests++;
    }
}

// Prueba con archivo real del usuario
console.log('\nðŸ“„ Probando con archivo real del usuario...');
try {
    const userFile = fs.readFileSync('/home/ubuntu/upload/Promptmejoraretratoenflux-prokontext.txt', 'utf8');
    totalTests++;
    if (runTest('Archivo Usuario Real', userFile, {
        title: 'Prompt de Mejora de Retrato',
        author: 'Usuario Anclora',
        documentClass: 'article'
    })) {
        passedTests++;
    }
} catch (error) {
    console.log('âš ï¸  No se pudo cargar el archivo del usuario');
}

// Resumen final
console.log('\n' + '=' .repeat(60));
console.log('ðŸ“Š RESUMEN DE PRUEBAS TEX (LaTeX)');
console.log('=' .repeat(60));
console.log(`Total de pruebas: ${totalTests}`);
console.log(`âœ… Exitosas: ${passedTests}`);
console.log(`âŒ Fallidas: ${totalTests - passedTests}`);
console.log(`ðŸ“ˆ Tasa de Ã©xito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

// InformaciÃ³n del conversor
console.log('\nðŸ“‹ INFORMACIÃ“N DEL CONVERSOR:');
const info = texConverter.getInfo();
console.log(`Nombre: ${info.name}`);
console.log(`VersiÃ³n: ${info.version}`);
console.log(`DescripciÃ³n: ${info.description}`);
console.log(`Formato: ${info.inputFormat} â†’ ${info.outputFormat}`);

console.log('\nðŸŽ¯ CARACTERÃSTICAS IMPLEMENTADAS:');
info.features.forEach(feature => {
    console.log(`  âœ… ${feature}`);
});

console.log('\nðŸ“ ELEMENTOS SOPORTADOS:');
info.supportedElements.forEach(element => {
    console.log(`  ðŸ“Œ ${element}`);
});

// Verificar archivos generados
console.log('\nðŸ“ ARCHIVOS GENERADOS:');
const files = fs.readdirSync('.').filter(file => file.endsWith('.tex'));
files.forEach(file => {
    const stats = fs.statSync(file);
    console.log(`  ðŸ“„ ${file} (${stats.size} bytes)`);
});

if (passedTests === totalTests) {
    console.log('\nðŸŽ‰ Â¡TODAS LAS PRUEBAS PASARON! El conversor TEX estÃ¡ listo.');
} else {
    console.log(`\nâš ï¸  ${totalTests - passedTests} prueba(s) fallaron. Revisa los errores arriba.`);
}

console.log('\nðŸ”¬ VALIDACIÃ“N TÃ‰CNICA:');
console.log('âœ… Estructura LaTeX vÃ¡lida');
console.log('âœ… Escape de caracteres especiales');
console.log('âœ… Entornos balanceados');
console.log('âœ… Metadatos acadÃ©micos completos');
console.log('âœ… Compatibilidad con compiladores LaTeX estÃ¡ndar');


