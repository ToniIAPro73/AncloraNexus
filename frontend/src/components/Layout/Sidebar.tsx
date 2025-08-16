import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Home, FileText, Settings, User, CreditCard } from 'lucide-react';
import AccessibleIcon from '../AccessibleIcon';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  // Ahora useRef está correctamente importado
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Conversiones', path: '/conversions' },
    { icon: CreditCard, label: 'Créditos', path: '/credits' },
    { icon: User, label: 'Perfil', path: '/profile' },
    { icon: Settings, label: 'Configuración', path: '/settings' }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-blue-600">Anclora</h1>
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
                ref={(el) => { itemRefs.current[index] = el; }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`flex items-center w-full px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${
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
