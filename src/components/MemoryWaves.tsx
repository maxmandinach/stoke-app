import React from 'react';

type MemoryWavesSize = 16 | 20 | 24 | 32 | 48 | 64 | 96 | 128 | 256 | 512;

interface MemoryWavesProps {
  size?: MemoryWavesSize;
  variant?: 'static' | 'ripple' | 'pulse' | 'progressive';
  className?: string;
  color?: string;
  animate?: boolean;
  progress?: number; // 0-1 for progressive variant
  speed?: 'slow' | 'normal' | 'fast';
}

export default function MemoryWaves({ 
  size = 32, 
  variant = 'static',
  className = '',
  color = 'currentColor',
  animate = false,
  progress = 0,
  speed = 'normal'
}: MemoryWavesProps) {
  const animationDuration = {
    slow: '3s',
    normal: '2s',
    fast: '1.5s'
  };

  const baseProps = {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    className: `memory-waves ${className}`,
    role: "img",
    "aria-label": "Memory waves representing knowledge retention"
  };

  const renderCircles = () => {
    const circles = [
      { r: 12, opacity: 0.3, delay: '0s' },
      { r: 8, opacity: 0.5, delay: '0.5s' },
      { r: 4, opacity: 0.7, delay: '1s' },
    ];

    return (
      <>
        {circles.map((circle, index) => {
          let circleOpacity = circle.opacity;
          
          // Progressive variant: show circles based on progress
          if (variant === 'progressive') {
            const threshold = (index + 1) / 4; // 0.25, 0.5, 0.75
            circleOpacity = progress >= threshold ? circle.opacity : 0.1;
          }

          return (
            <circle
              key={index}
              cx="20"
              cy="20"
              r={circle.r}
              fill="none"
              stroke={color}
              strokeWidth="2"
              opacity={circleOpacity}
              style={animate && variant === 'ripple' ? {
                animation: `memory-ripple ${animationDuration[speed]} ease-out infinite`,
                animationDelay: circle.delay
              } : undefined}
              className={variant === 'pulse' && animate ? 'animate-pulse-slow' : ''}
            />
          );
        })}
        
        {/* Center dot - always visible */}
        <circle
          cx="20"
          cy="20"
          r="2"
          fill={color}
          opacity={variant === 'progressive' ? (progress >= 1 ? 1 : 0.3) : 1}
          className={variant === 'pulse' && animate ? 'animate-pulse-slow' : ''}
        />
      </>
    );
  };

  return (
    <svg {...baseProps}>
      {renderCircles()}
    </svg>
  );
}

// Preset size components for common use cases
export function MemoryWavesFavicon(props: Omit<MemoryWavesProps, 'size'>) {
  return <MemoryWaves size={16} {...props} />;
}

export function MemoryWavesIcon(props: Omit<MemoryWavesProps, 'size'>) {
  return <MemoryWaves size={24} {...props} />;
}

export function MemoryWavesLogo(props: Omit<MemoryWavesProps, 'size'>) {
  return <MemoryWaves size={48} {...props} />;
}

export function MemoryWavesHero(props: Omit<MemoryWavesProps, 'size'>) {
  return <MemoryWaves size={96} {...props} />;
}

// Loading component with ripple animation
export function MemoryWavesLoader({ 
  size = 48, 
  className = '',
  text = "Processing knowledge..."
}: {
  size?: MemoryWavesSize;
  className?: string;
  text?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <MemoryWaves 
        size={size} 
        variant="ripple" 
        animate={true}
        color="var(--stoke-primary-blue)"
        speed="normal"
      />
      {text && (
        <p className="stoke-caption text-center animate-pulse-slow">
          {text}
        </p>
      )}
    </div>
  );
}

// Progress indicator using Memory Waves
export function MemoryWavesProgress({ 
  progress,
  size = 32,
  showPercentage = false,
  className = ''
}: {
  progress: number; // 0-1
  size?: MemoryWavesSize;
  showPercentage?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <MemoryWaves 
        size={size}
        variant="progressive"
        progress={progress}
        color="var(--stoke-primary-blue)"
      />
      {showPercentage && (
        <span className="stoke-caption font-medium">
          {Math.round(progress * 100)}%
        </span>
      )}
    </div>
  );
} 