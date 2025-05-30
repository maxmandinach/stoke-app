import React from 'react';
import { ConfidenceLevel } from '@/types/content';

interface AIInsightProps {
  children: React.ReactNode;
  isAiGenerated?: boolean;
  confidence?: ConfidenceLevel;
}

export function AIInsight({ children, isAiGenerated = false, confidence }: AIInsightProps) {
  if (!isAiGenerated) {
    return <div className="mb-2">{children}</div>;
  }

  const confidenceClass = confidence === 'high' ? 'stoke-ai-confidence-high' : 
                         confidence === 'low' ? 'stoke-ai-confidence-low' : 
                         '';

  return (
    <div className={`stoke-ai-content ${confidenceClass} p-3 rounded-r-lg`}>
      {children}
      {confidence && (
        <div className="flex items-center mt-2">
          <span className="stoke-small mr-2">AI Confidence:</span>
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getConfidenceColor(confidence) }}
            />
            <span 
              className="stoke-small font-medium"
              style={{ color: getConfidenceColor(confidence) }}
            >
              {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface AIConfidenceIndicatorProps {
  confidence: ConfidenceLevel;
  showLabel?: boolean;
}

export function AIConfidenceIndicator({ confidence, showLabel = true }: AIConfidenceIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: getConfidenceColor(confidence) }}
      />
      {showLabel && (
        <span className="stoke-small">
          {getConfidenceText(confidence)}
        </span>
      )}
    </div>
  );
}

interface AIProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  className?: string;
}

export function AIProcessingStatus({ status, className = '' }: AIProcessingStatusProps) {
  const statusColor = getStatusColor(status);
  const isActive = status === 'processing' || status === 'pending';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: statusColor }}
        aria-hidden="true"
      />
      <span 
        className="stoke-small font-medium capitalize"
        style={{ color: statusColor }}
      >
        {status}
      </span>
    </div>
  );
}

// Status color mapping using Stoke design system
function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'var(--stoke-success-green)';
    case 'processing':
      return 'var(--stoke-warning-amber)';
    case 'failed':
      return 'var(--stoke-subtle-red)';
    case 'pending':
    default:
      return 'var(--stoke-soft-gray)';
  }
}

interface AIContentBadgeProps {
  isAiProcessed?: boolean;
  confidence?: ConfidenceLevel;
  className?: string;
}

export function AIContentBadge({ isAiProcessed, confidence, className = '' }: AIContentBadgeProps) {
  if (!isAiProcessed) return null;

  const badgeColor = confidence ? getConfidenceColor(confidence) : 'var(--stoke-neutral-purple)';

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-full ${className}`}>
      <div className="flex items-center gap-1">
        <svg 
          className="w-3 h-3" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          style={{ color: badgeColor }}
          aria-hidden="true"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span 
          className="stoke-small font-medium"
          style={{ color: badgeColor }}
        >
          AI
        </span>
      </div>
      {confidence && (
        <span 
          className="stoke-small opacity-75"
          style={{ color: getConfidenceColor(confidence) }}
          aria-label={`AI confidence level: ${confidence}`}
        >
          ({confidence})
        </span>
      )}
    </div>
  );
}

// Helper function to get confidence color using Stoke design system
function getConfidenceColor(confidence?: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return 'var(--stoke-success-green)';
    case 'medium':
      return 'var(--stoke-warning-amber)';
    case 'low':
      return 'var(--stoke-subtle-red)';
    default:
      return 'var(--stoke-neutral-purple)';
  }
}

// Helper function to get confidence text
function getConfidenceText(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return 'High confidence';
    case 'medium':
      return 'Medium confidence';
    case 'low':
      return 'Low confidence';
  }
} 