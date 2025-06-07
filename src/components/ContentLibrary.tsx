'use client';

import React, { useEffect, useState } from 'react';
import { useContentSelection, contentSelectionActions } from '@/contexts/ContentSelectionContext';
import { SessionConfigurationProvider } from '@/contexts/SessionConfigurationContext';
import StokeHeader from '@/components/modern/StokeHeader';
import ContentSectionHeader from '@/components/modern/ContentSectionHeader';
import FilterToolbar from '@/components/modern/FilterToolbar';
import SelectionSummary from '@/components/modern/SelectionSummary';
import BottomNavigation from '@/components/modern/BottomNavigation';

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

// Premium Loading Skeleton Component
const PremiumContentSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div>
          <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-16 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="space-y-3 mb-4">
      <div className="w-full h-5 bg-gray-200 rounded"></div>
      <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
    </div>
    <div className="flex gap-2 mb-4">
      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded-full"></div>
  </div>
);

export default function ContentLibrary() {
  const { state, dispatch } = useContentSelection();
  const [searchValue, setSearchValue] = useState('');
  const [selectedContent, setSelectedContent] = useState<string[]>([]);

  // Load mock data on component mount
  useEffect(() => {
    dispatch(contentSelectionActions.setLoading(true));
    
    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      dispatch(contentSelectionActions.setContent(mockContent));
    }, 1200); // Slightly longer to show premium loading

    return () => clearTimeout(loadingTimer);
  }, [dispatch]);

  // Update search filter when searchValue changes
  useEffect(() => {
    dispatch(contentSelectionActions.setFilter({ searchQuery: searchValue }));
  }, [searchValue, dispatch]);

  const handleSelectAll = () => {
    const allIds = state.filteredContent?.map(content => content.id) || [];
    setSelectedContent(allIds);
  };

  const handleContinue = () => {
    console.log('Continuing with selected content:', selectedContent);
  };

  const handleTabChange = (tab: string) => {
    console.log('Navigating to:', tab);
  };

  const handleClearSelection = () => {
    setSelectedContent([]);
  };

  const getSourceConfig = (source: string) => {
    switch (source) {
      case 'podcast':
        return { 
          icon: '🎧', 
          label: 'Podcast', 
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          accentColor: 'bg-orange-500'
        };
      case 'video':
        return { 
          icon: '📹', 
          label: 'Video', 
          color: 'bg-red-100 text-red-700 border-red-200',
          accentColor: 'bg-red-500'
        };
      case 'interview':
        return { 
          icon: '💬', 
          label: 'Interview', 
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          accentColor: 'bg-blue-500'
        };
      default:
        return { 
          icon: '📄', 
          label: 'Article', 
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          accentColor: 'bg-gray-500'
        };
    }
  };

  return (
    <SessionConfigurationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Professional Header */}
        <StokeHeader />
        
        {/* Content Section Introduction */}
        <ContentSectionHeader />
        
        {/* Modern Filter Toolbar */}
        <FilterToolbar 
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          contentCount={state.allContent?.length || 0}
          selectedCount={selectedContent.length}
          onSelectAll={handleSelectAll}
        />
        
        {/* Main Content Area with Proper Spacing */}
        <main className="pt-8 pb-28 md:pb-12" style={{ marginTop: '80px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {state.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PremiumContentSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {state.filteredContent?.map((content) => {
                  const isSelected = selectedContent.includes(content.id);
                  const sourceConfig = getSourceConfig(content.source);
                  
                  return (
                    <div 
                      key={content.id}
                      className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                        isSelected 
                          ? 'border-blue-500 shadow-xl shadow-blue-500/20 bg-gradient-to-br from-blue-50 to-white scale-[1.02]' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-2xl hover:shadow-gray-500/10 hover:scale-[1.01]'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedContent(prev => prev.filter(id => id !== content.id));
                        } else {
                          setSelectedContent(prev => [...prev, content.id]);
                        }
                      }}
                    >
                      {/* Premium Selection Indicator */}
                      <div className="absolute top-5 right-5 z-10">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' 
                            : 'border-gray-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 hover:scale-105'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Premium Content Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${sourceConfig.color}`}>
                            <span className="text-lg">{sourceConfig.icon}</span>
                            {sourceConfig.label}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                            <span className="font-medium">{Math.round(content.duration_hours * 60)}min</span>
                          </div>
                        </div>
                        
                        {/* Enhanced Title */}
                        <h3 className={`text-xl font-bold mb-3 leading-tight transition-all duration-300 ${
                          isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-gray-800'
                        }`}>
                          {content.title}
                        </h3>
                      </div>

                      {/* Premium Topics Section */}
                      {content.topics && content.topics.length > 0 && (
                        <div className="px-6 pb-4">
                          <div className="flex flex-wrap gap-2">
                            {content.topics.slice(0, 2).map((topic) => (
                              <span 
                                key={topic.id} 
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                                  isSelected 
                                    ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                    : 'bg-gray-100 text-gray-700 border-gray-200 group-hover:bg-gray-200'
                                }`}
                                style={{ 
                                  backgroundColor: topic.color ? `${topic.color}15` : undefined, 
                                  borderColor: topic.color ? `${topic.color}30` : undefined, 
                                  color: topic.color || undefined 
                                }}
                              >
                                <span className="text-sm">{topic.icon}</span>
                                {topic.name}
                              </span>
                            ))}
                            {content.topics.length > 2 && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                +{content.topics.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Premium Progress Section */}
                      <div className="px-6 pb-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">Learning Progress</span>
                            <span className={`text-sm font-bold ${
                              isSelected ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {content.mastery_percentage}%
                            </span>
                          </div>
                          <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ease-out ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700' 
                                  : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
                              }`}
                              style={{ width: `${content.mastery_percentage}%` }}
                            />
                            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-300 ${
                              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                            }`}></div>
                          </div>
                          
                          {/* Additional Metrics */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                            <span>{content.total_questions} questions</span>
                            <span>{content.questions_due_count} due</span>
                          </div>
                        </div>
                      </div>

                      {/* Premium Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none transition-opacity duration-300 ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                      }`}></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        
        {/* Selection Summary */}
        <SelectionSummary 
          selectedCount={selectedContent.length}
          onContinue={handleContinue}
          onClear={handleClearSelection}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab="library"
          onTabChange={handleTabChange}
        />
      </div>
    </SessionConfigurationProvider>
  );
} 