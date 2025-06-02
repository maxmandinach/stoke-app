import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, SafetySetting, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Question, DifficultyLevel, QuestionType, ConfidenceLevel } from '@/types/database.types';

// Environment validation
if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing environment variable: GOOGLE_API_KEY');
}

// Gemini API Configuration
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey && process.env.NODE_ENV !== 'development') {
  console.warn('GOOGLE_API_KEY not found in environment variables');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Safety settings optimized for educational content
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Generation configuration optimized for structured content
const generationConfig: GenerationConfig = {
  temperature: 0.3, // Lower temperature for consistent, factual content
  topK: 40,
  topP: 0.8,
  maxOutputTokens: 8192,
  responseMimeType: "application/json", // Use Gemini's JSON mode
};

// Get configured Gemini model
export async function getGeminiModel(): Promise<GenerativeModel> {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please check GOOGLE_API_KEY environment variable.');
  }
  
  return genAI.getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    safetySettings,
    generationConfig,
  });
}

// Rate limiting configuration
export const RATE_LIMITS = {
  requestsPerMinute: 15,  // Gemini 2.5 Pro rate limit
  requestsPerDay: 1500,   // Daily limit
  maxConcurrentRequests: 3,
  retryDelayMs: 2000,
  maxRetries: 3,
} as const;

// Gemini-specific error types
export class GeminiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

// Content generation interfaces
export interface ContentGenerationRequest {
  contentId: string;
  title: string;
  transcript: string;
  durationHours: number;
  source: string;
}

export interface GeneratedContent {
  quickSummary: string;
  fullSummary: string;
  questions: Question[];
  metadata: {
    processingTimeMs: number;
    contentVersion: number;
    aiModel: string;
    totalTokens?: number;
  };
}

// Content validation schema
export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  quality: {
    summaryClarity: number;    // 0-1 score
    questionRelevance: number; // 0-1 score
    difficultyDistribution: Record<DifficultyLevel, number>;
  };
}

// Processing status tracking
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

export interface ProcessingJob {
  id: string;
  contentId: string;
  status: ProcessingStatus;
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
  estimatedCompletionAt?: Date;
}

// Queue management
export class ProcessingQueue {
  private queue: ProcessingJob[] = [];
  private activeJobs = new Map<string, ProcessingJob>();
  private rateLimiter = new RateLimiter();

  async addJob(contentId: string): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job: ProcessingJob = {
      id: jobId,
      contentId,
      status: 'pending',
      progress: 0,
      startedAt: new Date(),
      retryCount: 0,
    };

