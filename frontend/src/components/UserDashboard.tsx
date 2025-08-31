import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="p-6">
      <h2 className="text-h2 mb-2">Perfil</h2>
      <p className="text-sm text-slate-300">Nombre: {user.full_name || user.name}</p>
      <p className="text-sm text-slate-300">Email: {user.email}</p>
      <p className="text-sm text-slate-300">Plan: {user.plan || 'free'}</p>
      <button className="mt-4 px-4 py-2 rounded bg-red-600 text-white" onClick={logout}>Cerrar sesiÃ³n</button>
    </div>
  );
};

export default UserDashboard;


