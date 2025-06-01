export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enhanced enums for the shared content model
export type ContentSource = 'podcast' | 'video' | 'article' | 'book' | 'conversation' | 'interview' | 'lecture' | 'other';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type QuestionType = 'conceptual' | 'factual' | 'application' | 'reflection';
export type SessionType = 'read_summaries' | 'test_knowledge' | 'both';
export type FeedbackType = 'got_it' | 'revisit';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// Question interface for pre-generated question pools
export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  difficulty_level: DifficultyLevel;
  estimated_time_seconds: number;
  created_by_ai: boolean;
  confidence: ConfidenceLevel;
  metadata?: {
    timestamp?: string;
    keywords?: string[];
    concept_area?: string;
  };
}

export interface Database {
  public: {
    Tables: {
      // Enhanced content table with shared content model
      content: {
        Row: {
          id: string
          title: string
          source: ContentSource
          source_url: string
          transcript: string
          duration_hours: number
          
          // Pre-processed content variants (shared across all users)
          quick_summary: string // 4 bullet points per hour, stored as formatted text
          full_summary: string // 2 paragraphs per hour, stored as formatted text
          questions: Question[] // 10-15 questions per hour
          
          // Metadata and processing
          topics: string[] // Legacy field, will migrate to episode_topics table
          created_at: string
          processed_at: string | null
          processing_status: ProcessingStatus
          content_version: number // For future content updates
          
          // Analytics and optimization
          total_questions: number // Computed field for quick access
          average_difficulty: number // 1-5 scale
          estimated_read_time_minutes: number // For session planning
          
          // Legacy fields (maintaining for migration compatibility)
          summary?: string
          insights?: Json[]
          isAiProcessed?: boolean
        }
        Insert: {
          id?: string
          title: string
          source: ContentSource
          source_url: string
          transcript: string
          duration_hours: number
          quick_summary?: string
          full_summary?: string
          questions?: Question[]
          topics?: string[]
          created_at?: string
          processed_at?: string | null
          processing_status?: ProcessingStatus
          content_version?: number
          total_questions?: number
          average_difficulty?: number
          estimated_read_time_minutes?: number
          summary?: string
          insights?: Json[]
          isAiProcessed?: boolean
        }
        Update: {
          id?: string
          title?: string
          source?: ContentSource
          source_url?: string
          transcript?: string
          duration_hours?: number
          quick_summary?: string
          full_summary?: string
          questions?: Question[]
          topics?: string[]
          created_at?: string
          processed_at?: string | null
          processing_status?: ProcessingStatus
          content_version?: number
          total_questions?: number
          average_difficulty?: number
          estimated_read_time_minutes?: number
          summary?: string
          insights?: Json[]
          isAiProcessed?: boolean
        }
      }

      // Individual user progress tracking on shared content questions
      user_question_progress: {
        Row: {
          id: string
          user_id: string
          content_id: string
          question_id: string
          
          // SuperMemo SM-2 algorithm implementation
          ease_factor: number // Starting at 2.5, range 1.3-5.0
          interval_days: number // Days until next review
          repetitions: number // Number of successful reviews
          difficulty_level: DifficultyLevel // User-specific difficulty rating
          
          // Review scheduling and performance
          last_reviewed_at: string | null
          next_review_date: string
          total_reviews: number
          correct_reviews: number
          consecutive_correct: number
          
          // Latest session data
          last_feedback: FeedbackType | null
          last_response_time_seconds: number | null
          
          // Tracking timestamps
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          question_id: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          difficulty_level?: DifficultyLevel
          last_reviewed_at?: string | null
          next_review_date?: string
          total_reviews?: number
          correct_reviews?: number
          consecutive_correct?: number
          last_feedback?: FeedbackType | null
          last_response_time_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          question_id?: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          difficulty_level?: DifficultyLevel
          last_reviewed_at?: string | null
          next_review_date?: string
          total_reviews?: number
          correct_reviews?: number
          consecutive_correct?: number
          last_feedback?: FeedbackType | null
          last_response_time_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      // User library management (what content each user has added)
      user_content_library: {
        Row: {
          id: string
          user_id: string
          content_id: string
          added_at: string
          last_accessed_at: string | null
          
          // Session statistics
          total_sessions: number
          total_time_minutes: number
          total_questions_answered: number
          total_questions_correct: number
          
          // Progress tracking
          mastery_percentage: number // 0-100, calculated from question progress
          questions_due_count: number // Denormalized for quick access
          next_review_due_at: string | null
          
          // User preferences for this content
          preferred_session_length: number | null // minutes
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          added_at?: string
          last_accessed_at?: string | null
          total_sessions?: number
          total_time_minutes?: number
          total_questions_answered?: number
          total_questions_correct?: number
          mastery_percentage?: number
          questions_due_count?: number
          next_review_due_at?: string | null
          preferred_session_length?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          added_at?: string
          last_accessed_at?: string | null
          total_sessions?: number
          total_time_minutes?: number
          total_questions_answered?: number
          total_questions_correct?: number
          mastery_percentage?: number
          questions_due_count?: number
          next_review_due_at?: string | null
          preferred_session_length?: number | null
          notes?: string | null
        }
      }

      // Learning session tracking for analytics and optimization
      learning_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: SessionType
          content_ids: string[] // Multiple content for mixed sessions
          
          // Session planning and execution
          planned_duration_minutes: number
          actual_duration_minutes: number | null
          planned_question_count: number
          
          // Session results
          questions_answered: number
          questions_correct: number
          summaries_read: number
          average_response_time_seconds: number | null
          
          // Quality metrics
          session_completion_rate: number // 0-1
          user_satisfaction_rating: number | null // 1-5 scale
          
          // Timing and metadata
          started_at: string
          completed_at: string | null
          interrupted_at: string | null
          device_type: string | null
          
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type: SessionType
          content_ids: string[]
          planned_duration_minutes: number
          actual_duration_minutes?: number | null
          planned_question_count?: number
          questions_answered?: number
          questions_correct?: number
          summaries_read?: number
          average_response_time_seconds?: number | null
          session_completion_rate?: number
          user_satisfaction_rating?: number | null
          started_at?: string
          completed_at?: string | null
          interrupted_at?: string | null
          device_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: SessionType
          content_ids?: string[]
          planned_duration_minutes?: number
          actual_duration_minutes?: number | null
          planned_question_count?: number
          questions_answered?: number
          questions_correct?: number
          summaries_read?: number
          average_response_time_seconds?: number | null
          session_completion_rate?: number
          user_satisfaction_rating?: number | null
          started_at?: string
          completed_at?: string | null
          interrupted_at?: string | null
          device_type?: string | null
          created_at?: string
        }
      }

      // Topic management with enhanced metadata
      topics: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          
          // UI and branding
          color: string | null // Hex color for Memory Waves theming
          icon: string | null // Icon name or emoji
          sort_order: number
          
          // Analytics
          content_count: number // Denormalized for performance
          total_questions: number
          active_learners_count: number
          
          // Hierarchy support for future expansion
          parent_topic_id: string | null
          depth_level: number
          
          // Management
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
          icon?: string | null
          sort_order?: number
          content_count?: number
          total_questions?: number
          active_learners_count?: number
          parent_topic_id?: string | null
          depth_level?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          sort_order?: number
          content_count?: number
          total_questions?: number
          active_learners_count?: number
          parent_topic_id?: string | null
          depth_level?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // Content-Topic relationships with relevance scoring
      episode_topics: {
        Row: {
          id: string
          content_id: string
          topic_id: string
          
          // AI-generated relevance and confidence
          relevance_score: number // 0-1, for sorting and filtering
          confidence_score: number // 0-1, AI confidence in the assignment
          
          // Source of the relationship
          assigned_by_ai: boolean
          assigned_by_user: boolean
          
          // For topic-based question allocation
          question_allocation_weight: number // 0-1, affects question distribution
          
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_id: string
          topic_id: string
          relevance_score?: number
          confidence_score?: number
          assigned_by_ai?: boolean
          assigned_by_user?: boolean
          question_allocation_weight?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          topic_id?: string
          relevance_score?: number
          confidence_score?: number
          assigned_by_ai?: boolean
          assigned_by_user?: boolean
          question_allocation_weight?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    
    Views: {
      // Optimized view for content selection interface
      user_content_with_progress: {
        Row: {
          content_id: string
          user_id: string
          title: string
          source: ContentSource
          duration_hours: number
          total_questions: number
          estimated_read_time_minutes: number
          
          // Topic information
          topic_names: string[]
          topic_colors: string[]
          
          // Progress tracking
          added_at: string
          mastery_percentage: number
          questions_due_count: number
          next_review_due_at: string | null
          last_session_at: string | null
          
          // For session planning
          avg_session_accuracy: number
          preferred_session_length: number | null
        }
      }
      
      // Analytics view for user learning patterns
      user_learning_analytics: {
        Row: {
          user_id: string
          
          // Overall statistics
          total_content_items: number
          total_sessions: number
          total_learning_time_minutes: number
          total_questions_answered: number
          overall_accuracy_rate: number
          
          // Progress metrics
          average_mastery_percentage: number
          questions_due_today: number
          current_streak_days: number
          longest_streak_days: number
          
          // Recent activity
          last_session_at: string | null
          sessions_this_week: number
          minutes_this_week: number
          
          // Performance trends
          accuracy_trend_7d: number // -1 to 1, negative is declining
          consistency_score: number // 0-1, based on regular usage
        }
      }
      
      // Topic performance overview
      topic_learning_overview: {
        Row: {
          topic_id: string
          user_id: string
          topic_name: string
          
          // Content and progress
          content_count: number
          total_questions: number
          questions_mastered: number
          questions_due: number
          
          // Performance metrics
          average_accuracy: number
          average_mastery_percentage: number
          total_time_spent_minutes: number
          
          // Recent activity
          last_reviewed_at: string | null
          sessions_this_month: number
        }
      }
    }
    
    Functions: {
      // SuperMemo SM-2 algorithm implementation
      calculate_sm2_review: {
        Args: {
          current_ease_factor: number
          current_interval_days: number
          current_repetitions: number
          performance_quality: number // 0-5 scale (0-2 = failure, 3-5 = success)
        }
        Returns: {
          next_ease_factor: number
          next_interval_days: number
          next_repetitions: number
          next_review_date: string
        }
      }
      
      // Get due questions for review sessions
      get_user_due_questions: {
        Args: {
          user_id: string
          content_ids?: string[]
          max_questions?: number
          difficulty_preference?: DifficultyLevel
          include_overdue?: boolean
        }
        Returns: {
          content_id: string
          question_id: string
          question: Question
          days_overdue: number
          priority_score: number
        }[]
      }
      
      // Update user progress after session
      update_question_progress: {
        Args: {
          user_id: string
          question_responses: {
            content_id: string
            question_id: string
            feedback: FeedbackType
            response_time_seconds: number
          }[]
          session_id: string
        }
        Returns: {
          updated_count: number
          next_review_dates: {
            question_id: string
            next_review_date: string
          }[]
        }
      }
      
      // Calculate content mastery percentage
      calculate_content_mastery: {
        Args: {
          user_id: string
          content_id: string
        }
        Returns: {
          mastery_percentage: number
          questions_mastered: number
          questions_total: number
          next_review_due_at: string | null
        }
      }
      
      // Intelligent question selection for sessions
      select_session_questions: {
        Args: {
          user_id: string
          content_ids: string[]
          target_duration_minutes: number
          session_type: SessionType
          difficulty_preference?: DifficultyLevel
        }
        Returns: {
          selected_questions: {
            content_id: string
            question_id: string
            question: Question
            estimated_time_seconds: number
          }[]
          estimated_total_time_minutes: number
          difficulty_distribution: Record<DifficultyLevel, number>
        }
      }
    }
    
    Enums: {
      content_source: {
        podcast: 'podcast'
        video: 'video'
        article: 'article'
        book: 'book'
        conversation: 'conversation'
        interview: 'interview'
        lecture: 'lecture'
        other: 'other'
      }
      processing_status: {
        pending: 'pending'
        processing: 'processing'
        completed: 'completed'
        failed: 'failed'
      }
      question_type: {
        conceptual: 'conceptual'
        factual: 'factual'
        application: 'application'
        reflection: 'reflection'
      }
      session_type: {
        read_summaries: 'read_summaries'
        test_knowledge: 'test_knowledge'
        both: 'both'
      }
      feedback_type: {
        got_it: 'got_it'
        revisit: 'revisit'
      }
      difficulty_level: {
        1: 1
        2: 2
        3: 3
        4: 4
        5: 5
      }
    }
  }
} 