import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui';
import { Button, Badge } from './ui';
import { 
  FileCheck, FileWarning, Settings, Download, 
  Sliders, Gauge, Info, Save, HelpCircle, ChevronRight, ChevronDown
} from 'lucide-react';

interface OptimizationFeature {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
  impact: 'high' | 'medium' | 'low';
  before?: number; // Size in bytes before optimization
  after?: number; // Estimated size in bytes after optimization
  isPremium?: boolean;
  active: boolean;
}

interface OptimizationSetting {
  id: string;
  name: string;
  description: string;
  type: 'slider' | 'toggle' | 'select';
  value: any;
  options?: Array<{value: string; label: string}>;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  isPremium?: boolean;
  disabled?: boolean;
}

interface ConversionOptimizationProps {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  onApplyOptimizations?: (settings: any) => void;
  onDownload?: () => void;
  className?: string;
  isPremiumUser?: boolean;
  onOptimize?: (fileId: string, options: any) => void;
}

export const ConversionOptimization: React.FC<ConversionOptimizationProps> = ({
  fileName = 'document.pdf',
  fileSize = 2500000, // 2.5MB default
  fileType = 'pdf',
  onApplyOptimizations,
  onDownload,
  className = '',
  isPremiumUser = false
}) => {
  const [optimizationFeatures, setOptimizationFeatures] = useState<OptimizationFeature[]>([]);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSetting[]>([]);
  const [estimatedSavings, setEstimatedSavings] = useState<number>(0);
  const [optimizationScore, setOptimizationScore] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate file analysis
    analyzeFile();
  }, [fileType, fileSize]);

  const analyzeFile = () => {
    setIsAnalyzing(true);
    setIsOptimized(false);
    
    // Simulate analysis delay
    setTimeout(() => {
      // Generate optimization features based on file type
      const features: OptimizationFeature[] = getOptimizationFeatures();
      setOptimizationFeatures(features);
      
      // Generate optimization settings based on file type
      const settings: OptimizationSetting[] = getOptimizationSettings();
      setOptimizationSettings(settings);
      
      // Calculate estimated savings based on active optimizations
      calculateEstimatedSavings(features);
      
      // Calculate optimization score (0-100)
      setOptimizationScore(Math.floor(Math.random() * 30) + 40);
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const getOptimizationFeatures = (): OptimizationFeature[] => {
    const features: OptimizationFeature[] = [];
    
    switch (fileType) {
      case 'pdf':
        features.push({
          id: 'compress-images',
          name: 'Compresión de imágenes',
          description: 'Reduce el tamaño de las imágenes en el PDF sin afectar significativamente la calidad visual.',
          recommended: true,
          impact: 'high',
          before: Math.floor(fileSize * 0.6),
          after: Math.floor(fileSize * 0.6 * 0.4),
          active: true
        });
        features.push({
          id: 'optimize-text',
          name: 'Optimización de texto',
          description: 'Comprime la información de texto y fuentes para reducir el tamaño del archivo.',
          recommended: true,
          impact: 'medium',
          before: Math.floor(fileSize * 0.3),
          after: Math.floor(fileSize * 0.3 * 0.7),
          active: true
        });
        features.push({
          id: 'remove-metadata',
          name: 'Eliminar metadatos',
          description: 'Elimina información de metadatos innecesaria como autor, creador, etc.',
          recommended: false,
          impact: 'low',
          before: Math.floor(fileSize * 0.05),
          after: 0,
          active: false
        });
        features.push({
          id: 'advanced-compression',
          name: 'Compresión avanzada',
          description: 'Algoritmos avanzados de compresión para máxima reducción de tamaño con mínima pérdida de calidad.',
          recommended: true,
          impact: 'high',
          before: fileSize,
          after: Math.floor(fileSize * 0.6),
          isPremium: true,
          active: isPremiumUser
        });
        break;
        
      case 'jpg':
      case 'jpeg':
      case 'png':
        features.push({
          id: 'resize-image',
          name: 'Redimensionar imagen',
          description: 'Reduce las dimensiones de la imagen para disminuir su tamaño.',
          recommended: fileSize > 1000000,
          impact: 'high',
          before: fileSize,
          after: Math.floor(fileSize * 0.5),
          active: fileSize > 1000000
        });
        features.push({
          id: 'compress-quality',
          name: 'Ajustar calidad',
          description: 'Reduce la calidad de la imagen para disminuir su tamaño sin afectar demasiado la apariencia visual.',
          recommended: true,
          impact: 'high',
          before: fileSize,
          after: Math.floor(fileSize * 0.6),
          active: true
        });
        features.push({
          id: 'strip-metadata',
          name: 'Eliminar metadatos',
          description: 'Elimina metadatos EXIF y otra información no visible de la imagen.',
          recommended: false,
          impact: 'low',
          before: Math.floor(fileSize * 0.02),
          after: 0,
          active: false
        });
        features.push({
          id: 'smart-compression',
          name: 'Compresión inteligente',
          description: 'Utiliza IA para identificar áreas de la imagen donde se puede aplicar mayor compresión sin afectar detalles importantes.',
          recommended: true,
          impact: 'high',
          before: fileSize,
          after: Math.floor(fileSize * 0.4),
          isPremium: true,
          active: isPremiumUser
        });
        break;
        
      case 'docx':
      case 'doc':
        features.push({
          id: 'compress-images',
          name: 'Comprimir imágenes incrustadas',
          description: 'Reduce el tamaño de las imágenes incluidas en el documento.',
          recommended: true,
          impact: 'high',
          before: Math.floor(fileSize * 0.7),
          after: Math.floor(fileSize * 0.7 * 0.5),
          active: true
        });
        features.push({
          id: 'remove-metadata',
          name: 'Eliminar metadatos',
          description: 'Elimina información de autor, comentarios y revisiones.',
          recommended: false,
          impact: 'low',
          before: Math.floor(fileSize * 0.05),
          after: 0,
          active: false
        });
        features.push({
          id: 'optimize-macros',
          name: 'Eliminar macros',
          description: 'Elimina macros que pueden aumentar el tamaño del archivo y representar riesgos de seguridad.',
          recommended: true,
          impact: 'medium',
          before: Math.floor(fileSize * 0.1),
          after: 0,
          active: true
        });
        features.push({
          id: 'advanced-docx',
          name: 'Optimización avanzada',
          description: 'Algoritmos avanzados para optimizar la estructura interna del documento y reducir significativamente su tamaño.',
          recommended: true,
          impact: 'high',
          before: fileSize,
          after: Math.floor(fileSize * 0.6),
          isPremium: true,
          active: isPremiumUser
        });
        break;
        
      default:
        features.push({
          id: 'general-compression',
          name: 'Compresión general',
          description: 'Aplica algoritmos de compresión estándar para reducir el tamaño del archivo.',
          recommended: true,
          impact: 'medium',
          before: fileSize,
          after: Math.floor(fileSize * 0.8),
          active: true
        });
        features.push({
          id: 'remove-metadata',
          name: 'Eliminar metadatos',
          description: 'Elimina información de metadatos innecesaria.',
          recommended: false,
          impact: 'low',
          before: Math.floor(fileSize * 0.03),
          after: 0,
          active: false
        });
    }
    
    return features;
  };

  const getOptimizationSettings = (): OptimizationSetting[] => {
    const settings: OptimizationSetting[] = [];
    
    // Common settings for all file types
    settings.push({
      id: 'general-quality',
      name: 'Calidad general',
      description: 'Ajusta el equilibrio entre calidad y tamaño de archivo',
      type: 'slider',
      value: 80,
      min: 0,
      max: 100,
      step: 1,
      unit: '%'
    });
    
    // File type specific settings
    switch (fileType) {
      case 'pdf':
        settings.push({
          id: 'image-quality',
          name: 'Calidad de imágenes',
          description: 'Nivel de compresión aplicado a las imágenes en el PDF',
          type: 'slider',
          value: 75,
          min: 0,
          max: 100,
          step: 1,
          unit: '%'
        });
        settings.push({
          id: 'text-compression',
          name: 'Compresión de texto',
          description: 'Nivel de compresión aplicado al texto',
          type: 'select',
          value: 'medium',
          options: [
            { value: 'low', label: 'Baja' },
            { value: 'medium', label: 'Media' },
            { value: 'high', label: 'Alta' }
          ]
        });
        settings.push({
          id: 'remove-bookmarks',
          name: 'Eliminar marcadores',
          description: 'Elimina marcadores y enlaces internos',
          type: 'toggle',
          value: false
        });
        settings.push({
          id: 'ai-optimize',
          name: 'Optimización con IA',
          description: 'Utiliza inteligencia artificial para optimizar el archivo',
          type: 'toggle',
          value: isPremiumUser,
          isPremium: true,
          disabled: !isPremiumUser
        });
        break;
        
      case 'jpg':
      case 'jpeg':
      case 'png':
        settings.push({
          id: 'compression-quality',
          name: 'Nivel de compresión',
          description: 'Balance entre calidad de imagen y tamaño de archivo',
          type: 'slider',
          value: 80,
          min: 0,
          max: 100,
          step: 1,
          unit: '%'
        });
        settings.push({
          id: 'resize-dimensions',
          name: 'Redimensionar',
          description: 'Redimensiona la imagen a un tamaño específico',
          type: 'select',
          value: 'original',
          options: [
            { value: 'original', label: 'Tamaño original' },
            { value: '1920', label: 'HD (1920px)' },
            { value: '1280', label: 'Medium (1280px)' },
            { value: '800', label: 'Small (800px)' }
          ]
        });
        settings.push({
          id: 'preserve-metadata',
          name: 'Conservar metadatos',
          description: 'Mantiene información EXIF y otros metadatos',
          type: 'toggle',
          value: false
        });
        settings.push({
          id: 'smart-compression',
          name: 'Compresión inteligente',
          description: 'Utiliza IA para preservar áreas importantes',
          type: 'toggle',
          value: isPremiumUser,
          isPremium: true,
          disabled: !isPremiumUser
        });
        break;
        
      case 'docx':
      case 'doc':
        settings.push({
          id: 'image-quality',
          name: 'Calidad de imágenes incrustadas',
          description: 'Nivel de compresión aplicado a las imágenes del documento',
          type: 'slider',
          value: 75,
          min: 0,
          max: 100,
          step: 1,
          unit: '%'
        });
        settings.push({
          id: 'keep-formatting',
          name: 'Preservar formato',
          description: 'Mantiene estilos y formato exactos',
          type: 'toggle',
          value: true
        });
        settings.push({
          id: 'remove-comments',
          name: 'Eliminar comentarios',
          description: 'Elimina comentarios y marcas de revisión',
          type: 'toggle',
          value: true
        });
        settings.push({
          id: 'deep-analysis',
          name: 'Análisis profundo',
          description: 'Analiza la estructura del documento para máxima optimización',
          type: 'toggle',
          value: isPremiumUser,
          isPremium: true,
          disabled: !isPremiumUser
        });
        break;
    }
    
    return settings;
  };

  const calculateEstimatedSavings = (features: OptimizationFeature[]) => {
    const activeFeatures = features.filter(feature => feature.active && (!feature.isPremium || isPremiumUser));
    const totalSavings = activeFeatures.reduce((sum, feature) => {
      return sum + ((feature.before || 0) - (feature.after || 0));
    }, 0);
    
    setEstimatedSavings(totalSavings);
  };

  const toggleOptimizationFeature = (featureId: string) => {
    const updatedFeatures = optimizationFeatures.map(feature => {
      if (feature.id === featureId) {
        // Don't allow disabling premium features for non-premium users
        if (feature.isPremium && !isPremiumUser && feature.active) {
          return feature;
        }
        return { ...feature, active: !feature.active };
      }
      return feature;
    });
    
    setOptimizationFeatures(updatedFeatures);
    calculateEstimatedSavings(updatedFeatures);
  };

  const updateOptimizationSetting = (settingId: string, value: any) => {
    const updatedSettings = optimizationSettings.map(setting => {
      if (setting.id === settingId) {
        return { ...setting, value };
      }
      return setting;
    });
    
    setOptimizationSettings(updatedSettings);
  };

  const handleApplyOptimizations = () => {
    setIsOptimized(true);
    
    // Prepare settings object for callback
    const optimizationConfig = {
      features: optimizationFeatures.filter(f => f.active).map(f => f.id),
      settings: optimizationSettings.reduce((acc, setting) => {
        acc[setting.id] = setting.value;
        return acc;
      }, {} as Record<string, any>)
    };
    
    if (onApplyOptimizations) {
      onApplyOptimizations(optimizationConfig);
    }
  };
  
  const toggleFeatureDetails = (featureId: string) => {
    setActiveFeature(activeFeature === featureId ? null : featureId);
  };

  // Helper function to format bytes to human readable format
  const formatBytes = (bytes: number, decimals: number = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getOptimizationScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-slate-400';
    }
  };

  const renderOptimizationScore = () => {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-start">
          <div className="mr-4">
            <div className="relative w-16 h-16">
              <Gauge size={64} className="text-slate-600" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className={`text-xl font-bold ${getOptimizationScoreColor(optimizationScore)}`}>
                  {optimizationScore}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-white">Puntuación de optimización</h3>
            <p className="text-sm text-slate-400 mt-1">
              Tu archivo tiene potencial de mejora. Aplicando las optimizaciones recomendadas podrías reducir significativamente su tamaño.
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-slate-400">Tamaño actual</div>
          <div className="text-lg font-medium text-white">{formatBytes(fileSize)}</div>
          <div className="text-sm text-green-500">Ahorro estimado: {formatBytes(estimatedSavings)}</div>
        </div>
      </div>
    );
  };

  const renderOptimizationFeatures = () => {
    return (
      <div className="space-y-3">
        <h3 className="font-medium text-white">Optimizaciones disponibles</h3>
        
        <div className="space-y-2">
          {optimizationFeatures.map(feature => (
            <div 
              key={feature.id}
              className={`bg-slate-800/50 rounded-lg border ${
                feature.active ? 'border-primary/50' : 'border-slate-700'
              } overflow-hidden transition-colors`}
            >
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {feature.recommended && (
                        <Badge className="bg-green-500 text-xs px-2 py-1 rounded">Recomendado</Badge>
                      )}
                      {feature.isPremium && !isPremiumUser && (
                        <Badge className="bg-gray-200 text-xs px-2 py-1 rounded">Premium</Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-white flex items-center">
                      {feature.name}
                      <span className={`ml-2 text-xs ${getImpactColor(feature.impact)}`}>
                        {feature.impact === 'high' ? 'Alto impacto' : 
                         feature.impact === 'medium' ? 'Impacto medio' : 
                         'Impacto bajo'}
                      </span>
                    </h4>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-slate-400 hover:text-slate-300"
                      onClick={() => toggleFeatureDetails(feature.id)}
                    >
                      {activeFeature === feature.id ? 
                        <ChevronDown size={16} /> : 
                        <ChevronRight size={16} />
                      }
                    </button>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={feature.active}
                        disabled={feature.isPremium && !isPremiumUser}
                        onChange={() => toggleOptimizationFeature(feature.id)}
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        feature.active ? 'bg-primary' : 'bg-slate-700'
                      } ${feature.isPremium && !isPremiumUser ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          feature.active ? 'translate-x-[22px]' : 'translate-x-1'
                        } transform transition-transform duration-200 ease-in-out mt-0.5`}></div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {activeFeature === feature.id && (
                  <div className="mt-2 border-t border-slate-700/50 pt-2 animate-in fade-in-0 slide-in-from-top-3 duration-300">
                    <p className="text-sm text-slate-300">{feature.description}</p>
                    
                    {feature.before && feature.after && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-center text-sm">
                        <div className="bg-slate-700/50 p-2 rounded">
                          <div className="text-slate-400">Tamaño actual</div>
                          <div className="text-white font-medium">{formatBytes(feature.before)}</div>
                        </div>
                        <div className="bg-slate-700/50 p-2 rounded">
                          <div className="text-slate-400">Después de optimizar</div>
                          <div className="text-green-500 font-medium">{formatBytes(feature.after)}</div>
                        </div>
                      </div>
                    )}
                    
                    {feature.isPremium && !isPremiumUser && (
                      <div className="mt-2 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-2 rounded flex items-center">
                        <Info size={14} className="text-amber-500 mr-2" />
                        <span className="text-xs text-amber-300">
                          Esta optimización avanzada está disponible para usuarios Premium
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAdvancedSettings = () => {
    return (
      <div className="mt-4">
        <button 
          className="flex items-center text-slate-300 hover:text-white mb-3"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          <Settings size={16} className="mr-2" />
          <span className="font-medium">Configuración avanzada</span>
          {showAdvancedSettings ? <ChevronDown size={16} className="ml-1" /> : <ChevronRight size={16} className="ml-1" />}
        </button>
        
        {showAdvancedSettings && (
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-4 animate-in fade-in-0 slide-in-from-top-5 duration-300">
            {optimizationSettings.map(setting => (
              <div key={setting.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <label className="text-sm font-medium text-white">
                      {setting.name}
                      {setting.isPremium && <Badge className="bg-secondary text-xs ml-2 px-2 py-1 rounded">Premium</Badge>}
                    </label>
                    <span title={setting.description}>
                      <HelpCircle size={14} className="text-slate-400 ml-1 cursor-help" />
                    </span>
                  </div>
                  
                  {setting.type === 'toggle' && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={setting.value}
                        disabled={setting.disabled}
                        onChange={() => updateOptimizationSetting(setting.id, !setting.value)}
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${
                        setting.value ? 'bg-primary' : 'bg-slate-700'
                      } ${setting.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          setting.value ? 'translate-x-[22px]' : 'translate-x-0.5'
                        } transform transition-transform duration-200 ease-in-out mt-0.5`}></div>
                      </div>
                    </label>
                  )}
                </div>
                
                {setting.type === 'slider' && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{setting.min}{setting.unit}</span>
                      <span>{setting.value}{setting.unit}</span>
                      <span>{setting.max}{setting.unit}</span>
                    </div>
                    <input
                      type="range"
                      min={setting.min}
                      max={setting.max}
                      step={setting.step}
                      value={setting.value}
                      onChange={(e) => updateOptimizationSetting(setting.id, Number(e.target.value))}
                      disabled={setting.disabled}
                      className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${
                        setting.disabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                )}
                
                {setting.type === 'select' && (
                  <select
                    value={setting.value}
                    onChange={(e) => updateOptimizationSetting(setting.id, e.target.value)}
                    disabled={setting.disabled}
                    className={`w-full bg-slate-700 border border-slate-600 text-white rounded p-2 ${
                      setting.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {setting.options?.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                )}
                
                <p className="text-xs text-slate-400">{setting.description}</p>
                
                {setting.isPremium && !isPremiumUser && (
                  <div className="mt-1 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-1.5 rounded text-xs text-amber-300">
                    Disponible para usuarios Premium
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sliders className="mr-2 text-primary" />
              <CardTitle>Optimización de Conversión</CardTitle>
            </div>
            <Badge className="bg-gray-200 text-xs px-2 py-1 rounded">
              {isOptimized ? 'Optimizado' : 'No optimizado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* File info */}
            <div className="flex items-center">
              <div className="p-2 bg-slate-800 rounded-lg mr-3">
                <FileCheck size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-white">{fileName}</h3>
                <p className="text-sm text-slate-400">
                  {formatBytes(fileSize)} • {fileType.toUpperCase()}
                </p>
              </div>
            </div>
            
            {isAnalyzing ? (
              <div className="bg-slate-800/50 rounded-lg p-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-300">Analizando archivo y calculando optimizaciones...</p>
              </div>
            ) : (
              <>
                {renderOptimizationScore()}
                
                <div className="mt-6">
                  {renderOptimizationFeatures()}
                  {renderAdvancedSettings()}
                </div>
                
                <div className="flex justify-between mt-6">
                  <div>
                    <p className="text-sm text-slate-300">
                      {isOptimized ? (
                        <span className="flex items-center text-green-500">
                          <FileCheck size={16} className="mr-1" />
                          Archivo optimizado correctamente
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FileWarning size={16} className="mr-1 text-amber-500" />
                          Se pueden aplicar {optimizationFeatures.filter(f => f.recommended && (!f.isPremium || isPremiumUser)).length} optimizaciones recomendadas
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isOptimized && onDownload && (
                      <Button 
                        onClick={onDownload}
                      >
                        <Download size={16} className="mr-2" />
                        Descargar
                      </Button>
                    )}
                    
                    {!isOptimized && (
                      <Button 
                        onClick={handleApplyOptimizations}
                      >
                        <Save size={16} className="mr-2" />
                        Aplicar optimizaciones
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionOptimization;
