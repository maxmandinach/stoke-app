-- Migration: Fix Security Issues - Enable RLS and Remove Security Definer
-- Description: Address security definer views and missing RLS policies
-- Created: 2025-06-03
-- Fixes: Security definer views and missing RLS on public tables

BEGIN;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL PUBLIC TABLES
-- ============================================================================

-- Enable RLS on tables that are missing it
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE PUBLIC ACCESS POLICIES (NO AUTH MODEL)
-- ============================================================================
-- Since you have no auth model, these policies allow public access
-- This maintains your current functionality while enabling RLS

-- Topics: Allow public read access (topics are public content)
CREATE POLICY "Public read access on topics" ON public.topics
    FOR SELECT USING (true);

CREATE POLICY "Public insert access on topics" ON public.topics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access on topics" ON public.topics
    FOR UPDATE USING (true);

CREATE POLICY "Public delete access on topics" ON public.topics
    FOR DELETE USING (true);

-- Episode Topics: Allow public access (content-topic relationships)
CREATE POLICY "Public read access on episode_topics" ON public.episode_topics
    FOR SELECT USING (true);

CREATE POLICY "Public insert access on episode_topics" ON public.episode_topics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access on episode_topics" ON public.episode_topics
    FOR UPDATE USING (true);

CREATE POLICY "Public delete access on episode_topics" ON public.episode_topics
    FOR DELETE USING (true);

-- User Content Library: Allow public access
-- NOTE: Consider restricting this in the future if you add user auth
CREATE POLICY "Public read access on user_content_library" ON public.user_content_library
    FOR SELECT USING (true);

CREATE POLICY "Public insert access on user_content_library" ON public.user_content_library
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access on user_content_library" ON public.user_content_library
    FOR UPDATE USING (true);

CREATE POLICY "Public delete access on user_content_library" ON public.user_content_library
    FOR DELETE USING (true);

-- User Question Progress: Allow public access
-- NOTE: Consider restricting this in the future if you add user auth
CREATE POLICY "Public read access on user_question_progress" ON public.user_question_progress
    FOR SELECT USING (true);

CREATE POLICY "Public insert access on user_question_progress" ON public.user_question_progress
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access on user_question_progress" ON public.user_question_progress
    FOR UPDATE USING (true);

CREATE POLICY "Public delete access on user_question_progress" ON public.user_question_progress
    FOR DELETE USING (true);

-- Learning Sessions: Allow public access
-- NOTE: Consider restricting this in the future if you add user auth
CREATE POLICY "Public read access on learning_sessions" ON public.learning_sessions
    FOR SELECT USING (true);

CREATE POLICY "Public insert access on learning_sessions" ON public.learning_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access on learning_sessions" ON public.learning_sessions
    FOR UPDATE USING (true);

CREATE POLICY "Public delete access on learning_sessions" ON public.learning_sessions
    FOR DELETE USING (true);

-- ============================================================================
-- RECREATE VIEWS WITHOUT SECURITY DEFINER
-- ============================================================================

-- Drop existing views
DROP VIEW IF EXISTS user_content_with_progress;
DROP VIEW IF EXISTS user_learning_analytics;
DROP VIEW IF EXISTS topic_learning_overview;

-- Recreate user_content_with_progress WITHOUT SECURITY DEFINER
CREATE VIEW user_content_with_progress AS
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

-- Recreate user_learning_analytics WITHOUT SECURITY DEFINER
CREATE VIEW user_learning_analytics AS
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

-- Recreate topic_learning_overview WITHOUT SECURITY DEFINER
CREATE VIEW topic_learning_overview AS
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
-- GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant SELECT access on views to anon and authenticated users
GRANT SELECT ON user_content_with_progress TO anon, authenticated;
GRANT SELECT ON user_learning_analytics TO anon, authenticated;
GRANT SELECT ON topic_learning_overview TO anon, authenticated;

-- Grant access to the new tables for PostgREST
GRANT ALL ON public.topics TO anon, authenticated;
GRANT ALL ON public.episode_topics TO anon, authenticated;
GRANT ALL ON public.user_content_library TO anon, authenticated;
GRANT ALL ON public.user_question_progress TO anon, authenticated;
GRANT ALL ON public.learning_sessions TO anon, authenticated;

COMMIT;

-- ============================================================================
-- NOTES FOR FUTURE AUTHENTICATION
-- ============================================================================

/*
When you add user authentication in the future, you should:

1. Replace the public access policies with user-specific policies like:

   CREATE POLICY "Users can only see their own data" ON user_content_library
       FOR ALL USING (auth.uid() = user_id);

2. Update the views to filter by the current user:

   WHERE ucl.user_id = auth.uid()

3. Remove the broad public access and replace with auth-based access:

   REVOKE ALL ON user_content_library FROM anon;
   GRANT SELECT, INSERT, UPDATE, DELETE ON user_content_library TO authenticated;

This migration maintains your current functionality while fixing the security issues.
*/
