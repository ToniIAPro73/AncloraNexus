import React, { forwardRef } from 'react';

export const Avatar = forwardRef<HTMLDivElement, { children?: React.ReactNode; className?: string }>(
  ({ children, className = '' }, ref) => (
    <div ref={ref} className={`w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center ${className}`}>
      {children}
    </div>
  )
);
Avatar.displayName = 'Avatar';


