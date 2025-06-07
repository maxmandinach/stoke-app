'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

// Content Type Badge Component
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

// Content Card Component
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

// Content Grid Component
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

export default function ContentLibrary() {
  const { state, dispatch } = useContentSelection();
  const [searchValue, setSearchValue] = useState('');
  const [activeView, setActiveView] = useState<'all' | 'selected'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Load mock data on component mount
  useEffect(() => {
    dispatch(contentSelectionActions.setLoading(true));
    
    // Simulate loading delay
    setTimeout(() => {
      dispatch(contentSelectionActions.setContent(mockContent));
      dispatch(contentSelectionActions.setTopics(mockTopics));
    }, 500);
  }, [dispatch]);

  // Update search filter when searchValue changes
  useEffect(() => {
    dispatch(contentSelectionActions.setFilter({ searchQuery: searchValue }));
  }, [searchValue, dispatch]);

  // Get selected content for counts and actions
  const selectedContent = state.filteredContent.filter(content => 
    state.selectedContentIds.has(content.id)
  );

  // Handler functions for the new components
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
    // TODO: Implement navigation logic
  }, []);

  const handleFilterClick = useCallback(() => {
    console.log('Filter clicked');
    // TODO: Implement filter modal/sidebar
  }, []);

  // Callback handler for content selection continuation
  const handleContentSelection = useCallback((selectedIds: string[]) => {
    // Navigate to session configuration with selected content
    console.log('Content selected:', selectedIds);
    // TODO: Implement navigation to session configuration
  }, []);

  const handleContinue = useCallback(() => {
    const selectedIds = Array.from(state.selectedContentIds);
    handleContentSelection(selectedIds);
  }, [state.selectedContentIds, handleContentSelection]);

  return (
    <SessionConfigurationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Modern Header */}
        <StokeHeader title="Choose Your Learning Content" />
        
        {/* Horizontal Filter Bar */}
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
        
        {/* Main Content Area with proper spacing */}
        <main className="pt-[120px] pb-20 lg:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <ContentGrid />
          </div>
        </main>
        
        {/* Floating Selection Summary */}
        <SelectionSummary 
          selectedCount={selectedContent.length}
          onContinue={handleContinue}
          onClear={handleClearSelection}
        />
        
        {/* Bottom Navigation (Mobile Only) */}
        <BottomNavigation 
          activeTab="library"
          onTabChange={handleTabChange}
        />
      </div>
    </SessionConfigurationProvider>
  );
} 