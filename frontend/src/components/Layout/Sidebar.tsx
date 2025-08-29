import React, { useRef, useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Home, FileText, Settings, User, CreditCard, History,
  BarChart2, HelpCircle, Star, Clock, FileIcon, MessageCircle, Zap, Book
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
  const [showSubmenu, setShowSubmenu] = useState<string | null>(null);
  const [userActivity, setUserActivity] = useState({
    conversionsToday: 4,
    creditsUsed: 7,
    lastConversion: '12:45'
  });

  // Detecta si se debe cambiar a modo móvil
  const [isMobile, setIsMobile] = useState(false);
  
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
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img 
              src="/images/logos/logo-anclora-nexus.png" 
              alt="Anclora Nexus" 
              className="h-8 w-auto"
            />
            <h1 className="text-h1 font-bold text-emerald-600">Anclora Nexus</h1>
          </div>
        )}
        {isCollapsed && (
          <img 
            src="/images/logos/logo-anclora-nexus.png" 
            alt="Anclora Nexus" 
            className="h-8 w-auto mx-auto"
          />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <AccessibleIcon label="Expandir menú">
              <ChevronRight size={20} />
            </AccessibleIcon>
          ) : (
            <AccessibleIcon label="Contraer menú">
              <ChevronLeft size={20} />
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
                className={`flex items-center w-full px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  activeTab === item.label ? 'bg-blue-100 text-blue-600' : ''
                } ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                }`}
              >
                <AccessibleIcon label={item.label}>
                  <item.icon size={20} />
                </AccessibleIcon>
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
