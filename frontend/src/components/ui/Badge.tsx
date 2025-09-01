import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default', size = 'md' }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const base = 'inline-flex items-center rounded-full font-medium transition-colors duration-300';

  const variants = {
    default: isDark ? 'bg-slate-700 text-slate-100' : 'bg-gray-200 text-gray-800',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-amber-600 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    outline: isDark
      ? 'border border-slate-600 text-slate-300 bg-transparent'
      : 'border border-gray-300 text-gray-700 bg-transparent',
  } as const;
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1' } as const;
  return <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</span>;
};

