export interface AuthResponse {
  user: import('../types/auth').User;
  token: string;
}

const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('Request failed');
  return res.json() as Promise<T>;
}

export const authService = {
  async login(data: import('../types/auth').LoginData): Promise<AuthResponse> {
    return request<AuthResponse>(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async register(data: import('../types/auth').RegisterData): Promise<AuthResponse> {
    return request<AuthResponse>(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getCurrentUser(): Promise<import('../types/auth').User> {
    const token = localStorage.getItem('token');
    return request<import('../types/auth').User>(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default authService;
