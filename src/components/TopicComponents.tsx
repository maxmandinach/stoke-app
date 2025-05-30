import React from 'react';

// Enhanced topic color themes using Stoke design system
const topicColorThemes = {
  primary: {
    bg: 'var(--stoke-blue-50)',
    text: 'var(--stoke-primary-blue)',
    border: 'var(--stoke-primary-blue)',
    hover: 'var(--stoke-blue-100)',
    selected: 'var(--stoke-primary-blue)'
  },
  success: {
    bg: '#F0FDF4',
    text: '#166534',
    border: 'var(--stoke-success-green)',
    hover: '#DCFCE7',
    selected: 'var(--stoke-success-green)'
  },
  warning: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: 'var(--stoke-warning-amber)',
    hover: '#FDE68A',
    selected: 'var(--stoke-warning-amber)'
  },
  info: {
    bg: '#F0F9FF',
    text: '#0C4A6E',
    border: '#0EA5E9',
    hover: '#E0F2FE',
    selected: '#0EA5E9'
  },
  neutral: {
    bg: 'var(--stoke-gray-50)',
    text: 'var(--stoke-soft-gray)',
    border: 'var(--stoke-gray-400)',
    hover: 'var(--stoke-gray-100)',
    selected: 'var(--stoke-soft-gray)'
  },
  purple: {
    bg: '#F5F3FF',
    text: '#6B21A8',
    border: 'var(--stoke-neutral-purple)',
    hover: '#EDE9FE',
    selected: 'var(--stoke-neutral-purple)'
  }
} as const;

// Color rotation for visual variety
const getTopicTheme = (topic: string): keyof typeof topicColorThemes => {
  const themes: (keyof typeof topicColorThemes)[] = ['primary', 'success', 'warning', 'info', 'purple', 'neutral'];
  const hash = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
};

interface TopicTagProps {
  topic: string;
  theme?: keyof typeof topicColorThemes;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

export function TopicTag({ 
  topic, 
  theme, 
  size = 'md',
  onClick,
  isSelected = false,
  className = ''
}: TopicTagProps) {
  // Auto-assign theme based on topic name if not provided
  const finalTheme = theme || getTopicTheme(topic);
  const colorTheme = topicColorThemes[finalTheme];
  
  const sizeClass = size === 'sm' ? 'stoke-topic-tag-sm' : 
                   size === 'lg' ? 'stoke-topic-tag-lg' : 
                   'stoke-topic-tag-md';
  
  const Component = onClick ? 'button' : 'span';
  
  const baseClasses = `
    stoke-topic-tag 
    ${sizeClass}
    ${onClick ? 'stoke-topic-tag-interactive' : ''}
    ${className}
  `.trim();
  
  const tagStyle = {
    backgroundColor: isSelected ? colorTheme.selected : colorTheme.bg,
    color: isSelected ? 'var(--stoke-pure-white)' : colorTheme.text,
    borderColor: colorTheme.border,
    '--hover-bg': colorTheme.hover
  } as React.CSSProperties;
  
  return (
    <Component
      onClick={onClick}
      className={baseClasses}
      style={tagStyle}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick && isSelected ? true : undefined}
      aria-label={onClick ? `Toggle ${topic} topic filter` : `Topic: ${topic}`}
      onMouseEnter={(e) => {
        if (onClick && !isSelected) {
          (e.target as HTMLElement).style.backgroundColor = colorTheme.hover;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isSelected) {
          (e.target as HTMLElement).style.backgroundColor = colorTheme.bg;
        }
      }}
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
  if (allTopics.length === 0) return null;
  
  return (
    <div className="stoke-section">
      <div className="stoke-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="stoke-subtitle">Filter by Topics</h3>
          {selectedTopics.length > 0 && (
            <button
              onClick={onClearAll}
              className="stoke-btn-tertiary stoke-btn-sm"
              aria-label="Clear all topic filters"
            >
              Clear all
            </button>
          )}
        </div>
        
        {/* Topic Tags Grid */}
        <div className="flex flex-wrap gap-2 mb-4">
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
        
        {/* Active Filter Summary */}
        {selectedTopics.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="stoke-caption">Active filters:</span>
              <div className="flex flex-wrap gap-1">
                {selectedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="stoke-small px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <p className="stoke-small mt-2 text-gray-500">
              Showing {selectedTopics.length === 1 ? '1 topic' : `${selectedTopics.length} topics`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface TopicGroupHeaderProps {
  topic: string;
  count: number;
}

export function TopicGroupHeader({ topic, count }: TopicGroupHeaderProps) {
  const theme = getTopicTheme(topic);
  const colorTheme = topicColorThemes[theme];
  
  return (
    <div 
      className="flex items-center gap-3 mb-6 pb-3 border-b-2"
      style={{ borderColor: colorTheme.border }}
    >
      <TopicTag topic={topic} size="lg" />
      <div className="flex items-center gap-2">
        <span className="stoke-caption">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: colorTheme.border }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

interface TopicListProps {
  topics: string[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  className?: string;
  interactive?: boolean;
  onTopicClick?: (topic: string) => void;
}

export function TopicList({ 
  topics, 
  size = 'md', 
  maxDisplay = Infinity, 
  className = '',
  interactive = false,
  onTopicClick
}: TopicListProps) {
  const displayTopics = topics.slice(0, maxDisplay);
  const remainingCount = topics.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTopics.map((topic) => (
        <TopicTag 
          key={topic} 
          topic={topic} 
          size={size}
          onClick={interactive && onTopicClick ? () => onTopicClick(topic) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span className="stoke-topic-tag stoke-topic-tag-sm opacity-60">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// Enhanced content grouping with better sorting
export function groupContentByTopics<T extends { topics: string[] }>(
  content: T[]
): Array<{ topic: string; items: T[]; theme: keyof typeof topicColorThemes }> {
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
    .map(([topic, items]) => ({ 
      topic, 
      items,
      theme: getTopicTheme(topic)
    }))
    .sort((a, b) => {
      // Sort by item count descending, then alphabetically
      if (b.items.length !== a.items.length) {
        return b.items.length - a.items.length;
      }
      return a.topic.localeCompare(b.topic);
    });
}

// Get all unique topics with enhanced sorting
export function getAllTopics<T extends { topics: string[] }>(content: T[]): string[] {
  const topicCounts = new Map<string, number>();
  
  content.forEach((item) => {
    item.topics.forEach((topic) => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
  });

  return Array.from(topicCounts.entries())
    .sort((a, b) => {
      // Sort by frequency descending, then alphabetically
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]);
    })
    .map(([topic]) => topic);
}

// New utility for topic statistics
export function getTopicStats<T extends { topics: string[] }>(content: T[]) {
  const stats = new Map<string, {
    count: number;
    theme: keyof typeof topicColorThemes;
    items: T[];
  }>();
  
  content.forEach((item) => {
    item.topics.forEach((topic) => {
      if (!stats.has(topic)) {
        stats.set(topic, {
          count: 0,
          theme: getTopicTheme(topic),
          items: []
        });
      }
      const stat = stats.get(topic)!;
      stat.count++;
      stat.items.push(item);
    });
  });
  
  return stats;
} 