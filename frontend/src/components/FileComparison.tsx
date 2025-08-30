import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button } from './ui';
import { FileIcon, Eye, ArrowRight, Download, CheckCircle, RotateCcw } from 'lucide-react';

interface FilePreview {
  name: string;
  type: string;
  size: number;
  previewUrl: string;
  icon: React.ReactNode;
  metadata?: Record<string, string | number>;
}

interface FileComparisonProps {
  originalFile: FilePreview;
  convertedFile: FilePreview;
  conversionInfo: {
    format: string;
    quality: number;
    conversionTime: number;
    compressionRate: number;
  };
  onDownload: () => void;
  onNewConversion: () => void;
  className?: string;
}

export const FileComparison: React.FC<FileComparisonProps> = ({
  originalFile,
  convertedFile,
  conversionInfo,
  onDownload,
  onNewConversion,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata'>('preview');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  // Calculate the compression result
  const sizeReduction = originalFile.size - convertedFile.size;
  const sizeReductionPercentage = Math.round((sizeReduction / originalFile.size) * 100);
  const isReductionPositive = sizeReduction > 0;

  // File types that can be previewed
  const previewableTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'application/pdf'];
  const canPreview = previewableTypes.includes(originalFile.type) && previewableTypes.includes(convertedFile.type);

  // Format file size in KB or MB
  const formatFileSize = (size: number): string => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format time in seconds or milliseconds
  const formatTime = (ms: number): string => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)} s`;
    }
    return `${ms} ms`;
  };

  // Render the file preview based on type
  const renderFilePreview = (file: FilePreview) => {
    if (!canPreview) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <FileIcon size={64} className="text-slate-400 mb-3" />
          <p className="text-slate-300 text-sm">Vista previa no disponible para este tipo de archivo</p>
        </div>
      );
    }

    if (file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <img 
            src={file.previewUrl} 
            alt={file.name} 
            className="max-w-full max-h-[300px] object-contain rounded" 
          />
        </div>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <iframe 
            src={file.previewUrl} 
            title={file.name}
            className="w-full h-[300px] border border-slate-700 rounded"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        {file.icon}
        <p className="text-slate-300 mt-2">{file.name}</p>
      </div>
    );
  };

  // Render file metadata
  const renderFileMetadata = (file: FilePreview) => {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-slate-400">Nombre:</span>
          <span className="text-slate-200 truncate">{file.name}</span>
          
          <span className="text-slate-400">Tipo:</span>
          <span className="text-slate-200">{file.type}</span>
          
          <span className="text-slate-400">Tamaño:</span>
          <span className="text-slate-200">{formatFileSize(file.size)}</span>
          
          {file.metadata && Object.entries(file.metadata).map(([key, value]) => (
            <React.Fragment key={key}>
              <span className="text-slate-400">{key}:</span>
              <span className="text-slate-200">{value}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Información de conversión */}
      <Card variant="default" className="animate-in fade-in-0 slide-in-from-bottom-5 duration-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resultados de la Conversión</CardTitle>
            <Badge variant="success" className="bg-gradient-to-r from-green-500 to-emerald-600">
              <CheckCircle size={14} className="mr-1" /> Completado
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Formato</div>
              <div className="font-medium text-white">
                {originalFile.type.split('/')[1].toUpperCase()} → {convertedFile.type.split('/')[1].toUpperCase()}
              </div>
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Calidad</div>
              <div className="font-medium text-white">{conversionInfo.quality}%</div>
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Tiempo</div>
              <div className="font-medium text-white">{formatTime(conversionInfo.conversionTime)}</div>
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Reducción</div>
              <div className="flex items-center">
                <span className={`font-medium ${isReductionPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isReductionPositive ? '-' : '+'}{Math.abs(sizeReductionPercentage)}%
                </span>
                {isReductionPositive && <CheckCircle size={14} className="ml-1 text-green-400" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparación de archivos */}
      <Card variant="default" className="animate-in fade-in-0 slide-in-from-bottom-5 duration-700 delay-150">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comparación de Archivos</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex rounded-md overflow-hidden border border-slate-700">
                <button 
                  className={`px-3 py-1 text-xs ${activeTab === 'preview' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300'}`}
                  onClick={() => setActiveTab('preview')}
                >
                  <Eye size={14} className="mr-1 inline-block" /> Vista previa
                </button>
                <button 
                  className={`px-3 py-1 text-xs ${activeTab === 'metadata' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300'}`}
                  onClick={() => setActiveTab('metadata')}
                >
                  <FileIcon size={14} className="mr-1 inline-block" /> Metadatos
                </button>
              </div>
              {canPreview && (
                <button 
                  className={`p-1 rounded-md text-xs ${showBeforeAfter ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}
                  onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                  title={showBeforeAfter ? "Mostrar lado a lado" : "Mostrar antes y después"}
                >
                  {showBeforeAfter ? 'A/B' : '||}'}
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'preview' ? (
            <div className={`${showBeforeAfter ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
              <div className={`p-4 bg-slate-800/50 rounded-lg border border-slate-700 ${showBeforeAfter ? '' : 'h-[350px]'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    <h3 className="text-sm font-medium text-white">Archivo Original</h3>
                  </div>
                  <Badge variant="default" className="bg-slate-700">
                    {formatFileSize(originalFile.size)}
                  </Badge>
                </div>
                
                {renderFilePreview(originalFile)}
              </div>

              {!showBeforeAfter && (
                <div className="hidden md:flex items-center justify-center">
                  <div className="bg-slate-800 rounded-full p-2">
                    <ArrowRight size={20} className="text-primary" />
                  </div>
                </div>
              )}

              <div className={`p-4 bg-slate-800/50 rounded-lg border border-slate-700 ${showBeforeAfter ? '' : 'h-[350px]'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <h3 className="text-sm font-medium text-white">Archivo Convertido</h3>
                  </div>
                  <Badge variant="default" className="bg-slate-700">
                    {formatFileSize(convertedFile.size)}
                  </Badge>
                </div>
                
                {renderFilePreview(convertedFile)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center mb-3">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  <h3 className="text-sm font-medium text-white">Metadatos del Archivo Original</h3>
                </div>
                
                {renderFileMetadata(originalFile)}
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center mb-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <h3 className="text-sm font-medium text-white">Metadatos del Archivo Convertido</h3>
                </div>
                
                {renderFileMetadata(convertedFile)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <Button 
          variant="outline" 
          onClick={onNewConversion}
          iconLeft={<RotateCcw size={16} />}
        >
          Nueva Conversión
        </Button>
        <Button 
          variant="primary" 
          onClick={onDownload}
          iconLeft={<Download size={16} />}
        >
          Descargar Archivo
        </Button>
      </div>
    </div>
  );
};

export default FileComparison;
