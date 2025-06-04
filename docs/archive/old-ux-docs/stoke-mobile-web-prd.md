# Stoke: Mobile Web Product One-Pager

## Design Principles

### 1. Mindful Utility Over Gamification
Stoke serves as an antidote to attention-fragmenting apps. We prioritize depth of understanding over engagement metrics, avoiding dark patterns and dopamine-driven features. The platform functions as a calm utility that respects users' cognitive space.

### 2. AI Assistance with Human Agency
We leverage AI to reduce cognitive burden while preserving user control. The system does the heavy lifting of processing content, but users maintain final say on what's important. Technology serves human judgment rather than replacing it.

### 3. Respect for Attention
Our interface features clean design with adequate white space, meaningful friction where appropriate, and no infinite scrolls or autoplay features. We make deliberate choices about notifications and interruptions, prioritizing the user's focus.

### 4. Connection Over Collection
We emphasize the relationships between pieces of knowledge rather than mere accumulation. The platform helps users build a personal knowledge graph that reveals patterns and insights across different content sources.

### 5. Measurable Growth
We provide clear, non-competitive metrics focused on understanding and application. Progress is measured by depth of knowledge integration, not streaks or points.

## Brand Identity & Visual Design

### Memory Waves Logo
**Concept**: Concentric circles representing knowledge rippling outward from a central insight, embodying the gentle retention and mindful technology aspects of Stoke's positioning.

**Technical Specifications**:
- SVG format with 40x40px viewBox for optimal scalability
- Four-layer concentric circle design (12px, 8px, 4px, 2px radii)
- Progressive opacity levels (30%, 50%, 70%, 100%) creating visual depth
- Uses `currentColor` for seamless theming integration
- Stroke-only design with 2px width, filled center dot

**Visual Metaphor**: 
- Represents memory formation and knowledge retention patterns
- Suggests systematic, reliable learning through geometric precision  
- Embodies gradual, mindful knowledge building through concentric progression
- Conveys the ripple effect of insights connecting across content

