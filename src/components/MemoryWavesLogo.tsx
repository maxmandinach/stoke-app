import { cn } from "@/lib/utils"

interface MemoryWavesLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12", 
  lg: "w-16 h-16",
  xl: "w-24 h-24"
}

export function MemoryWavesLogo({ 
  size = "md", 
  animated = false,
  className 
}: MemoryWavesLogoProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        aria-label="Memory Waves - Knowledge Learning Platform"
      >
        {/* Concentric circles representing rippling knowledge */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="hsl(var(--memory-primary))"
          className={animated ? "animate-pulse" : ""}
        />
        <circle
          cx="50"
          cy="50"
          r="18"
          fill="none"
          stroke="hsl(var(--memory-primary))"
          strokeWidth="2"
          opacity="0.7"
          className={animated ? "memory-ripple" : ""}
          style={animated ? { animationDelay: "0.3s" } : {}}
        />
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="none"
          stroke="hsl(var(--memory-primary))"
          strokeWidth="1.5"
          opacity="0.5"
          className={animated ? "memory-ripple" : ""}
          style={animated ? { animationDelay: "0.6s" } : {}}
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="hsl(var(--memory-primary))"
          strokeWidth="1"
          opacity="0.3"
          className={animated ? "memory-ripple" : ""}
          style={animated ? { animationDelay: "0.9s" } : {}}
        />
      </svg>
      
      {/* Accessibility text */}
      <span className="sr-only">Memory Waves</span>
    </div>
  )
} 