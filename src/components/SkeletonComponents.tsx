import React from 'react';
import MemoryWavesLoader from './MemoryWavesLoader';

// Base skeleton component with shimmer animation
interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div className={`skeleton-shimmer ${className}`}>
      {children}
    </div>
  );
}

// Content card skeleton
interface ContentCardSkeletonProps {
  showHeader?: boolean;
  showMetadata?: boolean;
  lines?: number;
}

export function ContentCardSkeleton({ 
  showHeader = true, 
  showMetadata = true, 
  lines = 3 
}: ContentCardSkeletonProps) {
  return (
    <div 
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 transition-all duration-300 ease-out"
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Header section */}
      {showHeader && (
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="h-5 bg-[#E2E8F0] rounded-md w-3/4" />
          <Skeleton className="h-6 w-16 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]" />
        </div>
      )}
      
      {/* Content lines */}
      <div className="space-y-2 mb-3">
        {[...Array(lines)].map((_, i) => (
          <Skeleton 
            key={i}
            className={`h-4 bg-[#F8FAFC] rounded ${
              i === lines - 1 ? 'w-2/3' : 'w-full'
            }`} 
          />
        ))}
      </div>
      
      {/* Metadata section */}
      {showMetadata && (
        <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 bg-[#E2E8F0] rounded-full" />
            <Skeleton className="h-3 w-20 bg-[#F8FAFC] rounded" />
          </div>
          <Skeleton className="h-4 w-16 bg-[#F8FAFC] rounded" />
        </div>
      )}
    </div>
  );
}

// Text block skeleton
interface TextBlockSkeletonProps {
  lines?: number;
  showTitle?: boolean;
  titleWidth?: string;
}

export function TextBlockSkeleton({ 
  lines = 3, 
  showTitle = false, 
  titleWidth = 'w-1/2' 
}: TextBlockSkeletonProps) {
  return (
    <div className="space-y-3">
      {showTitle && (
        <Skeleton className={`h-6 bg-[#E2E8F0] rounded-md ${titleWidth}`} />
      )}
      <div className="space-y-2">
        {[...Array(lines)].map((_, i) => (
          <Skeleton 
            key={i}
            className={`h-4 bg-[#F8FAFC] rounded ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            }`} 
          />
        ))}
      </div>
    </div>
  );
}

// Avatar/Image skeleton
interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square' | 'rounded';
}

export function AvatarSkeleton({ size = 'md', shape = 'circle' }: AvatarSkeletonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg'
  };
  
  return (
    <Skeleton 
      className={`${sizeClasses[size]} ${shapeClasses[shape]} bg-[#E2E8F0] flex-shrink-0`} 
    />
  );
}

// List item skeleton
interface ListItemSkeletonProps {
  showAvatar?: boolean;
  showSecondaryText?: boolean;
  showAction?: boolean;
}

export function ListItemSkeleton({ 
  showAvatar = true, 
  showSecondaryText = true, 
  showAction = false 
}: ListItemSkeletonProps) {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-[#F1F5F9] last:border-b-0">
      {showAvatar && <AvatarSkeleton size="md" />}
      
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 bg-[#E2E8F0] rounded w-3/4" />
        {showSecondaryText && (
          <Skeleton className="h-3 bg-[#F8FAFC] rounded w-1/2" />
        )}
      </div>
      
      {showAction && (
        <Skeleton className="h-8 w-8 bg-[#F8FAFC] rounded" />
      )}
    </div>
  );
}

// List skeleton
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showSecondaryText?: boolean;
  showAction?: boolean;
  className?: string;
}

export function ListSkeleton({ 
  items = 3, 
  showAvatar = true, 
  showSecondaryText = true, 
  showAction = false,
  className = ''
}: ListSkeletonProps) {
  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-xl overflow-hidden ${className}`}>
      {[...Array(items)].map((_, i) => (
        <ListItemSkeleton 
          key={i}
          showAvatar={showAvatar}
          showSecondaryText={showSecondaryText}
          showAction={showAction}
        />
      ))}
    </div>
  );
}

// Header skeleton
export function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {/* Memory Waves logo placeholder */}
        <div className="w-12 h-12 relative">
          <svg width="48" height="48" viewBox="0 0 40 40" className="opacity-20">
            <circle cx="20" cy="20" r="12" fill="none" stroke="#E2E8F0" strokeWidth="2" opacity="0.3"/>
            <circle cx="20" cy="20" r="8" fill="none" stroke="#E2E8F0" strokeWidth="2" opacity="0.5"/>
            <circle cx="20" cy="20" r="4" fill="none" stroke="#E2E8F0" strokeWidth="2" opacity="0.7"/>
            <circle cx="20" cy="20" r="2" fill="#E2E8F0"/>
          </svg>
        </div>
        {/* Stoke wordmark placeholder */}
        <Skeleton className="h-8 bg-[#E2E8F0] rounded-lg w-20" />
      </div>
      <Skeleton className="h-9 w-9 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]" />
    </div>
  );
}

// Button skeleton
interface ButtonSkeletonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  width?: string;
}

export function ButtonSkeleton({ 
  variant = 'primary', 
  size = 'md',
  width = 'w-full'
}: ButtonSkeletonProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-12'
  };
  
  const bgColor = variant === 'primary' ? 'bg-[#E2E8F0]' : 'bg-[#F8FAFC]';
  
  return (
    <Skeleton 
      className={`${sizeClasses[size]} ${width} ${bgColor} rounded-lg border border-[#E2E8F0]`} 
    />
  );
}

