> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD Architecture

## Overview

POSTD is a marketing content system built with a modern, scalable tech stack designed for multi-tenant workspaces and AI-powered content generation.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Custom components in `src/components/ui/`

### Backend
- **API Layer**: Next.js Route Handlers (API routes)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (available for future use)

### Tooling
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Type Safety**: TypeScript strict mode

## Directory Structure

```
POSTD/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth-related pages (login)
│   │   ├── app/               # Protected /app routes
│   │   ├── api/               # API route handlers
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── Header.tsx        # Public header
│   │   ├── AppHeader.tsx     # App header with workspace
│   │   └── WorkspaceSwitcher.tsx
│   ├── lib/                   # Business logic & utilities
│   │   ├── supabase/         # Supabase client helpers
│   │   ├── workspaces/       # Workspace domain logic
│   │   ├── sources/          # Source management (Phase 2)
│   │   ├── crawler/          # Website crawler (Phase 2)
│   │   └── types/            # Shared TypeScript types
│   └── hooks/                 # Custom React hooks
├── supabase/
│   └── migrations/            # SQL migrations
├── docs/                      # Documentation
├── middleware.ts              # Next.js middleware (auth checks)
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Core Concepts

### 1. Authentication Flow

POSTD uses **Supabase Auth** for authentication:

1. **Public Routes** (`/`): Accessible to everyone
2. **Auth Routes** (`/login`): Email/password authentication
3. **Protected Routes** (`/app/*`): Require authentication

**Implementation Details:**

- **Middleware** (`middleware.ts`): Checks authentication status on every request
  - Redirects unauthenticated users from `/app` to `/`
  - Redirects authenticated users from `/login` to `/app`
  
- **Client Helpers** (`src/lib/supabase/browserClient.ts`):
  - Used in Client Components for auth operations
  - Handles sign in, sign up, sign out
  
- **Server Helpers** (`src/lib/supabase/serverClient.ts`):
  - Used in Server Components and API routes
  - Handles session validation and user data fetching

### 2. Multi-Tenant Architecture

See [MULTI_TENANCY.md](./MULTI_TENANCY.md) for detailed information.

### 3. Website Ingestion (Phase 2)

POSTD can crawl and analyze your website to understand your brand voice and content style.

**Database Schema:**
- **`sources`** table: Tracks connected data sources (websites, social accounts)
  - Generic design: `type` field distinguishes between 'website', 'instagram', etc.
  - Configuration stored in JSONB `config` field
  - All sources are workspace-scoped

- **`crawled_pages`** table: Stores extracted website content
  - Contains cleaned text, title, raw HTML
  - Metadata includes word count, h1 tags, meta descriptions
  - Linked to source via `source_id`
  - All pages are workspace-scoped

**Crawler Implementation:**
- Location: `src/lib/crawler/websiteCrawler.ts`
- Uses `cheerio` for HTML parsing
- Extracts main content (prefers `<main>`, `<article>` tags)
- Follows internal links up to configurable limit (default: 10 pages)
- Stores results via upsert (prevents duplicates)

**API Routes:**
- `POST /api/workspaces/[workspaceId]/sources/website`: Create source & trigger crawl
- `GET /api/workspaces/[workspaceId]/sources`: List all sources with stats
- `GET /api/workspaces/[workspaceId]/crawled-pages`: List all crawled pages

**Frontend Components:**
- `WebsiteConnector`: Form to add website URL and trigger crawl
- `CrawledPagesList`: Display connected websites and crawled pages

**Future Enhancements (TODOs):**
- Respect robots.txt
- Sitemap parsing
- Smarter content extraction
- Incremental re-crawling
- Larger page limits with background jobs

### 4. Component Architecture

**UI Components** (`src/components/ui/`):
- Reusable, unstyled-first components
- Button, Card, and more
- Can be extended with variants and sizes

**Feature Components** (`src/components/`):
- Header: Public navigation
- AppHeader: Authenticated app navigation
- WorkspaceSwitcher: Workspace selection dropdown

### 5. Type Safety

All domain types are defined in `src/lib/types/index.ts`:
- `User`: User profile data
- `Workspace`: Workspace entity
- `WorkspaceMember`: Workspace membership
- `WorkspaceWithRole`: Workspace with user's role

### 6. API Routes

API routes follow REST conventions:
- `GET /api/app/active-workspace`: Get current workspace context
- Future: CRUD operations for content, connectors, etc.

## Environment Setup

### Required Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Getting Supabase Credentials

1. Create a project at [app.supabase.com](https://app.supabase.com)
2. Go to Settings → API
3. Copy the Project URL and anon/public key
4. Apply the migrations from `supabase/migrations/`

See `supabase/README.md` for migration instructions.

## Development Workflow

### Running the App

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## Future Phases

### Phase 2: Website Ingestion
- Crawler service to ingest website content
- Content storage and indexing
- Brand voice analysis

### Phase 3: Social Connectors
- OAuth integrations for social platforms
- Content fetching and analysis
- Style pattern recognition

### Phase 4: Brand Guide Generation
- AI analysis of ingested content
- Brand guide creation (voice, tone, colors, fonts)
- Refinement interface

### Phase 5: Content Generation
- AI-powered content creation
- On-brand suggestions
- Multi-format output (social, blog, email)

### Phase 6: Analytics & Feedback
- Content performance tracking
- AI model improvement
- A/B testing capabilities

## Key Design Decisions

1. **App Router over Pages Router**: Better data fetching, layouts, and streaming
2. **Supabase over custom backend**: Faster development, built-in auth and real-time
3. **Server Components by default**: Better performance, reduced client JS
4. **RLS for security**: Database-level security policies
5. **Workspace-scoped data**: All major entities belong to a workspace

## Security Considerations

- All `/app` routes protected by middleware
- RLS policies enforce workspace membership
- Service role key kept server-side only
- HTTPS enforced in production
- Auth tokens stored in secure httpOnly cookies

