import React from 'react';

// Topic color mapping based on style guide colors
const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  'Artificial Intelligence': {
    bg: '#EFF6FF',
    text: '#1E40AF',
    border: '#3B82F6',
    hover: '#DBEAFE'
  },
  'Economics': {
    bg: '#F0FDF4',
    text: '#166534',
    border: '#22C55E',
    hover: '#DCFCE7'
  },
  'Government': {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#F59E0B',
    hover: '#FDE68A'
  },
  'Technology': {
    bg: '#EDE9FE',
    text: '#6B21A8',
    border: '#8B5CF6',
    hover: '#DDD6FE'
  },
  'Parenting': {
    bg: '#FCE7F3',
    text: '#BE185D',
    border: '#EC4899',
    hover: '#FBCFE8'
  },
  'Sample': {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#64748B',
    hover: '#E2E8F0'
  },
  'Demo': {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#64748B',
    hover: '#E2E8F0'
  },
  'Error': {
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#EF4444',
    hover: '#FEE2E2'
  }
};

// Default color for unknown topics
const DEFAULT_TOPIC_COLOR = {
  bg: '#F8FAFC',
  text: '#64748B',
  border: '#94A3B8',
  hover: '#F1F5F9'
};

interface TopicBadgeProps {
  topic: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

export function TopicBadge({ topic, size = 'md', onClick, isSelected = false, className = '' }: TopicBadgeProps) {
  const colors = TOPIC_COLORS[topic] || DEFAULT_TOPIC_COLOR;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseClasses = `
    inline-flex items-center rounded-full font-medium transition-all duration-200 ease-out
    border cursor-pointer select-none
    ${sizeClasses[size]}
    ${className}
  `;

  const styleProps = isSelected ? {
    backgroundColor: colors.border,
    color: 'white',
    borderColor: colors.border,
  } : {
    backgroundColor: colors.bg,
    color: colors.text,
    borderColor: colors.border,
  };

  return (
    <span
      className={baseClasses}
      style={styleProps}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.hover;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = colors.bg;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {topic}
    </span>
  );
}

interface TopicFilterBarProps {
  allTopics: string[];
  selectedTopics: string[];
  onTopicToggle: (topic: string) => void;
  onClearAll: () => void;
}

export function TopicFilterBar({ allTopics, selectedTopics, onTopicToggle, onClearAll }: TopicFilterBarProps) {
  return (
    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-700">Filter by Topics</h3>
        {selectedTopics.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors duration-200"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {allTopics.map((topic) => (
          <TopicBadge
            key={topic}
            topic={topic}
            size="sm"
            isSelected={selectedTopics.includes(topic)}
            onClick={() => onTopicToggle(topic)}
          />
        ))}
      </div>
      {selectedTopics.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            Showing content with: {selectedTopics.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

interface TopicGroupHeaderProps {
  topic: string;
  count: number;
}

export function TopicGroupHeader({ topic, count }: TopicGroupHeaderProps) {
  const colors = TOPIC_COLORS[topic] || DEFAULT_TOPIC_COLOR;
  
  return (
    <div 
      className="flex items-center gap-3 mb-4 pb-2 border-b-2"
      style={{ borderColor: colors.border }}
    >
      <TopicBadge topic={topic} size="lg" />
      <span className="text-sm text-slate-500 font-medium">
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  );
}

interface TopicListProps {
  topics: string[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  className?: string;
}

export function TopicList({ topics, size = 'md', maxDisplay = Infinity, className = '' }: TopicListProps) {
  const displayTopics = topics.slice(0, maxDisplay);
  const remainingCount = topics.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTopics.map((topic) => (
        <TopicBadge key={topic} topic={topic} size={size} />
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 text-xs text-slate-500 bg-slate-100 rounded-full">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// Utility function to group content by topics
export function groupContentByTopics<T extends { topics: string[] }>(
  content: T[]
): Array<{ topic: string; items: T[] }> {
  const topicGroups = new Map<string, T[]>();
  
  content.forEach((item) => {
    item.topics.forEach((topic) => {
      if (!topicGroups.has(topic)) {
        topicGroups.set(topic, []);
      }
      topicGroups.get(topic)!.push(item);
    });
  });

  return Array.from(topicGroups.entries())
    .map(([topic, items]) => ({ topic, items }))
    .sort((a, b) => b.items.length - a.items.length); // Sort by item count descending
}

// Utility function to get all unique topics from content
export function getAllTopics<T extends { topics: string[] }>(content: T[]): string[] {
  const allTopics = new Set<string>();
  content.forEach((item) => {
    item.topics.forEach((topic) => allTopics.add(topic));
  });
  return Array.from(allTopics).sort();
} 