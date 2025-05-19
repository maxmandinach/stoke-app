export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Content {
  id: string;
  title: string;
  source: 'podcast' | 'youtube' | 'manual';
  source_url?: string;
  transcript: string;
  created_at: string;
  user_id: string;
}

export interface Insight {
  id: string;
  content_id: string;
  text: string;
  summary: string;
  topics: string[];
  created_at: string;
  last_reviewed?: string;
  next_review?: string;
  sm2_data: SM2Data;
}

export interface SM2Data {
  repetitions: number;
  ease_factor: number;
  interval: number;
  quality: number;
}

export interface ReviewSession {
  id: string;
  insight_id: string;
  user_id: string;
  quality: number;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Library: undefined;
  Review: undefined;
  Topics: undefined;
  Profile: undefined;
}; 