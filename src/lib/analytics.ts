import { supabase } from './supabase';
import type { SessionType, ContentSource, FeedbackType } from '@/types/database.types';

export interface SessionCompletionData {
  sessionId: string;
  userId: string;
  sessionType: SessionType;
  contentIds: string[];
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  questionsAnswered: number;
  questionsCorrect: number;
  summariesRead: number;
  completionRate: number;
  averageResponseTime?: number;
  deviceType?: string;
}

export interface TopicRetentionMetrics {
  topicId: string;
  topicName: string;
  contentCount: number;
  totalQuestions: number;
  questionsMastered: number;
  questionsReviewed: number;
  averageAccuracy: number;
  averageMastery: number;
  timeSpentMinutes: number;
  lastReviewedAt: string | null;
  strengthLevel: 'building' | 'developing' | 'strong' | 'mastery';
  retentionTrend: 'improving' | 'stable' | 'declining';
}

export interface LearningInsights {
  userId: string;
  overallMasteryPercentage: number;
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  preferredSources: { source: ContentSource; percentage: number; count: number }[];
  preferredSessionLength: number;
  learningStyle: {
    type: 'visual' | 'analytical' | 'balanced';
    confidence: number;
    description: string;
  };
  sessionPatterns: {
    topicDiversity: number;
    difficultyPreference: string;
    reviewFrequency: string;
    preferredTimeOfDay: string;
    consistencyScore: number;
  };
}

export interface NextSessionGuidance {
  recommendedType: SessionType;
  suggestedDuration: number;
  reasoningText: string;
  nextReviewDue?: string;
  questionsReadyForReview: number;
  contentSuggestions?: {
    contentId: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }[];
}

/**
 * Track session completion and update analytics
 */
export async function trackSessionCompletion(data: SessionCompletionData): Promise<void> {
  try {
    // Update the learning session record
    const { error: sessionError } = await supabase
      .from('learning_sessions')
      .update({
        actual_duration_minutes: data.actualDurationMinutes,
        questions_answered: data.questionsAnswered,
        questions_correct: data.questionsCorrect,
        summaries_read: data.summariesRead,
        session_completion_rate: data.completionRate,
        average_response_time_seconds: data.averageResponseTime,
        device_type: data.deviceType,
        completed_at: new Date().toISOString()
      })
      .eq('id', data.sessionId);

    if (sessionError) throw sessionError;

    // Update user content library stats for each content item
    for (const contentId of data.contentIds) {
      await updateContentLibraryStats(data.userId, contentId, {
        sessionCount: 1,
        timeMinutes: data.actualDurationMinutes,
        questionsAnswered: Math.floor(data.questionsAnswered / data.contentIds.length),
        questionsCorrect: Math.floor(data.questionsCorrect / data.contentIds.length)
      });
    }

    // Update user learning streak
    await updateLearningStreak(data.userId);
    
  } catch (error) {
    console.error('Failed to track session completion:', error);
    throw error;
  }
}

/**
 * Update user content library statistics
 */
async function updateContentLibraryStats(
  userId: string, 
  contentId: string, 
  stats: {
    sessionCount: number;
    timeMinutes: number;
    questionsAnswered: number;
    questionsCorrect: number;
  }
): Promise<void> {
  const { error } = await supabase.rpc('update_user_content_stats', {
    user_id_param: userId,
    content_id_param: contentId,
    session_increment: stats.sessionCount,
    time_increment: stats.timeMinutes,
    questions_answered_increment: stats.questionsAnswered,
    questions_correct_increment: stats.questionsCorrect
  });

  if (error) throw error;
}

/**
 * Update user learning streak
 */
async function updateLearningStreak(userId: string): Promise<void> {
  const { error } = await supabase.rpc('update_learning_streak', {
    user_id_param: userId,
    session_date: new Date().toISOString().split('T')[0]
  });

  if (error) throw error;
}

/**
 * Get topic-based retention metrics for a user
 */
