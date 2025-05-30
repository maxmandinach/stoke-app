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
      className={`fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 ease-out transform ${
        selectedCount > 0 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0'
      } pb-safe`}
    >
      <div className="max-w-sm mx-auto">
        <button
          onClick={onStartReview}
          className="stoke-btn stoke-btn-primary w-full shadow-lg"
          style={{
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          aria-label={`Start review with ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
        >
          <span className="mr-3">Start Review</span>
          <div className="bg-white/20 text-white rounded-full min-w-[28px] h-7 flex items-center justify-center px-2">
            <span className="stoke-small font-semibold">
              {selectedCount}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
} 