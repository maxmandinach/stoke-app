'use client';

import React from 'react';
import MemoryWaves from './MemoryWaves';
import CircularProgress from './CircularProgress';

interface SessionResults {
  totalQuestions: number;
  questionsAnswered: number;
  gotItCount: number;
  revisitCount: number;
  totalTimeSeconds: number;
  averageResponseTime: number;
  sessionId?: string;
  contentIds?: string[];
  targetDurationMinutes?: number;
  completionRate?: number;
  accuracyRate?: number;
}

interface TestKnowledgeSessionCompleteProps {
  results: SessionResults;
  onReturnToLibrary: () => void;
  onStartNewSession: () => void;
}

export default function TestKnowledgeSessionComplete({
  results,
  onReturnToLibrary,
  onStartNewSession
}: TestKnowledgeSessionCompleteProps) {
  const { 
    totalQuestions, 
    questionsAnswered, 
    gotItCount, 
    revisitCount, 
    totalTimeSeconds,
    completionRate = questionsAnswered / totalQuestions,
    accuracyRate = gotItCount / Math.max(questionsAnswered, 1)
  } = results;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getEncouragingMessage = () => {
    if (accuracyRate >= 0.8) {
      return {
        title: "Excellent Knowledge!",
        message: "You're demonstrating strong mastery of this content. Keep up the great work!",
        icon: "🌟",
        color: "emerald"
      };
    } else if (accuracyRate >= 0.6) {
      return {
        title: "Great Progress!",
        message: "You're building solid understanding. Regular review will help strengthen your knowledge.",
        icon: "📈",
        color: "blue"
      };
    } else {
      return {
        title: "Building Foundations!",
        message: "Every step forward counts. Revisiting this content will help deepen your understanding.",
        icon: "🎯",
        color: "amber"
      };
    }
  };

  const encouragement = getEncouragingMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Completion Animation */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <MemoryWaves 
              size={96} 
              variant="ripple" 
              animate={true}
              color="#10b981"
              speed="slow"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Session Complete!
          </h1>
          <p className="text-slate-600">
            Your learning progress has been saved and your review schedule updated
          </p>
        </div>

        {/* Results Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200/50 mb-8">
          {/* Encouraging Message */}
          <div className={`
            rounded-2xl p-6 mb-6 text-center
            ${encouragement.color === 'emerald' ? 'bg-emerald-50 border border-emerald-200' :
              encouragement.color === 'blue' ? 'bg-blue-50 border border-blue-200' :
              'bg-amber-50 border border-amber-200'
            }
          `}>
            <div className="text-4xl mb-2">{encouragement.icon}</div>
            <h2 className={`
              text-xl font-semibold mb-2
              ${encouragement.color === 'emerald' ? 'text-emerald-700' :
                encouragement.color === 'blue' ? 'text-blue-700' :
                'text-amber-700'
              }
            `}>
              {encouragement.title}
            </h2>
            <p className={`
              text-sm
              ${encouragement.color === 'emerald' ? 'text-emerald-600' :
                encouragement.color === 'blue' ? 'text-blue-600' :
                'text-amber-600'
              }
            `}>
              {encouragement.message}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Questions Completed */}
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">{questionsAnswered}</div>
              <div className="text-sm text-slate-600">Questions</div>
              <div className="text-xs text-slate-500">of {totalQuestions}</div>
            </div>

            {/* Got It Rate */}
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-700">{gotItCount}</div>
              <div className="text-sm text-emerald-600">Got it</div>
              <div className="text-xs text-emerald-500">{Math.round(accuracyRate * 100)}%</div>
            </div>

            {/* Revisit Count */}
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <div className="text-2xl font-bold text-amber-700">{revisitCount}</div>
              <div className="text-sm text-amber-600">Revisit</div>
              <div className="text-xs text-amber-500">for review</div>
            </div>

            {/* Time Spent */}
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">{formatTime(totalTimeSeconds)}</div>
              <div className="text-sm text-blue-600">Total time</div>
              <div className="text-xs text-blue-500">focused learning</div>
            </div>
          </div>

          {/* Completion Progress */}
          <div className="flex items-center justify-center mb-6">
            <CircularProgress 
              progress={completionRate * 100} 
              size="lg" 
              showPercentage={true}
            />
          </div>

          {/* Next Steps */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">What's Next?</h3>
            <p className="text-sm text-slate-600">
              Questions marked "Revisit" will appear sooner in your review schedule.
              "Got it" responses extend the time until next review using spaced repetition.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={onStartNewSession}
            className="flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <MemoryWaves size={20} variant="static" color="currentColor" />
            <span>Start New Session</span>
          </button>

          <button
            onClick={onReturnToLibrary}
            className="flex items-center justify-center gap-3 py-4 px-6 bg-white text-slate-700 font-semibold rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Return to Library</span>
          </button>
        </div>

        {/* Subtle learning tip */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            💡 Tip: Regular short sessions are more effective than long cramming sessions
          </p>
        </div>
      </div>
    </div>
  );
} 