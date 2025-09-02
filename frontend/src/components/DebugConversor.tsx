import React, { useState } from 'react';

export const DebugConversor: React.FC = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Debug Conversor - Paso {step}
        </h1>
        
        <div className="space-y-6">
          {/* Paso 1: Subir archivo */}
          {step === 1 && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Paso 1: Subir Archivo</h2>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <p className="text-white mb-4">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                <button 
                  onClick={() => setStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Simular subida de archivo
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Análisis */}
          {step === 2 && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Paso 2: Análisis IA</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <span className="text-white">Analizando archivo...</span>
              </div>
              <button 
                onClick={() => setStep(3)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Completar análisis
              </button>
            </div>
          )}

          {/* Paso 3: Configuración */}
          {step === 3 && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Paso 3: Configuración</h2>
              
              {/* Selector de formato simple */}
              <div className="mb-6">
                <label className="block text-white mb-2">Formato de salida:</label>
                <select className="bg-slate-700 text-white p-2 rounded border border-slate-600">
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              {/* Mensaje de conversión óptima */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 text-xl">ℹ️</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-300 mb-2">
                      🎯 Conversión Óptima Detectada
                    </h4>
                    <p className="text-blue-200 mb-3">
                      La conversión directa es la opción óptima para esta combinación de formatos.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Iniciando conversión automáticamente...</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(4)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                Iniciar conversión
              </button>
            </div>
          )}

          {/* Paso 4: Conversión */}
          {step === 4 && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Paso 4: Convirtiendo</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                <span className="text-white">Convirtiendo archivo...</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <button 
                onClick={() => setStep(5)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg mt-4"
              >
                Completar conversión
              </button>
            </div>
          )}

          {/* Paso 5: Descarga */}
          {step === 5 && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Paso 5: ¡Listo!</h2>
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-white mb-4">Conversión completada exitosamente</p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg mr-4">
                  Descargar archivo
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Convertir otro archivo
                </button>
              </div>
            </div>
          )}

          {/* Navegación de pasos */}
          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setStep(num)}
                className={`w-8 h-8 rounded-full ${
                  step === num 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Estado de debug */}
        <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-2">✅ Debug Info</h3>
          <p className="text-green-300 text-sm">
            Componente funcionando correctamente. Paso actual: {step}
          </p>
        </div>
      </div>
    </div>
  );
};