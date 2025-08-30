// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'premium' | 'business';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulamos cargar la información del usuario desde localStorage o una API
  useEffect(() => {
    const loadUser = async () => {
      try {
        // En un caso real, esto vendría de una API o localStorage
        const savedUser = localStorage.getItem('anclora_user');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Usuario de prueba para desarrollo
          const testUser = {
            id: '123456',
            name: 'Usuario Test',
            email: 'test@anclora.com',
            plan: 'free' as const
          };
          setUser(testUser);
          localStorage.setItem('anclora_user', JSON.stringify(testUser));
        }
      } catch (err) {
        setError('Error al cargar la información del usuario');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Función para iniciar sesión
  const login = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      // En un caso real, esto sería una llamada a una API
      // Simulamos una respuesta exitosa
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        plan: 'free' as const
      };
      
      setUser(mockUser);
      localStorage.setItem('anclora_user', JSON.stringify(mockUser));
      return true;
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      // En un caso real, esto podría incluir llamadas a una API
      localStorage.removeItem('anclora_user');
      setUser(null);
      return true;
    } catch (err) {
      setError('Error al cerrar sesión');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para actualizar el plan del usuario
  const updateUserPlan = useCallback((plan: 'free' | 'premium' | 'business') => {
    if (user) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      localStorage.setItem('anclora_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    updateUserPlan
  };
};
