console.log("🧪 index.tsx está siendo usado");

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/NewApp';
import { AuthProvider } from './auth/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import './index.css'; // Esta línea probablemente ya existe
import './anclora-animations.css'; // Añade esta línea

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const path = window.location.pathname;
let Page: React.FC = App;
if (path === '/login') Page = Login;
else if (path === '/register') Page = Register;

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Page />
    </AuthProvider>
  </React.StrictMode>
);

export default function HomePage() {
  return <App />; 
}