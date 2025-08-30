import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { Header } from './Header';
import { CreditProvider, CreditBalance, CreditHistory } from '@/components/CreditSystem';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

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
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden grid"
      style={{
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto 1fr',
        gridTemplateAreas: `'sidebar header' 'sidebar main'`,
      }}
    >
      {/* Fondo animado de ondas */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Sidebar */}
      <div style={{ gridArea: 'sidebar' }} className="relative z-20">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Header */}
      <div style={{ gridArea: 'header' }} className="relative z-20">
        <Header 
          pageTitle={activeTab || 'Inicio'}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          isMobile={isMobile}
        />
      </div>

      {/* Capa negra en móvil al abrir menú */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Contenido principal */}
      <main
        ref={mainRef}
        tabIndex={-1}
        role="main"
        aria-label="Contenido principal"
        style={{ gridArea: 'main' }}
        className="pt-16 min-h-screen relative z-10 transition-all duration-300 ease-in-out p-6"
      >
        {activeTab === 'Créditos' ? (
          <CreditProvider>
            <div className="grid grid-cols-1 @[50rem]:grid-cols-2 gap-6">
              <CreditBalance />
              <CreditHistory />
            </div>
          </CreditProvider>
        ) : (
          <div>{children}</div>
        )}
      </main>
    </div>
  );
};
