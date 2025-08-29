// frontend/src/components/NewConversorInteligente.tsx
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, FileUpload, StepProgress, Progress } from './ui';
import { 
  FileUp, FileBarChart, Settings, Download, ArrowRight, Check, Loader
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
  const stepVariant = isActive ? 'primary' : isCompleted ? 'secondary' : 'dark';
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
  // Simplified file handling using our FileUpload component
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setCurrentStep(2);
    
    // Simular análisis
    setTimeout(() => {
      setCurrentStep(3);
    }, 2000);
  }, []);

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
          icon="⬇️"
          isActive={currentStep === 4}
          isCompleted={!isConverting && currentStep === 4}
        >
          {currentStep === 4 ? (
            isConverting ? (
              <div className="text-center py-4 animate-in fade-in duration-300">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader size={24} className="text-primary animate-spin" />
                    </div>
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle 
                        className="text-slate-700 stroke-current" 
                        strokeWidth="10" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50"
                      />
                      <circle 
                        className="text-primary stroke-current animate-progress" 
                        strokeWidth="10" 
                        strokeDasharray={60 * 2.51} 
                        strokeDashoffset={60 * 2.51 * (1 - 0.6)} 
                        strokeLinecap="round" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50"
                      />
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-slate-300 font-medium">Procesando archivo...</p>
                    <Progress value={60} className="w-full" />
                    <p className="text-xs text-slate-400">Tiempo estimado: 20 segundos</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 animate-in fade-in slide-in-from-bottom duration-300">
                <div className="inline-flex items-center justify-center p-1 rounded-full bg-green-500/20 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Check size={24} className="text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-white mb-4">¡Conversión completada!</h3>
                
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 font-medium flex items-center justify-center space-x-2">
                  <Download size={18} />
                  <span>Descargar Archivo</span>
                </button>
                
                <p className="text-xs text-slate-400 mt-3">
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

      {/* Conversiones Populares */}
      <div className="mt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Settings size={24} className="text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">Conversiones Populares</h2>
              <p className="text-slate-400 text-sm">Las transformaciones más utilizadas por nuestros usuarios</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="bg-gradient-to-r from-amber-500 to-orange-600">
              Nuevo
            </Badge>
            <span className="text-slate-400 text-sm">Actualizado hace 2 días</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {popularConversions.map((conversion, index) => (
            <PopularConversion
              key={index}
              from={conversion.from}
              to={conversion.to}
              fromIcon={conversion.fromIcon}
              toIcon={conversion.toIcon}
              cost={conversion.cost}
              popular={conversion.popular}
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

