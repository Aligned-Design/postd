> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD Setup Guide

Complete setup instructions for getting POSTD running locally.

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `postd` (or your choice)
   - Database password: Save this somewhere secure
   - Region: Choose closest to you
4. Wait for project to be provisioned (~2 minutes)

### 3. Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy the following:
   - **Project URL**: `https://btyczuatitwjduotkcrn.supabase.co`
   - **anon public** key (long string starting with `eyJ...`)

### 4. Configure Environment Variables

1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and paste your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://btyczuatitwjduotkcrn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWN6dWF0aXR3amR1b3RrY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTk3ODMsImV4cCI6MjA3OTEzNTc4M30.jICuN8TpCX7GZuPGDbhKQxXKxRLfX5-hEIG2tZxZPBQ
```

### 5. Apply Database Migrations

You have three options:

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/migrations/001_create_workspaces.sql` in your code editor
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** (or press `Cmd/Ctrl + Enter`)
8. You should see "Success. No rows returned"

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref btyczuatitwjduotkcrn

# Apply migrations
supabase db push
```

#### Option C: Using psql (Advanced)

```bash
psql -h db.btyczuatitwjduotkcrn.supabase.co -U postgres -d postgres -f supabase/migrations/001_create_workspaces.sql
```

### 6. Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see two new tables:
   - `workspaces`
   - `workspace_members`
3. Click on each to verify the columns match the schema

### 7. Configure Supabase Auth (Optional)

By default, Supabase allows email/password signups. You can customize this:

1. Go to **Authentication → Providers** in Supabase
2. Configure email settings:
   - **Enable email confirmations**: Off for development, On for production
   - **Secure email change**: Recommended for production
3. (Optional) Add OAuth providers like Google, GitHub, etc.

For development, it's easiest to disable email confirmations so you can test quickly.

### 8. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

### 9. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the POSTD landing page
3. Click **"Get Started"** or **"Log in / Sign up"**
4. Create an account with any email/password
5. After signup:
   - If email confirmation is **disabled**: You'll be logged in and redirected to `/app`
   - If email confirmation is **enabled**: Check your email for a confirmation link
6. You should see the dashboard with a welcome message and your workspace name

### 10. Verify Workspace Creation

1. Go to Supabase **Table Editor → workspaces**
2. You should see one workspace created with your email as the name
3. Go to **workspace_members**
4. You should see one row with your user_id and role='owner'

## Common Issues

### Issue: "Invalid API key"

**Solution**: 
- Make sure you copied the **anon public** key, not the service_role key
- Check that there are no extra spaces in your `.env.local` file
- Restart the dev server after changing env variables

### Issue: "relation 'workspaces' does not exist"

**Solution**: 
- The migrations weren't applied
- Go back to Step 5 and apply the migrations
- Verify in Supabase Table Editor that the tables exist

### Issue: "User already registered" when trying to sign up

**Solution**: 
- Try logging in instead of signing up
- Or use a different email address
- Or delete the user in Supabase Auth → Users

### Issue: Redirected to "/" after logging in

**Solution**: 
- Check browser console for errors
- Verify your middleware.ts file exists
- Check that Supabase auth is working: `supabase.auth.getUser()`

### Issue: Build errors related to TypeScript

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | For admin operations (future use) |

## Next Steps

Once setup is complete:

1. Read [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) to understand the system
2. Read [MULTI_TENANCY.md](../architecture/MULTI_TENANCY.md) to understand workspaces
3. Start building Phase 2 features!

## Production Deployment

For production deployment to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Update Supabase Auth URLs:
   - Go to **Authentication → URL Configuration**
   - Set **Site URL** to your production domain
   - Add your domain to **Redirect URLs**

## Development Tips

- Use the Supabase dashboard to inspect database contents
- Check the **Logs** section in Supabase for auth issues
- Use React DevTools to inspect component state
- Check browser Network tab for API request failures

