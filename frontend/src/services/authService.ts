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
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async signInWithGoogle(): Promise<ServiceResult> {
    try {
      // Placeholder for Google OAuth integration
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async signUp(fullName: string, email: string, password: string): Promise<ServiceResult> {
    try {
      await apiService.register({ full_name: fullName, email, password });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async requestPasswordReset(email: string): Promise<ServiceResult> {
    try {
      await apiService.requestPasswordReset(email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export default AuthService;
