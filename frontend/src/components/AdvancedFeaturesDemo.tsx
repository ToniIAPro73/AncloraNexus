import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, TabsComposition } from './ui';
import { 
  FileUp, Settings, BarChart, FileStack, MessagesSquare, 
  FileSearch, Sliders
} from 'lucide-react';

// Import our new components (corrected imports)
// Note: These components should be updated to import from './ui' instead of './UI'
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
      id: 'format',
      name: 'Formato interno',
      description: 'Formato de codificación interno para el archivo',
      type: 'select' as const,
      default: 'standard',
      options: [
        { value: 'standard', label: 'Estándar' },
        { value: 'progressive', label: 'Progresivo' },
        { value: 'optimized', label: 'Optimizado' }
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
      id: 'smart-crop',
      name: 'Recorte inteligente',
      description: 'Utiliza IA para recortar automáticamente la imagen',
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
      name: 'Tamaño reducido',
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
            Anclora Metaform - Funciones Avanzadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TabsComposition value={activeTab} onChange={setActiveTab} variant="pills" className="w-full">
            <TabsComposition.Tab value="batch" label={<span className="flex items-center"><FileStack className="h-5 w-5 mr-2" />Lote</span>}>
              <div className="max-w-5xl mx-auto">
                <BatchConversion />
              </div>
            </TabsComposition.Tab>
            <TabsComposition.Tab value="settings" label={<span className="flex items-center"><Settings className="h-5 w-5 mr-2" />Configuración</span>}>
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
            </TabsComposition.Tab>
            <TabsComposition.Tab value="analytics" label={<span className="flex items-center"><BarChart className="h-5 w-5 mr-2" />Analítica</span>}>
              <UsageAnalytics userId={demoUser.id} isPremiumUser={demoUser.isPremium} />
            </TabsComposition.Tab>
            <TabsComposition.Tab value="formats" label={<span className="flex items-center"><FileSearch className="h-5 w-5 mr-2" />Formatos</span>}>
              <FormatComparison onSelectFormat={(formatId) => console.log(`Selected format: ${formatId}`)} />
            </TabsComposition.Tab>
            <TabsComposition.Tab value="assistant" label={<span className="flex items-center"><MessagesSquare className="h-5 w-5 mr-2" />Asistente</span>}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Área de Trabajo</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center bg-slate-800/50 rounded border border-dashed border-slate-700">
                      <div className="text-center">
                        <FileUp className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Arrastra archivos aquí para comenzar una conversión</p>
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
            </TabsComposition.Tab>
            <TabsComposition.Tab value="optimization" label={<span className="flex items-center"><Sliders className="h-5 w-5 mr-2" />Optimización</span>}>
              <ConversionOptimization 
                fileName="informe_anual_2023.pdf"
                fileSize={4500000}
                fileType="pdf"
                isPremiumUser={demoUser.isPremium}
                onApplyOptimizations={(settings) => console.log('Applied optimizations:', settings)}
                onDownload={() => console.log('Download optimized file')}
              />
            </TabsComposition.Tab>
          </TabsComposition>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-slate-500">
        <p>
          Anclora Metaform - Plataforma avanzada de conversión de archivos
        </p>
      </div>
    </div>
  );
};

export default AdvancedFeaturesDemo;


