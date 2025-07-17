import React, { useState, useRef } from 'react';
import { useCreditSystem } from './CreditSystem';

// Importar los nuevos conversores
declare global {
  interface Window {
    TxtToHtmlConverter: any;
    TxtToDocConverter: any;
  }
}

export const UniversalConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { balance, consumeCredits, calculateConversionCost } = useCreditSystem();

  const popularConversions = [
    { from: 'TXT', to: 'HTML', icon: '📝→🌐', cost: 1 },
    { from: 'TXT', to: 'DOC', icon: '📝→📄', cost: 2 },
    { from: 'PDF', to: 'JPG', icon: '📄→🖼️', cost: 2 },
    { from: 'JPG', to: 'PNG', icon: '🖼️→🎨', cost: 1 },
    { from: 'MP4', to: 'GIF', icon: '🎬→🎞️', cost: 5 },
    { from: 'PNG', to: 'SVG', icon: '🎨→📐', cost: 3 },
    { from: 'DOC', to: 'PDF', icon: '📝→📄', cost: 2 },
  ];

  // Formatos disponibles según el tipo de archivo
  const getAvailableFormats = (fileType: string): string[] => {
    const fileExtension = fileType.toLowerCase();
    
    switch (fileExtension) {
      case 'txt':
        return ['html', 'doc', 'pdf', 'jpg', 'png', 'gif'];
      case 'pdf':
        return ['jpg', 'png', 'txt'];
      case 'jpg':
      case 'jpeg':
        return ['png', 'gif', 'pdf'];
      case 'png':
        return ['jpg', 'gif', 'pdf'];
      default:
        return ['pdf', 'jpg', 'png'];
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep(2);
    
    // Simular análisis de IA mejorado
    const simulateAIAnalysis = () => {
      setTimeout(() => {
        try {
          const suggestions = {
            'txt': 'Para este archivo de texto, recomiendo convertir a HTML para visualización web o DOC para edición profesional',
            'pdf': 'Para este PDF, recomiendo convertir a JPG con calidad alta para mejor visualización web',
            'jpg': 'Esta imagen se vería mejor como PNG para mantener la calidad sin pérdida',
            'mp4': 'Este video es perfecto para convertir a GIF para uso en redes sociales',
            'doc': 'Convierte a PDF para mejor compatibilidad y distribución'
          };
          
          // Obtener extensión del archivo seleccionado
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          const suggestion = suggestions[fileExtension as keyof typeof suggestions] || 'Archivo detectado. Selecciona el formato de destino para obtener la mejor calidad.';
          
          setAiSuggestion(suggestion);
          setCurrentStep(3);
          
          // Limpiar sugerencia después de 8 segundos
          setTimeout(() => {
            setAiSuggestion('');
          }, 8000);
          
        } catch (error) {
          console.error('Error en análisis IA:', error);
          setAiSuggestion('Error al analizar el archivo. Intenta de nuevo.');
          setCurrentStep(3);
          
          // Limpiar error después de 5 segundos
          setTimeout(() => {
            setAiSuggestion('');
          }, 5000);
        }
      }, 1500);
    };
    
    simulateAIAnalysis();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const calculateCost = (file: File, format: string): number => {
    if (!file || !format) return 0;
    
    // Usar la función del contexto para calcular el costo
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const conversionType = `${fileExtension}-${format.toLowerCase()}`;
    
    return calculateConversionCost(conversionType, file.size, 'standard');
  };

  // Función para convertir TXT a HTML
  const convertTxtToHtml = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const textContent = e.target?.result as string;
          
          // Usar el conversor HTML
          if (typeof window !== 'undefined' && window.TxtToHtmlConverter) {
            const converter = new window.TxtToHtmlConverter();
            const result = converter.convert(textContent, {
              title: file.name.replace(/\.[^/.]+$/, '') || 'Documento',
              preserveWhitespace: true
            });
            
            if (result.success) {
              const blob = new Blob([result.content], { type: 'text/html' });
              resolve(blob);
            } else {
              reject(new Error(result.error || 'Error en conversión HTML'));
            }
          } else {
            // Fallback simple si no está disponible el conversor
            const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${file.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        pre { white-space: pre-wrap; background: #f5f5f5; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>${file.name}</h1>
    <pre>${textContent.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))}</pre>
</body>
</html>`;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            resolve(blob);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

  // Función para convertir TXT a DOC
  const convertTxtToDoc = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const textContent = e.target?.result as string;
          
          // Usar el conversor DOC
          if (typeof window !== 'undefined' && window.TxtToDocConverter) {
            const converter = new window.TxtToDocConverter();
            const result = await converter.convert(textContent, {
              title: file.name.replace(/\.[^/.]+$/, '') || 'Documento',
              author: 'Anclora Converter'
            });
            
            if (result.success) {
              const blob = new Blob([result.content], { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
              });
              resolve(blob);
            } else {
              reject(new Error(result.error || 'Error en conversión DOC'));
            }
          } else {
            reject(new Error('Conversor DOC no disponible'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) return;
    
    const cost = calculateCost(selectedFile, targetFormat);
    if (balance.current < cost) {
      alert('Créditos insuficientes');
      return;
    }

    setIsConverting(true);
    setCurrentStep(4);

    try {
      let convertedBlob: Blob;
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      // Manejar conversiones específicas
      if (fileExtension === 'txt') {
        switch (targetFormat.toLowerCase()) {
          case 'html':
            convertedBlob = await convertTxtToHtml(selectedFile);
            break;
          case 'doc':
            convertedBlob = await convertTxtToDoc(selectedFile);
            break;
          default:
            // Fallback para otras conversiones TXT
            throw new Error(`Conversión TXT → ${targetFormat} no implementada aún`);
        }
      } else {
        // Simular otras conversiones existentes
        await new Promise(resolve => setTimeout(resolve, 2000));
        convertedBlob = new Blob(['Conversión simulada'], { type: 'application/octet-stream' });
      }

      // Consumir créditos
      consumeCredits(cost, `${fileExtension?.toUpperCase()} → ${targetFormat.toUpperCase()}`);

      // Descargar archivo
      const url = URL.createObjectURL(convertedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.name.split('.')[0]}.${targetFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Resetear formulario
      setTimeout(() => {
        setIsConverting(false);
        setSelectedFile(null);
        setTargetFormat('');
        setCurrentStep(1);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);

    } catch (error) {
      console.error('Error en conversión:', error);
      alert(`Error en la conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setIsConverting(false);
      setCurrentStep(3);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTargetFormat('');
    setCurrentStep(1);
    setAiSuggestion('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="universal-converter">
      <div className="converter-header">
        <h2>🔄 Conversor Universal</h2>
        <p>Convierte tus archivos entre diferentes formatos de manera rápida y sencilla</p>
      </div>

      {/* Conversiones Populares */}
      <div className="popular-conversions">
        <h3>⚡ Conversiones Populares</h3>
        <div className="conversion-grid">
          {popularConversions.map((conversion, index) => (
            <div key={index} className="conversion-card">
              <div className="conversion-icon">{conversion.icon}</div>
              <div className="conversion-info">
                <span className="conversion-types">{conversion.from} → {conversion.to}</span>
                <span className="conversion-cost">{conversion.cost} créditos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pasos del Proceso */}
      <div className="conversion-steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Seleccionar Archivo</h4>
            <p>Arrastra o selecciona tu archivo</p>
          </div>
        </div>

        <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Análisis IA</h4>
            <p>Analizando tu archivo...</p>
          </div>
        </div>

        <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Configurar</h4>
            <p>Selecciona el formato de destino</p>
          </div>
        </div>

        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-content">
            <h4>Convertir</h4>
            <p>Procesando tu archivo...</p>
          </div>
        </div>
      </div>

      {/* Área de Subida de Archivos */}
      {currentStep === 1 && (
        <div 
          className="file-upload-area"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📁</div>
          <h3>Arrastra tu archivo aquí</h3>
          <p>o haz clic para seleccionar</p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Información del Archivo Seleccionado */}
      {selectedFile && currentStep >= 2 && (
        <div className="file-info">
          <div className="file-details">
            <div className="file-icon">📄</div>
            <div className="file-meta">
              <h4>{selectedFile.name}</h4>
              <p>{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button className="change-file-btn" onClick={resetForm}>
              Cambiar archivo
            </button>
          </div>
        </div>
      )}

      {/* Sugerencia de IA */}
      {aiSuggestion && (
        <div className="ai-suggestion">
          <div className="ai-icon">🤖</div>
          <div className="ai-content">
            <h4>Sugerencia IA</h4>
            <p>{aiSuggestion}</p>
          </div>
        </div>
      )}

      {/* Selector de Formato */}
      {selectedFile && currentStep >= 3 && !isConverting && (
        <div className="format-selector">
          <h3>Seleccionar formato de destino</h3>
          <div className="format-grid">
            {getAvailableFormats(selectedFile.name.split('.').pop() || '').map((format) => (
              <button
                key={format}
                className={`format-option ${targetFormat === format ? 'selected' : ''}`}
                onClick={() => setTargetFormat(format)}
              >
                <div className="format-icon">
                  {format === 'html' && '🌐'}
                  {format === 'doc' && '📄'}
                  {format === 'pdf' && '📋'}
                  {format === 'jpg' && '🖼️'}
                  {format === 'png' && '🎨'}
                  {format === 'gif' && '🎞️'}
                </div>
                <span>{format.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Información de Costo y Botón de Conversión */}
      {selectedFile && targetFormat && currentStep >= 3 && !isConverting && (
        <div className="conversion-info">
          <div className="cost-info">
            <span className="cost-label">Costo de conversión:</span>
            <span className="cost-value">{calculateCost(selectedFile, targetFormat)} créditos</span>
          </div>
          <button 
            className="convert-btn"
            onClick={handleConvert}
            disabled={balance.current < calculateCost(selectedFile, targetFormat)}
          >
            {balance.current < calculateCost(selectedFile, targetFormat) 
              ? 'Créditos insuficientes' 
              : 'Iniciar Conversión'
            }
          </button>
        </div>
      )}

      {/* Estado de Conversión */}
      {isConverting && (
        <div className="conversion-status">
          <div className="loading-spinner"></div>
          <h3>Convirtiendo archivo...</h3>
          <p>Por favor espera mientras procesamos tu archivo</p>
        </div>
      )}
    </div>
  );
};

