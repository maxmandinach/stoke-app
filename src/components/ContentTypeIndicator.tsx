import React from 'react';
import { ContentSource } from '@/types/content';

interface ContentTypeIndicatorProps {
  source: ContentSource;
  className?: string;
}

export function ContentTypeIndicator({ source, className = '' }: ContentTypeIndicatorProps) {
  const getSourceConfig = (source: ContentSource) => {
    switch (source) {
      case 'podcast':
        return {
          label: 'Podcast',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#FEF3C7',
          textColor: '#92400E',
          borderColor: '#F59E0B'
        };
      case 'youtube':
        return {
          label: 'YouTube',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm5.496 1.04l4.47 2.96a.75.75 0 010 1.25l-4.47 2.96A.75.75 0 017 12.5v-5a.75.75 0 011.496-.46z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#FEF2F2',
          textColor: '#B91C1C',
          borderColor: '#EF4444'
        };
      default:
        return {
          label: 'Content',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#F1F5F9',
          textColor: '#475569',
          borderColor: '#64748B'
        };
    }
  };

  const config = getSourceConfig(source);

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor
      }}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

interface ContentMetadataProps {
  source: ContentSource;
  createdAt: string;
  processedAt: string;
  className?: string;
}

export function ContentMetadata({ source, createdAt, processedAt, className = '' }: ContentMetadataProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`flex items-center gap-3 text-xs text-slate-500 ${className}`}>
      <ContentTypeIndicator source={source} />
      <span>•</span>
      <span>Added {formatDate(createdAt)}</span>
      <span>•</span>
      <span>Processed {formatDate(processedAt)}</span>
    </div>
  );
} 