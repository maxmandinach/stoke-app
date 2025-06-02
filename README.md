# Stoke - Spaced Repetition Learning Platform

Stoke is a revolutionary learning platform that helps users retain knowledge from podcasts, articles, and other educational content through scientifically-proven spaced repetition techniques.

## 🔥 Latest: Gemini 2.5 Pro Content Processing Pipeline

Stoke now features a robust content pre-processing pipeline powered by **Gemini 2.5 Pro** that generates standardized summaries and question pools once per episode for all users. This eliminates per-session API costs while ensuring consistent, high-quality content.

### Key Features

- **🤖 AI-Powered Content Generation**: Uses Gemini 2.5 Pro to create quick summaries, full summaries, and self-assessment questions
- **📊 Cost-Efficient Architecture**: Process content once for all users instead of per-session
- **🔄 Robust Processing Pipeline**: Queue system with rate limiting, retry logic, and comprehensive error handling
- **📈 Real-time Monitoring**: Admin dashboard for pipeline status and performance metrics
- **🛠️ Command Line Tools**: Full CLI interface for content management and batch processing

## Architecture Overview

```
Content Input → Gemini 2.5 Pro Processing → Database Storage → User Sessions
     ↓                    ↓                      ↓              ↓
1. Add Content      2. Generate Summaries    3. Store Results   4. Retrieve for
   (Manual/API)        & Questions             (Shared)          Learning Sessions
```

## Quick Start

### 1. Environment Setup

Create a `.env.local` file:

```bash
# Required: Google AI API Key
GOOGLE_API_KEY=your_google_ai_api_key_here

# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Processing Content

```bash
# Check system status
npm run process:content -- --stats

# Add and process new content
npm run process:content -- --add-content \
  --title "Sample Podcast Episode" \
  --transcript "Your transcript here..." \
  --duration 1.5 \
  --source podcast

# Process all pending content
npm run process:content -- --all-pending
```

### 4. Launch Admin Dashboard

```bash
npm run admin:dashboard
```

Navigate to `http://localhost:3001/admin` for real-time monitoring.

### 5. Start Main App

```bash
npm run dev
```

Navigate to `http://localhost:3000` for the main learning interface.

## Generated Content Examples

### Quick Summary (4 bullets/hour)
```
• AI healthcare applications show 40% improvement in diagnostic accuracy
• Key challenge is data privacy and regulatory compliance requirements  
• Integration costs average $2-5M but ROI appears within 18 months
• Human-AI collaboration models outperform fully automated systems
```

### Full Summary (2 paragraphs/hour)
Comprehensive paragraphs with deeper context, examples, and explanations that connect ideas and show relationships between concepts.

### Question Pool (10-15 questions/hour)
Self-assessment questions designed for binary "Got it"/"Revisit" responses with optimal difficulty distribution for spaced repetition learning.

## System Components

### 1. Content Processing Pipeline
- **Gemini Integration** (`src/lib/gemini.ts`) - AI processing with JSON output
- **Database Layer** (`src/lib/database/contentProcessing.ts`) - Content management
- **CLI Tool** (`src/scripts/processContent.js`) - Command line interface
- **Admin Dashboard** (`src/app/admin/page.tsx`) - Real-time monitoring

### 2. Learning Interface (Built in Previous Steps)
- **Content Selection** (Step 1C) - Enhanced multi-select with Memory Waves design
- **Session Configuration** (Step 2A) - Two-step session setup with time estimation
- **Database Architecture** (Step 1B) - SuperMemo SM-2 spaced repetition system

### 3. Database Schema
- **Shared Content Model** - Process once, serve many users
- **Individual Progress Tracking** - Personal spaced repetition schedules
- **Analytics & Optimization** - Performance metrics and learning insights

## Available Commands

### Content Processing
```bash
# Show help and all options
npm run process:content -- --help

# Process specific content by ID  
npm run process:content -- --content-id abc123

# Add new content
npm run process:content -- --add-content \
  --title "Episode Title" \
  --transcript "Full transcript..." \
  --duration 2.0 \
  --source podcast

# System management
npm run process:content -- --stats
npm run process:content -- --cleanup
npm run process:content -- --all-pending
```

