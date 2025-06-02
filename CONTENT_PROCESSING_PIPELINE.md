# Stoke Content Processing Pipeline

## Overview

Stoke's content pre-processing pipeline uses **Gemini 2.5 Pro API** to generate standardized summaries and question pools for podcast episodes and other educational content. This system processes content **once per episode** for all users, eliminating per-session API costs while ensuring consistent, high-quality learning materials.

### Key Features

- 🤖 **Gemini 2.5 Pro Integration**: Leverages Google's latest AI model for content generation
- 📊 **Structured JSON Output**: Uses Gemini's native JSON mode for reliable, parseable responses
- ⚡ **Optimized Rate Limiting**: Smart batching and retry mechanisms for cost efficiency
- 🔄 **Robust Error Handling**: Comprehensive retry logic with exponential backoff
- 📈 **Real-time Monitoring**: Admin dashboard for pipeline status and performance metrics
- 🛠️ **Command Line Tools**: Full CLI interface for content management and processing

## Architecture

### Processing Flow

```
1. Content Addition → Database (pending status)
2. Queue System → Rate limiting & prioritization
3. Gemini Processing → Summary & question generation
4. Content Validation → Quality checks & error handling
5. Database Storage → Completed content with analytics
6. User Sessions → Pre-processed content retrieval
```

### Generated Content Structure

For each piece of content, the pipeline generates:

- **Quick Summary**: 4 bullet points per hour of content
- **Full Summary**: 2 comprehensive paragraphs per hour of content  
- **Question Pool**: 10-15 self-assessment questions per hour designed for binary "Got it"/"Revisit" responses

## File Structure

```
src/
├── lib/
│   ├── gemini.ts                           # Gemini 2.5 Pro API client & processing
│   └── database/
│       └── contentProcessing.ts            # Database integration layer
├── scripts/
│   └── processContent.js                   # Command-line processing tool
├── app/
│   └── admin/
│       └── page.tsx                        # Admin dashboard
├── types/
│   └── database.types.ts                   # Enhanced with processing types
ENVIRONMENT_SETUP.md                        # Environment configuration guide
CONTENT_PROCESSING_PIPELINE.md             # This documentation
```

## Quick Start

### 1. Environment Setup

Create a `.env.local` file with required credentials:

```bash
# Google AI API Key (required)
GOOGLE_API_KEY=your_google_ai_api_key_here

# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration instructions.

### 2. Install Dependencies

```bash
npm install
```

### 3. Test the Pipeline

```bash
# Check system status
npm run process:content -- --stats

# Add test content
npm run process:content -- --add-content \
  --title "Sample Podcast Episode" \
  --transcript "This is a sample transcript for testing..." \
  --duration 1.0 \
  --source podcast
```

## Command Line Interface

The processing pipeline includes a comprehensive CLI tool accessible via:

```bash
npm run process:content -- [OPTIONS]
```

### Available Commands

**Processing:**
```bash
# Process specific content by ID
npm run process:content -- --content-id abc123

# Process all pending content
npm run process:content -- --all-pending

# Retry failed content
npm run process:content -- --retry abc123
```

**Content Management:**
```bash
# Add new content
npm run process:content -- --add-content \
  --title "Episode Title" \
  --transcript "Full transcript text..." \
  --duration 1.5 \
  --source podcast \
  --topics "AI,Technology,Innovation"
```

**System Management:**
```bash
# Show processing statistics
npm run process:content -- --stats

# Clean up stuck processing jobs
npm run process:content -- --cleanup

# Show help
npm run process:content -- --help
```

### Example Workflows

**Process existing content:**
```bash
# Get content ID from database, then process
npm run process:content -- --content-id "content-uuid-here"
```

**Bulk content migration:**
```bash
# Process all pending content (useful for initial migration)
npm run process:content -- --all-pending
```

**Add and process new content:**
```bash
npm run process:content -- --add-content \
  --title "The Future of AI in Healthcare" \
  --transcript "Today we're discussing how artificial intelligence..." \
  --duration 2.5 \
  --source podcast \
  --source-url "https://podcast.example.com/episode-123" \
  --topics "AI,Healthcare,Technology"
```

## Admin Dashboard

Access the admin dashboard for real-time monitoring:

```bash
npm run admin:dashboard
```

Then navigate to `http://localhost:3001/admin`

### Dashboard Features

- **System Health**: API status, queue length, last successful processing
- **Processing Statistics**: Content counts, completion rates, error tracking
- **Performance Metrics**: Processing times, question generation stats
- **Quick Actions**: Start processing, cleanup stuck jobs, refresh data
- **Real-time Updates**: Auto-refresh every 30 seconds

