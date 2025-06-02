'use client';

import React, { useState, useEffect } from 'react';
import { MemoryWavesProgress } from './MemoryWaves';
import CircularProgress from './CircularProgress';
import StokeLogo from './StokeLogo';
import type { SessionType } from '@/types/database.types';

interface SessionCompletionResults {
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

interface NextSessionGuidance {
  recommendedType: SessionType;
  suggestedDuration: number;
  reasoningText: string;
  nextReviewDue?: string;
  questionsReadyForReview: number;
}

interface SessionCompletionFlowProps {
  results: SessionCompletionResults;
  nextSessionGuidance: NextSessionGuidance;
  onReturnToLibrary: () => void;
  onStartNewSession?: (sessionType: SessionType) => void;
  userId: string;
}

export default function SessionCompletionFlow({
  results,
  nextSessionGuidance,
  onReturnToLibrary,
  onStartNewSession,
  userId: _userId
}: SessionCompletionFlowProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'insights' | 'guidance'>('overview');
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    // Hide celebration animation after 2 seconds
    const timer = setTimeout(() => setShowCelebration(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getEncouragementMessage = () => {
    const accuracy = results.overallAccuracy || 0;
    const completion = results.completionRate;
    
    if (completion >= 0.9 && accuracy >= 0.8) {
      return {
        title: "Excellent Understanding!",
        message: "You're showing strong mastery of this content. Your knowledge foundation is solid.",
        icon: "🌟",
        color: "emerald"
      };
    } else if (completion >= 0.7 && accuracy >= 0.6) {
      return {
        title: "Great Progress!",
        message: "You're building solid understanding. Each session strengthens your knowledge.",
        icon: "📈",
        color: "blue"
      };
    } else if (completion >= 0.5) {
      return {
        title: "Building Foundations!",
        message: "Every step forward counts. Regular review will help deepen your understanding.",
        icon: "🎯",
        color: "amber"
      };
    } else {
      return {
        title: "Learning Journey Started!",
        message: "You've taken the first step. Knowledge builds with consistent practice.",
        icon: "🌱",
        color: "green"
      };
    }
  };

  const encouragement = getEncouragementMessage();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Completion Celebration */}
      <div className="text-center">
        <div className={`inline-block mb-4 ${showCelebration ? 'completion-celebration' : ''}`}>
          <MemoryWavesProgress 
            progress={1} 
            size={96} 
            className="text-emerald-500"
          />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Session Complete!
        </h1>
        <p className="text-slate-600">
          Your learning progress has been saved and your review schedule updated
        </p>
      </div>

      {/* Performance Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Performance Overview</h2>
          <div className="text-sm text-slate-500">
            {formatTime(results.totalDurationSeconds)} total
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Completion Rate */}
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <CircularProgress 
              progress={results.completionRate * 100} 
              size="sm" 
              showPercentage={true}
              className="mx-auto mb-2"
            />
            <div className="text-sm text-slate-600">Completion</div>
          </div>

          {/* Content Coverage */}
          {results.readSummariesResults && (
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">
                {results.readSummariesResults.summariesRead}
              </div>
              <div className="text-sm text-blue-600">Summaries</div>
              <div className="text-xs text-blue-500">reviewed</div>
            </div>
          )}

          {/* Questions Answered */}
          {results.testKnowledgeResults && (
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-700">
                {results.testKnowledgeResults.questionsAnswered}
              </div>
              <div className="text-sm text-purple-600">Questions</div>
              <div className="text-xs text-purple-500">answered</div>
            </div>
          )}

          {/* Understanding Rate */}
          {results.overallAccuracy && (
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-700">
                {Math.round(results.overallAccuracy * 100)}%
              </div>
              <div className="text-sm text-emerald-600">Got it</div>
              <div className="text-xs text-emerald-500">rate</div>
            </div>
          )}
        </div>

        {/* Encouragement Message */}
        <div className={`p-4 rounded-xl bg-${encouragement.color}-50 border border-${encouragement.color}-200`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{encouragement.icon}</div>
            <div>
              <h3 className={`font-semibold text-${encouragement.color}-800 mb-1`}>
                {encouragement.title}
              </h3>
              <p className={`text-sm text-${encouragement.color}-700`}>
                {encouragement.message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Coverage Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Content Reviewed</h2>
        
        <div className="space-y-3">
          {results.contentTitles?.map((title, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-slate-800 text-sm">{title}</h3>
                {results.topicsReviewed && results.topicsReviewed[index] && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {results.topicsReviewed[index].split(',').map((topic, topicIndex) => (
                      <span 
                        key={topicIndex}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                      >
                        {topic.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-emerald-600 font-medium ml-2">
                ✓ Reviewed
              </div>
            </div>
          )) || (
            <div className="text-center text-slate-500 py-4">
              <p>Content coverage details will be available in your next session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Learning Insights</h1>
        <p className="text-slate-600">Understanding your learning patterns</p>
      </div>

      {/* Learning Pattern Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Session Analysis</h2>
        
        <div className="space-y-4">
          {/* Reading Pace Analysis */}
          {results.readSummariesResults && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-medium text-blue-800 mb-2">Reading Pace</h3>
              <p className="text-sm text-blue-700">
                You spent an average of {results.readSummariesResults.averageReadTimePerSummary} seconds 
                per summary, which suggests a {
                  results.readSummariesResults.averageReadTimePerSummary > 45 ? 'thoughtful' : 
                  results.readSummariesResults.averageReadTimePerSummary > 30 ? 'balanced' : 'quick'
                } reading approach.
              </p>
            </div>
          )}

          {/* Response Pattern Analysis */}
          {results.testKnowledgeResults && (
            <div className="p-4 bg-purple-50 rounded-xl">
              <h3 className="font-medium text-purple-800 mb-2">Response Patterns</h3>
              <p className="text-sm text-purple-700">
                Your average response time was {results.testKnowledgeResults.averageResponseTime} seconds. 
                {results.testKnowledgeResults.averageResponseTime > 8 ? 
                  ' You took time to think through your answers, which is excellent for retention.' :
                  ' Quick, confident responses indicate good familiarity with the material.'
                }
              </p>
            </div>
          )}

          {/* Learning Preference Insights */}
          <div className="p-4 bg-amber-50 rounded-xl">
            <h3 className="font-medium text-amber-800 mb-2">Learning Preference</h3>
            <p className="text-sm text-amber-700">
              Based on this session, you seem to prefer{' '}
              {results.sessionType === 'read_summaries' ? 'absorbing information first before testing' :
               results.sessionType === 'test_knowledge' ? 'challenging yourself directly with questions' :
               'a comprehensive approach that builds then tests knowledge'}.
            </p>
          </div>
        </div>
      </div>

      {/* Memory Formation Tips */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Memory Formation Tips</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <div className="text-lg">🧠</div>
            <div>
              <h4 className="font-medium text-green-800 text-sm">Spaced Repetition Active</h4>
              <p className="text-xs text-green-700">
                Questions you marked as "revisit" will appear again at optimal intervals for memory consolidation.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-lg">⏰</div>
            <div>
              <h4 className="font-medium text-blue-800 text-sm">Optimal Review Timing</h4>
              <p className="text-xs text-blue-700">
                Your next review session is scheduled based on forgetting curve science for maximum retention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGuidance = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Next Session Guidance</h1>
        <p className="text-slate-600">Personalized recommendations for continued learning</p>
      </div>

      {/* Next Session Recommendation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recommended Next Session</h2>
        
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">
              {nextSessionGuidance.recommendedType === 'read_summaries' ? 'Read Summaries' :
               nextSessionGuidance.recommendedType === 'test_knowledge' ? 'Test Knowledge' :
               'Read + Test'}
            </h3>
            <span className="text-sm font-medium text-purple-600">
              ~{nextSessionGuidance.suggestedDuration} min
            </span>
          </div>
          <p className="text-sm text-slate-700 mb-3">
            {nextSessionGuidance.reasoningText}
          </p>
          
          {nextSessionGuidance.questionsReadyForReview > 0 && (
            <div className="text-sm font-medium text-emerald-700">
              {nextSessionGuidance.questionsReadyForReview} questions ready for review
            </div>
          )}
        </div>

        {nextSessionGuidance.nextReviewDue && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-amber-600">⏰</div>
              <div>
                <h4 className="font-medium text-amber-800 text-sm">Next Review Due</h4>
                <p className="text-xs text-amber-700">
                  {nextSessionGuidance.nextReviewDue}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Streak Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Learning Journey</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-lg">🔥</div>
              <div>
                <h4 className="font-medium text-slate-800 text-sm">Consistency</h4>
                <p className="text-xs text-slate-600">Regular practice strengthens memory</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-800">Keep going!</div>
              <div className="text-xs text-slate-500">Sessions this week</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-lg">📚</div>
              <div>
                <h4 className="font-medium text-slate-800 text-sm">Content Mastery</h4>
                <p className="text-xs text-slate-600">Building deep understanding</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-800">Growing</div>
              <div className="text-xs text-slate-500">Knowledge base</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <StokeLogo className="w-8 h-8 text-slate-800" />
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                {(['overview', 'insights', 'guidance'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                      currentView === view
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {currentView === 'overview' && renderOverview()}
          {currentView === 'insights' && renderInsights()}
          {currentView === 'guidance' && renderGuidance()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 p-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {onStartNewSession && currentView === 'guidance' && (
            <button
              onClick={() => onStartNewSession(nextSessionGuidance.recommendedType)}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
            >
              Start Recommended Session
            </button>
          )}
          
          <button
            onClick={onReturnToLibrary}
            className="w-full py-3 px-6 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Return to Library
          </button>
        </div>
      </div>
    </div>
  );
} 