'use client';

import { useEffect, useState } from 'react';

interface StartReviewButtonProps {
  selectedCount: number;
  onStartReview: () => void;
}

export default function StartReviewButton({ selectedCount, onStartReview }: StartReviewButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(selectedCount > 0);
  }, [selectedCount]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-[76px] left-0 right-0 z-40 px-4 pb-4 transition-all duration-300 ease-out transform ${
        selectedCount > 0 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0'
      }`}
      style={{
        paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`
      }}
    >
      <button
        onClick={onStartReview}
        className="w-full bg-[#2563EB] text-white rounded-lg font-medium text-[16px] leading-[24px] transition-all duration-200 ease-out hover:bg-[#1D4ED8] hover:-translate-y-0.5 active:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 shadow-lg"
        style={{
          minHeight: '44px',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        aria-label={`Start review with ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
      >
        <div className="flex items-center justify-center gap-2 py-3 px-4">
          <span>Start Review</span>
          <div className="bg-white/20 text-white rounded-full min-w-[24px] h-6 flex items-center justify-center px-2">
            <span className="text-[14px] leading-[16px] font-semibold">
              {selectedCount}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
} 