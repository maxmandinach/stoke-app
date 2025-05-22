# Stoke App

A mindful knowledge retention tool built with Next.js and Supabase.

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Naming Conventions

### Database and TypeScript Types
- Use `snake_case` for all database-related fields
- This includes:
  - Database column names
  - TypeScript interface properties that map to database fields
  - API request/response objects that interact with the database

Examples:
```typescript
interface Content {
  id: string;
  title: string;
  source_url: string;  // ✅ Correct
  created_at: string;  // ✅ Correct
  // NOT sourceUrl or createdAt ❌
}
```

### React Components and Functions
- Use `PascalCase` for React components
- Use `camelCase` for functions and variables
- Use `UPPER_SNAKE_CASE` for constants

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Type Safety

This project uses TypeScript with strict type checking. The types are defined in:
- `src/types/content.ts`: Content-related types
- `src/types/database.types.ts`: Database schema types

## Deployment

The app is deployed on Vercel. Make sure to:
1. Set up all required environment variables in the Vercel dashboard
2. Ensure all TypeScript types are properly defined
3. Follow the naming conventions when adding new features

## Contributing

1. Follow the naming conventions
2. Add proper TypeScript types for new features
3. Update the README if adding new environment variables or changing conventions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
