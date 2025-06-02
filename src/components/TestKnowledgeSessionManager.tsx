'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TestKnowledgeSession from './TestKnowledgeSession';
import { MemoryWavesLoader } from './MemoryWaves';
import { sharedContentAPI, SessionPlan } from '@/lib/database/sharedContent';
import type { DifficultyLevel, SessionType } from '@/types/database.types';

interface SessionQuestion {
  content_id: string;
  question_id: string;
  question: any;
  estimated_time_seconds: number;
  content_title?: string;
}

interface TestKnowledgeSessionManagerProps {
  userId: string;
  contentIds: string[];
  targetDurationMinutes: number;
  difficultyPreference?: DifficultyLevel;
  onSessionComplete: (results: any) => void;
  onExit: () => void;
}

interface SessionResults {
  totalQuestions: number;
  questionsAnswered: number;
  gotItCount: number;
  revisitCount: number;
  totalTimeSeconds: number;
  averageResponseTime: number;
}

export default function TestKnowledgeSessionManager({
  userId,
  contentIds,
  targetDurationMinutes,
  difficultyPreference,
  onSessionComplete,
  onExit
}: TestKnowledgeSessionManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Initialize session and load questions
  useEffect(() => {
    initializeSession();
  }, [userId, contentIds, targetDurationMinutes, difficultyPreference]);

  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Plan the learning session with intelligent question selection
      const sessionPlan = await sharedContentAPI.planLearningSession(
        userId,
        targetDurationMinutes,
        {
          contentIds,
          difficultyPreference
        }
      );

      if (sessionPlan.selected_questions.length === 0) {
        throw new Error('No questions available for review at this time');
      }

      // Create session record
      const session = await sharedContentAPI.createLearningSession(
        userId,
        sessionPlan,
        'test_knowledge' as SessionType
      );

      // Get content titles for context
      const contentTitles = await getContentTitles(sessionPlan.content_ids);

      // Format questions with content context
      const formattedQuestions: SessionQuestion[] = sessionPlan.selected_questions.map(q => ({
        ...q,
        content_title: contentTitles[q.content_id]
      }));

      // Shuffle questions for randomization
      const shuffledQuestions = shuffleArray(formattedQuestions);

      setSessionId(session.id);
      setQuestions(shuffledQuestions);
      setSessionStarted(true);
    } catch (err) {
      console.error('Failed to initialize session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  }, [userId, contentIds, targetDurationMinutes, difficultyPreference]);

  // Get content titles for context
  const getContentTitles = async (contentIds: string[]): Promise<Record<string, string>> => {
    try {
      const titles: Record<string, string> = {};
      
      for (const contentId of contentIds) {
        const content = await sharedContentAPI.getContentWithStatus(contentId);
        titles[contentId] = content.title;
      }
      
      return titles;
    } catch (error) {
      console.warn('Failed to load content titles:', error);
      return {};
    }
  };

  // Shuffle array using Fisher-Yates algorithm
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const handleSessionComplete = useCallback((results: SessionResults) => {
    // Add session metadata to results
    const enhancedResults = {
      ...results,
      sessionId,
      contentIds,
      targetDurationMinutes,
      completionRate: results.questionsAnswered / results.totalQuestions,
      accuracyRate: results.gotItCount / Math.max(results.questionsAnswered, 1)
    };

    onSessionComplete(enhancedResults);
  }, [sessionId, contentIds, targetDurationMinutes, onSessionComplete]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200/50 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Session Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={onExit}
            className="w-full py-3 px-6 bg-slate-600 text-white rounded-2xl font-medium hover:bg-slate-700 transition-colors"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !sessionStarted || !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-6">
        <div className="text-center">
          <MemoryWavesLoader 
            size={64} 
            text="Preparing your personalized questions..."
            className="mb-8"
          />
          <div className="text-slate-600 space-y-2">
            <p>Selecting questions based on your learning progress</p>
            <p className="text-sm">This may take a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main session
  return (
    <TestKnowledgeSession
      userId={userId}
      sessionId={sessionId}
      questions={questions}
      onSessionComplete={handleSessionComplete}
      onExit={onExit}
    />
  );
}

export type { SessionResults }; 