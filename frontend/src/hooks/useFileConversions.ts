import { useState, useCallback } from 'react';
import { useNotifications } from '../components/NotificationSystem';
import ConversionService, {
  ConversionOptions,
  ConversionResult,
  ConversionError,
  BatchConversionStatus
} from '../services/ConversionService';

interface FileConversionStatus {
  id: string;
  file: File;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: ConversionResult;
  error?: ConversionError;
  startTime?: Date;
  endTime?: Date;
}

interface BatchStatus extends BatchConversionStatus {
  files: FileConversionStatus[];
}

interface UseFileConversionsReturn {
  files: FileConversionStatus[];
  batches: Record<string, BatchStatus>;
  convertFile: (file: File, targetFormat: string, options?: ConversionOptions) => Promise<ConversionResult>;
  convertBatch: (files: File[], targetFormat: string, options?: ConversionOptions) => Promise<string>;
  retryConversion: (fileId: string) => Promise<void>;
  cancelConversion: (fileId: string) => Promise<boolean>;
  removeFile: (fileId: string) => void;
  clearCompleted: () => void;
}

export const useFileConversions = (): UseFileConversionsReturn => {
  const [files, setFiles] = useState<FileConversionStatus[]>([]);
  const [batches, setBatches] = useState<Record<string, BatchStatus>>({});
  
  const { 
    notifyFileConversion, 
    updateNotification, 
    notifyError, 
    notifySuccess 
  } = useNotifications();

  // Convierte un único archivo
  const convertFile = useCallback(async (
    file: File, 
    targetFormat: string,
    options?: ConversionOptions
  ): Promise<ConversionResult> => {
    const fileId = `file_${Math.random().toString(36).substr(2, 9)}`;
    
  // Añadir archivo a la lista con estado pendiente
    setFiles(prev => [...prev, {
      id: fileId,
    file,
      targetFormat,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    }]);
    
  // Notificar inicio de conversión
    const notifId = notifyFileConversion({
      status: 'started',
    fileName: file.name,
      fileType: file.type.split('/').pop() || file.name.split('.').pop() || '',
      targetType: targetFormat
    });
    
    try {
      // Actualizar estado a "procesando"
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId ? { ...f, status: 'processing' } : f
        )
      );
      
      // Iniciar conversiÃ³n
      const result = await ConversionService.convertFile(
        file,
        targetFormat,
        options,
        (progress: { progress: number }) => {
          // Actualizar progreso en la lista de archivos
          setFiles(prev => 
            prev.map(f => 
               f.id === fileId ? { ...f, progress: progress.progress } : f
            )
          );
          
      // Actualizar notificación
          updateNotification(notifId, {
            progress: progress.progress,
        message: `${Math.round(progress.progress)}% completado`
          });
        }
      );
      
      // Actualizar estado a "completado"
      setFiles(prev => 
        prev.map(f => 
           f.id === fileId ? { 
            ...f, 
            status: 'completed', 
            progress: 100, 
            result,
            endTime: new Date() 
          } : f
        )
      );
      
  // Notificar éxito
      notifyFileConversion({
        status: 'completed',
    fileName: file.name,
        fileType: file.type.split('/').pop() || file.name.split('.').pop() || '',
        targetType: targetFormat,
        downloadUrl: result.downloadUrl
      });
      
      return result;
    } catch (error) {
      const conversionError = error as ConversionError;
      
      // Actualizar estado a "fallido"
      setFiles(prev => 
        prev.map(f => 
           f.id === fileId ? { 
            ...f, 
            status: 'failed', 
            error: conversionError,
            endTime: new Date() 
          } : f
        )
      );
      
      // Notificar error
      notifyFileConversion({
        status: 'error',
    fileName: file.name,
        fileType: file.type.split('/').pop() || file.name.split('.').pop() || '',
        targetType: targetFormat,
        errorMessage: conversionError.errorMessage || 'Error desconocido'
      });
      
      throw error;
    }
  }, [notifyFileConversion, updateNotification, notifyError]);
  
  // Convierte múltiples archivos como lote
  interface FileProgressInfo {
    fileId: string;
    fileName: string;
    progress: number;
  }

  const convertBatch = useCallback(async (
    filesToConvert: File[], 
    targetFormat: string,
  options?: ConversionOptions
  ): Promise<string> => {
    try {
      // Crear un ID para el lote
      const batchId = `batch_${Math.random().toString(36).substr(2, 9)}`;
      
      // Inicializar estado del lote
      setBatches(prev => ({
        ...prev,
         [batchId]: {
          batchId,
          totalFiles: filesToConvert.length,
          completed: 0,
          failed: 0,
          inProgress: 0,
          pending: filesToConvert.length,
          overallProgress: 0,
          startedAt: new Date(),
          files: []
        }
      }));
      
      // Notificar inicio de lote
       notifySuccess(
         'Conversión por lotes iniciada', 
         `Procesando ${filesToConvert.length} archivos`
       );
      
      const serviceBatchId = await ConversionService.startBatchConversion(
        filesToConvert,
        targetFormat,
        options,
        // Seguimiento de progreso por archivo
        (fileProgress: FileProgressInfo) => {
          // Actualizar archivos del lote
          setBatches(prev => {
            const batch = prev[batchId];
            if (!batch) return prev;
            
            // Buscar el archivo en el lote
            const fileIndex = batch.files.findIndex(f => f.id === fileProgress.fileId);
            
            if (fileIndex >= 0) {
              // Actualizar archivo existente
              const updatedFiles = [...batch.files];
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                progress: fileProgress.progress,
                status: fileProgress.progress < 100 ? 'processing' : 'completed'
              };
              
              return {
                ...prev,
                [batchId]: {
                  ...batch,
                  files: updatedFiles
                }
              };
            } else {
              // AÃ±adir nuevo archivo
              const fileToAdd = filesToConvert.find(
                f => f.name === fileProgress.fileName
              );
              
              if (!fileToAdd) return prev;
              
              // Crear nuevo estado para el archivo
              const newFileStatus: FileConversionStatus = {
                id: fileProgress.fileId,
                file: fileToAdd,
                targetFormat,
                status: 'processing',
                progress: fileProgress.progress,
                startTime: new Date()
              };
              
              return {
                ...prev,
                [batchId]: {
                  ...batch,
                  files: [...batch.files, newFileStatus]
                }
              };
            }
          });
        },
        // Seguimiento de progreso del lote completo
        (batchStatus: BatchConversionStatus) => {
          setBatches(prev => {
            const batch = prev[batchId];
            if (!batch) return prev;
            
            return {
              ...prev,
              [batchId]: {
                ...batch,
                ...batchStatus,
              }
            };
          });
          
          // Si el lote estÃ¡ completo, mostrar notificaciÃ³n
           if (batchStatus.overallProgress === 100) {
             notifySuccess(
               'Conversión por lotes completada',
               `Completados: ${batchStatus.completed}, Fallidos: ${batchStatus.failed}`
             );
          }
        }
      );
      
      return serviceBatchId;
    } catch (error) {
      console.error('Error al iniciar conversiÃ³n por lotes:', error);
      
      notifyError(
        'Error en conversiÃ³n por lotes',
        'No se pudo iniciar el proceso de conversiÃ³n por lotes'
      );
      
      throw new Error('No se pudo iniciar la conversiÃ³n por lotes');
    }
  }, [notifySuccess, notifyError]);
  
  // Reintenta una conversiÃ³n fallida
  const retryConversion = useCallback(async (fileId: string) => {
    const fileToRetry = files.find(f => f.id === fileId);
    
    if (!fileToRetry || fileToRetry.status !== 'failed' || !fileToRetry.file) {
      throw new Error('Archivo no encontrado o no es elegible para reintento');
    }
    
    try {
      // Cambiar estado a "pendiente"
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId ? { ...f, status: 'pending', progress: 0, error: undefined } : f
        )
      );
      
      // Reiniciar conversiÃ³n
      await convertFile(fileToRetry.file, fileToRetry.targetFormat);
    } catch (error) {
      console.error('Error al reintentar conversiÃ³n:', error);
      // El estado ya habrÃ¡ sido actualizado por el mÃ©todo convertFile
    }
  }, [files, convertFile]);
  
  // Cancela una conversiÃ³n en progreso
  const cancelConversion = useCallback(async (fileId: string): Promise<boolean> => {
    const fileToCancel = files.find(f => f.id === fileId);
    
    if (!fileToCancel || fileToCancel.status !== 'processing') {
      return false;
    }
    
    try {
      const success = await ConversionService.cancelConversion(fileId);
      
      if (success) {
        // Actualizar estado
        setFiles(prev => 
          prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              status: 'failed', 
              error: {
                fileId,
                fileName: f.file.name,
                originalFormat: f.file.type.split('/').pop() || f.file.name.split('.').pop() || '',
                targetFormat: f.targetFormat,
                errorCode: 'CANCELLED',
                 errorMessage: 'Conversión cancelada por el usuario',
                canRetry: true
              }
            } : f
          )
        );
      }
      
      return success;
    } catch (error) {
      console.error('Error al cancelar conversiÃ³n:', error);
      return false;
    }
  }, [files]);
  
  // Elimina un archivo de la lista
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);
  
  // Limpia todos los archivos completados
  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  }, []);
  
  return {
    files,
    batches,
    convertFile,
    convertBatch,
    retryConversion,
    cancelConversion,
    removeFile,
    clearCompleted
  };
};

