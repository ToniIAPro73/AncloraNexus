// Motor de conversión específico para libros electrónicos
// Extiende el sistema existente siguiendo guía de estilos Anclora
import { 
  EbookFormat, 
  EbookConversionRequest, 
  EbookConversionResult, 
  EbookConversionPath 
} from '../types/ebook';
import { ExtendedConversionResult } from '../types/conversion';
import { 
  canConvertEbook, 
  getEbookConversionQuality, 
  getEbookConversionMethod,
  getAllConversionsFrom 
} from './ebookConversionMaps';
import { ConversionResult, findConversionPath } from './conversionEngine';
export class EbookConversionEngine {
  private maxPathLength: number;
  private qualityThreshold: 'excellent' | 'good' | 'fair' | 'poor';
  constructor(maxPathLength = 3, qualityThreshold: 'excellent' | 'good' | 'fair' | 'poor' = 'fair') {
    this.maxPathLength = maxPathLength;
    this.qualityThreshold = qualityThreshold;
  }
  /**
   * Encuentra la mejor ruta de conversión para e-books
   * Integra con el sistema existente de conversión general
   */
  findEbookConversionPath(sourceFormat: EbookFormat, targetFormat: EbookFormat): ExtendedConversionResult {
    // Verificar conversión directa primero
    const directConversion = this.checkDirectConversion(sourceFormat, targetFormat);
    if (directConversion.optimal) {
      return directConversion;
    }
    // Buscar ruta indirecta si no hay conversión directa
    const indirectPath = this.findIndirectPath(sourceFormat, targetFormat);
    if (indirectPath.path) {
      return indirectPath;
    }
    // Si no hay ruta de e-book específica, usar el motor general
    const fallbackResult = findConversionPath(sourceFormat, targetFormat);
    
    return {
      optimal: false,
      path: fallbackResult.path,
      isEbookConversion: false,
      recommendedMethod: 'calibre',
      estimatedQuality: 'poor',
      preservesMetadata: false
    };
  }
  /**
   * Verifica conversión directa entre formatos de e-book
   */
  private checkDirectConversion(source: EbookFormat, target: EbookFormat): ExtendedConversionResult {
    const canConvert = canConvertEbook(source, target);
    
    if (canConvert) {
      const quality = getEbookConversionQuality(source, target);
      const method = getEbookConversionMethod(source, target);
      return {
        optimal: true,
        path: [source, target],
        isEbookConversion: true,
        recommendedMethod: method?.method || 'calibre',
        estimatedQuality: quality?.quality || 'good',
        preservesMetadata: quality?.preservesMetadata || false
      };
    }
    return {
      optimal: false,
      path: null,
      isEbookConversion: true,
      recommendedMethod: 'calibre',
      estimatedQuality: 'poor',
      preservesMetadata: false
    };
  }
  /**
   * Encuentra ruta indirecta usando BFS optimizado para e-books
   */
  private findIndirectPath(source: EbookFormat, target: EbookFormat): ExtendedConversionResult {
    const visited = new Set<EbookFormat>([source]);
    const queue: Array<{ format: EbookFormat; path: EbookFormat[]; quality: number }> = [
      { format: source, path: [source], quality: 1.0 }
    ];
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.path.length >= this.maxPathLength) {
        continue;
      }
      const availableConversions = getAllConversionsFrom(current.format);
      
