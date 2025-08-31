import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

// Import our new components (corrected imports)
// Note: These components should be updated to import from './ui' instead of './UI'
// import { BatchConversion } from './BatchConversion';
// import { BatchConversion } from './ui/BatchConversion';
// import { BatchConversion } from './ui/BatchConversion';
import { BatchConversion } from './BatchConversion';
import { AdvancedSettings } from './AdvancedSettings';
import { UsageAnalytics } from './UsageAnalytics';
import { FormatComparison } from './FormatComparison';
import { ConversionAssistant } from './ConversionAssistant';
import { ConversionOptimization } from './ConversionOptimization';

export const AdvancedFeaturesDemo = () => {
  const [activeTab, setActiveTab] = useState('batch');
  
  // Dummy data for demonstration
  const demoUser = {
    id: 'user-123',
    name: 'Ana García',
    email: 'ana@example.com',
    isPremium: true
  };
  
  // Sample settings for Advanced Settings component
  const conversionSettings = [
    {
      id: 'quality',
      name: 'Calidad',
      description: 'Define la calidad del archivo resultante',
      type: 'slider' as const,
      default: 80,
      min: 0,
      max: 100,
      step: 1,
      unit: '%'
    },
    {
      id: 'compression',
      name: 'Compresión',
      description: 'Nivel de compresión a aplicar',
      type: 'slider' as const,
      default: 70,
      min: 0,
      max: 100,
      step: 1,
      unit: '%'
    },
    {
      id: 'encoding',
      name: 'Codificación',
      description: 'Formato de codificación interno para el archivo',
      type: 'select' as const,
      default: 'standard',
      options: [
        { value: 'standard', label: 'Estándar' },
        { value: 'high', label: 'Alta' },
        { value: 'lossless', label: 'Sin pérdida' }
      ]
    },
    {
      id: 'metadata',
      name: 'Conservar Metadatos',
      description: 'Mantiene la información de metadatos del archivo original',
      type: 'toggle' as const,
      default: true
    },
    {
      id: 'autocrop',
      name: 'Recorte Inteligente',
      description: 'Utiliza IA para recortar automáticamente la imagen',
      type: 'toggle' as const,
      default: false
    }
  ];
  
  // Sample conversion presets
  const conversionPresets = [
    {
      id: 'web-optimized',
      name: 'Web Optimizado',
      description: 'Ideal para subir a sitios web',
      settings: {
        quality: 75,
        compression: 80,
        encoding: 'standard',
        metadata: false,
        autocrop: false
      }
    },
    {
      id: 'small-size',
      name: 'Tamaño reducido',
      description: 'Máxima compresión para ahorrar espacio',
      settings: {
        quality: 60,
        compression: 90,
        encoding: 'high',
        metadata: false,
        autocrop: true
      }
    },
    {
      id: 'high-quality',
      name: 'Alta calidad',
      description: 'Preserva la calidad original',
      settings: {
        quality: 95,
        compression: 30,
        encoding: 'lossless',
        metadata: true,
        autocrop: false
      }
    }
  ];
  
  // Render the appropriate component based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'batch':
        return <BatchConversion />;
      case 'settings':
        return <AdvancedSettings settings={conversionSettings} presets={conversionPresets} />;
      case 'analytics':
        return <UsageAnalytics userId={demoUser.id} />;
      case 'formats':
        return <FormatComparison />;
      case 'assistant':
        return <ConversionAssistant />;
      case 'optimization':
        return <ConversionOptimization />;
      default:
        return <BatchConversion />;
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Panel de Control Avanzado</h1>
            <p className="text-slate-500 dark:text-slate-400">Herramientas avanzadas para conversión de archivos</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
              Premium
            </Badge>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <Card>
              <CardContent className="p-2">
                <div className="space-y-1 py-2">
                  <Button 
                    variant={activeTab === 'batch' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('batch')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
                    </svg>
                    <span>Procesamiento por lotes</span>
                  </Button>
                  <Button 
                    variant={activeTab === 'settings' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('settings')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    <span>Configuración</span>
                  </Button>
                  <Button 
                    variant={activeTab === 'analytics' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('analytics')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 20V10M12 20V4M6 20v-6"/>
                    </svg>
                    <span>Analítica</span>
                  </Button>
                  <Button 
                    variant={activeTab === 'formats' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('formats')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                    <span>Formatos</span>
                  </Button>
                  <Button 
                    variant={activeTab === 'optimization' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('optimization')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                      <line x1="12" y1="2" x2="12" y2="12"/>
                    </svg>
                    <span>Optimización</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Área de Trabajo</CardTitle>
                <CardDescription>
                  {activeTab === 'batch' && 'Convierte múltiples archivos simultáneamente'}
                  {activeTab === 'settings' && 'Personaliza las opciones de conversión'}
                  {activeTab === 'analytics' && 'Analiza tu uso y estadísticas'}
                  {activeTab === 'formats' && 'Compara diferentes formatos de archivo'}
                  {activeTab === 'assistant' && 'Asistente inteligente de conversión'}
                  {activeTab === 'optimization' && 'Optimiza tus archivos automáticamente'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTab === 'batch' && (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <div className="text-center">
                      <p className="text-slate-400">Arrastra archivos aquí para comenzar una conversión</p>
                      <Button className="mt-4">Seleccionar archivos</Button>
                    </div>
                  </div>
                )}
                
                {renderTabContent()}
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Anclora Nexus - Plataforma avanzada de conversión de archivos
                </p>
                <Button variant="outline" size="sm">
                  Ayuda
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};