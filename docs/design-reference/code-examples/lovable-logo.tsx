// Lovable's Logo Component
// Clean, professional design with blue gradient icon + "Stoke" wordmark

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Icon - stylized flame/spark */}
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-lg transform rotate-45 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm transform -rotate-45"></div>
        </div>
      </div>
      
      {/* Wordmark */}
      {showText && (
        <span className="text-2xl font-bold text-gray-900 tracking-tight">
          Stoke
        </span>
      )}
    </div>
  );
};

export default Logo;
