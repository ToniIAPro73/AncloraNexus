// frontend/src/components/UniversalConverter.tsx
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { apiService, getConversionCost, formatFileSize } from '../services/api';
import { useAuth } from '../auth/AuthContext';

// Componente de paso de conversión
const ConversionStep: React.FC<{
  number: number;
  isActive: boolean;
  isCompleted: boolean;
}> = ({ number, isActive, isCompleted }) => (
  <div className="flex flex-col items-center">
    <div 
      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
        isCompleted 
          ? 'bg-success text-white' 
          : isActive 
            ? 'bg-primary text-white' 
            : 'bg-neutral-700 text-neutral-600'
      }`}
    >
      {number}
    </div>
    <div className={`h-1 w-24 ${isCompleted ? 'bg-success' : 'bg-neutral-700'}`}></div>
  </div>
);

// Componente de tarjeta de conversión
const ConversionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  isCompleted?: boolean;
}> = ({ icon, title, children, isActive, isCompleted }) => (
  <div className={`bg-neutral-800/80 rounded-lg p-5 transition-all ${
    isActive ? 'border-2 border-primary shadow-lg' : 'border border-neutral-700/50'
  }`}>
    <div className="flex items-center mb-3">
      <div className="text-3xl mr-3">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      {isCompleted && (
        <div className="ml-auto bg-success/20 text-success text-xs font-semibold px-2 py-1 rounded-full">
          ✓ Completado
        </div>
      )}
    </div>
    <div>{children}</div>
  </div>
);

// Componente de conversión popular
const PopularConversion: React.FC<{
  from: string;
  to: string;
  icon: string;
  cost: number;
  onClick: () => void;
}> = ({ from, to, icon, cost, onClick }) => (
  <div 
    className="bg-neutral-800/80 rounded-lg p-4 cursor-pointer hover:bg-neutral-700/80 transition-all"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="text-3xl mr-3">{icon}</div>
      <div className="flex-1">
        <h4 className="font-medium">{from} → {to}</h4>
        <p className="text-xs text-neutral-600">{cost} créditos</p>
      </div>
    </div>
  </div>
);

export const UniversalConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Memoized popular conversions
  const popularConversions = useMemo(() => [
    { from: 'PDF', to: 'JPG', icon: '📄 → 🖼️', cost: 2 },
    { from: 'JPG', to: 'PNG', icon: '🖼️ → 🎨', cost: 1 },
    { from: 'MP4', to: 'GIF', icon: '🎬 → 🎞️', cost: 5 },
    { from: 'PNG', to: 'SVG', icon: '🖼️ → 📐', cost: 3 },
    { from: 'DOC', to: 'PDF', icon: '📝 → 📄', cost: 2 },
  ], []);

  // Optimized file selection handler
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setCurrentStep(2);
    setError('');
    
    // Simulación de análisis completado
    setTimeout(() => {
      setCurrentStep(3);
    }, 1500);
  }, []);

  // Optimized drag and drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Optimized file input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Optimized convert handler
  const handleConvert = useCallback(() => {
    if (!selectedFile || !targetFormat) return;
    setIsConverting(true);
    setCurrentStep(4);
    
    // Simulación de conversión completada
    setTimeout(() => {
      setIsConverting(false);
    }, 2000);
  }, [selectedFile, targetFormat]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-2">
          <div className="text-3xl mr-3">🎯</div>
          <h1 className="text-3xl font-bold">Conversor Inteligente</h1>
        </div>
        <p className="text-neutral-200">Convierte archivos con inteligencia artificial avanzada</p>
      </div>

      {/* Pasos de conversión */}
      <div className="flex justify-center space-x-4 mb-8">
        <ConversionStep number={1} isActive={currentStep === 1} isCompleted={currentStep > 1} />
        <ConversionStep number={2} isActive={currentStep === 2} isCompleted={currentStep > 2} />
        <ConversionStep number={3} isActive={currentStep === 3} isCompleted={currentStep > 3} />
        <ConversionStep number={4} isActive={currentStep === 4} isCompleted={false} />
      </div>

      {/* Tarjetas de conversión */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paso 1: Subir Archivo */}
        <ConversionCard 
          icon="📂" 
          title="Subir Archivo" 
          isActive={currentStep === 1}
          isCompleted={currentStep > 1}
        >
          {currentStep === 1 ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <p className="text-neutral-200 text-sm mb-2">
                Arrastra tu archivo aquí<br />o haz clic para seleccionar
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
              <p className="text-neutral-600">Archivo seleccionado:</p>
              <p className="font-medium truncate">{selectedFile?.name}</p>
              <p className="text-xs text-neutral-600">{selectedFile && formatFileSize(selectedFile.size)}</p>
            </div>
          )}
        </ConversionCard>

        {/* Paso 2: Análisis IA */}
        <ConversionCard 
          icon="🤖" 
          title="Análisis IA" 
          isActive={currentStep === 2}
          isCompleted={currentStep > 2}
        >
          {currentStep === 2 ? (
            <div className="text-center py-2">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-neutral-200 text-sm">Analizando archivo...</p>
            </div>
          ) : currentStep > 2 ? (
            <div className="text-sm">
              <p className="text-neutral-600">Análisis completado</p>
              <div className="mt-2 bg-success/10 text-success text-xs p-2 rounded">
                ✓ Archivo analizado correctamente
              </div>
            </div>
          ) : (
            <div className="text-sm text-neutral-600">
              Esperando archivo...
            </div>
          )}
        </ConversionCard>

        {/* Paso 3: Configurar */}
        <ConversionCard 
          icon="⚙️" 
          title="Configurar" 
          isActive={currentStep === 3}
          isCompleted={currentStep > 3}
        >
          {currentStep >= 3 ? (
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Formato de salida</label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-700 rounded-md p-2 text-white"
                disabled={currentStep > 3}
              >
                <option value="">Seleccionar formato</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="pdf">PDF</option>
                <option value="gif">GIF</option>
              </select>
              
              {targetFormat && currentStep === 3 && (
                <div className="mt-3">
                  <p className="text-xs text-neutral-600 mb-2">Costo: 0 créditos</p>
                  <button
                    onClick={handleConvert}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md transition-colors"
                  >
                    Iniciar Conversión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-neutral-600">
              Esperando análisis...
            </div>
          )}
        </ConversionCard>

        {/* Paso 4: Descargar */}
        <ConversionCard 
          icon="⬇️" 
          title="Descargar" 
          isActive={currentStep === 4}
          isCompleted={currentStep > 4}
        >
          {currentStep === 4 ? (
            isConverting ? (
              <div className="text-center py-2">
                <div className="animate-pulse w-8 h-8 bg-primary rounded-full mx-auto mb-2"></div>
                <p className="text-neutral-200 text-sm">Procesando...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-2">
                  <span className="text-3xl">🎉</span>
                </div>
                <button className="bg-success hover:bg-success/80 text-white py-2 px-4 rounded-md transition-colors">
                  Descargar Archivo
                </button>
                <p className="text-xs text-neutral-600 mt-2">
                  Descarga pendiente
                </p>
              </div>
            )
          ) : (
            <div className="text-sm text-neutral-600">
              Esperando conversión...
            </div>
          )}
        </ConversionCard>
      </div>

      {/* Conversiones Populares */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="text-2xl mr-2">🚀</span>
          Conversiones Populares
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {popularConversions.map((conversion, index) => (
            <PopularConversion
              key={index}
              from={conversion.from}
              to={conversion.to}
              icon={conversion.icon}
              cost={conversion.cost}
              onClick={() => {
                // Lógica para iniciar una conversión popular
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
