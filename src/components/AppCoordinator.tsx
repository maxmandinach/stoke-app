'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useContentSelection } from '@/contexts/ContentSelectionContext';
import { ContentSelectionInterface } from './ContentSelectionInterface';
import { SessionConfigurationInterface } from './SessionConfigurationInterface';

type AppStage = 'content-selection' | 'session-configuration';

export function AppCoordinator() {
  const [currentStage, setCurrentStage] = useState<AppStage>('content-selection');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { state: contentState } = useContentSelection();

  // Check if user can proceed to session configuration
  const canProceedToConfiguration = contentState.selectionCount > 0;

  const handleStageTransition = useCallback((newStage: AppStage) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStage(newStage);
      setIsTransitioning(false);
    }, 300);
  }, []);

  // Auto-advance to session configuration when content is selected
  useEffect(() => {
    if (canProceedToConfiguration && currentStage === 'content-selection') {
      // Add a small delay to allow users to see their selection
      const timer = setTimeout(() => {
        handleStageTransition('session-configuration');
      }, 1000);

      return () => clearTimeout(timer);
    }
    // Return undefined for the else case to satisfy TypeScript
    return undefined;
  }, [canProceedToConfiguration, currentStage, handleStageTransition]);

  const handleReturnToSelection = () => {
    handleStageTransition('content-selection');
  };

  // Render appropriate stage with transition effects
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'content-selection':
        return <ContentSelectionInterface />;
      case 'session-configuration':
        return <SessionConfigurationInterface onReturnToSelection={handleReturnToSelection} />;
      default:
        return <ContentSelectionInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Stage Progress Indicator */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {/* Step 1: Content Selection */}
            <div className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${currentStage === 'content-selection' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : canProceedToConfiguration 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                {canProceedToConfiguration && currentStage !== 'content-selection' ? '✓' : '1'}
              </div>
              <span className={`
                text-sm font-medium transition-colors duration-300
                ${currentStage === 'content-selection' ? 'text-purple-600' : 'text-gray-600'}
              `}>
                Select Content
              </span>
            </div>

            {/* Progress Line */}
            <div className={`
              w-16 h-0.5 transition-all duration-500
              ${canProceedToConfiguration ? 'bg-green-500' : 'bg-gray-200'}
            `} />

            {/* Step 2: Session Configuration */}
            <div className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${currentStage === 'session-configuration' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : canProceedToConfiguration 
                    ? 'bg-gray-400 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                2
              </div>
              <span className={`
                text-sm font-medium transition-colors duration-300
                ${currentStage === 'session-configuration' ? 'text-purple-600' : 'text-gray-600'}
              `}>
                Configure Session
              </span>
            </div>
          </div>

          {/* Selection Count Indicator */}
          {contentState.selectionCount > 0 && (
            <div className="flex justify-center mt-3">
              <div className="bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                <span className="text-sm text-purple-700 font-medium">
                  {contentState.selectionCount} episode{contentState.selectionCount !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className={`
        transition-all duration-300 ease-in-out
        ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}>
        <div className="px-4 py-6">
          {renderCurrentStage()}
        </div>
      </main>

      {/* Floating Action Button for Manual Stage Navigation */}
      {canProceedToConfiguration && currentStage === 'content-selection' && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => handleStageTransition('session-configuration')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">Configure Session</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
} 