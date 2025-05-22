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

## User Journey

### 1. Discovery & Selection
- User browses pre-loaded podcast library organized by topics via mobile web interface
- User selects interesting episodes to add to their personal library
- User can also submit their own transcript or YouTube link
- System prepares content for processing

### 2. Intelligent Processing
- System processes transcript using Claude 3.7
- AI generates summaries and identifies key concepts and insights
- System tags content with relevant topics for organization
- Content is stored with appropriate metadata for retrieval

### 3. Review & Refinement
- User reviews AI-generated insights and summaries
- User makes minimal adjustments if needed
- System schedules initial review sessions for individual insights

### 4. Retention Through Practice
- System generates various question types for each key insight
- SuperMemo SM-2 algorithm schedules reviews at the insight level
- User completes brief review sessions with varied question formats
- System adjusts future scheduling based on demonstrated retention

### 5. Connection Building
- System suggests relationships between content pieces
- User discovers unexpected connections between topics
- Topic-based organization helps build mental models
- User can search across all saved content to find relevant insights

### 6. Progress Tracking
- User sees retention metrics for different topics
- System provides simple analytics on learning progress
- User can adjust review frequency based on priorities

## Product Requirements

### Core Features (MVP)

#### Content Library
- Curated database of pre-transcribed podcast episodes
- Manual transcript submission option
- YouTube API integration for additional content access
- Basic search and filtering functionality

#### Knowledge Processing
- Content summarization at multiple levels of detail
- Key insight identification and extraction
- Topic tagging and categorization
- Original source preservation and attribution

#### Retention Tools
- SuperMemo SM-2 algorithm implementation at the insight level
- Various question types (recall, application, connection, reflection)
- Customizable review frequency options
- Progress tracking for retention metrics

#### Connection Features
- Topic-based content organization
- Related content recommendations
- Simple search functionality across all content
- Basic tagging system

### Technical Requirements

#### Frontend Development
- Progressive Web App (PWA) architecture for mobile-first experience
- Responsive design optimized for mobile devices
- Offline-capable service worker implementation
- Mobile web-optimized UI components and interactions

#### Processing Pipeline
- Content extraction and cleaning system
- Integration with Claude 3.7 API for content analysis
- Content caching strategy to minimize API calls
- Batch processing for efficient resource usage

#### User Experience
- Clean, minimal interface with adequate white space
- Touch-optimized interface for mobile web browsers
- Offline functionality for review sessions via browser storage
- Content library with sorting and filtering

#### Data Management
- User account and authentication system
- Secure storage of user content
- Simple versioning for content updates
- Export functionality for user data

#### Infrastructure
- Frontend: Modern JavaScript framework (React/Vue.js) with mobile-optimized components
- Backend: Node.js with serverless functions
- Database: Supabase (free tier) for authentication and data storage
- Hosting: Vercel (free tier) for frontend hosting and API endpoints
- Browser storage: LocalStorage and IndexedDB for offline functionality
- Simple queue system for API calls

### Mobile Web Specific Features

#### PWA Capabilities
- Installable web app (add to home screen)
- Offline review sessions
- Push notifications for review reminders (where supported)
- Fast loading with service worker caching

#### Mobile Optimization
- Touch-friendly interface elements
- Swipe gestures for navigation
- Responsive typography and spacing
- Mobile-optimized forms and inputs
- Battery-efficient background processing

#### Browser Compatibility
- Support for modern mobile browsers (iOS Safari, Chrome, Firefox)
- Graceful degradation for older browsers
- Cross-platform consistency

### Success Metrics
- User retention rate after 2 weeks
- Percentage of imported content actually reviewed
- User-reported retention improvement
- Average time spent per review session
- Number of connections identified between content pieces
- Mobile engagement metrics (session length, return visits)

### Cost Optimization Strategy
- Content caching to reduce API calls
- Batch processing for content updates
- Usage tracking to monitor resource consumption
- Leveraging free tier services effectively
- Efficient browser storage management

### Development Approach
- Mobile-first responsive design
- Progressive enhancement for advanced features
- Minimal external dependencies
- Fast loading and performance optimization
- Simple deployment pipeline

This one-pager outlines the core vision, user experience, and requirements for the Stoke mobile web platform, focusing on creating a mindful utility that helps users retain and connect insights from the content they consume without adding to their cognitive burden.
