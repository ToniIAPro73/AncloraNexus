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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Obtener tÃ­tulo dinÃ¡mico basado en activeTab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'Conversor':
        return 'Conversor Inteligente';
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
      setSidebarCollapsed(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    mainRef.current?.focus();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Fondo animado con ondas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradiente de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-slate-900 to-secondary/5 opacity-80" />
        
        {/* Ondas animadas */}
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-wave-slow opacity-20" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl animate-wave-slow-reverse opacity-20" />
        
        {/* Efectos de luz */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl opacity-10" />
        
        {/* LÃ­neas decorativas */}
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.png')] bg-repeat opacity-5"></div>
      </div>

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
          className="fixed inset-0 bg-black/70 z-30 backdrop-blur-sm"
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
          ${sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-72'}
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

