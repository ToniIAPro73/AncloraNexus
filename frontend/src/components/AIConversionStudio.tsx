import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, Brain, Zap, Eye, Download, Settings, 
  FileText, Image, Film, Music, Archive, 
  CheckCircle, AlertCircle, Loader2, Star,
  TrendingUp, Clock, Shield, Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';

interface AIAnalysis {
  file_type: string;
  content_type: string;
  complexity_level: string;
  quality_indicators: Record<string, number>;
  metadata_richness: number;
  security_level: string;
  ai_recommendations: string[];
  optimal_targets: string[];
}

interface SmartRecommendation {
  target_format: string;
  use_case: string;
  quality_prediction: number;
  speed_prediction: number;
  cost_efficiency: number;
  ai_reasoning: string;
  best_for: string[];
  avoid_if: string[];
}

interface ConversionPath {
  sequence_id: string;
  steps: string[];
  total_steps: number;
  estimated_time: number;
  quality_score: number;
  speed_score: number;
  cost_credits: number;
  ai_confidence: number;
  description: string;
  optimization_type: string;
  visual_path: string;
  benefits: string[];
  warnings: string[];
}

interface FilePreview {
  type: string;
  content: string;
  metadata: Record<string, any>;
  page_count?: number;
  dimensions?: [number, number];
  quality: string;
}

