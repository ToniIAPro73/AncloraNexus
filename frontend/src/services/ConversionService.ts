import axios from 'axios';

export interface ConversionOptions {
  quality?: number; // 1-100 para formatos con compresiÃ³n
  compress?: boolean; // Aplicar compresiÃ³n adicional
  preserveMetadata?: boolean; // Conservar metadatos del archivo original
  pageRange?: string; // Para documentos, ej: "1-5,8,11-13"
  password?: string; // Para documentos protegidos
  watermark?: string; // Texto para marca de agua
  outputColorSpace?: 'rgb' | 'cmyk' | 'grayscale'; // Para imÃ¡genes y PDF
  resolution?: number; // DPI para imÃ¡genes
  format?: string; // Formato especÃ­fico dentro de un tipo general
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
  expiresAt: Date; // Fecha de expiraciÃ³n de la URL de descarga
  fileSize: number;
  previewUrl?: string;
  conversionTime: number; // Tiempo en ms que tomÃ³ la conversiÃ³n
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
  private static API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 2000; // ms

  /**
   * Convierte un archivo al formato especificado
   * @param file Archivo a convertir
   * @param targetFormat Formato objetivo
   * @param options Opciones de conversiÃ³n
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
      const response = await axios.post(`${this.API_URL}/convert`, formData, {
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
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Iniciar polling para obtener el estado de la conversiÃ³n
      return await this.pollConversionStatus(
        response.data.conversionId,
        fileId,
        file.name,
        file.type.split('/').pop() || file.name.split('.').pop() || '',
        targetFormat,
        onProgress
      );
    } catch (error) {
      console.error('Error en la conversiÃ³n:', error);
      
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data?.message || 'Error en el servidor'
        : 'Error de conexiÃ³n';
      
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
   * Consulta periÃ³dicamente el estado de una conversiÃ³n hasta que se completa
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
    let lastProgress = 50; // Empezamos en 50% despuÃ©s de la carga
    const progressIncrement = 5;
    
    while (retries < this.MAX_RETRIES * 10) { // Aumentamos el nÃºmero de intentos para la simulaciÃ³n
      try {
        // En un entorno de producciÃ³n, esto serÃ­a una llamada real a la API
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
        
        // DespuÃ©s de alcanzar cierto umbral, simulamos la finalizaciÃ³n
        if (lastProgress >= 95 && Math.random() > 0.5) {
          // Simulamos la respuesta final
          return {
            fileId,
            fileName,
            originalFormat,
            targetFormat,
            downloadUrl: `https://anclora.nexus/download/${conversionId}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
            fileSize: Math.floor(Math.random() * 10000000), // TamaÃ±o aleatorio
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
            errorMessage: 'No se pudo obtener el estado de la conversiÃ³n',
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
      errorMessage: 'La conversiÃ³n ha excedido el tiempo mÃ¡ximo de espera',
      canRetry: true
    } as ConversionError;
  }
  
  /**
   * Inicia una conversiÃ³n por lotes
   */
  static async startBatchConversion(
    files: File[],
    targetFormat: string,
    options: ConversionOptions = {},
    onFileProgress?: (fileProgress: ConversionProgress) => void,
    onBatchProgress?: (batchStatus: BatchConversionStatus) => void
  ): Promise<string> {
    try {
      // En un entorno real, enviarÃ­amos todos los archivos o sus referencias
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
      console.error('Error al iniciar conversiÃ³n por lotes:', error);
      throw new Error('No se pudo iniciar la conversiÃ³n por lotes');
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
    
    // ActualizaciÃ³n inicial de estado
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
              
              // Actualizamos el estado del lote con cada actualizaciÃ³n de archivo
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
    
    // ActualizaciÃ³n final de estado
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
   * Obtiene el estado de una conversiÃ³n por lotes
   */
  static async getBatchStatus(batchId: string): Promise<BatchConversionStatus> {
    try {
      // En un entorno real, esto serÃ­a una llamada a la API
      const response = await axios.get(`${this.API_URL}/batch/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estado del lote:', error);
      throw new Error('No se pudo obtener el estado del lote');
    }
  }
  
  /**
   * Cancela una conversiÃ³n o lote en progreso
   */
  static async cancelConversion(id: string): Promise<boolean> {
    try {
      // En un entorno real, esto serÃ­a una llamada a la API
      const response = await axios.post(`${this.API_URL}/cancel/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Error al cancelar la conversiÃ³n:', error);
      return false;
    }
  }
  
  /**
   * Comprueba si un formato es compatible para conversiÃ³n
   */
  static isFormatSupported(sourceFormat: string, targetFormat: string): boolean {
    // Mapa de formatos soportados para conversiÃ³n
    const supportedConversions: Record<string, string[]> = {
      pdf: ['docx', 'txt', 'jpg', 'png', 'epub', 'html'],
      docx: ['pdf', 'txt', 'html', 'epub', 'markdown'],
      jpg: ['png', 'webp', 'pdf', 'gif', 'svg'],
      png: ['jpg', 'webp', 'pdf', 'gif', 'svg'],
      mp4: ['mp3', 'gif', 'webm', 'avi'],
      mp3: ['wav', 'ogg', 'flac'],
      // MÃ¡s formatos...
    };
    
    // Normalizamos los formatos (eliminamos punto y convertimos a minÃºsculas)
    const normalizedSource = sourceFormat.replace('.', '').toLowerCase();
    const normalizedTarget = targetFormat.replace('.', '').toLowerCase();
    
    return supportedConversions[normalizedSource]?.includes(normalizedTarget) || false;
  }
  
  /**
   * Estima el tiempo de conversiÃ³n para un archivo
   */
  static estimateConversionTime(file: File, targetFormat: string): number {
    // En un entorno real, esto podrÃ­a basarse en datos histÃ³ricos o heurÃ­sticas
    const baseTime = 5000; // 5 segundos base
    const sizeMultiplier = file.size / (1024 * 1024) * 1000; // 1 segundo por MB
    
    // Factores adicionales segÃºn el formato
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

// Exportamos tambiÃ©n el mock para entorno de desarrollo
export class ConversionServiceMock extends ConversionService {
  // MÃ©todos especÃ­ficos para mock si son necesarios
}

// Exportamos la implementaciÃ³n adecuada segÃºn el entorno
export default process.env.NODE_ENV === 'development' 
  ? ConversionServiceMock 
  : ConversionService;

