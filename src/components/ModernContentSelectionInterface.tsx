'use client';

import React, { useState, useCallback } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { Button, Card, Badge, ProgressBar, ContentTypeIndicator } from '@/components/ui/StokeDesignSystem';

// Props interface as required by the specifications
interface ModernContentSelectionInterfaceProps {
  onContinue: (selectedIds: string[]) => void;
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
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input 
        type="text"
        placeholder="Search episodes or topics..."
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
      />
    </div>
  );
}

// Topic Filter Chips Component
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
          <button
            key={topic.id}
            onClick={() => toggleTopic(topic.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 min-h-[44px] ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            {topic.icon && <span className="mr-1">{topic.icon}</span>}
            {topic.name}
          </button>
        );
      })}
    </div>
  );
}

// Helper functions for progress calculations
function getTotalQuestions(selectedContent: ContentWithTopics[]): number {
  return selectedContent.reduce((total, content) => total + (content.total_questions || 0), 0);
}

function getEstimatedTime(selectedContent: ContentWithTopics[]): number {
  return selectedContent.reduce((total, content) => total + (content.duration_hours || 0), 0);
}

// Content Card Component
function ContentCard({ content }: { content: ContentWithTopics }) {
  const { state, dispatch } = useContentSelection();
  const isSelected = state.selectedContentIds.has(content.id);

  const toggleSelection = useCallback(() => {
    dispatch(contentSelectionActions.toggleContent(content.id));
  }, [content.id, dispatch]);

  // Get topic variant colors
  const getTopicVariant = (index: number): 'blue' | 'green' | 'purple' | 'orange' => {
    const variants = ['blue', 'green', 'purple', 'orange'] as const;
    return variants[index % variants.length];
  };

  return (
    <Card
      onClick={toggleSelection}
      variant={isSelected ? 'selected' : 'interactive'}
      className="p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Content Type + Title */}
          <div className="flex items-center space-x-2 mb-2">
            <ContentTypeIndicator type={content.source as any} />
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {content.title}
            </h3>
          </div>
          
          {/* Source */}
          <p className="text-gray-600 mb-3">{content.source}</p>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-sm text-gray-500">
              {Math.round((content.duration_hours || 0) * 60)}min • {content.total_questions || 0} questions
            </span>
            {content.topics && content.topics.slice(0, 3).map((topic, index) => (
              <Badge 
                key={topic.id} 
                variant={getTopicVariant(index)} 
                size="sm"
              >
                {topic.icon && <span className="mr-1">{topic.icon}</span>}
                {topic.name}
              </Badge>
            ))}
            {content.topics && content.topics.length > 3 && (
              <Badge variant="default" size="sm">
                +{content.topics.length - 3} more
              </Badge>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {content.mastery_percentage || 0}%
                </span>
              </div>
              <ProgressBar progress={content.mastery_percentage || 0} size="sm" />
            </div>
          </div>
        </div>
        
        {/* Selection Indicator */}
        <div className="ml-4 flex-shrink-0">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300'
          }`}>
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Main Content Grid Component
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
            variant="ghost"
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
    <div className="grid gap-4 mb-8">
      {state.filteredContent.map(content => (
        <ContentCard key={content.id} content={content} />
      ))}
    </div>
  );
}

// Main Modern Content Selection Interface
export default function ModernContentSelectionInterface({ onContinue }: ModernContentSelectionInterfaceProps) {
  const { state } = useContentSelection();

  const selectedContent = state.filteredContent.filter(content => 
    state.selectedContentIds.has(content.id)
  );

  const handleContinue = useCallback(() => {
    const selectedIds = Array.from(state.selectedContentIds);
    onContinue(selectedIds);
  }, [state.selectedContentIds, onContinue]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search and Filters Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose your learning content</h2>
        
        {/* Search Bar with Icon */}
        <SearchBar />

        {/* Topic Filter Chips */}
        <TopicFilterChips />
      </div>

      {/* Content Grid */}
      <ContentGrid />

      {/* Sticky Bottom Selection Summary */}
      {selectedContent.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedContent.length} item{selectedContent.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-gray-600">
                  {getTotalQuestions(selectedContent)} questions • ~{getEstimatedTime(selectedContent).toFixed(1)}h estimated
                </p>
              </div>
              <Button variant="primary" size="lg" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
