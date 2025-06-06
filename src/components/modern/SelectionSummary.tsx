import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SelectionSummaryProps {
  selectedCount: number;
  onContinue: () => void;
  onClear?: () => void;
  className?: string;
}

export default function SelectionSummary({
  selectedCount,
  onContinue,
  onClear,
  className
}: SelectionSummaryProps) {
  const isVisible = selectedCount > 0

  return (
    <div 
      className={cn(
        // Base positioning
        "fixed left-4 right-4 z-50",
        // Responsive bottom positioning
        "bottom-20 lg:bottom-6", // 80px on mobile (above bottom nav), 24px on desktop
        // Center horizontally with max width
        "mx-auto max-w-md",
        // Animation classes
        "transition-all duration-300 ease-in-out",
        // Visibility and transform based on selection
        isVisible 
          ? "translate-y-0 opacity-100 pointer-events-auto" 
          : "translate-y-full opacity-0 pointer-events-none",
        className
      )}
    >
      <div className={cn(
        // Background and styling
        "bg-blue-600 text-white rounded-2xl shadow-2xl",
        // Layout
        "flex items-center justify-between px-4 py-3",
        // Backdrop blur for modern effect
        "backdrop-blur-sm",
        // Border for extra definition
        "border border-blue-500/20"
      )}>
        {/* Left side - Selection count */}
        <div className="flex items-center gap-3">
          {/* Clear button (if provided) */}
          {onClear && (
            <button
              onClick={onClear}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                "bg-white/20 hover:bg-white/30 active:bg-white/40",
                "transition-colors duration-200",
                "text-white hover:text-white"
              )}
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Selection count text */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <span className="text-xs text-blue-100 opacity-90">
              Ready to continue
            </span>
          </div>
        </div>

        {/* Right side - Continue button */}
        <Button
          onClick={onContinue}
          className={cn(
            // Override default button styles
            "bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100",
            "font-semibold text-sm px-6 py-2.5 h-auto",
            "rounded-xl shadow-sm hover:shadow-md",
            "transition-all duration-200",
            "border-0 hover:scale-105 active:scale-95"
          )}
        >
          Continue
        </Button>
      </div>

      {/* Optional floating indicator dot */}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      </div>
    </div>
  )
} 