### Design System Integration
**Color Palette**: Logo integrates seamlessly with existing brand colors:
- Primary Blue (#2563EB) for active/interactive states
- Deep Navy (#1E293B) for main branding applications
- Soft Gray (#64748B) for subtle/secondary usage
- Success Green (#059669) for knowledge mastery indicators

**Scalable Applications**:
- Header branding (48px) with "Stoke" wordmark
- Progress indicators using concentric circle motif
- Loading states with animated ripple effects
- Knowledge retention level indicators
- Favicon and PWA app icons (16px-512px range)

**Aesthetic Extensions**:
- Circular progress rings following the concentric pattern
- Memory ripple animations for AI processing states
- Retention level visualization using progressive ring activation
- Connection mapping between insights using overlapping circles

## User Journey

### 1. Discovery & Selection
- User browses pre-loaded podcast library organized by topics via mobile web interface
- User selects interesting episodes to add to their personal library
- User can also submit their own transcript or YouTube link
- System prepares content for processing

### 2. Intelligent Processing (Pre-Processing Model)
- System processes transcript using Claude 3.7 **once per episode for all users**
- AI generates standardized summaries and question pools during initial processing
- Content is processed into: quick summary (4 bullet points per hour), full summary (2 paragraphs per hour), and question pool (10-15 questions per hour)
- All users receive identical summaries and questions for consistency and cost optimization
- Content is stored with appropriate metadata for retrieval

### 3. Content Library Management
- User's personal library contains episodes they've added
- System tracks individual user progress on shared content
- Topic-based organization and filtering capabilities
- Individual spaced repetition scheduling per user

### 4. Review Session Experience (Two-Step Process)
**Step 1: Content Selection**
- User selects individual episodes, multiple episodes, or filters by topics
- Selection state persists with count display and toggle between "show selected" and "show all"
- Episodes spanning multiple selected topics appear once with relevant topics listed

**Step 2: Session Configuration**
- User chooses session type: Read Summaries / Test Knowledge / Both
- User selects session length: Quick (1-3 min) / Medium (3-5 min) / Extended (5-15 min)
- Time estimates adjust based on selected content volume

### 5. Retention Through Practice
- **Read Summaries**: Users read through quick or full summaries without interaction
- **Test Knowledge**: Random selection from question pool with binary "Got it" vs "Revisit" feedback
- **Both Sessions**: All summaries first, then mixed randomized questions from all selected content
- SuperMemo SM-2 algorithm schedules reviews based on individual user performance
- Question allocation weighted by content length for multi-content sessions

### 6. Progress Tracking
- User sees retention metrics for different topics
- Individual progress tracking on shared content
- Simple analytics on learning progress without competitive elements

## Product Requirements

### Core Features (MVP)

#### Content Library
- Curated database of pre-processed podcast episodes with standardized summaries and questions
- Manual transcript submission option
- YouTube API integration for additional content access
- Advanced filtering: individual episodes, multiple selection, topic-based filtering
- Selection state management with persistent count display and view toggles

#### Knowledge Processing (Pre-Processing Model)
- **One-time processing per episode**: AI generates all content variants during initial addition
- **Standardized output**: Quick summary (4 bullet points/hour), full summary (2 paragraphs/hour), question pool (10-15 questions/hour)
- **Shared content model**: All users see identical summaries and questions
- **Cost optimization**: Eliminates per-session API calls through pre-processing
- Topic tagging and categorization with multi-topic episode support

#### Review Session System
- **Two-step session flow**: Content selection followed by session type and length configuration
- **Session types**: Read Summaries, Test Knowledge, Both (summaries first, then questions)
- **Session lengths**: Quick/Medium/Extended with dynamic time estimates
- **Multi-content support**: Smart question allocation and mixed randomized presentation
- **Simplified feedback**: Binary "Got it" vs "Revisit" responses only

#### Retention Tools
- SuperMemo SM-2 algorithm implementation with individual user scheduling
- Random question selection from pre-generated pools
- Individual progress tracking on shared content
- Binary feedback integration for spaced repetition adjustments

### Technical Requirements

#### Database Schema Updates
- **Content table additions**: quick_summary, full_summary, questions (JSON), duration_hours
- **User progress tracking**: Individual scheduling and performance data per user per question
- **Episode metadata**: Topic associations, processing status, content variants

#### Frontend Development
- Progressive Web App (PWA) architecture for mobile-first experience
- **Enhanced content selection interface**: Multi-select with filtering, persistent state management
- **Two-step session configuration**: Intuitive flow from content selection to session setup
- **Session type interfaces**: Read-only summary views, interactive question sessions
- Touch-optimized interface for mobile web browsers with 44px minimum touch targets
- Offline functionality for review sessions via browser storage

#### Processing Pipeline
- **Batch pre-processing system**: Process all existing content with new enhanced pipeline
- **Standardized content generation**: Consistent AI prompts for summaries and question creation
- Integration with Claude 3.7 API for one-time content analysis
- Content caching strategy and version management

#### User Experience
- Clean, minimal interface with adequate white space following Memory Waves aesthetic principles
- Memory Waves logo integration in headers and key brand touchpoints
- Concentric circle design motifs throughout UI for visual consistency
- Progress visualization using circular/ripple patterns aligned with brand metaphor
- Loading states featuring animated Memory Waves ripple effects
- Selection state indicators and content count displays

#### Data Management
- User account and authentication system
- **Individual progress storage**: User-specific spaced repetition scheduling on shared content
- Simple versioning for content updates
- Export functionality for user data

#### Infrastructure
- Frontend: Modern JavaScript framework (React/Vue.js) with mobile-optimized components
- Backend: Node.js with serverless functions
- Database: Supabase (free tier) for authentication and data storage
- Hosting: Vercel (free tier) for frontend hosting and API endpoints
- Browser storage: LocalStorage and IndexedDB for offline functionality
- **Batch processing queue**: For content pre-processing and migration

### Mobile Web Specific Features

#### PWA Capabilities
- Installable web app (add to home screen) with Memory Waves logo app icons
- Offline review sessions with pre-cached content
- Push notifications for review reminders (where supported)
- Fast loading with service worker caching
- App icon set (16px-512px) featuring Memory Waves concentric circle design
- Splash screens incorporating brand visual identity

#### Mobile Optimization
- Touch-friendly interface elements with Memory Waves design language
- **Enhanced selection UX**: Easy multi-select with visual feedback and state persistence
- **Session flow optimization**: Streamlined two-step process for mobile interaction
- Swipe gestures for navigation
- Responsive typography and spacing following brand guidelines
- Mobile-optimized forms and inputs
- Battery-efficient background processing
- Circular progress indicators using concentric ring patterns
- Brand-consistent loading animations and micro-interactions

#### Browser Compatibility
- Support for modern mobile browsers (iOS Safari, Chrome, Firefox)
- Graceful degradation for older browsers
- Cross-platform consistency

### Success Metrics
- User retention rate after 2 weeks
- Percentage of imported content actually reviewed
- User-reported retention improvement
- Average time spent per review session
- **Session completion rates by type and length**
- **Content selection patterns and preferences**
- Mobile engagement metrics (session length, return visits)

### Cost Optimization Strategy
- **Pre-processing model**: Eliminates per-session API costs through one-time content generation
- **Shared content architecture**: Maximum efficiency through standardized content serving
- Batch processing for content updates
- Usage tracking to monitor resource consumption
- Leveraging free tier services effectively
- Efficient browser storage management

### Development Approach
- Mobile-first responsive design
- Progressive enhancement for advanced features
- **Batch migration strategy**: Process existing content with new pipeline
- **Shared content foundation**: Build system for consistent content delivery to all users
- Minimal external dependencies
- Fast loading and performance optimization
- Simple deployment pipeline

### Implementation Scope
- **Apply to all content**: Both existing database content and new additions
- **AI responsibility**: Let AI determine question difficulty and insight importance
- **Foundation first**: Focus on core functionality before advanced features
- **Simplified architecture**: Pre-processing and binary feedback eliminate complexity

This one-pager outlines the updated vision for Stoke mobile web platform, emphasizing the new pre-processing content model, simplified two-step review sessions, and binary feedback system that creates a more efficient and user-friendly learning experience.
