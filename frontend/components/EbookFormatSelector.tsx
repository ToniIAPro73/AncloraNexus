import React, { useState, useEffect } from 'react';
import { IconEbook, IconCheck, IconSparkles, IconSettings } from './Icons';
import { EbookFormatService } from '../services/ebookFormatService';

interface FormatOption {
  format: string;
  name: string;
  description: string;
  recommended?: boolean;
  deviceCompatibility: string[];
  advantages: string[];
  disadvantages: string[];
}

interface EbookFormatSelectorProps {
  sourceFormat?: string;
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  targetDevice?: 'kindle' | 'kobo' | 'mobile' | 'desktop' | 'universal';
  showAdvanced?: boolean;
  className?: string;
}

export const EbookFormatSelector: React.FC<EbookFormatSelectorProps> = ({
  sourceFormat,
  selectedFormat,
  onFormatChange,
  targetDevice = 'universal',
  showAdvanced = false,
  className = ''
}) => {
  const [availableFormats, setAvailableFormats] = useState<FormatOption[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [compatibility, setCompatibility] = useState<any>(null);
  
  const formatService = EbookFormatService.getInstance();

  useEffect(() => {
    // Obtener formatos recomendados para el dispositivo
    const recommendedFormats = formatService.getRecommendedFormats(targetDevice);
    
    // Convertir a opciones de formato
    const options: FormatOption[] = recommendedFormats.map(format => ({
      format: format.extension,
      name: format.name,
      description: format.description,
      recommended: format.deviceCompatibility.includes(targetDevice),
      deviceCompatibility: format.deviceCompatibility,
      advantages: format.advantages,
      disadvantages: format.disadvantages
    }));

    // Agregar formatos adicionales comunes si no están incluidos
    const commonFormats = ['epub', 'pdf', 'mobi', 'azw3', 'txt'];
    commonFormats.forEach(formatExt => {
      if (!options.find(opt => opt.format === formatExt)) {
        const formatDetails = formatService.getFormatDetails(formatExt);
        if (formatDetails) {
          options.push({
            format: formatDetails.extension,
            name: formatDetails.name,
            description: formatDetails.description,
            recommended: false,
            deviceCompatibility: formatDetails.deviceCompatibility,
            advantages: formatDetails.advantages,
            disadvantages: formatDetails.disadvantages
          });
        }
      }
    });

    setAvailableFormats(options);
  }, [targetDevice, formatService]);

  useEffect(() => {
    // Verificar compatibilidad si hay formato fuente
    if (sourceFormat && selectedFormat) {
      const compatibilityInfo = formatService.checkCompatibility(sourceFormat, selectedFormat);
      setCompatibility(compatibilityInfo);
    }
  }, [sourceFormat, selectedFormat, formatService]);

  const handleFormatSelect = (format: string) => {
    onFormatChange(format);
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'kindle':
      case 'amazon':
        return '📱';
      case 'kobo':
        return '📖';
      case 'mobile':
      case 'android':
      case 'ios':
        return '📱';
      case 'desktop':
        return '💻';
      case 'tablet':
        return '📱';
      default:
        return '🌐';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'var(--color-success)';
      case 'medium': return 'var(--color-warning)';
      case 'hard': return 'var(--color-danger)';
      default: return 'var(--color-neutral-900)';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Moderada';
      case 'hard': return 'Compleja';
      case 'impossible': return 'Imposible';
      default: return 'Desconocida';
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <h3 
          className="font-semibold flex items-center"
          style={{ 
            fontSize: '20px',
            color: 'var(--color-neutral-900)',
            marginBottom: 'var(--space-1)',
            gap: 'var(--space-1)'
          }}
        >
          <IconSettings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          Seleccionar formato de salida
        </h3>
        <p style={{ 
          fontSize: '14px', 
          color: 'var(--color-neutral-900)', 
          opacity: '0.7' 
        }}>
          Optimizado para: <strong>{targetDevice === 'universal' ? 'Todos los dispositivos' : targetDevice}</strong>
        </p>
      </div>

      {/* Compatibility Warning */}
      {compatibility && !compatibility.compatible && (
        <div 
          className="rounded-lg p-3 mb-4 flex items-center"
          style={{ 
            backgroundColor: 'var(--color-danger)',
            color: 'var(--color-neutral-100)',
            gap: 'var(--space-2)'
          }}
        >
          <IconCheck className="w-5 h-5" />
          <span>Conversión no disponible de {sourceFormat} a {selectedFormat}</span>
        </div>
      )}

      {/* Compatibility Info */}
      {compatibility && compatibility.compatible && (
        <div 
          className="rounded-lg p-3 mb-4"
          style={{ 
            backgroundColor: 'var(--color-neutral-200)',
            border: `1px solid var(--color-neutral-200)`
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span 
              className="font-medium"
              style={{ color: 'var(--color-neutral-900)' }}
            >
              Dificultad de conversión:
            </span>
            <span 
              className="font-medium"
              style={{ color: getDifficultyColor(compatibility.difficulty) }}
            >
              {getDifficultyText(compatibility.difficulty)}
            </span>
          </div>
          
          {compatibility.warnings.length > 0 && (
            <div style={{ marginBottom: 'var(--space-1)' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-warning)', fontWeight: '500' }}>
                Advertencias:
              </p>
              <ul style={{ fontSize: '12px', color: 'var(--color-neutral-900)', opacity: '0.8' }}>
                {compatibility.warnings.map((warning: string, index: number) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {compatibility.dataLoss.length > 0 && (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--color-danger)', fontWeight: '500' }}>
                Posible pérdida de datos:
              </p>
              <ul style={{ fontSize: '12px', color: 'var(--color-neutral-900)', opacity: '0.8' }}>
                {compatibility.dataLoss.map((loss: string, index: number) => (
                  <li key={index}>• {loss}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Format Grid */}
      <div 
        className="grid gap-3"
        style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
        }}
      >
        {availableFormats.map((option) => (
          <div
            key={option.format}
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-150 ${
              selectedFormat === option.format ? 'ring-2' : ''
            }`}
            style={{
              borderColor: selectedFormat === option.format ? 'var(--color-primary)' : 'var(--color-neutral-200)',
              backgroundColor: selectedFormat === option.format ? 'rgba(0, 110, 230, 0.05)' : 'var(--color-neutral-100)',
              ringColor: selectedFormat === option.format ? 'var(--color-primary)' : 'transparent'
            }}
            onClick={() => handleFormatSelect(option.format)}
          >
            {/* Recommended Badge */}
            {option.recommended && (
              <div 
                className="absolute -top-2 -right-2 rounded-full px-2 py-1 text-xs font-medium flex items-center"
                style={{ 
                  backgroundColor: 'var(--color-success)',
                  color: 'var(--color-neutral-100)',
                  gap: '4px'
                }}
              >
                <IconSparkles className="w-3 h-3" />
                Recomendado
              </div>
            )}

            {/* Format Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <IconEbook 
                  className="w-6 h-6" 
                  style={{ color: selectedFormat === option.format ? 'var(--color-primary)' : 'var(--color-neutral-900)' }}
                />
                <div>
                  <h4 
                    className="font-semibold"
                    style={{ 
                      fontSize: '16px',
                      color: 'var(--color-neutral-900)'
                    }}
                  >
                    {option.name}
                  </h4>
                  <p 
                    className="uppercase text-xs font-medium"
                    style={{ 
                      color: 'var(--color-neutral-900)',
                      opacity: '0.6'
                    }}
                  >
                    .{option.format}
                  </p>
                </div>
              </div>
              
              {selectedFormat === option.format && (
                <IconCheck 
                  className="w-5 h-5" 
                  style={{ color: 'var(--color-primary)' }}
                />
              )}
            </div>

            {/* Description */}
            <p 
              style={{ 
                fontSize: '14px',
                color: 'var(--color-neutral-900)',
                opacity: '0.8',
                marginBottom: 'var(--space-2)'
              }}
            >
              {option.description}
            </p>

            {/* Device Compatibility */}
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <p 
                className="font-medium"
                style={{ 
                  fontSize: '12px',
                  color: 'var(--color-neutral-900)',
                  marginBottom: '4px'
                }}
              >
                Compatible con:
              </p>
              <div className="flex flex-wrap" style={{ gap: '4px' }}>
                {option.deviceCompatibility.slice(0, 4).map((device) => (
                  <span
                    key={device}
                    className="inline-flex items-center px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: 'var(--color-neutral-200)',
                      color: 'var(--color-neutral-900)',
                      gap: '4px'
                    }}
                  >
                    <span>{getDeviceIcon(device)}</span>
                    {device}
                  </span>
                ))}
                {option.deviceCompatibility.length > 4 && (
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--color-neutral-900)', opacity: '0.6' }}
                  >
                    +{option.deviceCompatibility.length - 4} más
                  </span>
                )}
              </div>
            </div>

            {/* Advanced Details Toggle */}
            {showAdvanced && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(showDetails === option.format ? null : option.format);
                }}
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--color-primary)' }}
              >
                {showDetails === option.format ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            )}

            {/* Expanded Details */}
            {showAdvanced && showDetails === option.format && (
              <div 
                className="mt-3 pt-3 border-t"
                style={{ borderColor: 'var(--color-neutral-200)' }}
              >
                {option.advantages.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <p 
                      className="font-medium"
                      style={{ 
                        fontSize: '12px',
                        color: 'var(--color-success)',
                        marginBottom: '4px'
                      }}
                    >
                      Ventajas:
                    </p>
                    <ul style={{ fontSize: '11px', color: 'var(--color-neutral-900)', opacity: '0.8' }}>
                      {option.advantages.slice(0, 3).map((advantage, index) => (
                        <li key={index}>• {advantage}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {option.disadvantages.length > 0 && (
                  <div>
                    <p 
                      className="font-medium"
                      style={{ 
                        fontSize: '12px',
                        color: 'var(--color-warning)',
                        marginBottom: '4px'
                      }}
                    >
                      Limitaciones:
                    </p>
                    <ul style={{ fontSize: '11px', color: 'var(--color-neutral-900)', opacity: '0.8' }}>
                      {option.disadvantages.slice(0, 2).map((disadvantage, index) => (
                        <li key={index}>• {disadvantage}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Format Comparison */}
      {showAdvanced && availableFormats.length > 1 && (
        <div 
          className="mt-6 p-4 rounded-lg"
          style={{ 
            backgroundColor: 'var(--color-neutral-200)',
            border: `1px solid var(--color-neutral-200)`
          }}
        >
          <h4 
            className="font-semibold mb-3"
            style={{ 
              fontSize: '16px',
              color: 'var(--color-neutral-900)'
            }}
          >
            Comparación de formatos
          </h4>
          <div className="text-sm" style={{ color: 'var(--color-neutral-900)', opacity: '0.8' }}>
            <p>• <strong>EPUB:</strong> Mejor para lectura general y dispositivos múltiples</p>
            <p>• <strong>PDF:</strong> Ideal para documentos con formato fijo</p>
            <p>• <strong>MOBI/AZW3:</strong> Optimizado para dispositivos Kindle</p>
            <p>• <strong>TXT:</strong> Máxima compatibilidad, sin formato</p>
          </div>
        </div>
      )}
    </div>
  );
};

