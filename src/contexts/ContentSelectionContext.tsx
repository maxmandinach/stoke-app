'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Database } from '@/types/database.types';

// Types for the selection system
type ContentRow = Database['public']['Tables']['content']['Row'];
type TopicRow = Database['public']['Tables']['topics']['Row'];

export interface ContentWithTopics {
  id: string;
  title: string;
  source: ContentRow['source'];
  source_url: string;
  transcript: string;
  duration_hours: number;
  quick_summary: string;
  full_summary: string;
  questions: ContentRow['questions'];
  created_at: string;
  processed_at: string | null;
  processing_status: ContentRow['processing_status'];
  content_version: number;
  total_questions: number;
  average_difficulty: number;
  estimated_read_time_minutes: number;
  
  // Enhanced topic data (replaces legacy topics string array)
  topics: TopicRow[];
  
  // User progress data (when available)
  mastery_percentage?: number;
  questions_due_count?: number;
  last_session_at?: string | null;
  
  // Legacy compatibility
  summary?: string;
  insights?: ContentRow['insights'];
  isAiProcessed?: boolean;
}

export interface SelectionFilter {
  selectedTopics: string[]; // topic IDs
  showSelectedOnly: boolean;
  searchQuery: string;
  sortBy: 'title' | 'created_at' | 'mastery_percentage' | 'questions_due_count';
  sortOrder: 'asc' | 'desc';
}

export interface ContentSelectionState {
  selectedContentIds: Set<string>;
  filteredContent: ContentWithTopics[];
  allContent: ContentWithTopics[];
  allTopics: TopicRow[];
  filters: SelectionFilter;
  isLoading: boolean;
  error: string | null;
  selectionCount: number;
}

