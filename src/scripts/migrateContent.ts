const { createClient } = require('@supabase/supabase-js');
const { preloadedContent } = require('../data/preloadedContent');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateContent() {
  try {
    // Insert each content item
    for (const content of preloadedContent) {
      const { data, error } = await supabase
        .from('content')
        .insert({
          title: content.title,
          source: content.source,
          source_url: content.sourceUrl,
          transcript: content.transcript,
          summary: content.summary,
          insights: content.insights,
          topics: content.topics,
          created_at: content.createdAt,
          processed_at: content.processedAt
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