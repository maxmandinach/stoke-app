'use client';

import React, { useState, useCallback } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';

// Content Type Badge Component
function ContentTypeBadge({ source }: { source: string }) {
  const getTypeConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return { label: 'Podcast', variant: 'default' as const };
      case 'video':
        return { label: 'Video', variant: 'destructive' as const };
      case 'article':
        return { label: 'Article', variant: 'secondary' as const };
      case 'book':
        return { label: 'Book', variant: 'outline' as const };
      default:
        return { label: 'Content', variant: 'secondary' as const };
    }
  };

  const config = getTypeConfig(source);
  return <Badge variant={config.variant}>{config.label}</Badge>;
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
        className="pl-10"
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
            className="h-8"
          >
            {topic.icon && <span className="mr-1">{topic.icon}</span>}
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
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 bg-blue-50"
      )}
      onClick={toggleSelection}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Checkbox 
            checked={isSelected}
            onChange={toggleSelection}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <ContentTypeBadge source={content.source} />
              <span className="text-sm text-gray-500">
                {Math.round((content.duration_hours || 0) * 60)}min
              </span>
            </div>
            <CardTitle className="text-lg leading-tight">
              {content.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 mb-3 line-clamp-2">
          {content.source}
        </p>
        
        {/* Topics */}
        {content.topics && content.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.topics.slice(0, 3).map((topic) => (
              <Badge key={topic.id} variant="secondary" className="text-xs">
                {topic.icon && <span className="mr-1">{topic.icon}</span>}
                {topic.name}
              </Badge>
            ))}
            {content.topics.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{content.topics.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Progress */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${content.mastery_percentage || 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {content.mastery_percentage || 0}%
          </span>
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
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Loading your content library...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Error loading content</div>
        <div className="text-gray-500 text-sm">{state.error}</div>
      </div>
    );
  }

  if (state.filteredContent.length === 0) {
    const hasFilters = state.filters.selectedTopics.length > 0 || 
                      state.filters.searchQuery || 
                      state.filters.showSelectedOnly;
    
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          {hasFilters ? 'No episodes match your filters' : 'No episodes in your library yet'}
        </div>
        {hasFilters && (
          <Button
            variant="outline"
            onClick={() => {
              dispatch(contentSelectionActions.clearFilters());
            }}
          >
            Clear filters
          </Button>
        )}
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
    <div className="sticky bottom-0 bg-white border-t shadow-lg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">
              {selectedContent.length} item{selectedContent.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-sm text-gray-600">
              {totalQuestions} questions • ~{totalTime.toFixed(1)}h estimated
            </p>
          </div>
          <Button onClick={onContinue} size="lg">
            Continue to Session
          </Button>
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Simple Stoke wordmark */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Stoke</h1>
          </div>
          
          <h2 className="text-xl font-medium text-gray-900 mb-4">
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
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        <ContentGrid />
      </div>

      {/* Selection Summary */}
      <SelectionSummary onContinue={handleContinue} />
    </div>
  );
} 