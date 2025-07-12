import React, { useState, useMemo } from 'react';
import { FileUploader } from './FileUploader';
import { ConversionSuccess } from './ConversionSuccess';
import { FormatSelector } from './FormatSelector';
import { getFileCategory, getTargetFormats, FileCategory } from '../utils/conversionMaps';
import { IconCheck, IconFile, IconImage, IconVideo, IconAudio, IconArchive, IconPresentation, IconFont, IconEbook, IconArrowRightCircle } from './Icons';

type ConversionStep = 'idle' | 'uploaded' | 'loading' | 'success';

const CategoryIcon: React.FC<{category: FileCategory | 'other', className?: string}> = ({ category, className = "w-12 h-12 text-slate-700" }) => {
    switch(category) {
        case 'image': return <IconImage className={className} />;
        case 'video': return <IconVideo className={className} />;
        case 'audio': return <IconAudio className={className} />;
        case 'document': return <IconFile className={className} />;
        case 'archive': return <IconArchive className={className} />;
        case 'presentation': return <IconPresentation className={className} />;
        case 'font': return <IconFont className={className} />;
        case 'ebook': return <IconEbook className={className} />;
        default: return <IconFile className={className} />;
    }
}

export function UniversalConverter() {
  const [step, setStep] = useState<ConversionStep>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string | null>(null);

  const fileCategory = useMemo(() => uploadedFile ? getFileCategory(uploadedFile.name) : 'other', [uploadedFile]);
  const sourceExtension = useMemo(() => {
    if (!uploadedFile) return undefined;
    const parts = uploadedFile.name.split('.');
    return parts.length > 1 ? parts.pop() : undefined;
  }, [uploadedFile]);

  const availableFormats = useMemo(() => getTargetFormats(fileCategory, sourceExtension), [fileCategory, sourceExtension]);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    const category = getFileCategory(file.name);
    const sourceExt = file.name.split('.').pop();
    const targetFormats = getTargetFormats(category, sourceExt);

    if (Object.keys(targetFormats).length > 0 && Object.values(targetFormats).some(arr => arr.length > 0)) {
        setStep('uploaded');
    } else {
        alert("This file type is not supported for conversion or has no available target formats.");
        setUploadedFile(null);
    }
  };
  
  const handleReset = () => {
    setStep('idle');
    setUploadedFile(null);
    setTargetFormat(null);
  };

  const handleConvert = () => {
    if (!targetFormat) {
      alert("Please select a target format.");
      return;
    }
    setStep('loading');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  if (step === 'success' && uploadedFile && targetFormat) {
    return (
      <div className="p-8 sm:p-12">
        <ConversionSuccess
          fromFile={uploadedFile.name}
          toFormat={targetFormat}
          onReset={handleReset}
        />
      </div>
    );
  }

  if (step === 'loading') {
    return (
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-6 text-xl font-medium text-slate-700">Convirtiendo tu archivo...</p>
            <p className="text-slate-500">Esto puede tardar unos segundos.</p>
        </div>
    );
  }

  if (step === 'uploaded' && uploadedFile) {
    return (
      <div className="p-8 sm:p-12">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-6 sm:space-y-0 sm:space-x-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8">
            <div className="flex-shrink-0 flex items-center space-x-4">
                <CategoryIcon category={fileCategory} />
                <div>
                    <p className="font-semibold text-slate-800 break-all">{uploadedFile.name}</p>
                    <p className="text-sm text-slate-500">{Math.round(uploadedFile.size / 1024)} KB</p>
                </div>
            </div>
            <IconArrowRightCircle className="w-8 h-8 text-slate-400 flex-shrink-0 hidden sm:block" />
             <FormatSelector 
                availableFormats={availableFormats}
                selectedFormat={targetFormat}
                onSelectFormat={setTargetFormat}
             />
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={handleReset} className="w-full sm:w-auto px-6 py-3 border rounded-md text-slate-700 hover:bg-slate-100 transition-colors">
                Cancelar
            </button>
            <button 
                onClick={handleConvert} 
                disabled={!targetFormat}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
            >
                Convertir ahora
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-12">
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50">
        <div className="flex flex-col items-center justify-center h-64">
            <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mb-4">
                <IconImage className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800">
                Explora tus archivos
            </h3>
            <p className="mt-2 text-slate-500">O arrastre y suelte su archivo aquí</p>
            <div className="mt-6">
                <FileUploader onFileSelect={handleFileSelect} isLoading={false} acceptedFiles="*">
                    <button className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors">
                        Elige un archivo
                    </button>
                </FileUploader>
            </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div className="flex items-center justify-center flex-col">
            <IconCheck className="w-6 h-6 text-green-500" />
            <h4 className="mt-2 font-semibold text-slate-700">Fácil</h4>
        </div>
        <div className="flex items-center justify-center flex-col">
            <IconCheck className="w-6 h-6 text-green-500" />
            <h4 className="mt-2 font-semibold text-slate-700">Rápido</h4>
        </div>
        <div className="flex items-center justify-center flex-col">
            <IconCheck className="w-6 h-6 text-green-500" />
            <h4 className="mt-2 font-semibold text-slate-700">Seguro</h4>
        </div>
      </div>
    </div>
  );
}

// Modify FileUploader to accept children for custom button styling
const CustomFileUploader: React.FC<React.PropsWithChildren<{
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  acceptedFiles?: string;
}>> = ({ onFileSelect, isLoading, acceptedFiles = '*', children }) => {
  const handleFile = (files: FileList | null) => {
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    handleFile(e.dataTransfer.files);
  };
  const handleClick = () => document.getElementById('file-input')?.click();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files);

  return (
    <div onDrop={handleDrop} onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={handleClick} className="inline-block">
      <input id="file-input" type="file" className="hidden" accept={acceptedFiles} onChange={handleInputChange} disabled={isLoading} />
      {children}
    </div>
  );
};