'use client';

import React, { useState, useCallback } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Search, Clock, PlayCircle, FileText, BookOpen, Mic } from 'lucide-react';

// Content Type Badge Component with icons
function ContentTypeBadge({ source }: { source: string }) {
  const getTypeConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return { 
          label: 'Podcast', 
          variant: 'default' as const,
          icon: <Mic className="w-3 h-3" />,
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      case 'video':
        return { 
          label: 'Video', 
          variant: 'destructive' as const,
          icon: <PlayCircle className="w-3 h-3" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'article':
        return { 
          label: 'Article', 
          variant: 'secondary' as const,
          icon: <FileText className="w-3 h-3" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'interview':
        return { 
          label: 'Interview', 
          variant: 'outline' as const,
          icon: <Mic className="w-3 h-3" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'book':
        return { 
          label: 'Book', 
          variant: 'outline' as const,
          icon: <BookOpen className="w-3 h-3" />,
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      default:
        return { 
          label: 'Content', 
          variant: 'secondary' as const,
          icon: <FileText className="w-3 h-3" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getTypeConfig(source);
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
      config.bgColor,
      config.textColor,
      config.borderColor
    )}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

// Search Bar Component
function SearchBar() {
  const { state, dispatch } = useContentSelection();
  const [searchInput, setSearchInput] = useState(state.filters.searchQuery);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    dispatch(contentSelectionActions.setFilter({ searchQuery: value }));
  }, [dispatch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Search episodes or topics..."
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
      />
    </div>
  );
}

// Topic Filter Chips
function TopicFilterChips() {
  const { state, dispatch } = useContentSelection();

  const toggleTopic = useCallback((topicId: string) => {
    const currentTopics = state.filters.selectedTopics;
    const newTopics = currentTopics.includes(topicId)
      ? currentTopics.filter(id => id !== topicId)
      : [...currentTopics, topicId];
    
    dispatch(contentSelectionActions.setFilter({ selectedTopics: newTopics }));
  }, [state.filters.selectedTopics, dispatch]);

  if (state.allTopics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {state.allTopics.map((topic) => {
        const isSelected = state.filters.selectedTopics.includes(topic.id);
        
        return (
          <Button
            key={topic.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTopic(topic.id)}
            className={cn(
              "h-9 px-3 font-medium transition-all",
              isSelected 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
            )}
          >
            {topic.icon && <span className="mr-1.5">{topic.icon}</span>}
            {topic.name}
          </Button>
        );
      })}
    </div>
  );
}

// Content Card Component
function ContentCard({ content }: { content: ContentWithTopics }) {
  const { state, dispatch } = useContentSelection();
  const isSelected = state.selectedContentIds.has(content.id);

  const toggleSelection = useCallback(() => {
    dispatch(contentSelectionActions.toggleContent(content.id));
  }, [content.id, dispatch]);

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 border group hover:shadow-md",
        isSelected 
          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200 shadow-sm" 
          : "hover:border-gray-300 bg-white border-gray-200"
      )}
      onClick={toggleSelection}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Checkbox 
            checked={isSelected}
            onChange={toggleSelection}
            className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <ContentTypeBadge source={content.source} />
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.round((content.duration_hours || 0) * 60)}min</span>
              </div>
            </div>
            <CardTitle className="text-lg font-semibold leading-tight text-gray-900 group-hover:text-gray-700">
              {content.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Topics */}
        {content.topics && content.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {content.topics.slice(0, 3).map((topic) => (
              <Badge 
                key={topic.id} 
                variant="secondary" 
                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
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
        
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isSelected ? "bg-blue-600" : "bg-gray-400"
                )}
                style={{ width: `${content.mastery_percentage || 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 min-w-0">
              {content.mastery_percentage || 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Content Grid
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
    <div className="grid gap-4">
      {state.filteredContent.map(content => (
        <ContentCard key={content.id} content={content} />
      ))}
    </div>
  );
}

// Selection Summary (sticky bottom)
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
    <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">
                {selectedContent.length} item{selectedContent.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-blue-700">
                {totalQuestions} questions • ~{totalTime.toFixed(1)}h estimated
              </p>
            </div>
            <Button 
              onClick={onContinue} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 shadow-sm"
            >
              Continue to Session →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
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
        <div className="max-w-4xl mx-auto px-6 py-8">
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
        <ContentGrid />
      </div>

      {/* Selection Summary */}
      <SelectionSummary onContinue={handleContinue} />
    </div>
  );
} 