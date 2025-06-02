import { supabase } from '@/lib/supabase';
import { 
  ContentGenerationRequest, 
  GeneratedContent, 
  ProcessingJob,
  GeminiError,
  contentProcessor
} from '@/lib/gemini';
import { Database, ProcessingStatus, ContentSource } from '@/types/database.types';

type ContentRow = Database['public']['Tables']['content']['Row'];
type ContentInsert = Database['public']['Tables']['content']['Insert'];
type ContentUpdate = Database['public']['Tables']['content']['Update'];

// Content processing database operations
export class ContentProcessingDB {
  
  /**
   * Fetch content from database for processing
   */
  async fetchContentForProcessing(contentId: string): Promise<ContentGenerationRequest | null> {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('id, title, source, transcript, duration_hours')
        .eq('id', contentId)
        .single();

      if (error) {
        console.error('Error fetching content:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        contentId: data.id,
        title: data.title,
        transcript: data.transcript,
        durationHours: data.duration_hours,
        source: data.source,
      };
    } catch (error) {
      console.error('Database error in fetchContentForProcessing:', error);
      return null;
    }
  }

  /**
   * Update content processing status
   */
  async updateProcessingStatus(
    contentId: string, 
    status: ProcessingStatus,
    error?: string
  ): Promise<void> {
    try {
      const updateData: ContentUpdate = {
        processing_status: status,
        ...(status === 'processing' && { processed_at: null }),
        ...(status === 'completed' && { processed_at: new Date().toISOString() }),
        ...(error && { processing_status: 'failed' }),
      };

      const { error: dbError } = await supabase
        .from('content')
        .update(updateData)
        .eq('id', contentId);

      if (dbError) {
        console.error('Error updating processing status:', dbError);
        throw new GeminiError('Failed to update processing status', 'DATABASE_ERROR');
      }
    } catch (error) {
      console.error('Database error in updateProcessingStatus:', error);
      throw error;
    }
  }

  /**
   * Save generated content to database
   */
  async saveGeneratedContent(
    contentId: string, 
    generatedContent: GeneratedContent
  ): Promise<void> {
    try {
      // Calculate analytics fields
      const totalQuestions = generatedContent.questions.length;
      const averageDifficulty = totalQuestions > 0 
        ? generatedContent.questions.reduce((sum, q) => sum + q.difficulty_level, 0) / totalQuestions
        : 0;
      
      // Estimate read time (80 words per minute for full summary)
      const summaryWordCount = generatedContent.fullSummary.split(' ').length;
      const estimatedReadTimeMinutes = Math.ceil(summaryWordCount / 80);

      const updateData: ContentUpdate = {
        quick_summary: generatedContent.quickSummary,
        full_summary: generatedContent.fullSummary,
        questions: generatedContent.questions,
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
        content_version: generatedContent.metadata.contentVersion,
        total_questions: totalQuestions,
        average_difficulty: averageDifficulty,
        estimated_read_time_minutes: estimatedReadTimeMinutes,
      };

      const { error } = await supabase
        .from('content')
        .update(updateData)
        .eq('id', contentId);

      if (error) {
        console.error('Error saving generated content:', error);
        throw new GeminiError('Failed to save generated content', 'DATABASE_ERROR');
      }

      console.log(`Successfully saved generated content for ${contentId}`);
    } catch (error) {
      console.error('Database error in saveGeneratedContent:', error);
      throw error;
    }
  }

