/**
 * Matriz Completa de Conversiones y Rutas Optimizadas
 * 
 * Genera todas las combinaciones posibles de conversiones,
 * incluyendo rutas directas e indirectas optimizadas.
 */

const fs = require('fs').promises;
const path = require('path');

// Matriz de conversiones basada en el código TypeScript
const INTRA_CATEGORY_MATRIX = {
  // Audio
  mp3: ['wav', 'aac'],
  wav: ['mp3', 'flac'],
  flac: ['mp3'],
  aac: ['mp3', 'wav'],
  
  // Video
  mp4: ['webm', 'mov', 'avi'],
  mov: ['mp4', 'webm'],
  avi: ['mp4', 'webm'],
  webm: ['mp4', 'mov'],
  
  // Image
  png: ['jpg', 'webp', 'gif', 'tiff'],
  jpg: ['png', 'webp', 'gif'],
  jpeg: ['png', 'webp', 'gif'],
  webp: ['jpg', 'png', 'gif'],
  gif: ['jpg', 'png', 'webp'],
  tiff: ['jpg', 'png'],
  bmp: ['jpg', 'png'],
  
  // Document
  docx: ['pdf', 'txt', 'html', 'rtf'],
  pdf: ['docx', 'txt', 'html'],
  txt: ['pdf', 'docx', 'html', 'md'],
  html: ['pdf', 'docx', 'txt'],
  md: ['pdf', 'html', 'txt'],
  rtf: ['pdf', 'docx', 'txt'],
  
  // Archive
  zip: ['7z', 'tar', 'rar'],
  '7z': ['zip', 'tar'],
  tar: ['zip', '7z'],
  rar: ['zip', '7z'],
  
  // Presentation
  pptx: ['pdf', 'ppt'],
  ppt: ['pptx', 'pdf'],
  
  // Font
  ttf: ['otf', 'woff'],
  otf: ['ttf', 'woff'],
  woff: ['ttf', 'otf'],
  
  // Ebook
  epub: ['mobi', 'azw3', 'pdf'],
  mobi: ['epub', 'pdf'],
  azw3: ['epub', 'mobi', 'pdf'],
  azw: ['epub', 'mobi', 'pdf']
};

// Conversiones entre categorías
const INTER_CATEGORY_MATRIX = {
  // Image to Document
  jpg: ['pdf'],
  png: ['pdf'],
  gif: ['pdf'],
  
  // Audio to Video (con imagen estática)
  mp3: ['mp4'],
  wav: ['mp4'],
  
  // Document to Image
  pdf: ['jpg', 'png'],
  docx: ['jpg', 'png'],
  
  // Video to Audio (extracción)
  mp4: ['mp3', 'wav'],
  avi: ['mp3', 'wav'],
  mov: ['mp3', 'wav']
};

// Combinar matrices
const COMBINED_MATRIX = { ...INTRA_CATEGORY_MATRIX };
for (const [src, targets] of Object.entries(INTER_CATEGORY_MATRIX)) {
  COMBINED_MATRIX[src] = [...(COMBINED_MATRIX[src] || []), ...targets];
}

// Categorías de archivos
const FILE_CATEGORIES = {
  audio: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'wma'],
  video: ['mp4', 'avi', 'mov', 'webm', 'mkv', 'wmv'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'bmp', 'svg'],
  document: ['pdf', 'docx', 'txt', 'html', 'md', 'rtf', 'odt'],
  archive: ['zip', '7z', 'tar', 'rar', 'gz'],
  presentation: ['pptx', 'ppt', 'odp'],
  font: ['ttf', 'otf', 'woff', 'woff2'],
  ebook: ['epub', 'mobi', 'azw3', 'azw', 'pdf']
};

class ConversionMatrixGenerator {
  constructor() {
    this.allConversions = [];
    this.directConversions = [];
    this.indirectConversions = [];
    this.optimizedRoutes = [];
  }

  // Algoritmo BFS para encontrar rutas
  bfs(start, goal) {
    if (start === goal) return [start];
    
    const queue = [[start, [start]]];
    const visited = new Set([start]);

    while (queue.length > 0) {
      const [current, path] = queue.shift();
      const neighbors = COMBINED_MATRIX[current.toLowerCase()] || [];
      
      for (const next of neighbors) {
        if (visited.has(next)) continue;
        
        const newPath = [...path, next];
        if (next === goal) return newPath;
        
        visited.add(next);
        queue.push([next, newPath]);
      }
    }
    
    return null;
  }

