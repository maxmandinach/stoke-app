'use client';

import React, { useState, useCallback } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Clock, PlayCircle, FileText, BookOpen, Mic, Check, X } from 'lucide-react';

// Content Type Badge Component with icons
function ContentTypeBadge({ source }: { source: string }) {
  const getTypeConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return { 
          label: 'Podcast', 
          icon: <Mic className="w-3 h-3" />,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      case 'video':
        return { 
          label: 'Video', 
          icon: <PlayCircle className="w-3 h-3" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'article':
        return { 
          label: 'Article', 
          icon: <FileText className="w-3 h-3" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'interview':
        return { 
          label: 'Interview', 
          icon: <Mic className="w-3 h-3" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      default:
        return { 
          label: 'Content', 
          icon: <BookOpen className="w-3 h-3" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getTypeConfig(source);

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// Search Bar Component
function SearchBar() {
  const { state, dispatch } = useContentSelection();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search episodes, topics..."
        value={state.filters.searchQuery}
        onChange={(e) => dispatch(contentSelectionActions.setFilter({ searchQuery: e.target.value }))}
        className="pl-10 h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg shadow-sm"
      />
    </div>
  );
}

// Topic Filter Chips
function TopicFilterChips() {
  const { state, dispatch } = useContentSelection();

  if (state.allTopics.length === 0) return null;

  const toggleTopic = (topicId: string) => {
    const newSelectedTopics = state.filters.selectedTopics.includes(topicId)
      ? state.filters.selectedTopics.filter(id => id !== topicId)
      : [...state.filters.selectedTopics, topicId];
    
    dispatch(contentSelectionActions.setFilter({ selectedTopics: newSelectedTopics }));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {state.allTopics.slice(0, 8).map(topic => {
        const isSelected = state.filters.selectedTopics.includes(topic.id);
        return (
          <button
            key={topic.id}
            onClick={() => toggleTopic(topic.id)}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
              isSelected 
                ? "bg-blue-600 text-white shadow-sm" 
                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
            )}
          >
            {topic.icon && <span>{topic.icon}</span>}
            {topic.name}
            {isSelected && <X className="w-3 h-3 ml-1" />}
          </button>
        );
      })}
    </div>
  );
}

// Enhanced Content Card Component
function ContentCard({ content }: { content: ContentWithTopics }) {
  const { state, dispatch } = useContentSelection();
  const isSelected = state.selectedContentIds.has(content.id);

  const toggleSelection = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch(contentSelectionActions.toggleContent(content.id));
  }, [content.id, dispatch]);

  const handleCardClick = useCallback(() => {
    toggleSelection();
  }, [toggleSelection]);

  return (
    <Card 
      className={cn(
        // Base card styles
        "relative cursor-pointer transition-all duration-300 group",
        "bg-white rounded-lg shadow-sm hover:shadow-md",
        // Selection states
        isSelected 
          ? "ring-2 ring-blue-500 bg-blue-50/30 shadow-md transform scale-[1.02]" 
          : "border border-gray-200 hover:border-gray-300",
        // Responsive touch targets
        "min-h-[140px] md:min-h-[160px]"
      )}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox - Top Right Corner */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={toggleSelection}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isSelected
              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
              : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm"
          )}
          aria-label={isSelected ? "Deselect content" : "Select content"}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </button>
      </div>

      <CardHeader className="pb-3">
        <div className="pr-8"> {/* Add padding to avoid checkbox overlap */}
          {/* Content Type Badge and Duration */}
          <div className="flex items-center gap-3 mb-3">
            <ContentTypeBadge source={content.source} />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{Math.round((content.duration_hours || 0) * 60)}min</span>
            </div>
          </div>
          
          {/* Title */}
          <CardTitle className={cn(
            "text-base md:text-lg font-semibold leading-tight line-clamp-2",
            "transition-colors duration-200",
            isSelected ? "text-blue-900" : "text-gray-900 group-hover:text-gray-700"
          )}>
            {content.title}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Topics */}
        {content.topics && content.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {content.topics.slice(0, 3).map((topic) => (
              <Badge 
                key={topic.id} 
                variant="secondary" 
                className={cn(
                  "text-xs transition-colors duration-200",
                  isSelected 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {topic.icon && <span className="mr-1">{topic.icon}</span>}
                {topic.name}
              </Badge>
            ))}
            {content.topics.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{content.topics.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className={cn(
              "font-semibold",
              isSelected ? "text-blue-700" : "text-gray-900"
            )}>
              {content.mastery_percentage || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                isSelected ? "bg-blue-600" : "bg-gray-400"
              )}
              style={{ width: `${content.mastery_percentage || 0}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Responsive Content Grid with proper breakpoints
function ContentGrid() {
  const { state, dispatch } = useContentSelection();

  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your content library...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-700 font-medium mb-2">Error loading content</div>
          <div className="text-red-600 text-sm">{state.error}</div>
        </div>
      </div>
    );
  }

  if (state.filteredContent.length === 0) {
    const hasFilters = state.filters.selectedTopics.length > 0 || 
                      state.filters.searchQuery || 
                      state.filters.showSelectedOnly;
    
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-gray-700 font-medium mb-3">
            {hasFilters ? 'No episodes match your filters' : 'No episodes in your library yet'}
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={() => {
                dispatch(contentSelectionActions.clearFilters());
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4 md:gap-6",
      // Responsive grid columns
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      // Ensure proper spacing
      "auto-rows-fr"
    )}>
      {state.filteredContent.map(content => (
        <ContentCard key={content.id} content={content} />
      ))}
    </div>
  );
}

// Enhanced Selection Summary
function SelectionSummary({ onContinue }: { onContinue: () => void }) {
  const { state } = useContentSelection();
  
  const selectedContent = state.filteredContent.filter(content => 
    state.selectedContentIds.has(content.id)
  );

  if (selectedContent.length === 0) return null;

  const totalQuestions = selectedContent.reduce((total, content) => 
    total + (content.total_questions || 0), 0
  );
  
  const totalTime = selectedContent.reduce((total, content) => 
    total + (content.duration_hours || 0), 0
  );

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-lg">
                {selectedContent.length} item{selectedContent.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-blue-100 text-sm">
                {totalQuestions} questions • ~{totalTime.toFixed(1)}h estimated
              </p>
            </div>
            <Button 
              onClick={onContinue} 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 shadow-sm rounded-lg transition-all duration-200 hover:scale-105"
            >
              Continue to Session →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component with improved layout
interface ModernContentSelectionProps {
  onContinue: (selectedIds: string[]) => void;
}

export default function ModernContentSelection({ onContinue }: ModernContentSelectionProps) {
  const { state } = useContentSelection();

  const handleContinue = useCallback(() => {
    const selectedIds = Array.from(state.selectedContentIds);
    onContinue(selectedIds);
  }, [state.selectedContentIds, onContinue]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stoke brand header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Stoke</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Choose your learning content
          </h2>
          
          {/* Search and Filters */}
          <div className="space-y-4">
            <SearchBar />
            <TopicFilterChips />
          </div>
        </div>
      </div>

      {/* Content with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <ContentGrid />
      </div>

      {/* Selection Summary */}
      <SelectionSummary onContinue={handleContinue} />
    </div>
  );
} 