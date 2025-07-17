import React, { useState, useRef } from 'react';
  import { apiService, getConversionCost, formatFileSize } from '../services/api';
  import { useAuth } from '../auth/AuthContext';

export const UniversalConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, refreshUser } = useAuth();

  const popularConversions = [
    { from: 'TXT', to: 'HTML', icon: '📝→🌐', cost: 1 },
    { from: 'TXT', to: 'PDF', icon: '📝→📄', cost: 1 },
    { from: 'TXT', to: 'MD', icon: '📝→📋', cost: 1 },
    { from: 'TXT', to: 'RTF', icon: '📝→📄', cost: 1 },
    { from: 'TXT', to: 'DOC', icon: '📝→📄', cost: 2 },
  ];

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setCurrentStep(2);
    setError('');
    setAnalysis(null);
    
    // Analizar archivo con IA real
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat || !user) return;
    
    const cost = getConversionCost(
      selectedFile.name.split('.').pop()?.toLowerCase() || '',
      targetFormat
    );
    
    if (user.credits < cost) {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🎯 Conversor Inteligente
        </h1>
        <p className="text-slate-300">
          Convierte archivos con inteligencia artificial avanzada
        </p>
        {user && (
          <div className="mt-4 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3">
            <span className="text-slate-400">Créditos disponibles: </span>
            <span className="text-green-400 font-bold text-lg">{user.credits}</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Workflow Steps */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1: Upload */}
          <div className={`p-4 rounded-lg border transition-all duration-300 ${
            currentStep === 1 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'bg-slate-700/30 border-slate-600/30'
          }`}>
            <h3 className="text-white font-medium mb-3">📁 Subir Archivo</h3>
            {!selectedFile ? (
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
            ) : (
              <div className="bg-slate-600/30 rounded-lg p-3">
                <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                <p className="text-slate-400 text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Analyze */}
          <div className={`p-4 rounded-lg border transition-all duration-300 ${
            currentStep === 2 
              ? 'bg-purple-500/10 border-purple-500/30' 
              : 'bg-slate-700/30 border-slate-600/30'
          }`}>
            <h3 className="text-white font-medium mb-3">🤖 Análisis IA</h3>
            {currentStep >= 2 ? (
              <div className="text-center">
                {currentStep === 2 ? (
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                ) : (
                  <div className="text-2xl mb-2">✅</div>
                )}
                <p className="text-slate-300 text-sm">
                  {currentStep === 2 ? 'Analizando archivo...' : 'Análisis completado'}
                </p>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <div className="text-2xl mb-2">🤖</div>
                <p className="text-sm">Esperando archivo</p>
              </div>
            )}
          </div>

          {/* Step 3: Configure */}
          <div className={`p-4 rounded-lg border transition-all duration-300 ${
            currentStep === 3 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-slate-700/30 border-slate-600/30'
          }`}>
            <h3 className="text-white font-medium mb-3">⚙️ Configurar</h3>
            {currentStep >= 3 ? (
              <div className="space-y-2">
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="">Seleccionar formato</option>
                  {analysis?.supported_formats?.map((format: string) => (
                    <option key={format} value={format}>
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
                {selectedFile && targetFormat && (
                  <div className="text-xs text-slate-400">
                    Costo: {getConversionCost(
                      selectedFile.name.split('.').pop()?.toLowerCase() || '',
                      targetFormat
                    )} créditos
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <div className="text-2xl mb-2">⚙️</div>
                <p className="text-sm">Configuración pendiente</p>
              </div>
            )}
          </div>

          {/* Step 4: Download */}
          <div className={`p-4 rounded-lg border transition-all duration-300 ${
            currentStep === 4 
              ? 'bg-cyan-500/10 border-cyan-500/30' 
              : 'bg-slate-700/30 border-slate-600/30'
          }`}>
            <h3 className="text-white font-medium mb-3">📥 Descargar</h3>
            {currentStep === 4 ? (
              <div className="text-center">
                {isConverting ? (
                  <>
                    <div className="animate-pulse w-8 h-8 bg-cyan-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-slate-300 text-sm">Convirtiendo...</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-2">🎉</div>
                    <button className="bg-cyan-500 text-white px-3 py-1 rounded text-sm hover:bg-cyan-600 transition-colors">
                      Descargar
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <div className="text-2xl mb-2">📥</div>
                <p className="text-sm">Descarga pendiente</p>
              </div>
            )}
          </div>
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

        {/* Convert Button */}
        {currentStep === 3 && targetFormat && (
          <div className="mt-6 text-center">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50"
            >
              {isConverting ? 'Convirtiendo...' : 'Iniciar Conversión'}
            </button>
          </div>
        )}
      </div>

      {/* Popular Conversions */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-white mb-4">🚀 Conversiones Populares</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {popularConversions.map((conversion, index) => (
            <button
              key={index}
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
  );
};