export const AIConversionStudio: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
  const [conversionPaths, setConversionPaths] = useState<ConversionPath[]>([]);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<ConversionPath | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'preview' | 'paths' | 'convert'>('analysis');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setAiAnalysis(null);
    setSmartRecommendations([]);
    setConversionPaths([]);
    setFilePreview(null);
    setConversionResult(null);
    setActiveTab('analysis');
    
    // Iniciar análisis automático
    await performAIAnalysis(selectedFile);
  }, []);

  const performAIAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/api/conversion/ai-analyze', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAiAnalysis(data.analysis);
        setSmartRecommendations(data.smart_recommendations);
        
        // Auto-seleccionar el mejor formato recomendado
        if (data.smart_recommendations.length > 0) {
          setSelectedFormat(data.smart_recommendations[0].target_format);
        }
      }
    } catch (error) {
      console.error('Error en análisis IA:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePreview = async () => {
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', 'high');
      
      const response = await fetch('http://localhost:8000/api/conversion/preview', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFilePreview(data.preview);
        setActiveTab('preview');
      }
    } catch (error) {
      console.error('Error generando preview:', error);
    }
  };

  const getConversionPaths = async () => {
    if (!file || !selectedFormat) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_format', selectedFormat);
      
      const response = await fetch('http://localhost:8000/api/conversion/ai-conversion-paths', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConversionPaths(data.conversion_paths);
        setActiveTab('paths');
      }
    } catch (error) {
      console.error('Error obteniendo rutas de conversión:', error);
    }
  };

  const performIntelligentConversion = async () => {
    if (!file || !selectedFormat) return;
    
    setIsConverting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_format', selectedFormat);
      
      if (selectedPath) {
        formData.append('sequence_id', selectedPath.sequence_id);
        formData.append('optimization', selectedPath.optimization_type);
      } else {
        formData.append('optimization', 'balanced');
      }
      
      const response = await fetch('http://localhost:8000/api/conversion/ai-convert-intelligent', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConversionResult(data);
        setActiveTab('convert');
      } else {
        console.error('Error en conversión:', data.error);
      }
    } catch (error) {
      console.error('Error en conversión inteligente:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    const icons = {
      'document': <FileText className="w-6 h-6 text-blue-500" />,
      'image': <Image className="w-6 h-6 text-green-500" />,
      'video': <Film className="w-6 h-6 text-purple-500" />,
      'audio': <Music className="w-6 h-6 text-orange-500" />,
      'archive': <Archive className="w-6 h-6 text-gray-500" />
    };
    return icons[fileType] || <FileText className="w-6 h-6 text-gray-400" />;
  };

  const getComplexityColor = (level: string) => {
    const colors = {
      'simple': 'text-green-600 bg-green-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'complex': 'text-red-600 bg-red-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const getSecurityIcon = (level: string) => {
    const icons = {
      'public': '🌐',
      'sensitive': '🔒',
      'confidential': '🛡️'
    };
    return icons[level] || '📄';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Conversion Studio
          </h1>
          <Sparkles className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Motor de conversión inteligente con IA • Análisis avanzado • Secuencias optimizadas
        </p>
      </div>

      {/* File Upload Area */}
      {!file && (
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Upload className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sube tu archivo para análisis IA
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nuestro motor inteligente analizará tu archivo y te recomendará las mejores opciones de conversión
              </p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Seleccionar Archivo
            </button>
          </div>
        </div>
      )}

      {/* File Selected - Analysis Interface */}
      {file && (
        <div className="space-y-6">
          {/* File Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {aiAnalysis && getFileTypeIcon(aiAnalysis.content_type)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Tipo desconocido'}
                  </p>
                </div>
              </div>
              
              {aiAnalysis && (
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getComplexityColor(aiAnalysis.complexity_level)}`}>
                    {aiAnalysis.complexity_level.toUpperCase()}
                  </div>
                  <div className="text-2xl">
                    {getSecurityIcon(aiAnalysis.security_level)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: 'analysis', label: 'Análisis IA', icon: Brain },
              { id: 'preview', label: 'Vista Previa', icon: Eye },
              { id: 'paths', label: 'Rutas Inteligentes', icon: TrendingUp },
              { id: 'convert', label: 'Convertir', icon: Zap }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            
            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="p-6 space-y-6">
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Analizando archivo con IA...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Esto puede tomar unos segundos
                    </p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-6">
                    {/* AI Analysis Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <Brain className="w-5 h-5 text-purple-500" />
                          <span>Análisis IA</span>
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Tipo de contenido:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {aiAnalysis.content_type}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Riqueza de metadatos:</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${aiAnalysis.metadata_richness * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {(aiAnalysis.metadata_richness * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          <span>Indicadores de Calidad</span>
                        </h4>
                        
                        <div className="space-y-2">
                          {Object.entries(aiAnalysis.quality_indicators).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace('_', ' ')}:
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full"
                                    style={{ width: `${value * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium w-8">
                                  {(value * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    {aiAnalysis.ai_recommendations.length > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Recomendaciones IA</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.ai_recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-purple-700 dark:text-purple-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Smart Format Recommendations */}
                    {smartRecommendations.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Formatos Recomendados por IA
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {smartRecommendations.slice(0, 4).map((rec, index) => (
                            <div 
                              key={rec.target_format}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedFormat === rec.target_format
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                              }`}
                              onClick={() => setSelectedFormat(rec.target_format)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-lg text-gray-900 dark:text-white">
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
                              
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="text-purple-600 dark:text-purple-400 font-medium">
                                    {rec.quality_prediction}%
                                  </div>
                                  <div className="text-gray-500">Calidad</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-blue-600 dark:text-blue-400 font-medium">
                                    {rec.speed_prediction}%
                                  </div>
                                  <div className="text-gray-500">Velocidad</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-green-600 dark:text-green-400 font-medium">
                                    {rec.cost_efficiency}%
                                  </div>
                                  <div className="text-gray-500">Eficiencia</div>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                                {rec.ai_reasoning}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={generatePreview}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver Preview</span>
                      </button>
                      
                      <button
                        onClick={getConversionPaths}
                        disabled={!selectedFormat}
                        className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Rutas Inteligentes</span>
                      </button>
                      
                      <button
                        onClick={performIntelligentConversion}
                        disabled={!selectedFormat || isConverting}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
                      >
                        {isConverting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        <span>{isConverting ? 'Convirtiendo...' : 'Convertir con IA'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Selecciona un archivo para comenzar el análisis IA
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="p-6">
                {filePreview ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <span>Vista Previa del Archivo</span>
                    </h4>
                    
                    {filePreview.type === 'image' && (
                      <div className="text-center">
                        <img 
                          src={`data:image/png;base64,${filePreview.content}`}
                          alt="Preview"
                          className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                    
                    {filePreview.type === 'text' && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto max-h-96">
                          {filePreview.content}
                        </pre>
                      </div>
                    )}
                    
                    {filePreview.type === 'thumbnail' && (
                      <div className="text-center">
                        <img 
                          src={`data:image/png;base64,${filePreview.content}`}
                          alt="Thumbnail"
                          className="max-w-xs mx-auto rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Metadatos</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(filePreview.metadata).map(([key, value]) => (
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
                ) : (
                  <div className="text-center py-8">
                    <button
                      onClick={generatePreview}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Generar Vista Previa
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Conversion Paths Tab */}
            {activeTab === 'paths' && (
              <div className="p-6">
                {conversionPaths.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      <span>Rutas de Conversión Inteligentes</span>
                    </h4>
                    
                    <div className="space-y-4">
                      {conversionPaths.map((path, index) => (
                        <div 
                          key={path.sequence_id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedPath?.sequence_id === path.sequence_id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                          onClick={() => setSelectedPath(path)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-gold-500' : index === 1 ? 'bg-silver-500' : 'bg-bronze-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  {path.description}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {path.visual_path}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {path.estimated_time.toFixed(1)}s
                              </span>
                            </div>
                          </div>
                          
                          {/* Scores */}
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {path.quality_score.toFixed(0)}%
                              </div>
                              <div className="text-xs text-gray-500">Calidad</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {path.speed_score.toFixed(0)}%
                              </div>
                              <div className="text-xs text-gray-500">Velocidad</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {(path.ai_confidence * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs text-gray-500">IA Confidence</div>
                            </div>
                          </div>
                          
                          {/* Benefits */}
                          {path.benefits.length > 0 && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-1">
                                {path.benefits.map((benefit, i) => (
                                  <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                    {benefit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Warnings */}
                          {path.warnings.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {path.warnings.map((warning, i) => (
                                <span key={i} className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                                  {warning}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <button
                      onClick={getConversionPaths}
                      disabled={!selectedFormat}
                      className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                    >
                      Generar Rutas Inteligentes
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Convert Tab */}
            {activeTab === 'convert' && (
              <div className="p-6">
                {conversionResult ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Conversión IA Completada!
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {conversionResult.sequence_description}
                      </p>
                    </div>
                    
                    {/* Results */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {conversionResult.quality_score.toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Calidad Final</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {conversionResult.processing_time.toFixed(1)}s
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {conversionResult.steps_completed}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Pasos IA</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {(conversionResult.ai_confidence * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Confianza IA</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Download */}
                    <div className="text-center">
                      <a
                        href={`http://localhost:8000/api${conversionResult.download_url}`}
                        download={conversionResult.output_filename}
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Download className="w-5 h-5" />
                        <span>Descargar Resultado IA</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Listo para conversión inteligente
                    </p>
                    <button
                      onClick={performIntelligentConversion}
                      disabled={!selectedFormat || isConverting}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
                    >
                      {isConverting ? 'Procesando con IA...' : 'Iniciar Conversión IA'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
