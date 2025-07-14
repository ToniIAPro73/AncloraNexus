import { 
  advancedConversionMatrix, 
  conversionQualityMap,
  MAX_CONVERSION_STEPS,
  RECOMMENDED_MAX_STEPS,
  calculateFinalQuality,
  isRecommendedRoute,
  getRouteDescription,
  HUB_FORMATS,
  isSupportedInUniversal,
  filterUniversalRoutes
} from './advancedConversionMaps';

export interface ConversionPath {
  path: string[];
  steps: number;
  isOptimal: boolean;
  isRecommended: boolean;
  estimatedQuality: number;
  description: string;
  estimatedTime: number; // en segundos
  warningMessage?: string;
}

export interface ConversionResult {
  success: boolean;
  primaryPath: ConversionPath | null;
  alternativePaths: ConversionPath[];
  error?: string;
  totalRoutesFound: number;
}

/**
 * Algoritmo BFS mejorado que encuentra múltiples rutas SOLO para conversor universal
 */
function findAllUniversalPaths(start: string, goal: string, maxSteps: number = MAX_CONVERSION_STEPS): ConversionPath[] {
  // Verificar que ambos formatos estén soportados en conversor universal
  if (!isSupportedInUniversal(start) || !isSupportedInUniversal(goal)) {
    return [];
  }

  if (start.toLowerCase() === goal.toLowerCase()) {
    return [{
      path: [start],
      steps: 0,
      isOptimal: true,
      isRecommended: true,
      estimatedQuality: 100,
      description: 'Sin conversión necesaria',
      estimatedTime: 0
    }];
  }

  const startLower = start.toLowerCase();
  const goalLower = goal.toLowerCase();
  const allPaths: ConversionPath[] = [];
  
  // BFS para encontrar todas las rutas posibles
  const queue: [string, string[]][] = [[startLower, [startLower]]];
  const visited = new Map<string, number>(); // formato -> menor número de pasos para llegar
  
  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    
    // Si ya encontramos una ruta más corta a este nodo, skip
    if (visited.has(current) && visited.get(current)! < path.length) {
      continue;
    }
    visited.set(current, path.length);
    
    // Si llegamos al objetivo, crear ConversionPath
    if (current === goalLower) {
      const conversionPath = createUniversalConversionPath(path, start, goal);
      if (conversionPath) {
        allPaths.push(conversionPath);
      }
      continue;
    }
    
    // Si ya alcanzamos el máximo de pasos, no continuar
    if (path.length >= maxSteps) {
      continue;
    }
    
    // Explorar vecinos (solo formatos soportados en universal)
    const neighbors = advancedConversionMatrix[current] || [];
    for (const next of neighbors) {
      const nextLower = next.toLowerCase();
      
      // Filtrar formatos de e-book
      if (!isSupportedInUniversal(nextLower)) {
        continue;
      }
      
      const newPath = [...path, nextLower];
      
      // Evitar ciclos
      if (path.includes(nextLower)) {
        continue;
      }
      
      queue.push([nextLower, newPath]);
    }
  }
  
  // Ordenar por calidad y pasos
  return allPaths.sort((a, b) => {
    if (a.steps !== b.steps) return a.steps - b.steps;
    return b.estimatedQuality - a.estimatedQuality;
  });
}

/**
 * Crea un objeto ConversionPath con toda la información calculada
 */
function createUniversalConversionPath(path: string[], originalStart: string, originalGoal: string): ConversionPath | null {
  // Verificar que la ruta no incluya formatos de e-book
  if (!filterUniversalRoutes(path)) {
    return null;
  }

  const steps = path.length - 1;
  const isOptimal = steps === 1;
  const isRecommended = isRecommendedRoute(path);
  
  // Calcular calidad estimada
  let baseQuality = 90; // Calidad base para conversor universal
  if (conversionQualityMap[path[0]] && conversionQualityMap[path[0]][path[path.length - 1]]) {
    baseQuality = conversionQualityMap[path[0]][path[path.length - 1]].qualityScore;
  }
  
  const estimatedQuality = calculateFinalQuality(baseQuality, steps);
  
  // Calcular tiempo estimado (más conservador para universal)
  const baseTime = 3; // 3 segundos base
  const timePerStep = 2; // 2 segundos por paso adicional
  const estimatedTime = baseTime + (steps - 1) * timePerStep;
  
  // Crear path con formato original
  const formattedPath = [originalStart, ...path.slice(1, -1), originalGoal];
  
  // Generar mensaje de advertencia si es necesario
  let warningMessage: string | undefined;
  if (steps > RECOMMENDED_MAX_STEPS) {
    warningMessage = `Conversión compleja (${steps} pasos). Considere usar un formato intermedio más directo.`;
  } else if (estimatedQuality < 80) {
    warningMessage = `Calidad reducida (${estimatedQuality}%). La conversión puede perder información.`;
  }
  
  return {
    path: formattedPath,
    steps,
    isOptimal,
    isRecommended,
    estimatedQuality,
    description: getRouteDescription(formattedPath),
    estimatedTime,
    warningMessage
  };
}

