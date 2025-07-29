// frontend/src/components/Layout/Sidebar.tsx
import React, { useMemo } from "react";
import {
  Home, FileText, History, CreditCard, Star,
  Settings, HelpCircle, BarChart, LogOut, Award
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
  // Memoizar los elementos del menú para evitar recreaciones innecesarias
  const menuItems = useMemo(() => [
    { name: "Conversor", icon: Home },
    { name: "Formatos", icon: FileText },
    { name: "Historial", icon: History },
    { name: "Créditos", icon: CreditCard },
    { name: "Planes", icon: Star },
    { name: "FAQ", icon: HelpCircle },
    { name: "Valoraciones", icon: Award }, // Cambiado de Star a Award para evitar duplicación
    { name: "Configuración", icon: Settings },
    { name: "Estadísticas", icon: BarChart },
  ], []);

  // Memoizar la URL del logo para evitar recreaciones innecesarias
  const logoUrl = useMemo(() => {
    const baseUrl = process.env.PUBLIC_URL || '';
    return `${baseUrl}/assets/logos/icono-metaform.png`;
  }, []);

  return (
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
            {/* Logo icon con manejo de errores */}
            <img
              src={logoUrl}
              alt="Logo Anclora Metaform"
              className="w-8 h-8 rounded-lg object-contain"
              onError={(e) => {
                // Fallback a un icono genérico si la imagen no carga
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path></svg>';
              }}
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

      {/* Menu principal */}
      <nav className="flex flex-col px-2 py-4 space-y-1">
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <Button
              key={item.name}
              variant={activeTab === item.name ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-left px-3 py-2 rounded-lg",
                activeTab === item.name && "bg-blue-600 hover:bg-blue-500"
              )}
              onClick={() => setActiveTab(item.name)}
              aria-current={activeTab === item.name ? "page" : undefined}
              aria-label={`Ir a ${item.name}`}
            >
              <item.icon className="w-5 h-5" aria-hidden="true" />
              {!isCollapsed && <span>{item.name}</span>}
            </Button>
          ))
        ) : (
          <div className="text-gray-400 text-center py-4">No hay elementos de menú disponibles</div>
        )}
      </nav>

      {/* Cierre de sesión */}
      <div className="absolute bottom-0 w-full px-2 py-3 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-left px-3 py-2 text-red-400 hover:text-red-300"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          {!isCollapsed && <span>Salir</span>}
        </Button>
      </div>
    </aside>
  );
};
