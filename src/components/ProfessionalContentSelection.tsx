/**
 * Professional Content Selection Interface
 * 
 * DEVELOPMENT STRATEGY:
 * - TypeScript is configured to allow unused imports/variables (see tsconfig.json)
 * - This prevents build failures when preparing code for incremental development
 * - Imports may be "unused" temporarily while features are being developed
 * - DO NOT remove imports just to fix build errors - they may be planned for upcoming features
 * 
 * CURRENT FEATURES:
 * - Professional card-based content selection with enhanced shadows
 * - Advanced search with new SearchInput component
 * - Bulk selection actions with improved visual feedback
 * - Real-time session preview with professional styling
 * - Mobile-optimized responsive design with proper touch targets
 * - Progress indicators and mastery level badges with better hierarchy
 * 
 * ENHANCED PROFESSIONAL FEATURES:
 * - Enterprise-grade shadow system and elevation
 * - Professional typography hierarchy
 * - Enhanced interactive states and micro-animations
 * - Better accessibility and screen reader support
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { ContentCard, StatsCard } from '@/components/ui/card';
import { Button, IconButton, ButtonGroup } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Clock, 
  PlayCircle,
  FileText, 
  BookOpen, 
  Mic, 
  Video,
  CheckCircle2,
  Circle,
  Filter,
  ArrowRight,
  Star,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  CheckSquare,
  Square,
  MoreHorizontal,
  LayoutGrid,
  List,
  SortDesc,
  Users,
  BookmarkPlus
} from 'lucide-react';

// Professional Content Type Badge with enhanced styling
function ProfessionalContentTypeBadge({ source }: { source: string }) {
  const getTypeConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return { 
          label: 'Podcast', 
          icon: <Mic className="w-3.5 h-3.5" />,
          className: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200/60'
        };
      case 'video':
        return { 
          label: 'Video', 
          icon: <Video className="w-3.5 h-3.5" />,
          className: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200/60'
        };
      case 'article':
        return { 
          label: 'Article', 
          icon: <FileText className="w-3.5 h-3.5" />,
          className: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200/60'
        };
      case 'interview':
        return { 
          label: 'Interview', 
          icon: <Mic className="w-3.5 h-3.5" />,
          className: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200/60'
        };
      case 'book':
        return { 
          label: 'Book', 
          icon: <BookOpen className="w-3.5 h-3.5" />,
          className: 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200/60'
        };
      default:
        return { 
          label: 'Content', 
          icon: <FileText className="w-3.5 h-3.5" />,
          className: 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200/60'
        };
    }
  };

  const config = getTypeConfig(source);
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200",
      config.className
    )}>
      <div className="p-1 rounded-md bg-white/60">
        {config.icon}
      </div>
      <span>{config.label}</span>
    </div>
  );
}

// Enhanced Progress Ring Component
function ProgressRing({ progress, size = 40, strokeWidth = 3 }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number; 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-blue-500 transition-all duration-300 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// Professional Search Bar with enhanced styling
function ProfessionalSearchBar() {
  const { state, dispatch } = useContentSelection();
  const [searchInput, setSearchInput] = useState(state.filters.searchQuery);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    dispatch(contentSelectionActions.setFilter({ searchQuery: value }));
  }, [dispatch]);

  return (
    <SearchInput
      placeholder="Search episodes, topics, or content..."
      value={searchInput}
      onSearch={handleSearchChange}
      size="lg"
      className="w-full"
    />
  );
}

// Professional Topic Filter with enhanced UI
function ProfessionalTopicFilter() {
  const { state, dispatch } = useContentSelection();
  const [isOpen, setIsOpen] = useState(false);

  const clearAllFilters = () => {
    dispatch(contentSelectionActions.clearFilters());
  };

  const toggleTopicFilter = (topicId: string) => {
    const currentTopics = state.filters.selectedTopics;
    const newTopics = currentTopics.includes(topicId)
      ? currentTopics.filter(id => id !== topicId)
      : [...currentTopics, topicId];
    
    dispatch(contentSelectionActions.setFilter({ selectedTopics: newTopics }));
  };

  const hasActiveFilters = state.filters.selectedTopics.length > 0 || state.filters.searchQuery;

  return (
    <div className="flex items-center gap-3">
      <ButtonGroup>
        <Button
          variant="outline"
          size="default"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
          {state.filters.selectedTopics.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {state.filters.selectedTopics.length}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="default"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </ButtonGroup>

      <ButtonGroup variant="outline">
        <IconButton variant="ghost" size="icon">
          <LayoutGrid className="h-4 w-4" />
        </IconButton>
        <IconButton variant="ghost" size="icon">
          <List className="h-4 w-4" />
        </IconButton>
      </ButtonGroup>

      <Button variant="outline" size="default" className="gap-2">
        <SortDesc className="h-4 w-4" />
        Sort
      </Button>
    </div>
  );
}

// Enhanced Selection Stats Card
function SelectionStatsCard({ onContinue }: { onContinue?: () => void }) {
  const { state } = useContentSelection();
  const selectedContent = Array.from(state.selectedContentIds);
  const totalQuestions = selectedContent.reduce((sum, id) => {
    const content = state.allContent.find(c => c.id === id);
    return sum + (content?.total_questions || 0);
  }, 0);

  const totalDuration = selectedContent.reduce((sum, id) => {
    const content = state.allContent.find(c => c.id === id);
    return sum + (content?.duration_hours || 0);
  }, 0);

  const averageDifficulty = selectedContent.reduce((sum, id) => {
    const content = state.allContent.find(c => c.id === id);
    return sum + (content?.average_difficulty || 0);
  }, 0) / (selectedContent.length || 1);

  if (selectedContent.length === 0) {
    return (
      <div className="lg:col-span-1">
        <StatsCard
          title="Selection Summary"
          value="0"
          subtitle="items selected"
          icon={<Target className="h-6 w-6" />}
          className="animate-fade-in"
        />
      </div>
    );
  }

  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <StatsCard
          title="Content Selected"
          value={selectedContent.length}
          subtitle={`${totalQuestions} questions total`}
          icon={<CheckSquare className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
          className="animate-fade-in"
        />
        
        <StatsCard
          title="Est. Duration"
          value={`${Math.round(totalDuration * 60)}m`}
          subtitle="study time"
          icon={<Clock className="h-6 w-6" />}
          className="animate-fade-in"
        />

        <StatsCard
          title="Avg. Difficulty"
          value={averageDifficulty.toFixed(1)}
          subtitle="out of 5"
          icon={<TrendingUp className="h-6 w-6" />}
          className="animate-fade-in"
        />
      </div>

      {onContinue && (
        <Button
          onClick={onContinue}
          size="lg"
          variant="premium"
          className="w-full gap-2 animate-scale-in"
        >
          <Zap className="h-5 w-5" />
          Start Learning Session
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Professional Content Card Component
function ProfessionalContentCard({ content }: { content: ContentWithTopics }) {
  const { state, dispatch } = useContentSelection();
  const isSelected = state.selectedContentIds.has(content.id);

  const toggleSelection = () => {
    dispatch(contentSelectionActions.toggleContent(content.id));
  };

  const getDueBadge = () => {
    if (content.questions_due_count && content.questions_due_count > 0) {
      return (
        <span className="bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full font-medium">
          {content.questions_due_count} due
        </span>
      );
    }
    return null;
  };

  const getMasteryLevel = (percentage: number) => {
    if (percentage >= 80) return { label: 'Mastered', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 60) return { label: 'Learning', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 40) return { label: 'Started', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'New', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const mastery = getMasteryLevel(content.mastery_percentage || 0);

  return (
    <ContentCard
      selected={isSelected}
      onClick={toggleSelection}
      badge={getDueBadge()}
      actions={
        <ButtonGroup>
          <IconButton variant="ghost" size="icon-sm">
            <BookmarkPlus className="h-4 w-4" />
          </IconButton>
          <IconButton variant="ghost" size="icon-sm">
            <MoreHorizontal className="h-4 w-4" />
          </IconButton>
        </ButtonGroup>
      }
      className="animate-fade-in group"
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <ProfessionalContentTypeBadge source={content.source} />
            <h3 className="text-heading-3 font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {content.title}
            </h3>
          </div>
          
          {/* Selection indicator */}
          <div className="flex-shrink-0">
            {isSelected ? (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Content preview */}
        <p className="text-body-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {content.quick_summary?.replace(/•/g, '').trim()}
        </p>

        {/* Topics */}
        {content.topics && content.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {content.topics.slice(0, 3).map((topic) => (
              <span
                key={topic.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium"
              >
                <span>{topic.icon}</span>
                {topic.name}
              </span>
            ))}
            {content.topics.length > 3 && (
              <span className="text-xs text-muted-foreground font-medium">
                +{content.topics.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4 text-caption text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.round((content.duration_hours || 0) * 60)}m
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {content.total_questions} questions
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", mastery.bg, mastery.color)}>
              {mastery.label}
            </span>
            <ProgressRing progress={content.mastery_percentage || 0} size={24} strokeWidth={2} />
          </div>
        </div>
      </div>
    </ContentCard>
  );
}

// Professional Content Grid with enhanced layout
function ProfessionalContentGrid() {
  const { state } = useContentSelection();
  const filteredContent = state.filteredContent;

  if (filteredContent.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-heading-3 text-foreground mb-2">No content found</h3>
        <p className="text-body text-muted-foreground mb-4">
          Try adjusting your search or filters to find relevant content.
        </p>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredContent.map((content, index) => (
        <div 
          key={content.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ProfessionalContentCard content={content} />
        </div>
      ))}
    </div>
  );
}

// Professional View Toggle with enhanced UI
function ProfessionalViewToggle() {
  const { state } = useContentSelection();
  const hasSelectedContent = state.selectedContentIds.size > 0;

  return (
    <ButtonGroup variant="outline">
      <Button
        variant={!hasSelectedContent ? "default" : "outline"}
        size="default"
        className="gap-2"
      >
        All Content ({state.filteredContent.length})
      </Button>
      <Button
        variant={hasSelectedContent ? "default" : "outline"}
        size="default"
        disabled={state.selectedContentIds.size === 0}
        className="gap-2"
      >
        Selected ({state.selectedContentIds.size})
      </Button>
    </ButtonGroup>
  );
}

// Enhanced Bulk Selection Actions
function BulkSelectionActions() {
  const { state, dispatch } = useContentSelection();
  const filteredContent = state.filteredContent;
  const selectedCount = state.selectedContentIds.size;
  const allSelected = filteredContent.every(content => state.selectedContentIds.has(content.id));

  const handleBulkToggle = () => {
    if (allSelected) {
      // Deselect all filtered content
      filteredContent.forEach(content => {
        dispatch(contentSelectionActions.deselectContent(content.id));
      });
    } else {
      // Select all filtered content
      filteredContent.forEach(content => {
        if (!state.selectedContentIds.has(content.id)) {
          dispatch(contentSelectionActions.selectContent(content.id));
        }
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="default"
        onClick={handleBulkToggle}
        className="gap-2"
      >
        {allSelected ? (
          <Square className="h-4 w-4" />
        ) : (
          <CheckSquare className="h-4 w-4" />
        )}
        {allSelected ? 'Deselect All' : 'Select All'}
      </Button>
      
      {selectedCount > 0 && (
        <span className="text-body-sm text-muted-foreground">
          {selectedCount} of {filteredContent.length} selected
        </span>
      )}
    </div>
  );
}

// Main Professional Content Selection Interface
interface ProfessionalContentSelectionProps {
  onContinue: (selectedIds: string[]) => void;
}

export default function ProfessionalContentSelection({ onContinue }: ProfessionalContentSelectionProps) {
  const { state } = useContentSelection();
  
  const handleContinue = () => {
    onContinue(Array.from(state.selectedContentIds));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-display text-foreground mb-2">Choose Your Learning Content</h1>
          <p className="text-body-lg text-muted-foreground">
            Select episodes and topics to create your personalized learning session
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6 mb-8">
          <ProfessionalSearchBar />
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <ProfessionalViewToggle />
            <ProfessionalTopicFilter />
          </div>
          
          <BulkSelectionActions />
        </div>

        {/* Content Grid with Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <ProfessionalContentGrid />
          </div>
          
          <SelectionStatsCard onContinue={handleContinue} />
        </div>
      </div>
    </div>
  );
} 