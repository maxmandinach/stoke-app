'use client';

import React, { useState, useEffect } from 'react';
import { MemoryWavesProgress } from './MemoryWaves';
import CircularProgress from './CircularProgress';
import StokeLogo from './StokeLogo';
import type { SessionType, ContentSource } from '@/types/database.types';

interface TopicProgress {
  topicId: string;
  topicName: string;
  contentCount: number;
  totalQuestions: number;
  questionsMastered: number;
  questionsReviewed: number;
  averageAccuracy: number;
  averageMastery: number;
  timeSpentMinutes: number;
  lastReviewedAt: string | null;
  strengthLevel: 'building' | 'developing' | 'strong' | 'mastery';
  retentionTrend: 'improving' | 'stable' | 'declining';
}

interface SessionAnalytics {
  sessionType: SessionType;
  totalSessions: number;
  avgDurationMinutes: number;
  avgCompletionRate: number;
  avgAccuracy: number;
  preferredTimeOfDay: string;
  consistencyScore: number; // 0-1
}

interface ContentPreferences {
  preferredSources: { source: ContentSource; percentage: number; count: number }[];
  preferredSessionLength: string;
  contentSelectionPatterns: {
    topicDiversity: number; // 0-1
    difficultyPreference: string;
    reviewFrequency: string;
  };
  learningStyle: {
    type: 'visual' | 'analytical' | 'balanced';
    confidence: number;
    description: string;
  };
}

interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  lastActiveDate: string;
  motivation: string;
}

interface ProgressAnalyticsProps {
  userId: string;
  topicProgress: TopicProgress[];
  sessionAnalytics: SessionAnalytics[];
  contentPreferences: ContentPreferences;
  learningStreak: LearningStreak;
  onTopicSelect?: (topicId: string) => void;
  onViewChange?: (view: string) => void;
}

