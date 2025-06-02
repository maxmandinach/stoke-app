# Stoke Deployment Guide

This guide covers deploying the complete Stoke mindful learning platform to production, including all components: session flows, analytics, admin dashboard, and testing infrastructure.

## 🏗 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Supabase project configured with production settings
- [ ] Google AI API key with appropriate quotas
- [ ] Domain name and SSL certificates ready
- [ ] CDN configured for static assets
- [ ] Error tracking service configured (Sentry, etc.)

### ✅ Database Preparation
- [ ] Production database migrated with all schemas
- [ ] Database performance optimized (indexes, constraints)
- [ ] Backup strategy implemented
- [ ] Connection pooling configured
- [ ] RLS (Row Level Security) policies verified

### ✅ Security Hardening
- [ ] Environment variables secured
- [ ] API rate limiting configured
- [ ] CORS policies set appropriately
- [ ] Authentication flows tested
- [ ] Data export/privacy controls verified

## 🚀 Deployment Platforms

### Vercel (Recommended)

Vercel provides optimal Next.js deployment with automatic optimizations.

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Configure Project
```bash
# Link project to Vercel
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY
vercel env add NEXT_PUBLIC_APP_ENV production
```

#### 3. Deploy
```bash
# Deploy to production
vercel --prod

# Verify deployment
vercel ls
```

#### 4. Custom Domain
```bash
# Add custom domain
vercel domains add yourdomain.com
vercel alias set your-deployment-url.vercel.app yourdomain.com
```

### Alternative: Netlify

#### 1. Build Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[functions]
  directory = ".netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"
```

#### 2. Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Link and deploy
netlify init
netlify deploy --prod
```

### Self-Hosted (Docker)

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Build and Deploy
```bash
# Build image
docker build -t stoke-app .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your_url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your_service_key" \
  -e GEMINI_API_KEY="your_gemini_key" \
  stoke-app
```

## 🗄 Database Deployment

### Supabase Production Setup

#### 1. Project Configuration
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up RLS policies
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_library ENABLE ROW LEVEL SECURITY;
```

#### 2. Performance Optimization
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_content_library_processed 
ON content_library(processing_status, created_at);

CREATE INDEX CONCURRENTLY idx_learning_sessions_user_date 
ON learning_sessions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_user_question_progress_due 
ON user_question_progress(user_id, next_review_date) 
WHERE next_review_date <= NOW();

-- Analyze tables for query optimization
ANALYZE content_library;
ANALYZE learning_sessions;
ANALYZE user_question_progress;
```

#### 3. Backup Configuration
```bash
# Set up automated backups
pg_dump "postgresql://user:pass@host:port/db" > backup_$(date +%Y%m%d).sql

# Schedule with cron
0 2 * * * /path/to/backup_script.sh
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
# App Configuration
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
ANALYTICS_ID=your_analytics_id

# Performance
NEXT_REVALIDATE_DEFAULT=3600
NEXT_CACHE_TTL=86400
```

### Security Headers
Configure security headers in `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

## 📊 Monitoring & Analytics

### Application Monitoring

#### 1. Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.js`:
```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        return null;
      }
    }
    return event;
  }
});
```

#### 2. Performance Monitoring
```javascript
// In your main app component
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, id }) {
  // Send to your analytics service
  gtag('event', name, {
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: id,
    non_interaction: true,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Database Monitoring

#### 1. Performance Queries
```sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check connection usage
SELECT count(*) as active_connections,
       max_conn,
       max_conn - count(*) as available_connections
FROM pg_stat_activity, 
     (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') mc;

-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### 2. Automated Health Checks
```javascript
// API route: /api/health
export async function GET() {
  try {
    // Database connectivity
    const { data, error } = await supabase
      .from('content_library')
      .select('count')
      .limit(1);
    
    if (error) throw error;

    // AI service connectivity
    const aiResponse = await fetch(`${process.env.GEMINI_API_URL}/health`);
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        ai: aiResponse.ok ? 'ok' : 'degraded'
      }
    });
  } catch (error) {
    return Response.json(
      { 
        status: 'unhealthy', 
        error: error.message 
      },
      { status: 503 }
    );
  }
}
```

## 🧪 Testing in Production

### Deployment Testing Checklist
- [ ] All pages load correctly
- [ ] User authentication flows work
- [ ] Content selection and session flows complete
- [ ] Analytics dashboard displays data
- [ ] Admin dashboard shows system health
- [ ] Mobile responsiveness verified
- [ ] Accessibility features functional
- [ ] Performance metrics within targets

### Automated Testing
```bash
# Run E2E tests against production
TEST_BASE_URL=https://yourdomain.com npm run test:e2e

# Performance testing
npm run test:performance

# Accessibility audit
npm run test:a11y
```

### Monitoring Scripts
```bash
#!/bin/bash
# health-check.sh
curl -f https://yourdomain.com/api/health || exit 1
echo "Health check passed"

# Set up monitoring with cron
*/5 * * * * /path/to/health-check.sh
```

## 🔄 Continuous Deployment

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run E2E tests
        run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📋 Post-Deployment Tasks

### 1. Content Seeding
```bash
# Add initial content through admin interface or API
npm run process:content -- --add-content \
  --title "Welcome to Stoke" \
  --content "Your learning journey begins..." \
  --source article

# Process content pipeline
npm run process:content -- --all-pending
```

### 2. User Onboarding
- Configure welcome email sequences
- Set up user analytics tracking
- Create sample learning paths
- Prepare help documentation

### 3. Performance Optimization
```javascript
// Implement progressive loading
const ProgressAnalytics = dynamic(() => import('@/components/ProgressAnalytics'), {
  loading: () => <AnalyticsLoader />,
  ssr: false
});

// Optimize images
import Image from 'next/image';

// Use Web Workers for heavy computations
const worker = new Worker('/workers/analytics.js');
```

### 4. Backup Verification
```bash
# Test backup restoration
pg_restore --verbose --clean --no-acl --no-owner \
  -h localhost -U username -d test_restore backup_file.sql

# Verify data integrity
npm run validate:schema
```

## 🚨 Incident Response

### Monitoring Alerts
Set up alerts for:
- High error rates (>1%)
- Slow response times (>2s)
- Database connection issues
- AI service downtime
- High memory/CPU usage

### Rollback Procedures
```bash
# Vercel rollback
vercel rollback

# Database rollback (if needed)
pg_restore --clean previous_backup.sql

# Clear CDN cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use Vercel's automatic scaling
- Implement database read replicas
- Set up CDN for static assets
- Consider edge functions for global performance

### Performance Optimization
- Implement service worker caching
- Use Next.js ISR for dynamic content
- Optimize bundle sizes with tree shaking
- Implement lazy loading for heavy components

### Cost Management
- Monitor API usage and implement caching
- Use Supabase connection pooling
- Implement efficient query patterns
- Set up billing alerts

---

This deployment guide ensures your Stoke application runs smoothly in production with proper monitoring, security, and performance optimizations. Remember to test thoroughly in a staging environment before deploying to production. 