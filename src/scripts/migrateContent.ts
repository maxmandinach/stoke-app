import { createClient } from '@supabase/supabase-js';
import { preloadedContent } from '../data/preloadedContent';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateContent() {
  try {
    // Insert each content item
    for (const content of preloadedContent) {
      const { error } = await supabase
        .from('content')
        .insert({
          title: content.title,
          source: content.source,
          source_url: content.source_url,
          transcript: content.transcript,
          summary: content.summary,
          insights: content.insights,
          topics: content.topics,
          created_at: content.created_at,
          processed_at: content.processed_at
        });

      if (error) {
        console.error('Error inserting content:', error);
      } else {
        console.log('Successfully inserted:', content.title);
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateContent(); 