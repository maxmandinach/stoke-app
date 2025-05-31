import React from 'react';

interface RetentionIndicatorProps {
  level: 'new' | 'learning' | 'familiar' | 'mastered';
  size?: 'sm' | 'md';
  className?: string;
  showLabel?: boolean;
}

export default function RetentionIndicator({ 
  level, 
  size = 'sm', 
  className = '',
  showLabel = false
}: RetentionIndicatorProps) {
  const config = {
    new: { 
      rings: 1, 
      color: '#94A3B8', 
      label: 'New',
      bgColor: '#F8FAFC'
    },
    learning: { 
      rings: 2, 
      color: '#F59E0B', 
      label: 'Learning',
      bgColor: '#FEF3C7'
    },
    familiar: { 
      rings: 3, 
      color: '#2563EB', 
      label: 'Familiar',
      bgColor: '#EFF6FF'
    },
    mastered: { 
      rings: 4, 
      color: '#059669', 
      label: 'Mastered',
      bgColor: '#ECFDF5'
    }
  };

  const dimensions = size === 'sm' ? 20 : 28;
  const { rings, color, label, bgColor } = config[level];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <svg
          width={dimensions}
          height={dimensions}
          viewBox="0 0 40 40"
          aria-label={`Knowledge retention: ${level}`}
        >
          {/* Center dot - always present */}
          <circle cx="20" cy="20" r="2" fill={color} />
          
          {/* Progressive rings based on retention level */}
          {rings >= 2 && (
            <circle 
              cx="20" 
              cy="20" 
              r="6" 
              fill="none" 
              stroke={color} 
              strokeWidth="1.5" 
              opacity="0.7" 
            />
          )}
          {rings >= 3 && (
            <circle 
              cx="20" 
              cy="20" 
              r="10" 
              fill="none" 
              stroke={color} 
              strokeWidth="1.5" 
              opacity="0.5" 
            />
          )}
          {rings >= 4 && (
            <circle 
              cx="20" 
              cy="20" 
              r="14" 
              fill="none" 
              stroke={color} 
              strokeWidth="1.5" 
              opacity="0.3" 
            />
          )}
        </svg>
      </div>
      
      {showLabel && (
        <span 
          className="text-xs font-medium px-2 py-1 rounded-md"
          style={{ 
            color: color,
            backgroundColor: bgColor
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
} 