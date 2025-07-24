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
      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
        <IconCheck className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Conversion Complete!</h2>
        <p className="text-neutral-600 mt-1">
          Your file <span className="font-semibold text-neutral-700">{fromFile}</span> has been converted to <span className="font-semibold text-neutral-700">{toFormat}</span>.
        </p>
      </div>

      <div className="w-full max-w-md bg-neutral-100 border rounded-lg p-4">
        <p className="font-mono text-neutral-900 break-all">{getNewFileName()}</p>
      </div>
      
      <div className="w-full flex flex-col sm:flex-row sm:justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
        <button
            onClick={onReset}
            className="w-full sm:w-auto order-2 sm:order-1 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors"
          >
            <IconRefresh className="w-5 h-5 mr-2" />
            Convert Another
          </button>
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <IconDownload className="w-5 h-5 mr-2" />
            Download File
          </button>
      </div>
    </div>
  );
};