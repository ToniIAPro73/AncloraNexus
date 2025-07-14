import { 
  advancedConversionMatrix, 
  conversionQualityMap,
  MAX_CONVERSION_STEPS,
  calculateFinalQuality,
  isSupportedInUniversal,
  HUB_FORMATS
} from './advancedConversionMaps';

export interface ProfessionalConversionPath {
  path: string[];
  steps: number;
  isOptimal: boolean;
  isProfessional: boolean;
  estimatedQuality: number;
  description: string;
  estimatedTime: number;
  justification: string;
  workflow: 'simple' | 'professional' | 'collaborative' | 'multi_output';
  warningMessage?: string;
  technicalBenefits: string[];
}

export interface ProfessionalConversionResult {
  success: boolean;
  primaryPath: ProfessionalConversionPath | null;
  alternativePaths: ProfessionalConversionPath[];
  professionalPaths: ProfessionalConversionPath[];
  error?: string;
  recommendation: string;
}

// Workflows profesionales específicos basados en el análisis
const PROFESSIONAL_WORKFLOWS = {
  // Audio Profesional: Multipista → WAV → ProRes → AAC → MP3
  audio_mastering: {
    pattern: ['wav', 'aac', 'mp3'],
    justification: 'Masterización profesional con preservación de calidad máxima',
    benefits: [
      'Mantiene calidad máxima durante sincronización audio-video',
      'Permite corrección de tiempo y pitch sin degradación',
      'Facilita generación de múltiples formatos finales'
    ]
  },
  
  // Video Profesional: RAW → ProRes → DNxHD → H.264
  video_postproduction: {
    pattern: ['mov', 'avi', 'mp4'],
    justification: 'Post-producción cinematográfica con control granular',
    benefits: [
      'Edición en tiempo real con calidad profesional',
      'Mayor control en corrección de color y efectos',
      'Optimización para distribución manteniendo calidad'
    ]
  },
  
  // Imagen Profesional: RAW → TIFF → PSD → JPEG
  image_professional: {
    pattern: ['tiff', 'png', 'jpg'],
    justification: 'Edición de imagen avanzada con control granular',
    benefits: [
      'Preserva rango dinámico completo',
      'Permite edición no destructiva con capas',
      'Optimización específica para uso final'
    ]
  },
  
  // Documento Profesional: DOCX → PDF → PNG → WEBP
  document_publishing: {
    pattern: ['pdf', 'png', 'webp'],
    justification: 'Publicación multi-formato con optimización específica',
    benefits: [
      'Preserva formato y estructura completa',
      'Permite optimización para web',
      'Compatibilidad universal'
    ]
  }
};

// Detectar si un archivo requiere workflow profesional
function detectProfessionalWorkflow(sourceExt: string, targetExt: string, fileSize?: number): string | null {
  const source = sourceExt.toLowerCase();
  const target = targetExt.toLowerCase();
  
  // Audio profesional
  if (['wav', 'flac', 'aiff'].includes(source) && ['mp3', 'aac', 'm4a'].includes(target)) {
    if (fileSize && fileSize > 50 * 1024 * 1024) { // > 50MB
      return 'audio_mastering';
    }
  }
  
  // Video profesional
  if (['mov', 'avi', 'mkv'].includes(source) && ['mp4', 'webm'].includes(target)) {
    if (fileSize && fileSize > 100 * 1024 * 1024) { // > 100MB
      return 'video_postproduction';
    }
  }
  
  // Imagen profesional
  if (['tiff', 'psd', 'ai'].includes(source) && ['jpg', 'png', 'webp'].includes(target)) {
    return 'image_professional';
  }
  
  // Documento profesional
  if (['docx', 'doc', 'rtf'].includes(source) && ['webp', 'png'].includes(target)) {
    return 'document_publishing';
  }
  
  return null;
}

// Evaluar si múltiples intermedios están justificados
function evaluateMultipleIntermediates(path: string[], workflow?: string): {
  justified: boolean;
  reason: string;
  benefits: string[];
} {
  const steps = path.length - 1;
  
  if (steps <= 2) {
    return {
      justified: true,
      reason: 'Conversión directa o con un intermedio optimizado',
      benefits: ['Eficiencia máxima', 'Mínima pérdida de calidad']
    };
  }
  
  if (workflow && PROFESSIONAL_WORKFLOWS[workflow]) {
    const workflowData = PROFESSIONAL_WORKFLOWS[workflow];
    return {
      justified: true,
      reason: workflowData.justification,
      benefits: workflowData.benefits
    };
  }
  
  if (steps === 3) {
    // Evaluar si cada paso aporta valor técnico
    const hasQualityPreservation = path.includes('wav') || path.includes('tiff') || path.includes('pdf');
    const hasOptimization = path.includes('webp') || path.includes('aac') || path.includes('mp4');
    
    if (hasQualityPreservation && hasOptimization) {
      return {
        justified: true,
        reason: 'Cada intermedio aporta valor técnico específico',
        benefits: [
          'Preservación de calidad en etapas críticas',
          'Optimización específica para destino final',
          'Control granular del proceso'
        ]
      };
    }
  }
  
  return {
    justified: false,
    reason: 'Múltiples intermedios no aportan valor técnico suficiente',
    benefits: []
  };
}

