﻿import React, { useState } from 'react';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const userInfo = {
    name: "Ana GarcÃ­a",
    email: "ana.garcia@email.com",
    plan: "Pro",
    avatar: "ðŸ‘©â€ðŸ’¼"
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-slate-700/50 rounded-lg px-3 py-2 hover:bg-slate-600/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400">ðŸ’Ž</span>
          <span className="text-white font-medium">50 crÃ©ditos</span>
        </div>
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">{userInfo.avatar}</span>
        </div>
        <span className="text-slate-300 text-sm">â–¼</span>
      </button>

      {isOpen && (
        <div className="user-menu dropdown-unified w-80 shadow-xl">
          {/* User Info Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">{userInfo.avatar}</span>
              </div>
              <div>
                <h3 className="text-h3 text-white font-medium">{userInfo.name}</h3>
                <p className="text-slate-400 text-sm">{userInfo.email}</p>
                <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full mt-1">
                  Plan {userInfo.plan}
                </span>
              </div>
            </div>
          </div>

          {/* Credits & Usage */}
          <div className="p-4 border-b border-slate-700/50">
            <h4 className="text-h4 text-slate-300 font-medium mb-3">Tu Actividad</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">CrÃ©ditos disponibles</span>
                <span className="text-cyan-400 font-medium">50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Conversiones hoy</span>
                <span className="text-green-400 font-medium">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">CrÃ©ditos usados</span>
                <span className="text-orange-400 font-medium">156</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '68%'}}></div>
              </div>
              <p className="text-slate-400 text-xs">68% del lÃ­mite mensual usado</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-slate-700/50">
            <h4 className="text-h4 text-slate-300 font-medium mb-3">Acciones RÃ¡pidas</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <span className="text-blue-400">ðŸ’³</span>
                <span className="text-white text-sm">Comprar mÃ¡s crÃ©ditos</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <span className="text-purple-400">â¬†ï¸</span>
                <span className="text-white text-sm">Actualizar plan</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <span className="text-green-400">ðŸ“Š</span>
                <span className="text-white text-sm">Ver estadÃ­sticas</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <span className="text-slate-400">âš™ï¸</span>
                <span className="text-white text-sm">ConfiguraciÃ³n</span>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="p-4">
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <span className="text-slate-400">ðŸ‘¤</span>
                <span className="text-white text-sm">Editar perfil</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <span className="text-slate-400">ðŸ”’</span>
                <span className="text-white text-sm">Privacidad y seguridad</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <span className="text-slate-400">â“</span>
                <span className="text-white text-sm">Ayuda y soporte</span>
              </button>
              <hr className="border-slate-700/50 my-2" />
              <button className="w-full flex items-center space-x-3 p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                <span className="text-red-400">ðŸšª</span>
                <span className="text-red-400 text-sm">Cerrar sesiÃ³n</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


