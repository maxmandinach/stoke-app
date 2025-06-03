'use client';

import React, { useEffect } from 'react';
import { useContentSelection, contentSelectionActions } from '@/contexts/ContentSelectionContext';
import { SessionConfigurationProvider } from '@/contexts/SessionConfigurationContext';
import { AppCoordinator } from './AppCoordinator';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import ModernContentSelectionInterface from './ModernContentSelectionInterface';
import { ErrorBoundary } from './ui/ErrorBoundary';

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

export default function ContentLibrary() {
  const { dispatch } = useContentSelection();
  const { useNewDesign } = useFeatureFlags();

  // Load mock data on component mount
  useEffect(() => {
    dispatch(contentSelectionActions.setLoading(true));
    
    // Simulate loading delay
    setTimeout(() => {
      dispatch(contentSelectionActions.setContent(mockContent));
      dispatch(contentSelectionActions.setTopics(mockTopics));
    }, 500);
  }, [dispatch]);

  // Callback handler for content selection
  const handleContentSelection = (selectedIds: string[]) => {
    // This should trigger the same flow as the existing AppCoordinator
    // Navigate to session configuration with selected content
    console.log('Content selected:', selectedIds);
    // TODO: Implement navigation to session configuration
  };

  return (
    <SessionConfigurationProvider>
      {useNewDesign ? (
        <ErrorBoundary fallback={<AppCoordinator />}>
          <ModernContentSelectionInterface onContinue={handleContentSelection} />
        </ErrorBoundary>
      ) : (
        <AppCoordinator />
      )}
    </SessionConfigurationProvider>
  );
}

// ... existing code ... 