'use client';

import React, { useState } from 'react';
import UnifiedSessionManager from '@/components/UnifiedSessionManager';
import { MemoryWavesProgress } from '@/components/MemoryWaves';
import StokeLogo from '@/components/StokeLogo';
import type { SessionType, DifficultyLevel } from '@/types/database.types';

// Mock data for demonstration
const MOCK_CONTENT_DATA = [
  {
    id: 'content-1',
    title: 'The Science of Learning and Memory',
    quick_summary: `• Spaced repetition leverages the spacing effect to enhance long-term retention of information\n• Active recall, the practice of retrieving information from memory, strengthens neural pathways more effectively than passive review\n• The testing effect demonstrates that taking practice tests improves learning outcomes more than repeated studying\n• Memory consolidation occurs during sleep, making adequate rest crucial for knowledge retention`,
    full_summary: `Recent neuroscience research has revealed fundamental insights about how our brains acquire, process, and retain information. The spacing effect, first documented by Hermann Ebbinghaus in the 1880s, shows that information is better remembered when learning sessions are distributed over time rather than massed together. This principle forms the foundation of spaced repetition systems, which schedule review sessions at increasing intervals to optimize retention.\n\nActive recall represents another crucial mechanism for effective learning. When we attempt to retrieve information from memory rather than simply re-reading material, we strengthen the neural pathways associated with that knowledge. This process of effortful retrieval creates more durable memories and improves our ability to access information when needed. Combined with the testing effect—the finding that practice testing enhances learning more than repeated study—these principles suggest that the most effective learning strategies involve challenging our memory rather than passively consuming information.`,
    duration_hours: 1.5,
    topics: [
      { name: 'Neuroscience', color: '#7C3AED' },
      { name: 'Learning', color: '#2563EB' }
    ]
  },
  {
    id: 'content-2', 
    title: 'Building Sustainable Habits',
    quick_summary: `• Habit formation relies on the neurological loop of cue, routine, and reward that becomes automatic over time\n• Environmental design significantly influences behavior by making desired actions easier and undesired actions harder\n• Implementation intentions, or "if-then" planning, increase the likelihood of following through on new habits\n• Identity-based habits that align with who you want to become are more sustainable than outcome-based goals`,
    full_summary: `Understanding the science of habit formation reveals why some behavioral changes stick while others fade away. At its core, a habit is a neurological loop consisting of a cue that triggers a routine, which is followed by a reward. Over time, this loop becomes so automatic that it requires minimal conscious effort or decision-making. The key to building lasting habits lies in identifying the right cues and rewards that will reinforce the desired routine.\n\nEnvironmental design plays a crucial role in habit formation by reducing the friction associated with good behaviors and increasing friction for bad ones. This might involve placing healthy snacks at eye level while hiding junk food, or laying out workout clothes the night before. When combined with implementation intentions—specific if-then plans that predetermine how you'll respond to certain situations—environmental design creates a system that supports your desired behaviors even when motivation wanes.`,
    duration_hours: 2.0,
    topics: [
      { name: 'Psychology', color: '#059669' },
      { name: 'Productivity', color: '#D97706' }
    ]
  }
];

interface SessionResults {
  sessionType: SessionType;
  totalDurationSeconds: number;
  readSummariesResults?: any;
  testKnowledgeResults?: any;
  completionRate: number;
  overallAccuracy?: number;
}