type ContentSelectionAction =
  | { type: 'SET_CONTENT'; payload: ContentWithTopics[] }
  | { type: 'SET_TOPICS'; payload: TopicRow[] }
  | { type: 'SELECT_CONTENT'; payload: string }
  | { type: 'DESELECT_CONTENT'; payload: string }
  | { type: 'SELECT_ALL_VISIBLE' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_CONTENT'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<SelectionFilter> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'APPLY_FILTERS' }
  | { type: 'RESTORE_SELECTION'; payload: string[] };

const initialState: ContentSelectionState = {
  selectedContentIds: new Set(),
  filteredContent: [],
  allContent: [],
  allTopics: [],
  filters: {
    selectedTopics: [],
    showSelectedOnly: false,
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  isLoading: false,
  error: null,
  selectionCount: 0
};

// Helper function to filter and sort content
function filterAndSortContent(
  content: ContentWithTopics[],
  filters: SelectionFilter,
  selectedIds: Set<string>
): ContentWithTopics[] {
  let filtered = [...content];

  // Apply topic filter with smart deduplication
  if (filters.selectedTopics.length > 0) {
    filtered = filtered.filter(item =>
      item.topics.some(topic => filters.selectedTopics.includes(topic.id))
    );
  }

  // Apply search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.topics.some(topic => topic.name.toLowerCase().includes(query))
    );
  }

  // Apply selection filter
  if (filters.showSelectedOnly) {
    filtered = filtered.filter(item => selectedIds.has(item.id));
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (filters.sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'mastery_percentage':
        aValue = a.mastery_percentage || 0;
        bValue = b.mastery_percentage || 0;
        break;
      case 'questions_due_count':
        aValue = a.questions_due_count || 0;
        bValue = b.questions_due_count || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
}

function contentSelectionReducer(
  state: ContentSelectionState,
  action: ContentSelectionAction
): ContentSelectionState {
  switch (action.type) {
    case 'SET_CONTENT':
      const newAllContent = action.payload;
      const filteredAfterContentSet = filterAndSortContent(
        newAllContent,
        state.filters,
        state.selectedContentIds
      );
      return {
        ...state,
        allContent: newAllContent,
        filteredContent: filteredAfterContentSet,
        isLoading: false
      };

    case 'SET_TOPICS':
      return {
        ...state,
        allTopics: action.payload
      };

    case 'SELECT_CONTENT':
      const newSelectedIds = new Set(state.selectedContentIds);
      newSelectedIds.add(action.payload);
      const filteredAfterSelect = filterAndSortContent(
        state.allContent,
        state.filters,
        newSelectedIds
      );
      return {
        ...state,
        selectedContentIds: newSelectedIds,
        filteredContent: filteredAfterSelect,
        selectionCount: newSelectedIds.size
      };

    case 'DESELECT_CONTENT':
      const reducedSelectedIds = new Set(state.selectedContentIds);
      reducedSelectedIds.delete(action.payload);
      const filteredAfterDeselect = filterAndSortContent(
        state.allContent,
        state.filters,
        reducedSelectedIds
      );
      return {
        ...state,
        selectedContentIds: reducedSelectedIds,
        filteredContent: filteredAfterDeselect,
        selectionCount: reducedSelectedIds.size
      };

    case 'TOGGLE_CONTENT':
      const toggledIds = new Set(state.selectedContentIds);
      if (toggledIds.has(action.payload)) {
        toggledIds.delete(action.payload);
      } else {
        toggledIds.add(action.payload);
      }
      const filteredAfterToggle = filterAndSortContent(
        state.allContent,
        state.filters,
        toggledIds
      );
      return {
        ...state,
        selectedContentIds: toggledIds,
        filteredContent: filteredAfterToggle,
        selectionCount: toggledIds.size
      };

    case 'SELECT_ALL_VISIBLE':
      const allVisibleIds = new Set([
        ...state.selectedContentIds,
        ...state.filteredContent.map(item => item.id)
      ]);
      const filteredAfterSelectAll = filterAndSortContent(
        state.allContent,
        state.filters,
        allVisibleIds
      );
      return {
        ...state,
        selectedContentIds: allVisibleIds,
        filteredContent: filteredAfterSelectAll,
        selectionCount: allVisibleIds.size
      };

    case 'CLEAR_SELECTION':
      const clearedIds = new Set<string>();
      const filteredAfterClear = filterAndSortContent(
        state.allContent,
        state.filters,
        clearedIds
      );
      return {
        ...state,
        selectedContentIds: clearedIds,
        filteredContent: filteredAfterClear,
        selectionCount: 0
      };

    case 'SET_FILTER':
      const newFilters = { ...state.filters, ...action.payload };
      return {
        ...state,
        filters: newFilters
      };

    case 'APPLY_FILTERS':
      const filteredAfterApply = filterAndSortContent(
        state.allContent,
        state.filters,
        state.selectedContentIds
      );
      return {
        ...state,
        filteredContent: filteredAfterApply
      };

    case 'CLEAR_FILTERS':
      const resetFilters: SelectionFilter = {
        selectedTopics: [],
        showSelectedOnly: false,
        searchQuery: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
      };
      const filteredAfterReset = filterAndSortContent(
        state.allContent,
        resetFilters,
        state.selectedContentIds
      );
      return {
        ...state,
        filters: resetFilters,
        filteredContent: filteredAfterReset
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'RESTORE_SELECTION':
      const restoredIds = new Set(action.payload);
      const filteredAfterRestore = filterAndSortContent(
        state.allContent,
        state.filters,
        restoredIds
      );
      return {
        ...state,
        selectedContentIds: restoredIds,
        filteredContent: filteredAfterRestore,
        selectionCount: restoredIds.size
      };

    default:
      return state;
  }
}

// Context creation
const ContentSelectionContext = createContext<{
  state: ContentSelectionState;
  dispatch: React.Dispatch<ContentSelectionAction>;
} | null>(null);

// Context provider with local storage persistence
export function ContentSelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contentSelectionReducer, initialState);

  // Persist selection to localStorage
  useEffect(() => {
    const selectedIds = Array.from(state.selectedContentIds);
    if (selectedIds.length > 0) {
      localStorage.setItem('stoke-selected-content', JSON.stringify(selectedIds));
    } else {
      localStorage.removeItem('stoke-selected-content');
    }
  }, [state.selectedContentIds]);

  // Restore selection from localStorage on mount
  useEffect(() => {
    const savedSelection = localStorage.getItem('stoke-selected-content');
    if (savedSelection) {
      try {
        const selectedIds = JSON.parse(savedSelection);
        if (Array.isArray(selectedIds)) {
          dispatch({ type: 'RESTORE_SELECTION', payload: selectedIds });
        }
      } catch (error) {
        console.warn('Failed to restore content selection:', error);
        localStorage.removeItem('stoke-selected-content');
      }
    }
  }, []);

  // Auto-apply filters when filter state changes
  useEffect(() => {
    dispatch({ type: 'APPLY_FILTERS' });
  }, [state.filters]);

  return (
    <ContentSelectionContext.Provider value={{ state, dispatch }}>
      {children}
    </ContentSelectionContext.Provider>
  );
}

// Custom hook for using the context
export function useContentSelection() {
  const context = useContext(ContentSelectionContext);
  if (!context) {
    throw new Error('useContentSelection must be used within a ContentSelectionProvider');
  }
  return context;
}

// Action creators for cleaner component code
export const contentSelectionActions = {
  setContent: (content: ContentWithTopics[]) => ({ type: 'SET_CONTENT' as const, payload: content }),
  setTopics: (topics: TopicRow[]) => ({ type: 'SET_TOPICS' as const, payload: topics }),
  selectContent: (id: string) => ({ type: 'SELECT_CONTENT' as const, payload: id }),
  deselectContent: (id: string) => ({ type: 'DESELECT_CONTENT' as const, payload: id }),
  toggleContent: (id: string) => ({ type: 'TOGGLE_CONTENT' as const, payload: id }),
  selectAllVisible: () => ({ type: 'SELECT_ALL_VISIBLE' as const }),
  clearSelection: () => ({ type: 'CLEAR_SELECTION' as const }),
  setFilter: (filter: Partial<SelectionFilter>) => ({ type: 'SET_FILTER' as const, payload: filter }),
  clearFilters: () => ({ type: 'CLEAR_FILTERS' as const }),
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, payload: loading }),
  setError: (error: string | null) => ({ type: 'SET_ERROR' as const, payload: error })
}; 