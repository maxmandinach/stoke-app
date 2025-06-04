-- Migration: Shared Content Model Architecture (FIXED)
-- Description: Transform from per-user processing to shared content with individual progress tracking
-- Created: 2024-11-27
-- Part of: Memory Waves Content Architecture Phase 1B
-- Fixed: Handle existing data with zero or null duration_hours

BEGIN;

-- ============================================================================
-- ENUMS: Define all custom types for the shared content model
-- ============================================================================

-- Content processing status
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Enhanced content source types
CREATE TYPE content_source AS ENUM (
    'podcast', 'video', 'article', 'book', 
    'conversation', 'interview', 'lecture', 'other'
);

-- Question types for AI-generated content
CREATE TYPE question_type AS ENUM ('conceptual', 'factual', 'application', 'reflection');

-- User session types
CREATE TYPE session_type AS ENUM ('read_summaries', 'test_knowledge', 'both');

-- User feedback on questions
CREATE TYPE feedback_type AS ENUM ('got_it', 'revisit');

-- Difficulty levels (1-5 scale)
CREATE TYPE difficulty_level AS ENUM ('1', '2', '3', '4', '5');

-- AI confidence levels
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');

-- ============================================================================
-- ENHANCED CONTENT TABLE: Add shared content model fields
-- ============================================================================

-- Add new columns to existing content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(4,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS quick_summary TEXT,
ADD COLUMN IF NOT EXISTS full_summary TEXT,
ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS processing_status processing_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS content_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_difficulty DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS estimated_read_time_minutes INTEGER DEFAULT 0;

-- Update existing content to use new source enum
ALTER TABLE content ALTER COLUMN source TYPE content_source USING source::content_source;

-- Make processed_at nullable for pending content
ALTER TABLE content ALTER COLUMN processed_at DROP NOT NULL;

-- ============================================================================
-- IMPORTANT: Fix existing data to meet constraints BEFORE adding constraints
-- ============================================================================

-- Update ALL existing data that doesn't meet the new constraints
UPDATE content SET 
    duration_hours = CASE 
        WHEN duration_hours IS NULL OR duration_hours <= 0 THEN 1.0 
        ELSE duration_hours 
    END,
    quick_summary = COALESCE(quick_summary, COALESCE(summary, '')),
    full_summary = COALESCE(full_summary, COALESCE(summary, '')),
    processing_status = CASE 
        WHEN processing_status IS NULL THEN
            CASE 
                WHEN summary IS NOT NULL AND summary != '' THEN 'completed'::processing_status
                ELSE 'pending'::processing_status
            END
        ELSE processing_status
    END,
    total_questions = COALESCE(total_questions, 0),
    average_difficulty = CASE 
        WHEN average_difficulty IS NULL OR average_difficulty <= 0 THEN 3.0 
        ELSE average_difficulty 
    END,
    estimated_read_time_minutes = COALESCE(estimated_read_time_minutes, 5);

-- Now add constraints (all data should meet them)
ALTER TABLE content 
ADD CONSTRAINT content_duration_positive CHECK (duration_hours > 0),
ADD CONSTRAINT content_total_questions_positive CHECK (total_questions >= 0),
ADD CONSTRAINT content_average_difficulty_range CHECK (average_difficulty BETWEEN 1.0 AND 5.0),
ADD CONSTRAINT content_read_time_positive CHECK (estimated_read_time_minutes >= 0);

-- ============================================================================
-- TOPICS TABLE: Enhanced topic management
-- ============================================================================

CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- UI and branding
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50), -- Icon name or emoji
    sort_order INTEGER DEFAULT 0,
    
    -- Analytics (denormalized for performance)
    content_count INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    active_learners_count INTEGER DEFAULT 0,
    
    -- Hierarchy support
    parent_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    depth_level INTEGER DEFAULT 0,
    
    -- Management
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for topics
CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_active ON topics(is_active);
CREATE INDEX idx_topics_sort_order ON topics(sort_order);
CREATE INDEX idx_topics_parent ON topics(parent_topic_id);

