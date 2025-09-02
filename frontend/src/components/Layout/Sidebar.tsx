import React, { useRef, useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Home, Settings, CreditCard, History,
  BarChart2, HelpCircle, Star, Clock, FileIcon, Zap
} from 'lucide-react';
import AccessibleIcon from '../AccessibleIcon';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: {
    count: string | number;
    color: string;
  };
  isNew?: boolean;
  submenu?: { label: string; path: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [showSubmenu] = useState<string | null>(null);
  const [userActivity] = useState({
    conversionsToday: 4,
    creditsUsed: 7,
    lastConversion: '12:45'
  });

  // Detecta si se debe cambiar a modo móvil
  const [_isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % itemRefs.current.length;
      itemRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = index === 0 ? itemRefs.current.length - 1 : index - 1;
      itemRefs.current[prevIndex]?.focus();
    }
  };

  const menuItems: MenuItem[] = [
    { 
      icon: Home, 
      label: 'Inicio', 
      path: '/' 
    },
    { 
      icon: Zap, 
      label: 'Conversor', 
      path: '/conversor',
      badge: { count: 'AI', color: 'bg-gradient-to-r from-blue-500 to-purple-600' },
      isNew: true
    },
    { 
      icon: FileIcon, 
      label: 'Formatos', 
      path: '/formats',
      badge: { count: '45+', color: 'bg-blue-600' } 
    },
    { 
      icon: History, 
      label: 'Historial', 
      path: '/history' 
    },
    { 
      icon: CreditCard, 
      label: 'Créditos', 
      path: '/credits' 
    },
    { 
      icon: BarChart2, 
      label: 'Planes', 
      path: '/plans',
      submenu: [
        { label: 'Comparativa', path: '/plans/compare' },
        { label: 'Empresas', path: '/plans/business' },
      ]
    },
    { 
      icon: HelpCircle, 
      label: 'Ayuda', 
      path: '/help' 
    },
    { 
      icon: Star, 
      label: 'Valoraciones', 
      path: '/ratings',
      badge: { count: 'Nuevo', color: 'bg-green-600' } 
    },
    { 
      icon: Settings, 
      label: 'Configuración', 
      path: '/settings' 
    },
    {
      icon: BarChart2,
      label: 'Estadísticas',
      path: '/stats'
    }
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 backdrop-blur-sm z-40 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Logo y título */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        {!isCollapsed && (
          <div className="flex items-center">
            <img
              src="/images/logos/Anclora Nexus fondo transparente.jpeg"
              alt="Anclora Nexus"
              className="h-12 w-auto object-contain bg-transparent"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
        )}
        {isCollapsed && (
          <img
            src="/images/logos/Anclora Nexus fondo transparente.jpeg"
            alt="Anclora Nexus"
            className="h-10 w-auto mx-auto object-contain bg-transparent"
            style={{ mixBlendMode: 'multiply' }}
          />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white transition-colors"
        >
          {isCollapsed ? (
            <AccessibleIcon label="Expandir menú">
              <ChevronRight size={18} />
            </AccessibleIcon>
          ) : (
            <AccessibleIcon label="Contraer menú">
              <ChevronLeft size={18} />
            </AccessibleIcon>
          )}
        </button>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={item.path}>
              <button
                ref={(el: HTMLButtonElement | null) => { itemRefs.current[index] = el; }}
                onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => handleKeyDown(e, index)}
                onClick={() => setActiveTab(item.label)}
                className={`
                  flex items-center w-full px-3 py-2.5 rounded-lg group transition-all duration-300
                  ${activeTab === item.label 
                    ? 'bg-gradient-to-r from-primary/90 to-secondary/90 text-white shadow-lg shadow-primary/20' 
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'}
                  ${isCollapsed ? 'justify-center' : 'justify-between'}
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    ${activeTab === item.label 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }
                    p-1.5 rounded-md transition-colors
                  `}>
                    <item.icon size={16} />
                  </div>
                  
                  {!isCollapsed && (
                    <span className={`ml-3 text-sm font-medium ${
                      item.isNew ? 'relative after:content-[""] after:absolute after:top-0 after:-right-2 after:w-2 after:h-2 after:bg-green-500 after:rounded-full' : ''
                    }`}>
                      {item.label}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && item.badge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${item.badge.color} text-white font-medium`}>
                    {item.badge.count}
                  </span>
                )}
              </button>
              
              {/* Submenús (visible solo cuando el sidebar está expandido) */}
              {!isCollapsed && item.submenu && showSubmenu === item.path && (
                <ul className="ml-8 mt-1 space-y-1">
                  {item.submenu.map(subItem => (
                    <li key={subItem.path}>
                      <button
                        onClick={() => setActiveTab(subItem.label)}
                        className={`
                          text-sm w-full px-3 py-1.5 rounded-md flex items-center
                          ${activeTab === subItem.label 
                            ? 'bg-primary/20 text-primary' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                          }
                        `}
                      >
                        <div className="w-1 h-1 rounded-full bg-current mr-2"></div>
                        {subItem.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Actividad del usuario - solo visible cuando no está colapsado */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-slate-900/0">
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Actividad Hoy</p>
            
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Conversiones</span>
              <span className="font-medium">{userActivity.conversionsToday}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Créditos usados</span>
              <span className="font-medium">{userActivity.creditsUsed}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Última conversión</span>
              <div className="flex items-center font-medium">
                <Clock size={12} className="mr-1" />
                <span>{userActivity.lastConversion}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

