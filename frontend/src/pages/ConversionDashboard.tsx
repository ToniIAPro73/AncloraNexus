import { useState } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useFileConversions } from '../hooks/useFileConversions';
import { ToastProvider } from '../components/ui';
import { ConversionOptions } from '../services/ConversionService';

// Componente para la página principal de conversión
export function ConversionDashboard() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [options, setOptions] = useState<ConversionOptions>({
    quality: 90,
    compress: true,
    preserveMetadata: true
  });
  
  const { user } = useAuth();
  const userPlan: 'free' | 'premium' | 'business' =
    user?.plan === 'premium' || user?.plan === 'business' || user?.plan === 'free'
      ? user.plan
      : 'free';
  const { 
    files, 
    batches, 
    convertFile, 
    convertBatch, 
    retryConversion, 
    cancelConversion, 
    removeFile, 
    clearCompleted 
  } = useFileConversions();
  
  // Manejador de selección de archivos
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  // Iniciar conversión de un archivo
  const handleConvertSingleFile = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      const file = selectedFiles[0];
      await convertFile(file, targetFormat, options);
      
      // Remover el archivo convertido de la lista de seleccionados
      setSelectedFiles(prev => prev.filter(f => f !== file));
    } catch (error) {
      console.error("Error en la conversión:", error);
    }
  };
  
  // Iniciar conversión por lotes
  const handleBatchConversion = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await convertBatch(selectedFiles, targetFormat, options);
      
      // Limpiar la lista de seleccionados después de iniciar el lote
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error en la conversión por lotes:", error);
    }
  };
  
  // Cambiar opciones de conversión
  const updateOption = (key: keyof ConversionOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header onMenuToggle={() => {}} userPlan={userPlan} />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Conversión de Archivos</h1>
            
            {/* Sección de carga de archivos */}
            <Card className="mb-6 p-6">
              <h2 className="text-xl font-semibold mb-4">Selecciona archivos para convertir</h2>
              
              <div className="mb-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelection}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="bg-accent/50 rounded-md px-3 py-1 text-sm flex items-center gap-2"
                  >
                    <span>{file.name}</span>
                    <button 
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Formato destino</label>
                      <select
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2"
                      >
                        <option value="pdf">PDF</option>
                        <option value="docx">DOCX</option>
                        <option value="jpg">JPG</option>
                        <option value="png">PNG</option>
                        <option value="txt">TXT</option>
                        <option value="epub">EPUB</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Calidad</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={options.quality || 90}
                        onChange={(e) => updateOption('quality', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Baja</span>
                        <span>{options.quality}%</span>
                        <span>Alta</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="compress"
                      checked={options.compress}
                      onChange={(e) => updateOption('compress', e.target.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="compress" className="text-sm">Comprimir resultado</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="preserveMetadata"
                      checked={options.preserveMetadata}
                      onChange={(e) => updateOption('preserveMetadata', e.target.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="preserveMetadata" className="text-sm">Preservar metadatos</label>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleConvertSingleFile}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
                      disabled={selectedFiles.length === 0}
                    >
                      Convertir {selectedFiles.length === 1 ? 'archivo' : 'primer archivo'}
                    </button>
                    
                    {selectedFiles.length > 1 && (
                      <button
                        onClick={handleBatchConversion}
                        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80"
                      >
                        Convertir todos ({selectedFiles.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Card>
            
            {/* Lista de conversiones */}
            {files.length > 0 && (
              <Card className="mb-6 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Conversiones</h2>
                  <button
                    onClick={clearCompleted}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Limpiar completados
                  </button>
                </div>
                
                <div className="space-y-4">
                  {files.map((file) => (
                    <div 
                      key={file.id}
                      className="border border-border rounded-md p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{file.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.file.size / 1024 < 1000 
                              ? `${Math.round(file.file.size / 1024)} KB` 
                              : `${Math.round(file.file.size / (1024 * 1024) * 10) / 10} MB`} 
                            • {file.status === 'completed' ? 'Completado' : 
                               file.status === 'processing' ? 'Procesando' : 
                               file.status === 'failed' ? 'Error' : 'Pendiente'}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {file.status === 'failed' && (
                            <button
                              onClick={() => retryConversion(file.id)}
                              className="text-sm text-primary hover:text-primary/80"
                            >
                              Reintentar
                            </button>
                          )}
                          
                          {file.status === 'processing' && (
                            <button
                              onClick={() => cancelConversion(file.id)}
                              className="text-sm text-red-500 hover:text-red-700"
                            >
                              Cancelar
                            </button>
                          )}
                          
                          {file.status === 'completed' && file.result?.downloadUrl && (
                            <a
                              href={file.result.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:text-primary/80"
                            >
                              Descargar
                            </a>
                          )}
                          
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      
                      {(file.status === 'processing' || file.status === 'pending') && (
                        <div className="mt-2">
                          <div className="h-1.5 w-full bg-accent/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {file.progress}% completado
                          </p>
                        </div>
                      )}
                      
                      {file.status === 'failed' && file.error && (
                        <p className="text-sm text-red-500 mt-2">
                          {file.error.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Lotes de conversión */}
            {Object.keys(batches).length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Lotes de conversión</h2>
                
                <div className="space-y-6">
                  {Object.values(batches).map((batch) => (
                    <div key={batch.batchId} className="border border-border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Lote #{batch.batchId.split('_')[1]}</h3>
                        <span className="text-sm bg-accent/50 px-2 py-0.5 rounded">
                          {batch.overallProgress === 100 ? 'Completado' : 'En progreso'}
                        </span>
                      </div>
                      
                      <div className="flex gap-4 text-sm mb-2">
                        <span>{batch.totalFiles} archivos</span>
                        <span>•</span>
                        <span>{batch.completed} completados</span>
                        <span>•</span>
                        <span>{batch.failed} fallidos</span>
                        <span>•</span>
                        <span>{batch.inProgress} en proceso</span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-accent/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${batch.overallProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {batch.overallProgress}% completado
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default ConversionDashboard;
