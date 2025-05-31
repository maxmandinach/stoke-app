import React from 'react';
import StokeLogo from '@/components/StokeLogo';
import CircularProgress from '@/components/CircularProgress';
import MemoryWavesLoader from '@/components/MemoryWavesLoader';
import RetentionIndicator from '@/components/RetentionIndicator';

export default function MemoryWavesDemoPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Memory Waves Components</h1>
        <p className="text-slate-600">Showcasing the Stoke design system implementation</p>
      </div>

      {/* Logo Showcase */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Stoke Logo - Memory Waves</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
          <div className="text-center">
            <StokeLogo size="sm" className="text-slate-800 mb-2" />
            <span className="text-sm text-slate-600">Small (20px)</span>
          </div>
          <div className="text-center">
            <StokeLogo size="md" className="text-slate-800 mb-2" />
            <span className="text-sm text-slate-600">Medium (32px)</span>
          </div>
          <div className="text-center">
            <StokeLogo size="lg" className="text-blue-600 mb-2" />
            <span className="text-sm text-slate-600">Large (48px)</span>
          </div>
          <div className="text-center">
            <StokeLogo size="xl" className="text-emerald-600 mb-2" />
            <span className="text-sm text-slate-600">XL (64px)</span>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-medium text-slate-700 mb-2">Color Variations</h3>
          <div className="flex gap-4 items-center">
            <StokeLogo size="lg" className="text-slate-800" />
            <StokeLogo size="lg" className="text-blue-600" />
            <StokeLogo size="lg" className="text-emerald-600" />
            <StokeLogo size="lg" className="text-amber-600" />
          </div>
        </div>
      </section>

      {/* Progress Indicators */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Circular Progress Indicators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
          <div className="text-center">
            <CircularProgress progress={25} size="sm" className="mb-2" />
            <span className="text-sm text-slate-600">25% Small</span>
          </div>
          <div className="text-center">
            <CircularProgress progress={50} size="md" className="mb-2" />
            <span className="text-sm text-slate-600">50% Medium</span>
          </div>
          <div className="text-center">
            <CircularProgress progress={75} size="lg" className="mb-2" />
            <span className="text-sm text-slate-600">75% Large</span>
          </div>
          <div className="text-center">
            <CircularProgress progress={100} size="lg" showPercentage={false} className="mb-2" />
            <span className="text-sm text-slate-600">Complete</span>
          </div>
        </div>
      </section>

      {/* Loading States */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Memory Waves Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <MemoryWavesLoader size="sm" message="Processing..." />
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <MemoryWavesLoader size="md" message="AI analyzing content..." />
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <MemoryWavesLoader size="lg" message="Generating insights..." />
          </div>
        </div>
      </section>

      {/* Retention Indicators */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Knowledge Retention Levels</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <RetentionIndicator level="new" showLabel className="justify-center" />
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <RetentionIndicator level="learning" showLabel className="justify-center" />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <RetentionIndicator level="familiar" showLabel className="justify-center" />
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <RetentionIndicator level="mastered" showLabel className="justify-center" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-slate-700 mb-2">In Context Usage</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700">Introduction to Machine Learning</span>
                <RetentionIndicator level="familiar" showLabel />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700">Advanced Neural Networks</span>
                <RetentionIndicator level="learning" showLabel />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700">Python Basics</span>
                <RetentionIndicator level="mastered" showLabel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Visual Metaphor</h3>
            <p className="text-sm text-slate-600">
              Concentric circles represent knowledge rippling outward from a central insight, 
              embodying gentle retention and mindful technology.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Progressive Opacity</h3>
            <p className="text-sm text-slate-600">
              Each ring uses decreasing opacity (30%, 50%, 70%, 100%) to create visual depth 
              while maintaining the calm, systematic aesthetic.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Scalable Design</h3>
            <p className="text-sm text-slate-600">
              From 16px favicons to 512px app icons, the design maintains clarity and 
              conceptual integrity across all sizes.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Thematic Consistency</h3>
            <p className="text-sm text-slate-600">
              The concentric pattern extends throughout the UI in progress indicators, 
              loading states, and retention visualizations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 