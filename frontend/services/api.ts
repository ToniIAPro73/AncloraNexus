// Archivo: frontend/services/api.ts

// --- TIPOS DE DATOS (Interfaces) ---
export interface User {
  id: string;
  full_name: string;
  email: string;
  credits: number;
  plan_info: {
    name: string;
  };
  total_conversions: number;
}

export interface LoginData {
  email: string;
  password?: string; // Hacemos la contraseña opcional si usas login social en el futuro
}

export interface RegisterData {
  full_name: string;
  email: string;
  password?: string;
}


// --- LÓGICA DEL SERVICIO DE API ---

// Función para guardar el token de forma segura
const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

// Función para obtener el token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Función para limpiar el token
const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};


// --- OBJETO apiService (ahora con todas las funciones) ---

export const apiService = {
  // Función de Login simulada
  login: async (data: LoginData): Promise<{ user: User; token: string }> => {
    console.log('Simulando llamada a API de login para:', data.email);
    // En un caso real, aquí iría un fetch() al backend
    const fakeToken = 'fake_jwt_token_12345';
    setAuthToken(fakeToken);
    
    return {
      token: fakeToken,
      user: {
        id: 'user_123',
        full_name: 'Usuario de Prueba',
        email: data.email,
        credits: 100,
        plan_info: { name: 'Básico' },
        total_conversions: 15,
      },
    };
  },

  // Función de Registro simulada
  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    console.log('Simulando llamada a API de registro para:', data.email);
    const fakeToken = 'fake_jwt_token_67890';
    setAuthToken(fakeToken);

    return {
      token: fakeToken,
      user: {
        id: 'user_new_456',
        full_name: data.full_name,
        email: data.email,
        credits: 10,
        plan_info: { name: 'Gratuito' },
        total_conversions: 0,
      },
    };
  },

  // Función de Logout simulada
  logout: () => {
    console.log('Simulando logout...');
    clearToken();
  },
  
  // Función para verificar un token simulada
  verifyToken: async (): Promise<{ valid: boolean; user: User | null }> => {
    const token = getAuthToken();
    if (token) {
        console.log('Token encontrado, verificando...');
        // Simulamos una llamada al backend que devuelve el perfil del usuario
        return { valid: true, user: await apiService.getProfile() };
    }
    return { valid: false, user: null };
  },

  // Función para obtener perfil de usuario simulada
  getProfile: async (): Promise<User> => {
      console.log('Obteniendo perfil de usuario desde el backend...');
      return {
        id: 'user_123',
        full_name: 'Usuario de Prueba',
        email: 'ancoratest@dominio.com',
        credits: 100,
        plan_info: { name: 'Básico' },
        total_conversions: 15,
      };
  },
  
  clearToken,
};

// El resto de funciones de ayuda se mantienen igual
export const getConversionCost = (fromFormat: string, toFormat: string): number => { return 2; };
export const formatFileSize = (bytes: number): string => { /* ... */ return `${bytes} Bytes`; };