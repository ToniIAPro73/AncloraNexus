import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ChevronDown, Menu, Bell, Search, CreditCard, LogOut, Settings } from 'lucide-react';
// No longer using AccessibleIcon in this component

interface HeaderProps {
  pageTitle: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  sidebarCollapsed, 
  setSidebarCollapsed,
  isMobile
}) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  return (
    <header
      role="banner"
      aria-label="Header principal"
      className="fixed top-0 left-0 right-0 h-16 bg-slate-800/80 backdrop-blur-md shadow-md z-20 border-b border-slate-700/50"
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Botón menú móvil y título de la sección */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 transition-colors"
              aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <Menu size={20} />
            </button>
          )}
          
          <div className="flex flex-col justify-center">
            <h1 className="text-lg md:text-xl font-bold text-white leading-snug">
              {pageTitle}
            </h1>
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </div>
        </div>

        {/* Barra de búsqueda (visible solo en desktop) */}
        <div className="hidden md:flex max-w-md flex-1 mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar formatos, conversiones, documentos..."
              className="bg-slate-900/70 border border-slate-700/50 text-slate-200 text-sm rounded-full w-full pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Área de usuario, notificaciones y créditos */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Contador de créditos */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-slate-700/80 to-slate-800/80 border border-slate-700/50 px-3 py-1 rounded-full text-white shadow-md">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{user?.credits || 50} créditos</span>
          </div>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-full bg-slate-800 border border-slate-700/50 hover:bg-slate-700 transition-colors relative"
              aria-label="Notificaciones"
            >
              <Bell size={18} className="text-slate-300" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></div>
            </button>
            
            {/* Menú de notificaciones */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 overflow-hidden z-50">
                <div className="p-3 border-b border-slate-700/50">
                  <h3 className="text-white font-medium">Notificaciones</h3>
                </div>
                <div className="p-3">
                  <div className="py-2 px-3 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <p className="text-slate-300 text-sm">Tienes 5 nuevos créditos disponibles</p>
                    <span className="text-slate-400 text-xs">Hace 12 minutos</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Perfil de usuario */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 px-2 py-1 rounded-full shadow-md transition-colors"
              aria-label="Menú de usuario"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium border border-white/20 shadow-inner">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-col hidden md:flex leading-tight">
                <span className="text-sm text-white font-medium">
                  {user?.full_name || 'Usuario'}
                </span>
                <span className="text-xs text-slate-400">
                  {user?.email || 'usuario@ejemplo.com'}
                </span>
              </div>
              <ChevronDown size={16} className="text-slate-400 hidden md:block" />
            </button>
            
            {/* Menú de usuario */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-700/50">
                  <p className="text-white font-medium">{user?.full_name || 'Usuario'}</p>
                  <p className="text-slate-400 text-sm">{user?.email || 'usuario@ejemplo.com'}</p>
                </div>
                
                <div className="p-2">
                  <button className="flex w-full items-center gap-2 p-2 hover:bg-slate-700/50 rounded-lg text-left">
                    <Settings size={16} className="text-slate-400" />
                    <span className="text-slate-200">Configuración</span>
                  </button>
                  <button className="flex w-full items-center gap-2 p-2 hover:bg-slate-700/50 rounded-lg text-left">
                    <CreditCard size={16} className="text-slate-400" />
                    <span className="text-slate-200">Administrar créditos</span>
                  </button>
                  <button 
                    className="flex w-full items-center gap-2 p-2 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-lg text-left"
                    onClick={logout}
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
