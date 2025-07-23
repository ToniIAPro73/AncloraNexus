
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import Login from './components/Login';
import Register from './components/Register';

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
