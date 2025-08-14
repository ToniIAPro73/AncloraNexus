import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { PasswordResetModal } from './PasswordResetModal';

interface LoginProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onClose?: () => void;
}

export const Login: React.FC<LoginProps> = ({ 
  onSuccess, 
  onSwitchToRegister, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const authService = AuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.signIn(formData.email, formData.password);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        // Google OAuth redirige automáticamente
      } else {
        setError(result.error || 'Error con Google Sign-In');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Error inesperado con Google Sign-In');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  return (
    <>
    <div className="login-container">
      <div className="login-modal">
        {/* Header */}
        <div className="login-header">
          <h2 className="login-title">Iniciar Sesión</h2>
          <p className="login-subtitle">
            Accede a tu cuenta de Anclora Converter
          </p>
          {onClose && (
            <button 
              onClick={onClose}
              className="login-close-btn"
              aria-label="Cerrar"
            >
              ×
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="google-signin-btn"
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        {/* Divider */}
        <div className="login-divider">
          <span>o</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="form-input"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            className="login-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="login-footer">
          <button
            onClick={() => setShowResetModal(true)}
            className="link-button"
          >
            ¿Olvidaste tu contraseña?
          </button>
          
          {onSwitchToRegister && (
            <p className="switch-auth">
              ¿No tienes cuenta?{' '}
              <button 
                onClick={onSwitchToRegister}
                className="link-button primary"
              >
                Regístrate gratis
              </button>
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .login-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-2);
        }

        .login-modal {
          background: white;
          border-radius: 12px;
          padding: var(--space-4);
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-4);
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0 0 var(--space-1) 0;
          font-family: var(--font-primary);
        }

        .login-subtitle {
          color: var(--color-text-secondary);
          margin: 0;
          font-size: 16px;
        }

        .login-close-btn {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--color-text-secondary);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 150ms ease-in-out;
        }

        .login-close-btn:hover {
          background: var(--color-gray-100);
          color: var(--color-text-primary);
        }

        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: var(--space-2);
          border-radius: 8px;
          margin-bottom: var(--space-3);
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 14px;
        }

        .error-icon {
          flex-shrink: 0;
        }

        .google-signin-btn {
          width: 100%;
          padding: var(--space-2);
          border: 1px solid var(--color-gray-300);
          border-radius: 8px;
          background: white;
          color: var(--color-text-primary);
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .google-signin-btn:hover {
          background: var(--color-gray-50);
          border-color: var(--color-gray-400);
        }

        .google-signin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .login-divider {
          text-align: center;
          margin: var(--space-3) 0;
          position: relative;
        }

        .login-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--color-gray-300);
        }

        .login-divider span {
          background: white;
          padding: 0 var(--space-2);
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        .login-form {
          margin-bottom: var(--space-4);
        }

        .form-group {
          margin-bottom: var(--space-3);
        }

        .form-label {
          display: block;
          margin-bottom: var(--space-1);
          font-weight: 500;
          color: var(--color-text-primary);
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: var(--space-2);
          border: 1px solid var(--color-gray-300);
          border-radius: 8px;
          font-size: 16px;
          transition: all 150ms ease-in-out;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(0, 110, 230, 0.1);
        }

        .form-input:disabled {
          background: var(--color-gray-50);
          opacity: 0.6;
        }

        .password-input-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: var(--space-2);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: var(--color-text-secondary);
          padding: 4px;
          border-radius: 4px;
          transition: all 150ms ease-in-out;
        }

        .password-toggle:hover {
          color: var(--color-text-primary);
          background: var(--color-gray-100);
        }

        .login-submit-btn {
          width: 100%;
          padding: var(--space-2);
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
        }

        .login-submit-btn:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .login-footer {
          text-align: center;
          border-top: 1px solid var(--color-gray-200);
          padding-top: var(--space-3);
        }

        .link-button {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
          transition: all 150ms ease-in-out;
        }

        .link-button:hover {
          color: var(--color-primary-dark);
        }

        .link-button.primary {
          font-weight: 600;
          text-decoration: none;
        }

        .switch-auth {
          margin: var(--space-2) 0 0 0;
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .login-modal {
            margin: var(--space-2);
            padding: var(--space-3);
          }

          .login-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
    {showResetModal && (
      <PasswordResetModal onClose={() => setShowResetModal(false)} />
    )}
    </>
  );
};


export default Login;

