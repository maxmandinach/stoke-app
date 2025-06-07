import React from 'react';

interface StokeHeaderProps {
  className?: string;
}

export default function StokeHeader({ className = '' }: StokeHeaderProps) {
  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-20">
          {/* Left side - Brand */}
          <div className="flex items-center">
            <div className="text-center md:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Stoke
              </h1>
              <p className="text-gray-600 text-sm lg:text-base mt-0.5 font-medium">
                Mindful Learning Platform
              </p>
            </div>
          </div>

          {/* Right side - User actions (placeholder for future features) */}
          <div className="flex items-center gap-4">
            {/* Avatar placeholder */}
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 