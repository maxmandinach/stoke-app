#!/usr/bin/env node

/**
 * Stoke Content Processing Script
 * 
 * This script processes podcast episodes and other content using Gemini 2.5 Pro
 * to generate standardized summaries and question pools.
 * 
 * Usage:
 *   npm run process:content -- --help
 *   npm run process:content -- --content-id <id>
 *   npm run process:content -- --all-pending
 *   npm run process:content -- --add-content --title "Episode Title" --transcript "..." --duration 1.5
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env.local') });

import { processingOrchestrator, contentProcessingDB } from '../lib/database/contentProcessing.js';

// Command line argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    contentId: null,
    allPending: false,
    addContent: false,
    title: null,
    transcript: null,
    duration: null,
    source: 'podcast',
    sourceUrl: '',
    topics: [],
    stats: false,
    cleanup: false,
    retry: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--content-id':
        options.contentId = args[++i];
        break;
      case '--all-pending':
        options.allPending = true;
        break;
      case '--add-content':
        options.addContent = true;
        break;
      case '--title':
        options.title = args[++i];
        break;
      case '--transcript':
        options.transcript = args[++i];
        break;
      case '--duration':
        options.duration = parseFloat(args[++i]);
        break;
      case '--source':
        options.source = args[++i];
        break;
      case '--source-url':
        options.sourceUrl = args[++i];
        break;
      case '--topics':
        options.topics = args[++i].split(',').map(t => t.trim());
        break;
      case '--stats':
        options.stats = true;
        break;
      case '--cleanup':
        options.cleanup = true;
        break;
      case '--retry':
        options.retry = args[++i];
        break;
      default:
        console.warn(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Stoke Content Processing Tool

USAGE:
  npm run process:content -- [OPTIONS]

OPTIONS:
  --help, -h              Show this help message
  
  PROCESSING:
  --content-id <id>       Process a specific content item by ID
  --all-pending          Process all pending content items
  --retry <id>           Retry processing for a failed content item
  
  ADDING CONTENT:
  --add-content          Add new content for processing
  --title <title>        Content title (required with --add-content)
  --transcript <text>    Content transcript (required with --add-content)
  --duration <hours>     Content duration in hours (required with --add-content)
  --source <source>      Content source (default: podcast)
  --source-url <url>     Source URL (optional)
  --topics <topics>      Comma-separated topics (optional)
  
  MANAGEMENT:
  --stats                Show processing statistics
  --cleanup              Clean up stuck processing jobs
  
EXAMPLES:
  # Process a specific content item
  npm run process:content -- --content-id abc123
  
  # Process all pending items
  npm run process:content -- --all-pending
  
  # Add new content and process it
  npm run process:content -- --add-content \\
    --title "AI in Healthcare" \\
    --transcript "Today we discuss..." \\
    --duration 1.5 \\
    --source podcast \\
    --topics "AI,Healthcare,Technology"
  
  # Show statistics
  npm run process:content -- --stats
  
  # Clean up stuck jobs
  npm run process:content -- --cleanup

ENVIRONMENT VARIABLES:
  GOOGLE_API_KEY         Required: Your Google AI API key
  NEXT_PUBLIC_SUPABASE_URL        Required: Supabase project URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY   Required: Supabase anon key
`);
}

async function processContentById(contentId) {
  console.log(`🚀 Processing content: ${contentId}`);
  
  try {
    const jobId = await processingOrchestrator.processContent(contentId);
    console.log(`✅ Processing started successfully. Job ID: ${jobId}`);
    
    // Poll for completion
    await pollJobCompletion(jobId);
    
  } catch (error) {
    console.error(`❌ Failed to process content ${contentId}:`, error.message);
    process.exit(1);
  }
}

async function processAllPending() {
  console.log('🚀 Processing all pending content...');
  
  try {
    const results = await processingOrchestrator.processAllPending();
    
    console.log(`✅ Processing summary:`);
    console.log(`   Started: ${results.started} items`);
    console.log(`   Failed: ${results.failed} items`);
    console.log(`   Already processing: ${results.already_processing} items`);
    
    if (results.started > 0) {
      console.log('\n⏳ Monitoring progress...');
      // Note: In a real implementation, you'd track all job IDs
      // For now, just show that processing has started
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('🔍 Check processing status with --stats option');
    }
    
  } catch (error) {
    console.error('❌ Failed to process pending content:', error.message);
    process.exit(1);
  }
}

async function addContent(options) {
  console.log('📝 Adding new content...');
  
  if (!options.title || !options.transcript || !options.duration) {
    console.error('❌ Missing required fields: --title, --transcript, --duration');
    process.exit(1);
  }
  
  try {
    const contentData = {
      title: options.title,
      source: options.source,
      source_url: options.sourceUrl || `https://example.com/${Date.now()}`,
      transcript: options.transcript,
      duration_hours: options.duration,
      topics: options.topics,
    };
    
    const { contentId, jobId } = await processingOrchestrator.addAndProcessContent(contentData);
    
    console.log(`✅ Content added successfully:`);
    console.log(`   Content ID: ${contentId}`);
    console.log(`   Job ID: ${jobId}`);
    console.log(`   Title: ${options.title}`);
    console.log(`   Duration: ${options.duration} hours`);
    
    // Poll for completion
    await pollJobCompletion(jobId);
    
  } catch (error) {
    console.error('❌ Failed to add content:', error.message);
    process.exit(1);
  }
}

async function showStats() {
  console.log('📊 Processing Statistics\n');
  
  try {
    const overview = await processingOrchestrator.getProcessingOverview();
    const stats = overview.stats;
    
    console.log('CONTENT OVERVIEW:');
    console.log(`  Total Content Items: ${stats.total_content}`);
    console.log(`  Completed: ${stats.completed} (${Math.round(stats.completed / stats.total_content * 100) || 0}%)`);
    console.log(`  Pending: ${stats.pending}`);
    console.log(`  Processing: ${stats.processing}`);
    console.log(`  Failed: ${stats.failed}`);
    
    console.log('\nPROCESSING METRICS:');
    console.log(`  Questions Generated: ${stats.total_questions_generated.toLocaleString()}`);
    console.log(`  Avg Processing Time: ${stats.avg_processing_time_hours.toFixed(2)} hours`);
    
    console.log('\nSYSTEM HEALTH:');
    console.log(`  API Accessible: ${overview.system_health.api_accessible ? '✅' : '❌'}`);
    console.log(`  Queue Length: ${overview.system_health.queue_length}`);
    console.log(`  Last Success: ${overview.system_health.last_successful_processing || 'Never'}`);
    
    if (stats.failed > 0) {
      console.log('\n⚠️  Some content failed to process. Use --retry <content-id> to retry individual items.');
    }
    
    if (stats.pending > 0) {
      console.log('\n💡 Use --all-pending to process remaining items.');
    }
    
  } catch (error) {
    console.error('❌ Failed to get statistics:', error.message);
    process.exit(1);
  }
}

async function cleanupStuckJobs() {
  console.log('🧹 Cleaning up stuck processing jobs...');
  
  try {
    const result = await contentProcessingDB.cleanupStuckProcessing();
    
    console.log(`✅ Cleanup completed:`);
    console.log(`   Reset ${result.reset_count} stuck items`);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Some errors occurred during cleanup:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ Failed to cleanup stuck jobs:', error.message);
    process.exit(1);
  }
}

async function retryContent(contentId) {
  console.log(`🔄 Retrying content: ${contentId}`);
  
  try {
    const jobId = await contentProcessingDB.retryFailedContent(contentId);
    console.log(`✅ Retry started successfully. Job ID: ${jobId}`);
    
    await pollJobCompletion(jobId);
    
  } catch (error) {
    console.error(`❌ Failed to retry content ${contentId}:`, error.message);
    process.exit(1);
  }
}

async function pollJobCompletion(jobId) {
  console.log('⏳ Monitoring job progress...\n');
  
  const startTime = Date.now();
  const maxWaitTime = 5 * 60 * 1000; // 5 minutes
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Note: This would need to be implemented in the actual job queue system
      // For now, we'll just check the content status in the database
      console.log('🔍 Checking progress... (this is a simplified implementation)');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // In a real implementation, you'd check the actual job status:
      // const job = await contentProcessor.getProcessingStatus(jobId);
      // if (job?.status === 'completed') {
      //   console.log('✅ Processing completed successfully!');
      //   break;
      // } else if (job?.status === 'failed') {
      //   console.log('❌ Processing failed:', job.error);
      //   break;
      // }
      
      // For now, just simulate completion
      break;
      
    } catch (error) {
      console.error('Error checking job status:', error.message);
      break;
    }
  }
  
  console.log('\n💡 Use --stats to check overall processing status');
}

async function main() {
  const options = parseArgs();
  
  if (options.help) {
    printHelp();
    return;
  }
  
  // Validate environment
  if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ Missing GOOGLE_API_KEY environment variable');
    console.log('💡 Add GOOGLE_API_KEY to your .env.local file');
    process.exit(1);
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.log('💡 Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
    process.exit(1);
  }
  
  console.log('🔥 Stoke Content Processing Pipeline\n');
  
  try {
    if (options.stats) {
      await showStats();
    } else if (options.cleanup) {
      await cleanupStuckJobs();
    } else if (options.retry) {
      await retryContent(options.retry);
    } else if (options.contentId) {
      await processContentById(options.contentId);
    } else if (options.allPending) {
      await processAllPending();
    } else if (options.addContent) {
      await addContent(options);
    } else {
      console.log('❌ No action specified. Use --help for usage information.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 