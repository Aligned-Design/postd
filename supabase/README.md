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
supabase link --project-ref your-project-ref
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

## Notes

- Migrations should be applied in numerical order
- RLS (Row Level Security) is enabled by default
- All tables reference `auth.users` which is managed by Supabase Auth

