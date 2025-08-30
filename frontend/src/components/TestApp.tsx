import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ðŸŽ‰ Anclora Nexus
        </h1>
        <p className="text-xl text-blue-200 mb-8">
          Tu Contenido, Reinventado
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-white mb-3">
            âœ… Sistema Funcionando
          </h2>
          <div className="space-y-2 text-sm text-gray-300">
            <div>âœ… Frontend: Activo</div>
            <div>âœ… Backend: Activo</div>
            <div>âœ… React: Cargado</div>
            <div>âœ… Tailwind CSS: Funcionando</div>
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
            Comenzar a Convertir
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestApp;

