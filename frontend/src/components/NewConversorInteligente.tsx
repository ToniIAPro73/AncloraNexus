// frontend/src/components/NewConversorInteligente.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, StepProgress, Progress } from './ui';
import { FileUploader } from './FileUploader';
import { FormatSelector } from './ui/FormatSelector';
import { ConversionOptionsComparison } from './ui/ConversionOptionsComparison';
import {
  FileUp, FileBarChart, Settings, Download, ArrowRight, Check, Loader, X, Sun, Moon, Monitor, RefreshCw
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
  const isDark = document.documentElement.classList.contains('dark');
  const stepVariant = isActive ? 'elevated' : isCompleted ? 'default' : isDark ? 'dark' : 'light';
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
                : isDark
                  ? 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  : 'bg-gray-200 text-gray-600 border border-gray-300'
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
              <span className={`mr-2 flex items-center ${
                isDark ? 'text-slate-400' : 'text-gray-500'
              }`}>
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
              : isDark
                ? 'bg-slate-700'
                : 'bg-gray-300'
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
}) => {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <Card variant={isDark ? "dark" : "default"}>
      <div
        className={`cursor-pointer group transition-colors ${
          isDark ? 'hover:bg-slate-800/60' : 'hover:bg-gray-100/60'
        }`}
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
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
            isDark
              ? 'bg-slate-700 group-hover:bg-slate-600'
              : 'bg-gray-200 group-hover:bg-gray-300'
          }`}>
            {fromIcon}
          </div>
          <ArrowRight size={18} className={`mx-2 group-hover:text-primary transition-colors ${
            isDark ? 'text-slate-500' : 'text-gray-400'
          }`} />
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
            isDark
              ? 'bg-slate-700 group-hover:bg-slate-600'
              : 'bg-gray-200 group-hover:bg-gray-300'
          }`}>
            {toIcon}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <h4 className={`text-base font-medium ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {from} <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>→</span> {to}
        </h4>
        <div className="flex items-center justify-center mt-2">
          <Badge variant="default" size="sm" className={
            isDark ? 'bg-slate-700' : 'bg-gray-200 text-gray-700'
          }>
            {cost} créditos
          </Badge>
        </div>
      </div>
    </CardContent>
    </div>
  </Card>
  );
};

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
  const [isDragging, setIsDragging] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

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

  // Manejadores de drag & drop mejorados
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo quitar el estado si realmente salimos del área
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Función para calcular el progreso real
  const getProgressStep = useCallback(() => {
    if (currentStep === 1) return 0; // No hay progreso hasta subir archivo
    if (currentStep === 2) return 0; // Análisis en progreso, pero no completado
    if (currentStep === 3) return 1; // Archivo subido y analizado
    if (currentStep === 4) return 2; // Configuración completada, convirtiendo
    if (currentStep === 5) return 3; // Todo completado
    return 0;
  }, [currentStep]);

  // Funciones para el tema
  const [systemDark, setSystemDark] = useState(false);

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
      if (theme === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const isDark = theme === 'dark' || (theme === 'auto' && systemDark);

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    let effectiveTheme = newTheme;
    if (newTheme === 'auto') {
      effectiveTheme = systemDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setThemeMenuOpen(false);
  };

  // Inicializar tema al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'auto';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, [systemDark]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setCurrentStep(2); // Análisis IA
    setError(null);
    setIsDragging(false);

    // Obtener formatos disponibles para este archivo
    const formats = getAvailableFormats(file);
    setAvailableFormats(formats);

    // Simular análisis IA (2 segundos)
    setTimeout(() => {
      setCurrentStep(3); // Ir directamente a Configurar
      // Auto-seleccionar primer formato disponible
      if (formats.length > 0) {
        setTargetFormat(formats[0]);
      }
    }, 2000);
  }, [getAvailableFormats]);

  const handleConvert = useCallback(async () => {
    if (!selectedFile || !targetFormat || !selectedConversionOption) return;

    setIsConverting(true);
    setCurrentStep(4); // Convertir
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
        setCurrentStep(5); // Mostrar descarga en el mismo frame
        // Removido el auto-reset automático para mejor control del usuario
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
  }, [selectedFile, targetFormat, selectedConversionOption, conversionAnalysis]);

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
        // Asegurar que siempre tengamos al menos una opción directa
        const analysis = result.analysis || {};

        // Si no hay análisis completo, crear uno básico
        if (!analysis.direct) {
          analysis.direct = {
            steps: [sourceFormat, targetFormat],
            cost: 2, // Costo por defecto
            quality: 85,
            description: `Conversión directa ${sourceFormat.toUpperCase()} → ${targetFormat.toUpperCase()}`,
            advantages: ['Conversión rápida', 'Proceso simple'],
            time_estimate: '30-60 segundos',
            recommended: true
          };
        }

        // Asegurar que hay una recomendación
        if (!analysis.recommendation) {
          analysis.recommendation = {
            type: 'direct',
            reason: 'Conversión directa disponible',
            confidence: 'high'
          };
        }

        setConversionAnalysis(analysis);
        // Auto-seleccionar opción recomendada (con fallback a 'direct')
        const recommendedType = analysis.recommendation?.type || 'direct';
        setSelectedConversionOption(recommendedType);
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
    setShouldAutoConvert(false);
    setCurrentStep(2); // Resetear al paso 2

    if (selectedFile) {
      const sourceFormat = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      await analyzeConversionOptions(sourceFormat, format);
    }
  }, [selectedFile, analyzeConversionOptions]);

  // Función para resetear el conversor al estado inicial
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setTargetFormat('');
    setIsConverting(false);
    setCurrentStep(1);
    setConversionResult(null);
    setError(null);
    setAvailableFormats([]);
    setConversionAnalysis(null);
    setSelectedConversionOption(null);
    setIsAnalyzing(false);
  }, []);

  // Función para manejar la descarga y reset automático
  const handleDownload = useCallback((downloadUrl: string, filename: string) => {
    // Crear un enlace temporal para la descarga
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Eliminado el reset automático - el usuario decide cuándo hacer una nueva conversión
  }, []);

  // Import more icons if necessary from lucide-react package
  const popularConversions = [
    { from: 'PDF', to: 'JPG', fromIcon: <FileUp size={24} className="text-blue-400" />, toIcon: <FileBarChart size={24} className="text-green-400" />, cost: 2, popular: true },
    { from: 'JPG', to: 'PNG', fromIcon: <FileBarChart size={24} className="text-green-400" />, toIcon: <FileBarChart size={24} className="text-purple-400" />, cost: 1 },
    { from: 'MP4', to: 'GIF', fromIcon: <FileUp size={24} className="text-red-400" />, toIcon: <FileBarChart size={24} className="text-amber-400" />, cost: 5 },
    { from: 'PNG', to: 'SVG', fromIcon: <FileBarChart size={24} className="text-purple-400" />, toIcon: <Settings size={24} className="text-slate-400" />, cost: 3 },
    { from: 'DOC', to: 'PDF', fromIcon: <FileUp size={24} className="text-indigo-400" />, toIcon: <FileUp size={24} className="text-blue-400" />, cost: 2 },
  ];

  return (
    <div className={`max-w-7xl mx-auto space-y-8 transition-colors duration-300 min-h-screen ${
      isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header principal con selector de tema */}
      <div className="flex justify-between items-start mb-8">
        <div className="text-center animate-in fade-in slide-in-from-top duration-700 space-y-4 flex-1">
          <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-xl shadow-primary/20">
              <Settings size={28} className="text-white animate-pulse" />
            </div>
          </div>

          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Conversor <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-secondary">Inteligente</span>
          </h1>

          <p className={`text-lg max-w-2xl mx-auto transition-colors duration-300 ${
            isDark ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Convierte cualquier archivo a múltiples formatos con nuestra tecnología de inteligencia artificial avanzada
          </p>

          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <Badge variant="default" className={`border backdrop-blur-sm transition-colors duration-300 ${
              isDark
                ? 'bg-slate-800/50 border-slate-600 text-slate-200'
                : 'bg-gray-100/80 border-gray-300 text-gray-700'
            }`}>
              IA avanzada
            </Badge>
            <Badge variant="default" className={`border backdrop-blur-sm transition-colors duration-300 ${
              isDark
                ? 'bg-slate-800/50 border-slate-600 text-slate-200'
                : 'bg-gray-100/80 border-gray-300 text-gray-700'
            }`}>
              Conversión rápida
            </Badge>
            <Badge variant="default" className={`border backdrop-blur-sm transition-colors duration-300 ${
              isDark
                ? 'bg-slate-800/50 border-slate-600 text-slate-200'
                : 'bg-gray-100/80 border-gray-300 text-gray-700'
            }`}>
              +200 formatos
            </Badge>
          </div>
        </div>

        {/* Selector de tema */}
        <div className="relative">
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className={`p-2 transition-colors rounded-lg ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {theme === 'light' && <Sun className="w-5 h-5" />}
            {theme === 'dark' && <Moon className="w-5 h-5" />}
            {theme === 'auto' && <Monitor className="w-5 h-5" />}
          </button>

          {themeMenuOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => handleThemeChange('light')}
                className={`w-full px-4 py-2 text-left flex items-center space-x-2 rounded-t-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Claro</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`w-full px-4 py-2 text-left flex items-center space-x-2 transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Oscuro</span>
              </button>
              <button
                onClick={() => handleThemeChange('auto')}
                className={`w-full px-4 py-2 text-left flex items-center space-x-2 rounded-b-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Automático</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-xl">
          <StepProgress
            steps={3}
            currentStep={getProgressStep()}
            labels={['Subir & Análisis', 'Configurar', 'Convertir & Descargar']}
            className="animate-in fade-in duration-500"
          />
        </div>
      </div>

      {/* Layout rediseñado: 3 columnas con proporciones optimizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Frame 1: Subir Archivo + Análisis IA (3 columnas) */}
        <div className="lg:col-span-3">
          <ConversionStep
            number={1}
            title="Subir Archivo & Análisis IA"
            icon="📂"
            isActive={currentStep === 1 || currentStep === 2}
            isCompleted={currentStep > 2}
          >
            {currentStep === 1 ? (
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
                  ${isDragging
                    ? 'border-primary bg-primary/10 scale-105 shadow-lg shadow-primary/20'
                    : isDark
                      ? 'border-slate-600 hover:border-primary/60 hover:bg-slate-800/30'
                      : 'border-gray-300 hover:border-primary/60 hover:bg-gray-100/30'
                  }
                `}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input-main')?.click()}
              >
                <input
                  id="file-input-main"
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,.html,.md,.csv,.json,.epub,.rtf,.odt,.jpg,.jpeg,.png,.gif,.webp,.tiff,.bmp"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  multiple={false}
                />

                <div className="animate-in fade-in duration-500">
                  <div className={`
                    w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300
                    ${isDragging
                      ? 'bg-primary/20 scale-110'
                      : 'bg-primary/10'
                    }
                  `}>
                    <FileUp size={32} className={`transition-colors duration-300 ${isDragging ? 'text-primary animate-bounce' : 'text-primary'}`} />
                  </div>

                  <p className="text-lg font-medium text-white mb-2">
                    {isDragging ? '📁 Suelta tu archivo aquí' : 'Arrastra tu archivo aquí o haz clic para seleccionar'}
                  </p>

                  <p className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Formatos soportados: TXT, PDF, DOC, DOCX, HTML, MD, CSV, JSON, EPUB, RTF, ODT, JPG, PNG, GIF, WEBP, TIFF, BMP
                  </p>

                  {isDragging && (
                    <div className="mt-4 text-primary font-medium animate-pulse">
                      ✨ Listo para recibir el archivo
                    </div>
                  )}
                </div>
              </div>
            ) : currentStep === 2 ? (
              <div className="space-y-4">
                {/* Archivo seleccionado */}
                <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${
                  isDark ? 'bg-slate-800/40' : 'bg-gray-100/60'
                }`}>
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <FileUp size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{selectedFile?.name}</p>
                    <p className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Análisis IA en progreso */}
                <div className={`border rounded-lg p-4 ${
                  isDark
                    ? 'bg-slate-800/30 border-slate-700'
                    : 'bg-gray-100/50 border-gray-300'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>🤖 Análisis IA en progreso</p>
                      <p className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}>Analizando estructura y optimizaciones...</p>
                    </div>
                  </div>
                  <div className={`w-full rounded-full h-2 ${
                    isDark ? 'bg-slate-700' : 'bg-gray-300'
                  }`}>
                    <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full animate-progress"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Archivo seleccionado */}
                <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${
                  isDark ? 'bg-slate-800/40' : 'bg-gray-100/60'
                }`}>
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <FileUp size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{selectedFile?.name}</p>
                    <p className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className={`text-xs flex items-center ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    <Check size={14} className="text-green-500 mr-1" />
                    Listo
                  </div>
                </div>

                {/* Análisis IA completado */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-green-400 font-medium">🤖 Análisis IA completado</p>
                      <p className="text-xs text-green-300/70">Archivo analizado y optimizaciones detectadas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ConversionStep>
        </div>

        {/* Frame 2: Configurar (6 columnas - expandido) */}
        <div className="lg:col-span-6">
          <ConversionStep
            number={2}
            title="Configurar Conversión"
            icon="⚙️"
            isActive={currentStep === 3}
            isCompleted={currentStep > 3}
          >
            {currentStep >= 3 ? (
              <div className="space-y-6">
                {/* Selector de formato con más espacio */}
                <div>
                  <label className="block text-lg font-medium text-white mb-4">
                    Seleccionar formato de salida
                  </label>
                  <FormatSelector
                    availableFormats={availableFormats}
                    selectedFormat={targetFormat}
                    onFormatSelect={handleFormatSelection}
                    sourceFormat={selectedFile?.name.split('.').pop()?.toLowerCase() || ''}
                  />
                </div>

                {/* Análisis de opciones de conversión */}
                {isAnalyzing && (
                  <div className={`p-6 rounded-lg border ${
                    isDark
                      ? 'bg-slate-800/30 border-slate-700'
                      : 'bg-gray-100/50 border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <div>
                        <span className={`font-medium ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>Analizando opciones de conversión...</span>
                        <p className={`text-xs mt-1 ${
                          isDark ? 'text-slate-400' : 'text-gray-600'
                        }`}>Optimizando ruta de conversión con IA</p>
                      </div>
                    </div>
                  </div>
                )}

                {conversionAnalysis && !isAnalyzing && targetFormat && (
                  <div className="space-y-4">
                    <label className="block text-lg font-medium text-white mb-4">
                      Opciones de conversión disponibles:
                    </label>
                    <ConversionOptionsComparison
                      analysis={conversionAnalysis}
                      onOptionSelect={setSelectedConversionOption}
                      selectedOption={selectedConversionOption}
                      onPreview={(option) => {
                        console.log('Preview:', option);
                      }}
                    />
                  </div>
                )}

                {targetFormat && selectedConversionOption && currentStep === 3 && (
                  <div className={`p-4 rounded-lg border ${
                    isDark
                      ? 'bg-slate-800/40 border-slate-700'
                      : 'bg-gray-100/50 border-gray-300'
                  }`}>
                    <div className={`flex justify-between items-center text-sm mb-4 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span>Costo estimado:</span>
                      <span className="text-primary font-bold text-lg">
                        {conversionAnalysis?.[selectedConversionOption]?.cost || 0} créditos
                      </span>
                    </div>
                    <button
                      onClick={handleConvert}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white py-3 px-6 rounded-lg transition-all duration-300 text-button font-medium shadow-lg shadow-primary/20"
                    >
                      🚀 Iniciar Conversión {selectedConversionOption === 'optimized' ? 'Optimizada' : 'Directa'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-slate-800/40' : 'bg-gray-200/60'
                }`}>
                  <Settings size={32} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                </div>
                <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Esperando análisis del archivo...</p>
              </div>
            )}
          </ConversionStep>
        </div>

        {/* Frame 3: Convertir + Descarga (3 columnas) */}
        <div className="lg:col-span-3">
          <ConversionStep
            number={3}
            title="Convertir & Descargar"
            icon="🔄"
            isActive={currentStep === 4}
            isCompleted={currentStep >= 5}
          >
            {currentStep === 4 ? (
              isConverting ? (
                <div className="space-y-4">
                  {/* Progreso de conversión */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                      <Loader size={32} className="text-primary animate-spin" />
                    </div>
                    <h3 className={`text-lg font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>🔄 Convirtiendo...</h3>
                    <p className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>Procesando tu archivo</p>
                  </div>

                  <div className={`w-full rounded-full h-3 ${
                    isDark ? 'bg-slate-700' : 'bg-gray-300'
                  }`}>
                    <div className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full animate-progress"></div>
                  </div>

                  <div className={`text-xs text-center ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Esto puede tomar unos segundos...
                  </div>
                </div>
              ) : error ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                    <X size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">❌ Error en conversión</h3>
                  <p className="text-sm text-red-400 mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                  </p>
                  <button
                    onClick={() => {
                      setError(null);
                      setCurrentStep(3);
                    }}
                    className={`py-2 px-4 rounded-lg transition-colors text-sm font-medium text-white ${
                      isDark
                        ? 'bg-slate-600 hover:bg-slate-500'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    🔄 Intentar nuevamente
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-slate-800/40' : 'bg-gray-200/60'
                  }`}>
                    <ArrowRight size={32} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                  </div>
                  <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Esperando configuración...</p>
                </div>
              )
            ) : currentStep === 5 && conversionResult ? (
              /* Descarga integrada */
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">✅ ¡Conversión completada!</h3>
                  <p className="text-sm text-green-400 mb-4">Tu archivo está listo para descargar</p>
                </div>



                {/* Botón de descarga simplificado */}
                <button
                  onClick={() => handleDownload(
                    `http://localhost:8000/api/conversion/guest-download/${conversionResult.download_id}`,
                    conversionResult.output_filename
                  )}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
                >
                  <Download size={20} />
                  Descargar archivo
                </button>

                {/* Botón para convertir otro archivo */}
                <button
                  onClick={handleReset}
                  className={`w-full py-2 px-4 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300'
                  }`}
                >
                  <RefreshCw size={16} />
                  Convertir otro archivo
                </button>


              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-slate-800/40' : 'bg-gray-200/60'
                }`}>
                  <Settings size={32} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                </div>
                <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Esperando configuración...</p>
              </div>
            )}
          </ConversionStep>
        </div>
      </div>

      {/* Conversiones populares */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Conversiones Populares
          </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Las transformaciones más utilizadas por nuestros usuarios
          </p>
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className={
              isDark ? 'border-slate-700' : 'border-gray-300'
            }>
              <span className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>Actualizado hace 2 días</span>
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