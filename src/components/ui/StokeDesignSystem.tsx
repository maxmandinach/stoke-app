import React from 'react';

// Utility function for merging className strings (clsx alternative)
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ========================================
// BUTTON COMPONENT
// ========================================

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'touch-target' // Ensures minimum 44px height for mobile
  );

  const variantClasses = {
    primary: cn(
      'bg-blue-600 text-white border border-blue-600',
      'hover:bg-blue-700 hover:border-blue-700',
      'focus:ring-blue-500',
      'active:bg-blue-800'
    ),
    secondary: cn(
      'bg-white text-gray-700 border border-gray-300',
      'hover:bg-gray-50 hover:border-gray-400',
      'focus:ring-gray-500',
      'active:bg-gray-100'
    ),
    ghost: cn(
      'bg-transparent text-gray-700 border border-transparent',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
      'active:bg-gray-200'
    ),
    success: cn(
      'bg-green-600 text-white border border-green-600',
      'hover:bg-green-700 hover:border-green-700',
      'focus:ring-green-500',
      'active:bg-green-800'
    ),
    danger: cn(
      'bg-red-600 text-white border border-red-600',
      'hover:bg-red-700 hover:border-red-700',
      'focus:ring-red-500',
      'active:bg-red-800'
    ),
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[44px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[44px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// ========================================
// CARD COMPONENT
// ========================================

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'interactive' | 'selected';
  onClick?: () => void;
  className?: string;
  role?: string;
}

export function Card({
  children,
  variant = 'default',
  onClick,
  className,
  role,
}: CardProps) {
  const isInteractive = variant === 'interactive' || variant === 'selected' || onClick;

  const baseClasses = cn(
    'bg-white border rounded-xl transition-all duration-200 ease-out',
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'
  );

  const variantClasses = {
    default: 'border-gray-200',
    interactive: cn(
      'border-gray-200 cursor-pointer',
      'hover:border-gray-300 hover:shadow-sm',
      'active:border-gray-400'
    ),
    selected: cn(
      'border-blue-500 ring-2 ring-blue-100 shadow-md',
      'cursor-pointer'
    ),
  };

  const Component = isInteractive ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      role={role}
      tabIndex={isInteractive ? 0 : undefined}
      className={cn(
        baseClasses,
        variantClasses[variant],
        'text-left w-full', // Ensure button styling doesn't interfere
        className
      )}
    >
      {children}
    </Component>
  );
}

// ========================================
// BADGE COMPONENT
// ========================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const baseClasses = cn(
    'inline-flex items-center font-medium rounded-full px-2 py-1'
  );

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// ========================================
// PROGRESS BAR COMPONENT
// ========================================

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

export function ProgressBar({
  progress,
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Progress',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
  };

  return (
    <div
      className={cn(
        'bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size],
        className
      )}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className="bg-green-500 h-full transition-all duration-300 ease-out rounded-full"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}

// ========================================
// CONTENT TYPE INDICATOR COMPONENT
// ========================================

type ContentType = 'podcast' | 'video' | 'article' | 'book' | 'interview' | 'lecture';

interface ContentTypeIndicatorProps {
  type: ContentType;
  className?: string;
}

export function ContentTypeIndicator({
  type,
  className,
}: ContentTypeIndicatorProps) {
  const getTypeConfig = (type: ContentType) => {
    switch (type) {
      case 'podcast':
        return {
          emoji: '🎧',
          label: 'Podcast',
          bgColor: 'bg-gradient-to-r from-purple-50 to-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200',
        };
      case 'video':
        return {
          emoji: '🎬',
          label: 'Video',
          bgColor: 'bg-gradient-to-r from-red-50 to-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
        };
      case 'article':
        return {
          emoji: '📄',
          label: 'Article',
          bgColor: 'bg-gradient-to-r from-green-50 to-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
        };
      case 'book':
        return {
          emoji: '📚',
          label: 'Book',
          bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
        };
      case 'interview':
        return {
          emoji: '🎙️',
          label: 'Interview',
          bgColor: 'bg-gradient-to-r from-cyan-50 to-cyan-100',
          textColor: 'text-cyan-800',
          borderColor: 'border-cyan-200',
        };
      case 'lecture':
        return {
          emoji: '🎓',
          label: 'Lecture',
          bgColor: 'bg-gradient-to-r from-orange-50 to-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
        };
      default:
        return {
          emoji: '📄',
          label: 'Content',
          bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium',
        'min-h-[32px]', // Mobile-friendly touch target
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <span className="text-sm" role="img" aria-hidden="true">
        {config.emoji}
      </span>
      <span>{config.label}</span>
    </div>
  );
}

// ========================================
// EXPORTS
// ========================================

export default {
  Button,
  Card,
  Badge,
  ProgressBar,
  ContentTypeIndicator,
}; 