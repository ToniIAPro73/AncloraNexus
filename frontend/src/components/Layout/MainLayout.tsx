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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white relative overflow-hidden">
      {/* Fondo animado sutil */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-white/10 to-blue-100/30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Header */}
      <Header />

      {/* Capa negra en móvil al abrir menú */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
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
            pt-16 min-h-screen relative z-10 transition-all duration-300 ease-in-out
            ml-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}
          `}
        >
        {activeTab === 'Créditos' ? (
          <CreditProvider>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              <CreditBalance />
              <CreditHistory />
            </div>
          </CreditProvider>
        ) : (
          <div className="p-6 space-y-8">
            {children}
            <InteractiveConversions />
          </div>
        )}
      </main>
    </div>
  );
};
