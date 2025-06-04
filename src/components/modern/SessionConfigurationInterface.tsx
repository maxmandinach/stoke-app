'use client';

import React from 'react';
import { 
  BookOpen, 
  Brain, 
  Target, 
  ArrowLeft,
  Play,
  CheckCircle2
} from 'lucide-react';
import { 
  useSessionConfiguration, 
  sessionConfigurationActions,
  SessionType,
  SessionLength 
} from '@/contexts/SessionConfigurationContext';
import { useContentSelection } from '@/contexts/ContentSelectionContext';
import { MemoryWavesLogo } from '../MemoryWavesLogo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Session Type Configurations
const getSessionTypeConfig = (type: SessionType) => {
  const configs = {
    summaries: {
      title: 'Read Summaries',
      description: 'Browse key insights and takeaways from your selected content',
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      preview: 'Interactive summary cards with main points, insights, and connections',
      benefits: ['Quick knowledge overview', 'Perfect for commutes', 'Low cognitive load']
    },
    testing: {
      title: 'Test Knowledge',
      description: 'Challenge yourself with questions based on the content',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      preview: 'Spaced repetition questions with immediate feedback and explanations',
      benefits: ['Active recall practice', 'Memory reinforcement', 'Track understanding']
    },
    both: {
      title: 'Read + Test',
      description: 'Start with summaries, then reinforce with questions',
      icon: Target,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      preview: 'Sequential experience: summaries first to refresh, then targeted questions',
      benefits: ['Complete review cycle', 'Build then test knowledge', 'Optimal retention']
    }
  };
  return configs[type];
};

// Session Length Configurations
const getSessionLengthConfig = (length: SessionLength) => {
  const configs = {
    quick: {
      label: 'Quick',
      range: '1-3 min',
      description: 'Bite-sized review for busy moments',
      icon: '⚡'
    },
    medium: {
      label: 'Medium',
      range: '3-5 min', 
      description: 'Balanced depth and efficiency',
      icon: '⚖️'
    },
    extended: {
      label: 'Extended',
      range: '5-15 min',
      description: 'Comprehensive deep dive',
      icon: '🔬'
    }
  };
  return configs[length];
};

// Session Type Card Component
function SessionTypeCard({ 
  type, 
  isSelected, 
  onSelect 
}: { 
  type: SessionType; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  const config = getSessionTypeConfig(type);
  const IconComponent = config.icon;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-lg bg-gradient-to-br",
            config.gradient
          )}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{config.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          {isSelected && (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-foreground mb-1">
              What you'll experience:
            </div>
            <div className={cn(
              "text-sm p-3 rounded-lg italic",
              config.bgColor,
              config.textColor
            )}>
              {config.preview}
            </div>
          </div>
          
          <div className="space-y-1">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Session Length Selector Component
function SessionLengthSelector({ 
  selectedLength, 
  onSelect,
  timeEstimate 
}: { 
  selectedLength: SessionLength; 
  onSelect: (length: SessionLength) => void;
  timeEstimate: number;
}) {
  const lengthOptions: SessionLength[] = ['quick', 'medium', 'extended'];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Session Length</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {lengthOptions.map((length) => {
          const config = getSessionLengthConfig(length);
          const isSelected = selectedLength === length;
          
          return (
            <Card
              key={length}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary shadow-md"
              )}
              onClick={() => onSelect(length)}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl">{config.icon}</div>
                  <div>
                    <div className="font-semibold text-foreground">{config.label}</div>
                    <div className="text-sm text-primary font-medium">{config.range}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs">
                      Est. {timeEstimate.toFixed(1)} min
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Content Summary Component
function ContentSummary({ 
  selectedCount, 
  sessionStructure, 
  sessionType,
  onReturnToSelection 
}: {
  selectedCount: number;
  sessionStructure: any;
  sessionType: SessionType;
  onReturnToSelection: () => void;
}) {
  const { summariesCount, questionsCount } = sessionStructure;
  
  const getSessionDescription = () => {
    switch (sessionType) {
      case 'summaries':
        return `${summariesCount} summary${summariesCount !== 1 ? 'ies' : ''}`;
      case 'testing':
        return `${questionsCount} question${questionsCount !== 1 ? 's' : ''}`;
      case 'both':
        return `${summariesCount} summaries + ${questionsCount} questions`;
    }
  };

  const getSessionTypeConfig = (type: SessionType) => {
    switch (type) {
      case 'summaries': return { icon: BookOpen, color: 'text-blue-600' };
      case 'testing': return { icon: Brain, color: 'text-purple-600' };
      case 'both': return { icon: Target, color: 'text-green-600' };
    }
  };

  const typeConfig = getSessionTypeConfig(sessionType);
  const IconComponent = typeConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className={cn("h-5 w-5", typeConfig.color)} />
          Session Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{selectedCount}</div>
            <div className="text-sm text-muted-foreground">Episodes Selected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{getSessionDescription()}</div>
            <div className="text-sm text-muted-foreground">To Review</div>
          </div>
        </div>
        
        <Separator />
        
        <Button 
          variant="outline" 
          onClick={onReturnToSelection}
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Change Selection
        </Button>
      </CardContent>
    </Card>
  );
}

// Start Session Button Component
function StartSessionButton({ 
  canStart, 
  onStart 
}: {
  canStart: boolean;
  onStart: () => void;
}) {
  return (
    <div className="space-y-4">
      <Button 
        onClick={onStart}
        disabled={!canStart}
        size="lg"
        className="w-full h-14 text-lg font-semibold"
      >
        <Play className="h-5 w-5 mr-2" />
        Start Session
      </Button>
      
      {!canStart && (
        <p className="text-sm text-muted-foreground text-center">
          Please configure your session to continue
        </p>
      )}
    </div>
  );
}

// Main Session Configuration Interface
export function SessionConfigurationInterface({ 
  onReturnToSelection 
}: { 
  onReturnToSelection: () => void 
}) {
  const { state: sessionState, dispatch: sessionDispatch } = useSessionConfiguration();
  const { state: contentState } = useContentSelection();

  const handleSessionTypeChange = (type: SessionType) => {
    sessionDispatch(sessionConfigurationActions.setSessionType(type));
  };

  const handleSessionLengthChange = (length: SessionLength) => {
    sessionDispatch(sessionConfigurationActions.setSessionLength(length));
  };

  const handleStartSession = () => {
    sessionDispatch(sessionConfigurationActions.startConfiguration());
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MemoryWavesLogo size="lg" animated />
          <h1 className="text-3xl font-bold text-foreground">Configure Session</h1>
        </div>
        <p className="text-muted-foreground">
          Choose how you'd like to review your selected content
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Session Type Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Session Type</h2>
            <div className="grid gap-4">
              {(['summaries', 'testing', 'both'] as SessionType[]).map((type) => (
                <SessionTypeCard
                  key={type}
                  type={type}
                  isSelected={sessionState.sessionType === type}
                  onSelect={() => handleSessionTypeChange(type)}
                />
              ))}
            </div>
          </div>

          {/* Session Length */}
          <SessionLengthSelector
            selectedLength={sessionState.sessionLength}
            onSelect={handleSessionLengthChange}
            timeEstimate={sessionState.sessionStructure.estimatedDuration.total}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContentSummary
            selectedCount={contentState.selectionCount}
            sessionStructure={sessionState.sessionStructure}
            sessionType={sessionState.sessionType}
            onReturnToSelection={onReturnToSelection}
          />
          
          <StartSessionButton
            canStart={sessionState.canStartSession}
            onStart={handleStartSession}
          />
        </div>
      </div>
    </div>
  );
} 