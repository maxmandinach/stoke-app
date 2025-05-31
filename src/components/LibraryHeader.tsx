import React from 'react';
import StokeLogo from './StokeLogo';

interface LibraryHeaderProps {
  children?: React.ReactNode;
}

export default function LibraryHeader({ children }: LibraryHeaderProps) {
  return (
    <header
      className="flex justify-between items-center mb-6"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-3">
        <StokeLogo 
          size="lg" 
          className="text-slate-800"
          aria-hidden="true"
        />
        <h1 className="text-[28px] leading-[32px] font-semibold text-slate-800">
          Stoke
        </h1>
      </div>
      {children && (
        <div className="flex gap-2" role="toolbar" aria-label="Content library actions">
          {children}
        </div>
      )}
    </header>
  );
} 