'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useContentSelection } from '@/contexts/ContentSelectionContext';
import { ContentSelectionInterface } from './ContentSelectionInterface';
import { SessionConfigurationInterface } from './SessionConfigurationInterface';
import UnifiedSessionManager from './UnifiedSessionManager';
import SessionCompletionFlow from './SessionCompletionFlow';
import ProgressAnalytics from './ProgressAnalytics';
import { MemoryWavesProgress } from './MemoryWaves';
import StokeLogo from './StokeLogo';
import type { SessionType, DifficultyLevel } from '@/types/database.types';
import { 
  trackSessionCompletion, 
  getTopicRetentionMetrics, 
  getLearningInsights, 
  generateNextSessionGuidance,
  getMotivationMessage,
  type SessionCompletionData,
  type NextSessionGuidance,
  type LearningInsights,
  type TopicRetentionMetrics
} from '@/lib/analytics';

type AppStage = 
  | 'content-selection' 
  | 'session-configuration' 
  | 'session-active' 
  | 'session-complete' 
  | 'analytics' 
  | 'error';

interface SessionConfiguration {
  sessionType: SessionType;
  targetDurationMinutes: number;
  difficultyPreference?: DifficultyLevel;
}

interface SessionResults {
  sessionType: SessionType;
  totalDurationSeconds: number;
  readSummariesResults?: {
    totalSummaries: number;
    summariesRead: number;
    summaryType: string;
    readingTimeSeconds: number;
    averageReadTimePerSummary: number;
  };
  testKnowledgeResults?: {
    totalQuestions: number;
    questionsAnswered: number;
    gotItCount: number;
    revisitCount: number;
    testingTimeSeconds: number;
    averageResponseTime: number;
  };
  completionRate: number;
  overallAccuracy?: number;
  contentIds: string[];
  contentTitles?: string[];
  topicsReviewed?: string[];
}

interface ErrorState {
  message: string;
  code?: string;
  retry?: () => void;
}

