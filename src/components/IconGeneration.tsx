import React from 'react';

// Icon generation utility for PWA and app icons
interface IconGenerationPropsString {
  size: number;
  backgroundColor?: string;
  logoColor?: string;
  format: 'svg';
}

interface IconGenerationPropsComponent {
  size: number;
  backgroundColor?: string;
  logoColor?: string;
  format: 'component';
}

// Overloaded function signatures
export function generateMemoryWavesIcon(props: IconGenerationPropsString): string;
export function generateMemoryWavesIcon(props: IconGenerationPropsComponent): React.ReactElement;
export function generateMemoryWavesIcon({
  size,
  backgroundColor = '#FFFFFF',
  logoColor = '#2563EB',
  format = 'svg'
}: IconGenerationPropsString | IconGenerationPropsComponent): string | React.ReactElement {
  const padding = Math.max(size * 0.15, 4); // 15% padding, minimum 4px
  const logoSize = size - (padding * 2);
  const center = size / 2;
  const logoCenter = logoSize / 2;
  
  // Scale the Memory Waves proportionally
  const scale = logoSize / 40; // Based on 40x40 viewBox
  const strokeWidth = Math.max(2 * scale, 1);
  
  const circles = [
    { r: 12 * scale, opacity: 0.3 },
    { r: 8 * scale, opacity: 0.5 },
    { r: 4 * scale, opacity: 0.7 },
  ];
  
  const centerDotRadius = 2 * scale;

  if (format === 'svg') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size * 0.1}"/>
        <g transform="translate(${center - logoCenter}, ${center - logoCenter})">
          ${circles.map(circle => 
            `<circle cx="${logoCenter}" cy="${logoCenter}" r="${circle.r}" fill="none" stroke="${logoColor}" stroke-width="${strokeWidth}" opacity="${circle.opacity}"/>`
          ).join('')}
          <circle cx="${logoCenter}" cy="${logoCenter}" r="${centerDotRadius}" fill="${logoColor}"/>
        </g>
      </svg>
    `.trim();
  }

  // React component format
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={backgroundColor} rx={size * 0.1} />
      <g transform={`translate(${center - logoCenter}, ${center - logoCenter})`}>
        {circles.map((circle, index) => (
          <circle
            key={index}
            cx={logoCenter}
            cy={logoCenter}
            r={circle.r}
            fill="none"
            stroke={logoColor}
            strokeWidth={strokeWidth}
            opacity={circle.opacity}
          />
        ))}
        <circle
          cx={logoCenter}
          cy={logoCenter}
          r={centerDotRadius}
          fill={logoColor}
        />
      </g>
    </svg>
  );
}

// Standard PWA icon sizes
export const PWA_ICON_SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 192, 256, 384, 512];

// Generate all PWA icons as SVG strings
export function generateAllPWAIcons(
  backgroundColor = '#FFFFFF',
  logoColor = '#2563EB'
) {
  return PWA_ICON_SIZES.reduce((acc, size) => {
    acc[size] = generateMemoryWavesIcon({ 
      size, 
      backgroundColor, 
      logoColor, 
      format: 'svg' 
    });
    return acc;
  }, {} as Record<number, string>);
}

// React components for specific sizes
export function AppIcon16(props: { className?: string }) {
  return (
    <div className={props.className}>
      {generateMemoryWavesIcon({ size: 16, format: 'component' })}
    </div>
  );
}

export function AppIcon32(props: { className?: string }) {
  return (
    <div className={props.className}>
      {generateMemoryWavesIcon({ size: 32, format: 'component' })}
    </div>
  );
}

export function AppIcon192(props: { className?: string }) {
  return (
    <div className={props.className}>
      {generateMemoryWavesIcon({ size: 192, format: 'component' })}
    </div>
  );
}

export function AppIcon512(props: { className?: string }) {
  return (
    <div className={props.className}>
      {generateMemoryWavesIcon({ size: 512, format: 'component' })}
    </div>
  );
}

// Splash screen variant with larger Memory Waves
export function SplashScreenLogo({ 
  size = 128, 
  animate = false,
  className = '' 
}: { 
  size?: number; 
  animate?: boolean;
  className?: string;
}) {
  const animationClass = animate ? 'memory-waves-formation' : '';
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={animationClass}>
        {generateMemoryWavesIcon({ 
          size, 
          backgroundColor: 'transparent',
          format: 'component' 
        })}
      </div>
      <h1 className="stoke-display mt-6 text-center">Stoke</h1>
      <p className="stoke-caption mt-2 text-center text-stoke-soft-gray">
        Mindful knowledge retention
      </p>
    </div>
  );
} 