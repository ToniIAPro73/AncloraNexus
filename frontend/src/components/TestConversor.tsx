import React from 'react';

export const TestConversor: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Test Conversor - Funcionando ✅
        </h1>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Estado del Sistema:</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              React funcionando correctamente
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              Tailwind CSS cargado
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              Componente renderizado
            </li>
          </ul>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-300">
            Información de Debug
          </h3>
          <p className="text-blue-200">
            Si ves este mensaje, significa que el sistema está funcionando correctamente.
            El problema anterior podría haber sido un error temporal o de compilación.
          </p>
        </div>
      </div>
    </div>
  );
};