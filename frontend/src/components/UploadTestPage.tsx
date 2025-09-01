import React, { useState } from 'react';
import { SmartFileUploader } from './SmartFileUploader';
import { BatchFileUploader } from './BatchFileUploader';
import { EnhancedFileUploader } from './EnhancedFileUploader';
import { FileUploader } from './FileUploader';
import { FileUpload } from './ui/FileUpload';
import type { ConversionResult, ConversionError } from '../services/ConversionService';

export const UploadTestPage: React.FC = () => {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [errors, setErrors] = useState<ConversionError[]>([]);

  const handleConversionComplete = (result: ConversionResult) => {
    setResults(prev => [...prev, result]);
    console.log('Conversion completed:', result);
  };

  const handleError = (error: ConversionError) => {
    setErrors(prev => [...prev, error]);
    console.error('Conversion error:', error);
  };

  const handleBatchComplete = (batchResults: ConversionResult[]) => {
    setResults(prev => [...prev, ...batchResults]);
    console.log('Batch conversion completed:', batchResults);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Upload Functionality Test Suite
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Testing all upload components and conversion functionality
          </p>
        </div>

        {/* Smart File Uploader */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            1. Smart File Uploader (AI-Enhanced)
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Intelligent format suggestions and enhanced UX
          </p>
          <SmartFileUploader
            onConversionComplete={handleConversionComplete}
            onError={handleError}
            showFormatSuggestions={true}
          />
        </section>

        {/* Enhanced File Uploader */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            2. Enhanced File Uploader
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Improved progress tracking and error handling
          </p>
          <EnhancedFileUploader
            onConversionComplete={handleConversionComplete}
            onError={handleError}
          />
        </section>

        {/* Batch File Uploader */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            3. Batch File Uploader
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Multiple file processing with queue management
          </p>
          <BatchFileUploader
            maxFiles={5}
            onBatchComplete={handleBatchComplete}
            onError={handleError}
          />
        </section>

        {/* Original Components */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            4. Original Components (For Comparison)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">FileUploader</h3>
              <FileUploader
                onFileSelect={(files) => console.log('FileUploader:', files)}
                acceptedFiles="*"
                multiple={false}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">FileUpload</h3>
              <FileUpload
                onFilesSelected={(files) => console.log('FileUpload:', files)}
                multiple={false}
              >
                <div className="p-6 border-2 border-dashed rounded-md text-center hover:bg-gray-50 dark:hover:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Haz clic para seleccionar archivo
                  </p>
                </div>
              </FileUpload>
            </div>
          </div>
        </section>

        {/* Results Summary */}
        {(results.length > 0 || errors.length > 0) && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              📊 Test Results
            </h2>
            
            {results.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-3">
                  ✅ Successful Conversions ({results.length})
                </h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-green-700 dark:text-green-300">
                        {result.fileName} ({result.originalFormat} → {result.targetFormat})
                      </span>
                      <a
                        href={result.downloadUrl}
                        download={result.fileName}
                        className="text-green-600 dark:text-green-400 hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-3">
                  ❌ Conversion Errors ({errors.length})
                </h3>
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-red-700 dark:text-red-300">
                        {error.fileName}: {error.errorMessage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* API Status */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            🔧 System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-medium text-gray-900 dark:text-white">Backend API</h3>
              <p className="text-sm text-green-600 dark:text-green-400">✅ Running on port 8000</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-medium text-gray-900 dark:text-white">Guest Uploads</h3>
              <p className="text-sm text-green-600 dark:text-green-400">✅ Enabled (10MB limit)</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-medium text-gray-900 dark:text-white">Conversions</h3>
              <p className="text-sm text-green-600 dark:text-green-400">✅ Multiple formats supported</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
