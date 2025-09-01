import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Download, Loader2, FileText, Trash2, Plus } from 'lucide-react';
import { ConversionService } from '../services/ConversionService';
import type { ConversionResult, ConversionError, ConversionProgress } from '../services/ConversionService';

interface BatchFileItem {
  id: string;
  file: File;
  targetFormat: string;
  status: 'pending' | 'uploading' | 'converting' | 'completed' | 'error';
  progress: number;
  result?: ConversionResult;
  error?: string;
}

interface BatchFileUploaderProps {
  maxFiles?: number;
  onBatchComplete?: (results: ConversionResult[]) => void;
  onError?: (error: ConversionError) => void;
  className?: string;
}

export const BatchFileUploader: React.FC<BatchFileUploaderProps> = ({
  maxFiles = 5,
  onBatchComplete,
  onError,
  className = ''
}) => {
  const [files, setFiles] = useState<BatchFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'html', 'md'];

  const addFiles = useCallback((newFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    const batchItems: BatchFileItem[] = filesToAdd.map(file => ({
      id: `file_${Math.random().toString(36).substr(2, 9)}`,
      file,
      targetFormat: 'pdf', // Default format
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...batchItems]);
  }, [files.length, maxFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateFileFormat = useCallback((id: string, format: string) => {
    setFiles(prev => prev.map(item => 
      item.id === id ? { ...item, targetFormat: format } : item
    ));
  }, []);

  const processAllFiles = useCallback(async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    const results: ConversionResult[] = [];

    for (const fileItem of files) {
      if (fileItem.status !== 'pending') continue;

      try {
        // Update status to uploading
        setFiles(prev => prev.map(item => 
          item.id === fileItem.id ? { ...item, status: 'uploading', progress: 0 } : item
        ));

        const result = await ConversionService.convertFile(
          fileItem.file,
          fileItem.targetFormat,
          {},
          (progress: ConversionProgress) => {
            setFiles(prev => prev.map(item => 
              item.id === fileItem.id ? {
                ...item,
                progress: progress.progress,
                status: progress.stage === 'upload' ? 'uploading' : 'converting'
              } : item
            ));
          }
        );

        // Update status to completed
        setFiles(prev => prev.map(item => 
          item.id === fileItem.id ? {
            ...item,
            status: 'completed',
            progress: 100,
            result
          } : item
        ));

        results.push(result);
      } catch (error: any) {
        const errorMessage = error.errorMessage || error.message || 'Error desconocido';
        
        setFiles(prev => prev.map(item => 
          item.id === fileItem.id ? {
            ...item,
            status: 'error',
            error: errorMessage
          } : item
        ));

        onError?.(error);
      }
    }

    setIsProcessing(false);
    if (results.length > 0) {
      onBatchComplete?.(results);
    }
  }, [files, onBatchComplete, onError]);

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

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      addFiles(Array.from(selectedFiles));
    }
  }, [addFiles]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
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

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const overallProgress = files.length > 0 ? (completedCount / files.length) * 100 : 0;

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 'border-gray-300 dark:border-gray-600'}
          ${files.length === 0 ? 'hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => files.length < maxFiles && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isProcessing || files.length >= maxFiles}
        />

        <div className="flex flex-col items-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {files.length === 0 
                ? 'Arrastra múltiples archivos aquí o haz clic para seleccionar'
                : `${files.length}/${maxFiles} archivos agregados`
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Máximo {maxFiles} archivos • 10MB cada uno
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Archivos para convertir
            </h3>
            {!isProcessing && (
              <button
                onClick={processAllFiles}
                disabled={files.every(f => f.status !== 'pending')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
              >
                Convertir Todo
              </button>
            )}
          </div>

          {/* Overall Progress */}
          {isProcessing && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Progreso general
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-300">
                  {completedCount}/{files.length} completados
                </span>
              </div>
              <div className="bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Individual Files */}
          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(fileItem.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB → {fileItem.targetFormat.toUpperCase()}
                    </p>
                    {fileItem.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {fileItem.status === 'pending' && (
                    <select
                      value={fileItem.targetFormat}
                      onChange={(e) => updateFileFormat(fileItem.id, e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      disabled={isProcessing}
                    >
                      {supportedFormats.map(format => (
                        <option key={format} value={format}>
                          {format.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}

                  {(fileItem.status === 'uploading' || fileItem.status === 'converting') && (
                    <div className="w-16 text-xs text-center">
                      {fileItem.progress}%
                    </div>
                  )}

                  {fileItem.status === 'completed' && fileItem.result && (
                    <a
                      href={fileItem.result.downloadUrl}
                      download={fileItem.result.fileName}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors"
                    >
                      <Download className="w-3 h-3" />
                    </a>
                  )}

                  {!isProcessing && fileItem.status !== 'completed' && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add More Files */}
          {files.length < maxFiles && !isProcessing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mx-auto mb-2" />
              Agregar más archivos ({files.length}/{maxFiles})
            </button>
          )}

          {/* Batch Results Summary */}
          {completedCount > 0 && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Conversiones Completadas ({completedCount})
              </h4>
              <div className="space-y-1">
                {files.filter(f => f.status === 'completed').map(fileItem => (
                  <div key={fileItem.id} className="flex items-center justify-between text-xs">
                    <span className="text-green-700 dark:text-green-300">
                      {fileItem.file.name} → {fileItem.targetFormat.toUpperCase()}
                    </span>
                    {fileItem.result && (
                      <a
                        href={fileItem.result.downloadUrl}
                        download={fileItem.result.fileName}
                        className="text-green-600 dark:text-green-400 hover:underline"
                      >
                        Descargar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
