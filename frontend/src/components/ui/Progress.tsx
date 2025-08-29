import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  labelClassName?: string;
  animated?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  showLabel = false,
  variant = 'primary',
  size = 'md',
  className = '',
  labelClassName = '',
  animated = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const baseStyles = 'w-full overflow-hidden rounded-full';
  
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const variantStyles = {
    default: 'bg-slate-700',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-600',
  };
  
  const trackStyles = 'bg-slate-800';
  
  const animatedStyles = animated ? 'transition-all duration-500 ease-in-out' : '';
  
  return (
    <div className="w-full">
      <div className={`${baseStyles} ${trackStyles} ${sizeStyles[size]} ${className}`}>
        <div
          className={`${variantStyles[variant]} ${sizeStyles[size]} ${animatedStyles}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className={`text-xs text-slate-400 mt-1 ${labelClassName}`}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

interface StepProgressProps {
  steps: number;
  currentStep: number;
  labels?: string[];
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  labels,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {Array.from({ length: steps }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center"
          >
            <div 
              className={`
                w-8 h-8 flex items-center justify-center rounded-full
                ${i < currentStep ? 'bg-primary text-white' : i === currentStep ? 'bg-secondary text-white' : 'bg-slate-700 text-slate-400'}
                transition-colors duration-300
              `}
            >
              {i < currentStep ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              ) : (
                i + 1
              )}
            </div>
            
            {labels && (
              <span className={`
                text-xs mt-1 font-medium
                ${i < currentStep ? 'text-primary' : i === currentStep ? 'text-secondary' : 'text-slate-500'}
              `}>
                {labels[i]}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Conectores */}
      <div className="relative mt-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700" />
        <div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-500"
          style={{ width: `${(currentStep / (steps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};