      for (const conversion of availableConversions) {
        if (visited.has(conversion.to)) {
          continue;
        }
        const newPath = [...current.path, conversion.to];
        const qualityScore = this.calculateQualityScore(conversion.quality?.quality || 'fair');
        const combinedQuality = current.quality * qualityScore;
        if (conversion.to === target) {
          return {
            optimal: newPath.length === 2,
            path: newPath,
            isEbookConversion: true,
            recommendedMethod: conversion.method?.method || 'calibre',
            estimatedQuality: this.getQualityFromScore(combinedQuality),
            preservesMetadata: conversion.quality?.preservesMetadata || false
          };
        }
        visited.add(conversion.to);
        queue.push({
          format: conversion.to,
          path: newPath,
          quality: combinedQuality
        });
      }
    }
    return {
      optimal: false,
      path: null,
      isEbookConversion: true,
      recommendedMethod: 'calibre',
      estimatedQuality: 'poor',
      preservesMetadata: false
    };
  }
  /**
   * Calcula puntuación numérica de calidad
   */
  private calculateQualityScore(quality: 'excellent' | 'good' | 'fair' | 'poor'): number {
    const scores = {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.4
    };
    return scores[quality];
  }
  /**
   * Convierte puntuación numérica a calidad textual
   */
  private getQualityFromScore(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.7) return 'good';
    if (score >= 0.5) return 'fair';
    return 'poor';
  }
  /**
   * Obtiene todas las rutas posibles para una conversión (para análisis)
   */
  getAllPossiblePaths(source: EbookFormat, target: EbookFormat): EbookConversionPath[] {
    const paths: EbookConversionPath[] = [];
    
    // Ruta directa
    if (canConvertEbook(source, target)) {
      const quality = getEbookConversionQuality(source, target);
      paths.push({
        from: source,
        to: target,
        method: 'direct',
        difficulty: this.getDifficultyFromQuality(quality?.quality || 'fair'),
        qualityRetention: quality?.quality || 'fair',
        preservesFormatting: quality?.preservesFormatting || false,
        preservesImages: quality?.preservesImages || false,
        preservesMetadata: quality?.preservesMetadata || false
      });
    }
    // Rutas indirectas (simplificado - solo un intermedio)
    const intermediateFormats = [EbookFormat.EPUB, EbookFormat.PDF, EbookFormat.HTML];
    
    for (const intermediate of intermediateFormats) {
      if (intermediate === source || intermediate === target) continue;
      
      if (canConvertEbook(source, intermediate) && canConvertEbook(intermediate, target)) {
        const quality1 = getEbookConversionQuality(source, intermediate);
        const quality2 = getEbookConversionQuality(intermediate, target);
        
        // Calidad combinada (la peor de las dos)
        const combinedQuality = this.getCombinedQuality(quality1?.quality, quality2?.quality);
        
        paths.push({
          from: source,
          to: target,
          method: 'intermediate',
          intermediateFormat: intermediate,
          difficulty: this.getDifficultyFromQuality(combinedQuality),
          qualityRetention: combinedQuality,
          preservesFormatting: (quality1?.preservesFormatting && quality2?.preservesFormatting) || false,
          preservesImages: (quality1?.preservesImages && quality2?.preservesImages) || false,
          preservesMetadata: (quality1?.preservesMetadata && quality2?.preservesMetadata) || false
        });
      }
    }
    return paths.sort((a, b) => {
      // Preferir rutas directas
      if (a.method === 'direct' && b.method !== 'direct') return -1;
      if (b.method === 'direct' && a.method !== 'direct') return 1;
      
      // Luego por calidad
      const qualityOrder = { excellent: 4, good: 3, fair: 2, poor: 1 };
      return qualityOrder[b.qualityRetention] - qualityOrder[a.qualityRetention];
    });
  }
  /**
   * Calcula dificultad basada en calidad
   */
  private getDifficultyFromQuality(quality?: 'excellent' | 'good' | 'fair' | 'poor'): 'easy' | 'medium' | 'hard' {
    switch (quality) {
      case 'excellent':
      case 'good':
        return 'easy';
      case 'fair':
        return 'medium';
      case 'poor':
      default:
        return 'hard';
    }
  }
  /**
   * Combina dos calidades tomando la peor
   */
  private getCombinedQuality(
    quality1?: 'excellent' | 'good' | 'fair' | 'poor',
    quality2?: 'excellent' | 'good' | 'fair' | 'poor'
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const order = { excellent: 4, good: 3, fair: 2, poor: 1 };
    const score1 = quality1 ? order[quality1] : 1;
    const score2 = quality2 ? order[quality2] : 1;
    const minScore = Math.min(score1, score2);
    
    const reverseOrder = { 4: 'excellent', 3: 'good', 2: 'fair', 1: 'poor' } as const;
    return reverseOrder[minScore as keyof typeof reverseOrder];
  }
  /**
   * Obtiene recomendaciones para optimizar una conversión
   */
  getOptimizationRecommendations(source: EbookFormat, target: EbookFormat): string[] {
    const recommendations: string[] = [];
    const conversionPath = this.findEbookConversionPath(source, target);
    
    if (!conversionPath.path) {
      recommendations.push('❌ Conversión no soportada directamente');
      return recommendations;
    }
    // Recomendaciones basadas en el formato origen
    switch (source) {
      case EbookFormat.PDF:
        recommendations.push('📄 Para mejores resultados, asegúrese de que el PDF contenga texto seleccionable');
        recommendations.push('🔍 PDFs escaneados requieren OCR previo');
        break;
      case EbookFormat.TXT:
        recommendations.push('📝 Considere añadir estructura (títulos, capítulos) antes de la conversión');
        break;
      case EbookFormat.HTML:
        recommendations.push('🌐 Asegúrese de que las rutas de imágenes sean válidas');
        break;
    }
    // Recomendaciones basadas en el formato destino
    switch (target) {
      case EbookFormat.EPUB:
        recommendations.push('📖 EPUB: Formato recomendado para la mayoría de lectores');
        break;
      case EbookFormat.MOBI:
      case EbookFormat.AZW3:
        recommendations.push('📱 Optimizado para dispositivos Kindle');
        break;
      case EbookFormat.PDF:
        recommendations.push('📄 PDF: Ideal para preservar diseño original');
        break;
    }
    // Recomendaciones basadas en calidad
    switch (conversionPath.estimatedQuality) {
      case 'excellent':
        recommendations.push('✅ Conversión de alta calidad con preservación completa');
        break;
      case 'good':
        recommendations.push('✅ Buena conversión con preservación de contenido principal');
        break;
      case 'fair':
        recommendations.push('⚠️ Conversión aceptable, revisar resultado final');
        break;
      case 'poor':
        recommendations.push('⚠️ Conversión limitada, considerar formato intermedio');
        break;
    }
    return recommendations;
  }
  /**
   * Valida si una conversión es viable
   */
  validateConversion(request: EbookConversionRequest): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Validar formatos
    if (!Object.values(EbookFormat).includes(request.sourceFile.format)) {
      errors.push(`Formato de origen no soportado: ${request.sourceFile.format}`);
    }
    if (!Object.values(EbookFormat).includes(request.targetFormat)) {
      errors.push(`Formato de destino no soportado: ${request.targetFormat}`);
    }
    // Validar que la conversión sea posible
    const conversionPath = this.findEbookConversionPath(request.sourceFile.format, request.targetFormat);
    if (!conversionPath.path) {
      errors.push(`No existe ruta de conversión de ${request.sourceFile.format} a ${request.targetFormat}`);
    }
    // Advertencias de calidad
    if (conversionPath.estimatedQuality === 'poor') {
      warnings.push('La conversión puede resultar en pérdida significativa de formato');
    }
    if (!conversionPath.preservesMetadata && request.preserveMetadata) {
      warnings.push('Los metadatos pueden no preservarse completamente en esta conversión');
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
// Instancia por defecto del motor de conversión
export const ebookConversionEngine = new EbookConversionEngine();
// Funciones utilitarias para integración con el sistema existente
export function canConvertEbookFormats(sourceExt: string, targetExt: string): boolean {
  const sourceFormat = sourceExt.toLowerCase() as EbookFormat;
  const targetFormat = targetExt.toLowerCase() as EbookFormat;
  
  if (!Object.values(EbookFormat).includes(sourceFormat) || 
      !Object.values(EbookFormat).includes(targetFormat)) {
    return false;
  }
  
  return canConvertEbook(sourceFormat, targetFormat);
}
export function findEbookConversionPath(sourceExt: string, targetExt: string): ExtendedConversionResult {
  const sourceFormat = sourceExt.toLowerCase() as EbookFormat;
  const targetFormat = targetExt.toLowerCase() as EbookFormat;
  
  return ebookConversionEngine.findEbookConversionPath(sourceFormat, targetFormat);
}
export default ebookConversionEngine;