## Gemini 2.5 Pro Configuration

### Model Settings

The pipeline is optimized for Gemini 2.5 Pro with these settings:

```typescript
{
  model: "gemini-2.0-flash-exp",
  temperature: 0.3,           // Lower for consistent, factual content
  topK: 40,
  topP: 0.8,
  maxOutputTokens: 8192,
  responseMimeType: "application/json"  // Structured output
}
```

### Safety Settings

Configured for educational content with appropriate safety filters:

- Harassment: Block medium and above
- Hate speech: Block medium and above  
- Sexually explicit: Block medium and above
- Dangerous content: Block medium and above

### Rate Limiting

Default limits (adjustable via environment variables):

- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Max concurrent requests**: 3
- **Retry attempts**: 3 with exponential backoff

## Content Specifications

### Quick Summary Format

- Exactly 4 bullet points per hour of content
- Each bullet 10-20 words maximum
- Focus on key insights and actionable takeaways
- Format: `"• Key insight text"`

### Full Summary Format

- 2 comprehensive paragraphs per hour of content
- Each paragraph 80-120 words
- Deeper context, examples, and explanations
- Connected ideas showing relationships between concepts

### Question Pool Format

- 10-15 questions per hour of content
- Designed for binary "Got it"/"Revisit" responses
- Question type distribution:
  - 40% Conceptual
  - 30% Factual
  - 20% Application
  - 10% Reflection
- Difficulty distribution:
  - 20% Basic (levels 1-2)
  - 60% Intermediate (levels 3-4)
  - 20% Advanced (level 5)

### Example Generated Content

**Quick Summary:**
```
• AI healthcare applications show 40% improvement in diagnostic accuracy
• Key challenge is data privacy and regulatory compliance requirements
• Integration costs average $2-5M but ROI appears within 18 months
• Human-AI collaboration models outperform fully automated systems
```

**Full Summary:**
```
Artificial intelligence is transforming healthcare through sophisticated diagnostic tools, 
predictive analytics, and personalized treatment recommendations. Current implementations 
show remarkable success rates, with AI-assisted diagnoses demonstrating 40% higher accuracy 
than traditional methods alone. However, the integration process presents significant 
challenges including regulatory compliance, data privacy concerns, and substantial upfront 
investment costs ranging from $2-5 million for large healthcare systems.

The most successful AI healthcare implementations focus on human-AI collaboration rather 
than full automation. Medical professionals working alongside AI systems report improved 
confidence in their decisions while maintaining the critical human judgment necessary for 
complex cases. This collaborative approach addresses both the technical capabilities of AI 
and the irreplaceable value of human expertise, creating a synergistic relationship that 
enhances patient outcomes while preserving the doctor-patient relationship.
```

**Questions Sample:**
```json
[
  {
    "id": "q1",
    "content": "How does AI-assisted diagnosis compare to traditional diagnostic methods in terms of accuracy?",
    "type": "factual", 
    "difficulty_level": 3,
    "estimated_time_seconds": 20,
    "metadata": {
      "keywords": ["AI", "diagnosis", "accuracy"],
      "concept_area": "Healthcare AI Implementation"
    }
  }
]
```

## Database Integration

### Content Processing Status

The pipeline tracks content through these statuses:

- `pending`: Added to database, awaiting processing
- `processing`: Currently being processed by Gemini
- `completed`: Successfully processed and stored
- `failed`: Processing failed, ready for retry

### Database Fields Updated

When processing completes successfully:

```typescript
{
  quick_summary: string,              // Generated bullet points
  full_summary: string,               // Generated paragraphs  
  questions: Question[],              // Generated question pool
  processing_status: 'completed',
  processed_at: timestamp,
  content_version: number,
  total_questions: number,            // Analytics
  average_difficulty: number,         // Analytics
  estimated_read_time_minutes: number // Analytics
}
```

### Integration with Existing Systems

The pipeline integrates seamlessly with:

- **Step 1C Content Selection**: Processed content appears in selection interface
- **Step 2A Session Configuration**: Time estimates use processed content analytics  
- **Spaced Repetition System**: Questions integrate with SuperMemo SM-2 algorithm
- **User Progress Tracking**: Individual progress tracked per pre-processed question

## Error Handling & Monitoring

### Comprehensive Error Handling

