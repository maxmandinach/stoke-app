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

  const getConfidenceBorderColor = (confidence?: ConfidenceLevel): string => {
    switch (confidence) {
      case 'high':
        return '#059669'; // green
      case 'medium':
        return '#D97706'; // amber
      case 'low':
        return '#DC2626'; // red
      default:
        return '#7C3AED'; // purple - default AI indicator
    }
  };

  return (
    <div
      className="mb-2 pl-3 bg-[#FAFAFA] italic text-slate-700"
      style={{
        borderLeft: `3px solid ${getConfidenceBorderColor(confidence)}`,
        paddingLeft: '12px'
      }}
    >
      {children}
      {confidence && (
        <div className="flex items-center mt-1">
          <AIConfidenceIndicator confidence={confidence} />
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
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: '#94A3B8', // slate-400
          text: 'Pending processing',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'processing':
        return {
          color: '#7C3AED', // purple
          text: 'AI processing',
          icon: (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )
        };
      case 'completed':
        return {
          color: '#059669', // green
          text: 'AI processed',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'failed':
        return {
          color: '#DC2626', // red
          text: 'Processing failed',
          icon: (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          color: '#94A3B8',
          text: 'Unknown status',
          icon: null
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div style={{ color: config.color }}>
        {config.icon}
      </div>
      <span className="text-xs font-normal" style={{ color: config.color }}>
        {config.text}
      </span>
    </div>
  );
}

interface AIContentBadgeProps {
  isAiProcessed?: boolean;
  className?: string;
}

export function AIContentBadge({ isAiProcessed = false, className = '' }: AIContentBadgeProps) {
  if (!isAiProcessed) return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-full ${className}`}>
      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
      <span className="text-xs font-medium text-purple-700">AI Enhanced</span>
    </div>
  );
} 