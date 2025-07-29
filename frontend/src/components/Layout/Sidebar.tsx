// frontend/src/components/Layout/Sidebar.tsx
import React from "react";
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

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full z-40 bg-gradient-to-b from-slate-950 to-slate-800 text-white shadow-md transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Branding */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <img src="/icono-metaform.png" alt="Logo" className="w-8 h-8" />
        {!isCollapsed && (
          <span className="text-base font-semibold tracking-wide">
            Anclora Metaform Workspace
          </span>
        )}
      </div>

      {/* Menu principal */}
      <nav className="flex flex-col px-2 py-4 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.name}
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
  );
};