-- ============================================================================
-- EPISODE_TOPICS: Content-Topic relationships with relevance scoring
-- ============================================================================

CREATE TABLE episode_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    
    -- AI-generated relevance and confidence
    relevance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (relevance_score BETWEEN 0 AND 1),
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Source tracking
    assigned_by_ai BOOLEAN DEFAULT FALSE,
    assigned_by_user BOOLEAN DEFAULT FALSE,
    
    -- Question allocation weight
    question_allocation_weight DECIMAL(3,2) DEFAULT 0.5 CHECK (question_allocation_weight BETWEEN 0 AND 1),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(content_id, topic_id)
);

-- Create indexes for episode_topics
CREATE INDEX idx_episode_topics_content_id ON episode_topics(content_id);
CREATE INDEX idx_episode_topics_topic_id ON episode_topics(topic_id);
CREATE INDEX idx_episode_topics_relevance ON episode_topics(relevance_score DESC);
CREATE INDEX idx_episode_topics_ai_assigned ON episode_topics(assigned_by_ai);

-- ============================================================================
-- USER_CONTENT_LIBRARY: User library management
-- ============================================================================

CREATE TABLE user_content_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    
    -- Session statistics
    total_sessions INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    total_questions_correct INTEGER DEFAULT 0,
    
    -- Progress tracking (denormalized for performance)
    mastery_percentage DECIMAL(5,2) DEFAULT 0 CHECK (mastery_percentage BETWEEN 0 AND 100),
    questions_due_count INTEGER DEFAULT 0,
    next_review_due_at TIMESTAMPTZ,
    
    -- User preferences
    preferred_session_length INTEGER, -- minutes
    notes TEXT,
    
    UNIQUE(user_id, content_id)
);

-- Create indexes for user_content_library
CREATE INDEX idx_user_content_library_user_id ON user_content_library(user_id);
CREATE INDEX idx_user_content_library_content_id ON user_content_library(content_id);
CREATE INDEX idx_user_content_library_next_review ON user_content_library(next_review_due_at);
CREATE INDEX idx_user_content_library_mastery ON user_content_library(mastery_percentage);

-- ============================================================================
-- USER_QUESTION_PROGRESS: Individual spaced repetition tracking
-- ============================================================================

CREATE TABLE user_question_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL, -- References question.id in content.questions JSONB
    
    -- SuperMemo SM-2 algorithm fields
    ease_factor DECIMAL(3,2) DEFAULT 2.5 CHECK (ease_factor BETWEEN 1.3 AND 5.0),
    interval_days INTEGER DEFAULT 1 CHECK (interval_days > 0),
    repetitions INTEGER DEFAULT 0 CHECK (repetitions >= 0),
    difficulty_level difficulty_level DEFAULT '3',
    
    -- Review scheduling
    last_reviewed_at TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_reviews INTEGER DEFAULT 0,
    correct_reviews INTEGER DEFAULT 0,
    consecutive_correct INTEGER DEFAULT 0,
    
    -- Latest session data
    last_feedback feedback_type,
    last_response_time_seconds INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, content_id, question_id)
);

-- Create indexes for user_question_progress
CREATE INDEX idx_user_question_progress_user_id ON user_question_progress(user_id);
CREATE INDEX idx_user_question_progress_content_id ON user_question_progress(content_id);
CREATE INDEX idx_user_question_progress_next_review ON user_question_progress(next_review_date);
CREATE INDEX idx_user_question_progress_user_next_review ON user_question_progress(user_id, next_review_date);
CREATE INDEX idx_user_question_progress_difficulty ON user_question_progress(difficulty_level);

-- ============================================================================
-- LEARNING_SESSIONS: Session tracking for analytics
-- ============================================================================

CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_type session_type NOT NULL,
    content_ids UUID[] NOT NULL, -- Array for multi-content sessions
    
    -- Session planning
    planned_duration_minutes INTEGER NOT NULL CHECK (planned_duration_minutes > 0),
    actual_duration_minutes INTEGER CHECK (actual_duration_minutes >= 0),
    planned_question_count INTEGER DEFAULT 0,
    
    -- Session results
    questions_answered INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    summaries_read INTEGER DEFAULT 0,
    average_response_time_seconds DECIMAL(6,2),
    
    -- Quality metrics
    session_completion_rate DECIMAL(3,2) DEFAULT 0 CHECK (session_completion_rate BETWEEN 0 AND 1),
    user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating BETWEEN 1 AND 5),
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    interrupted_at TIMESTAMPTZ,
    device_type VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for learning_sessions
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_started_at ON learning_sessions(started_at);
CREATE INDEX idx_learning_sessions_session_type ON learning_sessions(session_type);
CREATE INDEX idx_learning_sessions_content_ids ON learning_sessions USING GIN(content_ids);

-- ============================================================================
-- OPTIMIZED VIEWS: Performance-optimized data access
-- ============================================================================

-- User content with progress overview
CREATE OR REPLACE VIEW user_content_with_progress AS
SELECT 
    c.id as content_id,
    ucl.user_id,
    c.title,
    c.source,
    c.duration_hours,
    c.total_questions,
    c.estimated_read_time_minutes,
    
    -- Topic information (aggregated)
    COALESCE(
        ARRAY_AGG(t.name ORDER BY et.relevance_score DESC) FILTER (WHERE t.name IS NOT NULL),
        ARRAY[]::TEXT[]
    ) as topic_names,
    COALESCE(
        ARRAY_AGG(t.color ORDER BY et.relevance_score DESC) FILTER (WHERE t.color IS NOT NULL),
        ARRAY[]::TEXT[]
    ) as topic_colors,
    
    -- Progress tracking
    ucl.added_at,
    ucl.mastery_percentage,
    ucl.questions_due_count,
    ucl.next_review_due_at,
    ucl.last_accessed_at as last_session_at,
    
    -- Session planning data
    CASE 
        WHEN ucl.total_questions_answered > 0 
        THEN ROUND((ucl.total_questions_correct::DECIMAL / ucl.total_questions_answered) * 100, 1)
        ELSE 0
    END as avg_session_accuracy,
    ucl.preferred_session_length
    
FROM user_content_library ucl
JOIN content c ON ucl.content_id = c.id
LEFT JOIN episode_topics et ON c.id = et.content_id
LEFT JOIN topics t ON et.topic_id = t.id AND t.is_active = TRUE
GROUP BY 
    c.id, ucl.user_id, c.title, c.source, c.duration_hours, 
    c.total_questions, c.estimated_read_time_minutes,
    ucl.added_at, ucl.mastery_percentage, ucl.questions_due_count,
    ucl.next_review_due_at, ucl.last_accessed_at, ucl.total_questions_answered,
    ucl.total_questions_correct, ucl.preferred_session_length;

-- User learning analytics summary
CREATE OR REPLACE VIEW user_learning_analytics AS
SELECT 
    ucl.user_id,
    COUNT(ucl.content_id) as total_content_items,
    AVG(ucl.mastery_percentage) as avg_mastery_percentage,
    SUM(ucl.total_sessions) as total_sessions,
    SUM(ucl.total_time_minutes) as total_time_minutes,
    
    -- Current week analytics
    COUNT(ucl.content_id) FILTER (WHERE ucl.last_accessed_at >= NOW() - INTERVAL '7 days') as content_accessed_this_week,
    SUM(ucl.total_sessions) FILTER (WHERE ucl.last_accessed_at >= NOW() - INTERVAL '7 days') as sessions_this_week,
    
    -- Due questions
    COUNT(ucl.content_id) FILTER (WHERE ucl.questions_due_count > 0) as content_with_due_questions,
    SUM(ucl.questions_due_count) as total_due_questions,
    
    -- Progress indicators
    COUNT(ucl.content_id) FILTER (WHERE ucl.mastery_percentage >= 80) as mastered_content_count,
    COUNT(ucl.content_id) FILTER (WHERE ucl.mastery_percentage < 30) as struggling_content_count,
    
    -- Next actions
    MIN(ucl.next_review_due_at) as next_review_due
    
