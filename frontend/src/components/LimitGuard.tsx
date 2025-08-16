import React, { useState, useEffect } from 'react';
import { useAuth, useUsageLimits } from '../auth/AuthContext';

interface LimitGuardProps {
  fileSizeMB: number;
  onCanProceed: () => void;
  onUpgradeRequired: () => void;
  children: React.ReactNode;
}

export const LimitGuard: React.FC<LimitGuardProps> = ({
  fileSizeMB,
  onCanProceed,
  onUpgradeRequired,
  children
}) => {
  const { canConvert, isAuthenticated } = useAuth();
  const { isAtLimit, isNearLimit, remainingConversions } = useUsageLimits();
  const [checkResult, setCheckResult] = useState<{
    canConvert: boolean;
    reason?: string;
    showWarning?: boolean;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkLimits();
  }, [fileSizeMB, isAuthenticated]);

  const checkLimits = async () => {
    if (!isAuthenticated) {
      setCheckResult({
        canConvert: false,
        reason: 'Debes iniciar sesión para convertir archivos'
      });
      return;
    }

    setIsChecking(true);
    try {
      const result = await canConvert(fileSizeMB);
      setCheckResult({
        canConvert: result.canConvert,
        reason: result.reason,
        showWarning: isNearLimit && result.canConvert
      });
    } catch (error) {
      setCheckResult({
        canConvert: false,
        reason: 'Error verificando límites. Intenta de nuevo.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleProceed = () => {
    if (checkResult?.canConvert) {
      onCanProceed();
    } else {
      onUpgradeRequired();
    }
  };

  if (isChecking) {
    return (
      <div className="limit-guard checking">
        <div className="checking-content">
          <div className="spinner"></div>
          <p>Verificando límites...</p>
        </div>
        {children}
      </div>
    );
  }

  if (!checkResult) {
    return <>{children}</>;
  }

  if (!checkResult.canConvert) {
    return (
      <div className="limit-guard blocked">
        <div className="limit-overlay">
          <div className="limit-modal">
            <div className="limit-icon">🚫</div>
            <h3 className="text-h3">Límite alcanzado</h3>
            <p>{checkResult.reason}</p>
            
            <div className="limit-actions">
              <button 
                onClick={onUpgradeRequired}
                className="upgrade-btn primary"
              >
                Actualizar Plan
              </button>
              <button 
                onClick={() => setCheckResult(null)}
                className="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (checkResult.showWarning) {
    return (
      <div className="limit-guard warning">
        <div className="warning-banner">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <strong>Te estás acercando a tu límite</strong>
              <p>Te quedan {remainingConversions} conversiones este mes</p>
            </div>
            <button 
              onClick={onUpgradeRequired}
              className="upgrade-btn small"
            >
              Actualizar
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

// Componente para mostrar límites en tiempo real
interface UsageMeterProps {
  className?: string;
  showDetails?: boolean;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const { limits } = useUsageLimits();
  const { 
    remainingConversions, 
    usagePercentage, 
    isNearLimit, 
    isAtLimit 
  } = useUsageLimits();

  if (!limits) {
    return null;
  }

  const getStatusColor = () => {
    if (isAtLimit) return '#dc2626';
    if (isNearLimit) return '#ea580c';
    return '#059669';
  };

  const getStatusText = () => {
    if (isAtLimit) return 'Límite alcanzado';
    if (isNearLimit) return 'Cerca del límite';
    return 'Dentro del límite';
  };

  return (
    <div className={`usage-meter ${className}`}>
      <div className="meter-header">
        <span className="meter-label">Uso mensual</span>
        <span 
          className="meter-status"
          style={{ color: getStatusColor() }}
        >
          {getStatusText()}
        </span>
      </div>
      
      <div className="meter-bar">
        <div 
          className="meter-fill"
          style={{ 
            width: `${Math.min(100, usagePercentage)}%`,
            backgroundColor: getStatusColor()
          }}
        />
      </div>
      
      <div className="meter-info">
        <span className="current-usage">
          {limits.current_month_conversions}
        </span>
        <span className="usage-separator">/</span>
        <span className="max-usage">
          {limits.max_conversions_per_month === -1 
            ? '∞' 
            : limits.max_conversions_per_month
          }
        </span>
        <span className="usage-unit">conversiones</span>
      </div>

      {showDetails && (
        <div className="meter-details">
          <div className="detail-item">
            <span className="detail-label">Restantes:</span>
            <span className="detail-value">
              {remainingConversions === Infinity ? '∞' : remainingConversions}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tamaño máx:</span>
            <span className="detail-value">{limits.max_file_size_mb}MB</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Simultáneas:</span>
            <span className="detail-value">{limits.max_concurrent_conversions}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .usage-meter {
          background: white;
          border: 1px solid var(--color-gray-200);
          border-radius: 8px;
          padding: var(--space-3);
          font-size: 14px;
        }

        .meter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .meter-label {
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .meter-status {
          font-size: 12px;
          font-weight: 600;
        }

        .meter-bar {
          height: 8px;
          background: var(--color-gray-200);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: var(--space-2);
        }

        .meter-fill {
          height: 100%;
          transition: all 300ms ease-in-out;
        }

        .meter-info {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-text-secondary);
        }

        .current-usage {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .meter-details {
          margin-top: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px solid var(--color-gray-200);
          display: grid;
          gap: var(--space-1);
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          color: var(--color-text-secondary);
          font-size: 12px;
        }

        .detail-value {
          font-weight: 500;
          color: var(--color-text-primary);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

// Componente para mostrar advertencias de límites
interface LimitWarningProps {
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export const LimitWarning: React.FC<LimitWarningProps> = ({ 
  onUpgrade, 
  onDismiss 
}) => {
  const { isNearLimit, isAtLimit, remainingConversions } = useUsageLimits();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isNearLimit && !isAtLimit) {
    return null;
  }

  if (isDismissed && !isAtLimit) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`limit-warning ${isAtLimit ? 'critical' : 'warning'}`}>
      <div className="warning-icon">
        {isAtLimit ? '🚫' : '⚠️'}
      </div>
      
      <div className="warning-content">
        <h4 className="text-h4">
          {isAtLimit 
            ? 'Has alcanzado tu límite mensual'
            : 'Te estás acercando a tu límite'
          }
        </h4>
        <p>
          {isAtLimit
            ? 'Actualiza tu plan para continuar convirtiendo archivos.'
            : `Te quedan ${remainingConversions} conversiones este mes.`
          }
        </p>
      </div>

      <div className="warning-actions">
        {onUpgrade && (
          <button onClick={onUpgrade} className="upgrade-btn">
            Actualizar Plan
          </button>
        )}
        {!isAtLimit && (
          <button onClick={handleDismiss} className="dismiss-btn">
            ×
          </button>
        )}
      </div>

      <style jsx>{`
        .limit-warning {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-3);
          border-radius: 8px;
          margin-bottom: var(--space-3);
        }

        .limit-warning.warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
        }

        .limit-warning.critical {
          background: #fef2f2;
          border: 1px solid #ef4444;
        }

        .warning-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .warning-content {
          flex: 1;
        }

        .warning-content h4 {
          margin: 0 0 var(--space-1) 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .warning-content p {
          margin: 0;
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .warning-actions {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .upgrade-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease-in-out;
        }

        .upgrade-btn:hover {
          background: var(--color-primary-dark);
        }

        .dismiss-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 150ms ease-in-out;
        }

        .dismiss-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          color: var(--color-text-primary);
        }
      `}</style>
    </div>
  );
};

export default LimitGuard;

// Estilos globales para LimitGuard
const limitGuardStyles = `
  .limit-guard.checking {
    position: relative;
  }

  .checking-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 8px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-gray-200);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--space-2);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .limit-guard.blocked {
    position: relative;
  }

  .limit-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    border-radius: 8px;
  }

  .limit-modal {
    background: white;
    padding: var(--space-4);
    border-radius: 12px;
    text-align: center;
    max-width: 400px;
    margin: var(--space-2);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .limit-icon {
    font-size: 48px;
    margin-bottom: var(--space-2);
  }

  .limit-modal h3 {
    margin: 0 0 var(--space-2) 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .limit-modal p {
    margin: 0 0 var(--space-4) 0;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .limit-actions {
    display: flex;
    gap: var(--space-2);
    justify-content: center;
  }

  .upgrade-btn.primary {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: var(--space-2) var(--space-3);
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease-in-out;
  }

  .upgrade-btn.primary:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
  }

  .upgrade-btn.small {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease-in-out;
  }

  .upgrade-btn.small:hover {
    background: var(--color-primary-dark);
  }

  .cancel-btn {
    background: none;
    border: 1px solid var(--color-gray-300);
    color: var(--color-text-secondary);
    padding: var(--space-2) var(--space-3);
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 150ms ease-in-out;
  }

  .cancel-btn:hover {
    border-color: var(--color-gray-400);
    color: var(--color-text-primary);
  }

  .warning-banner {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .warning-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .warning-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .warning-text {
    flex: 1;
  }

  .warning-text strong {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 2px;
  }

  .warning-text p {
    margin: 0;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
`;

// Inyectar estilos globales
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = limitGuardStyles;
  document.head.appendChild(styleElement);
}

