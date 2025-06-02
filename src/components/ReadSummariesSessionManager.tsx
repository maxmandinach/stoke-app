'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReadSummariesSession, { SummaryType } from './ReadSummariesSession';
import { MemoryWavesLoader } from './MemoryWaves';
import { sharedContentAPI } from '@/lib/database/sharedContent';
import type { SessionType, DifficultyLevel } from '@/types/database.types';

interface SummaryContent {
  content_id: string;
  title: string;
  quick_summary: string;
  full_summary: string;
  estimated_read_time_minutes: number;
  topics?: Array<{
    name: string;
    color?: string;
  }>;
}

interface ReadSummariesSessionManagerProps {
  userId: string;
  contentIds: string[];
  targetDurationMinutes: number;
  sessionType: 'read_summaries' | 'both';
  onSessionComplete: (results: ReadSummariesResults) => void;
  onContinueToTest?: () => void; // For "Both" sessions
  onExit: () => void;
}

interface ReadSummariesResults {
  totalSummaries: number;
  summariesRead: number;
  summaryType: SummaryType;
  totalTimeSeconds: number;
  averageReadTimePerSummary: number;
  completionRate: number;
  sessionId: string;
  contentIds: string[];
}

export default function ReadSummariesSessionManager({
  userId,
  contentIds,
  targetDurationMinutes,
  sessionType,
  onSessionComplete,
  onContinueToTest,
  onExit
}: ReadSummariesSessionManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<SummaryContent[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Initialize session and load summaries
  useEffect(() => {
    initializeSession();
  }, [userId, contentIds, targetDurationMinutes]);

  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load content with summaries
      const loadedSummaries: SummaryContent[] = [];
      
      for (const contentId of contentIds) {
        try {
          const content = await sharedContentAPI.getContentWithStatus(contentId);
          
          if (content.processing_status !== 'completed') {
            console.warn(`Content ${contentId} is not fully processed, skipping...`);
            continue;
          }

          if (!content.quick_summary || !content.full_summary) {
            console.warn(`Content ${contentId} missing summaries, skipping...`);
            continue;
          }

          // Extract topic information
          const topics = content.episode_topics?.map((et: any) => ({
            name: et.topics?.name || 'Unknown Topic',
            color: et.topics?.color || undefined
          })) || [];

          loadedSummaries.push({
            content_id: content.id,
            title: content.title,
            quick_summary: content.quick_summary,
            full_summary: content.full_summary,
            estimated_read_time_minutes: content.estimated_read_time_minutes || 5,
            topics: topics.length > 0 ? topics : undefined
          });
        } catch (contentError) {
          console.error(`Failed to load content ${contentId}:`, contentError);
        }
      }

      if (loadedSummaries.length === 0) {
        throw new Error('No summaries available for the selected content');
      }

      // Create learning session record
      const sessionPlan = {
        content_ids: loadedSummaries.map(s => s.content_id),
        selected_questions: [], // Empty for read-only sessions
        estimated_total_time_minutes: targetDurationMinutes,
        difficulty_distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        } as Record<DifficultyLevel, number>
      };

      const session = await sharedContentAPI.createLearningSession(
        userId,
        sessionPlan,
        sessionType as SessionType
      );

      setSummaries(loadedSummaries);
      setSessionId(session.id);
      setSessionStarted(true);
    } catch (err) {
      console.error('Failed to initialize Read Summaries session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  }, [userId, contentIds, targetDurationMinutes, sessionType]);

  const handleSessionComplete = useCallback(async (results: {
    totalSummaries: number;
    summariesRead: number;
    summaryType: SummaryType;
    totalTimeSeconds: number;
    averageReadTimePerSummary: number;
    completionRate: number;
  }) => {
    try {
      if (sessionId) {
        // Update session with completion data
        console.log('Session completed:', { sessionId, ...results });
        
        // TODO: Update session record with actual results
        // await sharedContentAPI.updateLearningSessionResults(sessionId, {
        //   summaries_read: results.summariesRead,
        //   actual_duration_minutes: Math.round(results.totalTimeSeconds / 60),
        //   session_completion_rate: results.completionRate,
        //   completed_at: new Date().toISOString()
        // });
      }

      // Add session metadata to results
      const enhancedResults: ReadSummariesResults = {
        ...results,
        sessionId: sessionId || '',
        contentIds
      };

      onSessionComplete(enhancedResults);
    } catch (error) {
      console.error('Failed to complete session:', error);
      // Continue with completion even if save fails
      onSessionComplete({
        ...results,
        sessionId: sessionId || '',
        contentIds
      });
    }
  }, [sessionId, contentIds, onSessionComplete]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-slate-50 rounded-3xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Session Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={initializeSession}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onExit}
              className="w-full py-3 px-6 bg-slate-200 text-slate-600 rounded-2xl font-medium hover:bg-slate-300 transition-colors"
            >
              Return to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !sessionStarted || !sessionId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <MemoryWavesLoader 
            size={64} 
            text="Preparing your summaries..."
            className="mb-8"
          />
          <div className="text-slate-600 space-y-2">
            <p>Loading {contentIds.length} summary{contentIds.length !== 1 ? 'ies' : ''}</p>
            <p className="text-sm">Creating your reading experience...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main session
  return (
    <ReadSummariesSession
      userId={userId}
      sessionId={sessionId}
      summaries={summaries}
      onSessionComplete={handleSessionComplete}
      onContinueToTest={onContinueToTest}
      onExit={onExit}
      sessionType={sessionType}
      targetDurationMinutes={targetDurationMinutes}
    />
  );
}

export type { ReadSummariesResults, SummaryContent }; 