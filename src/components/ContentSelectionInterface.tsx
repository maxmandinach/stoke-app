'use client';

import React, { useState, useCallback } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { MemoryWavesLogo, MemoryWavesProgress, MemoryWavesLoader } from './MemoryWaves';

// Enhanced Content Type Indicator for database types
function ContentTypeIndicator({ source, className = '' }: { source: string; className?: string }) {
  const getSourceConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return {
          label: 'Podcast',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#FEF3C7',
          textColor: '#92400E',
          borderColor: '#F59E0B'
        };
      case 'video':
        return {
          label: 'Video',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm5.496 1.04l4.47 2.96a.75.75 0 010 1.25l-4.47 2.96A.75.75 0 017 12.5v-5a.75.75 0 011.496-.46z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#FEF2F2',
          textColor: '#B91C1C',
          borderColor: '#EF4444'
        };
      case 'article':
        return {
          label: 'Article',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#ECFDF5',
          textColor: '#065F46',
          borderColor: '#10B981'
        };
      case 'book':
        return {
          label: 'Book',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          ),
          bgColor: '#EDE9FE',
          textColor: '#5B21B6',
          borderColor: '#8B5CF6'
        };
      case 'conversation':
        return {
          label: 'Conversation',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#FEF3C7',
          textColor: '#92400E',
          borderColor: '#F59E0B'
        };
      case 'interview':
        return {
          label: 'Interview',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#F0F9FF',
          textColor: '#0C4A6E',
          borderColor: '#0284C7'
        };
      case 'lecture':
        return {
          label: 'Lecture',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#FDF4FF',
          textColor: '#86198F',
          borderColor: '#C026D3'
        };
      case 'other':
      default:
        return {
          label: 'Content',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
            </svg>
          ),
          bgColor: '#F1F5F9',
          textColor: '#475569',
          borderColor: '#64748B'
        };
    }
  };

  const config = getSourceConfig(source);

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor
      }}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

// Selection Counter Component
export function SelectionCounter() {
  const { state } = useContentSelection();
  
  if (state.selectionCount === 0) return null;
  
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MemoryWavesProgress 
            progress={Math.min(state.selectionCount / 10, 1)} 
            size={24}
            className="opacity-70"
          />
          <span className="font-medium text-gray-900">
            {state.selectionCount} episode{state.selectionCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <button
          onClick={() => {}}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue to Session
        </button>
      </div>
    </div>
  );
}

// View Toggle Component
export function ViewToggle() {
  const { state, dispatch } = useContentSelection();
  
  const hasSelection = state.selectionCount > 0;
  
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
      <button
        onClick={() => dispatch(contentSelectionActions.setFilter({ showSelectedOnly: false }))}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
          !state.filters.showSelectedOnly
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Show All ({state.allContent.length})
      </button>
      <button
        onClick={() => dispatch(contentSelectionActions.setFilter({ showSelectedOnly: true }))}
        disabled={!hasSelection}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
          state.filters.showSelectedOnly
            ? 'bg-white text-gray-900 shadow-sm'
            : hasSelection 
              ? 'text-gray-600 hover:text-gray-900'
              : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        Show Selected ({state.selectionCount})
      </button>
    </div>
  );
}

