import { apiService } from './api';

interface ServiceResult {
  success: boolean;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signIn(email: string, password: string): Promise<ServiceResult> {
    try {
      await apiService.login({ email, password });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async signInWithGoogle(): Promise<ServiceResult> {
    return { success: false, error: 'Not implemented' };
  }

  async requestPasswordReset(email: string): Promise<ServiceResult> {
    try {
      await apiService.requestPasswordReset(email);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}

