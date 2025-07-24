import React, { ReactNode, useState } from "react";
import { useAuth } from "../auth/AuthContext";

interface NavItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, badge, onClick }) => (
  <div onClick={onClick} className={`sidebar-nav-item${isActive ? " active" : ""}`}>
    <div className="sidebar-nav-icon">{icon}</div>
    <span>{label}</span>
    {badge && (
      <span className={`sidebar-badge ${badge === "Pro" ? "pro" : "count"}`}>{badge}</span>
    )}
  </div>
);

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: "conversor", icon: "📂", label: "Conversor" },
    { id: "formatos", icon: "📑", label: "Formatos", badge: "45+" },
    { id: "historial", icon: "🕑", label: "Historial", badge: 12 },
    { id: "creditos", icon: "💳", label: "Créditos" },
    { id: "planes", icon: "💡", label: "Planes", badge: "Pro" },
    { id: "faq", icon: "❔", label: "FAQ" },
    { id: "valoraciones", icon: "⭐", label: "Valoraciones" },
    { id: "configuracion", icon: "⚙️", label: "Configuración" },
    { id: "estadisticas", icon: "📊", label: "Estadísticas" },
  ];

  return (
    <div className="flex h-screen bg-neutral-900 text-white font-inter">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-neutral-800 flex-col">
        <div className="flex items-center p-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl mr-3">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold">Anclora Workspace</h1>
            <span className="text-xs bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">Beta</span>
          </div>
        </div>
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
        <div className="p-4 border-t border-neutral-700/50">
          <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">Actividad Hoy</h4>
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Conversiones</span>
            <span className="font-semibold text-white">47</span>
          </div>
        </div>
      </aside>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-neutral-800 flex flex-col">
            <button className="self-end m-4" onClick={() => setMobileOpen(false)}>✕</button>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {tabs.map((tab) => (
                <NavItem
                  key={tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  isActive={activeTab === tab.id}
                  badge={tab.badge}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileOpen(false);
                  }}
                />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-end md:justify-end p-3 bg-neutral-800 border-b border-neutral-700/50">
          <button className="md:hidden mr-auto" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            ☰
          </button>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm font-semibold bg-neutral-700/50 px-3 py-1.5 rounded-lg">
              <span className="text-primary mr-2">💎</span>
              <span>{user?.credits || 50} créditos</span>
            </div>
            <div className="relative">
              <button
                className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold"
                aria-label="Menú de usuario"
              >
                👤
              </button>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-neutral-700" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