### Development
```bash
npm run dev              # Start main app (port 3000)
npm run admin:dashboard  # Start admin dashboard (port 3001)
npm run build           # Build for production
npm run type-check      # TypeScript validation
npm run test:db         # Database schema testing
```

## Project Structure

```
stoke-app/
├── src/
│   ├── lib/
│   │   ├── gemini.ts                      # Gemini 2.5 Pro integration
│   │   ├── database/
│   │   │   ├── contentProcessing.ts       # Processing database layer
│   │   │   └── sharedContent.ts          # Content management API
│   │   └── supabase.ts                   # Database client
│   ├── scripts/
│   │   └── processContent.js             # CLI processing tool
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx                  # Admin dashboard
│   │   └── page.tsx                      # Main learning interface
│   ├── components/
│   │   ├── ContentSelectionInterface.tsx # Step 1C implementation
│   │   ├── SessionConfigurationInterface.tsx # Step 2A implementation
│   │   └── AppCoordinator.tsx            # Stage management
│   └── types/
│       └── database.types.ts             # Complete type definitions
├── supabase/
│   └── migrations/                       # Database schema
├── docs/
│   ├── CONTENT_PROCESSING_PIPELINE.md   # Comprehensive pipeline docs
│   ├── ENVIRONMENT_SETUP.md             # Environment configuration
│   ├── PHASE_1B_DATABASE_ARCHITECTURE.md # Database design
│   ├── STEP_1C_ENHANCED_CONTENT_SELECTION.md # UI implementation
│   └── STEP_2_SESSION_CONFIGURATION.md  # Session setup system
└── package.json                         # Dependencies and scripts
```

## Technology Stack

### Core Technologies
- **Next.js 14** - React framework with app router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - PostgreSQL database with real-time features

### AI & Processing
- **Gemini 2.5 Pro** - Content generation and processing
- **Google AI SDK** - API integration with structured JSON output
- **Custom Queue System** - Rate limiting and batch processing
- **SuperMemo SM-2** - Spaced repetition algorithm

### Design System
- **Memory Waves** - Calming, focus-oriented design language
- **Responsive Design** - Mobile-first with touch optimization
- **Accessibility** - WCAG compliant with keyboard navigation
- **Progressive Enhancement** - Works without JavaScript

## Performance Features

### Cost Efficiency
- ✅ **Single Processing**: Content processed once for all users
- ✅ **Smart Rate Limiting**: Optimized API usage with batching
- ✅ **Efficient Caching**: Pre-processed content stored locally
- ✅ **Batch Operations**: Multiple content items processed together

### Scalability  
- ✅ **Async Processing**: Non-blocking queue system
- ✅ **Database Optimization**: Efficient queries and indexing
- ✅ **Horizontal Scaling**: Stateless design supports multiple instances
- ✅ **Real-time Monitoring**: Performance metrics and health checks

## Documentation

- **[Content Processing Pipeline](./CONTENT_PROCESSING_PIPELINE.md)** - Complete pipeline documentation
- **[Environment Setup](./ENVIRONMENT_SETUP.md)** - Configuration guide
- **[Database Architecture](./PHASE_1B_DATABASE_ARCHITECTURE.md)** - Schema and data model
- **[UI Components](./STEP_1C_ENHANCED_CONTENT_SELECTION.md)** - Interface implementation
- **[Session System](./STEP_2_SESSION_CONFIGURATION.md)** - Configuration flow

## Getting Help

### Common Issues
1. **Environment Variables**: Check `.env.local` file setup
2. **API Quotas**: Monitor Gemini API usage and limits  
3. **Database**: Verify Supabase connection and migrations
4. **Processing**: Use admin dashboard for pipeline monitoring

### Support Resources
- [Gemini API Documentation](https://ai.google.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Admin dashboard: `npm run admin:dashboard`

## Development Status

- ✅ **Database Architecture** (Phase 1B) - Complete shared content model
- ✅ **Content Selection Interface** (Step 1C) - Enhanced multi-select UI
- ✅ **Session Configuration** (Step 2A) - Two-step setup system  
- ✅ **Content Processing Pipeline** - Gemini 2.5 Pro integration
- 🔄 **Session Execution** (Step 3) - Currently in development
- 🔄 **Mobile Optimization** - Progressive enhancement ongoing

## License

This project is proprietary software for Stoke Learning Platform.

---

**Built with ❤️ for better learning through spaced repetition**
