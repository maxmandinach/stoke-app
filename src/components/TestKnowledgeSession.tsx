'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MemoryWaves, { MemoryWavesProgress } from './MemoryWaves';
import { sharedContentAPI, QuestionResponse } from '@/lib/database/sharedContent';
import type { Question, FeedbackType } from '@/types/database.types';

interface SessionQuestion {
  content_id: string;
  question_id: string;
  question: Question;
  estimated_time_seconds: number;
  content_title?: string;
}

interface TestKnowledgeSessionProps {
  userId: string;
  sessionId: string;
  questions: SessionQuestion[];
  onSessionComplete: (results: SessionResults) => void;
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

export default function TestKnowledgeSession({
  userId,
  sessionId,
  questions,
  onSessionComplete,
  onExit
}: TestKnowledgeSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const startTime = useRef<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastResponse, setLastResponse] = useState<FeedbackType | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = currentQuestionIndex / questions.length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  // Handle question response with animations
  const handleResponse = useCallback(async (feedback: FeedbackType) => {
    if (isAnimating) return;

    const responseTime = Math.round((Date.now() - questionStartTime) / 1000);
    
    const response: QuestionResponse = {
      content_id: currentQuestion.content_id,
      question_id: currentQuestion.question_id,
      feedback,
      response_time_seconds: responseTime
    };

    setResponses(prev => [...prev, response]);
    setLastResponse(feedback);
    setIsAnimating(true);
    setShowFeedback(true);

    // Show feedback animation briefly
    setTimeout(() => {
      setShowFeedback(false);
      
      if (isLastQuestion) {
        // Complete session
        completeSession([...responses, response]);
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnimating(false);
      }
    }, 800);
  }, [currentQuestion, responses, isLastQuestion, questionStartTime, isAnimating]);

  // Complete the session and save progress
  const completeSession = useCallback(async (finalResponses: QuestionResponse[]) => {
    try {
      // Update user progress with spaced repetition
      await sharedContentAPI.updateUserProgress(userId, sessionId, finalResponses);

      // Calculate session results
      const totalTimeSeconds = Math.round((Date.now() - startTime.current) / 1000);
      const gotItCount = finalResponses.filter(r => r.feedback === 'got_it').length;
      const revisitCount = finalResponses.filter(r => r.feedback === 'revisit').length;
      const averageResponseTime = finalResponses.reduce((sum, r) => sum + r.response_time_seconds, 0) / finalResponses.length;

      const results: SessionResults = {
        totalQuestions: questions.length,
        questionsAnswered: finalResponses.length,
        gotItCount,
        revisitCount,
        totalTimeSeconds,
        averageResponseTime
      };

      onSessionComplete(results);
    } catch (error) {
      console.error('Failed to complete session:', error);
      // Still call completion to avoid blocking user
      onSessionComplete({
        totalQuestions: questions.length,
        questionsAnswered: finalResponses.length,
        gotItCount: finalResponses.filter(r => r.feedback === 'got_it').length,
        revisitCount: finalResponses.filter(r => r.feedback === 'revisit').length,
        totalTimeSeconds: Math.round((Date.now() - startTime.current) / 1000),
        averageResponseTime: finalResponses.reduce((sum, r) => sum + r.response_time_seconds, 0) / finalResponses.length
      });
    }
  }, [userId, sessionId, questions.length, onSessionComplete]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
      {/* Header with progress */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Exit button */}
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium">Exit</span>
          </button>

          {/* Progress indicator with Memory Waves */}
          <div className="flex items-center gap-4">
            <MemoryWavesProgress 
              progress={progress} 
              size={32} 
              className="text-blue-600"
            />
            <div className="text-sm font-medium text-slate-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Spacer for balance */}
          <div className="w-16" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {/* Question card */}
          <div className={`
            bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200/50
            transition-all duration-500 transform
            ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
          `}>
            {/* Question content */}
            <div className="text-center mb-8">
              <div className="text-lg leading-relaxed text-slate-800 font-medium">
                {currentQuestion.question.content}
              </div>
              
              {/* Question metadata */}
              {currentQuestion.content_title && (
                <div className="mt-4 text-sm text-slate-500">
                  from "{currentQuestion.content_title}"
                </div>
              )}
            </div>

            {/* Response buttons */}
            <div className="grid grid-cols-2 gap-6">
              {/* Revisit button */}
              <button
                onClick={() => handleResponse('revisit')}
                disabled={isAnimating}
                className={`
                  group relative h-16 rounded-2xl font-semibold text-lg transition-all duration-300
                  bg-gradient-to-r from-amber-400 to-orange-400 text-white
                  hover:from-amber-500 hover:to-orange-500 hover:shadow-lg hover:scale-[1.02]
                  active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                  touch-target-44 flex items-center justify-center gap-3
                `}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <div className="flex items-center gap-3">
                  <MemoryWaves size={20} variant="static" color="currentColor" />
                  <span>Revisit</span>
                </div>
                
                {/* Ripple effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              {/* Got it button */}
              <button
                onClick={() => handleResponse('got_it')}
                disabled={isAnimating}
                className={`
                  group relative h-16 rounded-2xl font-semibold text-lg transition-all duration-300
                  bg-gradient-to-r from-emerald-400 to-green-400 text-white
                  hover:from-emerald-500 hover:to-green-500 hover:shadow-lg hover:scale-[1.02]
                  active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                  touch-target-44 flex items-center justify-center gap-3
                `}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <div className="flex items-center gap-3">
                  <MemoryWaves size={20} variant="progressive" progress={1} color="currentColor" />
                  <span>Got it</span>
                </div>
                
                {/* Ripple effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>

          {/* Supportive messaging */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600">
              Choose honestly - this helps optimize your learning schedule
            </p>
          </div>
        </div>
      </div>

      {/* Feedback overlay */}
      {showFeedback && lastResponse && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className={`
            bg-white rounded-3xl p-8 shadow-2xl border-2 transform transition-all duration-500
            ${lastResponse === 'got_it' 
              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50' 
              : 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50'
            }
            animate-scale-in
          `}>
            <div className="text-center">
              <MemoryWaves 
                size={48} 
                variant="ripple" 
                animate={true}
                color={lastResponse === 'got_it' ? '#10b981' : '#f59e0b'}
                speed="fast"
              />
              <div className={`
                mt-4 text-lg font-semibold
                ${lastResponse === 'got_it' ? 'text-emerald-700' : 'text-amber-700'}
              `}>
                {lastResponse === 'got_it' ? 'Great!' : 'Noted'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 