  // Encontrar ruta de conversión
  findConversionPath(sourceExt, targetExt) {
    const path = this.bfs(sourceExt.toLowerCase(), targetExt.toLowerCase());
    return {
      optimal: path !== null && path.length === 2,
      path,
      steps: path ? path.length - 1 : 0
    };
  }

  // Generar todas las combinaciones posibles
  generateAllCombinations() {
    console.log('🔄 Generando matriz completa de conversiones...\n');

    const allFormats = new Set();
    
    // Recopilar todos los formatos
    Object.keys(COMBINED_MATRIX).forEach(format => allFormats.add(format));
    Object.values(COMBINED_MATRIX).flat().forEach(format => allFormats.add(format));
    
    const formatList = Array.from(allFormats).sort();
    
    console.log(`📊 Formatos detectados: ${formatList.length}`);
    console.log(`📋 Formatos: ${formatList.join(', ')}\n`);

    // Generar todas las combinaciones
    for (const source of formatList) {
      for (const target of formatList) {
        if (source === target) continue;
        
        const conversionResult = this.findConversionPath(source, target);
        
        if (conversionResult.path) {
          const conversion = {
            source,
            target,
            path: conversionResult.path,
            optimal: conversionResult.optimal,
            steps: conversionResult.steps,
            category: this.getConversionCategory(source, target),
            type: conversionResult.optimal ? 'direct' : 'indirect'
          };
          
          this.allConversions.push(conversion);
          
          if (conversionResult.optimal) {
            this.directConversions.push(conversion);
          } else {
            this.indirectConversions.push(conversion);
            this.optimizedRoutes.push({
              ...conversion,
              route_description: this.describeRoute(conversionResult.path)
            });
          }
        }
      }
    }

    console.log(`✅ Total de conversiones posibles: ${this.allConversions.length}`);
    console.log(`🎯 Conversiones directas: ${this.directConversions.length}`);
    console.log(`🔀 Conversiones indirectas (optimizadas): ${this.indirectConversions.length}`);
    
    return {
      all: this.allConversions,
      direct: this.directConversions,
      indirect: this.indirectConversions,
      optimized: this.optimizedRoutes
    };
  }

  // Determinar categoría de conversión
  getConversionCategory(source, target) {
    for (const [category, formats] of Object.entries(FILE_CATEGORIES)) {
      if (formats.includes(source) && formats.includes(target)) {
        return `intra_${category}`;
      }
    }
    
    const sourceCategory = this.getFormatCategory(source);
    const targetCategory = this.getFormatCategory(target);
    
    if (sourceCategory && targetCategory && sourceCategory !== targetCategory) {
      return `inter_${sourceCategory}_to_${targetCategory}`;
    }
    
    return 'unknown';
  }

  // Obtener categoría de formato
  getFormatCategory(format) {
    for (const [category, formats] of Object.entries(FILE_CATEGORIES)) {
      if (formats.includes(format)) {
        return category;
      }
    }
    return null;
  }

  // Describir ruta de conversión
  describeRoute(path) {
    if (path.length === 2) {
      return `Direct: ${path[0]} → ${path[1]}`;
    } else if (path.length === 3) {
      return `Via intermediate: ${path[0]} → ${path[1]} → ${path[2]}`;
    } else {
      return `Multi-step: ${path.join(' → ')}`;
    }
  }

