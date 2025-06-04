'use client';

import React, { useState, useCallback } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useContentSelection } from '@/contexts/ContentSelectionContext';
import { ContentSelectionInterface } from './ContentSelectionInterface';
import { SessionConfigurationInterface } from './SessionConfigurationInterface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type AppStage = 'content-selection' | 'session-configuration';

export function AppCoordinator() {
  const [currentStage, setCurrentStage] = useState<AppStage>('content-selection');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { state: contentState } = useContentSelection();

  const canProceedToConfiguration = contentState.selectionCount > 0;

  const handleStageTransition = useCallback((newStage: AppStage) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStage(newStage);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const handleReturnToSelection = () => {
    handleStageTransition('content-selection');
  };

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

  const progressPercentage = currentStage === 'content-selection' 
    ? canProceedToConfiguration ? 50 : 25
    : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Progress Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <Progress value={progressPercentage} className="h-1" />
          </div>

          {/* Steps Navigation */}
          <div className="flex items-center justify-center gap-8">
            {/* Step 1: Content Selection */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                currentStage === 'content-selection' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : canProceedToConfiguration 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
              )}>
                {canProceedToConfiguration && currentStage !== 'content-selection' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  '1'
                )}
              </div>
              <div className="text-sm">
                <div className={cn(
                  "font-medium transition-colors",
                  currentStage === 'content-selection' ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  Select Content
                </div>
                {currentStage === 'content-selection' && (
                  <div className="text-xs text-muted-foreground">
                    Choose episodes to review
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            <div className={cn(
              "w-12 h-px transition-colors",
              canProceedToConfiguration ? 'bg-green-500' : 'bg-border'
            )} />

            {/* Step 2: Session Configuration */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                currentStage === 'session-configuration' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : canProceedToConfiguration 
                    ? 'bg-muted-foreground text-white' 
                    : 'bg-muted text-muted-foreground'
              )}>
                2
              </div>
              <div className="text-sm">
                <div className={cn(
                  "font-medium transition-colors",
                  currentStage === 'session-configuration' ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  Configure Session
                </div>
                {currentStage === 'session-configuration' && (
                  <div className="text-xs text-muted-foreground">
                    Set up your learning session
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selection Status */}
          {contentState.selectionCount > 0 && (
            <div className="flex justify-center mt-4">
              <Badge variant="secondary" className="px-3 py-1">
                {contentState.selectionCount} episode{contentState.selectionCount !== 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className={cn(
        "transition-all duration-200 ease-in-out",
        isTransitioning ? 'opacity-50' : 'opacity-100'
      )}>
        {renderCurrentStage()}
      </main>

      {/* Floating Continue Button */}
      {canProceedToConfiguration && currentStage === 'content-selection' && (
        <div className="fixed bottom-6 right-6 z-20">
          <Button
            onClick={() => handleStageTransition('session-configuration')}
            size="lg"
            className="h-14 px-6 shadow-lg hover:shadow-xl transition-all"
          >
            Configure Session
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 