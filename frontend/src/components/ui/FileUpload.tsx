import React, { useRef } from 'react';

interface Props { onFileSelect?: (files: File|File[]) => void; onFilesSelected?: (files: File[]) => void; isLoading?: boolean; multiple?: boolean; children?: React.ReactNode; maxFiles?: number; maxSizeMB?: number; acceptedFormats?: string[]; className?: string; dropzoneLabel?: string; supportedFormatsLabel?: string }
export const FileUpload: React.FC<Props> = ({ onFileSelect, onFilesSelected, isLoading=false, multiple=false, children, className='' }) => {
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const payloadArray = multiple ? Array.from(files) : [files[0]];
    onFileSelect?.(multiple ? payloadArray : payloadArray[0]);
    onFilesSelected?.(payloadArray);
  };
  return (
    <div onClick={()=>ref.current?.click()} className={`cursor-pointer ${isLoading?'opacity-60 pointer-events-none':''} ${className}`}>
      <input ref={ref} type="file" className="hidden" multiple={multiple} onChange={handleChange} />
      {children}
    </div>
  );
};
