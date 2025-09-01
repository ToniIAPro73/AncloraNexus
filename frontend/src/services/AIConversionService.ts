// ================================
// ANCLORA NEXUS - AI CONVERSION SERVICE
// Servicio de conversión inteligente con IA
// ================================

export interface AIAnalysis {
  file_type: string;
  content_type: string;
  complexity_level: string;
  quality_indicators: Record<string, number>;
  metadata_richness: number;
  security_level: string;
  ai_recommendations: string[];
  optimal_targets: string[];
}

export interface SmartRecommendation {
  target_format: string;
  use_case: string;
  quality_prediction: number;
  speed_prediction: number;
  cost_efficiency: number;
  ai_reasoning: string;
  best_for: string[];
  avoid_if: string[];
}

export interface ConversionPath {
  sequence_id: string;
  steps: string[];
  total_steps: number;
  estimated_time: number;
  quality_score: number;
  speed_score: number;
  cost_credits: number;
  ai_confidence: number;
  description: string;
  optimization_type: string;
  visual_path: string;
  benefits: string[];
  warnings: string[];
}

export interface FilePreview {
  type: string;
  content: string;
  metadata: Record<string, any>;
  page_count?: number;
  dimensions?: [number, number];
  quality: string;
}

export interface AIConversionResult {
  success: boolean;
  download_id: string;
  output_filename: string;
  processing_time: number;
  quality_score: number;
  steps_completed: number;
  optimization_used: string;
  sequence_description: string;
  ai_confidence: number;
  conversion_logs: string[];
  download_url: string;
  file_size: number;
}

export interface BatchDownloadInfo {
  batch_id: string;
  status: string;
  total_files: number;
  total_size_mb: number;
  created_at: string;
  expires_at: string;
  download_count: number;
  files: Array<{
    file_id: string;
    original_filename: string;
    converted_filename: string;
    file_size_mb: number;
    conversion_info: Record<string, any>;
  }>;
}

class AIConversionService {
  private static API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  /**
   * Analiza un archivo con IA y obtiene recomendaciones inteligentes
   */
  static async analyzeFileWithAI(file: File): Promise<{
    analysis: AIAnalysis;
    smart_recommendations: SmartRecommendation[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.API_URL}/conversion/ai-analyze`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error en análisis IA');
    }

    return {
      analysis: data.analysis,
      smart_recommendations: data.smart_recommendations
    };
  }

  /**
   * Obtiene rutas de conversión optimizadas por IA
   */
  static async getIntelligentConversionPaths(file: File, targetFormat: string): Promise<{
    source_format: string;
    target_format: string;
    file_analysis: Partial<AIAnalysis>;
    conversion_paths: ConversionPath[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);

    const response = await fetch(`${this.API_URL}/conversion/ai-conversion-paths`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error obteniendo rutas IA');
    }

    return data;
  }

  /**
   * Realiza conversión inteligente con secuencias optimizadas
   */
  static async convertWithAI(
    file: File, 
    targetFormat: string, 
    options: {
      sequenceId?: string;
      optimization?: 'quality' | 'speed' | 'balanced';
    } = {}
  ): Promise<AIConversionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);
    
    if (options.sequenceId) {
      formData.append('sequence_id', options.sequenceId);
    }
    
    formData.append('optimization', options.optimization || 'balanced');

    const response = await fetch(`${this.API_URL}/conversion/ai-convert-intelligent`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error en conversión IA');
    }

    return data;
  }

  /**
   * Genera vista previa de archivo
   */
  static async generateFilePreview(file: File, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<{
    preview: FilePreview;
    file_info: Record<string, any>;
    capabilities: Record<string, any>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);

    const response = await fetch(`${this.API_URL}/conversion/preview`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error generando preview');
    }

    return data;
  }

  /**
   * Crea un nuevo lote de descarga
   */
  static async createBatchDownload(): Promise<{ batch_id: string }> {
    const response = await fetch(`${this.API_URL}/conversion/batch/create`, {
      method: 'POST'
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error creando lote');
    }

    return data;
  }

  /**
   * Agrega archivo al lote de descarga
   */
  static async addFileToBatch(
    batchId: string, 
    filePath: string, 
    originalFilename: string, 
    convertedFilename: string, 
    conversionInfo: Record<string, any>
  ): Promise<{ batch_info: BatchDownloadInfo }> {
    const response = await fetch(`${this.API_URL}/conversion/batch/${batchId}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_path: filePath,
        original_filename: originalFilename,
        converted_filename: convertedFilename,
        conversion_info: conversionInfo
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error agregando archivo al lote');
    }

