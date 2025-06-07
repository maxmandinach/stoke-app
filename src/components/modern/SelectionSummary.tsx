import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, ArrowRight } from 'lucide-react';

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
  // Don't render if no items selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        // Fixed positioning
        "fixed left-4 right-4 z-30",
        "bottom-24 lg:bottom-6",
        // Enhanced design and animations
        "bg-gradient-to-r from-blue-600 to-blue-700",
        "backdrop-blur-lg border border-blue-500/20",
        "rounded-xl shadow-lg hover:shadow-xl",
        "transition-all duration-300 ease-out",
        "animate-slide-up",
        // Responsive max width
        "max-w-md mx-auto lg:max-w-lg",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${selectedCount} items selected`}
    >
      <div className="flex items-center justify-between p-4">
        {/* Left: Selection count and clear button */}
        <div className="flex items-center gap-3">
          <div className="text-white">
            <span className="text-body font-semibold">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          {onClear && (
            <button
              onClick={onClear}
              className={cn(
                "p-1 rounded-full transition-all duration-200",
                "text-blue-100 hover:text-white hover:bg-white/20",
                "focus-ring-inset",
                "touch-target-sm"
              )}
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Right: Continue button */}
        <Button
          onClick={onContinue}
          className={cn(
            // Enhanced button styling
            "bg-white text-blue-700 hover:bg-blue-50",
            "border-0 shadow-sm hover:shadow-md",
            "font-semibold px-4 py-2 h-auto",
            "transition-all duration-200 ease-out",
            "hover:scale-105 active:scale-95",
            "focus-ring",
            "flex items-center gap-2"
          )}
          aria-label={`Continue with ${selectedCount} selected items`}
        >
          <span className="text-body-sm">Continue</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
      
      {/* Optional progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-xl overflow-hidden">
        <div 
          className="h-full bg-white/40 transition-all duration-500 ease-out"
          style={{ width: `${Math.min((selectedCount / 10) * 100, 100)}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
} 