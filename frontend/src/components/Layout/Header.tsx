import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ChevronDown } from 'lucide-react';
import AccessibleIcon from '../AccessibleIcon';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header
      role="banner"
      aria-label="Header principal"
      className="h-16 bg-gradient-to-br from-emerald-600 to-teal-600 backdrop-blur-md shadow-md z-30 border-b border-white/10"
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo y título de la aplicación */}
        <div className="flex items-center gap-4">
          <img 
            src="/images/logos/logo-anclora-nexus.png" 
            alt="Anclora Nexus Logo" 
            className="h-10 w-auto"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-h1 font-bold text-white leading-snug">
              Anclora Nexus
            </h1>
            <p className="text-sm text-emerald-100 -mt-1">
              Tu Contenido, Reinventado
            </p>
          </div>
        </div>

        {/* Área de usuario y créditos */}
        <div className="flex items-center space-x-4">
          {/* Contador de créditos */}
          <div className="flex items-center gap-2 bg-emerald-700/60 px-3 py-1 rounded-full text-white shadow-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">50 créditos</span>
          </div>

          {/* Perfil de usuario */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full shadow">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold border border-white/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-col hidden sm:flex leading-tight">
              <span className="text-sm text-white font-medium">
                {user?.name || 'Usuario'}
              </span>
              <span className="text-xs text-gray-300">
                {user?.email || 'usuario@ejemplo.com'}
              </span>
            </div>
            <AccessibleIcon label="Abrir menú">
              <ChevronDown className="w-4 h-4 text-white/50" />
            </AccessibleIcon>
          </div>
        </div>
      </div>
    </header>
  );
};
