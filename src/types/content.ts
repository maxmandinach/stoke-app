export type ContentSource = 'podcast' | 'youtube';

export interface Insight {
  id: string;
  content: string;
  timestamp?: string;
  type?: string;
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
}

export interface ReviewSchedule {
  nextReview: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
} 