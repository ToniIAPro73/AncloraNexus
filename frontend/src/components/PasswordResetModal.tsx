import React, { useState } from 'react';
import { AuthService } from '../services/authService';

interface PasswordResetModalProps {
  onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const authService = AuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    const result = await authService.requestPasswordReset(email);
    setIsLoading(false);

    if (result.success) {
      setMessage('Revisa tu correo para continuar con la recuperación.');
    } else {
      setError(result.error || 'No se pudo enviar el correo de recuperación');
    }
  };

  return (
    <div className="login-container" role="dialog" aria-modal="true">
      <div className="login-modal">
        <div className="login-header">
          <h2 className="login-title">Recuperar contraseña</h2>
          {onClose && (
            <button onClick={onClose} className="login-close-btn" aria-label="Cerrar">
              ×
            </button>
          )}
        </div>

        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-error" role="status">{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">
                Correo electrónico
              </label>
              <input
                id="reset-email"
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="tu@correo.com"
              />
            </div>
            <button type="submit" disabled={isLoading || !email} className="login-submit-btn">
              {isLoading ? 'Enviando...' : 'Enviar correo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;
