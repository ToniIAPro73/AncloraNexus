// Servicio de API para conectar frontend con backend
const API_BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

// Tipos de datos
import type { User } from "../../../frontend/src/types/User";

export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ConversionRequest {
  file: File;
  target_format: string;
  quality?: string;
}

export interface ConversionResponse {
  id: number;
  status: string;
  output_filename?: string;
  download_url?: string;
  credits_used: number;
  processing_time?: number;
  error_message?: string;
}

// Clase para manejar la API
class ApiService {
  private token: string | null = null;

  constructor() {
    // Cargar token del localStorage si existe
    this.token = localStorage.getItem("auth_token");
  }

  // Configurar token de autenticación
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  // Limpiar token
  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  // Obtener headers con autenticación
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para hacer peticiones
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true,
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Autenticación
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    );

    this.setToken(response.access_token);
    return response;
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    );

    this.setToken(response.access_token);
    return response;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async getProfile(): Promise<{ user: User }> {
    return await this.request<{ user: User }>("/auth/profile");
  }

  async updateProfile(
    data: Partial<User>,
  ): Promise<{ user: User; message: string }> {
    return await this.request<{ user: User; message: string }>(
      "/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return await this.request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    return await this.request<{ valid: boolean; user: User }>(
      "/auth/verify-token",
    );
  }

  // Conversiones
  async convertFile(data: ConversionRequest): Promise<ConversionResponse> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("target_format", data.target_format);
    if (data.quality) {
      formData.append("quality", data.quality);
    }

    const response = await fetch(`${API_BASE_URL}/conversion/convert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async getConversionHistory(): Promise<{ conversions: any[] }> {
    return await this.request<{ conversions: any[] }>("/conversion/history");
  }

  async downloadConversion(conversionId: number): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/conversion/download/${conversionId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error downloading file: ${response.statusText}`);
    }

    return await response.blob();
  }

  // Créditos
  async getCreditBalance(): Promise<{ balance: number; transactions: any[] }> {
    return await this.request<{ balance: number; transactions: any[] }>(
      "/credits/balance",
    );
  }

  async purchaseCredits(
    amount: number,
  ): Promise<{ message: string; new_balance: number }> {
    return await this.request<{ message: string; new_balance: number }>(
      "/credits/purchase",
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      },
    );
  }

  async upgradePlan(newPlan: string): Promise<{ message: string; user: User }> {
    return await this.request<{ message: string; user: User }>(
      "/credits/upgrade-plan",
      {
        method: "POST",
        body: JSON.stringify({ plan: newPlan }),
      },
    );
  }

  // Verificar salud del API
  async healthCheck(): Promise<{
    status: string;
    service: string;
    version: string;
  }> {
    return await this.request<{
      status: string;
      service: string;
      version: string;
    }>("/health", {}, false);
  }
}

// Instancia singleton del servicio
export const apiService = new ApiService();

// Hook personalizado para usar la API con React
export const useApi = () => {
  return apiService;
};

// Utilidades
export const isTokenValid = async (): Promise<boolean> => {
  try {
    const response = await apiService.verifyToken();
    return response.valid;
  } catch {
    return false;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const getConversionCost = (
  fromFormat: string,
  toFormat: string,
): number => {
  const conversionKey = `${fromFormat.toLowerCase()}-${toFormat.toLowerCase()}`;

  // Costos básicos por tipo de conversión
  const costs: Record<string, number> = {
    "txt-html": 1,
    "txt-pdf": 1,
    "txt-doc": 2,
    "txt-docx": 2,
    "txt-md": 1,
    "txt-rtf": 1,
    "txt-odt": 2,
    "txt-tex": 3,
    "pdf-jpg": 3,
    "pdf-png": 3,
    "jpg-png": 1,
    "png-jpg": 1,
  };

  return costs[conversionKey] || 2; // Costo por defecto
};
