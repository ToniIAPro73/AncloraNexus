import React, { useState, useRef } from 'react';
import { useCreditSystem } from './CreditSystem';

// Importar conversores
import TxtToHtmlConverter from '../converters/TxtToHtmlConverter';
import TxtToDocConverter from '../converters/TxtToDocConverter';
import TxtToMarkdownConverter from '../converters/TxtToMarkdownConverter';
import TxtToRtfConverter from '../converters/TxtToRtfConverter';
import TxtToOdtConverter from '../converters/TxtToOdtConverter';
import TxtToTexConverter from '../converters/TxtToTexConverter';

// Importar logo
import ancloraLogo from '../assets/anclora_metaform_logo.png';

export const UniversalConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { balance, consumeCredits, calculateConversionCost } = useCreditSystem();

  // Inicializar conversores
  const htmlConverter = new TxtToHtmlConverter();
  const docConverter = new TxtToDocConverter();
  const mdConverter = new TxtToMarkdownConverter();
  const rtfConverter = new TxtToRtfConverter();
  const odtConverter = new TxtToOdtConverter();
  const texConverter = new TxtToTexConverter();

  const popularConversions = [
    { from: 'PDF', to: 'JPG', icon: '📄→🖼️', cost: 2 },
    { from: 'JPG', to: 'PNG', icon: '🖼️→🎨', cost: 1 },
    { from: 'TXT', to: 'HTML', icon: '📝→🌐', cost: 1 },
    { from: 'TXT', to: 'DOC', icon: '📝→📄', cost: 1 },
    { from: 'TXT', to: 'TEX', icon: '📝→🎓', cost: 1 },
  ];

  // Formatos disponibles según el tipo de archivo
  const getAvailableFormats = (fileType: string) => {
    const formats: { [key: string]: string[] } = {
      'txt': ['html', 'doc', 'md', 'rtf', 'odt', 'tex', 'pdf', 'jpg', 'png', 'gif'],
      'pdf': ['jpg', 'png', 'gif'],
      'jpg': ['png', 'gif', 'pdf'],
      'png': ['jpg', 'gif', 'pdf'],
      'gif': ['jpg', 'png', 'pdf'],
      'doc': ['pdf', 'txt', 'html'],
      'docx': ['pdf', 'txt', 'html'],
    };

    return formats[fileType] || [];
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep(2);
    
    // Simular análisis de IA mejorado
    const simulateAIAnalysis = () => {
      setTimeout(() => {
        try {
          const suggestions = {
            'pdf': 'Para este PDF, recomiendo convertir a JPG con calidad alta para mejor visualización web',
            'jpg': 'Esta imagen se vería mejor como PNG para mantener la calidad sin pérdida',
            'mp4': 'Este video es perfecto para convertir a GIF para uso en redes sociales',
            'doc': 'Convierte a PDF para mejor compatibilidad y distribución',
            'txt': 'Archivo de texto detectado. Opciones recomendadas: HTML para web, DOC para documentos, MD para desarrolladores.',
            'docx': 'Documento Word detectado. Convierte a PDF para distribución universal'
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
          setAiSuggestion('Análisis completado. Selecciona el formato de destino.');
          setCurrentStep(3);
        }
      }, 1500);
    };

    simulateAIAnalysis();
  };

  const handleFormatSelect = (format: string) => {
    setTargetFormat(format);
  };

  const downloadFile = (content: any, filename: string, mimeType: string) => {
    try {
      let blob: Blob;
      
      if (content instanceof Blob) {
        blob = content;
      } else if (typeof content === 'string') {
        blob = new Blob([content], { type: mimeType });
      } else {
        blob = new Blob([content], { type: mimeType });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      alert('Error al descargar el archivo. Por favor, inténtalo de nuevo.');
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) {
      alert('Por favor selecciona un archivo y formato de destino');
      return;
    }

    setIsConverting(true);

    try {
      // Calcular y consumir créditos
      const cost = calculateConversionCost(selectedFile.name, targetFormat);
      
      if (balance.current < cost) {
        alert('Créditos insuficientes para esta conversión');
        setIsConverting(false);
        return;
      }

      // Obtener extensión del archivo
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      // Conversiones desde TXT
      if (fileExtension === 'txt') {
        const fileContent = await selectedFile.text();
        const baseFilename = selectedFile.name.replace(/\.[^/.]+$/, '');
        
        let result;
        let filename;
        let mimeType;

        switch (targetFormat.toLowerCase()) {
          case 'html':
            result = htmlConverter.convert(fileContent, { title: baseFilename });
            filename = `${baseFilename}.html`;
            mimeType = 'text/html';
            break;
            
          case 'doc':
          case 'docx':
            result = docConverter.convert(fileContent, { title: baseFilename });
            filename = `${baseFilename}.docx`;
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
            
          case 'md':
            result = mdConverter.convert(fileContent, { title: baseFilename });
            filename = `${baseFilename}.md`;
            mimeType = 'text/markdown';
            break;
            
          case 'rtf':
            result = rtfConverter.convert(fileContent, { title: baseFilename });
            filename = `${baseFilename}.rtf`;
            mimeType = 'application/rtf';
            break;
            
          case 'odt':
            result = await odtConverter.convert(fileContent, { title: baseFilename });
            filename = `${baseFilename}.odt`;
            mimeType = 'application/vnd.oasis.opendocument.text';
            break;
            
          case 'tex':
            result = texConverter.convert(fileContent, { 
              title: baseFilename,
              author: 'Usuario Anclora',
              documentClass: 'article'
            });
            filename = `${baseFilename}.tex`;
            mimeType = 'application/x-tex';
            break;
            
          default:
            // Para otros formatos (PDF, JPG, PNG, GIF), usar conversión simulada
            await simulateConversion();
            return;
        }

        if (result.success) {
          // Consumir créditos
          consumeCredits(cost, `${selectedFile.name} → ${targetFormat.toUpperCase()}`);
          
          // Descargar archivo
          downloadFile(result.content, filename, mimeType);
          
          // Resetear formulario
          setSelectedFile(null);
          setTargetFormat('');
          setCurrentStep(1);
          setAiSuggestion('');
          
          alert('¡Conversión completada exitosamente!');
        } else {
          throw new Error(result.error || 'Error en la conversión');
        }
      } else {
        // Para otros tipos de archivo, usar conversión simulada
        await simulateConversion();
      }

    } catch (error) {
      console.error('Error en conversión:', error);
      alert('Error durante la conversión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsConverting(false);
    }
  };

  const simulateConversion = async () => {
    // Simular proceso de conversión para otros formatos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cost = calculateConversionCost(selectedFile!.name, targetFormat);
    consumeCredits(cost, `${selectedFile!.name} → ${targetFormat.toUpperCase()}`);
    
    // Crear archivo simulado
    const simulatedContent = `Archivo convertido de ${selectedFile!.name} a ${targetFormat.toUpperCase()}`;
    const filename = `${selectedFile!.name.split('.')[0]}.${targetFormat}`;
    
    downloadFile(simulatedContent, filename, 'application/octet-stream');
    
    // Resetear formulario
    setSelectedFile(null);
    setTargetFormat('');
    setCurrentStep(1);
    setAiSuggestion('');
    
    alert('¡Conversión completada exitosamente!');
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

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const availableFormats = selectedFile ? getAvailableFormats(getFileExtension(selectedFile.name)) : [];

  return (
    <div className="universal-converter">
      <div className="converter-header">
        <div className="brand-header">
          <img src={ancloraLogo} alt="Anclora Metaform" className="brand-logo" />
          <div className="brand-text">
            <h1>Anclora Metaform</h1>
            <p className="brand-tagline">Tu Contenido, Reinventado</p>
          </div>
        </div>
        <h2>🔄 Conversor Universal</h2>
        <p>Convierte tus archivos a cualquier formato con IA</p>
        <div className="credit-display">
          💎 {balance.current} créditos disponibles
        </div>
      </div>

      {/* Conversiones Populares */}
      <div className="popular-conversions">
        <h3>⚡ Conversiones Populares</h3>
        <div className="conversion-grid">
          {popularConversions.map((conversion, index) => (
            <div key={index} className="conversion-card">
              <div className="conversion-icon">{conversion.icon}</div>
              <div className="conversion-info">
                <span className="conversion-text">{conversion.from} → {conversion.to}</span>
                <span className="conversion-cost">{conversion.cost} créditos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paso 1: Selección de archivo */}
      <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
        <div className="step-header">
          <span className="step-number">1</span>
          <h3>Seleccionar Archivo</h3>
        </div>
        
        <div className="file-upload-area">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="file-input"
            accept=".txt,.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.mp4,.avi,.mov"
          />
          
          {selectedFile && (
            <div className="selected-file">
              <div className="file-info">
                <span className="file-name">📄 {selectedFile.name}</span>
                <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={resetForm} className="remove-file">❌</button>
            </div>
          )}
        </div>
      </div>

      {/* Paso 2: Análisis IA */}
      {currentStep >= 2 && (
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-header">
            <span className="step-number">2</span>
            <h3>Análisis IA</h3>
          </div>
          
          <div className="ai-analysis">
            {currentStep === 2 ? (
              <div className="analyzing">
                <div className="spinner"></div>
                <p>🤖 Analizando archivo con IA...</p>
              </div>
            ) : (
              <div className="analysis-result">
                <p>✅ Análisis completado</p>
                {aiSuggestion && (
                  <div className="ai-suggestion">
                    <strong>💡 Sugerencia IA:</strong> {aiSuggestion}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paso 3: Selección de formato */}
      {currentStep >= 3 && (
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-header">
            <span className="step-number">3</span>
            <h3>Seleccionar Formato</h3>
          </div>
          
          <div className="format-selection">
            <div className="format-grid">
              {availableFormats.map((format) => {
                const cost = selectedFile ? calculateConversionCost(selectedFile.name, format) : 1;
                return (
                  <div
                    key={format}
                    className={`format-option ${targetFormat === format ? 'selected' : ''}`}
                    onClick={() => handleFormatSelect(format)}
                  >
                    <div className="format-name">{format.toUpperCase()}</div>
                    <div className="format-cost">{cost} créditos</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Botón de conversión */}
      {selectedFile && targetFormat && (
        <div className="conversion-action">
          <button
            onClick={handleConvert}
            disabled={isConverting || balance.current < calculateConversionCost(selectedFile.name, targetFormat)}
            className="convert-button"
          >
            {isConverting ? (
              <>
                <div className="spinner small"></div>
                Convirtiendo...
              </>
            ) : (
              <>
                🚀 Iniciar Conversión
                <span className="cost-badge">
                  {calculateConversionCost(selectedFile.name, targetFormat)} créditos
                </span>
              </>
            )}
          </button>
          
          {balance.current < calculateConversionCost(selectedFile.name, targetFormat) && (
            <p className="insufficient-credits">
              ⚠️ Créditos insuficientes. Necesitas {calculateConversionCost(selectedFile.name, targetFormat)} créditos.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalConverter;