export async function getTopicRetentionMetrics(userId: string): Promise<TopicRetentionMetrics[]> {
  try {
    const { data, error } = await supabase
      .from('topic_learning_overview')
      .select('*')
      .eq('user_id', userId)
      .order('average_mastery_percentage', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => {
      const masteryPercentage = row.average_mastery_percentage || 0;
      const accuracyRate = row.average_accuracy || 0;
      
      // Calculate strength level based on mastery and accuracy
      let strengthLevel: TopicRetentionMetrics['strengthLevel'] = 'building';
      if (masteryPercentage >= 80 && accuracyRate >= 0.8) {
        strengthLevel = 'mastery';
      } else if (masteryPercentage >= 60 && accuracyRate >= 0.7) {
        strengthLevel = 'strong';
      } else if (masteryPercentage >= 40 && accuracyRate >= 0.6) {
        strengthLevel = 'developing';
      }

      // Calculate retention trend (simplified - would need historical data for real implementation)
      const retentionTrend: TopicRetentionMetrics['retentionTrend'] = 
        accuracyRate >= 0.75 ? 'improving' : 
        accuracyRate >= 0.6 ? 'stable' : 'declining';

      return {
        topicId: row.topic_id,
        topicName: row.topic_name,
        contentCount: row.content_count || 0,
        totalQuestions: row.total_questions || 0,
        questionsMastered: row.questions_mastered || 0,
        questionsReviewed: row.questions_mastered + (row.questions_due || 0),
        averageAccuracy: accuracyRate,
        averageMastery: masteryPercentage,
        timeSpentMinutes: row.total_time_spent_minutes || 0,
        lastReviewedAt: row.last_reviewed_at,
        strengthLevel,
        retentionTrend
      };
    });
  } catch (error) {
    console.error('Failed to get topic retention metrics:', error);
    return [];
  }
}

/**
 * Get comprehensive learning insights for a user
 */
export async function getLearningInsights(userId: string): Promise<LearningInsights> {
  try {
    // Get user analytics overview
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('user_learning_analytics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (analyticsError && analyticsError.code !== 'PGRST116') {
      throw analyticsError;
    }

    // Get content source preferences
    const { data: contentData, error: contentError } = await supabase
      .from('user_content_with_progress')
      .select('source')
      .eq('user_id', userId);

    if (contentError) throw contentError;

    // Calculate content source preferences
    const sourceCount: Record<string, number> = {};
    contentData?.forEach(item => {
      const source = item.source as string;
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });

    const totalContent = contentData?.length || 0;
    const preferredSources = Object.entries(sourceCount).map(([source, count]) => ({
      source: source as ContentSource,
      count,
      percentage: totalContent > 0 ? (count / totalContent) * 100 : 0
    })).sort((a, b) => b.percentage - a.percentage);

    // Get session patterns
    const { data: sessionData, error: sessionError } = await supabase
      .from('learning_sessions')
      .select('session_type, actual_duration_minutes, created_at, session_completion_rate')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (sessionError) throw sessionError;

    // Calculate learning style based on session patterns
    const avgSessionLength = sessionData?.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) / Math.max(sessionData?.length || 1, 1);
    const completionRates = sessionData?.map(s => s.session_completion_rate || 0) || [];
    const avgCompletionRate = completionRates.reduce((sum, rate) => sum + rate, 0) / Math.max(completionRates.length, 1);

    let learningStyle: LearningInsights['learningStyle'] = {
      type: 'balanced',
      confidence: 0.7,
      description: 'You show a balanced approach to learning with consistent engagement across different content types.'
    };

    if (avgSessionLength > 8 && avgCompletionRate > 0.8) {
      learningStyle = {
        type: 'analytical',
        confidence: 0.8,
        description: 'You prefer thorough, comprehensive sessions and show strong persistence with detailed content.'
      };
    } else if (avgSessionLength < 5 && avgCompletionRate > 0.9) {
      learningStyle = {
        type: 'visual',
        confidence: 0.75,
        description: 'You learn efficiently with focused, bite-sized sessions and quick information processing.'
      };
    }

    return {
      userId,
      overallMasteryPercentage: analyticsData?.average_mastery_percentage || 0,
      currentStreak: analyticsData?.current_streak_days || 0,
      longestStreak: analyticsData?.longest_streak_days || 0,
      weeklyGoal: 5, // Default weekly goal
      weeklyProgress: analyticsData?.sessions_this_week || 0,
      preferredSources,
      preferredSessionLength: Math.round(avgSessionLength),
      learningStyle,
      sessionPatterns: {
        topicDiversity: calculateTopicDiversity(sessionData || []),
        difficultyPreference: calculateDifficultyPreference(analyticsData?.overall_accuracy_rate || 0.5),
        reviewFrequency: calculateReviewFrequency(analyticsData?.sessions_this_week || 0),
        preferredTimeOfDay: calculatePreferredTimeOfDay(sessionData || []),
        consistencyScore: analyticsData?.consistency_score || 0
      }
    };
  } catch (error) {
    console.error('Failed to get learning insights:', error);
    // Return default insights on error
    return {
      userId,
      overallMasteryPercentage: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyGoal: 5,
      weeklyProgress: 0,
      preferredSources: [],
      preferredSessionLength: 5,
      learningStyle: {
        type: 'balanced',
        confidence: 0.5,
        description: 'Getting to know your learning style...'
      },
      sessionPatterns: {
        topicDiversity: 0.5,
        difficultyPreference: 'balanced',
        reviewFrequency: 'moderate',
        preferredTimeOfDay: 'morning',
        consistencyScore: 0
      }
    };
  }
}

