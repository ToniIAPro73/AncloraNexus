import { useState } from 'react';
import { Card, TabsComposition } from './ui';
// ensure TabsComposition import through barrel
import { useNotifications, BatchOperationNotification, PremiumFeatureNotification } from './NotificationSystem';
import { BatchConversion } from './BatchConversion';
import { AdvancedSettings } from './AdvancedSettings';
import { FormatComparison } from './FormatComparison';
import { ConversionOptimization } from './ConversionOptimization';
import { UsageAnalytics } from './UsageAnalytics';
import { ConversionAssistant } from './ConversionAssistant';
import { FileUp, Settings, BarChart2, Zap, MessageSquare, LayoutGrid } from 'lucide-react';

interface FileWithStatus {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  targetFormat?: string;
  resultUrl?: string;
  error?: string;
}

interface OptimizationOptions {
  quality: number;
  compress: boolean;
}

export const AdvancedFeaturesWithNotifications = () => {
  const [activeTab, setActiveTab] = useState('batch');
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  const {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyFileConversion,
    notifyProgress,
    updateNotification,
  } = useNotifications();

  const handleFilesAdded = (newFiles: File[]) => {
    const processedFiles = newFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      name: file.name,
      size: file.size,
      type: file.type.split('/')[1] || file.name.split('.').pop() || '',
      status: 'pending' as const,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...processedFiles]);
    notifySuccess(`${newFiles.length} archivos añadidos`, `Se han añadido ${newFiles.length} archivos a la cola de conversión`);
    return processedFiles;
  };

  const processFiles = async (batchFiles: FileWithStatus[], targetFormat: string) => {
    let completedCount = 0;
    let failedCount = 0;
    const notificationId = notifyProgress(`Procesando lote de ${batchFiles.length} archivos`, 0);

    for (const file of batchFiles) {
      try {
        const fileNotifId = notifyFileConversion({ status: 'started', fileName: file.name, fileType: file.type, targetType: targetFormat });

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress > 100) progress = 100;

          updateNotification(fileNotifId, { title: `Convirtiendo ${file.name}`, message: `${Math.floor(progress)}% completado`, progress: Math.floor(progress) });
          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress: Math.floor(progress), status: 'processing' } : f)));

          if (progress >= 100) {
            clearInterval(interval);
            const success = Math.random() > 0.1;
            if (success) {
              completedCount++;
              setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: 'completed', progress: 100, resultUrl: `https://example.com/converted/${file.name}.${targetFormat}`, targetFormat } : f)));
              notifyFileConversion({ status: 'completed', fileName: file.name, fileType: file.type, targetType: targetFormat });
            } else {
              failedCount++;
              setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: 'failed', progress: 100, error: 'Error en la conversión del archivo' } : f)));
              notifyFileConversion({ status: 'error', fileName: file.name, fileType: file.type, targetType: targetFormat, errorMessage: 'Error en la conversión del archivo' });
            }

            const totalProgress = Math.floor(((completedCount + failedCount) / batchFiles.length) * 100);
            updateNotification(notificationId, { title: `Procesando lote de ${batchFiles.length} archivos`, message: `${completedCount + failedCount} de ${batchFiles.length} completados`, progress: totalProgress });
          }
        }, 500);
      } catch (e) {
        failedCount++;
        notifyError('Error en el procesamiento', `Error al procesar ${file.name}`);
      }
    }
  };

  const handlePremiumFeature = (featureName: string) => {
    if (!isPremium) {
      notifyInfo('Función Premium', `La función ${featureName} requiere una cuenta premium`, {
        actions: [
          {
            label: 'Actualizar',
            onClick: () => setIsPremium(true),
          },
        ],
      });
      return false;
    }
    return true;
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <TabsComposition value={activeTab} onChange={setActiveTab} className="w-full">
          <TabsComposition.Tab value="batch" label={<span className="flex items-center"><FileUp className="mr-2 h-4 w-4" />Conversión por Lotes</span>}>
            <div className="p-6">
              <BatchConversion
                onFilesAdded={handleFilesAdded}
                onConvert={(selectedFiles: string[], targetFormat: string) => {
                  processFiles(selectedFiles.map((id) => files.find((f) => f.id === id)!).filter(Boolean) as FileWithStatus[], targetFormat);
                }}
                files={files}
              />
            </div>
          </TabsComposition.Tab>

          <TabsComposition.Tab value="settings" label={<span className="flex items-center"><Settings className="mr-2 h-4 w-4" />Ajustes Avanzados</span>}>
            <div className="p-6">
              <AdvancedSettings
                formatFrom="PDF"
                formatTo="DOCX"
                settings={[{ id: 'quality', name: 'Calidad', description: 'Calidad de salida', type: 'slider', default: 80, min: 0, max: 100, step: 1, unit: '%' }]}
                onChange={() => notifySuccess('Ajustes aplicados', 'Los ajustes de conversión han sido actualizados')}
                isPremiumUser={isPremium}
                onSavePreset={() => {}}
                presets={[]}
                onSelectPreset={() => {}}
              />
            </div>
          </TabsComposition.Tab>

          <TabsComposition.Tab value="analytics" label={<span className="flex items-center"><BarChart2 className="mr-2 h-4 w-4" />Analíticas</span>}>
            <div className="p-6">
              {handlePremiumFeature('Analíticas de uso') && <UsageAnalytics isPremiumUser={isPremium} />}
              {!isPremium && (
                <div className="mt-4">
                  <PremiumFeatureNotification
                    featureName="Analíticas de uso"
                    description="Accede a estadísticas detalladas sobre tus conversiones y optimiza tu flujo de trabajo."
                    onUpgrade={() => setIsPremium(true)}
                    onDismiss={() => setActiveTab('batch')}
                  />
                </div>
              )}
            </div>
          </TabsComposition.Tab>

          <TabsComposition.Tab value="formats" label={<span className="flex items-center"><LayoutGrid className="mr-2 h-4 w-4" />Comparar Formatos</span>}>
            <div className="p-6">
              <FormatComparison />
            </div>
          </TabsComposition.Tab>

          <TabsComposition.Tab value="assistant" label={<span className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Asistente</span>}>
            <div className="p-6">
              {handlePremiumFeature('Asistente de conversión') && <ConversionAssistant />}
              {!isPremium && (
                <div className="mt-4">
                  <PremiumFeatureNotification
                    featureName="Asistente de conversión"
                    description="Obtén recomendaciones inteligentes para optimizar tus conversiones."
                    onUpgrade={() => setIsPremium(true)}
                    onDismiss={() => setActiveTab('batch')}
                  />
                </div>
              )}
            </div>
          </TabsComposition.Tab>

          <TabsComposition.Tab value="optimization" label={<span className="flex items-center"><Zap className="mr-2 h-4 w-4" />Optimización</span>}>
            <div className="p-6">
              <ConversionOptimization
                onApplyOptimizations={(options: OptimizationOptions) => {
                  notifyInfo('Optimización iniciada', `Optimizando archivo según configuración: ${options.quality}% calidad, ${options.compress ? 'con' : 'sin'} compresión`);
                  const file = files.find((f) => f.status === 'completed');
                  if (file) {
                    const optNotifId = notifyProgress(`Optimizando ${file.name}`, 0);
                    let progress = 0;
                    const interval = setInterval(() => {
                      progress += 10;
                      if (progress > 100) {
                        clearInterval(interval);
                        notifySuccess('Optimización completada', `${file.name} ha sido optimizado con éxito`);
                        return;
                      }
                      updateNotification(optNotifId, { title: `Optimizando ${file.name}`, message: `${progress}% completado`, progress });
                    }, 500);
                  }
                }}
              />
            </div>
          </TabsComposition.Tab>
        </TabsComposition>
      </Card>

      {files.length > 0 && activeTab !== 'batch' && (
        <div className="fixed bottom-4 right-4 w-80">
          <BatchOperationNotification
            title={`Conversión de ${files.length} archivos`}
            totalItems={files.length}
            completedItems={files.filter((f) => f.status === 'completed').length}
            failedItems={files.filter((f) => f.status === 'failed').length}
            onViewDetails={() => setActiveTab('batch')}
            onDismiss={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default AdvancedFeaturesWithNotifications;
