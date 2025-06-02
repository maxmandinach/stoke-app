# Stoke - Mindful Learning Platform

A thoughtful learning experience that prioritizes understanding over metrics, built with Next.js 14, Supabase, and Gemini AI.

## 🌊 Memory Waves Design Philosophy

Stoke embodies "Memory Waves" - a design philosophy that creates calm, spacious interfaces respecting cognitive space. The platform encourages genuine learning through:

- **Non-competitive metrics** focusing on understanding over performance
- **Spaced repetition** using SM-2 algorithm for optimal memory retention
- **Calm interfaces** with thoughtful color schemes and smooth transitions
- **Progressive disclosure** preventing cognitive overload
- **Learning-focused analytics** that provide insight without addiction patterns

## ✨ Features

### Core Learning Experience
- **Content Selection Interface** - Browse and select from podcasts, videos, articles, and books
- **Session Configuration** - Customize learning sessions with flexible duration and difficulty
- **Unified Session Manager** - Seamless experience for reading summaries and testing knowledge
- **Session Completion Flow** - Three-tab experience with performance overview, insights, and guidance

### Analytics & Progress
- **Progress Analytics** - Four comprehensive views (overview, topics, patterns, insights)
- **Topic Mastery Tracking** - Strength levels with retention trend analysis
- **Learning Insights** - Personalized recommendations based on patterns
- **Spaced Repetition** - Scientific review scheduling for maximum retention

### System Management
- **Admin Dashboard** - System health monitoring and content processing stats
- **Enhanced App Coordinator** - Sophisticated state management with error handling
- **Content Processing Pipeline** - Automated content analysis using Gemini 2.5 Pro

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with Memory Waves design system
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Gemini 2.5 Pro for content processing
- **Testing**: Playwright (E2E), Jest (Unit), Accessibility testing
- **Database**: PostgreSQL with spaced repetition algorithms

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stoke-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Google AI Configuration
   GEMINI_API_KEY=your_gemini_api_key

   # App Configuration
   NEXT_PUBLIC_APP_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Unit Tests
```bash
npm run test           # Run all unit tests
npm run test:watch     # Run tests in watch mode
```

### End-to-End Tests
```bash
# Install Playwright browsers
npm run playwright:install

# Run E2E tests
npm run test:e2e       # Headless mode
npm run test:e2e:ui    # Interactive UI mode
npm run test:e2e:debug # Debug mode
```

### Test Coverage
- **Complete user flows** from content selection to analytics
- **Accessibility validation** with keyboard navigation and ARIA compliance
- **Performance testing** including load times and smooth animations
- **Mobile optimization** with touch target validation
- **Error handling** and recovery scenarios

## 📊 Database Schema

### Core Tables
- `content_library` - Processed content with AI-generated summaries
- `learning_sessions` - User session tracking and analytics
- `user_question_progress` - Spaced repetition progress using SM-2
- `user_content_library` - Personal content collections and stats

### Analytics Views
- `user_learning_analytics` - Comprehensive learning metrics
- `topic_learning_overview` - Topic-based retention analysis
- `user_content_with_progress` - Content with progress tracking

### Key Features
- **Spaced Repetition**: SM-2 algorithm implementation
- **Topic Extraction**: AI-powered content categorization
- **Progress Tracking**: Detailed analytics without gamification
- **Performance Optimization**: Efficient queries and indexing

## 🎨 Component Architecture

### Main Components
- **`EnhancedAppCoordinator`** - Central app state management
- **`ContentSelectionInterface`** - Content discovery and selection
- **`SessionConfigurationInterface`** - Session customization
- **`UnifiedSessionManager`** - Active learning experience
- **`SessionCompletionFlow`** - Post-session insights and guidance
- **`ProgressAnalytics`** - Comprehensive progress visualization
- **`AdminDashboard`** - System monitoring and management

### Design System
- **`MemoryWaves`** - Progress indicators with calming animations
- **`CircularProgress`** - Elegant circular progress displays
- **`StokeLogo`** - Scalable brand representation

## 🔧 Configuration

### Content Processing
Configure content processing in `src/lib/contentProcessor.ts`:
- AI model selection and parameters
- Topic extraction sensitivity
- Question generation rules
- Summary length and style

### Analytics Settings
Customize analytics in `src/lib/analytics.ts`:
- Learning streak calculation
- Mastery level thresholds
- Retention trend analysis
- Insight generation rules

### Spaced Repetition
Adjust spaced repetition parameters:
- Initial interval settings
- Ease factor modifications
- Review scheduling logic
- Difficulty adjustments

## 📱 Mobile Support

- **Responsive design** optimized for all screen sizes
- **Touch-friendly interfaces** with appropriate target sizes
- **Performance optimization** for mobile devices
- **Progressive Web App** capabilities

## ♿ Accessibility

- **WCAG 2.1 AA compliance** with comprehensive testing
- **Keyboard navigation** throughout the entire interface
- **Screen reader support** with proper ARIA labels
- **Color contrast** meeting accessibility standards
- **Focus management** with clear visual indicators

## 🚢 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Set production environment variables:
- Database connection strings
- API keys and secrets
- App configuration settings
- Security and CORS settings

### Performance Monitoring
- Real-time error tracking
- Performance metrics collection
- User analytics (privacy-respecting)
- System health monitoring

## 🔐 Privacy & Security

- **Privacy-first design** with minimal data collection
- **User data control** with export and deletion options
- **Secure authentication** via Supabase Auth
- **API security** with proper rate limiting and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow Memory Waves design principles
- Maintain accessibility standards
- Write comprehensive tests
- Document new features
- Respect user privacy and cognitive space

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Memory Waves Philosophy** - Inspired by calm technology principles
- **Spaced Repetition Research** - Based on Ebbinghaus forgetting curve studies
- **Accessibility Guidelines** - Following WCAG 2.1 standards
- **Performance Best Practices** - Web Vitals and user experience research

---

*Built with mindful attention to learning, privacy, and user well-being.*
