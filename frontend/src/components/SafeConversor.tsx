import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { FileUploader } from './FileUploader';
import { FormatSelector } from './ui/FormatSelector';
import { FileUp, Settings, Download, Info, Sun, Moon, Monitor } from 'lucide-react';

// ✅ NUEVO: Función para obtener formatos disponibles según el archivo de entrada
const getAvailableFormats = (sourceFormat: string): string[] => {
  const formatMap: Record<string, string[]> = {
    // Imágenes
    'png': ['jpg', 'pdf', 'docx', 'gif', 'webp', 'bmp'],
    'jpg': ['png', 'pdf', 'docx', 'gif', 'webp', 'bmp'],
    'jpeg': ['png', 'pdf', 'docx', 'gif', 'webp', 'bmp'],
    'gif': ['png', 'jpg', 'pdf', 'mp4'],
    'webp': ['png', 'jpg', 'pdf', 'gif'],
    'bmp': ['png', 'jpg', 'pdf', 'gif'],
    'tiff': ['png', 'jpg', 'pdf'],
    'svg': ['png', 'jpg', 'pdf'],

    // Documentos
    'pdf': ['docx', 'txt', 'html', 'jpg', 'png'],
    'docx': ['pdf', 'txt', 'html', 'md'],
    'doc': ['pdf', 'docx', 'txt', 'html'],
    'txt': ['pdf', 'docx', 'html', 'md'],
    'md': ['pdf', 'docx', 'html', 'txt'],
    'html': ['pdf', 'docx', 'txt', 'md'],
    'rtf': ['pdf', 'docx', 'txt', 'html'],
    'odt': ['pdf', 'docx', 'txt', 'html'],

    // Datos
    'csv': ['xlsx', 'pdf', 'html', 'json', 'txt', 'svg'],
    'xlsx': ['csv', 'pdf', 'html', 'txt'],
    'xls': ['csv', 'xlsx', 'pdf', 'html'],
    'json': ['csv', 'xlsx', 'txt', 'html'],

    // Libros electrónicos
    'epub': ['pdf', 'html', 'txt', 'md'],
    'mobi': ['pdf', 'epub', 'txt'],
  };

  return formatMap[sourceFormat.toLowerCase()] || ['pdf', 'txt', 'html', 'docx'];
};

