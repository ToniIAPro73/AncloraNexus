import React from 'react';
import { IconCheck, IconDownload, IconRefresh } from './Icons';

interface ConversionSuccessProps {
  fromFile: string;
  toFormat: string;
  onReset: () => void;
}

export const ConversionSuccess: React.FC<ConversionSuccessProps> = ({ fromFile, toFormat, onReset }) => {
  const getNewFileName = () => {
    const nameWithoutExtension = fromFile.substring(0, fromFile.lastIndexOf('.'));
    return `${nameWithoutExtension || fromFile}.${toFormat.toLowerCase()}`;
  }
  
  const handleDownload = () => {
    // This creates a mock file and triggers a browser download.
    const newFileName = getNewFileName();
    const mockContent = `This is a mock converted file for '${fromFile}' converted to ${toFormat}.`;
    const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
        <IconCheck className="w-10 h-10 text-success" />
      </div>
      <div>
        <h2 className="text-h2 text-success">¡Conversión completada!</h2>
        <p className="text-body mt-1">
          Tu archivo <span className="font-semibold">{fromFile}</span> se convirtió a <span className="font-semibold text-primary">{toFormat}</span>.
        </p>
      </div>

      <div className="card w-full max-w-md">
        <div className="card-body">
          <p className="font-mono break-all">{getNewFileName()}</p>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row sm:justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
        <button
          onClick={onReset}
          className="btn btn-secondary w-full sm:w-auto order-2 sm:order-1 flex items-center justify-center"
        >
          <IconRefresh className="w-5 h-5 mr-2" />
          Convertir otro
        </button>
        <button
          onClick={handleDownload}
          className="btn btn-primary w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center"
        >
          <IconDownload className="w-5 h-5 mr-2" />
          Descargar archivo
        </button>
      </div>
    </div>
  );
};