export default function ReadSummariesDemoPage() {
  const [currentView, setCurrentView] = useState<'setup' | 'session' | 'results'>('setup');
  const [sessionConfig, setSessionConfig] = useState<{
    sessionType: SessionType;
    targetDuration: number;
    difficulty?: DifficultyLevel;
  }>({
    sessionType: 'read_summaries',
    targetDuration: 10
  });
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);

  const handleStartSession = () => {
    setCurrentView('session');
  };

  const handleSessionComplete = (results: SessionResults) => {
    setSessionResults(results);
    setCurrentView('results');
  };

  const handleReturnToSetup = () => {
    setCurrentView('setup');
    setSessionResults(null);
  };

  // Setup view
  if (currentView === 'setup') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <StokeLogo className="w-8 h-8 text-slate-800" />
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Read Summaries Demo</h1>
              <p className="text-sm text-slate-600">Experience Stoke's premium reading interface</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 max-w-2xl">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Session Configuration</h2>
            
            {/* Session Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Session Type
              </label>
              <div className="space-y-2">
                {[
                  { value: 'read_summaries', label: 'Read Summaries Only', desc: 'Focus on reading and comprehension' },
                  { value: 'test_knowledge', label: 'Test Knowledge Only', desc: 'Practice with questions and feedback' },
                  { value: 'both', label: 'Read + Test (Comprehensive)', desc: 'Combined reading and testing experience' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 p-4 border border-slate-200 rounded-xl hover:border-blue-200 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="sessionType"
                      value={option.value}
                      checked={sessionConfig.sessionType === option.value}
                      onChange={(e) => setSessionConfig(prev => ({ 
                        ...prev, 
                        sessionType: e.target.value as SessionType 
                      }))}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-slate-800">{option.label}</div>
                      <div className="text-sm text-slate-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Target Duration
              </label>
              <select
                value={sessionConfig.targetDuration}
                onChange={(e) => setSessionConfig(prev => ({ 
                  ...prev, 
                  targetDuration: parseInt(e.target.value) 
                }))}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value={5}>5 minutes (Quick review)</option>
                <option value={10}>10 minutes (Standard)</option>
                <option value={15}>15 minutes (Thorough)</option>
                <option value={20}>20 minutes (Comprehensive)</option>
              </select>
            </div>

            {/* Difficulty Selection for Test Sessions */}
            {(sessionConfig.sessionType === 'test_knowledge' || sessionConfig.sessionType === 'both') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Difficulty Preference
                </label>
                <select
                  value={sessionConfig.difficulty || 3}
                  onChange={(e) => setSessionConfig(prev => ({ 
                    ...prev, 
                    difficulty: parseInt(e.target.value) as DifficultyLevel 
                  }))}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value={1}>1 - Very Easy</option>
                  <option value={2}>2 - Easy</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Hard</option>
                  <option value={5}>5 - Very Hard</option>
                </select>
              </div>
            )}
          </div>

          {/* Sample Content Preview */}
          <div className="mb-8">
            <h3 className="text-md font-semibold text-slate-800 mb-4">Sample Content</h3>
            <div className="space-y-3">
              {MOCK_CONTENT_DATA.map((content) => (
                <div key={content.id} className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-medium text-slate-800 mb-2">{content.title}</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    {content.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ backgroundColor: `${topic.color}15`, color: topic.color }}
                      >
                        {topic.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">{content.duration_hours} hours of content</p>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartSession}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-colors"
          >
            Start {sessionConfig.sessionType === 'both' ? 'Comprehensive' : 
                  sessionConfig.sessionType === 'read_summaries' ? 'Reading' : 'Testing'} Session
          </button>
        </div>
      </div>
    );
  }

  // Session view
  if (currentView === 'session') {
    return (
      <UnifiedSessionManager
        userId="demo-user"
        contentIds={MOCK_CONTENT_DATA.map(c => c.id)}
        sessionType={sessionConfig.sessionType}
        targetDurationMinutes={sessionConfig.targetDuration}
        difficultyPreference={sessionConfig.difficulty}
        onSessionComplete={handleSessionComplete}
        onExit={handleReturnToSetup}
      />
    );
  }

  // Results view
  if (currentView === 'results' && sessionResults) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <StokeLogo className="w-8 h-8 text-slate-800" />
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Session Complete</h1>
              <p className="text-sm text-slate-600">Great work on your learning session!</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="px-6 py-8 max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <MemoryWavesProgress progress={1} size={48} />
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Session Results</h2>
                <p className="text-slate-600">
                  {Math.round(sessionResults.totalDurationSeconds / 60)} minutes • {Math.round(sessionResults.completionRate * 100)}% complete
                </p>
              </div>
            </div>

            {/* Reading Results */}
            {sessionResults.readSummariesResults && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">Reading Phase</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-blue-600 font-medium">Summaries Read</div>
                    <div className="text-blue-800">
                      {sessionResults.readSummariesResults.summariesRead} of {sessionResults.readSummariesResults.totalSummaries}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-600 font-medium">Reading Style</div>
                    <div className="text-blue-800 capitalize">
                      {sessionResults.readSummariesResults.summaryType} review
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Testing Results */}
            {sessionResults.testKnowledgeResults && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-2">Testing Phase</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-green-600 font-medium">Questions Answered</div>
                    <div className="text-green-800">
                      {sessionResults.testKnowledgeResults.questionsAnswered} of {sessionResults.testKnowledgeResults.totalQuestions}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-600 font-medium">Accuracy</div>
                    <div className="text-green-800">
                      {Math.round((sessionResults.overallAccuracy || 0) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleReturnToSetup}
            className="w-full py-3 px-6 bg-slate-600 text-white rounded-2xl font-medium hover:bg-slate-700 transition-colors"
          >
            Start Another Session
          </button>
        </div>
      </div>
    );
  }

  return null;
} 