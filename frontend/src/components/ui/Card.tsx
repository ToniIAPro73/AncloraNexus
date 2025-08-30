import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: string;
  borderGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-slate-700 bg-slate-800/50 shadow ${className}`}>{children}</div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-slate-700 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-medium text-white ${className}`}>{children}</h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
