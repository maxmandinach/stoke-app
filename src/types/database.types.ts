export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      content: {
        Row: {
          id: string
          title: string
          source: 'podcast' | 'video' | 'article' | 'book' | 'conversation'
          source_url: string
          transcript: string
          summary: string
          insights: Json[]
          topics: string[]
          created_at: string
          processed_at: string
          isAiProcessed?: boolean
          processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'
        }
        Insert: {
          id?: string
          title: string
          source: 'podcast' | 'video' | 'article' | 'book' | 'conversation'
          source_url: string
          transcript: string
          summary: string
          insights?: Json[]
          topics?: string[]
          created_at?: string
          processed_at?: string
          isAiProcessed?: boolean
          processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'
        }
        Update: {
          id?: string
          title?: string
          source?: 'podcast' | 'video' | 'article' | 'book' | 'conversation'
          source_url?: string
          transcript?: string
          summary?: string
          insights?: Json[]
          topics?: string[]
          created_at?: string
          processed_at?: string
          isAiProcessed?: boolean
          processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 