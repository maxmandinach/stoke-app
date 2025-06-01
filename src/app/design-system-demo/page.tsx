'use client';

import React, { useState } from 'react';
import MemoryWaves, { 
  MemoryWavesFavicon, 
  MemoryWavesIcon, 
  MemoryWavesLogo, 
  MemoryWavesHero,
  MemoryWavesLoader,
  MemoryWavesProgress 
} from '@/components/MemoryWaves';
import {
  DesignSystemProvider,
  Button,
  Card,
  Input,
  ProgressRing,
  TopicTag,
  LoadingSpinner,
  Header,
  SelectionCounter
} from '@/components/DesignSystem';
import { SplashScreenLogo } from '@/components/IconGeneration';

export default function DesignSystemDemo() {
  const [progress, setProgress] = useState(0.7);
  const [selectedCount, setSelectedCount] = useState(3);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <DesignSystemProvider>
      <div className="min-h-screen bg-stoke-light-gray">
        <div className="stoke-container py-8">
          <Header 
            title="Memory Waves Design System"
            subtitle="Mindful utility through purposeful design"
            showLogo={true}
            className="mb-8"
          />

          {/* Logo Variants Section */}
          <Card className="mb-8 p-6">
            <h2 className="stoke-title mb-6">Memory Waves Logo Variants</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="flex flex-col items-center space-y-2">
                <MemoryWavesFavicon />
                <span className="stoke-small">Favicon (16px)</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <MemoryWavesIcon />
                <span className="stoke-small">Icon (24px)</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <MemoryWavesLogo />
                <span className="stoke-small">Logo (48px)</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <MemoryWavesHero />
                <span className="stoke-small">Hero (96px)</span>
              </div>
            </div>
            
            <h3 className="stoke-subtitle mb-4">Animation Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center space-y-2">
                <MemoryWaves size={48} variant="static" />
                <span className="stoke-small">Static</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <MemoryWaves size={48} variant="ripple" animate={true} />
                <span className="stoke-small">Ripple</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <MemoryWaves size={48} variant="pulse" animate={true} />
                <span className="stoke-small">Pulse</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <MemoryWaves size={48} variant="progressive" progress={progress} />
                <span className="stoke-small">Progressive</span>
              </div>
            </div>
          </Card>

          {/* Interactive Components */}
          <Card className="mb-8 p-6">
            <h2 className="stoke-title mb-6">Interactive Components</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Buttons */}
              <div>
                <h3 className="stoke-subtitle mb-4">Buttons</h3>
                <div className="space-y-3">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Secondary Action</Button>
                  <Button variant="tertiary">Tertiary Action</Button>
                  <Button 
                    variant="primary" 
                    loading={isLoading}
                    onClick={handleLoadingDemo}
                  >
                    {isLoading ? 'Processing...' : 'Test Loading State'}
                  </Button>
                </div>
              </div>

              {/* Progress Indicators */}
              <div>
                <h3 className="stoke-subtitle mb-4">Progress Indicators</h3>
                <div className="space-y-4">
                  <ProgressRing progress={progress} showLabel={true} />
                  <MemoryWavesProgress 
                    progress={progress} 
                    showPercentage={true}
                    className="justify-start"
                  />
                  <div className="flex items-center space-x-4">
                    <span className="stoke-caption">Adjust Progress:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={progress}
                      onChange={(e) => setProgress(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Form Elements */}
          <Card className="mb-8 p-6">
            <h2 className="stoke-title mb-6">Form Elements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Episode Title"
                placeholder="Enter episode title..."
                value={inputValue}
                onChange={setInputValue}
              />
              <Input
                label="YouTube URL"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </Card>

          {/* Cards and Selection */}
          <Card className="mb-8 p-6">
            <h2 className="stoke-title mb-6">Cards & Selection States</h2>
            
            <SelectionCounter 
              count={selectedCount} 
              total={12}
              className="mb-4"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="default" hover={true}>
                <div className="p-4">
                  <h3 className="stoke-subtitle mb-2">Default Card</h3>
                  <p className="stoke-body text-stoke-soft-gray">
                    Hover for subtle elevation effect
                  </p>
                </div>
              </Card>
              
              <Card 
                variant="selectable" 
                onClick={() => setSelectedCount(selectedCount + 1)}
              >
                <div className="p-4">
                  <h3 className="stoke-subtitle mb-2">Selectable Card</h3>
                  <p className="stoke-body text-stoke-soft-gray">
                    Click to increment selection count
                  </p>
                </div>
              </Card>
              
              <Card variant="selected">
                <div className="p-4">
                  <h3 className="stoke-subtitle mb-2">Selected Card</h3>
                  <p className="stoke-body text-stoke-soft-gray">
                    Shows selected state styling
                  </p>
                </div>
              </Card>
            </div>
          </Card>

          {/* Topic Tags */}
          <Card className="mb-8 p-6">
            <h2 className="stoke-title mb-6">Topic Tags</h2>
            <div className="flex flex-wrap gap-3">
              <TopicTag size="sm">AI</TopicTag>
              <TopicTag size="md">Technology</TopicTag>
              <TopicTag size="lg">Philosophy</TopicTag>
              <TopicTag variant="interactive" onClick={() => alert('Tag clicked!')}>
                Interactive
              </TopicTag>
              <TopicTag variant="selected">Selected</TopicTag>
            </div>
          </Card>

          {/* Loading States */}
          <Card className="mb-8 p-6">
            <h2 className="stoke-title mb-6">Loading States</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <MemoryWavesLoader size={32} text="Processing..." />
              </div>
              <div className="text-center">
                <LoadingSpinner size={48} text="Analyzing content..." />
              </div>
              <div className="text-center">
                <SplashScreenLogo size={96} animate={true} />
              </div>
            </div>
          </Card>

          {/* Typography Scale */}
          <Card className="mb-8 p-6">
            <h2 className="stoke-title mb-6">Typography Scale</h2>
            <div className="space-y-4">
              <div className="stoke-display">Display Text - Headlines & Hero</div>
              <div className="stoke-title">Title Text - Section Headers</div>
              <div className="stoke-subtitle">Subtitle Text - Subsections</div>
              <div className="stoke-body">Body Text - Main content and descriptions</div>
              <div className="stoke-caption">Caption Text - Labels and metadata</div>
              <div className="stoke-small">Small Text - Fine print and details</div>
            </div>
          </Card>

          {/* Color Palette */}
          <Card className="mb-8 p-6">
            <h2 className="stoke-title mb-6">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2" 
                     style={{ backgroundColor: 'var(--stoke-primary-blue)' }}></div>
                <span className="stoke-small">Primary Blue</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2" 
                     style={{ backgroundColor: 'var(--stoke-deep-navy)' }}></div>
                <span className="stoke-small">Deep Navy</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2" 
                     style={{ backgroundColor: 'var(--stoke-soft-gray)' }}></div>
                <span className="stoke-small">Soft Gray</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg mx-auto mb-2" 
                     style={{ backgroundColor: 'var(--stoke-success-green)' }}></div>
                <span className="stoke-small">Success Green</span>
              </div>
            </div>
          </Card>

          {/* Design Principles */}
          <Card className="p-6">
            <h2 className="stoke-title mb-6">Design Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="stoke-subtitle mb-3">Mindful Utility</h3>
                <p className="stoke-body text-stoke-soft-gray mb-4">
                  Every interaction serves a purpose, respecting users' cognitive space and attention.
                </p>
                
                <h3 className="stoke-subtitle mb-3">Memory Waves</h3>
                <p className="stoke-body text-stoke-soft-gray">
                  Concentric circles represent knowledge rippling outward, embodying systematic learning.
                </p>
              </div>
              
              <div>
                <h3 className="stoke-subtitle mb-3">Calm Technology</h3>
                <p className="stoke-body text-stoke-soft-gray mb-4">
                  Gentle animations and generous white space create a peaceful learning environment.
                </p>
                
                <h3 className="stoke-subtitle mb-3">44px Touch Targets</h3>
                <p className="stoke-body text-stoke-soft-gray">
                  All interactive elements meet mobile accessibility standards for comfortable use.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DesignSystemProvider>
  );
} 