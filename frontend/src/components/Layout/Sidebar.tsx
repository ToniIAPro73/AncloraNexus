// frontend/src/components/Layout/Sidebar.tsx

import React from "react";
import { motion } from "framer-motion";

import {
  Home, FileText, History, CreditCard, Star,
  Settings, HelpCircle, BarChart, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

  export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    isCollapsed,
    setIsCollapsed,
  }) => {
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (index + 1) % itemRefs.current.length;
        itemRefs.current[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (index - 1 + itemRefs.current.length) % itemRefs.current.length;
        itemRefs.current[prev]?.focus();
      }
    };

    const toggleCollapse = () => {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      if (!newState) {
        setTimeout(() => itemRefs.current[0]?.focus(), 0);
      }
    };
  const menuItems = [
    { name: "Conversor", icon: Home },
    { name: "Formatos", icon: FileText },
    { name: "Historial", icon: History },
    { name: "Créditos", icon: CreditCard },
    { name: "Planes", icon: Star },
    { name: "FAQ", icon: HelpCircle },
    { name: "Valoraciones", icon: Star },
    { name: "Configuración", icon: Settings },
    { name: "Estadísticas", icon: BarChart },
  ];


  const sidebarVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={sidebarVariants}>
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 bg-gradient-to-b from-slate-950 to-slate-800 text-white shadow-md transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-72"
        )}
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
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-expanded={!isCollapsed}
            aria-controls="sidebar-menu"
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-gray-400 hover:text-white transition-colors"
          >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Menu principal */}
        <nav id="sidebar-menu" className="flex flex-col px-2 py-4 space-y-1" role="menu">
          {menuItems.map((item, index) => (
            <Button
              key={item.name}
              role="menuitem"
              aria-current={activeTab === item.name ? 'page' : undefined}
              ref={(el) => (itemRefs.current[index] = el)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              variant={activeTab === item.name ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-left px-3 py-2 rounded-lg",
                activeTab === item.name && "bg-blue-600 hover:bg-blue-500"
              )}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.name}</span>}
            </Button>
          ))}
        </nav>

      {/* Cierre de sesión */}
      <div className="absolute bottom-0 w-full px-2 py-3 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-left px-3 py-2 text-red-400 hover:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Salir</span>}
        </Button>
      </div>
      </aside>
    </motion.div>
  );
};
