import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { FileUploader } from './FileUploader';
import { FormatSelector } from './ui/FormatSelector';
import { FileUp, Settings, Download, Info } from 'lucide-react';

export const SafeConversor: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversionAnalysis, setConversionAnalysis] = useState<any>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setCurrentStep(2);
    
    // Simular análisis IA del archivo
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Simular que detectamos que la conversión directa es óptima
      // En un caso real, esto vendría del análisis IA
      const isOptimalDirect = true; // JPG → PNG es conversión directa óptima
      
      if (isOptimalDirect) {
        // Saltar directamente al paso 4 (conversión) sin intervención del usuario
        setTargetFormat('png'); // Formato óptimo detectado automáticamente
        setConversionAnalysis({
          recommendation: { type: 'direct' },
          analysis: {
            direct: { quality: 95 },
            optimized: { quality: 98 }
          }
        });
        setCurrentStep(4); // Ir directamente a conversión
        
        // Iniciar conversión automáticamente después de mostrar el mensaje
        setTimeout(() => {
          setCurrentStep(5); // Completar conversión
        }, 3000);
      } else {
        setCurrentStep(3); // Ir a configuración manual
      }
    }, 2000);
  }, []);

  const handleFormatSelection = useCallback(async (format: string) => {
    setTargetFormat(format);
    setIsAnalyzing(true);
    
    // Simular análisis de conversión
    setTimeout(() => {
      setConversionAnalysis({
        recommendation: { type: 'direct' },
        analysis: {
          direct: { quality: 95 },
          optimized: { quality: 98 }
        }
      });
      setIsAnalyzing(false);
    }, 1500);
  }, []);

  const isDark = true; // Forzar tema oscuro para simplicidad

  return (
    <div className="max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-900 text-white p-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Conversor <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Seguro</span>
        </h1>
        <p className="text-slate-300">
          Versión simplificada para debugging
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Upload & AI Optimizer */}
        <div className="lg:col-span-3">
          <Card variant="dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileUp className="mr-2" size={20} />
                Subir Archivo & Optimizador IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 ? (
                <FileUploader
                  onFileSelect={handleFileSelect}
                  isLoading={false}
                  acceptedFiles="*"
                >
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <FileUp size={48} className="mx-auto mb-4 text-blue-400" />
                    <p className="text-white mb-2">Arrastra tu archivo aquí</p>
                    <p className="text-sm text-slate-400">
                      Formatos soportados: PDF, DOC, JPG, PNG, etc.
                    </p>
                  </div>
                </FileUploader>
              ) : currentStep === 2 && isAnalyzing ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  </div>
                  <p className="text-blue-400 font-medium">{selectedFile?.name}</p>
                  <p className="text-xs text-blue-300/70">🤖 Optimizador IA analizando...</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileUp size={24} className="text-green-400" />
                  </div>
                  <p className="text-green-400 font-medium">{selectedFile?.name}</p>
                  <p className="text-xs text-green-300/70">
                    {currentStep >= 4 ? '✅ Optimización IA completada' : 'Archivo cargado'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Configure */}
        <div className="lg:col-span-6">
          <Card variant="dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2" size={20} />
                Configurar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep >= 2 ? (
                <div className="space-y-4">
                  {currentStep === 2 && isAnalyzing && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                      <p className="text-blue-400">Analizando archivo...</p>
                    </div>
                  )}
                  
                  {currentStep >= 3 && (
                    <>
                      <div>
                        <label className="block text-white mb-2">Formato de salida:</label>
                        <FormatSelector
                          availableFormats={['png', 'jpg', 'pdf', 'docx', 'txt']}
                          selectedFormat={targetFormat}
                          onFormatSelect={handleFormatSelection}
                          sourceFormat={selectedFile?.name.split('.').pop()?.toLowerCase() || ''}
                        />
                      </div>

                      {isAnalyzing && (
                        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                            <span className="text-slate-300">Analizando opciones...</span>
                          </div>
                        </div>
                      )}

                      {/* Mensaje de conversión óptima - solo en paso 4 */}
                      {currentStep === 4 && conversionAnalysis && targetFormat && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <Info size={24} className="text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-blue-300 mb-2">
                                🎯 Conversión Óptima Detectada
                              </h4>
                              <p className="text-blue-200 mb-3">
                                La IA ha detectado que la conversión directa <strong>JPG → PNG</strong> es la opción óptima. 
                                Iniciando conversión automáticamente...
                              </p>
                              <div className="flex items-center gap-2 text-sm text-blue-300">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span>Convirtiendo en 3 segundos...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}


                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings size={48} className="mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400">Esperando archivo...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 3: Convert & Download */}
        <div className="lg:col-span-3">
          <Card variant="dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2" size={20} />
                Convertir & Descargar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep >= 4 ? (
                <div className="space-y-4">
                  {/* Estado de conversión */}
                  {currentStep === 4 && (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                      </div>
                      <p className="text-purple-400 font-medium mb-2">Convirtiendo...</p>
                      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                        <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                      </div>
                      <p className="text-xs text-purple-300/70">JPG → PNG</p>
                    </div>
                  )}
                  
                  {/* Estado completado */}
                  {currentStep === 5 && (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download size={32} className="text-green-400" />
                      </div>
                      <p className="text-green-400 font-medium mb-2">¡Conversión Completada!</p>
                      <p className="text-xs text-green-300/70 mb-4">Archivo listo para descargar</p>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm w-full">
                        Descargar PNG
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Download size={48} className="mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400">Esperando conversión...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">✅ Conversor con Conversión Automática</h3>
        <p className="text-green-300 text-sm">
          Paso: {currentStep} | Archivo: {selectedFile?.name || 'Ninguno'} | Formato: {targetFormat || 'Auto-detectado'} | 
          {currentStep === 4 && ' 🎯 Conversión Óptima Automática'}
          {currentStep === 5 && ' ✅ Completado'}
        </p>
        <p className="text-green-200 text-xs mt-1">
          Flujo: Subir & Optimizador IA → Configurar → {currentStep >= 4 ? '🎯 Conversión Automática' : 'Convertir & Descargar'}
        </p>
      </div>
    </div>
  );
};