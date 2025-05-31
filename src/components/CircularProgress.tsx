import React from 'react';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPercentage?: boolean;
}

export default function CircularProgress({ 
  progress, 
  size = 'md', 
  className = '',
  showPercentage = true
}: CircularProgressProps) {
  const dimensions = {
    sm: { size: 32, strokeWidth: 3, radius: 12, fontSize: 'text-xs' },
    md: { size: 48, strokeWidth: 4, radius: 18, fontSize: 'text-sm' },
    lg: { size: 64, strokeWidth: 5, radius: 25, fontSize: 'text-base' }
  };
  
  const { size: svgSize, strokeWidth, radius, fontSize } = dimensions[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg width={svgSize} height={svgSize} className="transform -rotate-90">
        {/* Background circle - subtle outline following Memory Waves pattern */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          opacity="0.3"
        />
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="#2563EB"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {/* Center content */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${fontSize} font-medium text-slate-600`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
} 