export default function EnhancedAppCoordinator() {
  // Stage management
  const [currentStage, setCurrentStage] = useState<AppStage>('content-selection');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  // Session state
  const [sessionConfig, setSessionConfig] = useState<SessionConfiguration | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [nextSessionGuidance, setNextSessionGuidance] = useState<NextSessionGuidance | null>(null);

  // Analytics state
  const [topicProgress, setTopicProgress] = useState<TopicRetentionMetrics[]>([]);
  const [learningInsights, setLearningInsights] = useState<LearningInsights | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Content selection context
  const { state: contentState } = useContentSelection();

  // Mock user ID - in production this would come from auth context
  const userId = 'demo-user-123';

  // Check if user can proceed to session configuration
  const canProceedToConfiguration = contentState.selectionCount > 0;

  // Error handling with retry logic
  const handleError = useCallback((error: Error, retryAction?: () => void) => {
    console.error('App error:', error);
    setError({
      message: error.message || 'An unexpected error occurred',
      code: 'code' in error ? (error as any).code : undefined,
      retry: retryAction
    });
    setCurrentStage('error');
  }, []);

  // Clear error and retry
  const clearError = useCallback(() => {
    setError(null);
    if (error?.retry) {
      error.retry();
    } else {
      setCurrentStage('content-selection');
    }
  }, [error]);

  // Stage transition with smooth animations
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
      const timer = setTimeout(() => {
        handleStageTransition('session-configuration');
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [canProceedToConfiguration, currentStage, handleStageTransition]);

  // Load analytics data when needed
  const loadAnalyticsData = useCallback(async () => {
    if (isLoadingAnalytics) return;
    
    setIsLoadingAnalytics(true);
    try {
      const [topicMetrics, insights] = await Promise.all([
        getTopicRetentionMetrics(userId),
        getLearningInsights(userId)
      ]);
      
      setTopicProgress(topicMetrics);
      setLearningInsights(insights);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Don't throw error for analytics - show empty state instead
      setTopicProgress([]);
      setLearningInsights(null);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [userId, isLoadingAnalytics]);

  // Generate next session guidance after completion
  const generateGuidance = useCallback(async () => {
    try {
      const guidance = await generateNextSessionGuidance(userId);
      setNextSessionGuidance(guidance);
    } catch (error) {
      console.error('Failed to generate guidance:', error);
      // Provide default guidance if generation fails
      setNextSessionGuidance({
        recommendedType: 'read_summaries',
        suggestedDuration: 5,
        reasoningText: 'Continue building your knowledge with summary reviews.',
        questionsReadyForReview: 0
      });
    }
  }, [userId]);

  // Handle session configuration completion
  const handleConfigurationComplete = useCallback((config: SessionConfiguration) => {
    setSessionConfig(config);
    handleStageTransition('session-active');
  }, [handleStageTransition]);

  // Handle session completion
  const handleSessionComplete = useCallback(async (results: any) => {
    try {
      // Transform results to our expected format
      const sessionResults: SessionResults = {
        sessionType: sessionConfig?.sessionType || 'read_summaries',
        totalDurationSeconds: results.totalDurationSeconds || 0,
        readSummariesResults: results.readSummariesResults,
        testKnowledgeResults: results.testKnowledgeResults,
        completionRate: results.completionRate || 0,
        overallAccuracy: results.overallAccuracy,
        contentIds: Array.from(contentState.selectedContentIds || []),
        contentTitles: [], // Would be populated from content data in production
        topicsReviewed: [] // Would be populated from content data in production
      };

      setSessionResults(sessionResults);

      // Track completion in analytics
      if (sessionConfig) {
        const completionData: SessionCompletionData = {
          sessionId: `session-${Date.now()}`, // In production, get from session manager
          userId,
          sessionType: sessionConfig.sessionType,
          contentIds: Array.from(contentState.selectedContentIds || []),
          plannedDurationMinutes: sessionConfig.targetDurationMinutes,
          actualDurationMinutes: Math.round(results.totalDurationSeconds / 60),
          questionsAnswered: results.testKnowledgeResults?.questionsAnswered || 0,
          questionsCorrect: results.testKnowledgeResults?.gotItCount || 0,
          summariesRead: results.readSummariesResults?.summariesRead || 0,
          completionRate: results.completionRate || 0,
          averageResponseTime: results.testKnowledgeResults?.averageResponseTime,
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
        };

        await trackSessionCompletion(completionData);
      }

      // Generate next session guidance
      await generateGuidance();
      
      // Transition to completion stage
      handleStageTransition('session-complete');
      
    } catch (error) {
      handleError(error as Error, () => handleSessionComplete(results));
    }
  }, [sessionConfig, contentState, userId, generateGuidance, handleStageTransition, handleError]);

  // Handle returning to content library
  const handleReturnToLibrary = useCallback(() => {
    // Reset session state
    setSessionConfig(null);
    setSessionResults(null);
    setNextSessionGuidance(null);
    
    // Return to content selection
    handleStageTransition('content-selection');
  }, [handleStageTransition]);

  // Handle starting a new session with recommended type
  const handleStartNewSession = useCallback((sessionType: SessionType) => {
    if (nextSessionGuidance) {
      const newConfig: SessionConfiguration = {
        sessionType,
        targetDurationMinutes: nextSessionGuidance.suggestedDuration,
        difficultyPreference: 3 // Default medium difficulty
      };
      setSessionConfig(newConfig);
      handleStageTransition('session-active');
    }
  }, [nextSessionGuidance, handleStageTransition]);

  // Handle analytics view
  const handleViewAnalytics = useCallback(() => {
    loadAnalyticsData();
    handleStageTransition('analytics');
  }, [loadAnalyticsData, handleStageTransition]);

  // Navigation helpers
  const handleReturnToSelection = () => handleStageTransition('content-selection');
  const handleSessionExit = () => handleReturnToLibrary();

  // Get current progress for stage indicator
  const getStageProgress = (): number => {
    switch (currentStage) {
      case 'content-selection': return 0.2;
      case 'session-configuration': return 0.4;
      case 'session-active': return 0.7;
      case 'session-complete': return 1.0;
      case 'analytics': return 1.0;
      default: return 0;
    }
  };

  // Get stage label for display
  const getStageLabel = (): string => {
    switch (currentStage) {
      case 'content-selection': return 'Select Content';
      case 'session-configuration': return 'Configure Session';
      case 'session-active': return 'Learning Session';
      case 'session-complete': return 'Session Complete';
      case 'analytics': return 'Progress Analytics';
      case 'error': return 'Error Recovery';
      default: return 'Loading...';
    }
  };

  // Error Recovery Screen
  if (currentStage === 'error' && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-lg">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">⚠️</div>
              </div>
              <h1 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h1>
              <p className="text-sm text-slate-600">{error.message}</p>
              {error.code && (
                <p className="text-xs text-slate-500 mt-2">Error code: {error.code}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={clearError}
                className="w-full py-3 px-6 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 transition-colors"
              >
                {error.retry ? 'Try Again' : 'Return to Library'}
              </button>
              
              <button
                onClick={() => setCurrentStage('content-selection')}
                className="w-full py-3 px-6 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app with Memory Waves design
  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header with Navigation */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Top Row: Logo and Stage Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StokeLogo className="w-8 h-8 text-slate-800" />
              <span className="font-semibold text-slate-800">Stoke</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Analytics Button */}
              {currentStage !== 'analytics' && (
                <button
                  onClick={handleViewAnalytics}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="text-lg">📊</div>
                  <span>Analytics</span>
                </button>
              )}
              
              {/* Stage Progress */}
              <div className="flex items-center gap-2">
                <MemoryWavesProgress 
                  progress={getStageProgress()} 
                  size={20} 
                  className="text-purple-500"
                />
                <span className="text-xs text-slate-500">{getStageLabel()}</span>
              </div>
            </div>
          </div>

          {/* Stage Navigation (only show for session flow) */}
          {['content-selection', 'session-configuration', 'session-active'].includes(currentStage) && (
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
                    : ['session-active', 'session-complete'].includes(currentStage)
                      ? 'bg-green-500 text-white'
                      : canProceedToConfiguration 
                        ? 'bg-gray-400 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {['session-active', 'session-complete'].includes(currentStage) ? '✓' : '2'}
                </div>
                <span className={`
                  text-sm font-medium transition-colors duration-300
                  ${currentStage === 'session-configuration' ? 'text-purple-600' : 'text-gray-600'}
                `}>
                  Configure Session
                </span>
              </div>

              {/* Progress Line */}
              <div className={`
                w-16 h-0.5 transition-all duration-500
                ${['session-active', 'session-complete'].includes(currentStage) ? 'bg-green-500' : 'bg-gray-200'}
              `} />

              {/* Step 3: Active Session */}
              <div className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${currentStage === 'session-active' 
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : currentStage === 'session-complete'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStage === 'session-complete' ? '✓' : '3'}
                </div>
                <span className={`
                  text-sm font-medium transition-colors duration-300
                  ${currentStage === 'session-active' ? 'text-purple-600' : 'text-gray-600'}
                `}>
                  Learning Session
                </span>
              </div>
            </div>
          )}

          {/* Selection Count Indicator */}
          {contentState.selectionCount > 0 && currentStage !== 'session-active' && (
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

      {/* Main Content Area with Smooth Transitions */}
      <main className={`
        transition-all duration-300 ease-in-out min-h-[calc(100vh-120px)]
        ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}>
        {/* Content Selection */}
        {currentStage === 'content-selection' && (
          <div className="px-4 py-6">
            <ContentSelectionInterface />
          </div>
        )}

        {/* Session Configuration */}
        {currentStage === 'session-configuration' && (
          <div className="px-4 py-6">
            <SessionConfigurationInterface 
              onReturnToSelection={handleReturnToSelection}
            />
          </div>
        )}

        {/* Active Session */}
        {currentStage === 'session-active' && sessionConfig && (
          <UnifiedSessionManager
            userId={userId}
            contentIds={Array.from(contentState.selectedContentIds || [])}
            sessionType={sessionConfig.sessionType}
            targetDurationMinutes={sessionConfig.targetDurationMinutes}
            difficultyPreference={sessionConfig.difficultyPreference}
            onSessionComplete={handleSessionComplete}
            onExit={handleSessionExit}
          />
        )}

        {/* Session Completion */}
        {currentStage === 'session-complete' && sessionResults && nextSessionGuidance && (
          <SessionCompletionFlow
            results={sessionResults}
            nextSessionGuidance={nextSessionGuidance}
            onReturnToLibrary={handleReturnToLibrary}
            onStartNewSession={handleStartNewSession}
            userId={userId}
          />
        )}

        {/* Progress Analytics */}
        {currentStage === 'analytics' && (
          <ProgressAnalytics
            userId={userId}
            topicProgress={topicProgress}
            sessionAnalytics={[]} // Would be populated from analytics data
            contentPreferences={learningInsights ? {
              preferredSources: learningInsights.preferredSources,
              preferredSessionLength: learningInsights.preferredSessionLength.toString(),
              contentSelectionPatterns: {
                topicDiversity: learningInsights.sessionPatterns.topicDiversity,
                difficultyPreference: learningInsights.sessionPatterns.difficultyPreference,
                reviewFrequency: learningInsights.sessionPatterns.reviewFrequency
              },
              learningStyle: learningInsights.learningStyle
            } : {
              preferredSources: [],
              preferredSessionLength: '5',
              contentSelectionPatterns: {
                topicDiversity: 0.5,
                difficultyPreference: 'balanced',
                reviewFrequency: 'moderate'
              },
              learningStyle: {
                type: 'balanced',
                confidence: 0.5,
                description: 'Learning your preferences...'
              }
            }}
            learningStreak={learningInsights ? {
              currentStreak: learningInsights.currentStreak,
              longestStreak: learningInsights.longestStreak,
              weeklyGoal: learningInsights.weeklyGoal,
              weeklyProgress: learningInsights.weeklyProgress,
              lastActiveDate: new Date().toISOString(),
              motivation: getMotivationMessage(
                learningInsights.currentStreak,
                learningInsights.weeklyProgress,
                learningInsights.weeklyGoal
              )
            } : {
              currentStreak: 0,
              longestStreak: 0,
              weeklyGoal: 5,
              weeklyProgress: 0,
              lastActiveDate: new Date().toISOString(),
              motivation: "Ready to start your learning journey?"
            }}
            onViewChange={(view) => {
              if (view === 'back') {
                handleReturnToLibrary();
              }
            }}
          />
        )}
      </main>

      {/* Floating Action Button for Manual Navigation */}
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