import React from 'react';
import { cn } from '@/lib/utils';

interface StokeHeaderProps {
  title?: string;
  className?: string;
}

export default function StokeHeader({ title, className }: StokeHeaderProps) {
  return (
    <header 
      className={cn(
        // Fixed positioning and z-index
        "fixed top-0 left-0 right-0 z-50",
        // Professional styling with enhanced backdrop
        "bg-white/95 backdrop-blur-lg border-b border-gray-200/80",
        // Height responsive to screen size
        "h-14 sm:h-16",
        // Enhanced shadow for depth
        "shadow-sm",
        className
      )}
      role="banner"
      aria-label="Site header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo */}
          <div className="flex items-center">
            <button
              className={cn(
                // Enhanced logo styling with better typography
                "text-heading-2 font-bold text-gray-900",
                "transition-all duration-200 ease-out",
                "hover:text-blue-600 focus-ring rounded-lg px-2 py-1"
              )}
              onClick={() => {
                // TODO: Navigate to home
                console.log('Navigate to home');
              }}
              aria-label="Stoke - Go to home page"
            >
              Stoke
            </button>
          </div>
          
          {/* Center: Optional page title */}
          {title && (
            <div className="hidden sm:flex flex-1 justify-center">
              <h1 className={cn(
                // Enhanced title typography
                "text-heading-3 text-gray-800 font-semibold text-center",
                "max-w-md truncate"
              )}>
                {title}
              </h1>
            </div>
          )}
          
          {/* Right: User avatar */}
          <div className="flex items-center">
            <button
              className={cn(
                // Enhanced avatar with better interactions
                "w-8 h-8 rounded-full bg-blue-600 text-white",
                "flex items-center justify-center font-semibold text-sm",
                "transition-all duration-200 ease-out",
                "hover:bg-blue-700 hover:scale-105 active:scale-95",
                "focus-ring shadow-sm hover:shadow-md"
              )}
              onClick={() => {
                // TODO: Open user menu
                console.log('Open user menu');
              }}
              aria-label="User menu - Open user account options"
              aria-haspopup="menu"
            >
              <span aria-hidden="true">U</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile title - shown below header on smaller screens */}
      {title && (
        <div className="sm:hidden bg-white/95 backdrop-blur-lg border-b border-gray-100 px-4 py-2">
          <h1 className="text-heading-3 text-gray-800 font-semibold text-center truncate">
            {title}
          </h1>
        </div>
      )}
    </header>
  );
} 