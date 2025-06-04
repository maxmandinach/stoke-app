'use client';

import React, { useState, useCallback } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Clock, 
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
  Zap
} from 'lucide-react';

// Professional Content Type Badge with enhanced styling
function ProfessionalContentTypeBadge({ source }: { source: string }) {
  const getTypeConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return { 
          label: 'Podcast', 
          icon: <Mic className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200/60',
          iconBg: 'bg-orange-100'
        };
      case 'video':
        return { 
          label: 'Video', 
          icon: <Video className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200/60',
          iconBg: 'bg-red-100'
        };
      case 'article':
        return { 
          label: 'Article', 
          icon: <FileText className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200/60',
          iconBg: 'bg-emerald-100'
        };
      case 'interview':
        return { 
          label: 'Interview', 
          icon: <Mic className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200/60',
          iconBg: 'bg-blue-100'
        };
      case 'book':
        return { 
          label: 'Book', 
          icon: <BookOpen className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-r from-purple-50 to-violet-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200/60',
          iconBg: 'bg-purple-100'
        };
      default:
        return { 
          label: 'Content', 
          icon: <FileText className="w-3.5 h-3.5" />,
          bgColor: 'bg-gradient-to-r from-slate-50 to-gray-50',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200/60',
          iconBg: 'bg-slate-100'
        };
    }
  };

  const config = getTypeConfig(source);
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm",
      config.bgColor,
      config.textColor,
      config.borderColor
    )}>
      <div className={cn("p-1 rounded-md", config.iconBg)}>
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
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    dispatch(contentSelectionActions.setFilter({ searchQuery: value }));
  }, [dispatch]);

  return (
    <div className={cn(
      "relative transition-all duration-200",
      isFocused && "transform scale-[1.01]"
    )}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className={cn(
          "h-5 w-5 transition-colors duration-200",
          isFocused ? "text-blue-500" : "text-gray-400"
        )} />
      </div>
      <Input
        placeholder="Search episodes, topics, or content..."
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "pl-12 pr-4 h-12 bg-white border-gray-200 rounded-xl text-base",
          "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300",
          "shadow-sm hover:shadow-md transition-all duration-200",
          "placeholder:text-gray-400"
        )}
      />
      {searchInput && (
        <button
          onClick={() => handleSearchChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
        >
          <Circle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Enhanced Topic Filter Chips with professional styling
function ProfessionalTopicFilter() {
  const { state, dispatch } = useContentSelection();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTopic = useCallback((topicId: string) => {
    const currentTopics = state.filters.selectedTopics;
    const newTopics = currentTopics.includes(topicId)
      ? currentTopics.filter(id => id !== topicId)
      : [...currentTopics, topicId];
    
    dispatch(contentSelectionActions.setFilter({ selectedTopics: newTopics }));
  }, [state.filters.selectedTopics, dispatch]);

  const clearAllFilters = () => {
    dispatch(contentSelectionActions.setFilter({ selectedTopics: [] }));
  };

  if (state.allTopics.length === 0) return null;

  const visibleTopics = isExpanded ? state.allTopics : state.allTopics.slice(0, 5);
  const hasMore = state.allTopics.length > 5;
  const activeCount = state.filters.selectedTopics.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Filter by topics</h3>
          {activeCount > 0 && (
            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
              {activeCount} active
            </div>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700 h-8 px-2"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {visibleTopics.map((topic) => {
          const isSelected = state.filters.selectedTopics.includes(topic.id);
          
          return (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm",
                "transition-all duration-200 border min-h-[44px] hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                isSelected 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25" 
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md shadow-sm"
              )}
            >
              {topic.icon && (
                <span className={cn(
                  "text-base",
                  isSelected ? "opacity-100" : "opacity-70"
                )}>
                  {topic.icon}
                </span>
              )}
              <span>{topic.name}</span>
              {isSelected && (
                <CheckCircle2 className="h-4 w-4 opacity-80" />
              )}
            </button>
          );
        })}
        
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all duration-200"
          >
            {isExpanded ? 'Show less' : `+${state.allTopics.length - 5} more`}
          </button>
        )}
      </div>
    </div>
  );
}

