export type ContentSource = 'podcast' | 'youtube';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Insight {
  id: string;
  content: string;
  timestamp?: string;
  type?: string;
  isAiGenerated?: boolean;
  confidence?: ConfidenceLevel;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface Content {
  id: string;
  title: string;
  source: ContentSource;
  source_url: string;
  transcript: string;
  summary: string;
  insights: Insight[];
  topics: string[];
  created_at: string;
  processed_at: string;
  isAiProcessed?: boolean;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ReviewSchedule {
  nextReview: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
} 