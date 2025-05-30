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

  return (
    <div className="mb-2 pl-3 bg-[#FAFAFA] italic text-[#64748B] border-l-2 border-[#7C3AED] rounded-r-md py-2">
      {children}
      {confidence && (
        <div className="flex items-center mt-1">
          <span className="text-xs text-[#64748B] mr-1">AI Confidence:</span>
          <span 
            className="text-xs font-medium"
            style={{ color: getConfidenceColor(confidence) }}
          >
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
          </span>
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
  const getConfidenceColor = (level: ConfidenceLevel): string => {
    switch (level) {
      case 'high':
        return '#059669';
      case 'medium':
        return '#D97706';
      case 'low':
        return '#DC2626';
    }
  };

  const getConfidenceText = (level: ConfidenceLevel): string => {
    switch (level) {
      case 'high':
        return 'High confidence';
      case 'medium':
        return 'Medium confidence';
      case 'low':
        return 'Low confidence';
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: getConfidenceColor(confidence) }}
      />
      {showLabel && (
        <span className="text-xs text-slate-500 font-normal">
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
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: statusColor }}
        aria-hidden="true"
      />
      <span 
        className="text-xs font-medium capitalize"
        style={{ color: statusColor }}
      >
        {status}
      </span>
    </div>
  );
}

// Status color mapping using style guide
function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#059669'; // Success Green
    case 'processing':
      return '#D97706'; // Warning Amber
    case 'failed':
      return '#DC2626'; // Subtle Red
    case 'pending':
    default:
      return '#94A3B8'; // Soft gray variant
  }
}

interface AIContentBadgeProps {
  isAiProcessed?: boolean;
  confidence?: ConfidenceLevel;
  className?: string;
}

export function AIContentBadge({ isAiProcessed, confidence, className = '' }: AIContentBadgeProps) {
  if (!isAiProcessed) return null;

  const badgeColor = confidence ? getConfidenceColor(confidence) : '#7C3AED'; // Default to neutral purple

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
          className="text-xs font-medium"
          style={{ color: badgeColor }}
        >
          AI Processed
        </span>
      </div>
      {confidence && (
        <span 
          className="text-xs"
          style={{ color: getConfidenceColor(confidence) }}
          aria-label={`AI confidence level: ${confidence}`}
        >
          ({confidence})
        </span>
      )}
    </div>
  );
}

// Helper function to get confidence color using style guide colors
function getConfidenceColor(confidence?: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return '#059669'; // Success Green
    case 'medium':
      return '#D97706'; // Warning Amber
    case 'low':
      return '#DC2626'; // Subtle Red
    default:
      return '#7C3AED'; // Neutral Purple - default AI indicator
  }
} 