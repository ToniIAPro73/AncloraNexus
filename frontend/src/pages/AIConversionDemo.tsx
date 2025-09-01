import React, { useState } from 'react';
import { 
  Brain, Zap, Package, Eye, Star, TrendingUp,
  CheckCircle, Sparkles, Rocket, Shield, Clock
} from 'lucide-react';
import { AIConversionStudio } from '../components/AIConversionStudio';
import { IntelligentBatchConverter } from '../components/IntelligentBatchConverter';
import { IntelligentConversionHub } from '../components/IntelligentConversionHub';

type DemoMode = 'studio' | 'batch' | 'hub' | 'overview';

export const AIConversionDemo: React.FC = () => {
  const [activeMode, setActiveMode] = useState<DemoMode>('overview');

  const features = [
    {
      icon: Brain,
      title: 'Análisis IA Avanzado',
      description: 'Motor de IA que analiza archivos y predice la mejor estrategia de conversión',
      color: 'purple',
      stats: '95% precisión'
    },
    {
      icon: TrendingUp,
      title: 'Rutas Inteligentes',
      description: 'Secuencias optimizadas de conversión con múltiples pasos intermedios',
      color: 'blue',
      stats: '3x más rápido'
    },
    {
      icon: Eye,
      title: 'Vista Previa IA',
      description: 'Previsualización inteligente con análisis de metadatos y calidad',
      color: 'green',
      stats: 'Tiempo real'
    },
    {
      icon: Package,
      title: 'Lotes Inteligentes',
      description: 'Procesamiento por lotes con descarga ZIP y optimización automática',
      color: 'orange',
      stats: 'Hasta 100 archivos'
    },
    {
      icon: Shield,
      title: 'Seguridad IA',
      description: 'Análisis de seguridad automático y clasificación de contenido',
      color: 'red',
      stats: '100% seguro'
    },
    {
      icon: Zap,
      title: 'Velocidad Optimizada',
      description: 'Conversiones ultra-rápidas con predicción de tiempo y calidad',
      color: 'yellow',
      stats: '< 3 segundos'
    }
  ];

  const demoModes = [
    {
      id: 'overview' as DemoMode,
      title: 'Visión General',
      description: 'Explora las capacidades del motor IA',
      icon: Star,
      color: 'gradient-to-r from-purple-500 to-blue-500'
    },
    {
      id: 'studio' as DemoMode,
      title: 'AI Studio',
      description: 'Conversión individual con análisis completo',
      icon: Brain,
      color: 'gradient-to-r from-purple-500 to-pink-500'
    },
    {
      id: 'batch' as DemoMode,
      title: 'Lotes Inteligentes',
      description: 'Procesamiento masivo con IA',
      icon: Package,
      color: 'gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      id: 'hub' as DemoMode,
      title: 'Hub Completo',
      description: 'Experiencia completa de conversión IA',
      icon: Rocket,
      color: 'gradient-to-r from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Anclora Nexus AI Engine
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Motor de Conversión Inteligente • Demostración Interactiva
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  IA Activa
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Backend: ✅ Conectado
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  localhost:8000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {demoModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-300 text-left
                ${activeMode === mode.id 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-105' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 bg-${mode.color} rounded-lg`}>
                  <mode.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {mode.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode.description}
              </p>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Overview Mode */}
          {activeMode === 'overview' && (
            <div className="p-8 space-y-8">
              {/* Hero Section */}
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Motor de Conversión IA
                  </h2>
                  <Brain className="w-12 h-12 text-purple-500 animate-bounce" />
                </div>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Revoluciona la conversión de archivos con inteligencia artificial avanzada. 
                  Análisis automático, rutas optimizadas y calidad garantizada.
                </p>
                
                <div className="flex items-center justify-center space-x-8 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">15+ Formatos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Análisis IA</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Lotes ZIP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Vista Previa</span>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-3 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-lg`}>
                        <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <div className={`text-sm font-medium text-${feature.color}-600 dark:text-${feature.color}-400`}>
                          {feature.stats}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats Dashboard */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                  Estadísticas del Motor IA
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      15+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Formatos Soportados</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      95%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Precisión IA</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      &lt;3s
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo Promedio</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      100
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Archivos por Lote</div>
                  </div>
                </div>
              </div>

              {/* Quick Start */}
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ¿Listo para probar el Motor IA?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Selecciona un modo de demostración para explorar las capacidades de conversión inteligente
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setActiveMode('studio')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Probar AI Studio
                  </button>
                  <button
                    onClick={() => setActiveMode('batch')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Probar Lotes IA
                  </button>
                  <button
                    onClick={() => setActiveMode('hub')}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Hub Completo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Studio Mode */}
          {activeMode === 'studio' && (
            <div className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Conversion Studio
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Conversión individual con análisis IA completo y recomendaciones inteligentes
                </p>
              </div>
              <AIConversionStudio />
            </div>
          )}

          {/* Batch Mode */}
          {activeMode === 'batch' && (
            <div className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Conversión por Lotes Inteligente
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Procesa múltiples archivos con IA y descarga en formato ZIP
                </p>
              </div>
              <IntelligentBatchConverter />
            </div>
          )}

          {/* Hub Mode */}
          {activeMode === 'hub' && (
            <div className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Hub de Conversión Inteligente
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Experiencia completa con workflow guiado y optimización automática
                </p>
              </div>
              <IntelligentConversionHub />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span>Powered by AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Ultra Rápido</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Calidad Premium</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 dark:text-gray-500">
            © 2025 Anclora Nexus • Motor de Conversión Inteligente v1.0 • 
            Desarrollado con ❤️ y 🤖 IA
          </div>
        </div>
      </div>
    </div>
  );
};
