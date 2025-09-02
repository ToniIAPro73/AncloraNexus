import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui';
import { FileUp, Settings, Download } from 'lucide-react';

export const SimpleConversor: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-900 text-white p-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Conversor <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Inteligente</span>
        </h1>
        <p className="text-slate-300">
          Convierte cualquier archivo a múltiples formatos con IA avanzada
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Upload */}
        <div className="lg:col-span-4">
          <Card variant="dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileUp className="mr-2" size={20} />
                Subir Archivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <FileUp size={48} className="mx-auto mb-4 text-blue-400" />
                <p className="text-white mb-2">Arrastra tu archivo aquí</p>
                <p className="text-sm text-slate-400">
                  Formatos soportados: PDF, DOC, JPG, PNG, etc.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Configure */}
        <div className="lg:col-span-5">
          <Card variant="dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2" size={20} />
                Configurar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings size={48} className="mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">Esperando archivo...</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 3: Download */}
        <div className="lg:col-span-3">
          <Card variant="dark">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2" size={20} />
                Descargar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Download size={48} className="mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">Esperando conversión...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">✅ Componente Simple Funcionando</h3>
        <p className="text-green-300 text-sm">
          Este es un componente simplificado del conversor. Si lo ves, significa que React y las dependencias básicas funcionan correctamente.
        </p>
      </div>
    </div>
  );
};