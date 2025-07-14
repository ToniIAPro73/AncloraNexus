import { createClient } from '@supabase/supabase-js';
import { User, Session, AuthError } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para el servicio de autenticación
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  company?: string;
  website?: string;
  country?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  email_verified: boolean;
  marketing_consent: boolean;
  signup_source?: string;
  referral_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at?: string;
  trial_start?: string;
  trial_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  payment_method?: string;
  auto_renew: boolean;
  plan?: SubscriptionPlan;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_conversions_per_month: number;
  max_file_size_mb: number;
  max_batch_conversions: number;
  max_concurrent_conversions: number;
  features: Record<string, boolean>;
  is_active: boolean;
  sort_order: number;
}

export interface UserLimits {
  id: string;
  user_id: string;
  max_conversions_per_month: number;
  max_file_size_mb: number;
  max_batch_conversions: number;
  max_concurrent_conversions: number;
  current_month_conversions: number;
  current_concurrent_conversions: number;
  last_reset_date: string;
  temporary_limit_boost: number;
  boost_expires_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: UserSubscription;
  error?: string;
}

export interface LimitsResponse {
  success: boolean;
  limits?: UserLimits;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Registrar nuevo usuario
   */
  async signUp(
    email: string, 
    password: string, 
    metadata?: {
      full_name?: string;
      company?: string;
      signup_source?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      referral_code?: string;
    }
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        };
      }

      // Registrar evento de signup
      if (data.user) {
        await this.logUserEvent(data.user.id, 'signup', {
          signup_source: metadata?.signup_source,
          utm_source: metadata?.utm_source,
          utm_medium: metadata?.utm_medium,
          utm_campaign: metadata?.utm_campaign
        });
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado durante el registro'
      };
    }
  }

  /**
   * Iniciar sesión
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        };
      }

      // Actualizar último login
      if (data.user) {
        await this.updateLastLogin(data.user.id);
        await this.logUserEvent(data.user.id, 'login');
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado durante el inicio de sesión'
      };
    }
  }

  /**
   * Iniciar sesión con Google
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        };
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado con Google OAuth'
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado al cerrar sesión'
      };
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  /**
   * Obtener sesión actual
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Obtener perfil del usuario
   */
  async getUserProfile(userId?: string): Promise<ProfileResponse> {
    try {
      const user = userId || (await this.getCurrentUser())?.id;
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user)
        .single();

      if (error) {
        return {
          success: false,
          error: 'Error obteniendo perfil de usuario'
        };
      }

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado obteniendo perfil'
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateUserProfile(
    updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ProfileResponse> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Error actualizando perfil'
        };
      }

      await this.logUserEvent(user.id, 'profile_updated', updates);

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado actualizando perfil'
      };
    }
  }

  /**
   * Obtener suscripción activa del usuario
   */
  async getUserSubscription(): Promise<SubscriptionResponse> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return {
          success: false,
          error: 'Error obteniendo suscripción'
        };
      }

      return {
        success: true,
        subscription: data || undefined
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado obteniendo suscripción'
      };
    }
  }

  /**
   * Obtener límites del usuario
   */
  async getUserLimits(): Promise<LimitsResponse> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const { data, error } = await supabase
        .from('user_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        return {
          success: false,
          error: 'Error obteniendo límites de usuario'
        };
      }

      return {
        success: true,
        limits: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado obteniendo límites'
      };
    }
  }

  /**
   * Verificar si el usuario puede realizar una conversión
   */
  async canUserConvert(fileSizeMB: number): Promise<{
    canConvert: boolean;
    reason?: string;
    limitsInfo?: UserLimits;
  }> {
    try {
      const limitsResponse = await this.getUserLimits();
      
      if (!limitsResponse.success || !limitsResponse.limits) {
        return {
          canConvert: false,
          reason: 'No se pudieron obtener los límites del usuario'
        };
      }

      const limits = limitsResponse.limits;

      // Verificar límite de tamaño de archivo
      if (fileSizeMB > limits.max_file_size_mb) {
        return {
          canConvert: false,
          reason: `El archivo supera el límite de ${limits.max_file_size_mb}MB`,
          limitsInfo: limits
        };
      }

      // Verificar límite mensual de conversiones
      if (limits.max_conversions_per_month !== -1 && 
          limits.current_month_conversions >= limits.max_conversions_per_month) {
        return {
          canConvert: false,
          reason: `Has alcanzado el límite de ${limits.max_conversions_per_month} conversiones este mes`,
          limitsInfo: limits
        };
      }

      // Verificar conversiones concurrentes
      if (limits.current_concurrent_conversions >= limits.max_concurrent_conversions) {
        return {
          canConvert: false,
          reason: `Máximo ${limits.max_concurrent_conversions} conversiones simultáneas`,
          limitsInfo: limits
        };
      }

      return {
        canConvert: true,
        limitsInfo: limits
      };
    } catch (error) {
      return {
        canConvert: false,
        reason: 'Error verificando límites de usuario'
      };
    }
  }

  /**
   * Incrementar contador de conversiones
   */
  async incrementConversionCount(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const { error } = await supabase
        .from('user_limits')
        .update({
          current_month_conversions: supabase.sql`current_month_conversions + 1`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        return {
          success: false,
          error: 'Error actualizando contador de conversiones'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado actualizando contador'
      };
    }
  }

  /**
   * Obtener todos los planes disponibles
   */
  async getSubscriptionPlans(): Promise<{
    success: boolean;
    plans?: SubscriptionPlan[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        return {
          success: false,
          error: 'Error obteniendo planes de suscripción'
        };
      }

      return {
        success: true,
        plans: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado obteniendo planes'
      };
    }
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado enviando email de recuperación'
      };
    }
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        };
      }

      const user = await this.getCurrentUser();
      if (user) {
        await this.logUserEvent(user.id, 'password_updated');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error inesperado actualizando contraseña'
      };
    }
  }

  /**
   * Suscribirse a cambios de autenticación
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Métodos privados

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_profiles')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.warn('Error updating last login:', error);
    }
  }

  private async logUserEvent(
    userId: string, 
    eventType: string, 
    eventData?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('user_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          event_category: this.getEventCategory(eventType),
          event_data: eventData || {},
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });
    } catch (error) {
      console.warn('Error logging user event:', error);
    }
  }

  private getEventCategory(eventType: string): string {
    const categoryMap: Record<string, string> = {
      'signup': 'authentication',
      'login': 'authentication',
      'logout': 'authentication',
      'password_updated': 'authentication',
      'profile_updated': 'profile',
      'conversion_started': 'conversion',
      'conversion_completed': 'conversion',
      'plan_upgraded': 'billing',
      'plan_downgraded': 'billing'
    };

    return categoryMap[eventType] || 'general';
  }

  private async getClientIP(): Promise<string | null> {
    try {
      // En producción, esto debería obtenerse del servidor
      // Por ahora retornamos null para que Supabase lo maneje
      return null;
    } catch {
      return null;
    }
  }

  private getErrorMessage(error: AuthError): string {
    const errorMessages: Record<string, string> = {
      'invalid_credentials': 'Credenciales inválidas',
      'email_not_confirmed': 'Email no confirmado. Revisa tu bandeja de entrada.',
      'signup_disabled': 'El registro está temporalmente deshabilitado',
      'email_address_invalid': 'Dirección de email inválida',
      'password_too_short': 'La contraseña debe tener al menos 6 caracteres',
      'user_already_registered': 'Ya existe una cuenta con este email',
      'weak_password': 'La contraseña es muy débil',
      'rate_limit_exceeded': 'Demasiados intentos. Intenta de nuevo más tarde.'
    };

    return errorMessages[error.message] || error.message || 'Error de autenticación';
  }
}

