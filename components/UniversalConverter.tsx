import React, { useState, useRef, useEffect } from 'react';
import { useCreditSystem } from './CreditSystem';

export const UniversalConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<string>('Conectando...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { balance, consumeCredits, calculateConversionCost } = useCreditSystem();

  // <-- PEGA TODO ESTE BLOQUE AQUÍ
useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then(response => {
        if (!response.ok) throw new Error('Respuesta del backend no fue exitosa');
        return response.json();
      })
      .then(data => setBackendStatus(`✅ Conectado (Estado: ${data.status})`))
      .catch(error => {
        console.error('Error al conectar con el backend:', error);
        setBackendStatus('❌ Error de conexión. ¿El servidor del backend está en marcha?');
      });
}, []); // El array vacío [] asegura que esto solo se ejecute una vez

  const popularConversions = [
    { from: 'PDF', to: 'JPG', icon: '📄→🖼️', cost: 2 },
    { from: 'JPG', to: 'PNG', icon: '🖼️→🎨', cost: 1 },
    { from: 'MP4', to: 'GIF', icon: '🎬→🎞️', cost: 5 },
    { from: 'PNG', to: 'SVG', icon: '🎨→📐', cost: 3 },
    { from: 'DOC', to: 'PDF', icon: '📝→📄', cost: 2 },
  ];

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep(2);
    
    // Simular análisis de IA mejorado
    const simulateAIAnalysis = () => {
      setTimeout(() => {
        try {
          const suggestions = {
            'pdf': 'Para este PDF, recomiendo convertir a JPG con calidad alta para mejor visualización web',
            'jpg': 'Esta imagen se vería mejor como PNG para mantener la calidad sin pérdida',
            'mp4': 'Este video es perfecto para convertir a GIF para uso en redes sociales',
            'doc': 'Convierte a PDF para mejor compatibilidad y distribución'
          };
          
          // Obtener extensión del archivo seleccionado
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          const suggestion = suggestions[fileExtension as keyof typeof suggestions] || 'Archivo detectado. Selecciona el formato de destino para obtener la mejor calidad.';
          
          setAiSuggestion(suggestion);
          setCurrentStep(3);
          
          // Limpiar sugerencia después de 8 segundos
          setTimeout(() => {
            setAiSuggestion('');
          }, 8000);
          
        } catch (error) {
          console.error('Error en análisis IA:', error);
          setAiSuggestion('Error al analizar el archivo. Intenta de nuevo.');
          setCurrentStep(3);
          
          // Limpiar error después de 5 segundos
          setTimeout(() => {
            setAiSuggestion('');
          }, 5000);
        }
      }, 1500); // Reducir tiempo de espera
    };
    
    simulateAIAnalysis();
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

  const calculateCost = (file: File, format: string): number => {
    if (!file || !format) return 0;
    
    // Usar la función del contexto para calcular el costo
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const conversionType = `${fileExtension}-${format.toLowerCase()}`;
    
    return calculateConversionCost(conversionType, file.size, 'standard');
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) return;
    
    const cost = calculateCost(selectedFile, targetFormat);
    if (balance.current < cost) {
      alert('Créditos insuficientes');
      return;
    }

    setIsConverting(true);
    setCurrentStep(4);
    
    // Simular conversión
    setTimeout(() => {
      consumeCredits(cost, `${selectedFile.name} → ${targetFormat}`);
      setIsConverting(false);
      setCurrentStep(1);
      setSelectedFile(null);
      setTargetFormat('');
      setAiSuggestion('');
    }, 3000);
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
      {/* --- INTEGRACIÓN SUGERIDA --- */}
      {/* Indicador de estado del backend */}
      <div className="mt-4 text-sm font-medium">
        {/* Aquí la variable backendStatus viene del 'useState' que ya creamos */}
        <p className="text-slate-400">{backendStatus}</p>
      </div>


      </div>

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
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="pdf">PDF</option>
                  <option value="gif">GIF</option>
                </select>
                <div className="text-xs text-slate-400">
                  Costo: {selectedFile ? calculateCost(selectedFile, targetFormat) : 0} créditos
                </div>
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

