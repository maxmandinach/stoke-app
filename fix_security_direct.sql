-- Direct Security Fix Script
-- Run this directly against your database to fix security issues
-- This script is safe to run multiple times (idempotent)

BEGIN;

-- ============================================================================
-- FIX 1: Remove SECURITY DEFINER from Views (if they exist)
-- ============================================================================

-- Recreate user_content_with_progress view without SECURITY DEFINER
DROP VIEW IF EXISTS user_content_with_progress CASCADE;
CREATE OR REPLACE VIEW user_content_with_progress AS
SELECT 
    ucl.user_id,
    ucl.content_id,
    c.title,
    c.source,
    c.url,
    c.duration_hours,
    c.quick_summary,
    c.total_questions,
    c.estimated_read_time_minutes,
    ucl.added_at,
    ucl.last_accessed_at,
    ucl.total_sessions,
    ucl.total_time_minutes,
    ucl.total_questions_answered,
    ucl.total_questions_correct,
    ucl.mastery_percentage,
    ucl.questions_due_count,
    ucl.next_review_due_at,
    ucl.preferred_session_length,
    ucl.notes,
    -- Calculate accuracy percentage
    CASE 
        WHEN ucl.total_questions_answered > 0 
        THEN ROUND((ucl.total_questions_correct::DECIMAL / ucl.total_questions_answered) * 100, 2)
        ELSE 0 
    END as accuracy_percentage,
    -- Questions available for next session
    GREATEST(0, c.total_questions - ucl.total_questions_answered) as questions_remaining
FROM user_content_library ucl
JOIN content c ON ucl.content_id = c.id
WHERE c.processing_status = 'completed';

-- Recreate user_learning_analytics view without SECURITY DEFINER
DROP VIEW IF EXISTS user_learning_analytics CASCADE;
CREATE OR REPLACE VIEW user_learning_analytics AS
SELECT 
    ucl.user_id,
    COUNT(DISTINCT ucl.content_id) as total_content_items,
    COUNT(DISTINCT CASE WHEN ucl.mastery_percentage >= 80 THEN ucl.content_id END) as mastered_content_count,
    COALESCE(AVG(ucl.mastery_percentage), 0) as overall_mastery_percentage,
    SUM(ucl.total_sessions) as total_learning_sessions,
    SUM(ucl.total_time_minutes) as total_learning_time_minutes,
    SUM(ucl.total_questions_answered) as total_questions_answered,
    SUM(ucl.total_questions_correct) as total_questions_correct,
    CASE 
        WHEN SUM(ucl.total_questions_answered) > 0 
        THEN ROUND((SUM(ucl.total_questions_correct)::DECIMAL / SUM(ucl.total_questions_answered)) * 100, 2)
        ELSE 0 
    END as overall_accuracy_percentage,
    COUNT(DISTINCT CASE WHEN ucl.next_review_due_at <= NOW() THEN ucl.content_id END) as content_items_due_for_review,
    SUM(ucl.questions_due_count) as total_questions_due_for_review
FROM user_content_library ucl
GROUP BY ucl.user_id;

-- Recreate topic_learning_overview view without SECURITY DEFINER
DROP VIEW IF EXISTS topic_learning_overview CASCADE;
CREATE OR REPLACE VIEW topic_learning_overview AS
SELECT 
    t.id as topic_id,
    t.name as topic_name,
    t.slug as topic_slug,
    t.description as topic_description,
    t.color as topic_color,
    t.icon as topic_icon,
    t.content_count,
    t.total_questions,
    COUNT(DISTINCT ucl.user_id) as active_learners_count,
    COALESCE(AVG(ucl.mastery_percentage), 0) as average_mastery_percentage,
    COUNT(DISTINCT c.id) as available_content_count,
    SUM(CASE WHEN ucl.mastery_percentage >= 80 THEN 1 ELSE 0 END) as mastered_by_users_count
FROM topics t
LEFT JOIN episode_topics et ON t.id = et.topic_id
LEFT JOIN content c ON et.content_id = c.id AND c.processing_status = 'completed'
LEFT JOIN user_content_library ucl ON c.id = ucl.content_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.slug, t.description, t.color, t.icon, t.content_count, t.total_questions;

-- ============================================================================
-- FIX 2: Enable Row Level Security (RLS) on Tables
-- ============================================================================

-- Enable RLS on topics table (safe to run multiple times)
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_question_progress table
ALTER TABLE user_question_progress ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_content_library table
ALTER TABLE user_content_library ENABLE ROW LEVEL SECURITY;

-- Enable RLS on episode_topics table
ALTER TABLE episode_topics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on learning_sessions table
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES (Drop existing ones first to avoid conflicts)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active topics" ON topics;
DROP POLICY IF EXISTS "Admins can manage topics" ON topics;
DROP POLICY IF EXISTS "Users can view own question progress" ON user_question_progress;
DROP POLICY IF EXISTS "Users can update own question progress" ON user_question_progress;
DROP POLICY IF EXISTS "Users can insert own question progress" ON user_question_progress;
DROP POLICY IF EXISTS "Users can view own content library" ON user_content_library;
DROP POLICY IF EXISTS "Users can update own content library" ON user_content_library;
DROP POLICY IF EXISTS "Users can insert into own content library" ON user_content_library;
DROP POLICY IF EXISTS "Anyone can view episode topics" ON episode_topics;
DROP POLICY IF EXISTS "Admins can manage episode topics" ON episode_topics;
DROP POLICY IF EXISTS "Users can view own learning sessions" ON learning_sessions;
DROP POLICY IF EXISTS "Users can update own learning sessions" ON learning_sessions;
DROP POLICY IF EXISTS "Users can insert own learning sessions" ON learning_sessions;

-- Topics: Allow read access to all authenticated users, admin write access
CREATE POLICY "Anyone can view active topics" ON topics
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage topics" ON topics
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- User Question Progress: Users can only access their own progress
CREATE POLICY "Users can view own question progress" ON user_question_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own question progress" ON user_question_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question progress" ON user_question_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Content Library: Users can only access their own library
CREATE POLICY "Users can view own content library" ON user_content_library
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own content library" ON user_content_library
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own content library" ON user_content_library
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Episode Topics: Allow read access to all authenticated users
CREATE POLICY "Anyone can view episode topics" ON episode_topics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage episode topics" ON episode_topics
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Learning Sessions: Users can only access their own sessions
CREATE POLICY "Users can view own learning sessions" ON learning_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own learning sessions" ON learning_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions" ON learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMIT;

-- Success message
SELECT 'Security fixes applied successfully!' as status; 