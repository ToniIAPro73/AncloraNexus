import React, { useState, useRef, useCallback } from 'react';
import { useCreditSystem } from './CreditSystem';

interface ConversionStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

const UniversalConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ✅ CORREGIDO: Usar getCredits() en lugar de credits
  const { consumeCredits, getCredits } = useCreditSystem();

  // Función para calcular el costo de conversión
  const calculateCost = useCallback((fromFormat: string, toFormat: string): number => {
    // Costos base por tipo de conversión
    const baseCosts: { [key: string]: number } = {
      'image': 1,
      'document': 2,
      'video': 5,
      'audio': 3,
      'archive': 2
    };

    const getFileCategory = (format: string): string => {
      const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
      const documentFormats = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
      const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
      const audioFormats = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
      const archiveFormats = ['zip', 'rar', '7z', 'tar', 'gz'];

      const fmt = format.toLowerCase();
      if (imageFormats.includes(fmt)) return 'image';
      if (documentFormats.includes(fmt)) return 'document';
      if (videoFormats.includes(fmt)) return 'video';
      if (audioFormats.includes(fmt)) return 'audio';
      if (archiveFormats.includes(fmt)) return 'archive';
      return 'document'; // default
    };

    const fromCategory = getFileCategory(fromFormat);
    const toCategory = getFileCategory(toFormat);

    // Costo base
    let cost = baseCosts[toCategory] || 2;

    // Costo adicional por conversión entre categorías diferentes
    if (fromCategory !== toCategory) {
      cost += 1;
    }

    return cost;
  }, []);

  const supportedFormats = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz']
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getAvailableFormats = (inputFormat: string): string[] => {
    for (const [, formats] of Object.entries(supportedFormats)) {
      if (formats.includes(inputFormat.toLowerCase())) {
        return formats.filter(format => format !== inputFormat.toLowerCase());
      }
    }
    return [];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTargetFormat('');
      setDownloadUrl('');
      setError('');
      setConversionSteps([]);
    }
  };

  const initializeSteps = (): ConversionStep[] => [
    { id: 'upload', name: 'Subiendo archivo', status: 'pending', progress: 0 },
    { id: 'analyze', name: 'Analizando IA', status: 'pending', progress: 0 },
    { id: 'convert', name: 'Convirtiendo', status: 'pending', progress: 0 },
    { id: 'optimize', name: 'Optimizando', status: 'pending', progress: 0 },
    { id: 'download', name: 'Preparando descarga', status: 'pending', progress: 0 }
  ];

  const updateStep = (stepId: string, status: ConversionStep['status'], progress: number = 0) => {
    setConversionSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, status, progress }
          : step
      )
    );
  };

  const simulateStep = async (stepId: string, duration: number = 2000): Promise<void> => {
    updateStep(stepId, 'processing', 0);
    
    // Simular progreso gradual
    const steps = 10;
    const stepDuration = duration / steps;
    
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      updateStep(stepId, 'processing', (i / steps) * 100);
    }
    
    updateStep(stepId, 'completed', 100);
  };

  const analyzeFile = async (file: File): Promise<string> => {
    // Simulación de análisis IA más realista
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fileSize = file.size;
    const fileType = file.type;
    
    let analysis = "Archivo analizado correctamente. ";
    
    if (fileSize > 10 * 1024 * 1024) { // > 10MB
      analysis += "Archivo grande detectado, se aplicará compresión optimizada. ";
    }
    
    if (fileType.startsWith('image/')) {
      analysis += "Imagen detectada, se preservará la calidad visual. ";
    } else if (fileType.startsWith('video/')) {
      analysis += "Video detectado, se optimizará para mejor compresión. ";
    } else if (fileType.includes('pdf')) {
      analysis += "Documento PDF detectado, se mantendrá la estructura. ";
    }
    
    analysis += "Conversión lista para proceder.";
    
    return analysis;
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) {
      setError('Por favor selecciona un archivo y formato de destino');
      return;
    }

    const inputFormat = getFileExtension(selectedFile.name);
    const cost = calculateCost(inputFormat, targetFormat);
    
    // ✅ CORREGIDO: Usar getCredits() en lugar de credits
    const currentCredits = getCredits();
    if (currentCredits < cost) {
      setError(`No tienes suficientes créditos. Necesitas ${cost} créditos para esta conversión. Tienes ${currentCredits} créditos disponibles.`);
      return;
    }

    setIsConverting(true);
    setError('');
    setDownloadUrl('');
    
    const steps = initializeSteps();
    setConversionSteps(steps);

    try {
      // Paso 1: Subir archivo
      await simulateStep('upload', 1000);

      // Paso 2: Analizar con IA
      updateStep('analyze', 'processing', 0);
      const analysisResult = await analyzeFile(selectedFile);
      console.log('Análisis IA:', analysisResult);
      updateStep('analyze', 'completed', 100);

      // Paso 3: Convertir
      await simulateStep('convert', 3000);

      // Paso 4: Optimizar
      await simulateStep('optimize', 1500);

      // Paso 5: Preparar descarga
      updateStep('download', 'processing', 0);
      
      // Simular creación del archivo convertido
      const convertedFileName = selectedFile.name.replace(
        `.${inputFormat}`, 
        `.${targetFormat}`
      );
      
      // Crear un blob simulado para la descarga
      const simulatedContent = `Archivo convertido: ${convertedFileName}\nFormato original: ${inputFormat}\nFormato destino: ${targetFormat}\nTamaño original: ${selectedFile.size} bytes\nFecha: ${new Date().toISOString()}\nAnálisis IA: ${analysisResult}`;
      const blob = new Blob([simulatedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      updateStep('download', 'completed', 100);

      // Consumir créditos
      consumeCredits(cost, `Conversión ${inputFormat.toUpperCase()} → ${targetFormat.toUpperCase()}`);

    } catch (error) {
      console.error('Error en conversión:', error);
      setError('Error durante la conversión. Por favor intenta de nuevo.');
      
      // Marcar el paso actual como error
      const currentStep = conversionSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStep(currentStep.id, 'error', 0);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && selectedFile) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = selectedFile.name.replace(
        `.${getFileExtension(selectedFile.name)}`, 
        `.${targetFormat}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL después de la descarga
      URL.revokeObjectURL(downloadUrl);
    }
  };

  const resetConverter = () => {
    setSelectedFile(null);
    setTargetFormat('');
    setIsConverting(false);
    setConversionSteps([]);
    setDownloadUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStepIcon = (status: ConversionStep['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'error': return '❌';
      default: return '⭕';
    }
  };

  const getStepColor = (status: ConversionStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🎯 Conversor Inteligente</h1>
        <p className="text-slate-300">Convierte archivos con inteligencia artificial avanzada</p>
        <p className="text-slate-400 text-sm mt-2">Créditos disponibles: {getCredits()}</p>
      </div>

      {/* File Upload */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Seleccionar archivo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
              disabled={isConverting}
            />
          </div>

          {selectedFile && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Archivo seleccionado:</h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p><span className="font-medium">Nombre:</span> {selectedFile.name}</p>
                <p><span className="font-medium">Tamaño:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><span className="font-medium">Tipo:</span> {selectedFile.type || 'Desconocido'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Format Selection */}
      {selectedFile && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Formato de destino
          </label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isConverting}
          >
            <option value="">Selecciona un formato</option>
            {getAvailableFormats(getFileExtension(selectedFile.name)).map(format => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>

          {targetFormat && (
            <div className="mt-3 text-sm text-slate-300">
              <span className="font-medium">Costo:</span> {calculateCost(getFileExtension(selectedFile.name), targetFormat)} créditos
            </div>
          )}
        </div>
      )}

      {/* Convert Button */}
      {selectedFile && targetFormat && (
        <div className="text-center">
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isConverting ? 'Convirtiendo...' : 'Iniciar Conversión'}
          </button>
        </div>
      )}

      {/* Conversion Steps */}
      {conversionSteps.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Progreso de conversión:</h3>
          <div className="space-y-3">
            {conversionSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3">
                <span className="text-xl">{getStepIcon(step.status)}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${getStepColor(step.status)}`}>
                    {step.name}
                  </div>
                  {step.status === 'processing' && (
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Download Section */}
      {downloadUrl && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center">
          <h3 className="text-green-300 font-medium mb-4">¡Conversión completada!</h3>
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              📥 Descargar archivo
            </button>
            <button
              onClick={resetConverter}
              className="block mx-auto text-slate-300 hover:text-white transition-colors"
            >
              Convertir otro archivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalConverter;

