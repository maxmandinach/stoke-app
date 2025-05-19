import { supabase } from './supabase';
import { Content, Insight } from '../types';

export const contentService = {
  async getContents(): Promise<Content[]> {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addContent(content: Omit<Content, 'id' | 'created_at'>): Promise<Content> {
    const { data, error } = await supabase
      .from('contents')
      .insert([content])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getInsights(contentId: string): Promise<Insight[]> {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addInsight(insight: Omit<Insight, 'id' | 'created_at'>): Promise<Insight> {
    const { data, error } = await supabase
      .from('insights')
      .insert([insight])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInsightReview(insightId: string, sm2Data: Insight['sm2_data']): Promise<void> {
    const { error } = await supabase
      .from('insights')
      .update({
        sm2_data: sm2Data,
        last_reviewed: new Date().toISOString(),
        next_review: new Date(Date.now() + sm2Data.interval * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', insightId);

    if (error) throw error;
  },
}; 