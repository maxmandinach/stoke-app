'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { SessionConfigurationProvider } from '@/contexts/SessionConfigurationContext';
import StokeHeader from '@/components/modern/StokeHeader';
import HorizontalFilterBar from '@/components/modern/HorizontalFilterBar';
import SelectionSummary from '@/components/modern/SelectionSummary';
import BottomNavigation from '@/components/modern/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, PlayCircle, FileText, BookOpen, Mic, Check } from 'lucide-react';

// Mock data for demonstration (in production, this would come from Supabase)
const mockContent = [
  {
    id: '1',
    title: 'The Science of Learning: How Memory Works',
    source: 'podcast' as const,
    source_url: 'https://example.com/podcast/1',
    transcript: 'Sample transcript...',
    duration_hours: 1.5,
    quick_summary: '• Memory formation involves three key stages\n• Spaced repetition improves retention\n• Sleep consolidates learning\n• Active recall beats passive review',
    full_summary: 'This episode explores the fascinating world of memory formation and retention. Dr. Sarah Chen discusses the three critical stages of memory: encoding, storage, and retrieval. She explains how spaced repetition leverages the forgetting curve to improve long-term retention and why active recall is more effective than passive review.',
    questions: [
      {
        id: 'q1',
        content: 'What are the three key stages of memory formation?',
        type: 'factual' as const,
        difficulty_level: 2 as const,
        estimated_time_seconds: 30,
        created_by_ai: true,
        confidence: 'high' as const
      }
    ],
    topics: [
      {
        id: 't1',
        name: 'Science',
        slug: 'science',
        description: 'Scientific discoveries and research',
        color: '#7C3AED',
        icon: '🔬',
        sort_order: 10,
        content_count: 12,
        total_questions: 156,
        active_learners_count: 45,
        parent_topic_id: null,
        depth_level: 0,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    created_at: '2024-01-15T10:00:00Z',
    processed_at: '2024-01-15T10:30:00Z',
    processing_status: 'completed' as const,
    content_version: 1,
    total_questions: 12,
    average_difficulty: 2.5,
    estimated_read_time_minutes: 23,
    mastery_percentage: 75,
    questions_due_count: 3,
    last_session_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    title: 'Building Habits That Stick: The Psychology of Behavior Change',
    source: 'video' as const,
    source_url: 'https://example.com/video/2',
    transcript: 'Sample transcript...',
    duration_hours: 0.75,
    quick_summary: '• Habits form through repetition and reward\n• Environment design influences behavior\n• Start small for lasting change',
    full_summary: 'This video explores the psychology behind habit formation and provides practical strategies for building habits that last. The speaker explains how environmental design can make good habits easier and bad habits harder.',
    questions: [
      {
        id: 'q2',
        content: 'What role does environment play in habit formation?',
        type: 'conceptual' as const,
        difficulty_level: 3 as const,
        estimated_time_seconds: 45,
        created_by_ai: true,
        confidence: 'high' as const
      }
    ],
    topics: [
      {
        id: 't2',
        name: 'Personal Development',
        slug: 'personal-development',
        description: 'Self-improvement and life skills',
        color: '#F59E0B',
        icon: '🌱',
        sort_order: 20,
        content_count: 18,
        total_questions: 234,
        active_learners_count: 78,
        parent_topic_id: null,
        depth_level: 0,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    created_at: '2024-01-20T14:00:00Z',
    processed_at: '2024-01-20T14:15:00Z',
    processing_status: 'completed' as const,
    content_version: 1,
    total_questions: 8,
    average_difficulty: 2.8,
    estimated_read_time_minutes: 15,
    mastery_percentage: 45,
    questions_due_count: 0,
    last_session_at: null
  },
  {
    id: '3',
    title: 'The Future of AI: Opportunities and Challenges',
    source: 'interview' as const,
    source_url: 'https://example.com/interview/3',
    transcript: 'Sample transcript...',
    duration_hours: 2.0,
    quick_summary: '• AI will transform multiple industries\n• Ethical considerations are paramount\n• Human-AI collaboration is key\n• Education must adapt to AI era',
    full_summary: 'In this comprehensive interview, AI researcher Dr. Michael Johnson discusses the transformative potential of artificial intelligence across industries. He addresses ethical considerations, the importance of human-AI collaboration, and how education systems need to evolve.',
    questions: [
      {
        id: 'q3',
        content: 'What are the key ethical considerations for AI development?',
        type: 'reflection' as const,
        difficulty_level: 4 as const,
        estimated_time_seconds: 60,
        created_by_ai: true,
        confidence: 'medium' as const
      }
    ],
    topics: [
      {
        id: 't3',
        name: 'Technology',
        slug: 'technology',
        description: 'Technology trends and innovation',
        color: '#3B82F6',
        icon: '💻',
        sort_order: 30,
        content_count: 25,
        total_questions: 312,
        active_learners_count: 92,
        parent_topic_id: null,
        depth_level: 0,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 't4',
        name: 'Education',
        slug: 'education',
        description: 'Learning and educational insights',
        color: '#06B6D4',
        icon: '📚',
        sort_order: 40,
        content_count: 15,
        total_questions: 198,
        active_learners_count: 56,
        parent_topic_id: null,
        depth_level: 0,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    created_at: '2024-01-25T09:00:00Z',
    processed_at: '2024-01-25T09:45:00Z',
    processing_status: 'completed' as const,
    content_version: 1,
    total_questions: 15,
    average_difficulty: 3.2,
    estimated_read_time_minutes: 30,
    mastery_percentage: 20,
    questions_due_count: 8,
    last_session_at: '2024-01-26T16:00:00Z'
  }
];

const mockTopics = [
  {
    id: 't1',
    name: 'Science',
    slug: 'science',
    description: 'Scientific discoveries and research',
    color: '#7C3AED',
    icon: '🔬',
    sort_order: 10,
    content_count: 12,
    total_questions: 156,
    active_learners_count: 45,
    parent_topic_id: null,
    depth_level: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 't2',
    name: 'Personal Development',
    slug: 'personal-development',
    description: 'Self-improvement and life skills',
    color: '#F59E0B',
    icon: '🌱',
    sort_order: 20,
    content_count: 18,
    total_questions: 234,
    active_learners_count: 78,
    parent_topic_id: null,
    depth_level: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 't3',
    name: 'Technology',
    slug: 'technology',
    description: 'Technology trends and innovation',
    color: '#3B82F6',
    icon: '💻',
    sort_order: 30,
    content_count: 25,
    total_questions: 312,
    active_learners_count: 92,
    parent_topic_id: null,
    depth_level: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 't4',
    name: 'Education',
    slug: 'education',
    description: 'Learning and educational insights',
    color: '#06B6D4',
    icon: '📚',
    sort_order: 40,
    content_count: 15,
    total_questions: 198,
    active_learners_count: 56,
    parent_topic_id: null,
    depth_level: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Loading Skeleton Components
const ContentCardSkeleton = memo(() => (
  <div className="content-card-skeleton animate-fade-in" role="status" aria-label="Loading content">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="loading-skeleton w-16 h-6"></div>
        <div className="loading-skeleton w-12 h-4"></div>
      </div>
      <div className="loading-skeleton-avatar w-6 h-6"></div>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="loading-skeleton-title w-full"></div>
      <div className="loading-skeleton-title w-3/4"></div>
    </div>
    
    <div className="flex gap-2 mb-4">
      <div className="loading-skeleton w-16 h-5 rounded-full"></div>
      <div className="loading-skeleton w-20 h-5 rounded-full"></div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="loading-skeleton w-16 h-4"></div>
        <div className="loading-skeleton w-8 h-4"></div>
      </div>
      <div className="loading-skeleton w-full h-2 rounded-full"></div>
    </div>
    
    <span className="sr-only">Loading content card...</span>
  </div>
));

ContentCardSkeleton.displayName = 'ContentCardSkeleton';

// Enhanced Content Type Badge Component
const ContentTypeBadge = memo(({ source }: { source: string }) => {
  const getTypeConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return { 
          label: 'Podcast', 
          icon: <Mic className="w-3 h-3" aria-hidden="true" />,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      case 'video':
        return { 
          label: 'Video', 
          icon: <PlayCircle className="w-3 h-3" aria-hidden="true" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'article':
        return { 
          label: 'Article', 
          icon: <FileText className="w-3 h-3" aria-hidden="true" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'interview':
        return { 
          label: 'Interview', 
          icon: <Mic className="w-3 h-3" aria-hidden="true" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      default:
        return { 
          label: 'Content', 
          icon: <BookOpen className="w-3 h-3" aria-hidden="true" />,
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
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors duration-200",
        config.bgColor,
        config.textColor,
        config.borderColor
      )}
      role="img"
      aria-label={`Content type: ${config.label}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
});

ContentTypeBadge.displayName = 'ContentTypeBadge';

// Enhanced Content Card Component
const ContentCard = memo(({ content }: { content: ContentWithTopics }) => {
  const { state, dispatch } = useContentSelection();
  const isSelected = state.selectedContentIds.has(content.id);

  const toggleSelection = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch(contentSelectionActions.toggleContent(content.id));
  }, [content.id, dispatch]);

  const handleCardClick = useCallback(() => {
    toggleSelection();
  }, [toggleSelection]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelection();
    }
  }, [toggleSelection]);

  const progressPercentage = content.mastery_percentage || 0;
  const durationMinutes = Math.round((content.duration_hours || 0) * 60);

  return (
    <Card 
      className={cn(
        // Base card styles with enhanced animations
        "content-card group animate-fade-in",
        "bg-white rounded-lg shadow-sm hover:shadow-lg",
        "transition-all duration-300 ease-out cursor-pointer",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
        // Selection states with enhanced visual feedback
        isSelected 
          ? "content-card selected ring-2 ring-blue-500 bg-blue-50/40 shadow-lg border-blue-300" 
          : "border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-1",
        // Responsive touch targets
        "min-h-[140px] md:min-h-[160px]"
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${content.title} - ${durationMinutes} minute ${content.source}`}
    >
      {/* Selection Checkbox - Enhanced with better accessibility */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={toggleSelection}
          onKeyDown={(e) => e.stopPropagation()}
          className={cn(
            "touch-target-sm rounded-full border-2 transition-all duration-200 ease-out",
            "hover:scale-110 focus-visible:scale-110 active:scale-95",
            "focus-ring-inset",
            isSelected
              ? "bg-blue-600 border-blue-600 text-white shadow-sm hover:bg-blue-700"
              : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm hover:bg-gray-50"
          )}
          aria-label={`${isSelected ? 'Deselect' : 'Select'} ${content.title}`}
          aria-pressed={isSelected}
        >
          {isSelected && <Check className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>

      <CardHeader className="pb-3">
        <div className="pr-8 space-y-3">
          {/* Content Type Badge and Duration */}
          <div className="flex items-center gap-3">
            <ContentTypeBadge source={content.source} />
            <div 
              className="flex items-center gap-1 text-caption"
              role="text"
              aria-label={`Duration: ${durationMinutes} minutes`}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{durationMinutes}min</span>
            </div>
          </div>
          
          {/* Title - Enhanced typography */}
          <CardTitle className={cn(
            "text-heading-3 leading-tight line-clamp-2",
            "transition-colors duration-200 group-hover:text-gray-800",
            isSelected ? "text-blue-900" : "text-gray-900"
          )}>
            {content.title}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Topics - Enhanced with better accessibility */}
        {content.topics && content.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Content topics">
            {content.topics.slice(0, 3).map((topic) => (
              <Badge 
                key={topic.id} 
                variant="secondary" 
                className={cn(
                  "text-xs font-medium transition-all duration-200 hover:scale-105",
                  isSelected 
                    ? "bg-blue-100 text-blue-800 border-blue-200" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                )}
                role="listitem"
                aria-label={`Topic: ${topic.name}`}
              >
                {topic.icon && <span className="mr-1" aria-hidden="true">{topic.icon}</span>}
                {topic.name}
              </Badge>
            ))}
            {content.topics.length > 3 && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-gray-100 text-gray-600 border-gray-200"
                role="listitem"
                aria-label={`${content.topics.length - 3} additional topics`}
              >
                +{content.topics.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Progress Bar - Enhanced with better accessibility */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-medium text-gray-600">Progress</span>
            <span className={cn(
              "text-body-sm font-semibold",
              isSelected ? "text-blue-700" : "text-gray-900"
            )}>
              {progressPercentage}%
            </span>
          </div>
          <div 
            className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Learning progress: ${progressPercentage}%`}
          >
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                isSelected 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600" 
                  : "bg-gradient-to-r from-gray-400 to-gray-500",
                "transform origin-left group-hover:scale-x-105"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ContentCard.displayName = 'ContentCard';

// Enhanced Content Grid Component
const ContentGrid = memo(() => {
  const { state, dispatch } = useContentSelection();

  if (state.isLoading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite" aria-label="Loading content library">
        {/* Loading header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 text-body text-gray-600">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" aria-hidden="true"></div>
            <span className="font-medium">Loading your content library...</span>
          </div>
        </div>
        
        {/* Loading skeleton grid */}
        <div className={cn(
          "grid gap-4 md:gap-6",
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          "auto-rows-fr"
        )}>
          {Array.from({ length: 6 }, (_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-16" role="alert" aria-live="assertive">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto animate-fade-in">
          <div className="text-heading-3 text-red-800 mb-3">Unable to load content</div>
          <div className="text-body text-red-700 mb-4">{state.error}</div>
          <Button 
            variant="outline" 
            className="btn-secondary focus-ring"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (state.filteredContent.length === 0) {
    const hasFilters = state.filters.selectedTopics.length > 0 || 
                      state.filters.searchQuery || 
                      state.filters.showSelectedOnly;
    
    return (
      <div className="text-center py-16" role="status" aria-live="polite">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto animate-fade-in">
          <div className="text-heading-3 text-gray-800 mb-3">
            {hasFilters ? 'No content matches your filters' : 'Your library is empty'}
          </div>
          <div className="text-body text-gray-600 mb-4">
            {hasFilters 
              ? 'Try adjusting your search or filter criteria' 
              : 'Add some content to get started with your learning journey'
            }
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={() => {
                dispatch(contentSelectionActions.clearFilters());
              }}
              className="btn-secondary focus-ring"
            >
              Clear all filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "grid gap-4 md:gap-6",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        "auto-rows-fr"
      )}
      role="grid"
      aria-label={`Content library with ${state.filteredContent.length} items`}
    >
      {state.filteredContent.map((content, index) => (
        <div key={content.id} role="gridcell" style={{ animationDelay: `${index * 50}ms` }}>
          <ContentCard content={content} />
        </div>
      ))}
    </div>
  );
});

ContentGrid.displayName = 'ContentGrid';

// Enhanced Main Component
export default function ContentLibrary() {
  const { state, dispatch } = useContentSelection();
  const [searchValue, setSearchValue] = useState('');
  const [activeView, setActiveView] = useState<'all' | 'selected'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Load mock data on component mount
  useEffect(() => {
    dispatch(contentSelectionActions.setLoading(true));
    
    // Simulate loading delay with realistic timing
    const loadingTimer = setTimeout(() => {
      dispatch(contentSelectionActions.setContent(mockContent));
      dispatch(contentSelectionActions.setTopics(mockTopics));
    }, 800);

    return () => clearTimeout(loadingTimer);
  }, [dispatch]);

  // Update search filter when searchValue changes
  useEffect(() => {
    dispatch(contentSelectionActions.setFilter({ searchQuery: searchValue }));
  }, [searchValue, dispatch]);

  // Get selected content for counts and actions
  const selectedContent = state.filteredContent.filter(content => 
    state.selectedContentIds.has(content.id)
  );

  // Enhanced handler functions
  const handleSelectAll = useCallback(() => {
    const allIds = state.filteredContent.map(content => content.id);
    allIds.forEach(id => {
      if (!state.selectedContentIds.has(id)) {
        dispatch(contentSelectionActions.toggleContent(id));
      }
    });
  }, [state.filteredContent, state.selectedContentIds, dispatch]);

  const handleViewChange = useCallback((view: 'all' | 'selected') => {
    setActiveView(view);
    dispatch(contentSelectionActions.setFilter({ showSelectedOnly: view === 'selected' }));
  }, [dispatch]);

  const handleClearSelection = useCallback(() => {
    state.selectedContentIds.forEach(id => {
      dispatch(contentSelectionActions.toggleContent(id));
    });
  }, [state.selectedContentIds, dispatch]);

  const handleTabChange = useCallback((tab: 'library' | 'discover' | 'add') => {
    console.log('Tab changed to:', tab);
    // TODO: Implement navigation logic with proper routing
  }, []);

  const handleFilterClick = useCallback(() => {
    console.log('Filter clicked');
    // TODO: Implement filter modal/sidebar with advanced filtering
  }, []);

  const handleContentSelection = useCallback((selectedIds: string[]) => {
    console.log('Content selected:', selectedIds);
    // TODO: Implement navigation to session configuration with proper routing
  }, []);

  const handleContinue = useCallback(() => {
    const selectedIds = Array.from(state.selectedContentIds);
    handleContentSelection(selectedIds);
  }, [state.selectedContentIds, handleContentSelection]);

  return (
    <SessionConfigurationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Modern Header with enhanced typography */}
        <StokeHeader title="Choose Your Learning Content" />
        
        {/* Horizontal Filter Bar with enhanced accessibility */}
        <HorizontalFilterBar 
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          contentCount={state.allContent.length}
          selectedCount={selectedContent.length}
          onSelectAll={handleSelectAll}
          activeView={activeView}
          onViewChange={handleViewChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onFilterClick={handleFilterClick}
        />
        
        {/* Main Content Area with proper spacing and accessibility */}
        <main 
          className="pt-[120px] pb-20 lg:pb-8 px-4 sm:px-6 lg:px-8"
          role="main"
          aria-label="Content library"
        >
          <div className="max-w-7xl mx-auto">
            <ContentGrid />
          </div>
        </main>
        
        {/* Floating Selection Summary with enhanced animations */}
        <SelectionSummary 
          selectedCount={selectedContent.length}
          onContinue={handleContinue}
          onClear={handleClearSelection}
        />
        
        {/* Bottom Navigation with proper accessibility */}
        <BottomNavigation 
          activeTab="library"
          onTabChange={handleTabChange}
        />
      </div>
    </SessionConfigurationProvider>
  );
} 