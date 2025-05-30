import React from 'react';

// Topic color themes based on style guide
const topicColorThemes = {
  primary: {
    bg: '#EFF6FF',      // Light blue background
    text: '#1E40AF',    // Blue-800
    border: '#2563EB',  // Primary Blue
    hover: '#DBEAFE'    // Blue-100
  },
  success: {
    bg: '#F0FDF4',      // Light green background  
    text: '#166534',    // Green-800
    border: '#059669',  // Success Green
    hover: '#DCFCE7'    // Green-100
  },
  warning: {
    bg: '#FEF3C7',      // Light amber background
    text: '#92400E',    // Amber-800
    border: '#D97706',  // Warning Amber
    hover: '#FDE68A'    // Amber-200
  },
  info: {
    bg: '#F0F9FF',      // Light sky background
    text: '#0C4A6E',    // Sky-900
    border: '#0EA5E9',  // Sky-500
    hover: '#E0F2FE'    // Sky-100
  },
  neutral: {
    bg: '#F8FAFC',      // Light gray background
    text: '#64748B',    // Slate-500
    border: '#94A3B8',  // Slate-400
    hover: '#F1F5F9'    // Slate-100
  }
} as const;

interface TopicTagProps {
  topic: string;
  theme?: keyof typeof topicColorThemes;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

const tagSizes = {
  sm: 'px-2 py-1 text-xs touch-target',
  md: 'px-3 py-1.5 text-sm touch-target', 
  lg: 'px-4 py-2 text-base touch-target'
} as const;

export function TopicTag({ 
  topic, 
  theme = 'neutral', 
  size = 'md',
  onClick,
  isSelected = false,
  className = ''
}: TopicTagProps) {
  const colorTheme = topicColorThemes[theme];
  const sizeClasses = tagSizes[size];
  
  const Component = onClick ? 'button' : 'span';
  
  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex items-center font-medium rounded-full 
        border transition-all duration-200 ease-out
        ${sizeClasses}
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2' : ''}
        ${isSelected ? 'ring-2 ring-offset-1' : ''}
        ${className}
      `}
      style={{
        backgroundColor: isSelected ? colorTheme.border : colorTheme.bg,
        color: isSelected ? '#FFFFFF' : colorTheme.text,
        borderColor: colorTheme.border,
        ...(onClick && {
          focusRingColor: colorTheme.border
        })
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick && isSelected ? true : undefined}
      aria-label={onClick ? `Toggle ${topic} topic filter` : `Topic: ${topic}`}
    >
      {topic}
    </Component>
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
          <TopicTag
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
  const colors = topicColorThemes.neutral; // Use neutral theme as default
  
  return (
    <div
      className="flex items-center gap-3 mb-4 pb-2 border-b-2"
      style={{ borderColor: colors.border }}
    >
      <TopicTag topic={topic} size="lg" />
      <span className="text-sm text-[#64748B] font-medium">
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
        <TopicTag key={topic} topic={topic} size={size} />
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