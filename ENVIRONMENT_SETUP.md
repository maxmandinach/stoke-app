# Environment Setup for Stoke Content Processing Pipeline

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Google AI (Gemini) Configuration

```bash
# Required: Get your API key from https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=your_google_ai_api_key_here
```

**How to get your Google AI API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key to your `.env.local` file

### Supabase Configuration

```bash
# Required: Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get your Supabase configuration:**
1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon/public" key

### Optional Configuration

```bash
# Gemini Model Configuration (defaults are optimized for Stoke)
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_TEMPERATURE=0.3
GEMINI_MAX_OUTPUT_TOKENS=8192

# Rate Limiting (adjust based on your API quota)
GEMINI_REQUESTS_PER_MINUTE=15
GEMINI_REQUESTS_PER_DAY=1500
GEMINI_MAX_CONCURRENT_REQUESTS=3

# Processing Configuration
CONTENT_PROCESSING_TIMEOUT_MS=300000
RETRY_DELAY_MS=2000
MAX_RETRIES=3

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Complete Example

Create a `.env.local` file with the following template:

```bash
# Stoke App Environment Configuration

# Google AI (Gemini) Configuration
GOOGLE_API_KEY=AIzaSyD...your_actual_key_here

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_actual_key_here

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env.local` to version control** - it's already in `.gitignore`
2. **Use environment-specific files** for different deployments
3. **Rotate API keys regularly** for production environments
4. **Use Supabase RLS policies** to secure your database
5. **Monitor API usage** to prevent unexpected charges

## API Quotas and Limits

### Google AI (Gemini) Limits

- **Free tier**: 15 requests per minute, 1,500 requests per day
- **Paid tier**: Higher limits available
- **Context window**: Up to 1M tokens for Gemini 2.0
- **Output tokens**: Up to 8,192 tokens per request

### Recommended Settings by Usage Level

**Development/Testing:**
```bash
GEMINI_REQUESTS_PER_MINUTE=5
GEMINI_REQUESTS_PER_DAY=100
GEMINI_MAX_CONCURRENT_REQUESTS=1
```

**Small Production (< 100 episodes/day):**
```bash
GEMINI_REQUESTS_PER_MINUTE=15
GEMINI_REQUESTS_PER_DAY=1500
GEMINI_MAX_CONCURRENT_REQUESTS=3
```

**Large Production (100+ episodes/day):**
```bash
GEMINI_REQUESTS_PER_MINUTE=60
GEMINI_REQUESTS_PER_DAY=10000
GEMINI_MAX_CONCURRENT_REQUESTS=5
```

## Environment Validation

The processing pipeline automatically validates your environment variables on startup:

```bash
npm run process:content -- --help
```

If any required variables are missing, you'll see clear error messages:

```
❌ Missing GOOGLE_API_KEY environment variable
💡 Add GOOGLE_API_KEY to your .env.local file

❌ Missing Supabase environment variables  
💡 Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file
```

## Testing Your Configuration

After setting up your environment variables, test the configuration:

```bash
# Check system status
npm run process:content -- --stats

# Test with a small piece of content
npm run process:content -- --add-content \
  --title "Test Episode" \
  --transcript "This is a test transcript for validating the processing pipeline." \
  --duration 0.1 \
  --source podcast
```

## Troubleshooting

### Common Issues

**"Cannot find module '@google/generative-ai'"**
- Install dependencies: `npm install`
- Verify package.json includes `@google/generative-ai`

**"Missing GOOGLE_API_KEY environment variable"**
- Check your `.env.local` file exists in the project root
- Verify the variable name is exactly `GOOGLE_API_KEY`
- Restart your development server after adding variables

**"Gemini API rate limit exceeded"**
- Reduce `GEMINI_REQUESTS_PER_MINUTE` in your configuration
- Wait for the rate limit window to reset (1 minute)
- Check your Google AI Studio quota usage

**"Invalid Gemini API key"**
- Verify your API key is correct in `.env.local`
- Generate a new API key from Google AI Studio
- Check that billing is enabled for paid features

### Getting Help

If you encounter issues:

1. Check the [Google AI documentation](https://ai.google.dev/)
2. Review the [Supabase documentation](https://supabase.com/docs)
3. Run the admin dashboard: `npm run admin:dashboard`
4. Check logs in the processing script: `npm run process:content -- --stats`

## Production Deployment

For production environments:

1. **Use environment-specific configuration files**
2. **Set up monitoring and alerting** for API usage
3. **Implement proper logging** for debugging
4. **Use secrets management** for sensitive values
5. **Set up backup and recovery** procedures

### Vercel Deployment

Add environment variables in your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development environments

### Self-Hosted Deployment

For self-hosted deployments, ensure your environment variables are properly set in your deployment configuration (Docker, systemd, etc.). 