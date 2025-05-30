import React from 'react';
import {
  Skeleton,
  ContentCardSkeleton,
  ContentCardDetailedSkeleton,
  TextBlockSkeleton,
  AvatarSkeleton,
  ListSkeleton,
  HeaderSkeleton,
  ButtonSkeleton,
  ProcessingSkeleton,
  InlineProcessing,
  GridSkeleton,
  LoadingTransition
} from '@/components/SkeletonComponents';

export default function SkeletonDemo() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6 space-y-12">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Skeleton Components Demo</h1>
          <p className="text-[#64748B]">Showcase of all available loading states with shimmer animations</p>
        </div>

        {/* Basic Skeleton */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Basic Skeleton Elements</h2>
          <div className="space-y-4 p-6 bg-[#F8FAFC] rounded-xl">
            <Skeleton className="h-4 bg-[#E2E8F0] rounded w-3/4" />
            <Skeleton className="h-4 bg-[#F8FAFC] rounded w-1/2" />
            <Skeleton className="h-8 bg-[#E2E8F0] rounded w-1/4" />
          </div>
        </section>

        {/* Avatars */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Avatar Skeletons</h2>
          <div className="flex items-center gap-4 p-6 bg-[#F8FAFC] rounded-xl">
            <AvatarSkeleton size="sm" shape="circle" />
            <AvatarSkeleton size="md" shape="circle" />
            <AvatarSkeleton size="lg" shape="circle" />
            <AvatarSkeleton size="xl" shape="circle" />
          </div>
          <div className="flex items-center gap-4 p-6 bg-[#F8FAFC] rounded-xl mt-4">
            <AvatarSkeleton size="sm" shape="rounded" />
            <AvatarSkeleton size="md" shape="rounded" />
            <AvatarSkeleton size="lg" shape="rounded" />
            <AvatarSkeleton size="xl" shape="rounded" />
          </div>
        </section>

        {/* Text Blocks */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Text Block Skeletons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#F8FAFC] rounded-xl">
              <h3 className="text-sm font-medium text-[#64748B] mb-3">Basic Text Block</h3>
              <TextBlockSkeleton lines={3} />
            </div>
            <div className="p-6 bg-[#F8FAFC] rounded-xl">
              <h3 className="text-sm font-medium text-[#64748B] mb-3">With Title</h3>
              <TextBlockSkeleton lines={4} showTitle={true} titleWidth="w-3/4" />
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Button Skeletons</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-[#F8FAFC] rounded-xl">
            <ButtonSkeleton variant="primary" size="sm" width="w-24" />
            <ButtonSkeleton variant="primary" size="md" width="w-32" />
            <ButtonSkeleton variant="primary" size="lg" width="w-40" />
            <ButtonSkeleton variant="secondary" size="md" width="w-32" />
          </div>
        </section>

        {/* Lists */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">List Skeletons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-[#64748B] mb-3">With Avatars</h3>
              <ListSkeleton items={3} showAvatar={true} showSecondaryText={true} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#64748B] mb-3">With Actions</h3>
              <ListSkeleton items={3} showAvatar={true} showAction={true} />
            </div>
          </div>
        </section>

        {/* Content Cards */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Content Card Skeletons</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-[#64748B] mb-3">Basic Content Card</h3>
              <ContentCardSkeleton />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#64748B] mb-3">Detailed Content Card</h3>
              <ContentCardDetailedSkeleton />
            </div>
          </div>
        </section>

        {/* Processing States */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Processing States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-[#64748B] mb-3">Processing Skeleton</h3>
              <ProcessingSkeleton 
                title="Analyzing content..." 
                status="AI is extracting insights and topics" 
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#64748B] mb-3">Inline Processing</h3>
                <div className="p-4 bg-[#F8FAFC] rounded-xl">
                  <InlineProcessing text="Processing..." size="md" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#64748B] mb-3">Small Inline Processing</h3>
                <div className="p-4 bg-[#F8FAFC] rounded-xl">
                  <InlineProcessing text="Loading..." size="sm" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Layout */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Grid Skeleton</h2>
          <GridSkeleton items={4} columns={2} cardType="content" />
        </section>

        {/* Header */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Header Skeleton</h2>
          <div className="p-6 bg-[#F8FAFC] rounded-xl">
            <HeaderSkeleton />
          </div>
        </section>

        {/* Loading Transition Example */}
        <section>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Loading Transition</h2>
          <p className="text-[#64748B] mb-4">
            This demonstrates the smooth transition between loading and loaded states.
          </p>
          <div className="p-6 bg-[#F8FAFC] rounded-xl">
            <LoadingTransition
              isLoading={false}
              skeleton={<ContentCardSkeleton />}
              children={
                <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl">
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-2">Loaded Content</h3>
                  <p className="text-[#64748B]">This content appears with a smooth transition after loading completes.</p>
                </div>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
} 