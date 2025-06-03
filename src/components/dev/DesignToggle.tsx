/**
 * Development Design Toggle Component
 * 
 * Only visible in development mode. Allows developers to toggle between
 * old and new design components for testing and comparison.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useFeatureFlags, toggleFeatureFlag } from '@/hooks/useFeatureFlags';

export function DesignToggle() {
  const { useNewDesign } = useFeatureFlags();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development mode
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  // Don't render anything in production
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">
            🔧 Dev Tools
          </span>
          <span className="text-xs text-gray-500">
            v{useNewDesign ? 'NEW' : 'OLD'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-600 font-medium">
            Design:
          </label>
          
          <button
            onClick={() => toggleFeatureFlag('useNewDesign')}
            className={`
              relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${useNewDesign ? 'bg-blue-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={useNewDesign}
            aria-label="Toggle between old and new design"
          >
            <span
              className={`
                inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                ${useNewDesign ? 'translate-x-5' : 'translate-x-1'}
              `}
            />
          </button>
          
          <span className="text-xs text-gray-600">
            {useNewDesign ? 'New' : 'Old'}
          </span>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Click to toggle and reload
        </div>
      </div>
    </div>
  );
}

export default DesignToggle; 