/**
 * Generate next session guidance based on user progress and spaced repetition
 */
export async function generateNextSessionGuidance(userId: string): Promise<NextSessionGuidance> {
  try {
    // Get questions due for review
    const { data: dueQuestions, error: dueError } = await supabase.rpc(
      'get_user_due_questions',
      {
        user_id: userId,
        max_questions: 20,
        include_overdue: true
      }
    );

    if (dueError) throw dueError;

    // Get user's recent session patterns
    const { data: recentSessions, error: sessionError } = await supabase
      .from('learning_sessions')
      .select('session_type, session_completion_rate, actual_duration_minutes')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (sessionError) throw sessionError;

    const questionsReady = dueQuestions?.length || 0;
    const avgCompletionRate = recentSessions?.reduce((sum, s) => sum + (s.session_completion_rate || 0), 0) / Math.max(recentSessions?.length || 1, 1);
    const avgDuration = recentSessions?.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) / Math.max(recentSessions?.length || 1, 1);

    // Determine recommendation logic
    let recommendedType: SessionType = 'test_knowledge';
    let reasoningText = '';
    let suggestedDuration = Math.max(Math.round(avgDuration), 5);

    if (questionsReady >= 10) {
      recommendedType = 'test_knowledge';
      reasoningText = `You have ${questionsReady} questions ready for review. Testing will strengthen your memory and optimize future review schedules.`;
    } else if (questionsReady >= 5) {
      recommendedType = 'both';
      reasoningText = `A mixed session would be ideal - review summaries to refresh your memory, then test ${questionsReady} questions that are due.`;
      suggestedDuration = Math.round(suggestedDuration * 1.3);
    } else {
      recommendedType = 'read_summaries';
      reasoningText = 'Perfect time to explore new content or review summaries. This will prepare material for future testing sessions.';
    }

    // Adjust based on completion rates
    if (avgCompletionRate < 0.7 && suggestedDuration > 7) {
      suggestedDuration = Math.max(5, Math.round(suggestedDuration * 0.8));
      reasoningText += ' Suggesting a shorter session to maintain engagement.';
    }

    // Calculate next review due date
    const nextReviewDue = dueQuestions?.length > 0 ? 
      'Some questions are ready now' : 
      'Next review in 1-2 days';

    return {
      recommendedType,
      suggestedDuration,
      reasoningText,
      nextReviewDue,
      questionsReadyForReview: questionsReady,
      contentSuggestions: await generateContentSuggestions(userId, recommendedType)
    };
  } catch (error) {
    console.error('Failed to generate next session guidance:', error);
    // Return default guidance
    return {
      recommendedType: 'read_summaries',
      suggestedDuration: 5,
      reasoningText: 'Start with reading summaries to build your knowledge base.',
      questionsReadyForReview: 0
    };
  }
}