FROM user_content_library ucl
GROUP BY ucl.user_id;

-- Topic learning overview
CREATE OR REPLACE VIEW topic_learning_overview AS
SELECT 
    t.id as topic_id,
    t.name,
    t.slug,
    t.description,
    t.color,
    t.icon,
    
    -- Content metrics
    COUNT(DISTINCT et.content_id) as content_count,
    AVG(et.relevance_score) as avg_relevance_score,
    SUM(c.total_questions) as total_questions,
    AVG(c.average_difficulty) as avg_difficulty,
    
    -- User engagement
    COUNT(DISTINCT ucl.user_id) as active_learners,
    AVG(ucl.mastery_percentage) as avg_mastery_percentage,
    SUM(ucl.total_sessions) as total_sessions,
    
    t.sort_order,
    t.is_active
    
FROM topics t
LEFT JOIN episode_topics et ON t.id = et.topic_id
LEFT JOIN content c ON et.content_id = c.id
LEFT JOIN user_content_library ucl ON c.id = ucl.content_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.slug, t.description, t.color, t.icon, t.sort_order, t.is_active
ORDER BY t.sort_order;

-- ============================================================================
-- SUPERMEMO SM-2 ALGORITHM FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_sm2_review(
    current_ease_factor DECIMAL,
    current_interval_days INTEGER,
    current_repetitions INTEGER,
    performance_quality INTEGER -- 0-5 scale (0-2 = failure, 3-5 = success)
) RETURNS TABLE(
    next_ease_factor DECIMAL,
    next_interval_days INTEGER,
    next_repetitions INTEGER,
    next_review_date TIMESTAMPTZ
) LANGUAGE plpgsql AS $$
DECLARE
    new_ease_factor DECIMAL;
    new_interval INTEGER;
    new_repetitions INTEGER;
BEGIN
    -- Calculate new ease factor
    new_ease_factor := current_ease_factor + (0.1 - (5 - performance_quality) * (0.08 + (5 - performance_quality) * 0.02));
    
    -- Clamp ease factor to valid range
    new_ease_factor := GREATEST(1.3, new_ease_factor);
    
    -- Calculate repetitions and interval
    IF performance_quality < 3 THEN
        -- Incorrect response: reset repetitions, short interval
        new_repetitions := 0;
        new_interval := 1;
    ELSE
        -- Correct response: increment repetitions
        new_repetitions := current_repetitions + 1;
        
        -- Calculate interval based on repetition number
        IF new_repetitions = 1 THEN
            new_interval := 1;
        ELSIF new_repetitions = 2 THEN
            new_interval := 6;
        ELSE
            new_interval := ROUND(current_interval_days * new_ease_factor);
        END IF;
    END IF;
    
    -- Return calculated values
    RETURN QUERY SELECT 
        new_ease_factor,
        new_interval,
        new_repetitions,
        (NOW() + (new_interval || ' days')::INTERVAL)::TIMESTAMPTZ;
END;
$$;

