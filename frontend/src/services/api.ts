// --- TIPOS DE DATOS (Interfaces) ---
import type { User } from '../types/User';

export interface LoginData {
  email: string;
  password?: string; // Se mantiene opcional por si se implementa login social
}

export interface RegisterData {
  full_name: string;
  email: string;
  password?: string;
}

// --- LÓGICA DEL SERVICIO DE API ---

// URL base de la API. En el futuro, esto debería venir de un archivo .env
const API_BASE_URL = 'http://localhost:8000/api';

// --- Funciones de Ayuda para el Token ---
const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// --- OBJETO apiService (con todas las funciones reales) ---
export const apiService = {
  // --- Funciones de Autenticación ---
  login: async (data: LoginData): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || 'Error en el inicio de sesión');
    }
    setAuthToken(responseData.access_token);
    return { token: responseData.access_token, user: responseData.user };
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.error || 'Error en el registro');
    }
    setAuthToken(responseData.access_token);
    return { token: responseData.access_token, user: responseData.user };
  },

  logout: () => {
    console.log('Cerrando sesión...');
    clearToken();
  },

  verifyToken: async (): Promise<{ valid: boolean; user: User | null }> => {
    const token = getAuthToken();
    if (!token) return { valid: false, user: null };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        clearToken();
        return { valid: false, user: null };
      }
      const data = await response.json();
      return { valid: data.valid, user: data.user };
    } catch (error) {
      clearToken();
      return { valid: false, user: null };
    }
  },

  getProfile: async (): Promise<User> => {
    const token = getAuthToken();
    if (!token) throw new Error('No hay token de autenticación');
    
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        if (response.status === 401) clearToken();
        throw new Error('Error obteniendo el perfil de usuario');
    }
    const data = await response.json();
    return data.user;
  },

  clearToken,

  // --- Funciones de Conversión ---
  convertFile: async (payload: { file: File; target_format: string; }): Promise<any> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('target_format', payload.target_format);
    
    const response = await fetch(`${API_BASE_URL}/conversion/convert`, { // Asumiendo que esta es la ruta
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en la conversión');
    return data;
  },

  downloadConversion: async (conversionId: string | number): Promise<Blob> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/conversion/download/${conversionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al descargar el archivo');
    return response.blob();
  },
};


// --- Funciones de Ayuda (Helpers) ---
export const getConversionCost = (fromFormat: string, toFormat: string): number => {
  // En el futuro, esto podría hacer una llamada a la API para obtener costes dinámicos
  return 2; 
};
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};