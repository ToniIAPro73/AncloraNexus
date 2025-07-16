export interface AuthResponse {
  user: import('../types/auth').User;
  token: string;
}

// URL base configurable mediante variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('Request failed');
  return res.json() as Promise<T>;
}

export const authService = {
  async login(data: import('../types/auth').LoginData): Promise<AuthResponse> {
    return request<AuthResponse>(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async register(data: import('../types/auth').RegisterData): Promise<AuthResponse> {
    return request<AuthResponse>(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getCurrentUser(): Promise<import('../types/auth').User> {
    const token = localStorage.getItem('token');
    return request<import('../types/auth').User>(`${API_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default authService;
