import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { apiService, getConversionCost, formatFileSize } from '../services/api';
import { useAuth } from '../auth/AuthContext';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || (() => (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">Algo salió mal. Por favor, recarga la página.</p>
        </div>
      ));
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}

interface ConversionOption {
  from: string;
  to: string;
  icon: string;
  cost: number;
}

export const UniversalConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, refreshUser } = useAuth();

  // Memoized popular conversions
  const popularConversions: ConversionOption[] = useMemo(() => [
    { from: 'TXT', to: 'HTML', icon: '📝→🌐', cost: 1 },
    { from: 'TXT', to: 'PDF', icon: '📝→📄', cost: 1 },
    { from: 'TXT', to: 'MD', icon: '📝→📋', cost: 1 },
    { from: 'TXT', to: 'RTF', icon: '📝→📄', cost: 1 },
    { from: 'TXT', to: 'DOC', icon: '📝→📄', cost: 2 },
  ], []);

  // Backend Health Check - FUNCIONALIDAD RESTAURADA
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/health', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendStatus('offline');
      }
    };

    checkBackendStatus();
  }, []);

  // Optimized file selection handler - FUNCIONALIDAD REAL RESTAURADA
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    setSelectedFile(file);
    setCurrentStep(2);
    setError('');
    setAnalysis(null);
    
    // Analizar archivo con IA REAL - NO SIMULACIÓN
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/api/conversion/analyze-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error analizando archivo');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
      // Generar sugerencia basada en el análisis
      const suggestions = data.analysis.recommendations;
      if (suggestions && suggestions.length > 0) {
        setAiSuggestion(suggestions[0]);
      }
      
      setCurrentStep(3);
      
    } catch (error: any) {
      console.error('Error en análisis:', error);
      setError(error.message || 'Error al analizar el archivo');
      setAiSuggestion('Error al analizar el archivo. Intenta de nuevo.');
    }
  }, []);

  // Optimized drag and drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Optimized file input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Conversion cost calculation
  const conversionCost = useMemo(() => {
    if (!selectedFile || !targetFormat) return 0;
    return getConversionCost(
      selectedFile.name.split('.').pop()?.toLowerCase() || '',
      targetFormat
    );
  }, [selectedFile, targetFormat]);

  // Optimized convert handler
  const handleConvert = useCallback(async () => {
    if (!selectedFile || !targetFormat || !user) return;
    
    if (user.credits < conversionCost) {
      setError('Créditos insuficientes para esta conversión');
      return;
    }

    setIsConverting(true);
    setCurrentStep(4);
    setError('');
    
    try {
      const response = await apiService.convertFile({
        file: selectedFile,
        target_format: targetFormat,
      });

      if (response.download_url) {
        // Descargar archivo automáticamente
        const downloadResponse = await apiService.downloadConversion(response.id);
        const url = window.URL.createObjectURL(downloadResponse);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.output_filename || `converted.${targetFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      // Actualizar información del usuario
      await refreshUser();
      
      // Resetear formulario
      setIsConverting(false);
      setCurrentStep(1);
      setSelectedFile(null);
      setTargetFormat('');
      setAiSuggestion('');
      setAnalysis(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error('Error en conversión:', error);
      setError(error.message || 'Error durante la conversión');
      setIsConverting(false);
    }
  }, [selectedFile, targetFormat, user, conversionCost, refreshUser]);

  // Render step content
  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="text-4xl mb-2">📁</div>
            <p className="text-slate-300 text-sm">
              Arrastra tu archivo aquí<br />o haz clic para seleccionar
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        );
      case 2:
        return (
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-slate-300 text-sm">Analizando archivo...</p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="">Seleccionar formato</option>
              {analysis?.supported_formats?.map((format: string) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
            {conversionCost > 0 && (
              <div className="text-xs text-slate-400">
                Costo: {conversionCost} créditos
              </div>
            )}
            {targetFormat && (
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded font-medium hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
              >
                {isConverting ? 'Convirtiendo...' : 'Iniciar Conversión'}
              </button>
            )}
          </div>
        );
      case 4:
        return (
          <div className="text-center">
            {isConverting ? (
              <>
                <div className="animate-pulse w-8 h-8 bg-cyan-500 rounded-full mx-auto mb-2"></div>
                <p className="text-slate-300 text-sm">Procesando...</p>
              </>
            ) : (
              <>
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-green-400 text-sm">¡Conversión completada!</p>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [currentStep, handleDrop, handleFileInputChange, targetFormat, analysis, conversionCost, isConverting, handleConvert]);

  return (
    <ErrorBoundary>
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Conversor Inteligente</h1>
          <p className="text-slate-400 mt-2">Convierte archivos con inteligencia artificial avanzada</p>
          {backendStatus === 'offline' && (
            <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              <p className="text-red-400 text-sm">⚠️ Backend no disponible</p>
            </div>
          )}
          {backendStatus === 'checking' && (
            <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
              <p className="text-yellow-400 text-sm">🔄 Verificando conexión...</p>
            </div>
          )}
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <main className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="mb-6 bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-slate-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setCurrentStep(1);
                    setAiSuggestion('');
                    setAnalysis(null);
                    setTargetFormat('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[200px] flex items-center justify-center">
            {renderStepContent}
          </div>

          {/* AI Suggestion */}
          {aiSuggestion && (
            <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="text-blue-300 font-medium mb-1">Sugerencia IA</h4>
                  <p className="text-slate-300 text-sm">{aiSuggestion}</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Popular Conversions */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">🚀 Conversiones Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {popularConversions.map((conversion, index) => (
              <button
                key={index}
                onClick={() => {
                  // Lógica para selección rápida si es necesario
                }}
                className="bg-slate-700/30 hover:bg-slate-600/30 border border-slate-600/30 rounded-lg p-4 text-center transition-all duration-200 hover:border-blue-500/30"
              >
                <div className="text-2xl mb-2">{conversion.icon}</div>
                <p className="text-white font-medium text-sm">{conversion.from} → {conversion.to}</p>
                <p className="text-slate-400 text-xs">{conversion.cost} créditos</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default UniversalConverter;
