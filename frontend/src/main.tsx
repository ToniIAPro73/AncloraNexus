    import React from 'react';
import { createRoot } from 'react-dom/client';

// Componente básico para probar que funciona
function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Anclora Metaform - Funcionando!</h1>
      <p>La aplicación se está cargando correctamente.</p>
      <p>Próximo paso: integrar tus componentes existentes.</p>
    </div>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);