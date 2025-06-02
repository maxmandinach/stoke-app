'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MemoryWavesProgress, MemoryWavesLoader } from './MemoryWaves';
import StokeLogo from './StokeLogo';

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

export type SummaryType = 'quick' | 'full';

interface ReadSummariesSessionProps {
  userId: string;
  sessionId: string;
  summaries: SummaryContent[];
  onSessionComplete: (results: ReadSummariesResults) => void;
  onContinueToTest?: () => void; // For "Both" sessions
  onExit: () => void;
  sessionType: 'read_summaries' | 'both';
  targetDurationMinutes: number;
}

interface ReadSummariesResults {
  totalSummaries: number;
  summariesRead: number;
  summaryType: SummaryType;
  totalTimeSeconds: number;
  averageReadTimePerSummary: number;
  completionRate: number;
}

export default function ReadSummariesSession({
  userId,
  sessionId,
  summaries,
  onSessionComplete,
  onContinueToTest,
  onExit,
  sessionType,
  targetDurationMinutes
}: ReadSummariesSessionProps) {
  // Session state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summaryType, setSummaryType] = useState<SummaryType>('quick');
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Timing tracking
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [summaryStartTime, setSummaryStartTime] = useState<number | null>(null);
  const [readTimes, setReadTimes] = useState<number[]>([]);

  // Auto-save state
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());

  const currentSummary = summaries[currentIndex];
  const progress = summaries.length > 0 ? (currentIndex + 1) / summaries.length : 0;
  const isLastSummary = currentIndex === summaries.length - 1;

  // Initialize session timing
  useEffect(() => {
    if (hasStarted && !sessionStartTime) {
      setSessionStartTime(Date.now());
      setSummaryStartTime(Date.now());
    }
  }, [hasStarted, sessionStartTime]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasStarted && !isCompleted) {
        // Save current progress
        const now = Date.now();
        setLastSaveTime(now);
        // TODO: Implement actual auto-save to database
        console.log('Auto-saving session progress...');
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasStarted, isCompleted]);

  const handleSummaryTypeSelection = useCallback((type: SummaryType) => {
    setSummaryType(type);
    setHasStarted(true);
  }, []);

  const handleNext = useCallback(async () => {
    if (!summaryStartTime) return;

    const readTime = Date.now() - summaryStartTime;
    setReadTimes(prev => [...prev, readTime]);

    if (isLastSummary) {
      // Complete the session
      setIsCompleted(true);
      
      const totalTime = sessionStartTime ? Date.now() - sessionStartTime : 0;
      const avgReadTime = readTimes.length > 0 
        ? (readTimes.reduce((sum, time) => sum + time, 0) + readTime) / (readTimes.length + 1)
        : readTime;

      const results: ReadSummariesResults = {
        totalSummaries: summaries.length,
        summariesRead: currentIndex + 1,
        summaryType,
        totalTimeSeconds: Math.round(totalTime / 1000),
        averageReadTimePerSummary: Math.round(avgReadTime / 1000),
        completionRate: (currentIndex + 1) / summaries.length
      };

      onSessionComplete(results);
    } else {
      // Transition to next summary
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSummaryStartTime(Date.now());
        setIsTransitioning(false);
      }, 300);
    }
  }, [summaryStartTime, isLastSummary, readTimes, sessionStartTime, currentIndex, summaries.length, summaryType, onSessionComplete]);

  const getSummaryContent = (summary: SummaryContent, type: SummaryType): string => {
    const content = type === 'quick' ? summary.quick_summary : summary.full_summary;
    
    if (type === 'quick') {
      // Format bullet points for better readability
      return content.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
          return `• ${trimmed}`;
        }
        return trimmed;
      }).filter(line => line.length > 0).join('\n');
    }
    
    return content;
  };

  const formatSummaryText = (content: string): JSX.Element[] => {
    if (summaryType === 'quick') {
      return content.split('\n').map((line, index) => (
        <div key={index} className="flex items-start space-x-3 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0" />
          <p className="text-slate-800 leading-relaxed text-lg">{line.replace(/^[•\-]\s*/, '')}</p>
        </div>
      ));
    } else {
      return content.split('\n\n').map((paragraph, index) => (
        <p key={index} className="text-slate-800 leading-relaxed text-lg mb-6">
          {paragraph.trim()}
        </p>
      ));
    }
  };

  // Summary type selection screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <StokeLogo className="w-8 h-8 text-slate-800" />
            <button
              onClick={onExit}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Exit session"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Selection Interface */}
        <div className="px-6 pb-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">Choose Your Reading Style</h1>
            <p className="text-slate-600">Select how you'd like to review your summaries</p>
            <div className="mt-4 text-sm text-slate-500">
              {summaries.length} summary{summaries.length !== 1 ? 'ies' : ''} • ~{targetDurationMinutes} minutes
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSummaryTypeSelection('quick')}
              className="w-full p-6 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-slate-800 group-hover:text-blue-800">Quick Review</h3>
                <div className="w-4 h-4 border-2 border-slate-300 group-hover:border-blue-500 rounded-full" />
              </div>
              <p className="text-slate-600 mb-3">4 key insights per hour of content</p>
              <div className="text-sm text-slate-500">Perfect for refreshing your memory and quick reviews</div>
            </button>

            <button
              onClick={() => handleSummaryTypeSelection('full')}
              className="w-full p-6 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-slate-800 group-hover:text-blue-800">Deep Dive</h3>
                <div className="w-4 h-4 border-2 border-slate-300 group-hover:border-blue-500 rounded-full" />
              </div>
              <p className="text-slate-600 mb-3">2 detailed paragraphs per hour of content</p>
              <div className="text-sm text-slate-500">For comprehensive understanding and detailed insights</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion screen for Both sessions
  if (isCompleted && sessionType === 'both' && onContinueToTest) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <StokeLogo className="w-8 h-8 text-slate-800" />
            <button
              onClick={onExit}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Exit session"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center mb-8">
            <div className="mb-6">
              <MemoryWavesProgress progress={1} size={64} />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
              Summaries Complete
            </h2>
            <p className="text-slate-600 mb-2">
              Great reading! You've reviewed {summaries.length} summary{summaries.length !== 1 ? 'ies' : ''}.
            </p>
            <p className="text-sm text-slate-500">
              Ready to test your knowledge?
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={onContinueToTest}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-colors"
            >
              Continue to Test Knowledge
            </button>
            <button
              onClick={onExit}
              className="w-full py-3 px-6 bg-slate-100 text-slate-600 rounded-2xl font-medium hover:bg-slate-200 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main reading interface
  return (
    <div className="min-h-screen bg-white reading-content">
      {/* Header with progress */}
      <div className="px-6 pt-8 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <StokeLogo className="w-8 h-8 text-slate-800" />
          <button
            onClick={onExit}
            className="text-slate-400 hover:text-slate-600 transition-colors focus-ring touch-target"
            aria-label="Exit session"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MemoryWavesProgress progress={progress} size={24} className="progress-ring" />
            <span className="text-sm font-medium text-slate-600">
              Summary {currentIndex + 1} of {summaries.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 capitalize">
            {summaryType} review
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {currentSummary && (
          <div className="px-6 py-8">
            {/* Content header */}
            <div className="mb-8">
              <h1 className="text-xl font-semibold text-slate-800 mb-3 leading-tight">
                {currentSummary.title}
              </h1>
              {currentSummary.topics && currentSummary.topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentSummary.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                      style={topic.color ? { backgroundColor: `${topic.color}15`, color: topic.color } : {}}
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Summary content */}
            <div className="mb-12 max-w-2xl">
              {formatSummaryText(getSummaryContent(currentSummary, summaryType))}
            </div>

            {/* Navigation */}
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="session-nav-button py-3 px-8 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-colors min-w-32 focus-ring touch-target"
                aria-label={isLastSummary ? 'Complete session' : 'Continue to next summary'}
              >
                {isLastSummary ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 