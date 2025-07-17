import React, { useState } from 'react';
import { AuthProvider, ProtectedRoute, UserProfile } from './auth/AuthContext';
import { CreditProvider } from './components/CreditSystem';
import { UniversalConverter } from './UniversalConverter';
import { ConversionHistory } from './components/ConversionHistory';
import { CreditPurchase } from './components/CreditPurchase';

// Componente de navegación
const Navigation: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const tabs = [
    { id: 'converter', label: 'Conversor', icon: '🔄' },
    { id: 'history', label: 'Historial', icon: '📋' },
    { id: 'credits', label: 'Créditos', icon: '💳' },
    { id: 'profile', label: 'Perfil', icon: '👤' },
  ];

  return (
    <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              🎯 Anclora Metaform
            </h1>
            <span className="ml-2 text-slate-400 text-sm">Tu Contenido, Reinventado</span>
          </div>

          {/* Navegación */}
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Componente principal de la aplicación autenticada
const AuthenticatedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('converter');

  const renderContent = () => {
    switch (activeTab) {
      case 'converter':
        return <UniversalConverter />;
      case 'history':
        return <ConversionHistory />;
      case 'credits':
        return <CreditPurchase />;
      case 'profile':
        return <UserProfile />;
      default:
        return <UniversalConverter />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

// Componente principal de la aplicación
const App: React.FC = () => {
  return (
    <AuthProvider>
      <CreditProvider>
        <ProtectedRoute>
          <AuthenticatedApp />
        </ProtectedRoute>
      </CreditProvider>
    </AuthProvider>
  );
};

export default App;

