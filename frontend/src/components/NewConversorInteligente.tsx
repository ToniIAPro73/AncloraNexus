// frontend/src/components/NewConversorInteligente.tsx
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, StepProgress, Progress } from './ui';
import { FileUploader } from './FileUploader';
import { FormatSelector } from './ui/FormatSelector';
import { ConversionOptionsComparison } from './ui/ConversionOptionsComparison';
import {
  FileUp, FileBarChart, Settings, Download, ArrowRight, Check, Loader, X
} from 'lucide-react';

interface ConversionStepProps {
  number: number;
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}

const ConversionStep: React.FC<ConversionStepProps> = ({
  number,
  title,
  icon,
  isActive,
  isCompleted,
  children
}) => {
  const stepVariant = isActive ? 'elevated' : isCompleted ? 'default' : 'dark';
  const glowEffect = isActive || isCompleted;

  return (
    <Card 
      variant={stepVariant}
      className={`transition-all duration-300 ${isActive ? 'transform scale-102' : ''}`}
      borderGlow={glowEffect}
    >
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-base font-bold
            ${isCompleted 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20' 
              : isActive 
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20' 
                : 'bg-slate-800 text-slate-400 border border-slate-700/50'
            }
          `}>
            {isCompleted ? <Check size={18} /> : number}
          </div>
          
          <div className="ml-3">
            <CardTitle className="flex items-center">
              {title}
              {isActive && (
                <Badge variant="secondary" size="sm" className="ml-2 animate-pulse">
                  Activo
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="success" size="sm" className="ml-2">
                  Completado
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center mt-1">
              <span className="text-slate-400 mr-2 flex items-center">
                {icon}
              </span>
            </div>
          </div>
        </div>
        
        {/* Indicador de progreso */}
        <div className={`
          w-3 h-3 rounded-full transition-all
          ${isCompleted 
            ? 'bg-green-500' 
            : isActive 
              ? 'bg-primary animate-pulse' 
              : 'bg-slate-700'
          }
        `} />
      </CardHeader>

      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

interface PopularConversionProps {
  from: string;
  to: string;
  fromIcon: React.ReactNode;
  toIcon: React.ReactNode;
  cost: number;
  onClick: () => void;
  popular?: boolean;
}

const PopularConversion: React.FC<PopularConversionProps> = ({
  from,
  to,
  fromIcon,
  toIcon,
  cost,
  onClick,
  popular = false
}) => (
  <Card variant="dark">
    <div 
      className="cursor-pointer hover:bg-slate-800/60 group"
      onClick={onClick}
    >
    <CardContent className="p-4 flex flex-col items-center">
      <div className="flex items-center justify-center mb-3 relative">
        {popular && (
          <div className="absolute -top-1 -right-1">
            <Badge variant="primary" size="sm" className="bg-gradient-to-r from-yellow-500 to-amber-600">
              Popular
            </Badge>
          </div>
        )}
        <div className="h-14 flex items-center">
          <div className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-lg group-hover:bg-slate-600 transition-colors">
            {fromIcon}
          </div>
          <ArrowRight size={18} className="mx-2 text-slate-500 group-hover:text-primary transition-colors" />
          <div className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-lg group-hover:bg-slate-600 transition-colors">
            {toIcon}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <h4 className="text-base font-medium text-white">
          {from} <span className="text-slate-400">→</span> {to}
        </h4>
        <div className="flex items-center justify-center mt-2">
          <Badge variant="default" size="sm" className="bg-slate-700">
            {cost} créditos
          </Badge>
        </div>
      </div>
    </CardContent>
    </div>
  </Card>
);

export const NewConversorInteligente: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [conversionResult, setConversionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);
  const [conversionAnalysis, setConversionAnalysis] = useState<any>(null);
  const [selectedConversionOption, setSelectedConversionOption] = useState<'direct' | 'optimized' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Obtener formatos soportados basados en el archivo seleccionado
  const getAvailableFormats = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // Mapeo de formatos soportados por tipo de archivo
    const formatMap: Record<string, string[]> = {
      // Documentos
      'txt': ['pdf', 'docx', 'html', 'md', 'rtf'],
      'pdf': ['docx', 'txt', 'html', 'jpg', 'png'],
      'doc': ['pdf', 'docx', 'txt', 'html', 'md'],
      'docx': ['pdf', 'txt', 'html', 'md', 'rtf'],
      'rtf': ['pdf', 'docx', 'txt', 'html'],
      'odt': ['pdf', 'docx', 'txt', 'html'],
      'md': ['pdf', 'docx', 'html', 'txt'],
      'html': ['pdf', 'docx', 'txt', 'md'],

      // Datos
      'csv': ['html', 'pdf', 'json', 'txt'],
      'json': ['html', 'csv', 'txt'],

      // Libros electrónicos
      'epub': ['pdf', 'html', 'txt', 'md'],

      // Imágenes
      'jpg': ['png', 'gif', 'webp', 'pdf', 'bmp'],
      'jpeg': ['png', 'gif', 'webp', 'pdf', 'bmp'],
      'png': ['jpg', 'gif', 'webp', 'pdf', 'bmp'],
      'gif': ['jpg', 'png', 'webp', 'pdf'],
      'webp': ['jpg', 'png', 'gif', 'pdf'],
      'tiff': ['jpg', 'png', 'pdf'],
      'bmp': ['jpg', 'png', 'pdf']
    };

    return formatMap[extension] || ['pdf', 'txt', 'html'];
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setCurrentStep(2);
    setError(null);

    // Obtener formatos disponibles para este archivo
    const formats = getAvailableFormats(file);
    setAvailableFormats(formats);

    // Simular análisis (2 segundos)
    setTimeout(() => {
      setCurrentStep(3);
      // Auto-seleccionar primer formato disponible
      if (formats.length > 0) {
        setTargetFormat(formats[0]);
      }
    }, 2000);
  }, [getAvailableFormats]);

  const handleConvert = useCallback(async () => {
    if (!selectedFile || !targetFormat || !selectedConversionOption) return;

    setIsConverting(true);
    setCurrentStep(4);
    setError(null);

    try {
      // Conversión real usando la API
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('target_format', targetFormat);

      // Agregar información sobre la opción de conversión seleccionada
      if (conversionAnalysis && selectedConversionOption) {
        const selectedOption = conversionAnalysis[selectedConversionOption];
        if (selectedOption && selectedOption.steps) {
          formData.append('conversion_sequence', JSON.stringify(selectedOption.steps));
          formData.append('conversion_type', selectedConversionOption);
        }
      }

      const response = await fetch('http://localhost:8000/api/conversion/guest-convert', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setConversionResult(result);
        setCurrentStep(5); // Paso de descarga
      } else {
        setError(result.error || 'Error en la conversión');
        setCurrentStep(3); // Volver a configuración
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setCurrentStep(3);
    } finally {
      setIsConverting(false);
    }
  }, [selectedFile, targetFormat]);

  // Función para obtener descripción del formato
  const getFormatDescription = (format: string): string => {
    const descriptions: Record<string, string> = {
      'pdf': 'Documento Portátil',
      'docx': 'Microsoft Word',
      'txt': 'Texto Plano',
      'html': 'Página Web',
      'md': 'Markdown',
      'rtf': 'Texto Enriquecido',
      'csv': 'Datos Tabulares',
      'json': 'Datos JSON',
      'epub': 'Libro Electrónico',
      'odt': 'OpenDocument',
      'jpg': 'Imagen JPEG',
      'png': 'Imagen PNG',
      'gif': 'Imagen GIF',
      'webp': 'Imagen WebP',
      'bmp': 'Imagen Bitmap'
    };
    return descriptions[format] || 'Formato';
  };

  // Función para analizar opciones de conversión
  const analyzeConversionOptions = useCallback(async (sourceFormat: string, targetFormat: string) => {
    if (!sourceFormat || !targetFormat) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:8000/api/conversion/analyze-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_format: sourceFormat,
          target_format: targetFormat
        })
      });

      const result = await response.json();

      if (result.success) {
        setConversionAnalysis(result.analysis);
        // Auto-seleccionar opción recomendada
        setSelectedConversionOption(result.analysis.recommendation.type);
      } else {
        setError(result.error || 'Error analizando opciones de conversión');
      }
    } catch (err) {
      setError('Error de conexión al analizar opciones');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Manejar selección de formato con análisis automático
  const handleFormatSelection = useCallback(async (format: string) => {
    setTargetFormat(format);
    setConversionAnalysis(null);
    setSelectedConversionOption(null);

    if (selectedFile) {
      const sourceFormat = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      await analyzeConversionOptions(sourceFormat, format);
    }
  }, [selectedFile, analyzeConversionOptions]);

  // Import more icons if necessary from lucide-react package
  const popularConversions = [
    { from: 'PDF', to: 'JPG', fromIcon: <FileUp size={24} className="text-blue-400" />, toIcon: <FileBarChart size={24} className="text-green-400" />, cost: 2, popular: true },
    { from: 'JPG', to: 'PNG', fromIcon: <FileBarChart size={24} className="text-green-400" />, toIcon: <FileBarChart size={24} className="text-purple-400" />, cost: 1 },
    { from: 'MP4', to: 'GIF', fromIcon: <FileUp size={24} className="text-red-400" />, toIcon: <FileBarChart size={24} className="text-amber-400" />, cost: 5 },
    { from: 'PNG', to: 'SVG', fromIcon: <FileBarChart size={24} className="text-purple-400" />, toIcon: <Settings size={24} className="text-slate-400" />, cost: 3 },
    { from: 'DOC', to: 'PDF', fromIcon: <FileUp size={24} className="text-indigo-400" />, toIcon: <FileUp size={24} className="text-blue-400" />, cost: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header principal */}
      <div className="text-center animate-in fade-in slide-in-from-top duration-700 space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-xl shadow-primary/20">
            <Settings size={28} className="text-white animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Conversor <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary">Inteligente</span>
        </h1>
        
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Convierte cualquier archivo a múltiples formatos con nuestra tecnología de inteligencia artificial avanzada
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <Badge variant="default" className="bg-slate-800/50 border border-slate-600 backdrop-blur-sm">
            IA avanzada
          </Badge>
          <Badge variant="default" className="bg-slate-800/50 border border-slate-600 backdrop-blur-sm">
            Conversión rápida
          </Badge>
          <Badge variant="default" className="bg-slate-800/50 border border-slate-600 backdrop-blur-sm">
            +200 formatos
          </Badge>
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-xl">
          <StepProgress 
            steps={4} 
            currentStep={currentStep} 
            labels={['Subir', 'Configurar', 'Procesar', 'Descargar']}
            className="animate-in fade-in duration-500"
          />
        </div>
      </div>

      {/* Tarjetas de proceso */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Paso 1: Subir Archivo */}
        <ConversionStep
          number={1}
          title="Subir Archivo"
          icon="📂"
          isActive={currentStep === 1}
          isCompleted={currentStep > 1}
        >
          {currentStep === 1 ? (
            <FileUploader
              onFileSelect={(file) => handleFileSelect(file as File)}
              acceptedFiles=".txt,.pdf,.doc,.docx,.html,.md,.csv,.json,.epub,.rtf,.odt,.jpg,.jpeg,.png,.gif,.webp,.tiff,.bmp"
              multiple={false}
              isLoading={false}
            >
              <div className="p-8 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileUp size={32} className="text-primary" />
                </div>
                <p className="text-lg font-medium text-white mb-2">
                  Arrastra tu archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-slate-400">
                  Formatos soportados: TXT, PDF, DOC, DOCX, HTML, MD, CSV, JSON, EPUB, RTF, ODT, JPG, PNG, GIF, WEBP, TIFF, BMP
                </p>
              </div>
            </FileUploader>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-3 bg-slate-800/40 p-3 rounded-lg">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileUp size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{selectedFile?.name}</p>
                  <p className="text-xs text-slate-400">
                    {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-400 flex items-center">
                <Check size={14} className="text-green-500 mr-1" />
                Archivo listo para procesamiento
              </div>
            </div>
          )}
        </ConversionStep>

        {/* Paso 2: Análisis IA */}
        <ConversionStep
          number={2}
          title="Análisis IA"
          icon="🤖"
          isActive={currentStep === 2}
          isCompleted={currentStep > 2}
        >
          {currentStep === 2 ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-300 text-sm">Analizando archivo...</p>
              <p className="text-xs text-gray-500 mt-1">Esto puede tomar unos segundos</p>
            </div>
          ) : currentStep > 2 ? (
            <div className="text-sm">
              <p className="text-gray-400 mb-2">Análisis completado</p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center text-green-400 text-xs">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Archivo analizado correctamente
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              Esperando archivo...
            </div>
          )}
        </ConversionStep>

        {/* Paso 3: Configurar */}
        <ConversionStep
          number={3}
          title="Configurar"
          icon="⚙️"
          isActive={currentStep === 3}
          isCompleted={currentStep > 3}
        >
          {currentStep >= 3 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-4">Seleccionar formato de salida</label>
                <FormatSelector
                  availableFormats={availableFormats}
                  selectedFormat={targetFormat}
                  onFormatSelect={handleFormatSelection}
                  sourceFormat={selectedFile.name.split('.').pop()?.toLowerCase() || ''}
                />
              </div>

              {/* Análisis de opciones de conversión */}
              {isAnalyzing && (
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span className="text-slate-300">Analizando opciones de conversión...</span>
                  </div>
                </div>
              )}

              {conversionAnalysis && !isAnalyzing && targetFormat && (
                <div>
                  <ConversionOptionsComparison
                    analysis={conversionAnalysis}
                    onOptionSelect={setSelectedConversionOption}
                    selectedOption={selectedConversionOption}
                    onPreview={(option) => {
                      // TODO: Implementar preview
                      console.log('Preview:', option);
                    }}
                  />
                </div>
              )}
              
              {targetFormat && selectedConversionOption && currentStep === 3 && (
                <div>
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                    <span>Costo:</span>
                    <span className="text-primary font-medium">
                      {conversionAnalysis?.[selectedConversionOption]?.cost || 0} créditos
                    </span>
                  </div>
                  <button
                    onClick={handleConvert}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors text-button font-medium"
                  >
                    Iniciar Conversión {selectedConversionOption === 'optimized' ? 'Optimizada' : 'Directa'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              Esperando análisis...
            </div>
          )}
        </ConversionStep>

        {/* Paso 4: Convertir */}
        <ConversionStep
          number={4}
          title="Convertir"
          icon="🔄"
          isActive={currentStep === 4}
          isCompleted={currentStep > 4}
        >
          {currentStep === 4 ? (
            isConverting ? (
              <div className="text-center py-4">
                <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                  <div className="bg-primary h-2 rounded-full animate-progress"></div>
                </div>
                <p className="text-gray-300 text-sm">Convirtiendo archivo...</p>
                <p className="text-xs text-gray-500 mt-1">Esto puede tomar unos segundos</p>
              </div>
            ) : error ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <X size={32} className="text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Error en conversión</h3>
                <p className="text-sm text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setCurrentStep(3);
                  }}
                  className="bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Intentar nuevamente
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-300 text-sm mb-4">Listo para convertir</p>
                <button
                  onClick={handleConvert}
                  disabled={!targetFormat}
                  className="bg-primary hover:bg-primary-dark disabled:bg-gray-600 text-white py-2 px-6 rounded-lg transition-colors text-sm font-medium"
                >
                  Iniciar Conversión
                </button>
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              Esperando configuración...
            </div>
          )}
        </ConversionStep>

        {/* Paso 5: Descargar */}
        <ConversionStep
          number={5}
          title="Descargar"
          icon="📥"
          isActive={currentStep === 5}
          isCompleted={false}
        >
          {currentStep === 5 && conversionResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-4">¡Conversión completada!</h3>
              <a
                href={`http://localhost:8000/api/conversion/guest-download/${conversionResult.download_id}`}
                download={conversionResult.output_filename}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition-colors text-button font-medium flex items-center justify-center gap-2 mx-auto"
              >
                <Download size={18} />
                Descargar {conversionResult.output_filename}
              </a>
              <p className="text-xs text-gray-500 mt-2">
                El archivo estará disponible durante 24 horas
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              Esperando conversión...
            </div>
          )}
        </ConversionStep>
      </div>

      {/* Conversiones populares */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Conversiones Populares</h2>
            <p className="text-slate-400 text-sm">Las transformaciones más utilizadas por nuestros usuarios</p>
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className="border-slate-700">
              <span className="text-slate-400 text-sm">Actualizado hace 2 días</span>
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {popularConversions.map((conversion, index) => (
            <PopularConversion
              key={index}
              {...conversion}
              onClick={() => {
                // Lógica para iniciar conversión popular
                console.log(`Iniciando conversión ${conversion.from} → ${conversion.to}`);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};