  // Generar casos de prueba específicos
  generateTestCases() {
    const testCases = {
      direct_conversions: [],
      optimized_routes: [],
      edge_cases: [],
      performance_tests: [],
      quality_tests: []
    };

    // Casos de conversión directa
    this.directConversions.forEach(conv => {
      testCases.direct_conversions.push({
        name: `${conv.source}_to_${conv.target}_direct`,
        source: conv.source,
        target: conv.target,
        expected_steps: 1,
        category: conv.category,
        priority: 'high'
      });
    });

    // Casos de rutas optimizadas
    this.indirectConversions.forEach(conv => {
      testCases.optimized_routes.push({
        name: `${conv.source}_to_${conv.target}_optimized`,
        source: conv.source,
        target: conv.target,
        expected_steps: conv.steps,
        route: conv.path,
        route_description: this.describeRoute(conv.path),
        category: conv.category,
        priority: 'high'
      });
    });

    // Casos extremos
    const edgeCases = [
      { source: 'txt', target: 'mp4', expected: 'impossible' },
      { source: 'jpg', target: 'mp3', expected: 'impossible' },
      { source: 'pdf', target: 'wav', expected: 'impossible' },
      { source: 'zip', target: 'jpg', expected: 'impossible' }
    ];

    edgeCases.forEach(edge => {
      const result = this.findConversionPath(edge.source, edge.target);
      testCases.edge_cases.push({
        name: `${edge.source}_to_${edge.target}_impossible`,
        source: edge.source,
        target: edge.target,
        expected_result: edge.expected,
        actual_result: result.path ? 'possible' : 'impossible',
        priority: 'medium'
      });
    });

    // Tests de performance (rutas más largas)
    const longRoutes = this.indirectConversions
      .filter(conv => conv.steps >= 3)
      .slice(0, 10);

    longRoutes.forEach(conv => {
      testCases.performance_tests.push({
        name: `${conv.source}_to_${conv.target}_performance`,
        source: conv.source,
        target: conv.target,
        steps: conv.steps,
        route: conv.path,
        max_time_ms: conv.steps * 5000, // 5s por paso
        priority: 'medium'
      });
    });

    // Tests de calidad (conversiones críticas)
    const qualityCritical = [
      { source: 'flac', target: 'mp3', quality_loss: 'expected' },
      { source: 'png', target: 'jpg', quality_loss: 'expected' },
      { source: 'pdf', target: 'txt', format_loss: 'expected' },
      { source: 'docx', target: 'pdf', format_preservation: 'expected' }
    ];

    qualityCritical.forEach(quality => {
      const result = this.findConversionPath(quality.source, quality.target);
      if (result.path) {
        testCases.quality_tests.push({
          name: `${quality.source}_to_${quality.target}_quality`,
          source: quality.source,
          target: quality.target,
          route: result.path,
          quality_expectation: quality.quality_loss || quality.format_loss || quality.format_preservation,
          priority: 'high'
        });
      }
    });

    return testCases;
  }

