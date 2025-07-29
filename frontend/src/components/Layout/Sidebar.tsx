// frontend/src/components/Layout/Sidebar.tsx
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  { id: 'converter', label: 'Conversor', icon: '🎯' },
  { id: 'formats', label: 'Formatos', icon: '📁', badge: '45+' },
  { id: 'history', label: 'Historial', icon: '📊', badge: '12' },
  { id: 'credits', label: 'Créditos', icon: '💎' },
  { id: 'plans', label: 'Planes', icon: '📋' },
  { id: 'faq', label: 'FAQ', icon: '❓' },
  { id: 'ratings', label: 'Valoraciones', icon: '⭐' },
  { id: 'config', label: 'Configuración', icon: '⚙️' },
  { id: 'stats', label: 'Estadísticas', icon: '📈' },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  return (
    <div
      className={`
        fixed left-0 top-0 h-full bg-gradient-to-br from-primary to-secondary
        backdrop-blur-sm border-r border-slate-700/50 shadow-lg rounded-lg
        transition-all duration-300 ease-in-out z-40 transform
        ${isCollapsed ? 'w-16 md:translate-x-0 -translate-x-full' : 'w-72 translate-x-0'}
      `}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        {/* Brand: logo and title only when not collapsed */}
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            {/* Logo icon */}
            <img
              src="/assets/logos/icono-metaform.png"
              alt="Logo Anclora Metaform"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <div className="flex flex-col">
              {/* Brand name split across two lines for clarity */}
              <span className="text-white font-semibold text-sm leading-tight">Anclora Metaform</span>
              <span className="text-white font-semibold text-xs leading-tight">Workspace</span>
            </div>
            {/* Beta badge */}
            <span className="ml-2 text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              Beta
            </span>
          </div>
        )}
        {/* Collapse / expand button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Navegación */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 group
              ${activeTab === item.id
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            
            {!isCollapsed && (
              <>
                <span className="ml-3 flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full font-medium
                    ${activeTab === item.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Actividad Hoy - Solo visible cuando no está colapsado */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="text-white font-medium text-sm mb-2">Actividad Hoy</div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className="text-gray-400">Conversiones</span>
              <span className="ml-auto text-white font-medium">47</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              <span className="text-gray-400">50 créditos</span>
              <span className="ml-auto">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

