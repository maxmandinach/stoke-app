import { supabase } from '@/lib/supabase'
import type { 

  Question, 
  FeedbackType, 
  SessionType, 
  DifficultyLevel,
  ProcessingStatus,
  ContentSource
} from '@/types/database.types'

// Type definitions for shared content operations
export interface ContentSummaryVariants {
  quick_summary: string; // 4 bullet points per hour
  full_summary: string;  // 2 paragraphs per hour
  questions: Question[]; // 10-15 questions per hour
}

export interface UserContentProgress {
  content_id: string;
  mastery_percentage: number;
  questions_due_count: number;
  next_review_due_at: string | null;
  total_sessions: number;
  avg_accuracy: number;
}

export interface SessionPlan {
  content_ids: string[];
  selected_questions: Array<{
    content_id: string;
    question_id: string;
    question: Question;
    estimated_time_seconds: number;
  }>;
  estimated_total_time_minutes: number;
  difficulty_distribution: Record<DifficultyLevel, number>;
}

export interface QuestionResponse {
  content_id: string;
  question_id: string;
  feedback: FeedbackType;
  response_time_seconds: number;
}

// ============================================================================
// CONTENT MANAGEMENT: Shared content with pre-processed variants
// ============================================================================

/**
 * Create new content with processing status
 */
