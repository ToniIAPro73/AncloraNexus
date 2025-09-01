import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { ConversionService } from '../services/ConversionService';
import type { ConversionResult, ConversionError, ConversionProgress } from '../services/ConversionService';

interface EnhancedFileUploaderProps {
  acceptedFormats?: string[];
  maxSizeMB?: number;
  onConversionComplete?: (result: ConversionResult) => void;
  onError?: (error: ConversionError) => void;
  className?: string;
}

interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'converting' | 'completed' | 'error';
  result?: ConversionResult;
  error?: string;
  targetFormat?: string;
}

export const EnhancedFileUploader: React.FC<EnhancedFileUploaderProps> = ({
  acceptedFormats = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
  maxSizeMB = 10,
  onConversionComplete,
  onError,
  className = ''
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle'
  });
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState<string>('pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'html', 'md'];

  const isValidFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, error: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB` };
    }

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !acceptedFormats.includes(extension)) {
      return { valid: false, error: `Formato no soportado. Formatos permitidos: ${acceptedFormats.join(', ')}` };
    }

    return { valid: true };
  }, [acceptedFormats, maxSizeMB]);

  const handleFileSelect = useCallback((file: File) => {
    const validation = isValidFile(file);
    if (!validation.valid) {
      setUploadState({
        file: null,
        progress: 0,
        status: 'error',
        error: validation.error
      });
      return;
    }

    setUploadState({
      file,
      progress: 0,
      status: 'idle',
      error: undefined
    });
  }, [isValidFile]);

  const handleConvert = useCallback(async () => {
    if (!uploadState.file || !targetFormat) return;

    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0 }));

    try {
      const result = await ConversionService.convertFile(
        uploadState.file,
        targetFormat,
        {},
        (progress: ConversionProgress) => {
          setUploadState(prev => ({
            ...prev,
            progress: progress.progress,
            status: progress.stage === 'upload' ? 'uploading' : 'converting'
          }));
        }
      );

      setUploadState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        result
      }));

      onConversionComplete?.(result);
    } catch (error: any) {
      const errorMessage = error.errorMessage || error.message || 'Error desconocido';
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));

      onError?.(error);
    }
  }, [uploadState.file, targetFormat, onConversionComplete, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const resetUpload = useCallback(() => {
    setUploadState({
      file: null,
      progress: 0,
      status: 'idle'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'uploading':
      case 'converting':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Upload className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadState.status) {
      case 'uploading':
        return `Subiendo archivo... ${uploadState.progress}%`;
      case 'converting':
        return `Convirtiendo archivo... ${uploadState.progress}%`;
      case 'completed':
        return '¡Conversión completada!';
      case 'error':
        return uploadState.error || 'Error en la conversión';
      default:
        return 'Arrastra un archivo aquí o haz clic para seleccionar';
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${uploadState.status === 'idle' ? 'hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : ''}
          ${uploadState.status === 'error' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
          ${uploadState.status === 'completed' ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => uploadState.status === 'idle' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.map(f => `.${f}`).join(',')}
          onChange={handleFileInputChange}
          disabled={uploadState.status !== 'idle'}
        />

        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {getStatusMessage()}
            </p>
            {uploadState.file && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {uploadState.file.name} ({(uploadState.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {(uploadState.status === 'uploading' || uploadState.status === 'converting') && (
            <div className="w-full max-w-xs">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Format Selection and Actions */}
      {uploadState.file && uploadState.status === 'idle' && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Convertir a:
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {supportedFormats.map(format => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={resetUpload}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleConvert}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
              >
                Convertir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Result */}
      {uploadState.status === 'completed' && uploadState.result && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 dark:text-green-200 font-medium">
                ¡Archivo convertido exitosamente!
              </p>
              <p className="text-sm text-green-600 dark:text-green-300">
                {uploadState.result.fileName} → {uploadState.result.targetFormat.toUpperCase()}
              </p>
            </div>
            <a
              href={uploadState.result.downloadUrl}
              download={uploadState.result.fileName}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </a>
          </div>
        </div>
      )}

      {/* Supported Formats Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Formatos soportados: {acceptedFormats.join(', ').toUpperCase()} • Máximo {maxSizeMB}MB
        </p>
      </div>
    </div>
  );
};
