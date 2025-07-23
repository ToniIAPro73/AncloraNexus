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
  password?: string;
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

  // --- AÑADIDO: Funciones de conversión que faltaban ---
  convertFile: async (payload: { file: File; target_format: string; }): Promise<any> => {
    console.log('Simulando la subida y conversión del archivo:', payload.file.name);
    // Simulamos una respuesta exitosa del backend
    return Promise.resolve({
      success: true,
      id: 'conversion_123',
      download_url: '/api/download/conversion_123',
      output_filename: `convertido.${payload.target_format}`
    });
  },

  downloadConversion: async (conversionId: string): Promise<Blob> => {
    console.log('Simulando la descarga para la conversión:', conversionId);
    // Simulamos la descarga de un archivo creando un "Blob" de texto vacío
    const fakeBlob = new Blob(["Este es el contenido del archivo convertido de prueba."], { type: "text/plain" });
    return Promise.resolve(fakeBlob);
  }
};

// El resto de funciones de ayuda se mantienen igual
export const getConversionCost = (fromFormat: string, toFormat: string): number => { return 2; };
export const formatFileSize = (bytes: number): string => { 
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};