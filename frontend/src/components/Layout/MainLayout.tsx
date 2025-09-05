import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { Header } from './Header';
import { CreditProvider, CreditBalance, CreditHistory } from '../CreditSystem';
import { InteractiveConversions } from '../InteractiveConversions';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Obtener tÃ­tulo dinÃ¡mico basado en activeTab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'Conversor':
        return ''; // Sin título para evitar superposición con el logo
      case 'converter':
        return ''; // Sin título para evitar superposición con el logo
      case 'CrÃ©ditos':
        return 'GestiÃ³n de CrÃ©ditos';
      default:
        return activeTab || 'Bienvenido';
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // En móvil, mantener el sidebar colapsado por defecto
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarCollapsed]);

  useEffect(() => {
    mainRef.current?.focus();
  }, [activeTab]);

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/backgrounds/bg15.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay ajustado al tema para mejor contraste */}
      <div className="absolute inset-0 app-overlay backdrop-blur-md" />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Header */}
      <Header 
        pageTitle={getPageTitle()}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
      />

      {/* Capa negra en mÃ³vil al abrir menÃº */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 app-overlay z-30 backdrop-blur-sm"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Contenido principal */}
      <main
        ref={mainRef}
        tabIndex={-1}
        role="main"
        aria-label="Contenido principal"
        className={`
          pt-20 min-h-screen relative z-10 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'ml-0' : 'ml-0 md:ml-[var(--sidebar-width)]'}
          px-4 md:px-6 pb-16
        `}
      >
        <div className="max-w-7xl mx-auto">
          {activeTab === 'CrÃ©ditos' ? (
            <CreditProvider>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CreditBalance />
                <CreditHistory />
              </div>
            </CreditProvider>
          ) : (
            <div className="space-y-8">
              {children}
              <InteractiveConversions />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};


