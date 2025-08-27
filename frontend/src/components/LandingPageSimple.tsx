import React from 'react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPageSimple: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
      {/* Header simple */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px 0',
        borderBottom: '1px solid #dee2e6'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
          Anclora Nexus
        </div>
        <button 
          onClick={onEnterApp}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Acceder a la App
        </button>
      </header>

      {/* Hero section */}
      <main style={{ textAlign: 'center', marginTop: '60px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          Tu contenido, <span style={{ color: '#10b981' }}>reinventado</span>
        </h1>
        
        <p style={{ 
          fontSize: '20px', 
          color: '#6b7280',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px auto'
        }}>
          Transforma tus documentos con la potencia de la inteligencia artificial. 
          Convierte, optimiza y crea contenido profesional en segundos.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={onEnterApp}
            style={{
              padding: '15px 30px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            Comenzar ahora
          </button>
          
          <button 
            style={{
              padding: '15px 30px',
              backgroundColor: 'transparent',
              color: '#10b981',
              border: '2px solid #10b981',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            Ver demo
          </button>
        </div>
      </main>

      {/* Features section */}
      <section style={{ marginTop: '80px' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '36px', 
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '40px'
        }}>
          Características principales
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ 
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '60px',
              height: '60px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              margin: '0 auto 20px auto'
            }}></div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
              Conversión inteligente
            </h3>
            <p style={{ color: '#6b7280' }}>
              Convierte entre múltiples formatos con precisión y calidad profesional
            </p>
          </div>

          <div style={{ 
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '60px',
              height: '60px',
              backgroundColor: '#0891b2',
              borderRadius: '50%',
              margin: '0 auto 20px auto'
            }}></div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
              Procesamiento rápido
            </h3>
            <p style={{ color: '#6b7280' }}>
              Tecnología de vanguardia para resultados en tiempo récord
            </p>
          </div>

          <div style={{ 
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '60px',
              height: '60px',
              backgroundColor: '#0284c7',
              borderRadius: '50%',
              margin: '0 auto 20px auto'
            }}></div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
              Seguridad total
            </h3>
            <p style={{ color: '#6b7280' }}>
              Tus documentos están protegidos con encriptación de nivel empresarial
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPageSimple;
