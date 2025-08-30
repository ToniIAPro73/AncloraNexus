import React from 'react';

interface LimitGuardProps {
  fileSizeMB: number;
  onCanProceed: () => void;
  onUpgradeRequired: () => void;
  children: React.ReactNode;
}

// Simplified stub without external dependencies; always allows rendering children
export const LimitGuard: React.FC<LimitGuardProps> = ({ children }) => {
  return <>{children}</>;
};

export const UsageMeter: React.FC<{ className?: string; showDetails?: boolean }> = () => null;
export const LimitWarning: React.FC<{ onUpgrade?: () => void; onDismiss?: () => void }> = () => null;