export const SafeConversor: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversionAnalysis, setConversionAnalysis] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  // Determine if current theme is dark
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Close theme menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.theme-selector') && !target.closest('.theme-menu')) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    let effectiveTheme = newTheme;
    if (newTheme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setThemeMenuOpen(false);
  };

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setCurrentStep(2);
    
    // Simular análisis IA del archivo
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Después del análisis, seguir en paso 2 para mostrar opciones de formato
      setCurrentStep(2);
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
      setShowConfirmation(true);
    }, 1500);
  }, []);

  const handleConfirmConversion = useCallback(() => {
    setShowConfirmation(false);
    setCurrentStep(3); // Activar paso 3
    
    // Simular conversión (3 segundos)
    setTimeout(() => {
      // Conversión completada - mostrar botón de descarga
    }, 3000);
  }, []);

  const handleChangeSelection = useCallback(() => {
    setShowConfirmation(false);
    setTargetFormat('');
    setConversionAnalysis(null);
    setCurrentStep(2); // Volver al paso 2 para seleccionar nuevo formato
    setIsDownloaded(false); // Reset download state
  }, []);

  const handleDownload = useCallback(async () => {
    if (!selectedFile || !targetFormat) return;
    
    try {
      // Crear FormData para enviar al backend
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('target_format', targetFormat);
      
      console.log('🚀 Enviando archivo al backend para conversión real...');
      
      // Llamar al endpoint real del backend (sin autenticación para invitados)
      const response = await fetch('http://localhost:8000/api/conversion/guest-convert', {
        method: 'POST',
        body: formData
        // No headers necesarios para guest-convert
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la conversión');
      }
      
      // El backend devuelve un JSON con la URL de descarga
      const result = await response.json();
      
      if (!result.success || !result.download_url) {
        throw new Error(result.error || 'Error en la conversión');
      }
      
      console.log('✅ Conversión exitosa, descargando archivo...');
      
      // Descargar el archivo convertido usando la URL proporcionada
      const downloadResponse = await fetch(`http://localhost:8000${result.download_url}`);
      
      if (!downloadResponse.ok) {
        throw new Error('Error al descargar el archivo convertido');
      }
      
      // Obtener el archivo convertido como blob
      const blob = await downloadResponse.blob();
      
      // Crear nombre del archivo convertido
      const originalName = selectedFile.name.split('.')[0];
      const newFileName = `${originalName}_convertido.${targetFormat}`;
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = newFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Marcar como descargado
      setIsDownloaded(true);
      
      console.log('✅ Conversión real completada y archivo descargado');
      
    } catch (error) {
      console.error('❌ Error en conversión real:', error);
      alert(`Error al convertir archivo: ${error.message}`);
    }
  }, [selectedFile, targetFormat]);

  const handleNewConversion = useCallback(() => {
    setCurrentStep(1);
    setSelectedFile(null);
    setTargetFormat('');
    setConversionAnalysis(null);
    setShowConfirmation(false);
    setIsDownloaded(false);
  }, []);

  return (
    <div className="min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      {/* Main content */}
      <div className="max-w-7xl mx-auto space-y-8 p-8 pt-8">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            ANCLORA <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-400">NEXUS</span>
          </h1>
          <p className="text-gray-600 dark:text-slate-300 text-lg">
            La inteligencia que conecta tus documentos
          </p>
          <p className="text-gray-500 dark:text-slate-400">
            Proceso rápido, seguro y preciso. Más de 200 formatos soportados.
          </p>
        </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Step 1: Upload & AI Optimizer */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-center text-gray-900 dark:text-white">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-base font-bold leading-none font-mono ${
                  currentStep >= 2 && !isAnalyzing ? 'bg-green-500 text-white' : 'bg-gray-400 dark:bg-slate-600 text-gray-700 dark:text-slate-300'
                }`}>
                  1
                </div>
                <span>Subir Archivo & IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 ? (
                <FileUploader
                  onFileSelect={handleFileSelect}
                  isLoading={false}
                  acceptedFiles="*"
                >
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center">
                    <FileUp size={48} className="mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                    <p className="text-gray-900 dark:text-white mb-2">Arrastra tu archivo aquí</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Formatos soportados: PDF, DOC, JPG, PNG, etc.
                    </p>
                  </div>
                </FileUploader>
              ) : currentStep === 2 && isAnalyzing ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-blue-500/20 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">{selectedFile?.name}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-300/70">🤖 Optimizador IA analizando...</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-500/20 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileUp size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">{selectedFile?.name}</p>
                  <p className="text-xs text-green-500 dark:text-green-300/70">
                    {currentStep >= 2 && !isAnalyzing ? '✅ Archivo subido y optimizado por la IA' : 'Archivo cargado'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Configure */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-center relative text-gray-900 dark:text-white">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold leading-none font-mono ${
                  currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-400 dark:bg-slate-600 text-gray-700 dark:text-slate-300'
                }`}>
                  2
                </div>
                <span className="absolute left-1/2 transform -translate-x-1/2">Seleccionar Formato & IA</span>
                <div className="w-10"></div> {/* Spacer para balance */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep >= 2 ? (
                <div className="space-y-4">
                  {currentStep === 2 && isAnalyzing && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
                      <p className="text-blue-600 dark:text-blue-400">Analizando archivo...</p>
                    </div>
                  )}
                  
                  {currentStep >= 2 && !isAnalyzing && (
                    <>
                      <div>
                        <label className="block text-gray-900 dark:text-white mb-2">Formato de salida:</label>
                        <FormatSelector
                          availableFormats={getAvailableFormats(selectedFile?.name.split('.').pop()?.toLowerCase() || '')}
                          selectedFormat={targetFormat || ''}
                          onFormatSelect={handleFormatSelection}
                          sourceFormat={selectedFile?.name.split('.').pop()?.toLowerCase() || ''}
                        />
                      </div>

                      {isAnalyzing && (
                        <div className="bg-gray-100 dark:bg-slate-800/30 border border-gray-300 dark:border-slate-700 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
                            <span className="text-gray-700 dark:text-slate-300">Analizando opciones...</span>
                          </div>
                        </div>
                      )}

                      {/* Confirmación de conversión */}
                      {conversionAnalysis && targetFormat && (
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                              <Info size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">
                                🎯 Conversión Seleccionada
                              </h4>
                              <p className="text-blue-700 dark:text-blue-200 mb-4">
                                Has seleccionado convertir <strong>{selectedFile?.name}</strong> a formato <strong>{targetFormat.toUpperCase()}</strong>.
                                La IA recomienda conversión directa para obtener la mejor calidad.
                              </p>
                              <div className="flex gap-3">
                                <button 
                                  onClick={handleConfirmConversion}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                  ✅ Confirmar Conversión
                                </button>
                                <button 
                                  onClick={handleChangeSelection}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                  🔄 Cambiar Selección
                                </button>
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
                  <Settings size={48} className="mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                  <p className="text-gray-500 dark:text-slate-400">Esperando archivo...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 3: Convert & Download */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-center text-gray-900 dark:text-white">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-base font-bold leading-none font-mono ${
                  currentStep === 3 ? 'bg-green-500 text-white' : 'bg-gray-400 dark:bg-slate-600 text-gray-700 dark:text-slate-300'
                }`}>
                  3
                </div>
                <span>Convertir & Descargar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 3 ? (
                <div className="space-y-4">
                  {!isDownloaded ? (
                    // Estado: Listo para descargar
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-500/20 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download size={32} className="text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-green-600 dark:text-green-400 font-medium mb-2">¡Conversión Completada!</p>
                      <p className="text-xs text-green-500 dark:text-green-300/70 mb-4">
                        {selectedFile?.name} → {targetFormat?.toUpperCase()}
                      </p>
                      <button 
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm w-full"
                      >
                        📥 Descargar {targetFormat?.toUpperCase()}
                      </button>
                    </div>
                  ) : (
                    // Estado: Ya descargado
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-500/20 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 dark:text-green-400 font-medium mb-2">¡Archivo Descargado!</p>
                      <p className="text-xs text-green-500 dark:text-green-300/70 mb-4">
                        {selectedFile?.name} convertido a {targetFormat?.toUpperCase()}
                      </p>
                      <div className="space-y-2">
                        <button 
                          onClick={handleDownload}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm w-full"
                        >
                          📥 Descargar de nuevo
                        </button>
                        <button 
                          onClick={handleNewConversion}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm w-full"
                        >
                          🔄 Nueva Conversión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Download size={48} className="mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                  <p className="text-gray-500 dark:text-slate-400">Esperando conversión...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Debug Info */}
        <div className="bg-green-500/30 dark:bg-green-500/30 border border-green-500/30 dark:border-green-500/30 rounded-lg p-4">
          <h3 className="text-green-600 dark:text-green-400 font-semibold mb-2">✅ Conversor Seguro - 3 Pasos</h3>
          <p className="text-green-700 dark:text-green-300 text-sm">
            Paso: {currentStep} | Archivo: {selectedFile?.name || 'Ninguno'} | Formato: {targetFormat || 'No seleccionado'} | 
            {currentStep === 3 && !isDownloaded && ' ✅ Listo para descargar'}
            {currentStep === 3 && isDownloaded && ' 📥 Descargado - Créditos descontados'}
          </p>
          <p className="text-green-600 dark:text-green-200 text-xs mt-1">
            Flujo: Subir & Optimizador IA → Seleccionar Formato & IA → Convertir & Descargar
          </p>
        </div>
      </div>
    </div>
  );
};