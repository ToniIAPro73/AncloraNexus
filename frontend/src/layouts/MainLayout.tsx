import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import { Header } from '../components/Layout/Header';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, pageTitle = "Anclora Nexus" }) => {
  const [activeTab, setActiveTab] = useState('Inicio');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main content */}
      <div className="flex flex-col flex-grow">
        <Header
          pageTitle={pageTitle}
          sidebarCollapsed={isCollapsed}
          setSidebarCollapsed={setIsCollapsed}
          isMobile={isMobile}
        />
        
        <main className="flex-grow p-6 overflow-auto">
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Animated background gradients */}
          <div className="absolute top-0 left-0 right-0 bottom-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          </div>
        </main>
      </div>
    </div>
  );
};