// Algoritmo BFS mejorado para workflows profesionales
function findProfessionalPaths(start: string, goal: string, fileSize?: number): ProfessionalConversionPath[] {
  if (!isSupportedInUniversal(start) || !isSupportedInUniversal(goal)) {
    return [];
  }

  const startLower = start.toLowerCase();
  const goalLower = goal.toLowerCase();
  const allPaths: ProfessionalConversionPath[] = [];
  
  // Detectar workflow profesional
  const detectedWorkflow = detectProfessionalWorkflow(start, goal, fileSize);
  
  // BFS con límite extendido para workflows profesionales
  const maxSteps = detectedWorkflow ? 5 : MAX_CONVERSION_STEPS;
  const queue: [string, string[]][] = [[startLower, [startLower]]];
  const visited = new Map<string, number>();
  
  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    
    if (visited.has(current) && visited.get(current)! < path.length) {
      continue;
    }
    visited.set(current, path.length);
    
    if (current === goalLower) {
      const conversionPath = createProfessionalPath(path, start, goal, detectedWorkflow, fileSize);
      if (conversionPath) {
        allPaths.push(conversionPath);
      }
      continue;
    }
    
    if (path.length >= maxSteps) {
      continue;
    }
    
    const neighbors = advancedConversionMatrix[current] || [];
    for (const next of neighbors) {
      const nextLower = next.toLowerCase();
      
      if (!isSupportedInUniversal(nextLower) || path.includes(nextLower)) {
        continue;
      }
      
      queue.push([nextLower, [...path, nextLower]]);
    }
  }
  
  // Ordenar por tipo de workflow y calidad
  return allPaths.sort((a, b) => {
    if (a.isProfessional !== b.isProfessional) {
      return a.isProfessional ? -1 : 1;
    }
    if (a.steps !== b.steps) return a.steps - b.steps;
    return b.estimatedQuality - a.estimatedQuality;
  });
}

function createProfessionalPath(
  path: string[], 
  originalStart: string, 
  originalGoal: string, 
  workflow?: string | null,
  fileSize?: number
): ProfessionalConversionPath | null {
  const steps = path.length - 1;
  const isOptimal = steps === 1;
  const isProfessional = workflow !== null || steps >= 3;
  
  // Evaluar justificación de múltiples intermedios
  const evaluation = evaluateMultipleIntermediates(path, workflow || undefined);
  
  // Calcular calidad con bonificación para workflows profesionales
  let baseQuality = 90;
  if (workflow && PROFESSIONAL_WORKFLOWS[workflow]) {
    baseQuality = 95; // Bonificación para workflows profesionales
  }
  
  const estimatedQuality = calculateFinalQuality(baseQuality, steps);
  
  // Calcular tiempo con consideración de complejidad profesional
  const baseTime = isProfessional ? 5 : 3;
  const timePerStep = isProfessional ? 3 : 2;
  const estimatedTime = baseTime + (steps - 1) * timePerStep;
  
  // Determinar tipo de workflow
  let workflowType: 'simple' | 'professional' | 'collaborative' | 'multi_output' = 'simple';
  if (workflow) {
    workflowType = 'professional';
  } else if (steps >= 4) {
    workflowType = 'collaborative';
  } else if (steps === 3) {
    workflowType = 'multi_output';
  }
  
  // Generar descripción
  let description = '';
  if (isOptimal) {
    description = `Conversión directa: ${originalStart.toUpperCase()} → ${originalGoal.toUpperCase()}`;
  } else if (isProfessional) {
    description = `Workflow profesional (${steps} pasos): ${[originalStart, ...path.slice(1, -1), originalGoal].map(f => f.toUpperCase()).join(' → ')}`;
  } else {
    description = `Ruta optimizada (${steps} pasos): ${[originalStart, ...path.slice(1, -1), originalGoal].map(f => f.toUpperCase()).join(' → ')}`;
  }
  
  // Generar advertencias
  let warningMessage: string | undefined;
  if (!evaluation.justified) {
    warningMessage = `${evaluation.reason}. Considere conversión más directa.`;
  } else if (steps > 3 && !workflow) {
    warningMessage = `Conversión compleja (${steps} pasos). Verifique que cada intermedio aporte valor técnico.`;
  }
  
  return {
    path: [originalStart, ...path.slice(1, -1), originalGoal],
    steps,
    isOptimal,
    isProfessional,
    estimatedQuality,
    description,
    estimatedTime,
    justification: evaluation.reason,
    workflow: workflowType,
    warningMessage,
    technicalBenefits: evaluation.benefits
  };
}

