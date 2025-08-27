import React from 'react';

interface MinimalLandingProps {
  onEnterApp: () => void;
}

const MinimalLanding: React.FC<MinimalLandingProps> = ({ onEnterApp }) => {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '1rem',
        fontWeight: 'bold'
      }}>
        Anclora Nexus
      </h1>
      
      <p style={{ 
        fontSize: '1.5rem', 
        marginBottom: '2rem',
        opacity: 0.9,
        maxWidth: '600px'
      }}>
        Tu contenido, reinventado con inteligencia artificial
      </p>
      
      <button 
        onClick={onEnterApp}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: 'white',
          color: '#10b981',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Acceder a la aplicación
      </button>
      
      <div style={{ 
        marginTop: '3rem',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '800px'
      }}>
        <div style={{ 
          padding: '1rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          minWidth: '200px'
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>🔄 Conversión inteligente</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Convierte entre múltiples formatos
          </p>
        </div>
        
        <div style={{ 
          padding: '1rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          minWidth: '200px'
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>⚡ Procesamiento rápido</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Resultados en tiempo récord
          </p>
        </div>
        
        <div style={{ 
          padding: '1rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          minWidth: '200px'
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>🔒 Seguridad total</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Tus documentos protegidos
          </p>
        </div>
      </div>
    </div>
  );
};

export default MinimalLanding;
