'use client';

import React, { useState } from 'react';
import TestKnowledgeSessionManager from '@/components/TestKnowledgeSessionManager';
import TestKnowledgeSessionComplete from '@/components/TestKnowledgeSessionComplete';
import type { SessionResults } from '@/components/TestKnowledgeSessionManager';

// Sample data for demonstration
const SAMPLE_USER_ID = 'demo-user-123';
const SAMPLE_CONTENT_IDS = ['content-1', 'content-2', 'content-3'];

type DemoState = 'config' | 'session' | 'complete';

export default function TestKnowledgeDemoPage() {
  const [demoState, setDemoState] = useState<DemoState>('config');
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);

  const handleStartSession = () => {
    setDemoState('session');
  };

  const handleSessionComplete = (results: SessionResults) => {
    setSessionResults(results);
    setDemoState('complete');
  };

  const handleReturnToConfig = () => {
    setDemoState('config');
    setSessionResults(null);
  };

  const handleStartNewSession = () => {
    setSessionResults(null);
    setDemoState('session');
  };

  if (demoState === 'session') {
    return (
      <TestKnowledgeSessionManager
        userId={SAMPLE_USER_ID}
        contentIds={SAMPLE_CONTENT_IDS}
        targetDurationMinutes={5}
        onSessionComplete={handleSessionComplete}
        onExit={handleReturnToConfig}
      />
    );
  }

  if (demoState === 'complete' && sessionResults) {
    return (
      <TestKnowledgeSessionComplete
        results={sessionResults}
        onReturnToLibrary={handleReturnToConfig}
        onStartNewSession={handleStartNewSession}
      />
    );
  }

  // Configuration/Demo intro screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Test Knowledge Demo
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Experience Stoke's revolutionary binary feedback system with Memory Waves design
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Features */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200/50">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Key Features</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <div>
                  <div className="font-medium text-slate-800">Binary Feedback</div>
                  <div className="text-sm text-slate-600">Simple "Got it" vs "Revisit" responses eliminate cognitive overhead</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <div>
                  <div className="font-medium text-slate-800">Spaced Repetition</div>
                  <div className="text-sm text-slate-600">SuperMemo SM-2 algorithm adjusts review schedules automatically</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
                <div>
                  <div className="font-medium text-slate-800">Smart Randomization</div>
                  <div className="text-sm text-slate-600">Questions from multiple episodes mixed with intelligent weighting</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
                <div>
                  <div className="font-medium text-slate-800">Memory Waves Design</div>
                  <div className="text-sm text-slate-600">Calming animations and supportive feedback encourage honest self-assessment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Info */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200/50">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Demo Experience</h2>
            <div className="space-y-4 mb-6">
              <div className="text-sm text-slate-600">
                <strong className="text-slate-800">Sample Content:</strong> 3 episodes from different topics
              </div>
              <div className="text-sm text-slate-600">
                <strong className="text-slate-800">Session Length:</strong> ~5 minutes with 8-12 questions
              </div>
              <div className="text-sm text-slate-600">
                <strong className="text-slate-800">Question Types:</strong> Mixed difficulty levels and formats
              </div>
              <div className="text-sm text-slate-600">
                <strong className="text-slate-800">Progress Tracking:</strong> Real spaced repetition scheduling
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <div className="text-sm font-medium text-blue-800 mb-2">💡 Try this approach:</div>
              <div className="text-sm text-blue-700">
                Answer honestly based on your confidence. "Revisit" isn't failure—it's smart learning that optimizes your review schedule.
              </div>
            </div>

            <button
              onClick={handleStartSession}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Start Demo Session
            </button>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-3xl p-8 border border-slate-200/50">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Technical Implementation</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="font-medium text-slate-800 mb-2">Multi-Content Allocation</div>
              <div className="text-slate-600">
                Questions weighted by content length and insight density, with smart anti-clustering to prevent predictable patterns.
              </div>
            </div>
            <div>
              <div className="font-medium text-slate-800 mb-2">Progress Analytics</div>
              <div className="text-slate-600">
                Individual spaced repetition tracking with comprehensive session analytics and performance optimization.
              </div>
            </div>
            <div>
              <div className="font-medium text-slate-800 mb-2">Supportive UX</div>
              <div className="text-slate-600">
                Memory Waves animations, 44px+ touch targets, and encouraging feedback create a non-judgmental learning environment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 