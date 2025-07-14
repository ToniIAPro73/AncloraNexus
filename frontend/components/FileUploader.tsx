import React, { useState, useCallback, PropsWithChildren } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  acceptedFiles?: string;
}

export const FileUploader: React.FC<PropsWithChildren<FileUploaderProps>> = ({ 
  onFileSelect, 
  isLoading, 
  acceptedFiles = '*',
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((files: FileList | null) => {
    if (files && files[0]) {
        onFileSelect(files[0]);
    }
  }, [onFileSelect]);

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
              />
              {children}
          </div>
      );
  }

  // Default drag-and-drop UI if no children are passed
  return (
    <div
      className={`relative group transition-all duration-300 ${isDragging ? 'border-blue-500 scale-105 bg-blue-50' : 'border-slate-300 bg-slate-50/50 hover:border-blue-400'} border-2 border-dashed rounded-xl p-8 text-center ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
        {/* Input is now outside the main clickable div to support both modes */}
         <input
            id="file-input"
            type="file"
            className="hidden"
            accept={acceptedFiles}
            onChange={handleInputChange}
            disabled={isLoading}
        />
        {/* ... rest of default UI ... */}
    </div>
  );
};