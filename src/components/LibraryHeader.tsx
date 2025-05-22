import React from 'react';

interface LibraryHeaderProps {
  children?: React.ReactNode;
}

export default function LibraryHeader({ children }: LibraryHeaderProps) {
  return (
    <div
      className="library-header flex justify-between items-center mb-6"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <h1 className="text-2xl font-bold text-gray-900" style={{ fontSize: 28, lineHeight: '32px', fontWeight: 600 }}>
        Content Library
      </h1>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
} 