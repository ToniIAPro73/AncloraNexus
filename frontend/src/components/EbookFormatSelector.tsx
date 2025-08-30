import React from 'react';
import { IconEbook, IconCheck, IconSettings } from './Icons';

interface EbookFormatSelectorProps {
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  targetDevice?: 'kindle' | 'kobo' | 'mobile' | 'desktop' | 'universal';
  className?: string;
}

export const EbookFormatSelector: React.FC<EbookFormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
  targetDevice = 'universal',
  className = ''
}) => {
  const availableFormats = [
    { format: 'epub', name: 'EPUB', description: 'Formato abierto' },
    { format: 'pdf', name: 'PDF', description: 'DiseÃ±o fijo' },
    { format: 'mobi', name: 'MOBI', description: 'Kindle antiguo' },
    { format: 'azw3', name: 'AZW3', description: 'Kindle moderno' },
    { format: 'txt', name: 'TXT', description: 'Texto plano' },
  ];

  return (
    <div className={className}>
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <h3 className="text-h3 font-semibold flex items-center" style={{ color: 'var(--color-neutral-900)', marginBottom: 'var(--space-1)', gap: 'var(--space-1)' }}>
          <IconSettings className="w-5 h-5 text-primary" />
          Seleccionar formato de salida
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-neutral-900)', opacity: '0.7' }}>
          Optimizado para: <strong>{targetDevice === 'universal' ? 'Todos los dispositivos' : targetDevice}</strong>
        </p>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {availableFormats.map((option) => (
          <div
            key={option.format}
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-150 ${selectedFormat === option.format ? 'ring-2' : ''}`}
            style={{
              borderColor: selectedFormat === option.format ? 'var(--color-primary)' : 'var(--color-neutral-200)',
              backgroundColor: selectedFormat === option.format ? 'rgba(0, 110, 230, 0.05)' : 'var(--color-neutral-100)'
            }}
            onClick={() => onFormatChange(option.format)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <IconEbook className={`w-6 h-6 ${selectedFormat === option.format ? 'text-primary' : 'text-neutral-900'}`} />
                <div>
                  <h4 className="text-h4 font-semibold" style={{ color: 'var(--color-neutral-900)' }}>
                    {option.name}
                  </h4>
                  <p className="uppercase text-xs font-medium" style={{ color: 'var(--color-neutral-900)', opacity: '0.6' }}>
                    .{option.format}
                  </p>
                </div>
              </div>
              {selectedFormat === option.format && <IconCheck className="w-5 h-5 text-primary" />}
            </div>

            <p style={{ fontSize: '14px', color: 'var(--color-neutral-900)', opacity: '0.8' }}>{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


