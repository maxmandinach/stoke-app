import React from 'react';

interface MemoryWavesLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export default function MemoryWavesLoader({ 
  size = 'md', 
  className = '',
  message = 'Processing...'
}: MemoryWavesLoaderProps) {
  const dimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <svg
          width={dimensions[size].width}
          height={dimensions[size].height}
          viewBox="0 0 40 40"
          className="animate-pulse"
        >
          {/* Outer circle with delayed animation */}
          <circle
            cx="20"
            cy="20"
            r="12"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            opacity="0.3"
            className="animate-ping"
            style={{ 
              animationDelay: '0ms', 
              animationDuration: '2s',
              animationIterationCount: 'infinite'
            }}
          />
          {/* Second circle */}
          <circle
            cx="20"
            cy="20"
            r="8"
            fill="none"
            stroke="#64748B"
            strokeWidth="2"
            opacity="0.5"
            className="animate-ping"
            style={{ 
              animationDelay: '200ms', 
              animationDuration: '2s',
              animationIterationCount: 'infinite'
            }}
          />
          {/* Third circle */}
          <circle
            cx="20"
            cy="20"
            r="4"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            opacity="0.7"
            className="animate-ping"
            style={{ 
              animationDelay: '400ms', 
              animationDuration: '2s',
              animationIterationCount: 'infinite'
            }}
          />
          {/* Center dot with gentle pulse */}
          <circle
            cx="20"
            cy="20"
            r="2"
            fill="#2563EB"
            className="animate-pulse"
            style={{ 
              animationDuration: '1.5s',
              animationIterationCount: 'infinite'
            }}
          />
        </svg>
      </div>
      {message && (
        <p className="text-sm text-slate-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
} 