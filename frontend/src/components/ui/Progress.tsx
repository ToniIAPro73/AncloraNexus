import React from 'react';
export const Progress: React.FC<{ value: number; className?: string }>=({ value, className='' })=> (
  <div className={`w-full bg-slate-700 h-2 rounded ${className}`}><div className="bg-primary h-2 rounded" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
);

export const StepProgress: React.FC<{ steps: number; currentStep: number; labels?: string[]; className?: string }>=({ steps, currentStep, labels, className='' })=> {
  const pct = steps > 0 ? (Math.min(currentStep, steps) / steps) * 100 : 0;
  return (
    <div className={className}>
      <Progress value={pct} />
      {labels && (
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          {labels.map((l, i) => (<span key={i}>{l}</span>))}
        </div>
      )}
    </div>
  );
};

