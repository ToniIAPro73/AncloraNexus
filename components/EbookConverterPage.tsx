import React, { useState } from 'react';
import { EbookConverter } from './EbookConverter';
import { EbookFormatSelector } from './EbookFormatSelector';
import { EbookMetadataViewer } from './EbookMetadataViewer';
import { IconEbook, IconArrowLeft } from './Icons';
import { EbookFile, EbookMetadata, EbookValidationResult } from '../types/ebook';

interface EbookConverterPageProps {
  onBack?: () => void;
  className?: string;
}

export const EbookConverterPage: React.FC<EbookConverterPageProps> = ({ 
  onBack, 
  className = '' 
}) => {
  const [selectedFile, setSelectedFile] = useState<EbookFile | null>(null);
  const [metadata, setMetadata] = useState<EbookMetadata | null>(null);
  const [validationResult, setValidationResult] = useState<EbookValidationResult | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('epub');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleFileValidated = (file: EbookFile, validation: EbookValidationResult) => {
    setSelectedFile(file);
    setMetadata(file.metadata || null);
    setValidationResult(validation);
  };

  const handleMetadataChange = (newMetadata: EbookMetadata) => {
    setMetadata(newMetadata);
    if (selectedFile) {
      setSelectedFile({
        ...selectedFile,
        metadata: newMetadata
      });
    }
  };

  return (
    <div className={`min-h-screen ${className}`} style={{ backgroundColor: 'var(--color-neutral-200)' }}>
      {/* Header */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: 'var(--color-neutral-100)',
          borderColor: 'var(--color-neutral-200)'
        }}
      >
        <div className="container mx-auto" style={{ padding: 'var(--space-2)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center transition-colors rounded p-2"
                  style={{ 
                    color: 'var(--color-primary)',
                    gap: 'var(--space-1)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 110, 230, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <IconArrowLeft className="w-5 h-5" />
                  <span>Volver</span>
                </button>
              )}
              
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <IconEbook className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h1 
                    className="font-bold"
                    style={{ 
                      fontSize: '24px',
                      color: 'var(--color-neutral-900)',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    Conversor de E-books
                  </h1>
                  <p 
                    style={{ 
                      fontSize: '14px',
                      color: 'var(--color-neutral-900)',
                      opacity: '0.7'
                    }}
                  >
                    Convierte entre formatos de libros electrónicos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="px-3 py-1 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: showAdvancedOptions ? 'var(--color-primary)' : 'var(--color-neutral-200)',
                  color: showAdvancedOptions ? 'var(--color-neutral-100)' : 'var(--color-neutral-900)'
                }}
              >
                {showAdvancedOptions ? 'Ocultar opciones' : 'Opciones avanzadas'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto" style={{ padding: 'var(--space-3)' }}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Converter Section */}
          <div className="lg:col-span-2">
            <EbookConverter 
              className="mb-6"
              onFileValidated={handleFileValidated}
            />
            
            {/* Format Selector */}
            {selectedFile && (
              <div 
                className="rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-neutral-100)',
                  borderColor: 'var(--color-neutral-200)',
                  padding: 'var(--space-3)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <EbookFormatSelector
                  sourceFormat={selectedFile.format}
                  selectedFormat={selectedFormat}
                  onFormatChange={setSelectedFormat}
                  targetDevice="universal"
                  showAdvanced={showAdvancedOptions}
                />
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="lg:col-span-1">
            {(metadata || validationResult) && (
              <div 
                className="rounded-lg border sticky top-6"
                style={{ 
                  backgroundColor: 'var(--color-neutral-100)',
                  borderColor: 'var(--color-neutral-200)',
                  padding: 'var(--space-3)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <EbookMetadataViewer
                  metadata={metadata || undefined}
                  validationResult={validationResult || undefined}
                  editable={true}
                  onMetadataChange={handleMetadataChange}
                />
              </div>
            )}
            
            {!metadata && !validationResult && (
              <div 
                className="rounded-lg border text-center p-8"
                style={{ 
                  backgroundColor: 'var(--color-neutral-100)',
                  borderColor: 'var(--color-neutral-200)'
                }}
              >
                <IconEbook 
                  className="w-12 h-12 mx-auto mb-4" 
                  style={{ color: 'var(--color-neutral-900)', opacity: '0.3' }}
                />
                <p 
                  style={{ 
                    color: 'var(--color-neutral-900)', 
                    opacity: '0.6',
                    fontSize: '14px'
                  }}
                >
                  Sube un e-book para ver sus metadatos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Options Panel */}
        {showAdvancedOptions && selectedFile && (
          <div 
            className="mt-6 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--color-neutral-100)',
              borderColor: 'var(--color-neutral-200)',
              padding: 'var(--space-3)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 
              className="font-semibold mb-4"
              style={{ 
                fontSize: '18px',
                color: 'var(--color-neutral-900)'
              }}
            >
              Opciones avanzadas de conversión
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-3)' }}>
              {/* Quality Settings */}
              <div>
                <label 
                  className="block font-medium mb-2"
                  style={{ 
                    fontSize: '14px',
                    color: 'var(--color-neutral-900)'
                  }}
                >
                  Calidad de conversión
                </label>
                <select 
                  className="w-full rounded border"
                  style={{
                    padding: 'var(--space-1)',
                    borderColor: 'var(--color-neutral-200)',
                    fontSize: '14px'
                  }}
                >
                  <option value="low">Baja (archivo más pequeño)</option>
                  <option value="medium" selected>Media (recomendado)</option>
                  <option value="high">Alta (mejor calidad)</option>
                </select>
              </div>

              {/* Device Optimization */}
              <div>
                <label 
                  className="block font-medium mb-2"
                  style={{ 
                    fontSize: '14px',
                    color: 'var(--color-neutral-900)'
                  }}
                >
                  Optimizar para dispositivo
                </label>
                <select 
                  className="w-full rounded border"
                  style={{
                    padding: 'var(--space-1)',
                    borderColor: 'var(--color-neutral-200)',
                    fontSize: '14px'
                  }}
                >
                  <option value="generic" selected>Genérico</option>
                  <option value="kindle">Kindle</option>
                  <option value="kobo">Kobo</option>
                </select>
              </div>

              {/* Additional Options */}
              <div>
                <label 
                  className="block font-medium mb-2"
                  style={{ 
                    fontSize: '14px',
                    color: 'var(--color-neutral-900)'
                  }}
                >
                  Opciones adicionales
                </label>
                <div className="space-y-2">
                  <label className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: '12px' }}>Preservar metadatos</span>
                  </label>
                  <label className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: '12px' }}>Embebido de fuentes</span>
                  </label>
                  <label className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                    <input type="checkbox" />
                    <span style={{ fontSize: '12px' }}>Comprimir imágenes</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