// Search and Filter Bar
export function SearchAndFilterBar() {
  const { state, dispatch } = useContentSelection();
  const [searchInput, setSearchInput] = useState(state.filters.searchQuery);
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    dispatch(contentSelectionActions.setFilter({ searchQuery: value }));
  }, [dispatch]);
  
  const activeFilterCount = state.filters.selectedTopics.length + 
    (state.filters.searchQuery ? 1 : 0);
  
  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search episodes or topics..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-gray-900 placeholder-gray-500 bg-white"
        />
      </div>
      
      {/* Topic Filters */}
      <TopicFilterChips />
      
      {/* Active Filter Indicator */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
          <button
            onClick={() => dispatch(contentSelectionActions.clearFilters())}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
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
      {state.allTopics.map(topic => {
        const isSelected = state.filters.selectedTopics.includes(topic.id);
        
        return (
          <button
            key={topic.id}
            onClick={() => toggleTopic(topic.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              isSelected
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
            style={isSelected && topic.color ? { 
              backgroundColor: topic.color + '20',
              borderColor: topic.color + '60',
              color: topic.color
            } : undefined}
          >
            {topic.icon && <span className="mr-1">{topic.icon}</span>}
            {topic.name}
            {isSelected && (
              <span className="ml-1.5 text-xs">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Bulk Actions Bar
export function BulkActionsBar() {
  const { state, dispatch } = useContentSelection();
  
  if (state.filteredContent.length === 0) return null;
  
  const allVisibleSelected = state.filteredContent.every(item => 
    state.selectedContentIds.has(item.id)
  );
  
  const someVisibleSelected = state.filteredContent.some(item => 
    state.selectedContentIds.has(item.id)
  );
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 mb-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            if (allVisibleSelected) {
              // Deselect all visible
              state.filteredContent.forEach(item => {
                if (state.selectedContentIds.has(item.id)) {
                  dispatch(contentSelectionActions.deselectContent(item.id));
                }
              });
            } else {
              dispatch(contentSelectionActions.selectAllVisible());
            }
          }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 
                      transition-all min-h-[44px] ${
            allVisibleSelected
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
            allVisibleSelected
              ? 'border-blue-600 bg-blue-600'
              : someVisibleSelected
                ? 'border-blue-600 bg-blue-600'
                : 'border-gray-400'
          }`}>
            {allVisibleSelected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {someVisibleSelected && !allVisibleSelected && (
              <div className="w-2 h-2 bg-white rounded-sm" />
            )}
          </div>
          <span className="text-sm font-medium">
            {allVisibleSelected ? 'Deselect All' : 'Select All'} 
            ({state.filteredContent.length})
          </span>
        </button>
        
        {state.selectionCount > 0 && (
          <button
            onClick={() => dispatch(contentSelectionActions.clearSelection())}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 
                       hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
          >
            Clear Selection
          </button>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        {state.filteredContent.length} episode{state.filteredContent.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// Individual Content Item Component
export function ContentItem({ content }: { content: ContentWithTopics }) {
  const { state, dispatch } = useContentSelection();
  const isSelected = state.selectedContentIds.has(content.id);
  
  const toggleSelection = useCallback(() => {
    dispatch(contentSelectionActions.toggleContent(content.id));
  }, [content.id, dispatch]);
  
  return (
    <div 
      className={`relative p-4 border-2 rounded-lg transition-all cursor-pointer min-h-[120px] ${
        isSelected 
          ? 'border-blue-300 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={toggleSelection}
    >
      {/* Selection Indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected
            ? 'border-blue-600 bg-blue-600 scale-110'
            : 'border-gray-300 hover:border-gray-400'
        }`}>
          {isSelected && (
            <>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {/* Memory Waves Ripple Effect */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20" />
            </>
          )}
        </div>
      </div>
      
      {/* Content Details */}
      <div className="pr-10">
        <div className="flex items-start space-x-3 mb-3">
          <ContentTypeIndicator 
            source={content.source} 
            className="mt-1 flex-shrink-0"
          />
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">
            {content.title}
          </h3>
        </div>
        
        {/* Topics */}
        {content.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.topics.slice(0, 3).map(topic => (
              <span
                key={topic.id}
                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                style={topic.color ? { 
                  backgroundColor: topic.color + '20',
                  color: topic.color
                } : undefined}
              >
                {topic.icon && <span className="mr-1">{topic.icon}</span>}
                {topic.name}
              </span>
            ))}
            {content.topics.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                +{content.topics.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Metadata */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{Math.round(content.duration_hours * 60)} min</span>
          <span>{content.total_questions} questions</span>
          {content.mastery_percentage !== undefined && (
            <div className="flex items-center space-x-1">
              <MemoryWavesProgress 
                progress={content.mastery_percentage / 100} 
                size={16}
              />
              <span>{Math.round(content.mastery_percentage)}% mastered</span>
            </div>
          )}
          {content.questions_due_count && content.questions_due_count > 0 && (
            <span className="text-orange-600 font-medium">
              {content.questions_due_count} due
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Content Grid
export function ContentGrid() {
  const { state } = useContentSelection();
  
  if (state.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <MemoryWavesLoader text="Loading your content library..." />
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
          <button
            onClick={() => {}}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {state.filteredContent.map(content => (
        <ContentItem key={content.id} content={content} />
      ))}
    </div>
  );
}

// Main Content Selection Interface
export function ContentSelectionInterface() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <MemoryWavesLogo />
        <h1 className="text-2xl font-bold text-gray-900">Select Content</h1>
      </div>
      
      {/* Selection Counter (sticky) */}
      <SelectionCounter />
      
      {/* Search and Filters */}
      <div className="px-4 py-6">
        <SearchAndFilterBar />
        
        {/* View Toggle */}
        <ViewToggle />
        
        {/* Bulk Actions */}
        <BulkActionsBar />
        
        {/* Content Grid */}
        <ContentGrid />
      </div>
    </div>
  );
} 