export function findProfessionalConversionRoutes(
  sourceExt: string, 
  targetExt: string, 
  fileSize?: number
): ProfessionalConversionResult {
  try {
    if (!isSupportedInUniversal(sourceExt) || !isSupportedInUniversal(targetExt)) {
      return {
        success: false,
        primaryPath: null,
        alternativePaths: [],
        professionalPaths: [],
        error: `Los formatos de e-book requieren el conversor especializado.`,
        recommendation: 'Use el Conversor de E-books para estos formatos.'
      };
    }

    const allPaths = findProfessionalPaths(sourceExt, targetExt, fileSize);
    
    if (allPaths.length === 0) {
      return {
        success: false,
        primaryPath: null,
        alternativePaths: [],
        professionalPaths: [],
        error: `No se encontró ruta de conversión de ${sourceExt.toUpperCase()} a ${targetExt.toUpperCase()}.`,
        recommendation: 'Verifique que ambos formatos estén soportados en el conversor universal.'
      };
    }
    
    // Separar rutas por tipo
    const professionalPaths = allPaths.filter(p => p.isProfessional);
    const standardPaths = allPaths.filter(p => !p.isProfessional);
    
    // La ruta principal es la primera (mejor calidad/pasos)
    const primaryPath = allPaths[0];
    const alternativePaths = allPaths.slice(1, 4); // Hasta 3 alternativas
    
    // Generar recomendación
    let recommendation = '';
    if (professionalPaths.length > 0 && fileSize && fileSize > 10 * 1024 * 1024) {
      recommendation = 'Se detectó archivo grande. Considere workflow profesional para máxima calidad.';
    } else if (primaryPath.steps === 1) {
      recommendation = 'Conversión directa disponible. Recomendada para máxima eficiencia.';
    } else if (primaryPath.steps <= 3) {
      recommendation = 'Ruta optimizada con intermedios justificados técnicamente.';
    } else {
      recommendation = 'Conversión compleja. Evalúe si cada paso aporta valor técnico necesario.';
    }
    
    return {
      success: true,
      primaryPath,
      alternativePaths,
      professionalPaths,
      recommendation
    };
    
  } catch (error) {
    return {
      success: false,
      primaryPath: null,
      alternativePaths: [],
      professionalPaths: [],
      error: `Error al calcular ruta de conversión: ${error}`,
      recommendation: 'Contacte soporte técnico si el problema persiste.'
    };
  }
}

// Función para testing de workflows profesionales
export function testProfessionalWorkflow(source: string, target: string, fileSize?: number): void {
  console.log(`\n=== Testing Professional Workflow: ${source.toUpperCase()} → ${target.toUpperCase()} ===`);
  if (fileSize) {
    console.log(`   Tamaño de archivo: ${(fileSize / 1024 / 1024).toFixed(1)}MB`);
  }
  
  const result = findProfessionalConversionRoutes(source, target, fileSize);
  
  if (!result.success) {
    console.log(`❌ ${result.error}`);
    return;
  }
  
  console.log(`✅ Ruta principal: ${result.primaryPath!.description}`);
  console.log(`   Workflow: ${result.primaryPath!.workflow.toUpperCase()}`);
  console.log(`   Calidad estimada: ${result.primaryPath!.estimatedQuality}%`);
  console.log(`   Tiempo estimado: ${result.primaryPath!.estimatedTime}s`);
  console.log(`   Justificación: ${result.primaryPath!.justification}`);
  
  if (result.primaryPath!.technicalBenefits.length > 0) {
    console.log(`   Beneficios técnicos:`);
    result.primaryPath!.technicalBenefits.forEach(benefit => {
      console.log(`     • ${benefit}`);
    });
  }
  
  if (result.primaryPath!.warningMessage) {
    console.log(`   ⚠️  ${result.primaryPath!.warningMessage}`);
  }
  
  if (result.professionalPaths.length > 0) {
    console.log(`\n🎯 Workflows profesionales disponibles: ${result.professionalPaths.length}`);
  }
  
  console.log(`\n💡 Recomendación: ${result.recommendation}`);
}

