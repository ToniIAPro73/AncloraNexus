// frontend/src/components/Layout/Header.tsx
import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useCreditSystem } from '../CreditSystem';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
  const { user } = useAuth();
  const { balance } = useCreditSystem();
  
  // Extraer la primera letra del nombre de usuario de forma segura
  const userInitial = user?.name && user.name.length > 0 ? user.name.charAt(0) : 'U';
  
  return (
    <header
      className={`
        fixed top-0 right-0 h-16
        bg-gradient-to-br from-primary to-secondary
        backdrop-blur-md shadow-md z-30 border-b border-white/10
        transition-all duration-300 ease-in-out
        left-0 ${sidebarCollapsed ? 'md:left-16' : 'md:left-72'}
      `}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Título de la página actual */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold text-white leading-snug">
            Conversor Inteligente
          </h1>
          <p className="text-sm text-blue-100 -mt-1">
            Convierte archivos con inteligencia artificial avanzada
          </p>
        </div>

        {/* Área de usuario y créditos */}
        <div className="flex items-center space-x-4">
          {/* Contador de créditos */}
          <div className="flex items-center gap-2 bg-blue-700/60 px-3 py-1 rounded-full text-white shadow-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">{balance.current} créditos</span>
          </div>

          {/* Perfil de usuario */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full shadow">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold border border-white/20">
              {userInitial}
            </div>
            <div className="flex-col hidden sm:flex leading-tight">
              <span className="text-sm text-white font-medium">
                {user?.name || 'Usuario'}
              </span>
              <span className="text-xs text-gray-300">
                {user?.email || 'usuario@ejemplo.com'}
              </span>
            </div>
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};