**Gemini-specific errors:**
- Rate limit exceeded (429) → Automatic retry with backoff
- Safety filter blocks → Content flagged for manual review
- Context too long → Content chunking or rejection
- Invalid JSON response → Parsing retry with error logging

**Database errors:**
- Connection failures → Retry with exponential backoff
- Constraint violations → Validation error reporting
- Transaction timeouts → Automatic rollback and retry

**System errors:**
- Memory limitations → Graceful degradation
- Network timeouts → Connection retry logic
- Disk space issues → Alert and graceful shutdown

### Monitoring & Logging

**Admin Dashboard Metrics:**
- Processing success/failure rates
- Average processing times
- API usage and costs
- Queue status and backlog
- System health indicators

**Command Line Monitoring:**
```bash
# Real-time statistics
npm run process:content -- --stats

# System health check
npm run process:content -- --cleanup
```

**Log Files:**
- Processing events and errors
- API request/response logs
- Performance metrics
- Error stack traces

## Performance Optimization

### Cost Efficiency Strategies

1. **Single Processing**: Each episode processed once for all users
2. **Batch Operations**: Multiple content items queued efficiently
3. **Smart Retry Logic**: Exponential backoff prevents API waste
4. **Content Validation**: Pre-processing validation prevents unnecessary API calls
5. **Optimal Prompts**: Engineered for single-pass accuracy

### Scalability Features

1. **Async Processing**: Non-blocking queue system
2. **Rate Limiting**: Configurable limits for different deployment sizes
3. **Database Optimization**: Efficient queries and indexing
4. **Memory Management**: Streaming for large content processing
5. **Horizontal Scaling**: Stateless design supports multiple instances

## Deployment

### Development

```bash
# Install dependencies
npm install

# Set up environment
cp ENVIRONMENT_SETUP.md .env.local  # Follow setup guide

# Test processing
npm run process:content -- --stats
```

### Production

**Environment Variables:**
- Use production-grade API keys
- Configure appropriate rate limits
- Set up monitoring and alerting
- Implement backup and recovery

**Monitoring:**
```bash
# Production health check
npm run process:content -- --stats

# Admin dashboard
npm run admin:dashboard
```

**Scaling Considerations:**
- Increase `GEMINI_REQUESTS_PER_MINUTE` for higher throughput
- Use multiple instances with shared database
- Implement load balancing for admin dashboard
- Set up automated backup for processed content

## Security

### API Key Management

- Store API keys in environment variables only
- Use different keys for development/production
- Rotate keys regularly
- Monitor usage for unauthorized access

### Data Protection

- Content stored securely in Supabase with RLS
- No user data sent to Gemini (only content transcripts)
- Processing logs exclude sensitive information
- GDPR compliance through data minimization

### Access Control

- Admin dashboard requires authentication
- Processing scripts validate environment
- Database access follows principle of least privilege
- API endpoints secured with proper authentication

## Troubleshooting

### Common Issues

**"Cannot process content"**
1. Check environment variables are set correctly
2. Verify Gemini API key is valid and has quota
3. Ensure content meets validation requirements
4. Check database connectivity

**"Processing stuck"**
```bash
# Clean up stuck jobs
npm run process:content -- --cleanup

# Check system status  
npm run process:content -- --stats
```

**"API rate limit exceeded"**
1. Reduce processing concurrency
2. Increase delay between requests
3. Upgrade to higher API tier
4. Implement smarter batching

### Getting Support

1. Check admin dashboard for system status
2. Review processing logs for specific errors
3. Test with minimal content to isolate issues
4. Check Gemini API status and quotas
5. Verify database connectivity and permissions

## Roadmap

### Near-term Improvements

- [ ] Enhanced content chunking for very long episodes
- [ ] A/B testing for different prompt strategies
- [ ] Advanced analytics and reporting
- [ ] Webhook integration for real-time notifications
- [ ] Content quality scoring and feedback loops

### Long-term Features

- [ ] Multi-language support
- [ ] Custom question types and formats
- [ ] Integration with external content sources
- [ ] Advanced AI prompt optimization
- [ ] Distributed processing across regions

---

For detailed environment setup, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

For database architecture, see [PHASE_1B_DATABASE_ARCHITECTURE.md](./PHASE_1B_DATABASE_ARCHITECTURE.md)

For UI components, see [STEP_1C_ENHANCED_CONTENT_SELECTION.md](./STEP_1C_ENHANCED_CONTENT_SELECTION.md) and [STEP_2_SESSION_CONFIGURATION.md](./STEP_2_SESSION_CONFIGURATION.md) 