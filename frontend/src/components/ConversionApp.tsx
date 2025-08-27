import React, { useState, useCallback } from 'react';

interface ConversionAppProps {
  onBackToLanding: () => void;
}

const ConversionApp: React.FC<ConversionAppProps> = ({ onBackToLanding }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('pdf');
  const [isConverting, setIsConverting] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (!selectedFile) return;
    
    setIsConverting(true);
    // Simulación de conversión
    setTimeout(() => {
      setIsConverting(false);
      alert(`Archivo ${selectedFile.name} convertido a ${targetFormat.toUpperCase()}`);
    }, 2000);
  }, [selectedFile, targetFormat]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '40px'
      }}>
        <button 
          onClick={onBackToLanding}
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '20px',
            backdropFilter: 'blur(10px)'
          }}
        >
          ← Volver a la landing
        </button>
        
        <h1 style={{ 
          color: 'white', 
          fontSize: '2.5rem', 
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          Anclora Nexus - Conversor
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: '1.2rem',
          textAlign: 'center'
        }}>
          Convierte tus archivos con tecnología de IA
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        
        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: '3px dashed #10b981',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: selectedFile ? '#f0fdf4' : '#fafafa',
            marginBottom: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {selectedFile ? (
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
              <h3 style={{ color: '#10b981', marginBottom: '10px' }}>
                {selectedFile.name}
              </h3>
              <p style={{ color: '#6b7280' }}>
                {formatBytes(selectedFile.size)}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📁</div>
              <h3 style={{ color: '#374151', marginBottom: '10px' }}>
                Arrastra tu archivo aquí
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                o haz clic para seleccionar
              </p>
              <input
                type="file"
                onChange={handleFileSelect}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />
            </div>
          )}
        </div>

        {/* Format Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#374151', marginBottom: '15px' }}>
            Selecciona el formato de salida:
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '10px'
          }}>
            {['pdf', 'docx', 'txt', 'jpg', 'png', 'mp4', 'mp3'].map((format) => (
              <button
                key={format}
                onClick={() => setTargetFormat(format)}
                style={{
                  padding: '12px',
                  backgroundColor: targetFormat === format ? '#10b981' : '#f3f4f6',
                  color: targetFormat === format ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease'
                }}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={!selectedFile || isConverting}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: selectedFile && !isConverting ? '#10b981' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: selectedFile && !isConverting ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease'
          }}
        >
          {isConverting ? 'Convirtiendo...' : 'Convertir archivo'}
        </button>

        {/* Features */}
        <div style={{ 
          marginTop: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🚀</div>
            <h4 style={{ color: '#374151', marginBottom: '5px' }}>Ultra rápido</h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Conversión en segundos</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔒</div>
            <h4 style={{ color: '#374151', marginBottom: '5px' }}>100% seguro</h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Tus archivos protegidos</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
            <h4 style={{ color: '#374151', marginBottom: '5px' }}>Alta calidad</h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Sin pérdida de calidad</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionApp;
