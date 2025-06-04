'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, CheckCircle2, Circle, Clock, BookOpen, Users, X } from 'lucide-react';
import { useContentSelection, contentSelectionActions, ContentWithTopics } from '@/contexts/ContentSelectionContext';
import { MemoryWavesLogo } from '../MemoryWavesLogo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock data for demonstration (same as ContentLibrary.tsx)
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

// Content Type Configurations
const getContentTypeConfig = (source: string) => {
  const configs = {
    podcast: { label: 'Podcast', icon: '🎧', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    video: { label: 'Video', icon: '📹', color: 'bg-red-100 text-red-800 border-red-200' },
    article: { label: 'Article', icon: '📄', color: 'bg-green-100 text-green-800 border-green-200' },
    book: { label: 'Book', icon: '📚', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    conversation: { label: 'Chat', icon: '💬', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    interview: { label: 'Interview', icon: '🎤', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    lecture: { label: 'Lecture', icon: '🎓', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  };
  return configs[source as keyof typeof configs] || { label: 'Content', icon: '📋', color: 'bg-gray-100 text-gray-800 border-gray-200' };
};

// Content Type Badge Component
function ContentTypeBadge({ source }: { source: string }) {
  const config = getContentTypeConfig(source);
  
  return (
    <Badge variant="secondary" className={cn("font-medium text-xs", config.color)}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

// Selection Progress Header
function SelectionHeader() {
  const { state } = useContentSelection();
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <MemoryWavesLogo size="lg" animated />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Select Content</h1>
          <p className="text-muted-foreground">
            Choose episodes to include in your learning session
          </p>
        </div>
      </div>
      
      {state.selectionCount > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-primary">
                {state.selectionCount} episode{state.selectionCount !== 1 ? 's' : ''} selected
              </div>
              <Button size="sm" className="h-8">
                Continue to Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Search and Filter Bar
function SearchAndFilters() {
  const { state, dispatch } = useContentSelection();
  const [searchInput, setSearchInput] = useState(state.filters.searchQuery);
  
  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    dispatch(contentSelectionActions.setFilter({ searchQuery: value }));
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    dispatch(contentSelectionActions.clearFilters());
  }, [dispatch]);

  const hasActiveFilters = state.filters.searchQuery || 
                          state.filters.selectedTopics.length > 0 || 
                          state.filters.showSelectedOnly;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search episodes and topics..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Button 
          variant="outline" 
          size="default"
          className="h-11 px-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="h-11 px-4"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Topic Filters */}
      {state.allTopics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {state.allTopics.slice(0, 8).map(topic => {
            const isSelected = state.filters.selectedTopics.includes(topic.id);
            return (
              <Button
                key={topic.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  const newTopics = isSelected
                    ? state.filters.selectedTopics.filter(id => id !== topic.id)
                    : [...state.filters.selectedTopics, topic.id];
                  dispatch(contentSelectionActions.setFilter({ selectedTopics: newTopics }));
                }}
              >
                {topic.icon && <span className="mr-1">{topic.icon}</span>}
                {topic.name}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Content Tabs (All vs Selected)
function ContentTabs() {
  const { state, dispatch } = useContentSelection();
  
  return (
    <Tabs 
      value={state.filters.showSelectedOnly ? "selected" : "all"} 
      onValueChange={(value) => 
        dispatch(contentSelectionActions.setFilter({ showSelectedOnly: value === "selected" }))
      }
      className="mb-6"
    >
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          All Episodes ({state.allContent.length})
        </TabsTrigger>
        <TabsTrigger 
          value="selected" 
          disabled={state.selectionCount === 0}
          className="flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Selected ({state.selectionCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

// Bulk Actions Bar
function BulkActions() {
  const { state, dispatch } = useContentSelection();
  
  if (state.filteredContent.length === 0) return null;

  const allVisibleSelected = state.filteredContent.every(content => 
    state.selectedContentIds.has(content.id)
  );

  return (
    <div className="flex items-center justify-between py-3 px-1 mb-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(contentSelectionActions.selectAllVisible())}
          disabled={allVisibleSelected}
        >
          Select All Visible ({state.filteredContent.length})
        </Button>
        
        {state.selectionCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(contentSelectionActions.clearSelection())}
            className="text-destructive hover:text-destructive"
          >
            Clear Selection
          </Button>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {state.filteredContent.length} episode{state.filteredContent.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// Individual Content Card
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
        isSelected && "ring-2 ring-primary bg-primary/5 shadow-md"
      )}
      onClick={toggleSelection}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <ContentTypeBadge source={content.source} />
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {Math.round(content.duration_hours * 60)}min
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                {content.total_questions} questions
              </div>
            </div>
            <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
              {content.title}
            </h3>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full transition-all",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleSelection();
            }}
          >
            {isSelected ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Topics */}
        {content.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.topics.slice(0, 3).map(topic => (
              <Badge 
                key={topic.id} 
                variant="outline" 
                className="text-xs py-0 h-5"
              >
                {topic.icon && <span className="mr-1">{topic.icon}</span>}
                {topic.name}
              </Badge>
            ))}
            {content.topics.length > 3 && (
              <Badge variant="outline" className="text-xs py-0 h-5">
                +{content.topics.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Progress and Due Questions */}
        <div className="flex items-center gap-4">
          {content.mastery_percentage !== undefined && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground">Progress:</span>
              <Progress value={content.mastery_percentage} className="flex-1 h-2" />
              <span className="text-xs font-medium">
                {Math.round(content.mastery_percentage)}%
              </span>
            </div>
          )}
          
          {content.questions_due_count && content.questions_due_count > 0 && (
            <Badge variant="destructive" className="text-xs">
              {content.questions_due_count} due
            </Badge>
          )}
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
        <div className="flex items-center gap-3">
          <MemoryWavesLogo size="sm" animated />
          <span className="text-muted-foreground">Loading your content library...</span>
        </div>
      </div>
    );
  }
  
  if (state.error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <div className="text-destructive font-medium mb-2">Error loading content</div>
          <div className="text-muted-foreground text-sm">{state.error}</div>
        </CardContent>
      </Card>
    );
  }
  
  if (state.filteredContent.length === 0) {
    const hasFilters = state.filters.selectedTopics.length > 0 || 
                      state.filters.searchQuery || 
                      state.filters.showSelectedOnly;
    
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            {hasFilters ? 'No episodes match your filters' : 'No episodes in your library yet'}
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={() => dispatch(contentSelectionActions.clearFilters())}
            >
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>
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

// Main Content Selection Interface
export function ContentSelectionInterface() {
  const { dispatch } = useContentSelection();

  // Load mock data on component mount
  useEffect(() => {
    dispatch(contentSelectionActions.setLoading(true));
    
    // Simulate loading delay
    setTimeout(() => {
      dispatch(contentSelectionActions.setContent(mockContent));
      dispatch(contentSelectionActions.setTopics(mockTopics));
    }, 500);
  }, [dispatch]);

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <SelectionHeader />
      <SearchAndFilters />
      <ContentTabs />
      <BulkActions />
      <ContentGrid />
    </div>
  );
} 