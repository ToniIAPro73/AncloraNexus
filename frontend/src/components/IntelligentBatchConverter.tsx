import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, Download, Trash2, Plus, Package, 
  Brain, Zap, CheckCircle, AlertCircle, Loader2,
  FileText, Image, Clock, Star, TrendingUp
} from 'lucide-react';

interface BatchFile {
  id: string;
  file: File;
  targetFormat: string;
  status: 'pending' | 'analyzing' | 'converting' | 'completed' | 'error';
  progress: number;
  aiAnalysis?: any;
  selectedPath?: any;
  result?: any;
  error?: string;
}

interface BatchDownloadInfo {
  batch_id: string;
  status: string;
  total_files: number;
  total_size_mb: number;
  download_url?: string;
}

export const IntelligentBatchConverter: React.FC = () => {
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [batchDownload, setBatchDownload] = useState<BatchDownloadInfo | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFiles = 10;
  const maxSizeMB = 100;

  const addFiles = useCallback((newFiles: File[]) => {
    const remainingSlots = maxFiles - batchFiles.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    const newBatchFiles: BatchFile[] = filesToAdd.map(file => ({
      id: `batch_${Math.random().toString(36).substr(2, 9)}`,
      file,
      targetFormat: 'pdf', // Default
      status: 'pending',
      progress: 0
    }));

    setBatchFiles(prev => [...prev, ...newBatchFiles]);
  }, [batchFiles.length]);

  const removeFile = useCallback((id: string) => {
    setBatchFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const updateFileFormat = useCallback((id: string, format: string) => {
    setBatchFiles(prev => prev.map(file => 
      file.id === id ? { ...file, targetFormat: format } : file
    ));
  }, []);

  const analyzeFileWithAI = async (batchFile: BatchFile) => {
    setBatchFiles(prev => prev.map(f => 
      f.id === batchFile.id ? { ...f, status: 'analyzing' } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', batchFile.file);
      
      const response = await fetch('http://localhost:8000/api/conversion/ai-analyze', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Obtener rutas de conversión para el formato seleccionado
        const pathsFormData = new FormData();
        pathsFormData.append('file', batchFile.file);
        pathsFormData.append('target_format', batchFile.targetFormat);
        
        const pathsResponse = await fetch('http://localhost:8000/api/conversion/ai-conversion-paths', {
          method: 'POST',
          body: pathsFormData
        });
        
        const pathsData = await pathsResponse.json();
        
        setBatchFiles(prev => prev.map(f => 
          f.id === batchFile.id ? { 
            ...f, 
            status: 'pending',
            aiAnalysis: data.analysis,
            selectedPath: pathsData.success ? pathsData.conversion_paths[0] : null
          } : f
        ));
      }
    } catch (error) {
      setBatchFiles(prev => prev.map(f => 
        f.id === batchFile.id ? { ...f, status: 'error', error: 'Error en análisis IA' } : f
      ));
    }
  };

  const processBatchWithAI = async () => {
    setIsProcessingBatch(true);
    
    try {
      // Crear lote de descarga
      const batchResponse = await fetch('http://localhost:8000/api/conversion/batch/create', {
        method: 'POST'
      });
      const batchData = await batchResponse.json();
      
      if (!batchData.success) {
        throw new Error('Error creando lote de descarga');
      }
      
      const batchId = batchData.batch_id;
      const convertedFiles = [];
      
      // Procesar cada archivo
      for (const batchFile of batchFiles) {
        setBatchFiles(prev => prev.map(f => 
          f.id === batchFile.id ? { ...f, status: 'converting', progress: 0 } : f
        ));

        try {
          const formData = new FormData();
          formData.append('file', batchFile.file);
          formData.append('target_format', batchFile.targetFormat);
          
          if (batchFile.selectedPath) {
            formData.append('sequence_id', batchFile.selectedPath.sequence_id);
            formData.append('optimization', 'quality');
          }
          
          const response = await fetch('http://localhost:8000/api/conversion/ai-convert-intelligent', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          
          if (result.success) {
            setBatchFiles(prev => prev.map(f => 
              f.id === batchFile.id ? { 
                ...f, 
                status: 'completed', 
                progress: 100,
                result 
              } : f
            ));
            
            convertedFiles.push({
              file_path: result.download_url, // Esto necesitaría ajustarse para el path real
              original_filename: batchFile.file.name,
              converted_filename: result.output_filename,
              conversion_info: {
                quality_score: result.quality_score,
                processing_time: result.processing_time,
                ai_confidence: result.ai_confidence,
                sequence_description: result.sequence_description
              }
            });
          } else {
            setBatchFiles(prev => prev.map(f => 
              f.id === batchFile.id ? { 
                ...f, 
                status: 'error', 
                error: result.error 
              } : f
            ));
          }
        } catch (error) {
          setBatchFiles(prev => prev.map(f => 
            f.id === batchFile.id ? { 
              ...f, 
              status: 'error', 
              error: 'Error en conversión' 
            } : f
          ));
        }
      }
      
      // Preparar ZIP si hay archivos convertidos
      if (convertedFiles.length > 0) {
        const prepareResponse = await fetch(`http://localhost:8000/api/conversion/batch/${batchId}/prepare`, {
          method: 'POST'
        });
        
        const prepareData = await prepareResponse.json();
        
        if (prepareData.success) {
          setBatchDownload({
            batch_id: batchId,
            status: 'ready',
            total_files: convertedFiles.length,
            total_size_mb: prepareData.batch_info.total_size_mb,
            download_url: prepareData.download_url
          });
        }
      }
      
    } catch (error) {
      console.error('Error procesando lote:', error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing':
        return <Brain className="w-4 h-4 animate-pulse text-purple-500" />;
      case 'converting':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const completedCount = batchFiles.filter(f => f.status === 'completed').length;
  const totalFiles = batchFiles.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <Package className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Conversión por Lotes Inteligente
          </h1>
          <Brain className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Procesa múltiples archivos con IA • Descarga ZIP • Optimización automática
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 'border-gray-300 dark:border-gray-600'}
          ${batchFiles.length < maxFiles ? 'hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => batchFiles.length < maxFiles && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
          disabled={isProcessingBatch || batchFiles.length >= maxFiles}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {batchFiles.length === 0 
                ? 'Arrastra archivos para conversión por lotes'
                : `${batchFiles.length}/${maxFiles} archivos agregados`
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Máximo {maxFiles} archivos • {maxSizeMB}MB total • Análisis IA automático
            </p>
          </div>
        </div>
      </div>

      {/* Batch Files List */}
      {batchFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Archivos en Lote ({batchFiles.length})
            </h3>
            
            <div className="flex space-x-3">
              <button
                onClick={() => batchFiles.forEach(f => f.status === 'pending' && analyzeFileWithAI(f))}
                disabled={isProcessingBatch || batchFiles.every(f => f.status !== 'pending')}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Analizar con IA</span>
              </button>
              
              <button
                onClick={processBatchWithAI}
                disabled={isProcessingBatch || batchFiles.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                {isProcessingBatch ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>{isProcessingBatch ? 'Procesando...' : 'Convertir Lote'}</span>
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          {isProcessingBatch && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Progreso del Lote
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-300">
                  {completedCount}/{totalFiles} completados
                </span>
              </div>
              <div className="bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalFiles) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Files Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {batchFiles.map((batchFile) => (
              <div
                key={batchFile.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4"
              >
                {/* File Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(batchFile.status)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {batchFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(batchFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  {!isProcessingBatch && batchFile.status === 'pending' && (
                    <button
                      onClick={() => removeFile(batchFile.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Format Selection */}
                {batchFile.status === 'pending' && (
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Convertir a:
                    </label>
                    <select
                      value={batchFile.targetFormat}
                      onChange={(e) => updateFileFormat(batchFile.id, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      disabled={isProcessingBatch}
                    >
                      {['pdf', 'docx', 'html', 'txt', 'jpg', 'png'].map(format => (
                        <option key={format} value={format}>
                          {format.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => analyzeFileWithAI(batchFile)}
                      className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm transition-colors"
                    >
                      <Brain className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* AI Analysis Results */}
                {batchFile.aiAnalysis && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        Análisis IA Completado
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                        <span className="ml-1 font-medium capitalize">{batchFile.aiAnalysis.content_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Complejidad:</span>
                        <span className="ml-1 font-medium capitalize">{batchFile.aiAnalysis.complexity_level}</span>
                      </div>
                    </div>
                    
                    {batchFile.selectedPath && (
                      <div className="text-xs text-purple-700 dark:text-purple-300">
                        <strong>Ruta IA:</strong> {batchFile.selectedPath.visual_path}
                        <br />
                        <strong>Calidad esperada:</strong> {batchFile.selectedPath.quality_score.toFixed(0)}%
                      </div>
                    )}
                  </div>
                )}

                {/* Conversion Progress */}
                {batchFile.status === 'converting' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Convirtiendo...</span>
                      <span className="font-medium">{batchFile.progress}%</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${batchFile.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                {batchFile.status === 'completed' && batchFile.result && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Conversión IA Exitosa
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          {batchFile.result.quality_score?.toFixed(0)}% calidad
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {batchFile.result.sequence_description}
                    </div>
                  </div>
                )}

                {/* Error Status */}
                {batchFile.status === 'error' && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        Error en Conversión
                      </span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {batchFile.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add More Files */}
          {batchFiles.length < maxFiles && !isProcessingBatch && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar más archivos ({batchFiles.length}/{maxFiles})</span>
            </button>
          )}
        </div>
      )}

      {/* Batch Download */}
      {batchDownload && batchDownload.status === 'ready' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Package className="w-8 h-8 text-green-500" />
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                ¡Lote Listo para Descarga!
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {batchDownload.total_files}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Archivos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {batchDownload.total_size_mb.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">MB Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {completedCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Exitosos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ZIP
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Formato</div>
              </div>
            </div>
            
            <a
              href={`http://localhost:8000/api${batchDownload.download_url}`}
              download={`anclora_batch_${batchDownload.batch_id}.zip`}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              <span>Descargar Lote ZIP</span>
              <Package className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      {batchFiles.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {batchFiles.filter(f => f.aiAnalysis).length}
              </div>
              <div className="text-xs text-gray-500">Analizados IA</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {batchFiles.filter(f => f.status === 'converting').length}
              </div>
              <div className="text-xs text-gray-500">Convirtiendo</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {completedCount}
              </div>
              <div className="text-xs text-gray-500">Completados</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {batchFiles.filter(f => f.status === 'error').length}
              </div>
              <div className="text-xs text-gray-500">Errores</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
