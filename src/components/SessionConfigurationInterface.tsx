'use client';

import React, { useState, useEffect } from 'react';
import { 
  useSessionConfiguration, 
  sessionConfigurationActions,
  SessionType,
  SessionLength 
} from '@/contexts/SessionConfigurationContext';
import { useContentSelection } from '@/contexts/ContentSelectionContext';

// Session type preview components
function SessionTypePreview({ 
  type, 
  isSelected, 
  onSelect 
}: { 
  type: SessionType; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  const getTypeDetails = () => {
    switch (type) {
      case 'summaries':
        return {
          title: 'Read Summaries',
          description: 'Browse key insights and takeaways from your selected content',
          icon: '📖',
          preview: 'Interactive summary cards with main points, insights, and connections',
          benefits: ['Quick knowledge overview', 'Perfect for commutes', 'Low cognitive load']
        };
      case 'testing':
        return {
          title: 'Test Knowledge',
          description: 'Challenge yourself with questions based on the content',
          icon: '🧠',
          preview: 'Spaced repetition questions with immediate feedback and explanations',
          benefits: ['Active recall practice', 'Memory reinforcement', 'Track understanding']
        };
      case 'both':
        return {
          title: 'Read + Test',
          description: 'Start with summaries, then reinforce with questions',
          icon: '🎯',
          preview: 'Sequential experience: summaries first to refresh, then targeted questions',
          benefits: ['Complete review cycle', 'Build then test knowledge', 'Optimal retention']
        };
    }
  };

  const details = getTypeDetails();

  return (
    <div 
      className={`
        relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100' 
          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
        }
      `}
      onClick={onSelect}
    >
      {/* Selection indicator with Memory Waves concentric circles */}
      <div className={`
        absolute -top-3 -right-3 w-6 h-6 rounded-full transition-all duration-300
        ${isSelected 
          ? 'bg-purple-500 shadow-lg' 
          : 'bg-transparent'
        }
      `}>
        {isSelected && (
          <>
            <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20" />
            <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
          </>
        )}
      </div>

      {/* Type header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{details.icon}</div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{details.title}</h3>
          <p className="text-sm text-gray-600">{details.description}</p>
        </div>
      </div>

      {/* Preview content */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">What you'll experience:</div>
        <div className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
          {details.preview}
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-1">
        {details.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1 h-1 rounded-full bg-purple-400" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Session length selector
function SessionLengthSelector({ 
  selectedLength, 
  onSelect,
  timeEstimate 
}: { 
  selectedLength: SessionLength; 
  onSelect: (length: SessionLength) => void;
  timeEstimate: number;
}) {
  const lengthOptions: { 
    value: SessionLength; 
    label: string; 
    range: string; 
    description: string; 
  }[] = [
    { 
      value: 'quick', 
      label: 'Quick', 
      range: '1-3 min', 
      description: 'Bite-sized review for busy moments' 
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      range: '3-5 min', 
      description: 'Balanced depth and efficiency' 
    },
    { 
      value: 'extended', 
      label: 'Extended', 
      range: '5-15 min', 
      description: 'Comprehensive deep dive' 
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Length</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {lengthOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`
              p-4 rounded-xl border-2 text-left transition-all duration-200
              ${selectedLength === option.value
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">{option.label}</span>
              <span className="text-sm text-purple-600 font-medium">{option.range}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{option.description}</p>
            {selectedLength === option.value && (
              <div className="text-xs text-purple-700 font-medium">
                Est. {timeEstimate.toFixed(1)} minutes for your selection
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Content summary component
function ContentSummary({ 
  selectedCount, 
  sessionStructure, 
  sessionType,
  onReturnToSelection 
}: {
  selectedCount: number;
  sessionStructure: any;
  sessionType: SessionType;
  onReturnToSelection: () => void;
}) {
  const getSessionDescription = () => {
    const { summariesCount, questionsCount } = sessionStructure;
    
    switch (sessionType) {
      case 'summaries':
        return `${summariesCount} summary${summariesCount !== 1 ? 'ies' : ''}`;
      case 'testing':
        return `${questionsCount} question${questionsCount !== 1 ? 's' : ''}`;
      case 'both':
        return `${summariesCount} summary${summariesCount !== 1 ? 'ies' : ''}, then ${questionsCount} question${questionsCount !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Session</h3>
        <button
          onClick={onReturnToSelection}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          Change Content →
        </button>
      </div>

      {/* Content count */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold">
            {selectedCount}
          </div>
          <span className="text-gray-700">
            {selectedCount} episode{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>

      {/* Session structure */}
      <div className="bg-white p-4 rounded-xl border border-purple-100 mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Session Structure:</div>
        <div className="text-lg font-semibold text-gray-900">{getSessionDescription()}</div>
        <div className="text-sm text-gray-600 mt-1">
          Estimated time: {sessionStructure.estimatedDuration.total.toFixed(1)} minutes
        </div>
      </div>

      {/* Time breakdown for 'both' sessions */}
      {sessionType === 'both' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs font-medium text-blue-700 mb-1">Reading Phase</div>
            <div className="text-sm text-blue-900">
              {sessionStructure.estimatedDuration.summaries.toFixed(1)} min
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-xs font-medium text-purple-700 mb-1">Testing Phase</div>
            <div className="text-sm text-purple-900">
              {sessionStructure.estimatedDuration.testing.toFixed(1)} min
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Start session button
function StartSessionButton({ 
  canStart, 
  onStart 
}: {
  canStart: boolean;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onStart}
      disabled={!canStart}
      className={`
        w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300
        ${canStart
          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }
      `}
    >
      {canStart ? (
        <div className="flex items-center justify-center gap-3">
          <span>Start Session</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-white/60" />
            <div className="w-1 h-1 rounded-full bg-white/80" />
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
        </div>
      ) : (
        'Select content to continue'
      )}
    </button>
  );
}

// Main interface component
export function SessionConfigurationInterface({ onReturnToSelection }: { onReturnToSelection: () => void }) {
  const { state: sessionState, dispatch: sessionDispatch } = useSessionConfiguration();
  const { state: contentState } = useContentSelection();
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync selected content with session configuration
  useEffect(() => {
    const selectedContent = contentState.allContent.filter(
      content => contentState.selectedContentIds.has(content.id)
    );
    sessionDispatch(sessionConfigurationActions.setSelectedContent(selectedContent));
  }, [contentState.selectedContentIds, contentState.allContent, sessionDispatch]);

  const handleSessionTypeChange = (type: SessionType) => {
    setIsAnimating(true);
    sessionDispatch(sessionConfigurationActions.setSessionType(type));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSessionLengthChange = (length: SessionLength) => {
    setIsAnimating(true);
    sessionDispatch(sessionConfigurationActions.setSessionLength(length));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleStartSession = () => {
    // TODO: Navigate to session interface
    console.log('Starting session with configuration:', sessionState);
    // This would typically navigate to the actual session interface
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configure Your Session
        </h1>
        <p className="text-gray-600">
          Choose how you'd like to review your selected content
        </p>
      </div>

      {/* Content Summary */}
      <ContentSummary
        selectedCount={contentState.selectionCount}
        sessionStructure={sessionState.sessionStructure}
        sessionType={sessionState.sessionType}
        onReturnToSelection={onReturnToSelection}
      />

      {/* Session Type Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Session Type</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['summaries', 'testing', 'both'] as const).map((type) => (
            <SessionTypePreview
              key={type}
              type={type}
              isSelected={sessionState.sessionType === type}
              onSelect={() => handleSessionTypeChange(type)}
            />
          ))}
        </div>
      </div>

      {/* Session Length Selection */}
      <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
        <SessionLengthSelector
          selectedLength={sessionState.sessionLength}
          onSelect={handleSessionLengthChange}
          timeEstimate={sessionState.sessionStructure.estimatedDuration.total}
        />
      </div>

      {/* Start Session Button */}
      <div className="pt-6">
        <StartSessionButton
          canStart={sessionState.canStartSession}
          onStart={handleStartSession}
        />
      </div>

      {/* Memory Waves progress indicator */}
      <div className="flex justify-center pt-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-300" />
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
} 