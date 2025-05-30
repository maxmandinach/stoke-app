import React from 'react';

interface LibraryHeaderProps {
  children?: React.ReactNode;
}

export default function LibraryHeader({ children }: LibraryHeaderProps) {
  return (
    <header
      className="flex justify-between items-center mb-6"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <h1 className="text-[28px] leading-[32px] font-semibold text-slate-800">
        Content Library
      </h1>
      {children && (
        <div className="flex gap-2" role="toolbar" aria-label="Content library actions">
          {children}
        </div>
      )}
    </header>
  );
} 