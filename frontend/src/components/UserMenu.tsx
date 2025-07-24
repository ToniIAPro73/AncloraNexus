import React, { useState } from 'react';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const userInfo = {
    name: "Ana García",
    email: "ana.garcia@email.com",
    plan: "Pro",
    avatar: "👩‍💼"
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-neutral-700/50 rounded-lg px-3 py-2 hover:bg-neutral-700/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400">💎</span>
          <span className="text-white font-medium">50 créditos</span>
        </div>
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">{userInfo.avatar}</span>
        </div>
        <span className="text-neutral-200 text-sm">▼</span>
      </button>

      {isOpen && (
        <div className="user-menu dropdown-unified w-80 shadow-xl">
          {/* User Info Header */}
          <div className="p-4 border-b border-neutral-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">{userInfo.avatar}</span>
              </div>
              <div>
                <h3 className="text-white font-medium">{userInfo.name}</h3>
                <p className="text-neutral-600 text-sm">{userInfo.email}</p>
                <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full mt-1">
                  Plan {userInfo.plan}
                </span>
              </div>
            </div>
          </div>

          {/* Credits & Usage */}
          <div className="p-4 border-b border-neutral-700/50">
            <h4 className="text-neutral-200 font-medium mb-3">Tu Actividad</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 text-sm">Créditos disponibles</span>
                <span className="text-cyan-400 font-medium">50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 text-sm">Conversiones hoy</span>
                <span className="text-green-400 font-medium">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 text-sm">Créditos usados</span>
                <span className="text-orange-400 font-medium">156</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2 mt-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '68%'}}></div>
              </div>
              <p className="text-neutral-600 text-xs">68% del límite mensual usado</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-neutral-700/50">
            <h4 className="text-neutral-200 font-medium mb-3">Acciones Rápidas</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-neutral-700/50 rounded-lg transition-colors">
                <span className="text-blue-400">💳</span>
                <span className="text-white text-sm">Comprar más créditos</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-neutral-700/50 rounded-lg transition-colors">
                <span className="text-purple-400">⬆️</span>
                <span className="text-white text-sm">Actualizar plan</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-neutral-700/50 rounded-lg transition-colors">
                <span className="text-green-400">📊</span>
                <span className="text-white text-sm">Ver estadísticas</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-neutral-700/50 rounded-lg transition-colors">
                <span className="text-neutral-600">⚙️</span>
                <span className="text-white text-sm">Configuración</span>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="p-4">
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-neutral-700/50 rounded-lg transition-colors">
                <span className="text-neutral-600">👤</span>
                <span className="text-white text-sm">Editar perfil</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-neutral-700/50 rounded-lg transition-colors">
                <span className="text-neutral-600">🔒</span>
                <span className="text-white text-sm">Privacidad y seguridad</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-neutral-700/50 rounded-lg transition-colors">
                <span className="text-neutral-600">❓</span>
                <span className="text-white text-sm">Ayuda y soporte</span>
              </button>
              <hr className="border-neutral-700/50 my-2" />
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                <span className="text-red-400">🚪</span>
                <span className="text-red-400 text-sm">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

