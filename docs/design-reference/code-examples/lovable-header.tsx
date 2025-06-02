// Lovable's Header Component
// Clean, professional header with logo, navigation, and consistent styling

import React from 'react';
import { Button } from './lovable-design-system';
import { Logo } from './lovable-logo';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, rightAction }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <Logo showText={!title} />
              {title && (
                <div>
                  <p className="text-lg font-semibold text-gray-900">{title}</p>
                </div>
              )}
            </div>
          </div>
          
          {rightAction && (
            <div className="flex items-center">
              {rightAction}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
