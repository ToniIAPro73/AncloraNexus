import axios from 'axios';

export interface ConversionOptions {
  quality?: number; // 1-100 para formatos con compresión
  compress?: boolean; // Aplicar compresión adicional
  preserveMetadata?: boolean; // Conservar metadatos del archivo original
  pageRange?: string; // Para documentos, ej: "1-5,8,11-13"
  password?: string; // Para documentos protegidos
  watermark?: string; // Texto para marca de agua
  outputColorSpace?: 'rgb' | 'cmyk' | 'grayscale'; // Para imágenes y PDF
  resolution?: number; // DPI para imágenes
  format?: string; // Formato específico dentro de un tipo general
}

export interface ConversionProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  stage?: 'upload' | 'processing' | 'download'; // Etapa actual
  timeRemaining?: number; // Tiempo restante estimado en segundos
  bytesProcessed?: number;
  totalBytes?: number;
}

export interface ConversionResult {
  fileId: string;
  fileName: string;
  originalFormat: string;
  targetFormat: string;
  downloadUrl: string;
  expiresAt: Date; // Fecha de expiración de la URL de descarga
  fileSize: number;
  previewUrl?: string;
  conversionTime: number; // Tiempo en ms que tomó la conversión
  metadata?: {
    pageCount?: number;
    dimensions?: { width: number; height: number };
    quality?: number;
    [key: string]: any;
  };
}

export interface ConversionError {
  fileId: string;
  fileName: string;
  originalFormat: string;
  targetFormat: string;
  errorCode: string;
  errorMessage: string;
  details?: string;
  recoverySuggestions?: string[];
  canRetry: boolean;
}

export interface BatchConversionStatus {
  batchId: string;
  totalFiles: number;
  completed: number;
  failed: number;
  inProgress: number;
  pending: number;
  overallProgress: number; // 0-100
  startedAt: Date;
  estimatedCompletionTime?: Date;
}

export class ConversionService {
  private static API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 2000; // ms

  /**
   * Convierte un archivo al formato especificado
   * @param file Archivo a convertir
   * @param targetFormat Formato objetivo
  * @param options Opciones de conversión
  * @param onProgress Callback para reportar progreso
   */
  static async convertFile(
    file: File,
    targetFormat: string,
    options: ConversionOptions = {},
    onProgress?: (progress: ConversionProgress) => void
  ): Promise<ConversionResult> {
    const fileId = `file_${Math.random().toString(36).substr(2, 9)}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);
    formData.append('options', JSON.stringify(options));
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      const endpoint = token ? '/conversion/convert' : '/conversion/guest-convert';
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${this.API_URL}${endpoint}`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total);

