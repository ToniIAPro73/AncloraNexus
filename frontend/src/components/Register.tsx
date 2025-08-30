import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { apiService } from '../services/api';

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onClose?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ 
  onSuccess, 
  onSwitchToLogin, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
    marketingConsent: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const authService = AuthService.getInstance();

  const validatePassword = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Muy dÃ©bil';
    if (strength < 50) return 'DÃ©bil';
    if (strength < 75) return 'Media';
    return 'Fuerte';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return '#dc2626';
    if (strength < 50) return '#ea580c';
    if (strength < 75) return '#ca8a04';
    return '#16a34a';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseÃ±as no coinciden');
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 50) {
      setError('La contraseÃ±a debe ser mÃ¡s fuerte');
      setIsLoading(false);
      return;
    }

    try {
      const result = await apiService.register({ full_name: formData.fullName, email: formData.email, password: formData.password });
      
      if (result && result.user) {
        onSuccess?.();
      } else {
        setError('Error al crear la cuenta');
      }
    } catch (error) {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        // Google OAuth redirige automÃ¡ticamente
      } else {
        setError(result.error || 'Error con Google Sign-Up');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Error inesperado con Google Sign-Up');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Actualizar fuerza de contraseÃ±a
    if (name === 'password') {
      setPasswordStrength(validatePassword(value));
    }

    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  return (
    <div className="register-container">
      <div className="register-modal">
        {/* Header */}
        <div className="register-header">
          <h2 className="register-title text-h2">Crear Cuenta</h2>
          <p className="register-subtitle">
            Ãšnete a Anclora Converter y comienza a convertir archivos
          </p>
          {onClose && (
            <button 
              onClick={onClose}
              className="register-close-btn"
              aria-label="Cerrar"
            >
              Ã—
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="register-error"
            role="alert"
            aria-live="polite"
            className="register-error"
          >
            <span className="error-icon">âš ï¸</span>
            {error}
          </div>
        )}

        {/* Google Sign-Up */}
        <button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="google-signup-btn"
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? 'Conectando...' : 'Registrarse con Google'}
        </button>

        {/* Divider */}
        <div className="register-divider">
          <span>o</span>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Nombre completo
              </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="form-input"
              placeholder="Tu nombre"
              autoComplete="name"
              aria-describedby={error ? 'register-error' : undefined}
            />
            </div>

            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Empresa (opcional)
              </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              disabled={isLoading}
              className="form-input"
              placeholder="Tu empresa"
              autoComplete="organization"
              aria-describedby={error ? 'register-error' : undefined}
            />
            </div>
          </div>

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
              aria-describedby={error ? 'register-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              ContraseÃ±a
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
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                autoComplete="new-password"
                minLength={6}
                aria-describedby={error ? 'register-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar contraseÃ±a' : 'Mostrar contraseÃ±a'}
              >
                {showPassword ? 'ðŸ‘ï¸' : 'ðŸ‘ï¸â€ðŸ—¨ï¸'}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: getPasswordStrengthColor(passwordStrength)
                    }}
                  />
                </div>
                <span 
                  className="strength-text"
                  style={{ color: getPasswordStrengthColor(passwordStrength) }}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseÃ±a
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="form-input"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              autoComplete="new-password"
              aria-describedby={`${error ? 'register-error ' : ''}${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'confirmPassword-error'
                  : ''
              }`.trim() || undefined}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <span
                id="confirmPassword-error"
                role="alert"
                aria-live="polite"
                className="field-error"
              >
                Las contraseÃ±as no coinciden
              </span>
            )}
          </div>

          {/* Marketing Consent */}
          <div className="form-group checkbox-group">
            <label htmlFor="marketingConsent" className="checkbox-label">
              <input
                type="checkbox"
                id="marketingConsent"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleInputChange}
                className="checkbox-input"
                aria-describedby={error ? 'register-error' : undefined}
              />
              <span className="checkbox-text">
                Quiero recibir actualizaciones y ofertas especiales por email
              </span>
            </label>
          </div>

          {/* Terms */}
          <div className="terms-text">
            Al crear una cuenta, aceptas nuestros{' '}
            <a href="/terms" target="_blank" className="terms-link">
              TÃ©rminos de Servicio
            </a>{' '}
            y{' '}
            <a href="/privacy" target="_blank" className="terms-link">
              PolÃ­tica de Privacidad
            </a>
          </div>

          <button
            type="submit"
            disabled={
              isLoading || 
              !formData.email || 
              !formData.password || 
              !formData.confirmPassword ||
              !formData.fullName ||
              formData.password !== formData.confirmPassword ||
              passwordStrength < 50
            }
            className="register-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta Gratis'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="register-footer">
          {onSwitchToLogin && (
            <p className="switch-auth">
              Â¿Ya tienes cuenta?{' '}
              <button 
                onClick={onSwitchToLogin}
                className="link-button primary"
              >
                Inicia sesiÃ³n
              </button>
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .register-container {
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

        .register-modal {
          background: white;
          border-radius: 12px;
          padding: var(--space-4);
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }

        .register-header {
          text-align: center;
          margin-bottom: var(--space-4);
        }

        .register-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0 0 var(--space-1) 0;
          font-family: var(--font-primary);
        }

        .register-subtitle {
          color: var(--color-text-secondary);
          margin: 0;
          font-size: 16px;
        }

        .register-close-btn {
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

        .register-close-btn:hover {
          background: var(--color-gray-100);
          color: var(--color-text-primary);
        }

        .register-error {
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

        .google-signup-btn {
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

        .google-signup-btn:hover {
          background: var(--color-gray-50);
          border-color: var(--color-gray-400);
        }

        .google-signup-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .register-divider {
          text-align: center;
          margin: var(--space-3) 0;
          position: relative;
        }

        .register-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--color-gray-300);
        }

        .register-divider span {
          background: white;
          padding: 0 var(--space-2);
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        .register-form {
          margin-bottom: var(--space-4);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2);
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

        .password-strength {
          margin-top: var(--space-1);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: var(--color-gray-200);
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 300ms ease-in-out;
        }

        .strength-text {
          font-size: 12px;
          font-weight: 500;
        }

        .field-error {
          color: #dc2626;
          font-size: 12px;
          margin-top: var(--space-1);
          display: block;
        }

        .checkbox-group {
          margin-bottom: var(--space-2);
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: var(--space-1);
          cursor: pointer;
          font-size: 14px;
          line-height: 1.4;
        }

        .checkbox-input {
          margin: 0;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checkbox-text {
          color: var(--color-text-secondary);
        }

        .terms-text {
          font-size: 12px;
          color: var(--color-text-secondary);
          line-height: 1.4;
          margin-bottom: var(--space-3);
        }

        .terms-link {
          color: var(--color-primary);
          text-decoration: none;
        }

        .terms-link:hover {
          text-decoration: underline;
        }

        .register-submit-btn {
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

        .register-submit-btn:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        .register-submit-btn:disabled {
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

        .register-footer {
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
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .register-modal {
            margin: var(--space-2);
            padding: var(--space-3);
          }

          .register-title {
            font-size: 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};


export default Register;


