// frontend/src/components/NewApp.tsx
import React, { useState } from 'react';
import { AuthProvider, ProtectedRoute, UserProfile } from '../auth/AuthContext';
import { CreditProvider } from './CreditSystem';
import { MainLayout } from './Layout/MainLayout';
import { NewConversorInteligente } from './NewConversorInteligente';
import { ConversionHistory } from './ConversionHistory';
import { CreditPurchase } from './CreditPurchase';
import { ThemeProvider } from '../theme/ThemeProvider';
import '../styles/anclora-animations.css';

interface NewAppProps {
  onBackToLanding?: () => void;
}

// Componente placeholder para las secciones que aÃºn no estÃ¡n implementadas
const PlaceholderSection: React.FC<{ title: string; icon: string; description: string }> = ({ 
  title, 
  icon, 
  description 
}) => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-h2 font-bold text-white mb-3">{title}</h2>
      <p className="text-gray-300 mb-6">{description}</p>
      <div className="inline-flex items-center text-sm text-primary">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        PrÃ³ximamente disponible
      </div>
    </div>
  </div>
);

// Componente principal de la aplicaciÃ³n autenticada
const AuthenticatedApp: React.FC<NewAppProps> = ({ onBackToLanding: _onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState('converter');

  const renderContent = () => {
    switch (activeTab) {
      case 'converter':
        return <NewConversorInteligente />;
      
      case 'components':
        const ComponentsDemo = React.lazy(() => import('../pages/ComponentsDemo'));
        return (
          <React.Suspense fallback={<div>Cargando...</div>}>
            <ComponentsDemo />
          </React.Suspense>
        );
      
      case 'formats':
        return (
          <PlaceholderSection
            title="Formatos Compatibles"
            icon="ðŸ“"
            description="Explora todos los formatos de archivo compatibles con nuestro conversor inteligente. MÃ¡s de 45 formatos disponibles."
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
            icon="ðŸ“‹"
            description="Descubre nuestros planes de suscripciÃ³n diseÃ±ados para satisfacer todas tus necesidades de conversiÃ³n."
          />
        );
      
      case 'faq':
        return (
          <PlaceholderSection
            title="Preguntas Frecuentes"
            icon="â“"
            description="Encuentra respuestas a las preguntas mÃ¡s comunes sobre nuestro servicio de conversiÃ³n."
          />
        );
      
      case 'ratings':
        return (
          <PlaceholderSection
            title="Valoraciones"
            icon="â­"
            description="Comparte tu experiencia y lee las valoraciones de otros usuarios de Anclora Nexus."
          />
        );
      
      case 'config':
        return (
          <PlaceholderSection
            title="ConfiguraciÃ³n"
            icon="âš™ï¸"
            description="Personaliza tu experiencia con Anclora Nexus segÃºn tus preferencias."
          />
        );
      
      case 'stats':
        return (
          <PlaceholderSection
            title="EstadÃ­sticas"
            icon="ðŸ“ˆ"
            description="Visualiza estadÃ­sticas detalladas sobre tus conversiones y uso del servicio."
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

// Componente principal de la aplicaciÃ³n
const NewApp: React.FC<NewAppProps> = ({ onBackToLanding }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CreditProvider>
          <ProtectedRoute>
            <AuthenticatedApp onBackToLanding={onBackToLanding} />
          </ProtectedRoute>
        </CreditProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default NewApp;


