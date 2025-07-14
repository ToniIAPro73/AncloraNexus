import React, { useState, useRef, useEffect } from 'react';
import { IconUser, IconHeaderLogo } from './Icons';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  onEbookConverterClick?: () => void;
  onUserMenuClick?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  onEbookConverterClick,
  onUserMenuClick,
  onLoginClick,
  onRegisterClick,
  isAuthenticated = false,
  user
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <IconHeaderLogo />
            <span className="logo-text">Anclora Converter</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <a href="#features" className="nav-link">Características</a>
            <a href="#formats" className="nav-link">Formatos</a>
            <a href="#faq" className="nav-link">FAQ</a>
            {onEbookConverterClick && (
              <button 
                onClick={onEbookConverterClick}
                className="nav-link nav-button"
              >
                E-books
              </button>
            )}
          </nav>

          {/* Auth Section */}
          <div className="auth-section">
            {isAuthenticated ? (
              <div className="user-menu" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="user-button"
                >
                  <div className="user-avatar">
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar"
                        className="avatar-image"
                      />
                    ) : (
                      <span className="avatar-initials">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className="user-name">
                    {getUserDisplayName()}
                  </span>
                  <svg 
                    className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16"
                  >
                    <path 
                      fill="currentColor" 
                      d="M4.427 6.427a.75.75 0 011.06 0L8 8.94l2.513-2.513a.75.75 0 111.06 1.06l-3.043 3.044a.75.75 0 01-1.06 0L4.427 7.487a.75.75 0 010-1.06z"
                    />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <div className="user-name-full">{getUserDisplayName()}</div>
                        <div className="user-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={() => {
                        onUserMenuClick?.();
                        setIsUserMenuOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      <IconUser />
                      Mi cuenta
                    </button>
                    <button className="dropdown-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 3a1 1 0 112 0v4a1 1 0 11-2 0V3zm1 8a1 1 0 100-2 1 1 0 000 2z"/>
                      </svg>
                      Soporte
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  onClick={onLoginClick}
                  className="login-btn"
                >
                  Iniciar sesión
                </button>
                <button 
                  onClick={onRegisterClick}
                  className="register-btn"
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Abrir menú"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav" ref={menuRef}>
            <div className="mobile-nav-content">
              <a href="#features" className="mobile-nav-link">Características</a>
              <a href="#formats" className="mobile-nav-link">Formatos</a>
              <a href="#faq" className="mobile-nav-link">FAQ</a>
              {onEbookConverterClick && (
                <button 
                  onClick={() => {
                    onEbookConverterClick();
                    setIsMenuOpen(false);
                  }}
                  className="mobile-nav-link mobile-nav-button"
                >
                  E-books
                </button>
              )}
              
              {!isAuthenticated && (
                <div className="mobile-auth">
                  <button 
                    onClick={() => {
                      onLoginClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="mobile-login-btn"
                  >
                    Iniciar sesión
                  </button>
                  <button 
                    onClick={() => {
                      onRegisterClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="mobile-register-btn"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .header {
          background: white;
          border-bottom: 1px solid var(--color-gray-200);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-3);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: 700;
          font-size: 20px;
          color: var(--color-primary);
          text-decoration: none;
        }

        .logo-text {
          font-family: var(--font-primary);
        }

        .desktop-nav {
          display: none;
          align-items: center;
          gap: var(--space-4);
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
          }
        }

        .nav-link {
          color: var(--color-text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: color 150ms ease-in-out;
          padding: var(--space-1) 0;
        }

        .nav-link:hover {
          color: var(--color-primary);
        }

        .nav-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
        }

        .auth-section {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .auth-buttons {
          display: none;
          align-items: center;
          gap: var(--space-2);
        }

        @media (min-width: 768px) {
          .auth-buttons {
            display: flex;
          }
        }

        .login-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          font-weight: 500;
          cursor: pointer;
          padding: var(--space-1) var(--space-2);
          border-radius: 6px;
          transition: all 150ms ease-in-out;
        }

        .login-btn:hover {
          color: var(--color-primary);
          background: var(--color-gray-50);
        }

        .register-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          font-weight: 500;
          cursor: pointer;
          padding: var(--space-1) var(--space-3);
          border-radius: 6px;
          transition: all 150ms ease-in-out;
        }

        .register-btn:hover {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        .user-menu {
          position: relative;
        }

        .user-button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-1);
          border-radius: 8px;
          transition: all 150ms ease-in-out;
          color: var(--color-text-primary);
        }

        .user-button:hover {
          background: var(--color-gray-50);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .user-name {
          font-weight: 500;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          transition: transform 150ms ease-in-out;
          color: var(--color-text-secondary);
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid var(--color-gray-200);
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          min-width: 200px;
          margin-top: var(--space-1);
          z-index: 100;
        }

        .dropdown-header {
          padding: var(--space-3);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .user-info {
          text-align: left;
        }

        .user-name-full {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .user-email {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--color-gray-200);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          color: var(--color-text-primary);
          font-size: 14px;
          transition: all 150ms ease-in-out;
        }

        .dropdown-item:hover {
          background: var(--color-gray-50);
        }

        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-secondary);
          padding: var(--space-1);
          border-radius: 6px;
          transition: all 150ms ease-in-out;
        }

        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        .mobile-menu-btn:hover {
          background: var(--color-gray-50);
          color: var(--color-text-primary);
        }

        .mobile-nav {
          display: block;
          border-top: 1px solid var(--color-gray-200);
          background: white;
        }

        @media (min-width: 768px) {
          .mobile-nav {
            display: none;
          }
        }

        .mobile-nav-content {
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .mobile-nav-link {
          color: var(--color-text-secondary);
          text-decoration: none;
          font-weight: 500;
          padding: var(--space-2);
          border-radius: 6px;
          transition: all 150ms ease-in-out;
        }

        .mobile-nav-link:hover {
          color: var(--color-primary);
          background: var(--color-gray-50);
        }

        .mobile-nav-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          text-align: left;
        }

        .mobile-auth {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px solid var(--color-gray-200);
        }

        .mobile-login-btn {
          background: none;
          border: 1px solid var(--color-gray-300);
          color: var(--color-text-primary);
          font-weight: 500;
          cursor: pointer;
          padding: var(--space-2);
          border-radius: 6px;
          transition: all 150ms ease-in-out;
        }

        .mobile-login-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .mobile-register-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          font-weight: 500;
          cursor: pointer;
          padding: var(--space-2);
          border-radius: 6px;
          transition: all 150ms ease-in-out;
        }

        .mobile-register-btn:hover {
          background: var(--color-primary-dark);
        }
      `}</style>
    </header>
  );
};

