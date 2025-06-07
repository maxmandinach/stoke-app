import React from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

interface SelectionSummaryProps {
  selectedCount: number;
  onContinue: () => void;
  onClear?: () => void;
}

export default function SelectionSummary({ selectedCount, onContinue, onClear }: SelectionSummaryProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 right-4 z-50 animate-slide-up">
      <div className="max-w-lg mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl border border-blue-500/30 backdrop-blur-md overflow-hidden">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/30">
          <div 
            className="h-full bg-gradient-to-r from-white/40 to-white/60 transition-all duration-500 ease-out"
            style={{ width: `${Math.min((selectedCount / 10) * 100, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">
                {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'} Selected
              </p>
              <p className="text-blue-100 text-sm font-medium">
                Ready to begin your learning journey?
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onClear && (
              <button
                onClick={onClear}
                className="flex items-center justify-center w-10 h-10 text-blue-200 hover:text-white hover:bg-white/20 transition-all duration-200 rounded-xl backdrop-blur-sm"
                aria-label="Clear selection"
              >
                <X size={20} />
              </button>
            )}
            
            <button
              onClick={onContinue}
              className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 