    this.queue.push(job);
    this.processQueue();
    return jobId;
  }

  async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    return this.activeJobs.get(jobId) || 
           this.queue.find(job => job.id === jobId) || 
           null;
  }

  private async processQueue(): Promise<void> {
    if (this.activeJobs.size >= RATE_LIMITS.maxConcurrentRequests) {
      return;
    }

    const nextJob = this.queue.find(job => job.status === 'pending');
    if (!nextJob) {
      return;
    }

    await this.processJob(nextJob);
  }

  private async processJob(job: ProcessingJob): Promise<void> {
    try {
      job.status = 'processing';
      this.activeJobs.set(job.id, job);

      // Move to processing phase
      const index = this.queue.findIndex(j => j.id === job.id);
      if (index !== -1) {
        this.queue.splice(index, 1);
      }

      // Rate limiting check
      await this.rateLimiter.waitForSlot();

      // Process the content
      const processor = new ContentProcessor();
      await processor.processContent(job.contentId, (progress) => {
        job.progress = progress;
      });

      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;

    } catch (error) {
      await this.handleJobError(job, error);
    } finally {
      // Continue processing queue
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  private async handleJobError(job: ProcessingJob, error: any): Promise<void> {
    job.retryCount++;
    
    const geminiError = error instanceof GeminiError ? error : 
                       new GeminiError(error.message || 'Unknown error', 'UNKNOWN_ERROR');

    job.error = geminiError.message;

    if (geminiError.retryable && job.retryCount < RATE_LIMITS.maxRetries) {
      job.status = 'retrying';
      // Exponential backoff
      const delayMs = RATE_LIMITS.retryDelayMs * Math.pow(2, job.retryCount - 1);
      setTimeout(() => {
        job.status = 'pending';
        this.queue.unshift(job); // Add to front of queue for retry
        this.processQueue();
      }, delayMs);
    } else {
      job.status = 'failed';
      job.completedAt = new Date();
    }
  }
}

// Rate limiter implementation
class RateLimiter {
  private requestTimes: number[] = [];
  private dailyRequestCount = 0;
  private lastResetDate = new Date().toDateString();

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const currentDate = new Date().toDateString();
    
    // Reset daily counter if it's a new day
    if (currentDate !== this.lastResetDate) {
      this.dailyRequestCount = 0;
      this.lastResetDate = currentDate;
    }

    // Check daily limit
    if (this.dailyRequestCount >= RATE_LIMITS.requestsPerDay) {
      throw new GeminiError(
        'Daily request limit exceeded',
        'DAILY_LIMIT_EXCEEDED',
        429,
        false
      );
    }

    // Clean old request times (older than 1 minute)
    this.requestTimes = this.requestTimes.filter(time => now - time < 60000);

    // Check per-minute limit
    if (this.requestTimes.length >= RATE_LIMITS.requestsPerMinute) {
      const oldestRequestTime = Math.min(...this.requestTimes);
      const waitTime = 60000 - (now - oldestRequestTime);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Record this request
    this.requestTimes.push(now);
    this.dailyRequestCount++;
  }
}

// Content processor class
export class ContentProcessor {
  private queue: ProcessingQueue;
  private model: GenerativeModel | null = null;

  constructor() {
    this.queue = new ProcessingQueue();
  }

  private async getModel(): Promise<GenerativeModel> {
    if (!this.model) {
      this.model = await getGeminiModel();
    }
    return this.model;
  }

  async processContent(
    contentId: string, 
    progressCallback?: (progress: number) => void
  ): Promise<GeneratedContent> {
    const startTime = Date.now();
    
    try {
      progressCallback?.(10);
      
      // Fetch content from database
      const content = await this.fetchContentFromDatabase(contentId);
      if (!content) {
        throw new GeminiError('Content not found', 'CONTENT_NOT_FOUND', 404);
      }

      progressCallback?.(20);

      // Generate content using Gemini
      const generatedContent = await this.generateContentWithGemini(content);
      
      progressCallback?.(80);

      // Validate generated content
      const validation = await this.validateGeneratedContent(generatedContent, content.durationHours);
      if (!validation.isValid) {
        throw new GeminiError(
          `Content validation failed: ${validation.errors.join(', ')}`,
          'VALIDATION_FAILED'
        );
      }

      progressCallback?.(90);

      // Save to database
      await this.saveGeneratedContent(contentId, generatedContent);
      
      progressCallback?.(100);

      const processingTime = Date.now() - startTime;
      generatedContent.metadata.processingTimeMs = processingTime;

      return generatedContent;

    } catch (error) {
      const geminiError = this.handleGeminiError(error);
      console.error(`Content processing failed for ${contentId}:`, geminiError);
      throw geminiError;
    }
  }

  private async generateContentWithGemini(content: ContentGenerationRequest): Promise<GeneratedContent> {
    const prompt = this.buildContentGenerationPrompt(content);
    
    try {
      const model = await this.getModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      if (!response) {
        throw new GeminiError('Empty response from Gemini', 'EMPTY_RESPONSE');
      }

      const text = response.text();
      const parsedContent = JSON.parse(text);

      return this.transformGeminiResponse(parsedContent);
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new GeminiError('Invalid JSON response from Gemini', 'INVALID_JSON');
      }
      throw this.handleGeminiError(error);
    }
  }

  private buildContentGenerationPrompt(content: ContentGenerationRequest): string {
    const expectedQuickBullets = Math.max(4, Math.ceil(content.durationHours * 4));
    const expectedFullParagraphs = Math.max(2, Math.ceil(content.durationHours * 2));
    const expectedQuestions = Math.max(10, Math.ceil(content.durationHours * 12));

    return `You are an expert educational content processor for Stoke, a learning platform that helps users retain knowledge through spaced repetition. Generate high-quality summaries and self-assessment questions from the provided ${content.source} content.

CONTENT TO PROCESS:
Title: ${content.title}
Duration: ${content.durationHours} hours
Source: ${content.source}
Transcript: ${content.transcript}

REQUIRED OUTPUT FORMAT (JSON):
{
  "quickSummary": [
    "• Key insight 1",
    "• Key insight 2",
    "• Key insight 3",
    "• Key insight 4"
  ],
  "fullSummary": [
    "Comprehensive paragraph 1 with detailed explanation...",
    "Comprehensive paragraph 2 with detailed explanation..."
  ],
  "questions": [
    {
      "id": "q1",
      "content": "Self-assessment question text?",
      "type": "conceptual|factual|application|reflection",
      "difficulty_level": 1-5,
      "estimated_time_seconds": 15-30,
      "created_by_ai": true,
      "confidence": "high|medium|low",
      "metadata": {
        "keywords": ["keyword1", "keyword2"],
        "concept_area": "main topic area"
      }
    }
  ]
}

SPECIFIC REQUIREMENTS:

1. QUICK SUMMARY (${expectedQuickBullets} bullet points):
   - Exactly ${expectedQuickBullets} concise bullet points (one per ~15 minutes of content)
   - Focus on the most actionable insights and key takeaways
   - Each bullet should be 10-20 words maximum
   - Start each with "•" followed by space

2. FULL SUMMARY (${expectedFullParagraphs} paragraphs):
   - Exactly ${expectedFullParagraphs} comprehensive paragraphs (one per ~30 minutes)
   - Each paragraph should be 80-120 words
   - Provide deeper context, examples, and explanations
   - Connect ideas and show relationships between concepts

3. QUESTIONS (${expectedQuestions} total):
   - Generate exactly ${expectedQuestions} self-assessment questions
   - Design for binary "Got it"/"Revisit" responses (not multiple choice)
   - Mix of question types: 40% conceptual, 30% factual, 20% application, 10% reflection
   - Difficulty distribution: 20% level 1-2 (basic), 60% level 3-4 (intermediate), 20% level 5 (advanced)
   - Estimated time: 15-30 seconds per question for thoughtful consideration
   - Include relevant keywords and concept areas in metadata

QUALITY STANDARDS:
- Use clear, accessible language appropriate for the target audience
- Ensure questions test genuine understanding, not just recall
- Maintain consistency with the source material's tone and depth
- Focus on practical application and retention-worthy concepts
- Avoid overly complex or ambiguous phrasing

Generate content that maximizes learning retention through Stoke's spaced repetition system.`;
  }

  private transformGeminiResponse(geminiResponse: any): GeneratedContent {
    // Transform Gemini response to our content format
    const questions: Question[] = geminiResponse.questions.map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      content: q.content,
      type: q.type as QuestionType,
      difficulty_level: q.difficulty_level as DifficultyLevel,
      estimated_time_seconds: q.estimated_time_seconds || 20,
      created_by_ai: true,
      confidence: q.confidence as ConfidenceLevel,
      metadata: q.metadata || {},
    }));

    return {
      quickSummary: geminiResponse.quickSummary.join('\n'),
      fullSummary: geminiResponse.fullSummary.join('\n\n'),
      questions,
      metadata: {
        processingTimeMs: 0, // Will be set by caller
        contentVersion: 1,
        aiModel: 'gemini-2.5-pro-preview-05-06',
      },
    };
  }

  private async validateGeneratedContent(
    content: GeneratedContent, 
    durationHours: number
  ): Promise<ContentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate quick summary format
    const quickBullets = content.quickSummary.split('\n').filter(line => line.trim().startsWith('•'));
    const expectedQuickBullets = Math.max(4, Math.ceil(durationHours * 4));
    
    if (quickBullets.length < expectedQuickBullets * 0.8) {
      errors.push(`Quick summary has ${quickBullets.length} bullets, expected ~${expectedQuickBullets}`);
    }

    // Validate full summary structure
    const fullParagraphs = content.fullSummary.split('\n\n').filter(p => p.trim().length > 50);
    const expectedFullParagraphs = Math.max(2, Math.ceil(durationHours * 2));
    
    if (fullParagraphs.length < expectedFullParagraphs * 0.8) {
      errors.push(`Full summary has ${fullParagraphs.length} paragraphs, expected ~${expectedFullParagraphs}`);
    }

    // Validate questions
    const expectedQuestions = Math.max(10, Math.ceil(durationHours * 12));
    if (content.questions.length < expectedQuestions * 0.8) {
      errors.push(`Generated ${content.questions.length} questions, expected ~${expectedQuestions}`);
    }

    // Validate question structure
    const invalidQuestions = content.questions.filter(q => 
      !q.content || !q.type || !q.difficulty_level || q.difficulty_level < 1 || q.difficulty_level > 5
    );
    
    if (invalidQuestions.length > 0) {
      errors.push(`${invalidQuestions.length} questions have invalid structure`);
    }

    // Analyze difficulty distribution
    const difficultyDistribution: Record<DifficultyLevel, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    content.questions.forEach(q => {
      difficultyDistribution[q.difficulty_level]++;
    });

    // Quality scores (simplified for now)
    const summaryClarity = errors.length === 0 ? 0.9 : 0.6;
    const questionRelevance = invalidQuestions.length === 0 ? 0.9 : 0.6;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      quality: {
        summaryClarity,
        questionRelevance,
        difficultyDistribution,
      },
    };
  }

  private handleGeminiError(error: any): GeminiError {
    if (error instanceof GeminiError) {
      return error;
    }

    // Handle specific Gemini API errors
    if (error.status === 400) {
      return new GeminiError('Invalid request to Gemini API', 'INVALID_REQUEST', 400);
    }
    
    if (error.status === 401) {
      return new GeminiError('Invalid Gemini API key', 'INVALID_API_KEY', 401);
    }
    
    if (error.status === 403) {
      return new GeminiError('Gemini API access forbidden', 'ACCESS_FORBIDDEN', 403);
    }
    
    if (error.status === 429) {
      return new GeminiError('Gemini API rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, true);
    }
    
    if (error.status === 500) {
      return new GeminiError('Gemini API server error', 'SERVER_ERROR', 500, true);
    }

    // Handle safety filter blocks
    if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
      return new GeminiError('Content blocked by Gemini safety filters', 'SAFETY_BLOCKED', 400);
    }

    // Handle context length errors
    if (error.message?.includes('context length') || error.message?.includes('token limit')) {
      return new GeminiError('Content exceeds Gemini context limit', 'CONTEXT_TOO_LONG', 400);
    }

    return new GeminiError(
      error.message || 'Unknown Gemini API error',
      'UNKNOWN_ERROR',
      undefined,
      true
    );
  }

  private async fetchContentFromDatabase(contentId: string): Promise<ContentGenerationRequest | null> {
    // Import and use the database integration
    const { contentProcessingDB } = await import('@/lib/database/contentProcessing');
    return await contentProcessingDB.fetchContentForProcessing(contentId);
  }

  private async saveGeneratedContent(contentId: string, content: GeneratedContent): Promise<void> {
    // Import and use the database integration
    const { contentProcessingDB } = await import('@/lib/database/contentProcessing');
    await contentProcessingDB.saveGeneratedContent(contentId, content);
  }

  // Public methods for queue management
  async queueContentProcessing(contentId: string): Promise<string> {
    return await this.queue.addJob(contentId);
  }

  async getProcessingStatus(jobId: string): Promise<ProcessingJob | null> {
    return await this.queue.getJobStatus(jobId);
  }
}

// Singleton instance for app-wide use
export const contentProcessor = new ContentProcessor(); 