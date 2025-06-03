import React from 'react';
import { Button } from './StokeDesignSystem';
import { StokeLogo } from './StokeLogo';

// Utility function for merging className strings
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface AppHeaderProps {
  title?: string;        // Page title when not on home
  showBack?: boolean;    // Show back arrow
  onBack?: () => void;   // Back button handler  
  rightAction?: React.ReactNode; // Optional right content
  className?: string;
}

export function AppHeader({ 
  title, 
  showBack = false, 
  onBack, 
  rightAction,
  className 
}: AppHeaderProps) {
  return (
    <header className={cn(
      'bg-white border-b border-gray-200 sticky top-0 z-40',
      className
    )}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Back button, Logo, and Title */}
          <div className="flex items-center space-x-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 min-h-[44px] min-w-[44px]" // Ensures mobile touch target
                aria-label="Go back"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              {/* Show logo with text when no title, logo only when title is present */}
              <StokeLogo 
                showText={!title} 
                size="md"
                className="flex-shrink-0"
              />
              
              {title && (
                <div className="min-w-0"> {/* Allows text truncation on small screens */}
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
                    {title}
                  </h1>
                </div>
              )}
            </div>
          </div>
          
          {/* Right section - Actions */}
          {rightAction && (
            <div className="flex items-center flex-shrink-0">
              {rightAction}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader; 