-- ============================================================================
-- GET DUE QUESTIONS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_due_questions(
    user_id_param UUID,
    content_ids_param UUID[] DEFAULT NULL,
    max_questions_param INTEGER DEFAULT 20,
    difficulty_preference_param difficulty_level DEFAULT NULL,
    include_overdue_param BOOLEAN DEFAULT TRUE
) RETURNS TABLE(
    content_id UUID,
    question_id VARCHAR,
    question JSONB,
    days_overdue INTEGER,
    priority_score DECIMAL
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH due_questions AS (
        SELECT 
            uqp.content_id,
            uqp.question_id,
            q.value as question,
            GREATEST(0, EXTRACT(DAYS FROM NOW() - uqp.next_review_date)::INTEGER) as days_overdue,
            -- Priority score: overdue days + difficulty match + ease factor
            (
                GREATEST(0, EXTRACT(DAYS FROM NOW() - uqp.next_review_date)) * 2 +
                CASE 
                    WHEN difficulty_preference_param IS NULL THEN 0
                    WHEN uqp.difficulty_level = difficulty_preference_param THEN 5
                    ELSE 0
                END +
                (3.0 - uqp.ease_factor) * 2 -- Lower ease factor = higher priority
            )::DECIMAL as priority_score
        FROM user_question_progress uqp
        JOIN content c ON uqp.content_id = c.id
        JOIN LATERAL jsonb_array_elements(c.questions) WITH ORDINALITY q(value, index) 
            ON (q.value->>'id') = uqp.question_id
        WHERE uqp.user_id = user_id_param
            AND (content_ids_param IS NULL OR uqp.content_id = ANY(content_ids_param))
            AND (include_overdue_param OR uqp.next_review_date <= NOW())
            AND (difficulty_preference_param IS NULL OR uqp.difficulty_level = difficulty_preference_param)
            AND uqp.next_review_date <= NOW()
    )
    SELECT 
        dq.content_id,
        dq.question_id,
        dq.question,
        dq.days_overdue,
        dq.priority_score
    FROM due_questions dq
    ORDER BY dq.priority_score DESC, dq.days_overdue DESC
    LIMIT max_questions_param;
END;
$$;

-- ============================================================================
-- UPDATE QUESTION PROGRESS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_question_progress(
    user_id_param UUID,
    question_responses JSONB, -- Array of {content_id, question_id, feedback, response_time_seconds}
    session_id_param UUID
) RETURNS TABLE(
    updated_count INTEGER,
    next_review_dates JSONB
) LANGUAGE plpgsql AS $$
DECLARE
    response_record RECORD;
    sm2_result RECORD;
    performance_quality INTEGER;
    review_dates JSONB := '[]'::JSONB;
    update_count INTEGER := 0;
BEGIN
    -- Process each question response
    FOR response_record IN 
        SELECT 
            (item->>'content_id')::UUID as content_id,
            item->>'question_id' as question_id,
            item->>'feedback' as feedback,
            (item->>'response_time_seconds')::INTEGER as response_time_seconds
        FROM jsonb_array_elements(question_responses) as item
    LOOP
        -- Convert feedback to performance quality (0-5 scale)
        performance_quality := CASE 
            WHEN response_record.feedback = 'got_it' THEN 4
            WHEN response_record.feedback = 'revisit' THEN 2
            ELSE 3
        END;
        
        -- Get current progress
        SELECT 
            ease_factor,
            interval_days,
            repetitions,
            total_reviews,
            correct_reviews,
            consecutive_correct
        INTO sm2_result
        FROM user_question_progress
        WHERE user_id = user_id_param 
            AND content_id = response_record.content_id 
            AND question_id = response_record.question_id;
        
        -- Calculate new SM-2 values
        SELECT * INTO sm2_result FROM calculate_sm2_review(
            COALESCE(sm2_result.ease_factor, 2.5),
            COALESCE(sm2_result.interval_days, 1),
            COALESCE(sm2_result.repetitions, 0),
            performance_quality
        );
        
        -- Update or insert progress record
        INSERT INTO user_question_progress (
            user_id, content_id, question_id, ease_factor, interval_days, repetitions,
            last_reviewed_at, next_review_date, total_reviews, correct_reviews,
            consecutive_correct, last_feedback, last_response_time_seconds, updated_at
        ) VALUES (
            user_id_param,
            response_record.content_id,
            response_record.question_id,
            sm2_result.next_ease_factor,
            sm2_result.next_interval_days,
            sm2_result.next_repetitions,
            NOW(),
            sm2_result.next_review_date,
            COALESCE((SELECT total_reviews FROM user_question_progress WHERE user_id = user_id_param AND content_id = response_record.content_id AND question_id = response_record.question_id), 0) + 1,
            COALESCE((SELECT correct_reviews FROM user_question_progress WHERE user_id = user_id_param AND content_id = response_record.content_id AND question_id = response_record.question_id), 0) + 
                CASE WHEN response_record.feedback = 'got_it' THEN 1 ELSE 0 END,
            CASE 
                WHEN response_record.feedback = 'got_it' THEN COALESCE((SELECT consecutive_correct FROM user_question_progress WHERE user_id = user_id_param AND content_id = response_record.content_id AND question_id = response_record.question_id), 0) + 1
                ELSE 0
            END,
            response_record.feedback::feedback_type,
            response_record.response_time_seconds,
            NOW()
        )
        ON CONFLICT (user_id, content_id, question_id) DO UPDATE SET
            ease_factor = sm2_result.next_ease_factor,
            interval_days = sm2_result.next_interval_days,
            repetitions = sm2_result.next_repetitions,
            last_reviewed_at = NOW(),
            next_review_date = sm2_result.next_review_date,
            total_reviews = user_question_progress.total_reviews + 1,
            correct_reviews = user_question_progress.correct_reviews + 
                CASE WHEN response_record.feedback = 'got_it' THEN 1 ELSE 0 END,
            consecutive_correct = CASE 
                WHEN response_record.feedback = 'got_it' THEN user_question_progress.consecutive_correct + 1
                ELSE 0
            END,
            last_feedback = response_record.feedback::feedback_type,
            last_response_time_seconds = response_record.response_time_seconds,
            updated_at = NOW();
        
        -- Add to review dates array
        review_dates := review_dates || jsonb_build_object(
            'question_id', response_record.question_id,
            'next_review_date', sm2_result.next_review_date
        );
        
        update_count := update_count + 1;
    END LOOP;
    
    RETURN QUERY SELECT update_count, review_dates;
END;
$$;

-- ============================================================================
-- CALCULATE CONTENT MASTERY FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_content_mastery(
    user_id_param UUID,
    content_id_param UUID
) RETURNS TABLE(
    mastery_percentage DECIMAL,
    questions_mastered INTEGER,
    questions_total INTEGER,
    next_review_due_at TIMESTAMPTZ
) LANGUAGE plpgsql AS $$
DECLARE
    total_questions_count INTEGER;
    mastered_questions_count INTEGER;
    mastery_pct DECIMAL;
    next_due TIMESTAMPTZ;
BEGIN
    -- Get total questions for this content
    SELECT COALESCE(c.total_questions, jsonb_array_length(c.questions), 0)
    INTO total_questions_count
    FROM content c
    WHERE c.id = content_id_param;
    
    -- Count mastered questions (ease_factor > 2.5 and interval > 7 days)
    SELECT COUNT(*)
    INTO mastered_questions_count
    FROM user_question_progress uqp
    WHERE uqp.user_id = user_id_param 
        AND uqp.content_id = content_id_param
        AND uqp.ease_factor > 2.5
        AND uqp.interval_days > 7
        AND uqp.consecutive_correct >= 2;
    
    -- Calculate mastery percentage
    mastery_pct := CASE 
        WHEN total_questions_count > 0 
        THEN ROUND((mastered_questions_count::DECIMAL / total_questions_count) * 100, 2)
        ELSE 0
    END;
    
    -- Get next review due date
    SELECT MIN(uqp.next_review_date)
    INTO next_due
    FROM user_question_progress uqp
    WHERE uqp.user_id = user_id_param 
        AND uqp.content_id = content_id_param
        AND uqp.next_review_date > NOW();
    
    RETURN QUERY SELECT 
        mastery_pct,
        mastered_questions_count,
        total_questions_count,
        next_due;
END;
$$;

-- ============================================================================
-- UPDATE TRIGGERS: Maintain denormalized data
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episode_topics_updated_at BEFORE UPDATE ON episode_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_question_progress_updated_at BEFORE UPDATE ON user_question_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update content analytics
CREATE OR REPLACE FUNCTION update_content_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update content.total_questions when questions JSONB changes
    IF NEW.questions IS DISTINCT FROM OLD.questions THEN
        NEW.total_questions := jsonb_array_length(COALESCE(NEW.questions, '[]'::jsonb));
        
        -- Update average difficulty if questions have difficulty_level
        SELECT COALESCE(AVG((q.value->>'difficulty_level')::INTEGER), 3.0)
        INTO NEW.average_difficulty
        FROM jsonb_array_elements(NEW.questions) q(value)
        WHERE q.value ? 'difficulty_level';
        
        -- Update estimated read time (rough calculation)
        NEW.estimated_read_time_minutes := GREATEST(
            1, 
            ROUND(NEW.duration_hours * 15) -- 15 minutes reading per hour of content
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_analytics_trigger 
    BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_content_analytics();

-- ============================================================================
-- SEED DATA: Initial topics and test data
-- ============================================================================

-- Insert initial topics
INSERT INTO topics (name, slug, description, color, icon, sort_order, is_active) VALUES
('Technology', 'technology', 'Technology trends, software development, and digital innovation', '#3B82F6', '💻', 10, TRUE),
('Business', 'business', 'Entrepreneurship, leadership, and business strategy', '#059669', '💼', 20, TRUE),
('Health & Wellness', 'health-wellness', 'Physical health, mental wellness, and lifestyle optimization', '#DC2626', '🏥', 30, TRUE),
('Science', 'science', 'Scientific discoveries, research, and evidence-based insights', '#7C3AED', '🔬', 40, TRUE),
('Personal Development', 'personal-development', 'Self-improvement, productivity, and life skills', '#F59E0B', '🌱', 50, TRUE),
('Education', 'education', 'Learning methodologies, teaching, and educational insights', '#06B6D4', '📚', 60, TRUE),
('Philosophy', 'philosophy', 'Philosophical thinking, ethics, and life perspectives', '#6B7280', '🤔', 70, TRUE),
('History', 'history', 'Historical events, figures, and lessons from the past', '#92400E', '📜', 80, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Update topic analytics (will be maintained by triggers in production)
UPDATE topics SET 
    content_count = 0,
    total_questions = 0,
    active_learners_count = 0;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT (commented out, for reference)
-- ============================================================================

/*
-- To rollback this migration:

BEGIN;

-- Drop new tables
DROP TABLE IF EXISTS learning_sessions CASCADE;
DROP TABLE IF EXISTS user_question_progress CASCADE;
DROP TABLE IF EXISTS user_content_library CASCADE;
DROP TABLE IF EXISTS episode_topics CASCADE;
DROP TABLE IF EXISTS topics CASCADE;

-- Drop views
DROP VIEW IF EXISTS topic_learning_overview;
DROP VIEW IF EXISTS user_learning_analytics;
DROP VIEW IF EXISTS user_content_with_progress;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_content_mastery(UUID, UUID);
DROP FUNCTION IF EXISTS update_question_progress(UUID, JSONB, UUID);
DROP FUNCTION IF EXISTS get_user_due_questions(UUID, UUID[], INTEGER, difficulty_level, BOOLEAN);
DROP FUNCTION IF EXISTS calculate_sm2_review(DECIMAL, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_content_analytics();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Revert content table changes
ALTER TABLE content 
DROP COLUMN IF EXISTS duration_hours,
DROP COLUMN IF EXISTS quick_summary,
DROP COLUMN IF EXISTS full_summary,
DROP COLUMN IF EXISTS questions,
DROP COLUMN IF EXISTS processing_status,
DROP COLUMN IF EXISTS content_version,
DROP COLUMN IF EXISTS total_questions,
DROP COLUMN IF EXISTS average_difficulty,
DROP COLUMN IF EXISTS estimated_read_time_minutes;

-- Drop custom types
DROP TYPE IF EXISTS difficulty_level;
DROP TYPE IF EXISTS confidence_level;
DROP TYPE IF EXISTS feedback_type;
DROP TYPE IF EXISTS session_type;
DROP TYPE IF EXISTS question_type;
DROP TYPE IF EXISTS processing_status;
DROP TYPE IF EXISTS content_source;

COMMIT;
*/ 