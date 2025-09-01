import React, { useState, useCallback, useRef } from 'react';
import { 
  Brain, Zap, Eye, Download, Upload, Settings,
  FileText, Image, CheckCircle, AlertCircle, Loader2,
  Star, TrendingUp, Clock, Shield, Sparkles, Package
} from 'lucide-react';
import { AIConversionService } from '../services/AIConversionService';
import type { AIAnalysis, SmartRecommendation, ConversionPath, FilePreview, AIConversionResult } from '../services/AIConversionService';

interface ConversionState {
  file: File | null;
  analysis: AIAnalysis | null;
  recommendations: SmartRecommendation[];
  paths: ConversionPath[];
  preview: FilePreview | null;
  selectedFormat: string;
  selectedPath: ConversionPath | null;
  result: AIConversionResult | null;
  isAnalyzing: boolean;
  isConverting: boolean;
  currentStep: 'upload' | 'analysis' | 'preview' | 'paths' | 'convert' | 'complete';
}

export const IntelligentConversionHub: React.FC = () => {
  const [state, setState] = useState<ConversionState>({
    file: null,
    analysis: null,
    recommendations: [],
    paths: [],
    preview: null,
    selectedFormat: '',
    selectedPath: null,
    result: null,
    isAnalyzing: false,
    isConverting: false,
    currentStep: 'upload'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      file,
      currentStep: 'analysis',
      isAnalyzing: true,
      analysis: null,
      recommendations: [],
      paths: [],
      preview: null,
      result: null
    }));

    try {
      // Análisis IA automático
      const { analysis, smart_recommendations } = await AIConversionService.analyzeFileWithAI(file);
      
      setState(prev => ({
        ...prev,
        analysis,
        recommendations: smart_recommendations,
        selectedFormat: smart_recommendations[0]?.target_format || '',
        isAnalyzing: false
      }));
    } catch (error) {
      console.error('Error en análisis IA:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, []);

  const generatePreview = useCallback(async () => {
    if (!state.file) return;

    try {
      const { preview } = await AIConversionService.generateFilePreview(state.file, 'high');
      setState(prev => ({ ...prev, preview, currentStep: 'preview' }));
    } catch (error) {
      console.error('Error generando preview:', error);
    }
  }, [state.file]);

  const getConversionPaths = useCallback(async () => {
    if (!state.file || !state.selectedFormat) return;

    try {
      const pathsData = await AIConversionService.getIntelligentConversionPaths(
        state.file, 
        state.selectedFormat
      );
      
      setState(prev => ({ 
        ...prev, 
        paths: pathsData.conversion_paths,
        selectedPath: pathsData.conversion_paths[0] || null,
        currentStep: 'paths'
      }));
    } catch (error) {
      console.error('Error obteniendo rutas:', error);
    }
  }, [state.file, state.selectedFormat]);

  const performConversion = useCallback(async () => {
    if (!state.file || !state.selectedFormat) return;

    setState(prev => ({ ...prev, isConverting: true, currentStep: 'convert' }));

    try {
      const result = await AIConversionService.convertWithAI(
        state.file,
        state.selectedFormat,
        {
          sequenceId: state.selectedPath?.sequence_id,
          optimization: 'balanced'
        }
      );

      setState(prev => ({ 
        ...prev, 
        result, 
        isConverting: false, 
        currentStep: 'complete' 
      }));
    } catch (error) {
      console.error('Error en conversión:', error);
      setState(prev => ({ ...prev, isConverting: false }));
    }
  }, [state.file, state.selectedFormat, state.selectedPath]);

  const resetConversion = useCallback(() => {
    setState({
      file: null,
      analysis: null,
      recommendations: [],
      paths: [],
      preview: null,
      selectedFormat: '',
      selectedPath: null,
      result: null,
      isAnalyzing: false,
      isConverting: false,
      currentStep: 'upload'
    });
  }, []);

  const getStepStatus = (step: string) => {
    const currentIndex = ['upload', 'analysis', 'preview', 'paths', 'convert', 'complete'].indexOf(state.currentStep);
    const stepIndex = ['upload', 'analysis', 'preview', 'paths', 'convert', 'complete'].indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Motor de Conversión Inteligente
          </h1>
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Conversión con IA • Análisis Avanzado • Secuencias Optimizadas • Vista Previa • Descarga por Lotes
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 py-6">
        {[
          { id: 'upload', label: 'Subir', icon: Upload },
          { id: 'analysis', label: 'Análisis IA', icon: Brain },
          { id: 'preview', label: 'Preview', icon: Eye },
          { id: 'paths', label: 'Rutas IA', icon: TrendingUp },
          { id: 'convert', label: 'Convertir', icon: Zap },
          { id: 'complete', label: 'Completado', icon: CheckCircle }
        ].map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  status === 'current' ? 'bg-purple-500 border-purple-500 text-white animate-pulse' :
                  'bg-gray-100 border-gray-300 text-gray-400'}
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                status === 'completed' ? 'text-green-600' :
                status === 'current' ? 'text-purple-600' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < 5 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel - File Upload & Analysis */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* File Upload */}
          {!state.file ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              
              <div 
                className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Subir Archivo para Análisis IA
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Haz clic o arrastra tu archivo aquí
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Archivo Seleccionado
                </h3>
                <button
                  onClick={resetConversion}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                {state.analysis && (
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {state.file.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(state.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Analysis Status */}
              {state.isAnalyzing ? (
                <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="text-purple-700 dark:text-purple-300">
                    Analizando con IA...
                  </span>
                </div>
              ) : state.analysis ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Análisis IA Completado
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                        <span className="ml-1 font-medium capitalize">{state.analysis.content_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Complejidad:</span>
                        <span className="ml-1 font-medium capitalize">{state.analysis.complexity_level}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Seguridad:</span>
                        <span className="ml-1 font-medium capitalize">{state.analysis.security_level}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Metadatos:</span>
                        <span className="ml-1 font-medium">{(state.analysis.metadata_richness * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  {state.analysis.ai_recommendations.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Recomendaciones IA</span>
                      </h5>
                      <ul className="space-y-1">
                        {state.analysis.ai_recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="text-xs text-blue-700 dark:text-blue-300 flex items-start space-x-1">
                            <Star className="w-2 h-2 mt-1 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Action Buttons */}
          {state.file && !state.isAnalyzing && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Acciones Inteligentes
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={generatePreview}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Vista Previa</span>
                </button>
                
                <button
                  onClick={getConversionPaths}
                  disabled={!state.selectedFormat}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Rutas IA</span>
                </button>
                
                <button
                  onClick={performConversion}
                  disabled={!state.selectedFormat || state.isConverting}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
                >
                  {state.isConverting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>{state.isConverting ? 'Convirtiendo...' : 'Convertir con IA'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Smart Recommendations */}
          {state.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Brain className="w-6 h-6 text-purple-500" />
                <span>Recomendaciones Inteligentes</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.recommendations.slice(0, 4).map((rec) => (
                  <div 
                    key={rec.target_format}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      state.selectedFormat === rec.target_format
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                    onClick={() => setState(prev => ({ ...prev, selectedFormat: rec.target_format }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        {rec.target_format.toUpperCase()}
                      </span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-3 h-3 ${
                              i < (rec.quality_prediction / 20) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rec.use_case}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center">
                        <div className="text-purple-600 dark:text-purple-400 font-bold">
                          {rec.quality_prediction}%
                        </div>
                        <div className="text-gray-500">Calidad</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-600 dark:text-blue-400 font-bold">
                          {rec.speed_prediction}%
                        </div>
                        <div className="text-gray-500">Velocidad</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-600 dark:text-green-400 font-bold">
                          {rec.cost_efficiency}%
                        </div>
                        <div className="text-gray-500">Eficiencia</div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {rec.ai_reasoning}
                    </p>
                    
                    {/* Best For Tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {rec.best_for.slice(0, 2).map((use, i) => (
                        <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          ✓ {use}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Preview */}
          {state.preview && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Eye className="w-6 h-6 text-blue-500" />
                <span>Vista Previa del Archivo</span>
              </h3>
              
              {state.preview.type === 'image' || state.preview.type === 'thumbnail' ? (
                <div className="text-center">
                  <img 
                    src={`data:image/png;base64,${state.preview.content}`}
                    alt="Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {state.preview.content}
                  </pre>
                </div>
              )}
              
              {/* Preview Metadata */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Información</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(state.preview.metadata).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversion Paths */}
          {state.paths.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <span>Rutas de Conversión IA</span>
              </h3>
              
              <div className="space-y-3">
                {state.paths.map((path, index) => (
                  <div 
                    key={path.sequence_id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      state.selectedPath?.sequence_id === path.sequence_id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                    onClick={() => setState(prev => ({ ...prev, selectedPath: path }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {path.visual_path}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {path.estimated_time.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {path.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          {path.quality_score.toFixed(0)}%
                        </div>
                        <div className="text-gray-500">Calidad</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                          {path.speed_score.toFixed(0)}%
                        </div>
                        <div className="text-gray-500">Velocidad</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {(path.ai_confidence * 100).toFixed(0)}%
                        </div>
                        <div className="text-gray-500">IA</div>
                      </div>
                    </div>
                    
                    {/* Benefits */}
                    {path.benefits.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {path.benefits.slice(0, 2).map((benefit, i) => (
                          <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversion Result */}
      {state.result && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 border border-green-200 dark:border-green-800">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <h2 className="text-3xl font-bold text-green-800 dark:text-green-200">
                ¡Conversión IA Exitosa!
              </h2>
              <Sparkles className="w-12 h-12 text-yellow-500" />
            </div>
            
            <p className="text-lg text-green-700 dark:text-green-300">
              {state.result.sequence_description}
            </p>
            
            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {state.result.quality_score.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Calidad Final</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {state.result.processing_time.toFixed(1)}s
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {state.result.steps_completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pasos IA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {(state.result.ai_confidence * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Confianza IA</div>
              </div>
            </div>
            
            {/* Download Button */}
            <a
              href={`http://localhost:8000/api${state.result.download_url}`}
              download={state.result.output_filename}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Download className="w-6 h-6" />
              <span>Descargar Resultado IA</span>
              <Package className="w-6 h-6" />
            </a>
            
            {/* Conversion Logs */}
            {state.result.conversion_logs.length > 0 && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200">
                  Ver logs de conversión IA ({state.result.conversion_logs.length} pasos)
                </summary>
                <div className="mt-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ul className="space-y-1 text-xs text-green-800 dark:text-green-200">
                    {state.result.conversion_logs.map((log, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 dark:text-green-400">•</span>
                        <span>{log}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          🤖 Powered by Anclora Nexus AI Engine • 
          🚀 Conversión Inteligente • 
          🔒 Seguro y Privado • 
          ⚡ Optimizado para Velocidad y Calidad
        </p>
      </div>
    </div>
  );
};