/**
 * Generate content suggestions based on user patterns and recommended session type
 */
async function generateContentSuggestions(userId: string, sessionType: SessionType) {
  try {
    const { data: contentData, error } = await supabase
      .from('user_content_with_progress')
      .select('content_id, title, mastery_percentage, questions_due_count, last_session_at')
      .eq('user_id', userId)
      .order('questions_due_count', { ascending: false })
      .limit(5);

    if (error) throw error;

    return (contentData || []).map(content => {
      let priority: 'high' | 'medium' | 'low' = 'medium';
      let reason = '';

      if (content.questions_due_count > 5) {
        priority = 'high';
        reason = `${content.questions_due_count} questions ready for review`;
      } else if (content.mastery_percentage < 50) {
        priority = 'medium';
        reason = 'Building foundational knowledge';
      } else {
        priority = 'low';
        reason = 'Maintenance review';
      }

      return {
        contentId: content.content_id,
        title: content.title,
        priority,
        reason
      };
    });
  } catch (error) {
    console.error('Failed to generate content suggestions:', error);
    return [];
  }
}

// Helper functions for calculating learning patterns
function calculateTopicDiversity(sessions: any[]): number {
  if (sessions.length === 0) return 0.5;
  
  // This would analyze the variety of topics covered in recent sessions
  // For now, return a moderate diversity score
  return 0.6;
}

function calculateDifficultyPreference(accuracyRate: number): string {
  if (accuracyRate > 0.8) return 'challenging';
  if (accuracyRate > 0.6) return 'balanced';
  return 'foundational';
}

function calculateReviewFrequency(sessionsThisWeek: number): string {
  if (sessionsThisWeek >= 5) return 'frequent';
  if (sessionsThisWeek >= 2) return 'moderate';
  return 'occasional';
}

function calculatePreferredTimeOfDay(sessions: any[]): string {
  if (sessions.length === 0) return 'morning';
  
  // Analyze session timestamps to determine preferred time
  // For now, return a default
  return 'morning';
}

/**
 * Export analytics data for user control
 */
export async function exportUserAnalytics(userId: string): Promise<{
  sessions: any[];
  progress: any[];
  insights: LearningInsights;
}> {
  try {
    const [sessions, progress, insights] = await Promise.all([
      supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('user_question_progress')
        .select('*')
        .eq('user_id', userId),
      getLearningInsights(userId)
    ]);

    return {
      sessions: sessions.data || [],
      progress: progress.data || [],
      insights
    };
  } catch (error) {
    console.error('Failed to export user analytics:', error);
    throw error;
  }
}

/**
 * Calculate motivation message based on streak and progress
 */
export function getMotivationMessage(streak: number, weeklyProgress: number, weeklyGoal: number): string {
  if (streak === 0) {
    return "Ready to start your learning journey? Every expert was once a beginner!";
  }
  
  if (streak === 1) {
    return "Great start! Building a learning habit begins with a single session.";
  }
  
  if (streak < 7) {
    return `${streak} days strong! You're building momentum. Keep it going!`;
  }
  
  if (streak < 30) {
    return `Amazing ${streak}-day streak! You're developing a powerful learning habit.`;
  }
  
  return `Incredible ${streak}-day streak! You've mastered the art of consistent learning.`;
} 