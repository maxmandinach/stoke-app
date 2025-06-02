'use client';

import React, { useState, useCallback } from 'react';
import ReadSummariesSessionManager from './ReadSummariesSessionManager';
import TestKnowledgeSessionManager from './TestKnowledgeSessionManager';
import { MemoryWavesProgress } from './MemoryWaves';
import StokeLogo from './StokeLogo';
import type { SessionType, DifficultyLevel } from '@/types/database.types';

interface UnifiedSessionManagerProps {
  userId: string;
  contentIds: string[];
  sessionType: SessionType;
  targetDurationMinutes: number;
  difficultyPreference?: DifficultyLevel;
  onSessionComplete: (results: UnifiedSessionResults) => void;
  onExit: () => void;
}

interface UnifiedSessionResults {
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
}

type SessionPhase = 'reading' | 'testing' | 'complete';

export default function UnifiedSessionManager({
  userId,
  contentIds,
  sessionType,
  targetDurationMinutes,
  difficultyPreference,
  onSessionComplete,
  onExit
}: UnifiedSessionManagerProps) {
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>(
    sessionType === 'read_summaries' ? 'reading' : 
    sessionType === 'test_knowledge' ? 'testing' : 
    'reading' // 'both' starts with reading
  );
  
  const [sessionStartTime] = useState<number>(Date.now());
  const [readSummariesResults, setReadSummariesResults] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Calculate overall progress for "Both" sessions
  const getOverallProgress = (): number => {
    if (sessionType === 'read_summaries') return currentPhase === 'complete' ? 1 : 0;
    if (sessionType === 'test_knowledge') return currentPhase === 'complete' ? 1 : 0;
    if (sessionType === 'both') {
      if (currentPhase === 'reading') return 0.3; // Reading phase is ~30% of total
      if (currentPhase === 'testing') return 0.8; // Most progress during testing
      return 1; // Complete
    }
    return 0;
  };

  const getPhaseLabel = (): string => {
    if (sessionType === 'both') {
      if (currentPhase === 'reading') return 'Reading Phase';
      if (currentPhase === 'testing') return 'Testing Phase';
      return 'Complete';
    }
    return sessionType === 'read_summaries' ? 'Reading Summaries' : 'Testing Knowledge';
  };

  const handleReadSummariesComplete = useCallback((results: any) => {
    setReadSummariesResults(results);
    
    if (sessionType === 'read_summaries') {
      // Complete the session
      const totalDuration = Date.now() - sessionStartTime;
      const unifiedResults: UnifiedSessionResults = {
        sessionType,
        totalDurationSeconds: Math.round(totalDuration / 1000),
        readSummariesResults: {
          totalSummaries: results.totalSummaries,
          summariesRead: results.summariesRead,
          summaryType: results.summaryType,
          readingTimeSeconds: results.totalTimeSeconds,
          averageReadTimePerSummary: results.averageReadTimePerSummary
        },
        completionRate: results.completionRate
      };
      
      onSessionComplete(unifiedResults);
    } else if (sessionType === 'both') {
      // Transition to testing phase
      setCurrentPhase('testing');
    }
  }, [sessionType, sessionStartTime, onSessionComplete]);

  const handleContinueToTest = useCallback(() => {
    if (sessionType === 'both') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPhase('testing');
        setIsTransitioning(false);
      }, 500);
    }
  }, [sessionType]);

  const handleTestKnowledgeComplete = useCallback((results: any) => {
    const totalDuration = Date.now() - sessionStartTime;
    
    const unifiedResults: UnifiedSessionResults = {
      sessionType,
      totalDurationSeconds: Math.round(totalDuration / 1000),
      completionRate: results.completionRate || (results.questionsAnswered / results.totalQuestions),
      overallAccuracy: results.accuracyRate || (results.gotItCount / Math.max(results.questionsAnswered, 1))
    };

    if (sessionType === 'test_knowledge') {
      unifiedResults.testKnowledgeResults = {
        totalQuestions: results.totalQuestions,
        questionsAnswered: results.questionsAnswered,
        gotItCount: results.gotItCount,
        revisitCount: results.revisitCount,
        testingTimeSeconds: results.totalTimeSeconds,
        averageResponseTime: results.averageResponseTime
      };
    } else if (sessionType === 'both' && readSummariesResults) {
      // Combine both phases
      unifiedResults.readSummariesResults = {
        totalSummaries: readSummariesResults.totalSummaries,
        summariesRead: readSummariesResults.summariesRead,
        summaryType: readSummariesResults.summaryType,
        readingTimeSeconds: readSummariesResults.totalTimeSeconds,
        averageReadTimePerSummary: readSummariesResults.averageReadTimePerSummary
      };
      unifiedResults.testKnowledgeResults = {
        totalQuestions: results.totalQuestions,
        questionsAnswered: results.questionsAnswered,
        gotItCount: results.gotItCount,
        revisitCount: results.revisitCount,
        testingTimeSeconds: results.totalTimeSeconds,
        averageResponseTime: results.averageResponseTime
      };
      
      // Calculate combined completion rate
      const readingWeight = 0.3;
      const testingWeight = 0.7;
      unifiedResults.completionRate = 
        (readSummariesResults.completionRate * readingWeight) + 
        (results.completionRate * testingWeight);
    }

    onSessionComplete(unifiedResults);
  }, [sessionType, sessionStartTime, readSummariesResults, onSessionComplete]);

  // Phase transition screen for "Both" sessions
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <StokeLogo className="w-8 h-8 text-slate-800" />
            <div className="flex items-center space-x-3">
              <MemoryWavesProgress progress={getOverallProgress()} size={20} />
              <span className="text-xs text-slate-500">{getPhaseLabel()}</span>
            </div>
          </div>
        </div>

        {/* Transition content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center">
            <div className="mb-6">
              <MemoryWavesProgress progress={0.5} size={64} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Transitioning to Test Knowledge
            </h2>
            <p className="text-slate-600">
              Preparing your personalized questions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate session component based on current phase
  if (currentPhase === 'reading' || sessionType === 'read_summaries') {
    return (
      <div className="min-h-screen bg-white">
        {/* Unified progress header for "Both" sessions */}
        {sessionType === 'both' && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MemoryWavesProgress progress={getOverallProgress()} size={20} />
                <span className="text-sm text-slate-600">{getPhaseLabel()}</span>
              </div>
              <span className="text-xs text-slate-400">1 of 2 phases</span>
            </div>
          </div>
        )}
        
        <ReadSummariesSessionManager
          userId={userId}
          contentIds={contentIds}
          targetDurationMinutes={targetDurationMinutes}
          sessionType={sessionType === 'both' ? 'both' : 'read_summaries'}
          onSessionComplete={handleReadSummariesComplete}
          onContinueToTest={handleContinueToTest}
          onExit={onExit}
        />
      </div>
    );
  }

  if (currentPhase === 'testing' || sessionType === 'test_knowledge') {
    return (
      <div className="min-h-screen bg-white">
        {/* Unified progress header for "Both" sessions */}
        {sessionType === 'both' && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MemoryWavesProgress progress={getOverallProgress()} size={20} />
                <span className="text-sm text-slate-600">{getPhaseLabel()}</span>
              </div>
              <span className="text-xs text-slate-400">2 of 2 phases</span>
            </div>
          </div>
        )}
        
        <TestKnowledgeSessionManager
          userId={userId}
          contentIds={contentIds}
          targetDurationMinutes={sessionType === 'both' ? Math.ceil(targetDurationMinutes * 0.7) : targetDurationMinutes}
          difficultyPreference={difficultyPreference}
          onSessionComplete={handleTestKnowledgeComplete}
          onExit={onExit}
        />
      </div>
    );
  }

  return null;
}

export type { UnifiedSessionResults }; 