    return data;
  }

  /**
   * Prepara el ZIP del lote para descarga
   */
  static async prepareBatchZip(batchId: string): Promise<{
    batch_info: BatchDownloadInfo;
    download_url: string;
  }> {
    const response = await fetch(`${this.API_URL}/conversion/batch/${batchId}/prepare`, {
      method: 'POST'
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error preparando lote');
    }

    return data;
  }

  /**
   * Obtiene información del lote
   */
  static async getBatchInfo(batchId: string): Promise<BatchDownloadInfo> {
    const response = await fetch(`${this.API_URL}/conversion/batch/${batchId}/info`);

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error obteniendo información del lote');
    }

    return data.batch_info;
  }

  /**
   * Obtiene estadísticas de lotes
   */
  static async getBatchStatistics(): Promise<Record<string, any>> {
    const response = await fetch(`${this.API_URL}/conversion/batch/stats`);

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error obteniendo estadísticas');
    }

    return data.statistics;
  }

  /**
   * Workflow completo: análisis + rutas + conversión
   */
  static async intelligentConversionWorkflow(
    file: File,
    targetFormat: string,
    optimizationType: 'quality' | 'speed' | 'balanced' = 'balanced'
  ): Promise<{
    analysis: AIAnalysis;
    recommendations: SmartRecommendation[];
    paths: ConversionPath[];
    result: AIConversionResult;
  }> {
    // 1. Análisis IA
    const { analysis, smart_recommendations } = await this.analyzeFileWithAI(file);
    
    // 2. Obtener rutas inteligentes
    const pathsData = await this.getIntelligentConversionPaths(file, targetFormat);
    
    // 3. Seleccionar mejor ruta según optimización
    let selectedPath: ConversionPath | undefined;
    
    if (optimizationType === 'quality') {
      selectedPath = pathsData.conversion_paths.reduce((best, current) => 
        current.quality_score > best.quality_score ? current : best
      );
    } else if (optimizationType === 'speed') {
      selectedPath = pathsData.conversion_paths.reduce((best, current) => 
        current.speed_score > best.speed_score ? current : best
      );
    } else {
      // balanced
      selectedPath = pathsData.conversion_paths.reduce((best, current) => {
        const currentScore = current.quality_score * 0.5 + current.speed_score * 0.3 + current.ai_confidence * 0.2;
        const bestScore = best.quality_score * 0.5 + best.speed_score * 0.3 + best.ai_confidence * 0.2;
        return currentScore > bestScore ? current : best;
      });
    }
    
    // 4. Ejecutar conversión con la ruta seleccionada
    const result = await this.convertWithAI(file, targetFormat, {
      sequenceId: selectedPath?.sequence_id,
      optimization: optimizationType
    });
    
    return {
      analysis,
      recommendations: smart_recommendations,
      paths: pathsData.conversion_paths,
      result
    };
  }

  /**
   * Convierte múltiples archivos y crea lote ZIP
   */
  static async batchConvertWithAI(
    files: Array<{ file: File; targetFormat: string; optimization?: string }>,
    onProgress?: (fileIndex: number, progress: number, message: string) => void
  ): Promise<{
    batch_id: string;
    results: AIConversionResult[];
    download_url: string;
    batch_info: BatchDownloadInfo;
  }> {
    // Crear lote
    const { batch_id } = await this.createBatchDownload();
    const results: AIConversionResult[] = [];
    
    // Procesar cada archivo
    for (let i = 0; i < files.length; i++) {
      const { file, targetFormat, optimization = 'balanced' } = files[i];
      
      onProgress?.(i, 0, `Procesando ${file.name}...`);
      
      try {
        const result = await this.convertWithAI(file, targetFormat, { optimization });
        results.push(result);
        
        onProgress?.(i, 100, `${file.name} completado`);
      } catch (error) {
        console.error(`Error convirtiendo ${file.name}:`, error);
        onProgress?.(i, 100, `Error en ${file.name}`);
      }
    }
    
    // Preparar ZIP
    const { batch_info, download_url } = await this.prepareBatchZip(batch_id);
    
    return {
      batch_id,
      results,
      download_url,
      batch_info
    };
  }
}

export { AIConversionService };
