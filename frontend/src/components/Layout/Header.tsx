// frontend/src/components/Layout/Header.tsx
import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import type { User } from '../../types/User';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
  const { user } = useAuth();

  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-gradient-to-br from-primary to-secondary
      backdrop-blur-sm border-b border-slate-700/50 shadow-lg rounded-lg
      transition-all duration-300 ease-in-out z-30
      ${sidebarCollapsed ? 'left-16' : 'left-72'}
    `}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Título de la página actual */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white">
            Conversor Inteligente
          </h1>
          <span className="ml-3 text-sm text-gray-400">
            Convierte archivos con inteligencia artificial avanzada
          </span>
        </div>

        {/* Área de usuario y créditos */}
        <div className="flex items-center space-x-4">
          {/* Contador de créditos */}
          <div className="flex items-center bg-slate-800/50 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
            <span className="text-sm text-gray-300 mr-2">50 créditos</span>
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>

          {/* Perfil de usuario */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3 hidden sm:block">
              <div className="text-sm font-medium text-white">
                {user?.name || 'Usuario'}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || 'usuario@ejemplo.com'}
              </div>
            </div>
            {/* Dropdown indicator */}
            <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};
