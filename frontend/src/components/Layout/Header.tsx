import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeProvider';


export const Header: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { highContrast, toggleHighContrast } = useTheme();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <header
      role="banner"
      aria-label={t('header.ariaLabel')}
      className="h-16 bg-gradient-to-br from-primary to-secondary backdrop-blur-md shadow-md z-30 border-b border-white/10"
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Título de la página actual */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold text-white leading-snug">
            {t('header.title')}
          </h1>
          <p className="text-sm text-blue-100 -mt-1">
            {t('header.subtitle')}
          </p>
        </div>

        {/* Área de usuario y créditos */}
        <div className="flex items-center space-x-4">
          <select
            value={i18n.language}
            onChange={changeLanguage}
            className="bg-slate-800 text-white px-2 py-1 rounded"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <button
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            className="bg-slate-800 text-white px-2 py-1 rounded"
          >
            {t('header.highContrast')}
          </button>
          {/* Contador de créditos */}
          <div className="flex items-center gap-2 bg-blue-700/60 px-3 py-1 rounded-full text-white shadow-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">{t('header.credits', { count: 50 })}</span>
          </div>

          {/* Perfil de usuario */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full shadow">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold border border-white/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-col hidden sm:flex leading-tight">
              <span className="text-sm text-white font-medium">
                {user?.name || t('header.defaultName')}
              </span>
              <span className="text-xs text-gray-300">
                {user?.email || t('header.defaultEmail')}
              </span>
            </div>
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};
