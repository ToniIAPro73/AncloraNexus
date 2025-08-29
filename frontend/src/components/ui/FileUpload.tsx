import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  className?: string;
  dropzoneLabel?: string;
  dragActiveLabel?: string;
  supportedFormatsLabel?: string;
  errorMessages?: {
    tooManyFiles?: string;
    fileTooBig?: string;
    invalidFormat?: string;
  };
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 1,
  maxSizeMB = 50,
  acceptedFormats = [],
  className = '',
  dropzoneLabel = 'Arrastra archivos aquí o haz clic para seleccionar',
  dragActiveLabel = 'Suelta para cargar',
  supportedFormatsLabel = 'Formatos soportados',
  errorMessages = {
    tooManyFiles: `Puedes seleccionar hasta ${maxFiles} archivos`,
    fileTooBig: `El tamaño máximo por archivo es ${maxSizeMB}MB`,
    invalidFormat: 'Formato de archivo no soportado',
  },
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFiles = (files: File[]): boolean => {
    // Check number of files
    if (files.length > maxFiles) {
      setError(errorMessages.tooManyFiles || `Puedes seleccionar hasta ${maxFiles} archivos`);
      return false;
    }
    
    // Check file sizes
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        setError(errorMessages.fileTooBig || `El tamaño máximo por archivo es ${maxSizeMB}MB`);
        return false;
      }
    }
    
    // Check file formats if specified
    if (acceptedFormats.length > 0) {
      for (const file of files) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !acceptedFormats.includes(`.${fileExtension}`)) {
          setError(errorMessages.invalidFormat || 'Formato de archivo no soportado');
          return false;
        }
      }
    }
    
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      if (validateFiles(filesArray)) {
        setError(null);
        onFilesSelected(filesArray);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      if (validateFiles(filesArray)) {
        setError(null);
        onFilesSelected(filesArray);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative flex flex-col items-center justify-center w-full
          p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
          ${dragActive 
            ? 'bg-primary/10 border-primary' 
            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-primary/50'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedFormats.join(',')}
          className="hidden"
          onChange={handleChange}
        />
        
        {/* Icono */}
        <div className="mb-4">
          <svg
            className={`w-10 h-10 ${dragActive ? 'text-primary' : 'text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        
        {/* Texto */}
        <p className="mb-2 text-sm text-center text-slate-300">
          {dragActive ? dragActiveLabel : dropzoneLabel}
        </p>
        
        {/* Formatos soportados */}
        {acceptedFormats.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-400 mb-1">{supportedFormatsLabel}:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {acceptedFormats.map((format) => (
                <span
                  key={format}
                  className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Error */}
        {error && (
          <div className="mt-2 text-xs text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