/**
 * Función principal para encontrar rutas de conversión en conversor universal
 */
export function findUniversalConversionRoutes(sourceExt: string, targetExt: string): ConversionResult {
  try {
    // Verificar que no sean formatos de e-book
    if (!isSupportedInUniversal(sourceExt) || !isSupportedInUniversal(targetExt)) {
      return {
        success: false,
        primaryPath: null,
        alternativePaths: [],
        totalRoutesFound: 0,
        error: `Los formatos de e-book requieren el conversor especializado. Use el Conversor de E-books para ${sourceExt.toUpperCase()} ↔ ${targetExt.toUpperCase()}.`
      };
    }

    const allPaths = findAllUniversalPaths(sourceExt, targetExt);
    
    if (allPaths.length === 0) {
      return {
        success: false,
        primaryPath: null,
        alternativePaths: [],
        totalRoutesFound: 0,
        error: `No se encontró ruta de conversión de ${sourceExt.toUpperCase()} a ${targetExt.toUpperCase()} en el conversor universal.`
      };
    }
    
    // La primera ruta es la principal (más corta y mejor calidad)
    const primaryPath = allPaths[0];
    const alternativePaths = allPaths.slice(1, 3); // Máximo 2 rutas alternativas
    
    return {
      success: true,
      primaryPath,
      alternativePaths,
      totalRoutesFound: allPaths.length
    };
    
  } catch (error) {
    return {
      success: false,
      primaryPath: null,
      alternativePaths: [],
      totalRoutesFound: 0,
      error: `Error al calcular ruta de conversión: ${error}`
    };
  }
}

/**
 * Función simplificada para compatibilidad con código existente
 */
export function findConversionPath(sourceExt: string, targetExt: string): { optimal: boolean; path: string[] | null } {
  const result = findUniversalConversionRoutes(sourceExt, targetExt);
  
  if (!result.success || !result.primaryPath) {
    return { optimal: false, path: null };
  }
  
  return {
    optimal: result.primaryPath.isOptimal,
    path: result.primaryPath.path
  };
}

/**
 * Verifica si es posible convertir entre dos formatos en conversor universal
 */
export function canConvert(sourceExt: string, targetExt: string): boolean {
  const result = findUniversalConversionRoutes(sourceExt, targetExt);
  return result.success;
}

/**
 * Obtiene estadísticas de la matriz de conversión universal
 */
export function getUniversalConversionStats(): {
  totalFormats: number;
  totalDirectConversions: number;
  totalMultiStepRoutes: number;
  averagePathLength: number;
  hubFormats: string[];
  excludedFormats: string[];
} {
  const allFormats = Object.keys(advancedConversionMatrix);
  const universalFormats = allFormats.filter(f => isSupportedInUniversal(f));
  const excludedFormats = allFormats.filter(f => !isSupportedInUniversal(f));
  
  let directConversions = 0;
  let multiStepRoutes = 0;
  let totalPathLength = 0;
  let totalRoutes = 0;
  
  // Calcular estadísticas solo para formatos universales
  for (const source of universalFormats) {
    for (const target of universalFormats) {
      if (source === target) continue;
      
      const result = findUniversalConversionRoutes(source, target);
      if (result.success && result.primaryPath) {
        totalRoutes++;
        totalPathLength += result.primaryPath.steps;
        
        if (result.primaryPath.steps === 1) {
          directConversions++;
        } else {
          multiStepRoutes++;
        }
      }
    }
  }
  
  return {
    totalFormats: universalFormats.length,
    totalDirectConversions: directConversions,
    totalMultiStepRoutes: multiStepRoutes,
    averagePathLength: totalRoutes > 0 ? totalPathLength / totalRoutes : 0,
    hubFormats: Object.values(HUB_FORMATS),
    excludedFormats: excludedFormats
  };
}

/**
 * Función para testing y debugging del conversor universal
 */
export function testUniversalConversionRoute(source: string, target: string): void {
  console.log(`\n=== Testing Universal Converter: ${source.toUpperCase()} → ${target.toUpperCase()} ===`);
  
  const result = findUniversalConversionRoutes(source, target);
  
  if (!result.success) {
    console.log(`❌ ${result.error}`);
    return;
  }
  
  console.log(`✅ Ruta principal: ${result.primaryPath!.description}`);
  console.log(`   Calidad estimada: ${result.primaryPath!.estimatedQuality}%`);
  console.log(`   Tiempo estimado: ${result.primaryPath!.estimatedTime}s`);
  console.log(`   Recomendada: ${result.primaryPath!.isRecommended ? 'Sí' : 'No'}`);
  
  if (result.primaryPath!.warningMessage) {
    console.log(`   ⚠️  ${result.primaryPath!.warningMessage}`);
  }
  
  if (result.alternativePaths.length > 0) {
    console.log(`\n📋 Rutas alternativas:`);
    result.alternativePaths.forEach((path, index) => {
      console.log(`   ${index + 1}. ${path.description} (${path.estimatedQuality}%)`);
    });
  }
  
  console.log(`\n📊 Total de rutas encontradas: ${result.totalRoutesFound}`);
}

