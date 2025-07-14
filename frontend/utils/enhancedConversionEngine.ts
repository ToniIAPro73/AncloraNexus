import { 
  enhancedConversionMatrix, 
  conversionQualityMap,
  MAX_CONVERSION_STEPS,
  RECOMMENDED_MAX_STEPS,
  calculateFinalQuality,
  isRecommendedRoute,
  getRouteDescription,
  HUB_FORMATS
} from './enhancedConversionMaps';

export interface ConversionPath {
  path: string[];
  steps: number;
  isOptimal: boolean;
  isRecommended: boolean;
  estimatedQuality: number;
  description: string;
  estimatedTime: number; // en segundos
}

export interface ConversionResult {
  success: boolean;
  primaryPath: ConversionPath | null;
  alternativePaths: ConversionPath[];
  error?: string;
}

/**
 * Algoritmo BFS mejorado que encuentra múltiples rutas y las evalúa
 */
function findAllPaths(start: string, goal: string, maxSteps: number = MAX_CONVERSION_STEPS): ConversionPath[] {
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
      const conversionPath = createConversionPath(path, start, goal);
      allPaths.push(conversionPath);
      continue;
    }
    
    // Si ya alcanzamos el máximo de pasos, no continuar
    if (path.length >= maxSteps) {
      continue;
    }
    
    // Explorar vecinos
    const neighbors = enhancedConversionMatrix[current] || [];
    for (const next of neighbors) {
      const nextLower = next.toLowerCase();
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
function createConversionPath(path: string[], originalStart: string, originalGoal: string): ConversionPath {
  const steps = path.length - 1;
  const isOptimal = steps === 1;
  const isRecommended = isRecommendedRoute(path);
  
  // Calcular calidad estimada
  let baseQuality = 95; // Calidad base alta
  if (conversionQualityMap[path[0]] && conversionQualityMap[path[0]][path[path.length - 1]]) {
    baseQuality = conversionQualityMap[path[0]][path[path.length - 1]].qualityScore;
  }
  
  const estimatedQuality = calculateFinalQuality(baseQuality, steps);
  
  // Calcular tiempo estimado (base + tiempo por paso)
  const baseTime = 2; // 2 segundos base
  const timePerStep = 1.5; // 1.5 segundos por paso adicional
  const estimatedTime = baseTime + (steps - 1) * timePerStep;
  
  // Crear path con formato original
  const formattedPath = [originalStart, ...path.slice(1, -1), originalGoal];
  
  return {
    path: formattedPath,
    steps,
    isOptimal,
    isRecommended,
    estimatedQuality,
    description: getRouteDescription(formattedPath),
    estimatedTime
  };
}

/**
 * Función principal para encontrar rutas de conversión
 */
export function findConversionRoutes(sourceExt: string, targetExt: string): ConversionResult {
  try {
    const allPaths = findAllPaths(sourceExt, targetExt);
    
    if (allPaths.length === 0) {
      return {
        success: false,
        primaryPath: null,
        alternativePaths: [],
        error: `No se encontró ruta de conversión de ${sourceExt.toUpperCase()} a ${targetExt.toUpperCase()}`
      };
    }
    
    // La primera ruta es la principal (más corta y mejor calidad)
    const primaryPath = allPaths[0];
    const alternativePaths = allPaths.slice(1, 3); // Máximo 2 rutas alternativas
    
    return {
      success: true,
      primaryPath,
      alternativePaths,
    };
    
  } catch (error) {
    return {
      success: false,
      primaryPath: null,
      alternativePaths: [],
      error: `Error al calcular ruta de conversión: ${error}`
    };
  }
}

/**
 * Función simplificada para compatibilidad con código existente
 */
export function findConversionPath(sourceExt: string, targetExt: string): { optimal: boolean; path: string[] | null } {
  const result = findConversionRoutes(sourceExt, targetExt);
  
  if (!result.success || !result.primaryPath) {
    return { optimal: false, path: null };
  }
  
  return {
    optimal: result.primaryPath.isOptimal,
    path: result.primaryPath.path
  };
}

/**
 * Verifica si es posible convertir entre dos formatos
 */
export function canConvert(sourceExt: string, targetExt: string): boolean {
  const result = findConversionRoutes(sourceExt, targetExt);
  return result.success;
}

/**
 * Obtiene estadísticas de la matriz de conversión
 */
export function getConversionStats(): {
  totalFormats: number;
  totalDirectConversions: number;
  totalMultiStepRoutes: number;
  averagePathLength: number;
  hubFormats: string[];
} {
  const formats = Object.keys(enhancedConversionMatrix);
  let directConversions = 0;
  let multiStepRoutes = 0;
  let totalPathLength = 0;
  let totalRoutes = 0;
  
  // Calcular estadísticas
  for (const source of formats) {
    for (const target of formats) {
      if (source === target) continue;
      
      const result = findConversionRoutes(source, target);
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
    totalFormats: formats.length,
    totalDirectConversions: directConversions,
    totalMultiStepRoutes: multiStepRoutes,
    averagePathLength: totalRoutes > 0 ? totalPathLength / totalRoutes : 0,
    hubFormats: Object.values(HUB_FORMATS)
  };
}

/**
 * Función para testing y debugging
 */
export function testConversionRoute(source: string, target: string): void {
  console.log(`\n=== Testing ${source.toUpperCase()} → ${target.toUpperCase()} ===`);
  
  const result = findConversionRoutes(source, target);
  
  if (!result.success) {
    console.log(`❌ ${result.error}`);
    return;
  }
  
  console.log(`✅ Ruta principal: ${result.primaryPath!.description}`);
  console.log(`   Calidad estimada: ${result.primaryPath!.estimatedQuality}%`);
  console.log(`   Tiempo estimado: ${result.primaryPath!.estimatedTime}s`);
  console.log(`   Recomendada: ${result.primaryPath!.isRecommended ? 'Sí' : 'No'}`);
  
  if (result.alternativePaths.length > 0) {
    console.log(`\n📋 Rutas alternativas:`);
    result.alternativePaths.forEach((path, index) => {
      console.log(`   ${index + 1}. ${path.description} (${path.estimatedQuality}%)`);
    });
  }
}