// Professional Selection Stats Card
function SelectionStatsCard() {
  const { state } = useContentSelection();
  
  if (state.selectionCount === 0) return null;

  const totalDuration = Array.from(state.selectedContentIds).reduce((acc, id) => {
    const content = state.allContent.find(c => c.id === id);
    return acc + (content?.duration_hours || 0);
  }, 0);

  const totalQuestions = Array.from(state.selectedContentIds).reduce((acc, id) => {
    const content = state.allContent.find(c => c.id === id);
    return acc + (content?.total_questions || 0);
  }, 0);

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Session Preview</h3>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {state.selectionCount} selected
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-2 mx-auto">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(totalDuration * 60)}
            </div>
            <div className="text-sm text-gray-600">minutes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-2 mx-auto">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
            <div className="text-sm text-gray-600">questions</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-2 mx-auto">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(totalQuestions / (totalDuration || 1))}
            </div>
            <div className="text-sm text-gray-600">per hour</div>
          </div>
        </div>
        
        <Button 
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          onClick={() => {}}
        >
          Start Learning Session
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Professional Content Card with enhanced design
function ProfessionalContentCard({ content }: { content: ContentWithTopics }) {
  const { state, dispatch } = useContentSelection();
  const isSelected = state.selectedContentIds.has(content.id);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSelection = useCallback(() => {
    dispatch(contentSelectionActions.toggleContent(content.id));
  }, [content.id, dispatch]);

  const getDueBadge = () => {
    if (!content.questions_due_count || content.questions_due_count === 0) return null;
    
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
        <Calendar className="h-3 w-3" />
        <span>{content.questions_due_count} due</span>
      </div>
    );
  };

  const getMasteryLevel = (percentage: number) => {
    if (percentage >= 80) return { label: 'Expert', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 60) return { label: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 40) return { label: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 20) return { label: 'Beginner', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'New', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const masteryLevel = getMasteryLevel(content.mastery_percentage || 0);

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 ease-out border",
        "hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
        "focus-within:ring-2 focus-within:ring-blue-500/20",
        isSelected 
          ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-lg shadow-blue-500/10" 
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
      )}
      onClick={toggleSelection}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        {/* Header with selection and type */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200",
              isSelected
                ? "bg-blue-500 border-blue-500"
                : "border-gray-300 group-hover:border-blue-400"
            )}>
              {isSelected ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  isHovered ? "bg-blue-400" : "bg-transparent"
                )} />
              )}
            </div>
            <ProfessionalContentTypeBadge source={content.source} />
          </div>
          
          <div className="flex items-center gap-2">
            {getDueBadge()}
            <div className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium",
              masteryLevel.bg,
              masteryLevel.color
            )}>
              {masteryLevel.label}
            </div>
          </div>
        </div>

        {/* Title and metadata */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight group-hover:text-gray-700 transition-colors line-clamp-2">
            {content.title}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{Math.round((content.duration_hours || 0) * 60)}min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              <span>{content.total_questions || 0} questions</span>
            </div>
            {content.last_session_at && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>Last studied</span>
              </div>
            )}
          </div>
        </div>

        {/* Topics */}
        {content.topics && content.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {content.topics.slice(0, 3).map((topic, index) => (
              <div
                key={topic.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200"
              >
                {topic.icon && <span className="text-sm">{topic.icon}</span>}
                <span>{topic.name}</span>
              </div>
            ))}
            {content.topics.length > 3 && (
              <div className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                +{content.topics.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Progress section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ProgressRing progress={content.mastery_percentage || 0} size={36} strokeWidth={3} />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {content.mastery_percentage || 0}% mastered
              </div>
              <div className="text-xs text-gray-500">
                {content.questions_due_count || 0} questions due
              </div>
            </div>
          </div>
          
          {(content.mastery_percentage || 0) > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>In progress</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Content Grid with loading states
function ProfessionalContentGrid() {
  const { state, dispatch } = useContentSelection();

  if (state.isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="w-20 h-6 bg-gray-200 rounded-lg" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-5 bg-gray-200 rounded w-full" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="flex gap-2 mb-4">
                <div className="w-16 h-6 bg-gray-200 rounded-lg" />
                <div className="w-20 h-6 bg-gray-200 rounded-lg" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Circle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load content</h3>
        <p className="text-gray-600 mb-4">{state.error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (state.filteredContent.length === 0) {
    const hasFilters = state.filters.selectedTopics.length > 0 || state.filters.searchQuery;
    
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {hasFilters ? 'No matching content' : 'No content available'}
        </h3>
        <p className="text-gray-600 mb-4">
          {hasFilters 
            ? 'Try adjusting your search or filters to find more content.'
            : 'Content will appear here once it\'s added to your library.'
          }
        </p>
        {hasFilters && (
          <Button 
            variant="outline" 
            onClick={() => {
              dispatch(contentSelectionActions.setFilter({ searchQuery: '', selectedTopics: [] }));
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {state.filteredContent.map((content) => (
        <ProfessionalContentCard key={content.id} content={content} />
      ))}
    </div>
  );
}

// View Toggle with enhanced styling
function ProfessionalViewToggle() {
  const { state, dispatch } = useContentSelection();
  
  return (
    <div className="inline-flex bg-gray-100 rounded-xl p-1 shadow-sm">
      <button
        onClick={() => dispatch(contentSelectionActions.setFilter({ showSelectedOnly: false }))}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          !state.filters.showSelectedOnly
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        All Content ({state.allContent.length})
      </button>
      <button
        onClick={() => dispatch(contentSelectionActions.setFilter({ showSelectedOnly: true }))}
        disabled={state.selectionCount === 0}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          state.filters.showSelectedOnly
            ? "bg-white text-gray-900 shadow-sm"
            : state.selectionCount > 0
              ? "text-gray-600 hover:text-gray-900"
              : "text-gray-400 cursor-not-allowed"
        )}
      >
        Selected ({state.selectionCount})
      </button>
    </div>
  );
}

// Main Professional Interface Component
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Learning Content
          </h1>
          <p className="text-lg text-gray-600">
            Select episodes and topics to create your personalized learning session
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6 mb-8">
          <ProfessionalSearchBar />
          <ProfessionalTopicFilter />
          
          <div className="flex items-center justify-between">
            <ProfessionalViewToggle />
            {state.selectionCount > 0 && (
              <div className="text-sm text-gray-600">
                {state.selectionCount} of {state.allContent.length} selected
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <ProfessionalContentGrid />
          </div>
          
          {/* Sidebar with selection stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <SelectionStatsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 