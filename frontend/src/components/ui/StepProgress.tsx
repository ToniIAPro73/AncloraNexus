// src/components/ui/StepProgress.tsx - Componente de progreso por pasos
import React from 'react';

interface StepProgressProps {
  steps: number;
  currentStep: number;
  labels: string[];
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  labels,
  className
}) => {
  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      {Array.from({ length: steps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {i + 1}
          </div>
          {labels[i] && (
            <span className={`ml-2 text-sm ${i + 1 <= currentStep ? 'text-primary' : 'text-gray-500'}`}>
              {labels[i]}
            </span>
          )}
          {i < steps - 1 && (
            <div className={`w-12 h-0.5 mx-4 ${i + 1 < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
};
  steps: number;
  currentStep: number;
  labels: string[];
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  labels,
  className
}) => {
  return (
    <div className={`flex items-center justify-between ${className || ''}`}>
      {Array.from({ length: steps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            i + 1 <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {i + 1}
          </div>
          {labels[i] && (
            <span className={`ml-2 text-sm ${i + 1 <= currentStep ? 'text-primary' : 'text-gray-500'}`}>
              {labels[i]}
            </span>
          )}
          {i < steps - 1 && (
            <div className={`w-12 h-0.5 mx-4 ${i + 1 < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
};
