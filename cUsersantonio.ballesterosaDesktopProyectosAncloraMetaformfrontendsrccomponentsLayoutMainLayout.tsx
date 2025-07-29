// frontend/src/components/Layout/MainLayout.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreditProvider } from '@/components/CreditSystem';
import CreditBalance from '@/components/CreditSystem/CreditBalance';
import CreditHistory from '@/components/CreditSystem/CreditHistory';

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

  // Optimizar la función de verificación de móvil con useCallback
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setSidebarCollapsed(mobile);
  }, []);

  useEffect(() => {
    checkMobile();
    
    // Usar un debounce para evitar múltiples llamadas durante el redimensionamiento
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [checkMobile]);

  // Memoizar el contenido principal para evitar renderizados innecesarios
  const mainContent = useMemo(() => {
    if (activeTab === 'Créditos') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <CreditBalance />
          <CreditHistory />
        </div>
      );
    }
    return <div className="p-6">{children || <div className="text-center text-gray-400">No hay contenido disponible</div>}</div>;
  }, [activeTab, children]);

  return (
    <CreditProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Fondo animado de ondas */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Header */}
        <Header sidebarCollapsed={sidebarCollapsed} />

        {/* Capa negra en móvil al abrir menú */}
        {isMobile && !sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Cerrar menú"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter') {
                setSidebarCollapsed(true);
              }
            }}
          />
        )}

        {/* Contenido principal */}
        <main
          className={`
            pt-16 min-h-screen relative z-10 transition-all duration-300 ease-in-out
            ml-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}
          `}
        >
          {mainContent}
        </main>
      </div>
    </CreditProvider>
  );
};
