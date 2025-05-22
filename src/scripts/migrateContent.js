require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { preloadedContent } = require('../data/preloadedContent');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateContent() {
  try {
    // Insert each content item
    for (const content of preloadedContent) {
      console.log('Attempting to insert:', content.title);
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
        console.error('Error inserting content:', error.message);
        console.error('Error details:', error);
      } else {
        console.log('Successfully inserted:', content.title);
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the migration
migrateContent(); 