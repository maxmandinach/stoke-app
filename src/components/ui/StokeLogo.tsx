import React from 'react';

// Utility function for merging className strings
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface StokeLogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StokeLogo({ 
  showText = true, 
  size = 'md', 
  className 
}: StokeLogoProps) {
  const sizeConfig = {
    sm: {
      icon: 'w-6 h-6',
      innerShape: 'w-2 h-2',
      text: 'text-lg',
      spacing: 'space-x-1.5'
    },
    md: {
      icon: 'w-8 h-8',
      innerShape: 'w-3 h-3',
      text: 'text-2xl',
      spacing: 'space-x-2'
    },
    lg: {
      icon: 'w-10 h-10',
      innerShape: 'w-4 h-4',
      text: 'text-3xl',
      spacing: 'space-x-3'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center', config.spacing, className)}>
      {/* Icon - Blue gradient diamond/spark representing "igniting learning" */}
      <div className="relative">
        <div 
          className={cn(
            config.icon,
            'bg-gradient-to-tr from-blue-500 to-blue-600 rounded-lg transform rotate-45 flex items-center justify-center shadow-sm'
          )}
        >
          <div 
            className={cn(
              config.innerShape,
              'bg-white rounded-sm transform -rotate-45'
            )}
          />
        </div>
      </div>
      
      {/* Wordmark - Clean, professional typography */}
      {showText && (
        <span 
          className={cn(
            config.text,
            'font-bold text-gray-900 tracking-tight select-none'
          )}
        >
          Stoke
        </span>
      )}
    </div>
  );
}

export default StokeLogo; 