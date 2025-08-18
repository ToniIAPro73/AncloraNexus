// frontend/src/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, LoginData, RegisterData } from '../services/api';
import type { User } from '../types/User';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await apiService.verifyToken();
          if (response.valid) {
            setUser(response.user);
          } else {
            apiService.clearToken();
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        apiService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(data);
      setUser(response.user);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
  try {
    const response = await apiService.getProfile();
    setUser(response); // ✅ Aquí va el objeto de usuario completo
  } catch (error) {
    console.error('Error refrescando usuario:', error);
    logout();
  }
  };

  const requestPasswordReset = async (email: string) => {
    await apiService.requestPasswordReset(email);
  };

  const resetPassword = async (token: string, password: string) => {
    await apiService.resetPassword(token, password);
  };


  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Componente para proteger rutas que requieren autenticación
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <LoginForm /> 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary-dark to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

// Componente de formulario de login optimizado según la guía
export const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
        });
      }
    } catch (error: any) {
      setError(error.message || 'Error en la autenticación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary-dark to-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-h2 font-bold text-white mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-300">
            {isLogin ? 'Accede a tu cuenta de Anclora Metaform' : 'Únete a Anclora Metaform'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 space-y-4">
            {!isLogin && (
            <div className="input-group">
              <label htmlFor="full_name" className="input-label">
                Nombre Completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required={!isLogin}
                value={formData.full_name}
                onChange={handleChange}
                className="input"
                placeholder="Tu nombre completo"
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </div>
            )}

            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="tu@email.com"
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </div>

            {error && (
              <div
                id="auth-error"
                role="alert"
                aria-live="polite"
                className="bg-danger/10 border border-danger/30 rounded-lg p-3"
              >
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </div>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', full_name: '' });
              }}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              {isLogin 
                ? '¿No tienes cuenta? Crear una nueva' 
                : '¿Ya tienes cuenta? Iniciar sesión'
              }
            </button>
          </div>
        </form>

        {/* Usuario de prueba */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
          <h3 className="text-h3 text-gray-300 font-medium mb-2">Usuario de Prueba:</h3>
          <p className="text-gray-400 text-sm">
            Email: ancoratest@dominio.com<br />
            Contraseña: Ancoratest123
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar información del usuario
export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 font-bold text-white">Mi Perfil</h2>
        <button
          onClick={logout}
          className="btn btn-danger"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 block text-sm">Nombre:</span>
              <span className="text-white font-medium">{user.full_name}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-sm">Email:</span>
              <span className="text-white font-medium">{user.email}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-sm">Plan:</span>
              <span className="text-primary font-medium">{user.plan_info?.name ?? 'Sin plan asignado'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-sm">Créditos:</span>
              <span className="text-success font-bold">{user.credits}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-sm">Conversiones realizadas:</span>
              <span className="text-white font-medium">{user.total_conversions}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-h3 text-white mb-4">Actividad Reciente</h3>
          <div className="bg-gray-800/30 rounded-lg overflow-hidden">
            <div className="p-4 text-center text-gray-400">
              <p>Historial de actividad disponible próximamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Formulario para solicitar recuperación de contraseña
export const ForgotPasswordForm: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage('Revisa tu correo para continuar con el proceso.');
    } catch {
      setMessage('No se pudo procesar la solicitud.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="input-group">
        <label htmlFor="fp-email" className="input-label">Email</label>
        <input
          id="fp-email"
          type="email"
          className="input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">Enviar enlace</button>
      {message && <p className="text-center text-sm text-gray-300">{message}</p>}
    </form>
  );
};

// Formulario para restablecer la contraseña con un token
interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await resetPassword(token, password);
      setMessage('Contraseña actualizada correctamente');
    } catch (err) {
      setMessage('No se pudo actualizar la contraseña');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="input-group">
        <label htmlFor="new-password" className="input-label">Nueva Contraseña</label>
        <input
          id="new-password"
          type="password"
          className="input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">Restablecer contraseña</button>
      {message && <p className="text-center text-sm text-gray-300">{message}</p>}
    </form>
  );
};
