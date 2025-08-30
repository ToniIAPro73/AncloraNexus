import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { 
  FileUp, Settings, BarChart, FileStack, MessagesSquare, 
  FileSearch, Sliders
} from 'lucide-react';

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
    name: 'Ana GarcÃ­a',
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
      name: 'CompresiÃ³n',
      description: 'Nivel de compresiÃ³n a aplicar',
      type: 'slider' as const,
      default: 70,
      min: 0,
      max: 100,
      step: 1,
      unit: '%'
    },
    {
      id: 'format',
      name: 'Formato interno',
      description: 'Formato de codificaciÃ³n interno para el archivo',
      type: 'select' as const,
      default: 'standard',
      options: [
        { value: 'standard', label: 'EstÃ¡ndar' },
        { value: 'progressive', label: 'Progresivo' },
        { value: 'optimized', label: 'Optimizado' }
      ]
    },
    {
      id: 'metadata',
      name: 'Conservar Metadatos',
      description: 'Mantiene la informaciÃ³n de metadatos del archivo original',
      type: 'toggle' as const,
      default: true
    },
    {
      id: 'smart-crop',
      name: 'Recorte inteligente',
      description: 'Utiliza IA para recortar automÃ¡ticamente la imagen',
      type: 'toggle' as const,
      default: false,
      isPremium: true
    }
  ];
  
  // Sample presets for Advanced Settings
  const conversionPresets = [
    {
      id: 'high-quality',
      name: 'Alta calidad',
      settings: {
        quality: 95,
        compression: 40,
        format: 'standard',
        metadata: true
      }
    },
    {
      id: 'balanced',
      name: 'Equilibrado',
      settings: {
        quality: 80,
        compression: 70,
        format: 'optimized',
        metadata: true
      }
    },
    {
      id: 'small-size',
      name: 'TamaÃ±o reducido',
      settings: {
        quality: 60,
        compression: 90,
        format: 'progressive',
        metadata: false
      }
    }
  ];
  
  // Handlers for component events
  const handleApplySettings = (settings: Record<string, any>) => {
    console.log('Applied settings:', settings);
  };
  
  const handleSavePreset = (name: string, settings: Record<string, any>) => {
    console.log('Saved preset:', name, settings);
  };
  
  const handleSelectPreset = (presetId: string) => {
    console.log('Selected preset:', presetId);
  };
  
  const handleRequestConversion = (from: string, to: string) => {
    console.log(`Requested conversion from ${from} to ${to}`);
  };
  
  const handleRequestFormatInfo = (format: string) => {
    console.log(`Requested info about ${format} format`);
    setActiveTab('formats');
  };
  
  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Anclora Nexus - Funciones Avanzadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
              <TabsTrigger value="batch" className="flex flex-col items-center py-2">
                <FileStack className="h-5 w-5 mb-1" />
                <span>Lote</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col items-center py-2">
                <Settings className="h-5 w-5 mb-1" />
                <span>ConfiguraciÃ³n</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex flex-col items-center py-2">
                <BarChart className="h-5 w-5 mb-1" />
                <span>AnalÃ­tica</span>
              </TabsTrigger>
              <TabsTrigger value="formats" className="flex flex-col items-center py-2">
                <FileSearch className="h-5 w-5 mb-1" />
                <span>Formatos</span>
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex flex-col items-center py-2">
                <MessagesSquare className="h-5 w-5 mb-1" />
                <span>Asistente</span>
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex flex-col items-center py-2">
                <Sliders className="h-5 w-5 mb-1" />
                <span>OptimizaciÃ³n</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="batch" className="mt-4">
              <div className="max-w-5xl mx-auto">
                <BatchConversion />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <div className="max-w-5xl mx-auto">
                <AdvancedSettings 
                  formatFrom="PDF"
                  formatTo="DOCX"
                  settings={conversionSettings}
                  onChange={handleApplySettings}
                  isPremiumUser={demoUser.isPremium}
                  onSavePreset={handleSavePreset}
                  presets={conversionPresets}
                  onSelectPreset={handleSelectPreset}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-4">
              <UsageAnalytics 
                isPremiumUser={demoUser.isPremium}
              />
            </TabsContent>
            
            <TabsContent value="formats" className="mt-4">
              <FormatComparison 
                onSelectFormat={(formatId) => console.log(`Selected format: ${formatId}`)}
              />
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Ãrea de Trabajo</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center bg-slate-800/50 rounded border border-dashed border-slate-700">
                      <div className="text-center">
                        <FileUp className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Arrastra archivos aquÃ­ para comenzar una conversiÃ³n</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="h-[550px]">
                  <ConversionAssistant 
                    userName={demoUser.name}
                    onRequestConversion={handleRequestConversion}
                    onRequestFormatInfo={handleRequestFormatInfo}
                    isPremium={demoUser.isPremium}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="optimization" className="mt-4">
              <ConversionOptimization 
                fileName="informe_anual_2023.pdf"
                fileSize={4500000}
                fileType="pdf"
                isPremiumUser={demoUser.isPremium}
                onApplyOptimizations={(settings) => console.log('Applied optimizations:', settings)}
                onDownload={() => console.log('Download optimized file')}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-slate-500">
        <p>
          Anclora Nexus - Plataforma avanzada de conversiÃ³n de archivos
        </p>
      </div>
    </div>
  );
};

export default AdvancedFeaturesDemo;

