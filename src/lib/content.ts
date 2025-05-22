import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

type Content = Database['public']['Tables']['content']['Row'];
type NewContent = Database['public']['Tables']['content']['Insert'];

export async function getContent() {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Content[];
}

export async function getContentById(id: string) {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Content;
}

export async function addContent(content: NewContent) {
  const { data, error } = await supabase
    .from('content')
    .insert(content)
    .select()
    .single();

  if (error) throw error;
  return data as Content;
}

export async function updateContent(id: string, content: Partial<Content>) {
  const { data, error } = await supabase
    .from('content')
    .update(content)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Content;
}

export async function deleteContent(id: string) {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id);

  if (error) throw error;
} 