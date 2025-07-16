// auth/AuthContext.tsx

// Extiende ImportMeta para soportar import.meta.env en TypeScript
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // agrega otras variables si es necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginData, RegisterData } from '../types/auth';

// --- Lógica de API integrada ---

// 1. Obtenemos la URL base desde las variables de entorno de Vite.
//    Si no está definida, usará '/api' como valor por defecto.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// --- Definición del Contexto y Tipos ---

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Componente Proveedor (Provider) ---

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para verificar si hay un token válido al cargar la app
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // 2. Llamada a la API para obtener los datos del usuario usando el token
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error('Token inválido');

          const currentUser = await response.json();
          setUser(currentUser);

        } catch (error) {
          console.error("Error de autenticación:", error);
          // Si el token no es válido, lo eliminamos
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  // Función para iniciar sesión
  const login = async (data: LoginData) => {
    // 3. Llamada a la API para el login
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const { user, token } = await response.json();
    setUser(user);
    localStorage.setItem('token', token);
  };

  // Función para registrar un nuevo usuario
  const register = async (data: RegisterData) => {
    // 4. Llamada a la API para el registro
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error durante el registro');
    }
    
    const { user, token } = await response.json();
    setUser(user);
    localStorage.setItem('token', token);
  };

  // Función para cerrar sesión (no necesita API)
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    // Opcional: Redirigir al usuario
    // window.location.href = '/login';
  };

  // Función para actualizar datos del usuario localmente
  const updateUser = (u: Partial<User>) => setUser(p => (p ? { ...p, ...u } : null));

  // Valor que se proporciona al resto de la aplicación
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook para consumir el contexto ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};


