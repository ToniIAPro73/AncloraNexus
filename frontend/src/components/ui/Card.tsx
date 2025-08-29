import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'dark';
  hoverEffect?: boolean;
  borderGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = true,
  borderGlow = false,
}) => {
  const baseClasses = 'rounded-xl backdrop-blur-md shadow-lg transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white/10 border border-white/20',
    primary: 'bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30',
    secondary: 'bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30',
    dark: 'bg-slate-900/70 border border-slate-700/50',
  };
  
  const hoverClasses = hoverEffect 
    ? 'hover:transform hover:-translate-y-1 hover:shadow-xl' 
    : '';

  const glowClasses = borderGlow 
    ? variant === 'primary' 
      ? 'hover:shadow-primary/20' 
      : variant === 'secondary' 
        ? 'hover:shadow-secondary/20'
        : 'hover:shadow-white/10'
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${glowClasses} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-slate-700/30 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-medium text-white ${className}`}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-300 ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-4 border-t border-slate-700/30 ${className}`}>
    {children}
  </div>
);
