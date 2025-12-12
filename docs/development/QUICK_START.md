> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD Quick Start

Get POSTD running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

**Create a project:**
1. Go to https://app.supabase.com
2. Click "New Project"
3. Wait ~2 min for provisioning

**Get credentials:**
1. Go to Settings → API
2. Copy "Project URL" and "anon public" key

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Apply Database Migration

**In Supabase dashboard:**
1. Go to SQL Editor
2. Click "New Query"
3. Copy contents of `supabase/migrations/001_create_workspaces.sql`
4. Paste and click "Run"

### 5. Run the App

```bash
npm run dev
```

Open http://localhost:3000 🎉

### 6. Create an Account

1. Click "Get Started"
2. Enter any email/password
3. You're in!

## Project Structure

```
src/
├── app/           # Pages & routes
├── components/    # React components
├── lib/          # Business logic
└── hooks/        # React hooks

supabase/
└── migrations/   # Database schema

docs/             # Documentation
```

## Key Files

- `src/app/page.tsx` - Landing page
- `src/app/app/page.tsx` - Dashboard
- `src/lib/workspaces/` - Workspace logic
- `docs/architecture/ARCHITECTURE.md` - System design

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
npm run format   # Format code
```

## Need Help?

- 📖 [Detailed Setup Guide](./SETUP.md)
- 🏗️ [Architecture Overview](../architecture/ARCHITECTURE.md)
- 🏢 [Multi-Tenancy Design](../architecture/MULTI_TENANCY.md)
- 🔌 [API Reference](../architecture/API.md)

## What's Next?

Check out [docs/current-status/PROJECT_STATUS.md](../current-status/PROJECT_STATUS.md) to see:
- What's been built
- What's coming next (Phase 2-6)
- How to contribute

---

**Built with Next.js, TypeScript, Supabase, and TailwindCSS**

