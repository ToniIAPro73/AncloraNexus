import React, { useState, useCallback } from 'react';
import { IconEbook, IconUpload, IconDownload, IconRefresh, IconSparkles, IconCheck, IconX } from './Icons';
import { EbookConversionService } from '../services/ebookConversionService';
import { EbookValidationService } from '../services/ebookValidationService';
import { EbookFile, EbookConversionJob, EbookValidationResult } from '../types/ebook';

interface EbookConverterProps {
  className?: string;
  onFileValidated?: (file: EbookFile, validation: EbookValidationResult) => void;
}

interface ConversionState {
  selectedFile: File | null;
  ebookFile: EbookFile | null;
  targetFormat: string;
  isValidating: boolean;
  isConverting: boolean;
  conversionJobs: EbookConversionJob[];
  error: string | null;
}

export const EbookConverter: React.FC<EbookConverterProps> = ({ 
  className = '', 
  onFileValidated 
}) => {
  const [state, setState] = useState<ConversionState>({
    selectedFile: null,
    ebookFile: null,
    targetFormat: 'epub',
    isValidating: false,
    isConverting: false,
    conversionJobs: [],
    error: null
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const conversionService = EbookConversionService.getInstance();

  const supportedFormats = {
    input: ['pdf', 'epub', 'mobi', 'azw', 'azw3', 'doc', 'docx', 'html', 'rtf', 'txt'],
    output: ['epub', 'pdf', 'mobi', 'azw3', 'rtf', 'txt']
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, selectedFile: file, isValidating: true, error: null }));

    try {
      const validationService = EbookValidationService.getInstance();
      const validationResult = await validationService.validateEbook(file);
      
      const conversionResult = await conversionService.validateFile(file);
      
      if (conversionResult.success && conversionResult.data) {
        setState(prev => ({
          ...prev,
          ebookFile: conversionResult.data!,
          isValidating: false
        }));
        
        // Llamar callback si estÃ¡ disponible
        if (onFileValidated) {
          onFileValidated(conversionResult.data, validationResult);
        }
      } else {
        setState(prev => ({
          ...prev,
          error: conversionResult.error || 'Error validando archivo',
          isValidating: false,
          selectedFile: null
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error procesando archivo',
        isValidating: false,
        selectedFile: null
      }));
    }
  }, [conversionService, onFileValidated]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const startConversion = useCallback(async () => {
    if (!state.ebookFile) return;

    setState(prev => ({ ...prev, isConverting: true, error: null }));

    try {
      const conversionResult = await conversionService.startConversion(
        state.ebookFile,
        state.targetFormat,
        {
          quality: 'medium',
          preserveMetadata: true,
          optimizeForDevice: 'generic'
        }
      );

      if (conversionResult.success && conversionResult.data) {
        // Simular seguimiento del trabajo
        const jobId = conversionResult.data;
        const checkProgress = setInterval(() => {
          const jobStatus = conversionService.getConversionStatus(jobId);
          if (jobStatus.success && jobStatus.data) {
            setState(prev => {
              const updatedJobs = prev.conversionJobs.filter(j => j.id !== jobId);
              return {
                ...prev,
                conversionJobs: [jobStatus.data!, ...updatedJobs]
              };
            });

            if (jobStatus.data.status === 'completed' || jobStatus.data.status === 'failed') {
              clearInterval(checkProgress);
              setState(prev => ({ ...prev, isConverting: false }));
            }
          }
        }, 1000);
      } else {
        setState(prev => ({
          ...prev,
          error: conversionResult.error || 'Error iniciando conversiÃ³n',
          isConverting: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error durante la conversiÃ³n',
        isConverting: false
      }));
    }
  }, [state.ebookFile, state.targetFormat, conversionService]);

  const clearFile = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFile: null,
      ebookFile: null,
      error: null
    }));
  }, []);

  const getStatusIcon = (status: EbookConversionJob['status']) => {
    switch (status) {
      case 'completed':
        return <IconCheck className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <IconX className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <IconRefresh className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <IconRefresh className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: EbookConversionJob['status']) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'failed': return 'Error';
      case 'processing': return 'Procesando...';
      default: return 'Pendiente';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`} style={{ padding: 'var(--space-3)' }}>
      {/* Header con tokens de diseÃ±o Anclora */}
      <div className="text-center" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex justify-center" style={{ marginBottom: 'var(--space-2)' }}>
          <IconEbook className="w-16 h-16 text-primary" />
        </div>
        <h1
          className="text-h1 font-bold"
          style={{
            color: 'var(--color-neutral-900)',
            marginBottom: 'var(--space-1)',
            fontFamily: 'var(--font-heading)'
          }}
        >
          Conversor de E-books
        </h1>
        <p 
          style={{ 
            fontSize: '16px',
            lineHeight: '1.5',
            color: 'var(--color-neutral-900)',
            opacity: '0.7',
            fontFamily: 'var(--font-body)'
          }}
        >
          Convierte tus libros electrÃ³nicos entre diferentes formatos de manera rÃ¡pida y sencilla
        </p>
      </div>

      {/* Error Message */}
      {state.error && (
        <div 
          className="rounded-lg p-4 mb-6 flex items-center space-x-3"
          style={{ 
            backgroundColor: 'var(--color-danger)',
            color: 'var(--color-neutral-100)'
          }}
        >
          <IconX className="w-5 h-5" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Upload Area */}
      <div 
        className="rounded-lg border"
        style={{ 
          backgroundColor: 'var(--color-neutral-100)',
          borderColor: 'var(--color-neutral-200)',
          padding: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-150`}
          style={{
            borderColor: isDragOver ? 'var(--color-primary)' : 'var(--color-neutral-200)',
            backgroundColor: isDragOver ? 'rgba(0, 110, 230, 0.05)' : 'transparent'
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <IconUpload className="w-12 h-12 mx-auto mb-4 text-neutral-900/40" />
          
          {state.isValidating ? (
            <div className="space-y-2">
              <IconRefresh className="w-6 h-6 mx-auto animate-spin text-primary" />
              <p style={{ color: 'var(--color-neutral-900)', fontSize: '16px' }}>
                Validando archivo...
              </p>
            </div>
          ) : state.selectedFile ? (
            <div className="space-y-2">
              <p 
                className="font-medium"
                style={{ 
                  fontSize: '18px',
                  color: 'var(--color-neutral-900)'
                }}
              >
                {state.selectedFile.name}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-neutral-900)', opacity: '0.6' }}>
                TamaÃ±o: {(state.selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {state.ebookFile?.metadata && (
                <div style={{ fontSize: '14px', color: 'var(--color-neutral-900)', opacity: '0.6' }}>
                  {state.ebookFile.metadata.title && <p>TÃ­tulo: {state.ebookFile.metadata.title}</p>}
                  {state.ebookFile.metadata.author && <p>Autor: {state.ebookFile.metadata.author}</p>}
                </div>
              )}
              <button
                onClick={clearFile}
                className="font-medium transition-colors"
                style={{ 
                  color: 'var(--color-primary)',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0056B3'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              >
                Cambiar archivo
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p 
                className="font-medium"
                style={{ 
                  fontSize: '18px',
                  color: 'var(--color-neutral-900)'
                }}
              >
                Arrastra tu e-book aquÃ­ o haz clic para seleccionar
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-neutral-900)', opacity: '0.6' }}>
                Formatos soportados: {supportedFormats.input.join(', ').toUpperCase()}
              </p>
              <input
                type="file"
                accept={supportedFormats.input.map(f => `.${f}`).join(',')}
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block cursor-pointer transition-colors rounded font-medium"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-neutral-100)',
                  padding: 'var(--space-1) var(--space-3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056B3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
              >
                Seleccionar archivo
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Format Selection */}
      {state.ebookFile && (
        <div 
          className="rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-neutral-100)',
            borderColor: 'var(--color-neutral-200)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3
            className="text-h3 font-semibold"
            style={{
              color: 'var(--color-neutral-900)',
              marginBottom: 'var(--space-2)'
            }}
          >
            Seleccionar formato de salida
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: 'var(--space-2)' }}>
            {supportedFormats.output.map((format) => (
              <button
                key={format}
                onClick={() => setState(prev => ({ ...prev, targetFormat: format }))}
                className="p-3 rounded-lg border-2 text-center transition-colors font-medium"
                style={{
                  borderColor: state.targetFormat === format ? 'var(--color-primary)' : 'var(--color-neutral-200)',
                  backgroundColor: state.targetFormat === format ? 'rgba(0, 110, 230, 0.05)' : 'transparent',
                  color: state.targetFormat === format ? 'var(--color-primary)' : 'var(--color-neutral-900)'
                }}
              >
                <div className="text-sm uppercase">{format}</div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={startConversion}
              disabled={!state.ebookFile || state.isConverting}
              className="flex items-center space-x-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-neutral-100)',
                padding: 'var(--space-2) var(--space-4)'
              }}
              onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#0056B3')}
              onMouseOut={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            >
              {state.isConverting ? (
                <IconRefresh className="w-5 h-5 animate-spin" />
              ) : (
                <IconSparkles className="w-5 h-5" />
              )}
              <span>
                {state.isConverting ? 'Convirtiendo...' : `Convertir a ${state.targetFormat.toUpperCase()}`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Conversion History */}
      {state.conversionJobs.length > 0 && (
        <div 
          className="rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-neutral-100)',
            borderColor: 'var(--color-neutral-200)',
            padding: 'var(--space-3)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3
            className="text-h3 font-semibold"
            style={{
              color: 'var(--color-neutral-900)',
              marginBottom: 'var(--space-2)'
            }}
          >
            Historial de conversiones
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {state.conversionJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-neutral-200)' }}
              >
                <div className="flex-1">
                  <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <IconEbook className="w-5 h-5 text-neutral-900/50" />
                    <div>
                      <p 
                        className="font-medium"
                        style={{ color: 'var(--color-neutral-900)' }}
                      >
                        {job.inputFile.name}
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--color-neutral-900)', opacity: '0.6' }}>
                        {job.inputFile.format.toUpperCase()} â†’ {job.outputFormat.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {job.status === 'processing' && (
                    <div style={{ marginTop: 'var(--space-1)' }}>
                      <div 
                        className="w-full rounded-full h-2"
                        style={{ backgroundColor: 'var(--color-neutral-200)' }}
                      >
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            backgroundColor: 'var(--color-primary)',
                            width: `${job.progress}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                  <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                    {getStatusIcon(job.status)}
                    <span 
                      className="text-sm font-medium"
                      style={{ 
                        color: job.status === 'completed' ? 'var(--color-success)' :
                               job.status === 'failed' ? 'var(--color-danger)' :
                               job.status === 'processing' ? 'var(--color-primary)' :
                               'var(--color-neutral-900)'
                      }}
                    >
                      {getStatusText(job.status)}
                    </span>
                  </div>
                  
                  {job.status === 'completed' && job.outputFile && (
                    <a
                      href={job.outputFile.downloadUrl}
                      download
                      className="flex items-center space-x-1 rounded transition-colors font-medium"
                      style={{
                        backgroundColor: 'var(--color-success)',
                        color: 'var(--color-neutral-100)',
                        padding: 'var(--space-1) var(--space-2)'
                      }}
                    >
                      <IconDownload className="w-4 h-4" />
                      <span>Descargar</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