// Page skeleton - combines multiple skeleton components
interface PageSkeletonProps {
  showHeader?: boolean;
  cardCount?: number;
  showButton?: boolean;
  detailed?: boolean;
}

export function PageSkeleton({ 
  showHeader = true, 
  cardCount = 3, 
  showButton = true,
  detailed = true
}: PageSkeletonProps) {
  return (
    <div className="px-4 pt-4 pb-[84px] bg-white min-h-screen">
      <div className="space-y-6">
        {showHeader && <HeaderSkeleton />}
        
        <div className="space-y-4">
          {[...Array(cardCount)].map((_, i) => (
            detailed ? (
              <ContentCardDetailedSkeleton key={i} />
            ) : (
              <ContentCardSkeleton key={i} />
            )
          ))}
        </div>
        
        {showButton && (
          <div className="pt-4">
            <ButtonSkeleton variant="primary" />
          </div>
        )}
      </div>
    </div>
  );
}

// Grid skeleton for responsive layouts
interface GridSkeletonProps {
  items?: number;
  columns?: number;
  cardType?: 'content' | 'simple';
}

export function GridSkeleton({ 
  items = 6, 
  columns = 2, 
  cardType = 'content' 
}: GridSkeletonProps) {
  return (
    <div 
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {[...Array(items)].map((_, i) => (
        <div key={i}>
          {cardType === 'content' ? (
            <ContentCardSkeleton lines={2} showMetadata={false} />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
              <AvatarSkeleton size="lg" shape="rounded" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 bg-[#E2E8F0] rounded w-full" />
                <Skeleton className="h-3 bg-[#F8FAFC] rounded w-3/4" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Loading state with transition
interface LoadingTransitionProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LoadingTransition({ 
  isLoading, 
  skeleton, 
  children, 
  className = '' 
}: LoadingTransitionProps) {
  return (
    <div className={`loading-transition ${className}`}>
      <div 
        className={`transition-opacity duration-500 ease-out ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
        }`}
      >
        {skeleton}
      </div>
      <div 
        className={`transition-opacity duration-500 ease-out delay-200 ${
          isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Detailed content card skeleton that matches actual content card structure
export function ContentCardDetailedSkeleton() {
  return (
    <div 
      className="bg-white border border-[#E2E8F0] rounded-xl p-4 transition-all duration-300 ease-out"
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Header section */}
      <div className="mb-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-6 bg-[#E2E8F0] rounded-md w-3/4" />
            <Skeleton className="h-4 w-12 bg-[#F8FAFC] rounded border border-[#E2E8F0]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 bg-[#F8FAFC] rounded" />
            <Skeleton className="h-6 w-6 bg-[#F8FAFC] rounded" />
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-16 bg-[#F8FAFC] rounded border border-[#E2E8F0]" />
          <Skeleton className="h-3 w-20 bg-[#F8FAFC] rounded" />
          <Skeleton className="h-3 w-24 bg-[#F8FAFC] rounded" />
        </div>
        
        {/* Summary */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 bg-[#F8FAFC] rounded w-full" />
          <Skeleton className="h-4 bg-[#F8FAFC] rounded w-5/6" />
          <Skeleton className="h-4 bg-[#F8FAFC] rounded w-3/4" />
        </div>
        
        {/* Topics */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 bg-[#F8FAFC] rounded-full border border-[#E2E8F0]" />
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-[#F1F5F9]" />

      {/* Insights section */}
      <div className="pt-3">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 bg-[#E2E8F0] rounded w-24" />
          <Skeleton className="h-6 w-20 bg-[#F8FAFC] rounded" />
        </div>
        
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="pl-3 bg-[#FAFAFA] rounded" style={{ borderLeft: '3px solid #E2E8F0' }}>
              <div className="py-2 space-y-2">
                <Skeleton className="h-3 bg-[#F8FAFC] rounded w-full" />
                <Skeleton className="h-3 bg-[#F8FAFC] rounded w-4/5" />
                <div className="flex items-center gap-1 pt-1">
                  <Skeleton className="h-2 w-2 bg-[#E2E8F0] rounded-full" />
                  <Skeleton className="h-3 w-16 bg-[#F8FAFC] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Processing skeleton for when AI is working
interface ProcessingSkeletonProps {
  title?: string;
  status?: string;
}

export function ProcessingSkeleton({ 
  title = "Processing content...", 
  status = "AI is analyzing your content" 
}: ProcessingSkeletonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Memory Waves loading animation */}
        <MemoryWavesLoader size="lg" message="" />
        
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#1E293B]">
            {title}
          </h2>
          <p className="text-[#64748B] text-sm">
            {status}
          </p>
        </div>
        
        {/* Progress indication */}
        <div className="w-full">
          <div className="w-full bg-[#F1F5F9] rounded-full h-2 mb-4">
            <div 
              className="bg-[#2563EB] h-2 rounded-full transition-all duration-1000 ease-out animate-pulse"
              style={{ width: '45%' }}
            />
          </div>
          <p className="text-xs text-[#94A3B8] animate-pulse">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

// Inline processing indicator
interface InlineProcessingProps {
  text?: string;
  size?: 'sm' | 'md';
}

export function InlineProcessing({ text = "Processing...", size = 'md' }: InlineProcessingProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm'
  };
  
  return (
    <div className={`flex items-center gap-2 text-[#7C3AED] ${sizeClasses[size]}`}>
      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span>{text}</span>
    </div>
  );
} 