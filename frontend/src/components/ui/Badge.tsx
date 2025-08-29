import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const variantStyles = {
    default: 'bg-slate-700 text-slate-200',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-blue-500 text-white',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  
  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}> = ({ status, className = '' }) => {
  const statusStyles = {
    online: 'bg-green-500',
    offline: 'bg-slate-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };
  
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${statusStyles[status]} ${className}`} />
  );
};

export const GradientBadge: React.FC<{
  children: React.ReactNode;
  from?: string;
  to?: string;
  className?: string;
}> = ({
  children,
  from = 'from-primary',
  to = 'to-secondary',
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center text-xs font-medium px-2.5 py-0.5
        rounded-full bg-gradient-to-r ${from} ${to} text-white
        ${className}
      `}
    >
      {children}
    </span>
  );
};
