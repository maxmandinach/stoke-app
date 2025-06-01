#!/usr/bin/env node

/**
 * Test script for the shared content model database migration
 * This script validates the database schema and tests basic operations
 * without requiring Docker or local Supabase setup.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Could not load .env.local file:', error.message);
    return {};
  }
}

// Initialize Supabase client
function initializeSupabase() {
  const env = loadEnvFile();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check .env.local file.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Test database schema and functions
async function testDatabaseSchema(supabase) {
  console.log('🔍 Testing database schema...\n');
  
  const tests = [
    {
      name: 'Topics table exists and has data',
      test: async () => {
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .limit(5);
        
        if (error) throw error;
        return { count: data.length, sample: data[0] };
      }
    },
    {
      name: 'Content table has new fields',
      test: async () => {
        const { data, error } = await supabase
          .from('content')
          .select('id, duration_hours, processing_status, total_questions, questions')
          .limit(1);
        
        if (error) throw error;
        return { hasNewFields: true, sampleData: data[0] };
      }
    },
    {
      name: 'User content library table exists',
      test: async () => {
        const { data, error } = await supabase
          .from('user_content_library')
          .select('*')
          .limit(1);
        
        // It's OK if this table is empty, we just want to verify it exists
        if (error && !error.message.includes('no rows')) throw error;
        return { tableExists: true };
      }
    },
    {
      name: 'User question progress table exists',
      test: async () => {
        const { data, error } = await supabase
          .from('user_question_progress')
          .select('*')
          .limit(1);
        
        if (error && !error.message.includes('no rows')) throw error;
        return { tableExists: true };
      }
    },
    {
      name: 'Episode topics table exists',
      test: async () => {
        const { data, error } = await supabase
          .from('episode_topics')
          .select('*')
          .limit(1);
        
        if (error && !error.message.includes('no rows')) throw error;
        return { tableExists: true };
      }
    },
    {
      name: 'Learning sessions table exists',
      test: async () => {
        const { data, error } = await supabase
          .from('learning_sessions')
          .select('*')
          .limit(1);
        
        if (error && !error.message.includes('no rows')) throw error;
        return { tableExists: true };
      }
    },
    {
      name: 'SuperMemo SM-2 function exists',
      test: async () => {
        const { data, error } = await supabase.rpc('calculate_sm2_review', {
          current_ease_factor: 2.5,
          current_interval_days: 1,
          current_repetitions: 0,
          performance_quality: 4
        });
        
        if (error) throw error;
        return data;
      }
    },
    {
      name: 'User content view exists',
      test: async () => {
        const { data, error } = await supabase
          .from('user_content_with_progress')
          .select('*')
          .limit(1);
        
        if (error && !error.message.includes('no rows')) throw error;
        return { viewExists: true };
      }
    }
  ];
  
  const results = [];
  let passCount = 0;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      results.push({ name: test.name, status: 'PASS', result });
      console.log(`✅ ${test.name}: PASS`);
      if (result && typeof result === 'object') {
        console.log(`   Details: ${JSON.stringify(result, null, 2)}`);
      }
      passCount++;
    } catch (error) {
      results.push({ name: test.name, status: 'FAIL', error: error.message });
      console.log(`❌ ${test.name}: FAIL`);
      console.log(`   Error: ${error.message}`);
    }
    console.log(''); // Add spacing
  }
  
  console.log(`\n📊 Test Results: ${passCount}/${tests.length} tests passed\n`);
  return results;
}

// Get database statistics
async function getDatabaseStats(supabase) {
  console.log('📈 Gathering database statistics...\n');
  
  const tables = [
    'topics',
    'content', 
    'user_content_library',
    'user_question_progress',
    'learning_sessions',
    'episode_topics'
  ];
  
  const stats = {};
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      stats[table] = count || 0;
      console.log(`📋 ${table}: ${count || 0} records`);
    } catch (error) {
      stats[table] = 'ERROR';
      console.log(`❌ ${table}: Error - ${error.message}`);
    }
  }
  
  console.log('\n📊 Database Statistics Summary:');
  console.log(JSON.stringify(stats, null, 2));
  
  return stats;
}

// Test content creation workflow
async function testContentWorkflow(supabase) {
  console.log('\n🔬 Testing content creation workflow...\n');
  
  try {
    // 1. Create test content
    console.log('1️⃣ Creating test content...');
    const { data: content, error: createError } = await supabase
      .from('content')
      .insert([{
        title: 'Test Content - Database Migration Validation',
        source: 'podcast',
        source_url: 'https://test.example.com/migration-test',
        transcript: 'This is a test transcript for validating the database migration.',
        duration_hours: 1.0,
        processing_status: 'pending',
        average_difficulty: 3.0,
        estimated_read_time_minutes: 15
      }])
      .select()
      .single();
    
    if (createError) throw createError;
    console.log(`✅ Created content with ID: ${content.id}`);
    
    // 2. Update with processed variants
    console.log('2️⃣ Updating with processed variants...');
    const testQuestions = [
      {
        id: 'test_q_1',
        content: 'What is the main topic of this test content?',
        type: 'factual',
        difficulty_level: 3,
        estimated_time_seconds: 30,
        created_by_ai: true,
        confidence: 'high'
      }
    ];
    
    const { data: updatedContent, error: updateError } = await supabase
      .from('content')
      .update({
        quick_summary: '• Test summary point 1\n• Test summary point 2\n• Test summary point 3\n• Test summary point 4',
        full_summary: 'This is a test full summary paragraph 1.\n\nThis is a test full summary paragraph 2.',
        questions: testQuestions,
        total_questions: testQuestions.length,
        average_difficulty: 3.0,
        processing_status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', content.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    console.log(`✅ Updated content with ${testQuestions.length} questions`);
    
    // 3. Clean up test content
    console.log('3️⃣ Cleaning up test content...');
    const { error: deleteError } = await supabase
      .from('content')
      .delete()
      .eq('id', content.id);
    
    if (deleteError) throw deleteError;
    console.log('✅ Test content cleaned up');
    
    return {
      contentCreated: true,
      contentUpdated: true,
      contentDeleted: true
    };
    
  } catch (error) {
    console.log(`❌ Content workflow test failed: ${error.message}`);
    return {
      contentCreated: false,
      error: error.message
    };
  }
}

// Main test function
async function main() {
  console.log('🚀 Starting Database Migration Validation\n');
  console.log('=' .repeat(60));
  
  try {
    // Initialize Supabase
    console.log('🔧 Initializing Supabase client...');
    const supabase = initializeSupabase();
    console.log('✅ Supabase client initialized\n');
    
    // Run tests
    const schemaResults = await testDatabaseSchema(supabase);
    const stats = await getDatabaseStats(supabase);
    const workflowResults = await testContentWorkflow(supabase);
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📋 VALIDATION SUMMARY');
    console.log('=' .repeat(60));
    
    const passedTests = schemaResults.filter(r => r.status === 'PASS').length;
    const totalTests = schemaResults.length;
    
    console.log(`🎯 Schema Tests: ${passedTests}/${totalTests} passed`);
    console.log(`📊 Database Records: ${Object.values(stats).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0)} total`);
    console.log(`⚙️ Content Workflow: ${workflowResults.contentCreated ? 'PASS' : 'FAIL'}`);
    
    if (passedTests === totalTests && workflowResults.contentCreated) {
      console.log('\n🎉 Database migration validation SUCCESSFUL!');
      console.log('✅ The shared content model is ready for use.');
    } else {
      console.log('\n⚠️ Database migration validation INCOMPLETE');
      console.log('🔧 Some tests failed - please review the results above.');
    }
    
  } catch (error) {
    console.error('\n💥 Validation failed with error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error); 