  /**
   * Get content processing status
   */
  async getContentProcessingStatus(contentId: string): Promise<{
    status: ProcessingStatus;
    processed_at: string | null;
    has_processed_content: boolean;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('processing_status, processed_at, quick_summary, full_summary, questions')
        .eq('id', contentId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        status: data.processing_status as ProcessingStatus,
        processed_at: data.processed_at,
        has_processed_content: !!(data.quick_summary && data.full_summary && data.questions),
      };
    } catch (error) {
      console.error('Database error in getContentProcessingStatus:', error);
      return null;
    }
  }

  /**
   * Get all content pending processing
   */
  async getPendingContent(): Promise<ContentRow[]> {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('processing_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending content:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error in getPendingContent:', error);
      return [];
    }
  }

  /**
   * Add new content for processing
   */
  async addContentForProcessing(content: {
    title: string;
    source: ContentSource;
    source_url: string;
    transcript: string;
    duration_hours: number;
    topics?: string[];
  }): Promise<string> {
    try {
      const contentData: ContentInsert = {
        ...content,
        processing_status: 'pending',
        content_version: 1,
        total_questions: 0,
        average_difficulty: 0,
        estimated_read_time_minutes: 0,
      };

      const { data, error } = await supabase
        .from('content')
        .insert(contentData)
        .select('id')
        .single();

      if (error) {
        console.error('Error adding content for processing:', error);
        throw new GeminiError('Failed to add content', 'DATABASE_ERROR');
      }

      if (!data) {
        throw new GeminiError('No content ID returned', 'DATABASE_ERROR');
      }

      return data.id;
    } catch (error) {
      console.error('Database error in addContentForProcessing:', error);
      throw error;
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    total_content: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total_questions_generated: number;
    avg_processing_time_hours: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('processing_status, total_questions, created_at, processed_at');

      if (error) {
        console.error('Error fetching processing stats:', error);
        return {
          total_content: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          total_questions_generated: 0,
          avg_processing_time_hours: 0,
        };
      }

      const stats = {
        total_content: data.length,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total_questions_generated: 0,
        avg_processing_time_hours: 0,
      };

      let totalProcessingTimeMs = 0;
      let processedCount = 0;

      data.forEach(item => {
        switch (item.processing_status) {
          case 'pending':
            stats.pending++;
            break;
          case 'processing':
            stats.processing++;
            break;
          case 'completed':
            stats.completed++;
            stats.total_questions_generated += item.total_questions || 0;
            
            if (item.created_at && item.processed_at) {
              const createdAt = new Date(item.created_at);
              const processedAt = new Date(item.processed_at);
              totalProcessingTimeMs += processedAt.getTime() - createdAt.getTime();
              processedCount++;
            }
            break;
          case 'failed':
            stats.failed++;
            break;
        }
      });

      if (processedCount > 0) {
        stats.avg_processing_time_hours = (totalProcessingTimeMs / processedCount) / (1000 * 60 * 60);
      }

      return stats;
    } catch (error) {
      console.error('Database error in getProcessingStats:', error);
      return {
        total_content: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total_questions_generated: 0,
        avg_processing_time_hours: 0,
      };
    }
  }

  /**
   * Retry failed content processing
   */
  async retryFailedContent(contentId: string): Promise<string> {
    try {
      // Reset status to pending
      await this.updateProcessingStatus(contentId, 'pending');
      
      // Queue for processing
      return await contentProcessor.queueContentProcessing(contentId);
    } catch (error) {
      console.error('Error retrying failed content:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple content items
   */
  async batchProcessContent(contentIds: string[]): Promise<{
    queued: string[];
    failed: string[];
  }> {
    const results = {
      queued: [] as string[],
      failed: [] as string[],
    };

    for (const contentId of contentIds) {
      try {
        await this.updateProcessingStatus(contentId, 'pending');
        const jobId = await contentProcessor.queueContentProcessing(contentId);
        results.queued.push(jobId);
      } catch (error) {
        console.error(`Failed to queue content ${contentId}:`, error);
        results.failed.push(contentId);
      }
    }

    return results;
  }

  /**
   * Clean up old processing jobs and reset stuck content
   */
  async cleanupStuckProcessing(): Promise<{
    reset_count: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let resetCount = 0;

    try {
      // Find content that has been "processing" for more than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('content')
        .select('id')
        .eq('processing_status', 'processing')
        .lt('created_at', oneHourAgo);

      if (error) {
        errors.push(`Error finding stuck content: ${error.message}`);
        return { reset_count: 0, errors };
      }

      if (!data || data.length === 0) {
        return { reset_count: 0, errors };
      }

      // Reset stuck content to pending
      for (const item of data) {
        try {
          await this.updateProcessingStatus(item.id, 'pending');
          resetCount++;
        } catch (error) {
          errors.push(`Failed to reset content ${item.id}: ${error}`);
        }
      }

      return { reset_count: resetCount, errors };
    } catch (error) {
      errors.push(`Cleanup error: ${error}`);
      return { reset_count: resetCount, errors };
    }
  }
}

// Content validation utilities
export class ContentValidator {
  
  /**
   * Validate content before processing
   */
  static validateContentForProcessing(content: {
    title: string;
    transcript: string;
    duration_hours: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.title || content.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!content.transcript || content.transcript.trim().length < 100) {
      errors.push('Transcript must be at least 100 characters');
    }

    if (content.duration_hours <= 0 || content.duration_hours > 10) {
      errors.push('Duration must be between 0 and 10 hours');
    }

    // Check if transcript is too long for Gemini (approximate token limit)
    const approximateTokens = content.transcript.length / 4; // Rough estimate
    if (approximateTokens > 1000000) { // Gemini 2.0 context limit
      errors.push('Content too long for processing (exceeds token limit)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate generated content quality
   */
  static validateGeneratedContentQuality(
    content: GeneratedContent,
    originalDurationHours: number
  ): { score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 100;

    // Check quick summary
    const quickBullets = content.quickSummary.split('\n').filter(line => 
      line.trim().startsWith('•')
    );
    const expectedBullets = Math.max(4, Math.ceil(originalDurationHours * 4));
    
    if (quickBullets.length < expectedBullets * 0.8) {
      score -= 20;
      feedback.push(`Quick summary has ${quickBullets.length} bullets, expected ~${expectedBullets}`);
    }

    // Check full summary
    const fullParagraphs = content.fullSummary.split('\n\n').filter(p => 
      p.trim().length > 50
    );
    const expectedParagraphs = Math.max(2, Math.ceil(originalDurationHours * 2));
    
    if (fullParagraphs.length < expectedParagraphs * 0.8) {
      score -= 20;
      feedback.push(`Full summary has ${fullParagraphs.length} paragraphs, expected ~${expectedParagraphs}`);
    }

    // Check questions
    const expectedQuestions = Math.max(10, Math.ceil(originalDurationHours * 12));
    if (content.questions.length < expectedQuestions * 0.8) {
      score -= 30;
      feedback.push(`Generated ${content.questions.length} questions, expected ~${expectedQuestions}`);
    }

    // Check question quality
    const invalidQuestions = content.questions.filter(q => 
      !q.content || 
      !q.type || 
      !q.difficulty_level || 
      q.difficulty_level < 1 || 
      q.difficulty_level > 5 ||
      q.content.length < 10
    );
    
    if (invalidQuestions.length > 0) {
      score -= 20;
      feedback.push(`${invalidQuestions.length} questions have quality issues`);
    }

    // Check difficulty distribution
    const difficultyDistribution: Record<number, number> = {};
    content.questions.forEach(q => {
      difficultyDistribution[q.difficulty_level] = (difficultyDistribution[q.difficulty_level] || 0) + 1;
    });

    const hasGoodDistribution = Object.keys(difficultyDistribution).length >= 3;
    if (!hasGoodDistribution) {
      score -= 10;
      feedback.push('Poor difficulty distribution across questions');
    }

    return {
      score: Math.max(0, score),
      feedback,
    };
  }
}

// Singleton instance
export const contentProcessingDB = new ContentProcessingDB();

// Processing pipeline orchestrator
export class ProcessingOrchestrator {
  private db: ContentProcessingDB;
  private isProcessing = false;

  constructor() {
    this.db = contentProcessingDB;
  }

  /**
   * Process a single content item
   */
  async processContent(contentId: string): Promise<string> {
    try {
      // Validate content exists and can be processed
      const content = await this.db.fetchContentForProcessing(contentId);
      if (!content) {
        throw new GeminiError('Content not found or not processable', 'CONTENT_NOT_FOUND');
      }

      // Validate content quality
      const validation = ContentValidator.validateContentForProcessing({
        title: content.title,
        transcript: content.transcript,
        duration_hours: content.durationHours,
      });

      if (!validation.isValid) {
        await this.db.updateProcessingStatus(contentId, 'failed', validation.errors.join('; '));
        throw new GeminiError(`Content validation failed: ${validation.errors.join(', ')}`, 'VALIDATION_FAILED');
      }

      // Update status to processing
      await this.db.updateProcessingStatus(contentId, 'processing');

      // Queue for processing with Gemini
      const jobId = await contentProcessor.queueContentProcessing(contentId);

      return jobId;
    } catch (error) {
      console.error(`Error processing content ${contentId}:`, error);
      await this.db.updateProcessingStatus(contentId, 'failed', 
        error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Process all pending content
   */
  async processAllPending(): Promise<{
    started: number;
    failed: number;
    already_processing: number;
  }> {
    if (this.isProcessing) {
      return { started: 0, failed: 0, already_processing: 1 };
    }

    this.isProcessing = true;
    const results = { started: 0, failed: 0, already_processing: 0 };

    try {
      const pendingContent = await this.db.getPendingContent();
      
      for (const content of pendingContent) {
        try {
          await this.processContent(content.id);
          results.started++;
        } catch (error) {
          console.error(`Failed to start processing for ${content.id}:`, error);
          results.failed++;
        }
      }

      return results;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Add content and start processing
   */
  async addAndProcessContent(contentData: {
    title: string;
    source: ContentSource;
    source_url: string;
    transcript: string;
    duration_hours: number;
    topics?: string[];
  }): Promise<{ contentId: string; jobId: string }> {
    try {
      // Add content to database
      const contentId = await this.db.addContentForProcessing(contentData);
      
      // Start processing
      const jobId = await this.processContent(contentId);
      
      return { contentId, jobId };
    } catch (error) {
      console.error('Error adding and processing content:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive processing status
   */
  async getProcessingOverview(): Promise<{
    stats: Awaited<ReturnType<ContentProcessingDB['getProcessingStats']>>;
    recent_jobs: ProcessingJob[];
    system_health: {
      api_accessible: boolean;
      queue_length: number;
      last_successful_processing: string | null;
    };
  }> {
    try {
      const stats = await this.db.getProcessingStats();
      
      // Get recent jobs (this would need to be implemented in the queue system)
      const recentJobs: ProcessingJob[] = []; // Placeholder
      
      // System health check
      const systemHealth = {
        api_accessible: true, // Would check Gemini API health
        queue_length: 0, // Would get from processing queue
        last_successful_processing: null as string | null,
      };

      // Find last successful processing
      const { data } = await supabase
        .from('content')
        .select('processed_at')
        .eq('processing_status', 'completed')
        .order('processed_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.processed_at) {
        systemHealth.last_successful_processing = data.processed_at;
      }

      return {
        stats,
        recent_jobs: recentJobs,
        system_health: systemHealth,
      };
    } catch (error) {
      console.error('Error getting processing overview:', error);
      throw error;
    }
  }
}

// Singleton instance
export const processingOrchestrator = new ProcessingOrchestrator(); 