// frontend/src/components/NewConversorInteligente.tsx
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, FileUpload, StepProgress, Progress } from './ui';
import {
  FileUp, FileBarChart, Settings, Download, ArrowRight, Check, Loader, Brain, Zap, Eye
} from 'lucide-react';
import AIContentAnalysis from './AIContentAnalysis';

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
      className={`
        transition-all duration-300 backdrop-blur-md shadow-xl
        bg-slate-800/90 border border-slate-700/50
        ${isActive ? 'transform scale-102 shadow-2xl' : ''}
      `}
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
  <Card
    variant="dark"
    className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
  >
    <div
      className="cursor-pointer hover:bg-slate-700/40 group transition-all duration-300"
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

interface AnalysisData {
  file_type: string;
  content_type: string;
  complexity_score: number;
  quality_score: number;
  size_mb: number;
  content_stats: {
    page_count: number;
    word_count: number;
    image_count: number;
    table_count: number;
    has_forms: boolean;
    has_hyperlinks: boolean;
    has_embedded_media: boolean;
    text_to_image_ratio: number;
  };
  recommendations: {
    formats: Array<{
      format: string;
      reason: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    optimizations: string[];
    quality_issues: string[];
  };
  metadata: Record<string, any>;
}

export const NewConversorInteligente: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  // Función para analizar archivo con IA
  const analyzeFile = useCallback(async (file: File) => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai-analysis/analyze-file', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisData(result.analysis);
        setShowAnalysis(true);

        // Auto-seleccionar el formato más recomendado
        if (result.analysis.recommendations.formats.length > 0) {
          const topRecommendation = result.analysis.recommendations.formats[0];
          setTargetFormat(topRecommendation.format);
        }

        setCurrentStep(3);
      } else {
        console.error('Error analyzing file:', response.statusText);
        setCurrentStep(3); // Continuar sin análisis
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      setCurrentStep(3); // Continuar sin análisis
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Simplified file handling using our FileUpload component
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setAnalysisData(null);
    setShowAnalysis(false);
    setCurrentStep(2);

    // Iniciar análisis IA automáticamente
    analyzeFile(file);
  }, [analyzeFile]);

  const handleConvert = useCallback(() => {
    if (!selectedFile || !targetFormat) return;
    setIsConverting(true);
    setCurrentStep(4);
    
    // Simular conversión
    setTimeout(() => {
      setIsConverting(false);
    }, 3000);
  }, [selectedFile, targetFormat]);

  // Import more icons if necessary from lucide-react package
  const popularConversions = [
    { from: 'PDF', to: 'JPG', fromIcon: <FileUp size={24} className="text-blue-400" />, toIcon: <FileBarChart size={24} className="text-green-400" />, cost: 2, popular: true },
    { from: 'JPG', to: 'PNG', fromIcon: <FileBarChart size={24} className="text-green-400" />, toIcon: <FileBarChart size={24} className="text-purple-400" />, cost: 1 },
    { from: 'MP4', to: 'GIF', fromIcon: <FileUp size={24} className="text-red-400" />, toIcon: <FileBarChart size={24} className="text-amber-400" />, cost: 5 },
    { from: 'PNG', to: 'SVG', fromIcon: <FileBarChart size={24} className="text-purple-400" />, toIcon: <Settings size={24} className="text-slate-400" />, cost: 3 },
    { from: 'DOC', to: 'PDF', fromIcon: <FileUp size={24} className="text-indigo-400" />, toIcon: <FileUp size={24} className="text-blue-400" />, cost: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-10">
      {/* Header principal */}
      <div className="text-center animate-in fade-in slide-in-from-top duration-700 space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-xl mb-4">
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
            labels={['Subir', 'Análisis IA', 'Configurar', 'Descargar']}
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
            <FileUpload 
              onFilesSelected={(files) => files[0] && handleFileSelect(files[0])}
              maxFiles={1}
              maxSizeMB={50}
              acceptedFormats={["TXT", "PDF", "DOC", "HTML", "MD"]}
              className="animate-in fade-in duration-500"
              dropzoneLabel="Arrastra tu archivo aquí o haz clic para seleccionar"
              supportedFormatsLabel="Formatos soportados"
            />
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
          icon={<Brain size={20} className="text-blue-400" />}
          isActive={currentStep === 2}
          isCompleted={currentStep > 2}
        >
          {currentStep === 2 ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-300 text-sm flex items-center justify-center gap-2">
                <Brain size={16} className="text-blue-400" />
                Analizando con IA...
              </p>
              <p className="text-xs text-gray-500 mt-1">Detectando contenido y generando recomendaciones</p>
            </div>
          ) : currentStep > 2 ? (
            <div className="text-sm space-y-2">
              <p className="text-gray-400 mb-2 flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                Análisis IA completado
              </p>
              {analysisData && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400">Tipo:</span>
                    <span className="text-white">{analysisData.content_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400">Complejidad:</span>
                    <span className="text-white">{analysisData.complexity_score.toFixed(0)}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400">Calidad:</span>
                    <span className="text-white">{analysisData.quality_score.toFixed(0)}/100</span>
                  </div>
                  {analysisData.recommendations.formats.length > 0 && (
                    <div className="text-xs">
                      <span className="text-blue-400">Recomendado:</span>
                      <span className="text-green-400 ml-1 font-medium">
                        {analysisData.recommendations.formats[0].format.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              <Eye size={20} className="mx-auto mb-2 text-gray-600" />
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
              {/* Recomendaciones IA */}
              {analysisData && analysisData.recommendations.formats.length > 0 && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm text-blue-400 mb-2">
                    <Zap size={14} />
                    Recomendaciones IA
                  </label>
                  <div className="space-y-2">
                    {analysisData.recommendations.formats.slice(0, 3).map((rec, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg border cursor-pointer transition-all ${
                          targetFormat === rec.format
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                        }`}
                        onClick={() => setTargetFormat(rec.format)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">
                            {rec.format.toUpperCase()}
                          </span>
                          <Badge
                            variant={rec.priority === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Formato de salida</label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-primary focus:outline-none"
                  disabled={currentStep > 3}
                >
                  <option value="">Seleccionar formato</option>
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="pdf">PDF</option>
                  <option value="gif">GIF</option>
                  <option value="webp">WEBP</option>
                  <option value="html">HTML</option>
                  <option value="txt">TXT</option>
                  <option value="md">Markdown</option>
                </select>
              </div>
              
              {targetFormat && currentStep === 3 && (
                <div>
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                    <span>Costo:</span>
                    <span className="text-primary font-medium">0 créditos</span>
                  </div>
                  <button
                    onClick={handleConvert}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors text-button font-medium"
                  >
                    Iniciar Conversión
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

        {/* Paso 4: Descargar */}
        <ConversionStep
          number={4}
          title="Descargar"
          icon="📥"
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
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-4">¡Conversión completada!</h3>
                <button className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-lg transition-colors text-button font-medium flex items-center justify-center gap-2 mx-auto">
                  <Download size={18} />
                  Descargar archivo
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  El archivo estará disponible durante 24 horas
                </p>
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              Esperando conversión...
            </div>
          )}
        </ConversionStep>
      </div>

      {/* Análisis IA Completo */}
      {showAnalysis && analysisData && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Brain className="text-blue-400" size={28} />
                Análisis IA Completo
              </h2>
              <p className="text-slate-400 text-sm">Insights detallados sobre tu archivo</p>
            </div>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {showAnalysis ? 'Ocultar' : 'Mostrar'} Análisis
            </button>
          </div>

          <AIContentAnalysis
            analysisData={analysisData}
            isLoading={isAnalyzing}
            onAnalyze={() => selectedFile && analyzeFile(selectedFile)}
            fileName={selectedFile?.name}
          />
        </div>
      )}

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