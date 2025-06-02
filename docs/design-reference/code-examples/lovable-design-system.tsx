// Lovable's Design System Components
// Clean, professional components for productivity app aesthetic

import React from 'react';
import { cn } from '@/lib/utils';

// Design System Components

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-200",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  onClick, 
  selected = false, 
  hover = true 
}) => {
  const baseStyles = "bg-white rounded-xl border transition-all duration-200";
  const interactiveStyles = onClick ? "cursor-pointer" : "";
  const selectedStyles = selected ? "border-blue-500 ring-2 ring-blue-100 shadow-md" : "border-gray-200";
  const hoverStyles = hover && onClick ? "hover:border-gray-300 hover:shadow-sm" : "";
  
  return (
    <div
      className={cn(baseStyles, interactiveStyles, selectedStyles, hoverStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'sm' 
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800"
  };
  
  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm"
  };
  
  return (
    <span className={cn(baseStyles, variants[variant], sizes[size])}>
      {children}
    </span>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  size?: 'sm' | 'md';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className, 
  size = 'md' 
}) => {
  const containerStyles = size === 'sm' ? "h-1.5" : "h-2";
  
  return (
    <div className={cn("bg-gray-200 rounded-full overflow-hidden", containerStyles, className)}>
      <div
        className="bg-green-500 h-full transition-all duration-300 rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};