export default function ProgressAnalytics({
  userId,
  topicProgress,
  sessionAnalytics,
  contentPreferences,
  learningStreak,
  onTopicSelect,
  onViewChange
}: ProgressAnalyticsProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'topics' | 'patterns' | 'insights'>('overview');
  const [selectedTopic, setSelectedTopic] = useState<TopicProgress | null>(null);

  const handleViewChange = (view: typeof currentView) => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  // Calculate overall metrics
  const overallMetrics = {
    totalTopics: topicProgress.length,
    masteryPercentage: topicProgress.reduce((sum, topic) => sum + topic.averageMastery, 0) / Math.max(topicProgress.length, 1),
    totalQuestionsAnswered: topicProgress.reduce((sum, topic) => sum + topic.questionsReviewed, 0),
    averageAccuracy: topicProgress.reduce((sum, topic) => sum + topic.averageAccuracy, 0) / Math.max(topicProgress.length, 1),
    totalTimeSpent: topicProgress.reduce((sum, topic) => sum + topic.timeSpentMinutes, 0)
  };

  const formatTimeSpent = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStrengthColor = (level: TopicProgress['strengthLevel']) => {
    switch (level) {
      case 'mastery': return 'emerald';
      case 'strong': return 'blue';
      case 'developing': return 'amber';
      case 'building': return 'slate';
    }
  };

  const getTrendIcon = (trend: TopicProgress['retentionTrend']) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Learning Streak Card */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Learning Streak</h2>
          <div className="text-2xl">{learningStreak.currentStreak > 7 ? '🔥' : '⭐'}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-700">{learningStreak.currentStreak}</div>
            <div className="text-sm text-purple-600">Current Streak</div>
            <div className="text-xs text-purple-500">days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-700">{learningStreak.longestStreak}</div>
            <div className="text-sm text-blue-600">Personal Best</div>
            <div className="text-xs text-blue-500">days</div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">This Week</span>
            <span className="text-slate-800 font-medium">
              {learningStreak.weeklyProgress}/{learningStreak.weeklyGoal} sessions
            </span>
          </div>
          <div className="bg-white rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-500"
              style={{ width: `${Math.min((learningStreak.weeklyProgress / learningStreak.weeklyGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2">{learningStreak.motivation}</p>
        </div>
      </div>

      {/* Overall Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <CircularProgress 
            progress={overallMetrics.masteryPercentage} 
            size="sm" 
            showPercentage={true}
            className="mx-auto mb-2"
          />
          <div className="text-sm text-slate-600">Overall Mastery</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {overallMetrics.totalTopics}
          </div>
          <div className="text-sm text-slate-600">Topics</div>
          <div className="text-xs text-slate-500">learning</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700 mb-1">
            {Math.round(overallMetrics.averageAccuracy * 100)}%
          </div>
          <div className="text-sm text-slate-600">Accuracy</div>
          <div className="text-xs text-slate-500">average</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-700 mb-1">
            {formatTimeSpent(overallMetrics.totalTimeSpent)}
          </div>
          <div className="text-sm text-slate-600">Time Spent</div>
          <div className="text-xs text-slate-500">learning</div>
        </div>
      </div>

      {/* Session Performance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Session Performance</h2>
        
        <div className="space-y-4">
          {sessionAnalytics.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="text-lg">
                  {session.sessionType === 'read_summaries' ? '📖' : 
                   session.sessionType === 'test_knowledge' ? '🧠' : '🎯'}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 text-sm">
                    {session.sessionType === 'read_summaries' ? 'Read Summaries' :
                     session.sessionType === 'test_knowledge' ? 'Test Knowledge' : 'Combined Sessions'}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {session.totalSessions} sessions • Avg {session.avgDurationMinutes}min
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800">
                  {Math.round(session.avgCompletionRate * 100)}%
                </div>
                <div className="text-xs text-slate-500">completion</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Topic Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Topic Strengths</h2>
          <button 
            onClick={() => handleViewChange('topics')}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View All →
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topicProgress.slice(0, 4).map((topic) => (
            <div 
              key={topic.topicId}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => onTopicSelect?.(topic.topicId)}
            >
              <div className="flex-1">
                <h3 className="font-medium text-slate-800 text-sm">{topic.topicName}</h3>
                <p className="text-xs text-slate-600">
                  {topic.questionsMastered}/{topic.totalQuestions} mastered
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm">{getTrendIcon(topic.retentionTrend)}</div>
                <div className={`w-2 h-2 rounded-full bg-${getStrengthColor(topic.strengthLevel)}-400`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTopicAnalysis = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Topic Mastery</h1>
        <p className="text-slate-600">Deep dive into your knowledge areas</p>
      </div>

      {/* Topic Mastery Overview */}
      <div className="grid grid-cols-1 gap-4">
        {topicProgress.map((topic) => (
          <div 
            key={topic.topicId}
            className={`bg-white rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer hover:shadow-md ${
              selectedTopic?.topicId === topic.topicId 
                ? 'border-purple-300 shadow-lg' 
                : 'border-slate-200'
            }`}
            onClick={() => setSelectedTopic(selectedTopic?.topicId === topic.topicId ? null : topic)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full bg-${getStrengthColor(topic.strengthLevel)}-400`} />
                <h3 className="font-semibold text-slate-800">{topic.topicName}</h3>
                <div className="text-lg">{getTrendIcon(topic.retentionTrend)}</div>
              </div>
              <div className="text-sm font-medium text-slate-600">
                {Math.round(topic.averageMastery)}% mastery
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800">
                  {topic.questionsMastered}/{topic.totalQuestions}
                </div>
                <div className="text-xs text-slate-600">Questions Mastered</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-700">
                  {Math.round(topic.averageAccuracy * 100)}%
                </div>
                <div className="text-xs text-slate-600">Accuracy</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">
                  {formatTimeSpent(topic.timeSpentMinutes)}
                </div>
                <div className="text-xs text-slate-600">Time Spent</div>
              </div>
            </div>

            {/* Mastery Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Mastery Progress</span>
                <span className="text-slate-800 font-medium">{Math.round(topic.averageMastery)}%</span>
              </div>
              <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-${getStrengthColor(topic.strengthLevel)}-400 transition-all duration-500`}
                  style={{ width: `${topic.averageMastery}%` }}
                />
              </div>
            </div>

            {/* Expanded Details */}
            {selectedTopic?.topicId === topic.topicId && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 text-sm mb-1">Content Coverage</h4>
                    <p className="text-xs text-blue-700">
                      {topic.contentCount} episodes covering this topic
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 text-sm mb-1">Review Status</h4>
                    <p className="text-xs text-green-700">
                      {topic.lastReviewedAt ? 
                        `Last reviewed ${new Date(topic.lastReviewedAt).toLocaleDateString()}` :
                        'Not yet reviewed'
                      }
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-800 text-sm mb-1">Strength Level: {topic.strengthLevel}</h4>
                  <p className="text-xs text-amber-700">
                    {topic.strengthLevel === 'mastery' && 'Excellent understanding! You consistently demonstrate strong knowledge in this area.'}
                    {topic.strengthLevel === 'strong' && 'Good grasp of concepts with reliable recall and application.'}
                    {topic.strengthLevel === 'developing' && 'Building knowledge with regular progress and improvement.'}
                    {topic.strengthLevel === 'building' && 'Early stages of learning with foundational understanding developing.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Learning Patterns</h1>
        <p className="text-slate-600">Understanding your content preferences and habits</p>
      </div>

      {/* Content Source Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Content Preferences</h2>
        
        <div className="space-y-4">
          {contentPreferences.preferredSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">
                  {source.source === 'podcast' ? '🎧' :
                   source.source === 'video' ? '📹' :
                   source.source === 'article' ? '📄' :
                   source.source === 'book' ? '📚' : '📝'}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 text-sm capitalize">{source.source}</h3>
                  <p className="text-xs text-slate-600">{source.count} episodes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-24 bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-full bg-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-slate-700 w-12 text-right">
                  {Math.round(source.percentage)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Style Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Learning Style</h2>
        
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 capitalize">
              {contentPreferences.learningStyle.type} Learner
            </h3>
            <div className="text-sm font-medium text-purple-600">
              {Math.round(contentPreferences.learningStyle.confidence * 100)}% confidence
            </div>
          </div>
          <p className="text-sm text-slate-700">
            {contentPreferences.learningStyle.description}
          </p>
        </div>
      </div>

      {/* Session Patterns */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Session Patterns</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-800 text-sm mb-2">Preferred Length</h3>
            <div className="text-lg font-semibold text-purple-700">
              {contentPreferences.preferredSessionLength}
            </div>
            <p className="text-xs text-slate-600">minutes on average</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-800 text-sm mb-2">Topic Diversity</h3>
            <div className="text-lg font-semibold text-blue-700">
              {Math.round(contentPreferences.contentSelectionPatterns.topicDiversity * 100)}%
            </div>
            <p className="text-xs text-slate-600">variety in sessions</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-800 text-sm mb-2">Difficulty Preference</h3>
            <div className="text-lg font-semibold text-emerald-700 capitalize">
              {contentPreferences.contentSelectionPatterns.difficultyPreference}
            </div>
            <p className="text-xs text-slate-600">challenge level</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl">
            <h3 className="font-medium text-slate-800 text-sm mb-2">Review Frequency</h3>
            <div className="text-lg font-semibold text-amber-700 capitalize">
              {contentPreferences.contentSelectionPatterns.reviewFrequency}
            </div>
            <p className="text-xs text-slate-600">revisit pattern</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Learning Insights</h1>
        <p className="text-slate-600">Personalized observations about your learning journey</p>
      </div>

      {/* Personalized Insights */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🌟</div>
            <div>
              <h3 className="font-semibold text-emerald-800 mb-2">Strength Spotlight</h3>
              <p className="text-sm text-emerald-700">
                You show exceptional retention in {topicProgress
                  .filter(t => t.strengthLevel === 'mastery')
                  .map(t => t.topicName)
                  .join(', ') || 'developing topics'}. 
                Your consistent review pattern is paying off with strong long-term memory formation.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📈</div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Growth Opportunity</h3>
              <p className="text-sm text-blue-700">
                Consider spending more time with {contentPreferences.contentSelectionPatterns.difficultyPreference === 'easy' ? 'challenging' : 'foundational'} content
                to {contentPreferences.contentSelectionPatterns.difficultyPreference === 'easy' ? 'accelerate growth' : 'strengthen your knowledge base'}.
                Your {contentPreferences.learningStyle.type} learning style suggests you'd benefit from this approach.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Optimization Tip</h3>
              <p className="text-sm text-amber-700">
                Your session completion rate averages {Math.round(sessionAnalytics.reduce((sum, s) => sum + s.avgCompletionRate, 0) / sessionAnalytics.length * 100)}%. 
                Try {contentPreferences.preferredSessionLength === 'short' ? 'slightly longer' : 'shorter'} sessions 
                to maintain engagement while maximizing retention.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧠</div>
            <div>
              <h3 className="font-semibold text-purple-800 mb-2">Memory Science</h3>
              <p className="text-sm text-purple-700">
                Your spaced repetition data shows optimal forgetting curve patterns. 
                Questions marked as "revisit" are appearing at scientifically-proven intervals for maximum retention.
                Keep following the review schedule for best results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Personalized Recommendations</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-600">📚</div>
            <div>
              <h4 className="font-medium text-blue-800 text-sm">Content Suggestion</h4>
              <p className="text-xs text-blue-700">
                Based on your preferences, try more {contentPreferences.preferredSources[0]?.source} content 
                from topics you're building strength in.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <div className="text-green-600">⏰</div>
            <div>
              <h4 className="font-medium text-green-800 text-sm">Timing Optimization</h4>
              <p className="text-xs text-green-700">
                Your best performance appears during {sessionAnalytics[0]?.preferredTimeOfDay || 'morning'} sessions. 
                Consider scheduling reviews during this time.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="text-purple-600">🎯</div>
            <div>
              <h4 className="font-medium text-purple-800 text-sm">Challenge Level</h4>
              <p className="text-xs text-purple-700">
                You're ready to increase difficulty in topics where you've achieved {topicProgress.filter(t => t.strengthLevel === 'strong').length} strong mastery levels.
              </p>
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
            <div className="flex items-center gap-3">
              <StokeLogo className="w-8 h-8 text-slate-800" />
              <h1 className="font-semibold text-slate-800">Progress Analytics</h1>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              {(['overview', 'topics', 'patterns', 'insights'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
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

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {currentView === 'overview' && renderOverview()}
          {currentView === 'topics' && renderTopicAnalysis()}
          {currentView === 'patterns' && renderPatterns()}
          {currentView === 'insights' && renderInsights()}
        </div>
      </div>
    </div>
  );
} 