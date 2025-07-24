// frontend/src/components/Layout.tsx
import React, { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

// Componentes de navegación con estilos de la guía
const NavItem: React.FC<{
  icon: string;
  label: string;
  isActive?: boolean;
  badge?: string | number;
  onClick?: () => void;
}> = ({ icon, label, isActive, badge, onClick }) => (
  <div
    onClick={onClick}
    className={}
  >
    <div className="mr-3 text-xl">{icon}</div>
    <span>{label}</span>
    {badge && (
      <span
        className={}
      >
        {badge}
      </span>
    )}
  </div>
);

// Componente Layout principal
interface LayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab = "conversor",
  onTabChange = () => {},
}) => {
  const { user } = useAuth();

  const tabs = [
    { id: "conversor", icon: "??", label: "Conversor" },
    { id: "formatos", icon: "??", label: "Formatos", badge: "45+" },
    { id: "historial", icon: "??", label: "Historial", badge: 12 },
    { id: "creditos", icon: "??", label: "Créditos" },
    { id: "planes", icon: "??", label: "Planes", badge: "Pro" },
    { id: "faq", icon: "?", label: "FAQ" },
    { id: "valoraciones", icon: "?", label: "Valoraciones" },
    { id: "configuracion", icon: "??", label: "Configuración" },
    { id: "estadisticas", icon: "??", label: "Estadísticas" },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white font-inter">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 flex flex-col">
        {/* Logo y nombre */}
        <div className="flex items-center p-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl mr-3">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold">Anclora Workspace</h1>
            <span className="text-xs bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">
              Beta
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {tabs.map((tab) => (
            <NavItem
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              badge={tab.badge}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </nav>

        {/* Actividad */}
        <div className="p-4 border-t border-gray-700/50">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Actividad Hoy
          </h4>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Conversiones</span>
            <span className="font-semibold text-white">47</span>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabecera Superior (Header) */}
        <header className="flex items-center justify-end p-3 bg-gray-800 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm font-semibold bg-gray-700/50 px-3 py-1.5 rounded-lg">
              <span className="text-primary mr-2">??</span>
              <span>{user?.credits || 50} créditos</span>
            </div>

            <div className="relative">
              <button
                className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold"
                aria-label="Menú de usuario"
              >
                ??
              </button>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-gray-800"></span>
            </div>
          </div>
        </header>

        {/* Contenido de la Página */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

