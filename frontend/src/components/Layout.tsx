// archivo: frontend/components/Layout.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

// Pequeños componentes para la barra lateral
const NavItem = ({ icon, label, isActive, count }: { icon: string; label: string; isActive?: boolean; count?: number }) => (
  <a href="#" className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-500/20 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}>
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
    {count && <span className="ml-auto bg-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full">{count}</span>}
  </a>
);

const ActivityItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
    </div>
);

// Componente Layout principal
export const Layout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 flex-shrink-0 bg-slate-800/50 border-r border-slate-700/50 p-4 flex flex-col justify-between">
        <div>
          <div className="px-4 mb-8">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Anclora Workspace</h1>
            <span className="text-xs bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <nav className="space-y-2">
            <NavItem icon="©️" label="Conversor" isActive={true} />
            <NavItem icon="📊" label="Historial" count={12} />
            <NavItem icon="💎" label="Créditos" />
            <NavItem icon="💳" label="Planes" />
            <NavItem icon="⚙️" label="Configuración" />
            <NavItem icon="📈" label="Estadísticas" />
          </nav>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actividad Hoy</h4>
            <ActivityItem label="Conversiones" value={47} />
            <ActivityItem label="Créditos usados" value={156} />
            <ActivityItem label="Nivel" value="Pro" />
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Cabecera Superior (Header) */}
        <header className="flex items-center justify-end p-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm font-semibold bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <span className="text-yellow-400 mr-2">💎</span>
                    <span>{user?.credits || 50} créditos</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full cursor-pointer">
                    {/* Avatar del usuario */}
                </div>
            </div>
        </header>

        {/* Contenido de la Página */}
        <main className="p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};