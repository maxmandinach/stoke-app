import React, { createContext, useContext, ReactNode } from 'react';
import MemoryWaves from './MemoryWaves';

// Import the size type
type MemoryWavesSize = 16 | 20 | 24 | 32 | 48 | 64 | 96 | 128 | 256 | 512;

// Design System Theme Context
interface StokeTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };
  typography: {
    display: string;
    title: string;
    subtitle: string;
    body: string;
    caption: string;
    small: string;
  };
  animation: {
    fast: string;
    normal: string;
    slow: string;
  };
}

const defaultTheme: StokeTheme = {
  colors: {
    primary: 'var(--stoke-primary-blue)',
    secondary: 'var(--stoke-deep-navy)', 
    accent: 'var(--stoke-soft-gray)',
    success: 'var(--stoke-success-green)',
    warning: 'var(--stoke-warning-amber)',
    error: 'var(--stoke-subtle-red)',
    background: 'var(--stoke-pure-white)',
    surface: 'var(--stoke-light-gray)',
    text: {
      primary: 'var(--stoke-deep-navy)',
      secondary: 'var(--stoke-soft-gray)',
      disabled: 'var(--stoke-gray-400)',
    },
  },
  spacing: {
    xs: 'var(--stoke-space-xs)',
    sm: 'var(--stoke-space-sm)',
    md: 'var(--stoke-space-md)',
    lg: 'var(--stoke-space-lg)',
    xl: 'var(--stoke-space-xl)',
    xxl: 'var(--stoke-space-2xl)',
    xxxl: 'var(--stoke-space-3xl)',
  },
  typography: {
    display: 'stoke-display',
    title: 'stoke-title',
    subtitle: 'stoke-subtitle',
    body: 'stoke-body',
    caption: 'stoke-caption',
    small: 'stoke-small',
  },
  animation: {
    fast: 'var(--stoke-transition-fast)',
    normal: 'var(--stoke-transition-normal)',
    slow: 'var(--stoke-transition-slow)',
  },
};

const ThemeContext = createContext<StokeTheme>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

// Core Design System Components

// Button Component with Memory Waves aesthetic
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = `stoke-btn stoke-btn-${variant} stoke-btn-${size}`;
  const classes = `${baseClasses} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <MemoryWaves size={16} variant="pulse" animate={true} />
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </div>
      )}
    </button>
  );
}

// Card Component with Memory Waves styling
interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'selectable' | 'selected';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  hover = false,
  onClick,
  className = ''
}: CardProps) {
  const baseClasses = 'stoke-card';
  const variantClasses = {
    default: '',
    selectable: 'stoke-card-selectable cursor-pointer',
    selected: 'stoke-card-selected'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${hover ? 'hover:shadow-lg' : ''} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

// Input Component with Memory Waves design
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  className = ''
}: InputProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="stoke-caption font-medium text-stoke-deep-navy mb-2 block">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`stoke-input w-full ${error ? 'border-stoke-subtle-red' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      />
      {error && (
        <p className="stoke-small text-stoke-subtle-red mt-1">{error}</p>
      )}
    </div>
  );
}

// Progress Ring Component using Memory Waves
interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 3,
  showLabel = true,
  label,
  className = ''
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  // Calculate the closest valid MemoryWaves size
  const memoryWavesSize = Math.round(size * 0.5);
  const validSizes: MemoryWavesSize[] = [16, 20, 24, 32, 48, 64, 96, 128, 256, 512];
  const closestSize = validSizes.reduce((prev, curr) => 
    Math.abs(curr - memoryWavesSize) < Math.abs(prev - memoryWavesSize) ? curr : prev
  );

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--stoke-gray-200)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--stoke-primary-blue)"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        {/* Center Memory Waves */}
        <div className="absolute inset-0 flex items-center justify-center">
          <MemoryWaves 
            size={closestSize} 
            variant="progressive" 
            progress={progress}
            color="var(--stoke-primary-blue)"
          />
        </div>
      </div>
      {showLabel && (
        <span className="stoke-caption mt-2 text-center">
          {label || `${Math.round(progress * 100)}%`}
        </span>
      )}
    </div>
  );
}

// Topic Tag Component
interface TopicTagProps {
  children: ReactNode;
  variant?: 'default' | 'selected' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function TopicTag({
  children,
  variant = 'default',
  size = 'md',
  onClick,
  className = ''
}: TopicTagProps) {
  const baseClasses = `stoke-topic-tag stoke-topic-tag-${size}`;
  const variantClasses = variant === 'interactive' ? 'stoke-topic-tag-interactive' : '';
  const classes = `${baseClasses} ${variantClasses} ${className}`;

  return (
    <span className={classes} onClick={onClick}>
      {children}
    </span>
  );
}

// Loading Spinner with Memory Waves
interface LoadingSpinnerProps {
  size?: MemoryWavesSize;
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 32,
  text,
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <MemoryWaves
        size={size}
        variant="ripple"
        animate={true}
        color="var(--stoke-primary-blue)"
        speed="normal"
      />
      {text && (
        <p className="stoke-caption text-center text-stoke-soft-gray animate-pulse-slow">
          {text}
        </p>
      )}
    </div>
  );
}

// Header Component with Memory Waves branding
interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function Header({
  title,
  subtitle,
  showLogo = true,
  actions,
  className = ''
}: HeaderProps) {
  return (
    <header className={`stoke-header ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showLogo && (
            <MemoryWaves 
              size={48} 
              color="var(--stoke-primary-blue)"
              className="flex-shrink-0"
            />
          )}
          <div>
            {title && <h1 className="stoke-title">{title}</h1>}
            {subtitle && <p className="stoke-caption mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </header>
  );
}

// Selection Counter Component
interface SelectionCounterProps {
  count: number;
  total?: number;
  noun?: string;
  className?: string;
}

export function SelectionCounter({
  count,
  total,
  noun = 'episode',
  className = ''
}: SelectionCounterProps) {
  const pluralNoun = count === 1 ? noun : `${noun}s`;
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <MemoryWaves 
        size={16} 
        variant="progressive" 
        progress={total ? count / total : count > 0 ? 1 : 0}
        color="var(--stoke-primary-blue)"
      />
      <span className="stoke-caption font-medium">
        {count} {pluralNoun} selected
        {total && ` of ${total}`}
      </span>
    </div>
  );
} 