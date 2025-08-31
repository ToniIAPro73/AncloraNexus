import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#fff', 
      color: '#000',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        Test Component - Â¿Se ve esto?
      </h1>
      <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
        Si puedes ver este texto, significa que React estÃ¡ funcionando correctamente.
        El problema podrÃ­a estar en:
      </p>
      <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
        <li>Tailwind CSS no estÃ¡ cargando</li>
        <li>Hay un error en el componente LandingPage</li>
        <li>Problema con las importaciones</li>
      </ul>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => alert('Â¡BotÃ³n funcionando!')}
        >
          Hacer clic aquÃ­
        </button>
      </div>
    </div>
  );
};

export default TestComponent;