export async function createSharedContent(contentData: {
  title: string;
  source: ContentSource;
  source_url: string;
  transcript: string;
  duration_hours: number;
  topics?: string[];
}) {
  const { data, error } = await supabase
    .from('content')
    .insert([
      {
        ...contentData,
        processing_status: 'pending' as ProcessingStatus,
        content_version: 1,
        total_questions: 0,
        average_difficulty: 3.0,
        estimated_read_time_minutes: Math.ceil(contentData.duration_hours * 15)
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update content with processed variants (summaries and questions)
 */
export async function updateContentWithProcessedVariants(
  contentId: string,
  variants: ContentSummaryVariants,
  topicIds?: string[]
) {
  const totalQuestions = variants.questions.length;
  const averageDifficulty = variants.questions.reduce(
    (sum, q) => sum + q.difficulty_level, 0
  ) / totalQuestions || 3.0;

  // Update content with processed data
  const { data: content, error: contentError } = await supabase
    .from('content')
    .update({
      quick_summary: variants.quick_summary,
      full_summary: variants.full_summary,
      questions: variants.questions,
      total_questions: totalQuestions,
      average_difficulty: averageDifficulty,
      processing_status: 'completed' as ProcessingStatus,
      processed_at: new Date().toISOString()
    })
    .eq('id', contentId)
    .select()
    .single();

  if (contentError) throw contentError;

  // Update topic relationships if provided
  if (topicIds && topicIds.length > 0) {
    // Remove existing topic relationships
    await supabase
      .from('episode_topics')
      .delete()
      .eq('content_id', contentId);

    // Insert new topic relationships
    const topicRelationships = topicIds.map((topicId, index) => ({
      content_id: contentId,
      topic_id: topicId,
      relevance_score: Math.max(0.3, 1.0 - (index * 0.2)), // Decreasing relevance
      confidence_score: 0.8, // AI processing confidence
      assigned_by_ai: true,
      question_allocation_weight: 1.0 / topicIds.length
    }));

    const { error: topicError } = await supabase
      .from('episode_topics')
      .insert(topicRelationships);

    if (topicError) throw topicError;
  }

  return content;
}

/**
 * Get content with processing status
 */
export async function getContentWithStatus(contentId: string) {
  const { data, error } = await supabase
    .from('content')
    .select(`
      *,
      episode_topics (
        topic_id,
        relevance_score,
        topics (
          id,
          name,
          slug,
          color,
          icon
        )
      )
    `)
    .eq('id', contentId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all content that needs processing
 */
export async function getPendingContent() {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('processing_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// ============================================================================
// USER CONTENT LIBRARY: Individual user library management
// ============================================================================

/**
 * Add content to user's library
 */
export async function addContentToUserLibrary(userId: string, contentId: string) {
  // First check if content exists and is processed
  const { data: content, error: contentError } = await supabase
    .from('content')
    .select('id, total_questions, processing_status')
    .eq('id', contentId)
    .single();

  if (contentError) throw contentError;
  if (content.processing_status !== 'completed') {
    throw new Error('Content is not yet processed and available for learning');
  }

  // Add to user library
  const { data, error } = await supabase
    .from('user_content_library')
    .insert([
      {
        user_id: userId,
        content_id: contentId,
        mastery_percentage: 0,
        questions_due_count: content.total_questions
      }
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // unique violation
      throw new Error('Content already added to your library');
    }
    throw error;
  }

  return data;
}

/**
 * Get user's content library with progress
 */
export async function getUserContentLibrary(userId: string) {
  const { data, error } = await supabase
    .from('user_content_with_progress')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get user's content filtered by topic
 */
export async function getUserContentByTopic(userId: string, topicSlug: string) {
  const { data, error } = await supabase
    .from('user_content_with_progress')
    .select('*')
    .eq('user_id', userId)
    .contains('topic_names', [topicSlug])
    .order('mastery_percentage', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Remove content from user's library
 */
export async function removeContentFromUserLibrary(userId: string, contentId: string) {
  // Remove all user progress for this content
  await supabase
    .from('user_question_progress')
    .delete()
    .eq('user_id', userId)
    .eq('content_id', contentId);

  // Remove from library
  const { error } = await supabase
    .from('user_content_library')
    .delete()
    .eq('user_id', userId)
    .eq('content_id', contentId);

  if (error) throw error;
}

// ============================================================================
// SESSION PLANNING: Intelligent question selection
// ============================================================================

/**
 * Get due questions for review
 */
export async function getDueQuestions(
  userId: string,
  options?: {
    contentIds?: string[];
    maxQuestions?: number;
    difficultyPreference?: DifficultyLevel;
    includeOverdue?: boolean;
  }
) {
  const { data, error } = await supabase.rpc('get_user_due_questions', {
    user_id_param: userId,
    content_ids_param: options?.contentIds || null,
    max_questions_param: options?.maxQuestions || 20,
    difficulty_preference_param: options?.difficultyPreference || null,
    include_overdue_param: options?.includeOverdue ?? true
  });

  if (error) throw error;
  return data;
}

/**
 * Plan a learning session with intelligent question selection
 */
export async function planLearningSession(
  userId: string,
  targetDurationMinutes: number,

  options?: {
    contentIds?: string[];
    difficultyPreference?: DifficultyLevel;
  }
): Promise<SessionPlan> {
  // Get due questions
  const dueQuestions = await getDueQuestions(userId, {
    contentIds: options?.contentIds,
    maxQuestions: Math.ceil(targetDurationMinutes * 2), // ~30 seconds per question
    difficultyPreference: options?.difficultyPreference
  });

  // Calculate time estimates and select questions
  let totalTimeSeconds = 0;
  const selectedQuestions: SessionPlan['selected_questions'] = [];
  const difficultyDistribution: Record<DifficultyLevel, number> = {
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
  };

  for (const dueQuestion of dueQuestions) {
    const question = dueQuestion.question as Question;
    const estimatedTime = question.estimated_time_seconds || 30;
    
    if (totalTimeSeconds + estimatedTime <= targetDurationMinutes * 60) {
      selectedQuestions.push({
        content_id: dueQuestion.content_id,
        question_id: dueQuestion.question_id,
        question,
        estimated_time_seconds: estimatedTime
      });
      
      totalTimeSeconds += estimatedTime;
      difficultyDistribution[question.difficulty_level]++;
    }
  }

  return {
    content_ids: [...new Set(selectedQuestions.map(q => q.content_id))],
    selected_questions: selectedQuestions,
    estimated_total_time_minutes: Math.round(totalTimeSeconds / 60),
    difficulty_distribution: difficultyDistribution
  };
}

/**
 * Create a learning session record
 */
export async function createLearningSession(
  userId: string,
  sessionPlan: SessionPlan,
  sessionType: SessionType,

  deviceType?: string
) {
  const { data, error } = await supabase
    .from('learning_sessions')
    .insert([
      {
        user_id: userId,
        session_type: sessionType,
        content_ids: sessionPlan.content_ids,
        planned_duration_minutes: sessionPlan.estimated_total_time_minutes,
        planned_question_count: sessionPlan.selected_questions.length,
        device_type: deviceType
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// SPACED REPETITION: SM-2 algorithm implementation
// ============================================================================

/**
 * Update user progress after session completion
 */
export async function updateUserProgress(
  userId: string,
  sessionId: string,
  questionResponses: QuestionResponse[]
) {
  const { data, error } = await supabase.rpc('update_question_progress', {
    user_id_param: userId,
    question_responses: questionResponses,
    session_id_param: sessionId
  });

  if (error) throw error;

  // Update session completion
  const totalQuestions = questionResponses.length;
  const correctAnswers = questionResponses.filter(r => r.feedback === 'got_it').length;
  const avgResponseTime = questionResponses.reduce(
    (sum, r) => sum + r.response_time_seconds, 0
  ) / totalQuestions;

  await supabase
    .from('learning_sessions')
    .update({
      questions_answered: totalQuestions,
      questions_correct: correctAnswers,
      average_response_time_seconds: avgResponseTime,
      session_completion_rate: 1.0,
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  // Update user content library stats
  await updateUserContentLibraryStats(userId, questionResponses);

  return data;
}

/**
 * Calculate content mastery for a user
 */
export async function calculateContentMastery(userId: string, contentId: string) {
  const { data, error } = await supabase.rpc('calculate_content_mastery', {
    user_id_param: userId,
    content_id_param: contentId
  });

  if (error) throw error;
  return data[0];
}

/**
 * Update user content library statistics
 */
async function updateUserContentLibraryStats(
  userId: string,
  questionResponses: QuestionResponse[]
) {
  const contentStats = questionResponses.reduce((acc, response) => {
    if (!acc[response.content_id]) {
      acc[response.content_id] = {
        total_answered: 0,
        total_correct: 0,
        total_time: 0
      };
    }
    
    acc[response.content_id].total_answered++;
    if (response.feedback === 'got_it') {
      acc[response.content_id].total_correct++;
    }
    acc[response.content_id].total_time += response.response_time_seconds;
    
    return acc;
  }, {} as Record<string, { total_answered: number; total_correct: number; total_time: number }>);

  // Update each content's stats
  for (const [contentId, stats] of Object.entries(contentStats)) {
    // Calculate new mastery percentage
    const mastery = await calculateContentMastery(userId, contentId);
    
    // Get current library stats
    const { data: currentStats, error: fetchError } = await supabase
      .from('user_content_library')
      .select('total_sessions, total_time_minutes, total_questions_answered, total_questions_correct')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (fetchError) throw fetchError;
    
    // Update user content library with incremented values
    const { error } = await supabase
      .from('user_content_library')
      .update({
        total_sessions: currentStats.total_sessions + 1,
        total_time_minutes: currentStats.total_time_minutes + Math.round(stats.total_time / 60),
        total_questions_answered: currentStats.total_questions_answered + stats.total_answered,
        total_questions_correct: currentStats.total_questions_correct + stats.total_correct,
        mastery_percentage: mastery.mastery_percentage,
        questions_due_count: mastery.questions_total - mastery.questions_mastered,
        next_review_due_at: mastery.next_review_due_at,
        last_accessed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) throw error;
  }
}

// ============================================================================
// ANALYTICS: User learning insights
// ============================================================================

/**
 * Get user learning analytics
 */
export async function getUserLearningAnalytics(userId: string) {
  const { data, error } = await supabase
    .from('user_learning_analytics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get topic-specific learning overview
 */
export async function getTopicLearningOverview(userId: string, topicId?: string) {
  let query = supabase
    .from('topic_learning_overview')
    .select('*')
    .eq('user_id', userId);

  if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  const { data, error } = await query.order('total_time_spent_minutes', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get recent learning sessions
 */
export async function getRecentLearningSessions(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('learning_sessions')
    .select(`
      *,
      content:content_ids (
        id,
        title,
        source
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ============================================================================
// TOPICS: Enhanced topic management
// ============================================================================

/**
 * Get all active topics with content counts
 */
export async function getActiveTopics() {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}

/**
 * Get content for a specific topic
 */
export async function getContentByTopic(topicId: string, userId?: string) {
  let query = supabase
    .from('content')
    .select(`
      *,
      episode_topics!inner (
        relevance_score,
        topics (
          id,
          name,
          color
        )
      )
    `)
    .eq('episode_topics.topic_id', topicId)
    .eq('processing_status', 'completed')
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Search content by title or transcript
 */
export async function searchContent(
  searchTerm: string,
  userId?: string,
  filters?: {
    sources?: ContentSource[];
    topicIds?: string[];
    processingStatus?: ProcessingStatus;
  }
) {
  let query = supabase
    .from('content')
    .select(`
      *,
      episode_topics (
        topics (
          id,
          name,
          color
        )
      )
    `)
    .or(`title.ilike.%${searchTerm}%,transcript.ilike.%${searchTerm}%`);

  if (filters?.sources) {
    query = query.in('source', filters.sources);
  }

  if (filters?.processingStatus) {
    query = query.eq('processing_status', filters.processingStatus);
  } else {
    query = query.eq('processing_status', 'completed');
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

// ============================================================================
// VALIDATION: Data integrity helpers
// ============================================================================

/**
 * Validate question structure
 */
export function validateQuestion(question: Question): boolean {
  return !!(
    question.id &&
    question.content &&
    question.type &&
    question.difficulty_level >= 1 &&
    question.difficulty_level <= 5 &&
    question.estimated_time_seconds > 0 &&
    typeof question.created_by_ai === 'boolean' &&
    question.confidence
  );
}

/**
 * Validate content summary variants
 */
export function validateContentSummaryVariants(
  variants: ContentSummaryVariants,
  durationHours: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate quick summary (4 bullet points per hour)
  const expectedQuickPoints = Math.ceil(durationHours * 4);
  const quickBulletPoints = variants.quick_summary.split('\n').filter(line => 
    line.trim().startsWith('•') || line.trim().startsWith('-')
  ).length;
  
  if (quickBulletPoints < expectedQuickPoints * 0.8) {
    errors.push(`Quick summary should have ~${expectedQuickPoints} bullet points, found ${quickBulletPoints}`);
  }

  // Validate full summary (2 paragraphs per hour)
  const expectedParagraphs = Math.ceil(durationHours * 2);
  const paragraphs = variants.full_summary.split('\n\n').filter(p => p.trim().length > 50).length;
  
  if (paragraphs < expectedParagraphs * 0.8) {
    errors.push(`Full summary should have ~${expectedParagraphs} paragraphs, found ${paragraphs}`);
  }

  // Validate questions (10-15 per hour)
  const expectedQuestions = Math.ceil(durationHours * 12); // Target 12 per hour
  const questionCount = variants.questions.length;
  
  if (questionCount < durationHours * 8 || questionCount > durationHours * 18) {
    errors.push(`Should have 8-18 questions per hour (${Math.ceil(durationHours * 8)}-${Math.ceil(durationHours * 18)}), found ${questionCount}`);
  }

  // Validate individual questions
  variants.questions.forEach((question, index) => {
    if (!validateQuestion(question)) {
      errors.push(`Question ${index + 1} is invalid or incomplete`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// EXPORT: Main interface
// ============================================================================

export const sharedContentAPI = {
  // Content management
  createSharedContent,
  updateContentWithProcessedVariants,
  getContentWithStatus,
  getPendingContent,
  
  // User library
  addContentToUserLibrary,
  getUserContentLibrary,
  getUserContentByTopic,
  removeContentFromUserLibrary,
  
  // Session planning
  getDueQuestions,
  planLearningSession,
  createLearningSession,
  
  // Progress tracking
  updateUserProgress,
  calculateContentMastery,
  
  // Analytics
  getUserLearningAnalytics,
  getTopicLearningOverview,
  getRecentLearningSessions,
  
  // Topics
  getActiveTopics,
  getContentByTopic,
  searchContent,
  
  // Validation
  validateQuestion,
  validateContentSummaryVariants
}; 