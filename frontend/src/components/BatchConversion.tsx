// Stub para evitar errores de importaciÃ³n en desarrollo
import React from 'react';

export interface BatchConversionProps {
  onFilesAdded?: (files: File[]) => void;
  onConvert?: (selectedFiles: string[], targetFormat: string) => void;
  files?: any[];
}

export const BatchConversion: React.FC<BatchConversionProps> = () => {
  return (
    <div style={{ padding: 24, border: '1px dashed #ccc', borderRadius: 8, background: '#fafafa' }}>
      <h2>BatchConversion (stub)</h2>
      <p>Este es un stub temporal para evitar errores de importaciÃ³n.</p>
      <p>Implementa la lÃ³gica real aquÃ­.</p>
    </div>
  );
};

export default BatchConversion;