  // Generar estadísticas
  generateStatistics() {
    const stats = {
      total_conversions: this.allConversions.length,
      direct_conversions: this.directConversions.length,
      indirect_conversions: this.indirectConversions.length,
      by_category: {},
      by_steps: {},
      most_connected_formats: {},
      conversion_efficiency: 0
    };

    // Estadísticas por categoría
    this.allConversions.forEach(conv => {
      const category = conv.category;
      stats.by_category[category] = (stats.by_category[category] || 0) + 1;
    });

    // Estadísticas por número de pasos
    this.allConversions.forEach(conv => {
      const steps = conv.steps;
      stats.by_steps[steps] = (stats.by_steps[steps] || 0) + 1;
    });

    // Formatos más conectados
    const connections = {};
    this.allConversions.forEach(conv => {
      connections[conv.source] = (connections[conv.source] || 0) + 1;
    });

    stats.most_connected_formats = Object.entries(connections)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [format, count]) => {
        obj[format] = count;
        return obj;
      }, {});

    // Eficiencia de conversión (% de conversiones directas)
    stats.conversion_efficiency = (stats.direct_conversions / stats.total_conversions * 100).toFixed(2);

    return stats;
  }

  // Exportar resultados
  async saveResults(outputDir) {
    await fs.mkdir(outputDir, { recursive: true });

    const results = this.generateAllCombinations();
    const testCases = this.generateTestCases();
    const statistics = this.generateStatistics();

    // Guardar matriz completa
    await fs.writeFile(
      path.join(outputDir, 'conversion_matrix.json'),
      JSON.stringify(results, null, 2)
    );

    // Guardar casos de prueba
    await fs.writeFile(
      path.join(outputDir, 'test_cases.json'),
      JSON.stringify(testCases, null, 2)
    );

    // Guardar estadísticas
    await fs.writeFile(
      path.join(outputDir, 'conversion_statistics.json'),
      JSON.stringify(statistics, null, 2)
    );

    // Guardar rutas optimizadas específicamente
    await fs.writeFile(
      path.join(outputDir, 'optimized_routes.json'),
      JSON.stringify(this.optimizedRoutes, null, 2)
    );

    // Generar reporte legible
    const report = this.generateHumanReadableReport(results, statistics);
    await fs.writeFile(
      path.join(outputDir, 'conversion_report.md'),
      report
    );

    console.log(`\n📁 Resultados guardados en: ${outputDir}`);
    console.log(`📊 Archivos generados:`);
    console.log(`  - conversion_matrix.json (${results.all.length} conversiones)`);
    console.log(`  - test_cases.json (${Object.values(testCases).flat().length} casos de prueba)`);
    console.log(`  - conversion_statistics.json`);
    console.log(`  - optimized_routes.json (${this.optimizedRoutes.length} rutas optimizadas)`);
    console.log(`  - conversion_report.md`);

    return {
      results,
      testCases,
      statistics,
      optimizedRoutes: this.optimizedRoutes
    };
  }

  // Generar reporte legible
  generateHumanReadableReport(results, statistics) {
    return `# Reporte de Matriz de Conversiones

## Resumen Ejecutivo

- **Total de conversiones posibles**: ${statistics.total_conversions}
- **Conversiones directas**: ${statistics.direct_conversions} (${statistics.conversion_efficiency}%)
- **Conversiones indirectas**: ${statistics.indirect_conversions}
- **Eficiencia del sistema**: ${statistics.conversion_efficiency}%

## Conversiones por Categoría

${Object.entries(statistics.by_category)
  .sort(([,a], [,b]) => b - a)
  .map(([category, count]) => `- **${category}**: ${count} conversiones`)
  .join('\n')}

## Conversiones por Número de Pasos

${Object.entries(statistics.by_steps)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([steps, count]) => `- **${steps} paso${steps > 1 ? 's' : ''}**: ${count} conversiones`)
  .join('\n')}

## Formatos Más Conectados

${Object.entries(statistics.most_connected_formats)
  .map(([format, count]) => `- **${format.toUpperCase()}**: ${count} conversiones de salida`)
  .join('\n')}

## Rutas de Conversión Optimizadas (Ejemplos)

${this.optimizedRoutes.slice(0, 10)
  .map(route => `- **${route.source.toUpperCase()} → ${route.target.toUpperCase()}**: ${route.route_description}`)
  .join('\n')}

## Casos de Prueba Críticos

### Conversiones Directas de Alta Prioridad
${results.direct.filter(conv => ['intra_image', 'intra_audio', 'intra_document'].includes(conv.category))
  .slice(0, 5)
  .map(conv => `- ${conv.source.toUpperCase()} → ${conv.target.toUpperCase()}`)
  .join('\n')}

### Rutas Optimizadas de Alta Prioridad
${this.optimizedRoutes.slice(0, 5)
  .map(route => `- ${route.source.toUpperCase()} → ${route.target.toUpperCase()}: ${route.route_description}`)
  .join('\n')}

## Recomendaciones

1. **Priorizar tests de conversiones directas** (${statistics.conversion_efficiency}% del total)
2. **Validar rutas optimizadas** especialmente para conversiones inter-categoría
3. **Monitorear performance** en rutas de 3+ pasos
4. **Implementar cache** para rutas de conversión frecuentes
5. **Validar calidad** en conversiones con pérdida (ej: FLAC → MP3)

---
*Reporte generado automáticamente el ${new Date().toISOString()}*
`;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const generator = new ConversionMatrixGenerator();
  const outputDir = path.join(__dirname, 'conversion-analysis');
  
  generator.saveResults(outputDir)
    .then((data) => {
      console.log('\n🎉 ¡Análisis de matriz de conversiones completado!');
      console.log(`\n📈 Resumen:`);
      console.log(`  Total conversiones: ${data.statistics.total_conversions}`);
      console.log(`  Conversiones directas: ${data.statistics.direct_conversions}`);
      console.log(`  Rutas optimizadas: ${data.optimizedRoutes.length}`);
      console.log(`  Eficiencia: ${data.statistics.conversion_efficiency}%`);
    })
    .catch(error => {
      console.error('❌ Error durante el análisis:', error);
      process.exit(1);
    });
}

module.exports = { 
  ConversionMatrixGenerator, 
  COMBINED_MATRIX, 
  FILE_CATEGORIES,
  INTRA_CATEGORY_MATRIX,
  INTER_CATEGORY_MATRIX
};

