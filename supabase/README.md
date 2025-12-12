> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# Supabase Migrations

This directory contains SQL migrations for the POSTD database schema.

## Applying Migrations

### Option 1: Using Supabase CLI (Recommended)

1. Install the Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref btyczuatitwjduotkcrn
```

3. Apply migrations:
```bash
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order
4. Execute each migration

### Option 3: Manual Execution

You can also run these migrations directly in your Postgres client:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/001_create_workspaces.sql
```

## Migration Files

- `001_create_workspaces.sql` - Creates the workspaces and workspace_members tables with RLS policies
- `002_create_sources_and_crawled_pages.sql` - Creates sources and crawled_pages tables for Phase 2
- `003_fix_workspace_members_rls.sql` - **IMPORTANT** Fixes RLS policy to allow workspace creation (see below)

## Magic Link Authentication Setup

POSTD supports magic link (passwordless) authentication. To configure this properly:

### Development (localhost)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → URL Configuration**
3. Set the following:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`

### Production (Vercel or custom domain)

1. Go to **Authentication → URL Configuration**
2. Update:
   - **Site URL**: `https://your-production-domain.com`
   - **Redirect URLs**: Add `https://your-production-domain.com/auth/callback`

### Email Template Configuration (Optional)

1. Go to **Authentication → Email Templates**
2. Customize the **Magic Link** template if desired
3. Ensure the template includes `{{ .ConfirmationURL }}` which contains the callback URL

### Testing Magic Link Flow

1. Run your app locally: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Use magic link instead"
4. Enter your email
5. Check your email for the magic link
6. Click the link → should redirect to `http://localhost:3000/auth/callback` → then to `/app`

### Troubleshooting

**404 on callback:**
- Verify redirect URL is added in Supabase dashboard
- Check that `/auth/callback/route.ts` file exists
- Ensure middleware isn't blocking the callback route

**No email received:**
- Check Supabase Auth logs in dashboard
- Verify email provider is configured (use built-in for testing)
- Check spam folder

**"Invalid token" error:**
- Magic links expire after a set time (default: 1 hour)
- Request a new magic link

## Notes

- Migrations should be applied in numerical order
- RLS (Row Level Security) is enabled by default
- All tables reference `auth.users` which is managed by Supabase Auth
- Magic links are single-use and expire after the configured time

## ⚠️ CRITICAL: Workspace Creation Issue

If you've applied migration `001` but workspaces are not being created when users log in, you MUST apply migration `003`:

**Problem**: The original RLS policy for `workspace_members` had a chicken-and-egg problem:
- It only allowed inserting members if you were already an owner of that workspace
- But when creating your FIRST workspace, you can't be an owner yet!

**Solution**: Migration `003_fix_workspace_members_rls.sql` fixes this by allowing users to add themselves as owner when they create a workspace.

**How to Apply**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `003_fix_workspace_members_rls.sql`
3. Paste and run it
4. Workspace creation will now work!

**To Verify the Fix**:
1. Check server logs when visiting `/app` after logging in
2. You should see: `"[Workspaces] ✅ Workspace created successfully"`
3. Check Supabase → Table Editor → `workspaces` → should have rows
4. Check Supabase → Table Editor → `workspace_members` → should have rows

---

## Troubleshooting Database Errors

### Error: "Failed to fetch workspaces" or "relation does not exist"

**Cause**: Database migrations haven't been applied yet.

**Solution**: 
1. Apply migrations in order:
   - First: `001_create_workspaces.sql`
   - Then: `002_create_sources_and_crawled_pages.sql`
2. Verify tables exist in Supabase → Table Editor

### Error: "Failed to create workspace" or "row-level security policy"

**Cause**: RLS policies might be preventing access.

**Solution**:
1. Check that RLS policies were created (should be automatic from migration)
2. Verify your user ID matches the authenticated user
3. In Supabase dashboard, go to Authentication → Policies
4. Ensure policies exist for `workspaces` and `workspace_members`

### Error after logging in: "Unable to Load Dashboard"

**Cause**: Usually means migrations aren't applied or there's a database connection issue.

**Solution**:
1. Check Supabase dashboard for any error logs
2. Verify environment variables are correct in `.env.local`
3. Apply all migrations
4. Restart dev server: `npm run dev`

### Verifying RLS Policies

After applying migrations, verify in Supabase:

1. Go to **Table Editor** → **workspaces**
2. Click the **shield icon** (RLS)
3. Should see policies like:
   - "Users can view their workspaces"
   - "Users can create workspaces"
   - etc.

If policies are missing, re-run the migration SQL.

