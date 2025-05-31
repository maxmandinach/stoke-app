import React from 'react';

interface StokeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

export default function StokeLogo({ 
  size = 'md', 
  className = '',
  color = 'currentColor' 
}: StokeLogoProps) {
  const dimensions = {
    sm: { width: 20, height: 20, viewBox: "0 0 40 40" },
    md: { width: 32, height: 32, viewBox: "0 0 40 40" },
    lg: { width: 48, height: 48, viewBox: "0 0 40 40" },
    xl: { width: 64, height: 64, viewBox: "0 0 40 40" }
  };

  const { width, height, viewBox } = dimensions[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label="Stoke logo - Memory waves representing knowledge retention"
    >
      {/* Outer circle - 30% opacity */}
      <circle
        cx="20"
        cy="20"
        r="12"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
      {/* Second circle - 50% opacity */}
      <circle
        cx="20"
        cy="20"
        r="8"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.5"
      />
      {/* Third circle - 70% opacity */}
      <circle
        cx="20"
        cy="20"
        r="4"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.7"
      />
      {/* Center dot - 100% opacity */}
      <circle
        cx="20"
        cy="20"
        r="2"
        fill={color}
        opacity="1"
      />
    </svg>
  );
} 