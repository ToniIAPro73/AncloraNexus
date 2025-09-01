import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Download, Loader2, FileText, Image, Film, Music, Archive, Zap } from 'lucide-react';
import { ConversionService } from '../services/ConversionService';
import { apiService } from '../services/api';
import type { ConversionResult, ConversionError, ConversionProgress } from '../services/ConversionService';

interface SmartFileUploaderProps {
  onConversionComplete?: (result: ConversionResult) => void;
  onError?: (error: ConversionError) => void;
  className?: string;
  showFormatSuggestions?: boolean;
  enableBatchUpload?: boolean;
  maxFiles?: number;
}

interface FileUploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'analyzing' | 'uploading' | 'converting' | 'completed' | 'error';
  result?: ConversionResult;
  error?: string;
  targetFormat?: string;
  suggestedFormats?: string[];
  fileType?: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
}

export const SmartFileUploader: React.FC<SmartFileUploaderProps> = ({
  onConversionComplete,
  onError,
  className = '',
  showFormatSuggestions = true,
  enableBatchUpload = false,
  maxFiles = 5
}) => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    progress: 0,
    status: 'idle'
  });
  const [isDragging, setIsDragging] = useState(false);
  const [supportedFormats, setSupportedFormats] = useState<Record<string, Record<string, number>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load supported formats on component mount
  useEffect(() => {
    const loadFormats = async () => {
      try {
        const response = await apiService.getSupportedFormats();
        setSupportedFormats(response.supported_conversions);
      } catch (error) {
        console.error('Error loading supported formats:', error);
      }
    };
    loadFormats();
  }, []);

  const getFileType = (file: File): 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other' => {
    const mimeType = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'image';
    }
    if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return 'video';
    }
    if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'ogg'].includes(extension)) {
      return 'audio';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return 'archive';
    }
    if (['pdf', 'doc', 'docx', 'txt', 'md', 'html', 'rtf', 'odt'].includes(extension)) {
      return 'document';
    }
    return 'other';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'document': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'image': return <Image className="w-8 h-8 text-green-500" />;
      case 'video': return <Film className="w-8 h-8 text-purple-500" />;
      case 'audio': return <Music className="w-8 h-8 text-orange-500" />;
      case 'archive': return <Archive className="w-8 h-8 text-gray-500" />;
      default: return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  const getSuggestedFormats = (file: File): string[] => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const available = supportedFormats[extension] || {};
    
    // Sort by conversion cost (lower is better)
    return Object.entries(available)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 4)
      .map(([format]) => format);
  };

  const analyzeFile = useCallback(async (file: File) => {
    setUploadState(prev => ({ ...prev, status: 'analyzing' }));
    
    const fileType = getFileType(file);
    const suggestedFormats = getSuggestedFormats(file);
    const defaultTarget = suggestedFormats[0] || 'pdf';

    setUploadState(prev => ({
      ...prev,
      file,
      fileType,
      suggestedFormats,
      targetFormat: defaultTarget,
      status: 'idle'
    }));
  }, [supportedFormats]);

  const isValidFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const maxBytes = 10 * 1024 * 1024; // 10MB for guests
    if (file.size > maxBytes) {
      return { valid: false, error: 'El archivo es demasiado grande. Máximo 10MB para invitados' };
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !supportedFormats[extension]) {
      return { valid: false, error: 'Formato de archivo no soportado' };
    }

    return { valid: true };
  }, [supportedFormats]);

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

    analyzeFile(file);
  }, [isValidFile, analyzeFile]);

  const handleConvert = useCallback(async () => {
    if (!uploadState.file || !uploadState.targetFormat) return;

    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0 }));

    try {
      const result = await ConversionService.convertFile(
        uploadState.file,
        uploadState.targetFormat,
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
  }, [uploadState.file, uploadState.targetFormat, onConversionComplete, onError]);

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
      case 'analyzing':
        return <Zap className="w-6 h-6 animate-pulse text-yellow-500" />;
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
      case 'analyzing':
        return 'Analizando archivo...';
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
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 'border-gray-300 dark:border-gray-600'}
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
          onChange={handleFileInputChange}
          disabled={uploadState.status !== 'idle'}
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            {uploadState.file && uploadState.fileType && getFileIcon(uploadState.fileType)}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {getStatusMessage()}
            </p>
            {uploadState.file && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {uploadState.file.name} ({(uploadState.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                {uploadState.fileType && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                    Tipo: {uploadState.fileType}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {(uploadState.status === 'uploading' || uploadState.status === 'converting') && (
            <div className="w-full max-w-xs">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${uploadState.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">
                {uploadState.status === 'uploading' ? 'Subiendo...' : 'Procesando...'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Smart Format Selection */}
      {uploadState.file && uploadState.status === 'idle' && showFormatSuggestions && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Conversiones Recomendadas
            </h3>
          </div>
          
          {uploadState.suggestedFormats && uploadState.suggestedFormats.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {uploadState.suggestedFormats.map(format => (
                <button
                  key={format}
                  onClick={() => setUploadState(prev => ({ ...prev, targetFormat: format }))}
                  className={`
                    px-3 py-2 text-xs font-medium rounded-md transition-all duration-200
                    ${uploadState.targetFormat === format 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }
                  `}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Selecciona un formato de destino:
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Convertir a:
              </label>
              <select
                value={uploadState.targetFormat || ''}
                onChange={(e) => setUploadState(prev => ({ ...prev, targetFormat: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Seleccionar formato...</option>
                {Object.keys(supportedFormats).map(format => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={resetUpload}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleConvert}
                disabled={!uploadState.targetFormat}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-md font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                Convertir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Result */}
      {uploadState.status === 'completed' && uploadState.result && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ¡Archivo convertido exitosamente!
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {uploadState.result.fileName} → {uploadState.result.targetFormat.toUpperCase()}
                </p>
                <p className="text-xs text-green-500 dark:text-green-400">
                  Tiempo: {(uploadState.result.conversionTime / 1000).toFixed(1)}s • 
                  Tamaño: {(uploadState.result.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <a
              href={uploadState.result.downloadUrl}
              download={uploadState.result.fileName}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-md font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </a>
          </div>
        </div>
      )}

      {/* Error State */}
      {uploadState.status === 'error' && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Error en la conversión
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                {uploadState.error}
              </p>
            </div>
          </div>
          <button
            onClick={resetUpload}
            className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Supported Formats Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Formatos soportados: PDF, DOC, DOCX, TXT, MD, HTML, JPG, PNG, GIF • Máximo 10MB para invitados
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          ⚡ Conversión inteligente con IA • 🔒 Archivos seguros y privados
        </p>
      </div>
    </div>
  );
};
