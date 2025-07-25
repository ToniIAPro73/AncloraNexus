// frontend/src/components/NewApp.tsx
import React, { useState } from 'react';
import { AuthProvider, ProtectedRoute, UserProfile } from '../auth/AuthContext';
import { CreditProvider } from './CreditSystem';
import { MainLayout } from './Layout/MainLayout';
import { NewConversorInteligente } from './NewConversorInteligente';
import { ConversionHistory } from './ConversionHistory';
import { CreditPurchase } from './CreditPurchase';
import './styles/anclora-animations.css';

// Componente placeholder para las secciones que aún no están implementadas
const PlaceholderSection: React.FC<{ title: string; icon: string; description: string }> = ({ 
  title, 
  icon, 
  description 
}) => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      <p className="text-gray-300 mb-6">{description}</p>
      <div className="inline-flex items-center text-sm text-primary">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Próximamente disponible
      </div>
    </div>
  </div>
);

// Componente principal de la aplicación autenticada
const AuthenticatedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('converter');

  const renderContent = () => {
    switch (activeTab) {
      case 'converter':
        return <NewConversorInteligente />;
      
      case 'formats':
        return (
          <PlaceholderSection
            title="Formatos Compatibles"
            icon="📁"
            description="Explora todos los formatos de archivo compatibles con nuestro conversor inteligente. Más de 45 formatos disponibles."
          />
        );
      
      case 'history':
        return <ConversionHistory />;
      
      case 'credits':
        return <CreditPurchase />;
      
      case 'plans':
        return (
          <PlaceholderSection
            title="Planes y Precios"
            icon="📋"
            description="Descubre nuestros planes de suscripción diseñados para satisfacer todas tus necesidades de conversión."
          />
        );
      
      case 'faq':
        return (
          <PlaceholderSection
            title="Preguntas Frecuentes"
            icon="❓"
            description="Encuentra respuestas a las preguntas más comunes sobre nuestro servicio de conversión."
          />
        );
      
      case 'ratings':
        return (
          <PlaceholderSection
            title="Valoraciones"
            icon="⭐"
            description="Comparte tu experiencia y lee las valoraciones de otros usuarios de Anclora Metaform."
          />
        );
      
      case 'config':
        return (
          <PlaceholderSection
            title="Configuración"
            icon="⚙️"
            description="Personaliza tu experiencia con Anclora Metaform según tus preferencias."
          />
        );
      
      case 'stats':
        return (
          <PlaceholderSection
            title="Estadísticas"
            icon="📈"
            description="Visualiza estadísticas detalladas sobre tus conversiones y uso del servicio."
          />
        );
      
      case 'profile':
        return <UserProfile />;
      
      default:
        return <NewConversorInteligente />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
};

// Componente principal de la aplicación
const NewApp: React.FC = () => {
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

export default NewApp;

