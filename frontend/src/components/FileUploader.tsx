import React, { useState, useCallback, PropsWithChildren } from 'react';
import { IconUpload } from './Icons';

interface FileUploaderProps {
  onFileSelect: (file: File | File[]) => void;
  isLoading: boolean;
  acceptedFiles?: string;
  multiple?: boolean;
}

export const FileUploader: React.FC<PropsWithChildren<FileUploaderProps>> = ({
  onFileSelect,
  isLoading,
  acceptedFiles = '*',
  multiple = false,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFileTypeAccepted = (file: File): boolean => {
    if (!acceptedFiles || acceptedFiles === '*') return true;
    const accepted = acceptedFiles.split(',').map((t) => t.trim());
    return accepted.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.toLowerCase());
    });
  };

  const handleFile = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(isFileTypeAccepted);
        setError(validFiles.length === fileArray.length ? null : 'Formato de archivo no soportado');
        if (validFiles.length > 0) {
          onFileSelect(multiple ? validFiles : validFiles[0]);
        }
      }
    },
    [onFileSelect, multiple, acceptedFiles]
  );

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!isLoading) {
      document.getElementById('file-input-child')?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files);
  };
  
  // If children are provided, we use a simpler wrapper.
  if (children) {
      return (
          <div onClick={handleClick} className="cursor-pointer">
              <input
                id="file-input-child"
                type="file"
                className="hidden"
                accept={acceptedFiles}
                onChange={handleInputChange}
                disabled={isLoading}
                multiple={multiple}
              />
              {children}
          </div>
      );
  }

  // Default drag-and-drop UI if no children are passed
  return (
    <div
      className={`relative group transition-all duration-300 ease-in-out ${isDragging ? 'border-blue-500 scale-105 bg-blue-50' : 'border-slate-300 bg-slate-50/50 hover:border-blue-400'} border-2 border-dashed rounded-xl p-8 text-center ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      aria-label="Zona de subida de archivos"
    >
        {/* Input is now outside the main clickable div to support both modes */}
        <input
            id="file-input"
            type="file"
            className="hidden"
            accept={acceptedFiles}
            onChange={handleInputChange}
            disabled={isLoading}
            multiple={multiple}
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none transition-opacity duration-300">
          <IconUpload
            className={`w-10 h-10 text-slate-400 transition-colors duration-300 ${isDragging ? 'text-blue-500' : 'group-hover:text-blue-500'}`}
            aria-hidden="true"
          />
          <p className="text-sm text-slate-600">
            {isDragging ? 'Suelta los archivos aquí' : 'Arrastra y suelta tus archivos o haz clic para seleccionarlos'}
          </p>
          {error && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
    </div>
  );
};