            onProgress?.({
              fileId,
              fileName: file.name,
              progress: uploadProgress,
              stage: 'upload',
              bytesProcessed: progressEvent.loaded,
              totalBytes: progressEvent.total
            });
          }
        },
        headers
      });

      // Handle different response formats for authenticated vs guest users
      if (response.data.success) {
        // Guest conversion completed immediately
        onProgress?.({
          fileId,
          fileName: file.name,
          progress: 100,
          stage: 'download'
        });

        return {
          fileId,
          fileName: file.name,
          originalFormat: file.type.split('/').pop() || file.name.split('.').pop() || '',
          targetFormat,
          downloadUrl: `${this.API_URL}${response.data.download_url}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          fileSize: response.data.file_size || 0,
          conversionTime: response.data.processing_time * 1000 || 0
        };
      } else if (response.data.conversionId) {
        // Authenticated user - start polling for conversion status
        return await this.pollConversionStatus(
          response.data.conversionId,
          fileId,
          file.name,
          file.type.split('/').pop() || file.name.split('.').pop() || '',
          targetFormat,
          onProgress
        );
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error en la conversión:', error);
      
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data?.message || 'Error en el servidor'
        : 'Error de conexión';
      
      const errorCode = axios.isAxiosError(error) && error.response
        ? error.response.status.toString()
        : 'NETWORK_ERROR';
      
      throw {
        fileId,
        fileName: file.name,
        originalFormat: file.type.split('/').pop() || file.name.split('.').pop() || '',
        targetFormat,
        errorCode,
        errorMessage,
        canRetry: true
      } as ConversionError;
    }
  }
  
  /**
   * Consulta periódicamente el estado de una conversión hasta que se completa
   */
  private static async pollConversionStatus(
    conversionId: string,
    fileId: string,
    fileName: string,
    originalFormat: string,
    targetFormat: string,
    onProgress?: (progress: ConversionProgress) => void
  ): Promise<ConversionResult> {
    let retries = 0;
    
  // Para simular progreso durante el polling
  let lastProgress = 50; // Empezamos en 50% después de la carga
    const progressIncrement = 5;
    
    while (retries < this.MAX_RETRIES * 10) { // Aumentamos el número de intentos para la simulación
      try {
  // En un entorno de producción, esto sería una llamada real a la API
        // Simulamos el proceso para desarrollo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulamos progreso
        if (lastProgress < 99) {
          lastProgress += progressIncrement;
          if (lastProgress > 99) lastProgress = 99;
          
          onProgress?.({
            fileId,
            fileName,
            progress: lastProgress,
            stage: 'processing',
          });
        }
        
  // Después de alcanzar cierto umbral, simulamos la finalización
        if (lastProgress >= 95 && Math.random() > 0.5) {
          // Simulamos la respuesta final
          return {
            fileId,
            fileName,
            originalFormat,
            targetFormat,
            downloadUrl: `https://anclora.nexus/download/${conversionId}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
            fileSize: Math.floor(Math.random() * 10000000), // Tamaño aleatorio
            previewUrl: `https://anclora.nexus/preview/${conversionId}`,
            conversionTime: Math.floor(Math.random() * 10000), // Tiempo aleatorio
            metadata: {
              pageCount: originalFormat.includes('pdf') || targetFormat.includes('pdf') 
                ? Math.floor(Math.random() * 20) + 1 : undefined,
              dimensions: { 
                width: 1920, 
                height: 1080 
              },
              quality: Math.floor(Math.random() * 100)
            }
          };
        }
        
        retries++;
      } catch (error) {
        if (retries >= this.MAX_RETRIES) {
            throw {
            fileId,
            fileName,
            originalFormat,
            targetFormat,
            errorCode: 'POLLING_FAILED',
            errorMessage: 'No se pudo obtener el estado de la conversión',
            canRetry: true
          } as ConversionError;
        }
        
        retries++;
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
      }
    }
    
    throw {
      fileId,
      fileName,
      originalFormat,
      targetFormat,
      errorCode: 'CONVERSION_TIMEOUT',
      errorMessage: 'La conversión ha excedido el tiempo máximo de espera',
      canRetry: true
    } as ConversionError;
  }
  
  /**
   * Inicia una conversión por lotes
   */
  static async startBatchConversion(
    files: File[],
    targetFormat: string,
    options: ConversionOptions = {},
    onFileProgress?: (fileProgress: ConversionProgress) => void,
    onBatchProgress?: (batchStatus: BatchConversionStatus) => void
  ): Promise<string> {
    try {
  // En un entorno real, enviaríamos todos los archivos o sus referencias
      // Para desarrollo, simulamos una respuesta exitosa
      const batchId = `batch_${Math.random().toString(36).substr(2, 9)}`;
      
      // Iniciamos proceso en segundo plano para conversiones individuales
      this.processBatchInBackground(
        batchId,
        files,
        targetFormat,
        options,
        onFileProgress,
        onBatchProgress
      );
      
      return batchId;
    } catch (error) {
  console.error('Error al iniciar conversión por lotes:', error);
  throw new Error('No se pudo iniciar la conversión por lotes');
    }
  }
  
  /**
   * Simula el procesamiento de un lote en segundo plano
   */
  private static async processBatchInBackground(
    batchId: string,
    files: File[],
    targetFormat: string,
    options: ConversionOptions,
    onFileProgress?: (fileProgress: ConversionProgress) => void,
    onBatchProgress?: (batchStatus: BatchConversionStatus) => void
  ) {
    let completed = 0;
    let failed = 0;
    const totalFiles = files.length;
    const startedAt = new Date();
    
    // Procesamos 2-3 archivos a la vez (paralelismo limitado)
    const concurrency = 3;
    const chunks = [];
    
    for (let i = 0; i < files.length; i += concurrency) {
      chunks.push(files.slice(i, i + concurrency));
    }
    
  // Actualización inicial de estado
    onBatchProgress?.({
      batchId,
      totalFiles,
      completed,
      failed,
      inProgress: Math.min(concurrency, totalFiles),
      pending: totalFiles - Math.min(concurrency, totalFiles),
      overallProgress: 0,
      startedAt
    });
    
  // Procesamos los chunks secuencialmente
    for (const chunk of chunks) {
      const inProgress = chunk.length;
      const pending = totalFiles - completed - failed - inProgress;
      
      // Actualizamos estado del lote
      onBatchProgress?.({
        batchId,
        totalFiles,
        completed,
        failed,
        inProgress,
        pending,
        overallProgress: Math.floor((completed + failed) * 100 / totalFiles),
        startedAt
      });
      
      // Procesamos el chunk en paralelo
      await Promise.allSettled(chunk.map(async (file) => {
        try {
          // Convertimos el archivo
          await this.convertFile(
            file,
            targetFormat,
            options,
            (progress) => {
              onFileProgress?.(progress);
              
                // Actualizamos el estado del lote con cada actualización de archivo
              const currentProgress = (completed + failed) * 100 / totalFiles;
              const fileContribution = 1 / totalFiles * progress.progress;
              
              onBatchProgress?.({
                batchId,
                totalFiles,
                completed,
                failed,
                inProgress,
                pending,
                overallProgress: Math.floor(currentProgress + fileContribution / totalFiles),
                startedAt
              });
            }
          );
          
          // Incrementamos contador de completados
          completed++;
        } catch (error) {
          // Incrementamos contador de fallidos
          failed++;
          console.error(`Error al convertir archivo ${file.name}:`, error);
        }
      }));
    }
    
  // Actualización final de estado
    onBatchProgress?.({
      batchId,
      totalFiles,
      completed,
      failed,
      inProgress: 0,
      pending: 0,
      overallProgress: 100,
      startedAt,
      estimatedCompletionTime: new Date()
    });
  }
  
  /**
   * Obtiene el estado de una conversión por lotes
   */
  static async getBatchStatus(batchId: string): Promise<BatchConversionStatus> {
    try {
  // En un entorno real, esto sería una llamada a la API
      const response = await axios.get(`${this.API_URL}/batch/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estado del lote:', error);
      throw new Error('No se pudo obtener el estado del lote');
    }
  }
  
  /**
   * Cancela una conversión o lote en progreso
   */
  static async cancelConversion(id: string): Promise<boolean> {
    try {
      // En un entorno real, esto serÃ­a una llamada a la API
      const response = await axios.post(`${this.API_URL}/cancel/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Error al cancelar la conversión:', error);
      return false;
    }
  }
  
  /**
   * Comprueba si un formato es compatible para conversión
   */
  static isFormatSupported(sourceFormat: string, targetFormat: string): boolean {
    // Mapa de formatos soportados para conversión
    const supportedConversions: Record<string, string[]> = {
      pdf: ['docx', 'txt', 'jpg', 'png', 'epub', 'html'],
      docx: ['pdf', 'txt', 'html', 'epub', 'markdown'],
      jpg: ['png', 'webp', 'pdf', 'gif', 'svg'],
      png: ['jpg', 'webp', 'pdf', 'gif', 'svg'],
      mp4: ['mp3', 'gif', 'webm', 'avi'],
      mp3: ['wav', 'ogg', 'flac'],
      // Más formatos...
    };
    
    // Normalizamos los formatos (eliminamos punto y convertimos a minúsculas)
    const normalizedSource = sourceFormat.replace('.', '').toLowerCase();
    const normalizedTarget = targetFormat.replace('.', '').toLowerCase();
    
    return supportedConversions[normalizedSource]?.includes(normalizedTarget) || false;
  }
  
  /**
   * Estima el tiempo de conversión para un archivo
   */
  static estimateConversionTime(file: File, targetFormat: string): number {
    // En un entorno real, esto podría basarse en datos históricos o heurísticas
    const baseTime = 5000; // 5 segundos base
    const sizeMultiplier = file.size / (1024 * 1024) * 1000; // 1 segundo por MB
    
  // Factores adicionales según el formato
    const formatFactors: Record<string, number> = {
      pdf: 1.5,
      docx: 1.2,
      jpg: 0.8,
      png: 1.0,
      mp4: 3.0,
      mp3: 0.5
    };
    
    const sourceFormat = file.type.split('/').pop() || file.name.split('.').pop() || '';
    const sourceMultiplier = formatFactors[sourceFormat.toLowerCase()] || 1;
    const targetMultiplier = formatFactors[targetFormat.toLowerCase()] || 1;
    
    return baseTime + sizeMultiplier * sourceMultiplier * targetMultiplier;
  }
}

// Exportamos también el mock para entorno de desarrollo
export class ConversionServiceMock extends ConversionService {
  // Métodos específicos para mock si son necesarios
}

// Exportamos la implementación adecuada según el entorno
export default process.env.NODE_ENV === 'development'
  ? ConversionServiceMock
  : ConversionService;

