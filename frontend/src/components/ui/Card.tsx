import React, { forwardRef, memo } from 'react';

/**si
 * Props for the Card component
 */
interface CardProps {
  /** The content to be rendered inside the card */
  children: React.ReactNode;
  /** Additional CSS classes for styling */
  className?: string;
  /** Variant style for the card (e.g., 'default', 'elevated') */
  variant?: 'default' | 'elevated' | 'outlined' | 'dark';
  /** Whether to apply a border glow effect */
  borderGlow?: boolean;
}

/**
 * Card component - A flexible container component with customizable styling
 */
export const Card = memo(forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', variant = 'default', borderGlow = false }, ref) => {
    // Use Tailwind's dark: prefix for better theme support
    const baseClasses = 'rounded-xl border shadow transition-colors duration-300';

    const variantClasses = {
      default: 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700',
      elevated: 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 shadow-lg',
      outlined: 'bg-transparent border-gray-400 dark:border-slate-500',
      dark: 'bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-800',
    };

    const glowClass = borderGlow ? 'border-glow' : '';
    const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        role="region"
        aria-label="Card container"
      >
        {children || null}
      </div>
    );
  }
));

Card.displayName = 'Card';

/**
 * Props for CardHeader component
 */
interface CardHeaderProps {
  /** The content to be rendered in the header */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CardHeader component - Header section of the card
 */
export const CardHeader = memo(forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '' }, ref) => (
    <div
      ref={ref}
      className={`p-4 border-b border-gray-200 dark:border-slate-700 ${className}`.trim()}
      role="banner"
    >
      {children || null}
    </div>
  )
));

CardHeader.displayName = 'CardHeader';

/**
 * Props for CardTitle component
 */
interface CardTitleProps {
  /** The title text or element */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** HTML heading level for accessibility */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * CardTitle component - Title element within the card
 */
export const CardTitle = memo(forwardRef<HTMLElement, CardTitleProps>(
  ({ children, className = '', level = 3 }, ref) => {
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    return React.createElement(
      HeadingTag,
      {
        ref,
        className: `text-lg font-medium text-gray-900 dark:text-white ${className}`.trim(),
      },
      children || ''
    );
  }
));

CardTitle.displayName = 'CardTitle';

/**
 * Props for CardContent component
 */
interface CardContentProps {
  /** The main content of the card */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CardContent component - Main content area of the card
 */
export const CardContent = memo(forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '' }, ref) => (
    <div
      ref={ref}
      className={`p-4 ${className}`.trim()}
      role="main"
    >
      {children || null}
    </div>
  )
));

CardContent.displayName = 'CardContent';
