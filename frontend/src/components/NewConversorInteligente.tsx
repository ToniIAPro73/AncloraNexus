// frontend/src/components/NewConversorInteligente.tsx
import React, { useState, useRef, useCallback } from 'react';

interface ConversionStepProps {
  number: number;
  title: string;
  icon: string;
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
}) => (
  <div className={`
    bg-slate-800/40 backdrop-blur-sm rounded-xl border transition-all duration-300
    ${isActive 
      ? 'border-primary shadow-lg shadow-primary/20 scale-105' 
      : isCompleted 
        ? 'border-green-500/50 shadow-lg shadow-green-500/10'
        : 'border-slate-700/50 hover:border-slate-600/50'
    }
  `}>
    {/* Header de la tarjeta */}
    <div className="p-4 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all
            ${isCompleted 
              ? 'bg-green-500 text-white' 
              : isActive 
                ? 'bg-primary text-white' 
                : 'bg-slate-700 text-gray-400'
            }
          `}>
            {isCompleted ? '✓' : number}
          </div>
          <div className="ml-3">
            <h3 className="text-white font-semibold">{title}</h3>
            <div className="flex items-center mt-1">
              <span className="text-2xl mr-2">{icon}</span>
              {isCompleted && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                  Completado
                </span>
              )}
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
              : 'bg-slate-600'
          }
        `} />
      </div>
    </div>

    {/* Contenido de la tarjeta */}
    <div className="p-4">
      {children}
    </div>
  </div>
);

interface PopularConversionProps {
  from: string;
  to: string;
  fromIcon: string;
  toIcon: string;
  cost: number;
  onClick: () => void;
}

const PopularConversion: React.FC<PopularConversionProps> = ({
  from,
  to,
  fromIcon,
  toIcon,
  cost,
  onClick
}) => (
  <div 
    className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-slate-700/40 transition-all duration-200 border border-slate-700/50 hover:border-primary/50 group"
    onClick={onClick}
  >
    <div className="flex items-center justify-center mb-3">
      <div className="flex items-center">
        <span className="text-2xl">{fromIcon}</span>
        <svg className="w-4 h-4 text-gray-400 mx-2 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <span className="text-2xl">{toIcon}</span>
      </div>
    </div>
    <div className="text-center">
      <h4 className="font-medium text-white text-sm">{from} → {to}</h4>
      <p className="text-xs text-gray-400 mt-1">{cost} créditos</p>
    </div>
  </div>
);

export const NewConversorInteligente: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setCurrentStep(2);
    
    // Simular análisis
    setTimeout(() => {
      setAnalysisComplete(true);
      setCurrentStep(3);
    }, 2000);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleConvert = useCallback(() => {
    if (!selectedFile || !targetFormat) return;
    setIsConverting(true);
    setCurrentStep(4);
    
    // Simular conversión
    setTimeout(() => {
      setIsConverting(false);
    }, 3000);
  }, [selectedFile, targetFormat]);

  const popularConversions = [
    { from: 'PDF', to: 'JPG', fromIcon: '📄', toIcon: '🖼️', cost: 2 },
    { from: 'JPG', to: 'PNG', fromIcon: '🖼️', toIcon: '🎨', cost: 1 },
    { from: 'MP4', to: 'GIF', fromIcon: '🎬', toIcon: '🎞️', cost: 5 },
    { from: 'PNG', to: 'SVG', fromIcon: '🖼️', toIcon: '📐', cost: 3 },
    { from: 'DOC', to: 'PDF', fromIcon: '📝', toIcon: '📄', cost: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header principal */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-2xl">
            🎯
          </div>
          <h1 className="text-3xl font-bold text-white ml-4">Conversor Inteligente</h1>
        </div>
        <p className="text-gray-300 text-lg">
          Convierte archivos con inteligencia artificial avanzada
        </p>
      </div>

      {/* Indicador de progreso */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step, index) => (
            <React.Fragment key={step}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${currentStep > step 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-700 text-gray-400'
                }
              `}>
                {currentStep > step ? '✓' : step}
              </div>
              {index < 3 && (
                <div className={`
                  w-12 h-1 rounded-full transition-all
                  ${currentStep > step ? 'bg-green-500' : 'bg-slate-700'}
                `} />
              )}
            </React.Fragment>
          ))}
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
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <div className="text-4xl mb-3">📁</div>
              <p className="text-gray-300 text-sm mb-3">
                Arrastra tu archivo aquí<br />o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500">
                Formatos soportados: TXT, PDF, DOC, HTML, MD
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="text-sm">
              <p className="text-gray-400 mb-2">Archivo seleccionado:</p>
              <p className="font-medium text-white truncate">{selectedFile?.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
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
                    className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
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
              <div className="text-center py-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-300 text-sm">Procesando...</p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="text-4xl mb-3">🎉</div>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium mb-2">
                  Descargar Archivo
                </button>
                <p className="text-xs text-gray-400">
                  Conversión completada
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
      <div className="mt-12">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-xl">
            🚀
          </div>
          <h2 className="text-2xl font-bold text-white ml-3">Conversiones Populares</h2>
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

