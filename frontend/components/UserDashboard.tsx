import React, { useState } from 'react';
import { useAuth, useUsageLimits } from '../auth/AuthContext';

interface UserDashboardProps {
  onClose?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onClose }) => {
  const { 
    user, 
    profile, 
    subscription, 
    signOut, 
    updateProfile,
    profileLoading 
  } = useAuth();
  
  const { 
    limits, 
    remainingConversions, 
    usagePercentage, 
    isNearLimit, 
    isAtLimit 
  } = useUsageLimits();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'billing'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    website: profile?.website || '',
    country: profile?.country || ''
  });

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
  };

  const handleUpdateProfile = async () => {
    const result = await updateProfile(editForm);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanDisplayName = () => {
    return subscription?.plan?.display_name || 'Plan Gratuito';
  };

  const getPlanColor = () => {
    const planName = subscription?.plan?.name || 'free';
    const colors = {
      free: '#6b7280',
      pro: '#059669',
      business: '#7c3aed',
      enterprise: '#dc2626'
    };
    return colors[planName as keyof typeof colors] || colors.free;
  };

  const getUsageColor = () => {
    if (isAtLimit) return '#dc2626';
    if (isNearLimit) return '#ea580c';
    return '#059669';
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-modal">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <div className="avatar">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" />
                ) : (
                  <span>{profile.full_name?.charAt(0) || profile.email.charAt(0)}</span>
                )}
              </div>
              <div className="user-details">
                <h2 className="user-name">{profile.full_name || 'Usuario'}</h2>
                <p className="user-email">{profile.email}</p>
                <div className="plan-badge" style={{ backgroundColor: getPlanColor() }}>
                  {getPlanDisplayName()}
                </div>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="close-btn">×</button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-nav">
          <button
            onClick={() => setActiveTab('overview')}
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`nav-tab ${activeTab === 'billing' ? 'active' : ''}`}
          >
            Facturación
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Usage Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Conversiones este mes</h3>
                    <span className="stat-icon">📊</span>
                  </div>
                  <div className="stat-value">
                    {limits?.current_month_conversions || 0}
                    {limits?.max_conversions_per_month !== -1 && (
                      <span className="stat-limit">
                        / {limits?.max_conversions_per_month}
                      </span>
                    )}
                  </div>
                  <div className="usage-bar">
                    <div 
                      className="usage-fill"
                      style={{ 
                        width: `${Math.min(100, usagePercentage)}%`,
                        backgroundColor: getUsageColor()
                      }}
                    />
                  </div>
                  <p className="stat-description">
                    {remainingConversions === Infinity 
                      ? 'Conversiones ilimitadas'
                      : `${remainingConversions} conversiones restantes`
                    }
                  </p>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Tamaño máximo de archivo</h3>
                    <span className="stat-icon">📁</span>
                  </div>
                  <div className="stat-value">
                    {limits?.max_file_size_mb || 0} MB
                  </div>
                  <p className="stat-description">
                    Límite por archivo individual
                  </p>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Conversiones simultáneas</h3>
                    <span className="stat-icon">⚡</span>
                  </div>
                  <div className="stat-value">
                    {limits?.max_concurrent_conversions || 0}
                  </div>
                  <p className="stat-description">
                    Máximo al mismo tiempo
                  </p>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Procesamiento por lotes</h3>
                    <span className="stat-icon">📦</span>
                  </div>
                  <div className="stat-value">
                    {limits?.max_batch_conversions || 0}
                  </div>
                  <p className="stat-description">
                    Archivos por lote
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Acciones rápidas</h3>
                <div className="actions-grid">
                  <button className="action-btn">
                    <span className="action-icon">🔄</span>
                    <span>Nueva conversión</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">📚</span>
                    <span>Conversor de e-books</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">📈</span>
                    <span>Actualizar plan</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">💬</span>
                    <span>Soporte</span>
                  </button>
                </div>
              </div>

              {/* Usage Warnings */}
              {(isNearLimit || isAtLimit) && (
                <div className={`usage-warning ${isAtLimit ? 'critical' : 'warning'}`}>
                  <span className="warning-icon">
                    {isAtLimit ? '🚫' : '⚠️'}
                  </span>
                  <div className="warning-content">
                    <h4>
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
                    <button className="upgrade-btn">
                      Actualizar Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="profile-section">
                <div className="section-header">
                  <h3>Información personal</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="edit-btn"
                  >
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Nombre completo</label>
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          full_name: e.target.value
                        }))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Empresa</label>
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          company: e.target.value
                        }))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Sitio web</label>
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          website: e.target.value
                        }))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>País</label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          country: e.target.value
                        }))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={profileLoading}
                        className="save-btn"
                      >
                        {profileLoading ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-info">
                    <div className="info-item">
                      <label>Email</label>
                      <span>{profile.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Nombre completo</label>
                      <span>{profile.full_name || 'No especificado'}</span>
                    </div>
                    <div className="info-item">
                      <label>Empresa</label>
                      <span>{profile.company || 'No especificado'}</span>
                    </div>
                    <div className="info-item">
                      <label>Sitio web</label>
                      <span>{profile.website || 'No especificado'}</span>
                    </div>
                    <div className="info-item">
                      <label>País</label>
                      <span>{profile.country || 'No especificado'}</span>
                    </div>
                    <div className="info-item">
                      <label>Miembro desde</label>
                      <span>{formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="billing-tab">
              <div className="billing-section">
                <h3>Plan actual</h3>
                <div className="current-plan">
                  <div className="plan-info">
                    <h4 style={{ color: getPlanColor() }}>
                      {getPlanDisplayName()}
                    </h4>
                    <p>
                      {subscription?.plan?.description || 'Plan gratuito con funcionalidades básicas'}
                    </p>
                    {subscription?.current_period_end && (
                      <p className="renewal-date">
                        Renovación: {formatDate(subscription.current_period_end)}
                      </p>
                    )}
                  </div>
                  <button className="upgrade-plan-btn">
                    Cambiar Plan
                  </button>
                </div>

                <div className="plan-features">
                  <h4>Características incluidas</h4>
                  <ul>
                    <li>✅ {limits?.max_conversions_per_month === -1 ? 'Conversiones ilimitadas' : `${limits?.max_conversions_per_month} conversiones/mes`}</li>
                    <li>✅ Archivos hasta {limits?.max_file_size_mb}MB</li>
                    <li>✅ {limits?.max_concurrent_conversions} conversiones simultáneas</li>
                    <li>✅ Procesamiento por lotes ({limits?.max_batch_conversions} archivos)</li>
                    {subscription?.plan?.features?.priority_support && (
                      <li>✅ Soporte prioritario</li>
                    )}
                    {subscription?.plan?.features?.api_access && (
                      <li>✅ Acceso a API</li>
                    )}
                    {subscription?.plan?.features?.no_watermark && (
                      <li>✅ Sin marca de agua</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <button onClick={handleSignOut} className="signout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
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

        .dashboard-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-gray-200);
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          color: white;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-details h2 {
          margin: 0 0 var(--space-1) 0;
          font-size: 24px;
          font-weight: 600;
        }

        .user-email {
          margin: 0 0 var(--space-2) 0;
          opacity: 0.9;
          font-size: 16px;
        }

        .plan-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 150ms ease-in-out;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .dashboard-nav {
          display: flex;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .nav-tab {
          flex: 1;
          padding: var(--space-3);
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: all 150ms ease-in-out;
          border-bottom: 3px solid transparent;
        }

        .nav-tab:hover {
          background: var(--color-gray-50);
          color: var(--color-text-primary);
        }

        .nav-tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          background: var(--color-gray-50);
        }

        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-4);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .stat-card {
          background: white;
          border: 1px solid var(--color-gray-200);
          border-radius: 8px;
          padding: var(--space-3);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .stat-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .stat-icon {
          font-size: 20px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: var(--space-2);
        }

        .stat-limit {
          font-size: 18px;
          color: var(--color-text-secondary);
          font-weight: 400;
        }

        .usage-bar {
          height: 6px;
          background: var(--color-gray-200);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: var(--space-1);
        }

        .usage-fill {
          height: 100%;
          transition: all 300ms ease-in-out;
        }

        .stat-description {
          margin: 0;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .quick-actions {
          margin-bottom: var(--space-4);
        }

        .quick-actions h3 {
          margin: 0 0 var(--space-3) 0;
          font-size: 18px;
          color: var(--color-text-primary);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-2);
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-3);
          border: 1px solid var(--color-gray-200);
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 150ms ease-in-out;
          font-size: 14px;
          color: var(--color-text-primary);
        }

        .action-btn:hover {
          border-color: var(--color-primary);
          background: var(--color-gray-50);
        }

        .action-icon {
          font-size: 24px;
        }

        .usage-warning {
          padding: var(--space-3);
          border-radius: 8px;
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
        }

        .usage-warning.warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
        }

        .usage-warning.critical {
          background: #fef2f2;
          border: 1px solid #ef4444;
        }

        .warning-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .warning-content h4 {
          margin: 0 0 var(--space-1) 0;
          font-size: 16px;
        }

        .warning-content p {
          margin: 0 0 var(--space-2) 0;
          font-size: 14px;
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

        .profile-section {
          background: white;
          border: 1px solid var(--color-gray-200);
          border-radius: 8px;
          padding: var(--space-4);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .section-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--color-text-primary);
        }

        .edit-btn {
          background: none;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 150ms ease-in-out;
        }

        .edit-btn:hover {
          background: var(--color-primary);
          color: white;
        }

        .profile-info {
          display: grid;
          gap: var(--space-3);
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .info-item label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .info-item span {
          font-size: 16px;
          color: var(--color-text-primary);
        }

        .edit-form {
          display: grid;
          gap: var(--space-3);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .form-input {
          padding: var(--space-2);
          border: 1px solid var(--color-gray-300);
          border-radius: 6px;
          font-size: 16px;
          transition: all 150ms ease-in-out;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(0, 110, 230, 0.1);
        }

        .form-actions {
          display: flex;
          gap: var(--space-2);
        }

        .save-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: var(--space-2) var(--space-3);
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease-in-out;
        }

        .save-btn:hover:not(:disabled) {
          background: var(--color-primary-dark);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .billing-section {
          background: white;
          border: 1px solid var(--color-gray-200);
          border-radius: 8px;
          padding: var(--space-4);
        }

        .billing-section h3 {
          margin: 0 0 var(--space-3) 0;
          font-size: 18px;
          color: var(--color-text-primary);
        }

        .current-plan {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--space-3);
          background: var(--color-gray-50);
          border-radius: 8px;
          margin-bottom: var(--space-4);
        }

        .plan-info h4 {
          margin: 0 0 var(--space-1) 0;
          font-size: 20px;
          font-weight: 600;
        }

        .plan-info p {
          margin: 0 0 var(--space-1) 0;
          color: var(--color-text-secondary);
        }

        .renewal-date {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .upgrade-plan-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: var(--space-2) var(--space-3);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease-in-out;
        }

        .upgrade-plan-btn:hover {
          background: var(--color-primary-dark);
        }

        .plan-features h4 {
          margin: 0 0 var(--space-2) 0;
          font-size: 16px;
          color: var(--color-text-primary);
        }

        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .plan-features li {
          padding: var(--space-1) 0;
          color: var(--color-text-primary);
          font-size: 14px;
        }

        .dashboard-footer {
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--color-gray-200);
          background: var(--color-gray-50);
        }

        .signout-btn {
          background: none;
          border: 1px solid var(--color-gray-300);
          color: var(--color-text-secondary);
          padding: var(--space-2) var(--space-3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 150ms ease-in-out;
        }

        .signout-btn:hover {
          border-color: #dc2626;
          color: #dc2626;
        }

        @media (max-width: 768px) {
          .dashboard-modal {
            margin: var(--space-2);
            max-height: 95vh;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .current-plan {
            flex-direction: column;
            gap: var(--space-3);
          }
        }
      `}</style>
    </div>
  );
};

