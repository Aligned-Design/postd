# Multi-Tenancy in POSTD

## Overview

POSTD is built as a **multi-tenant application** where every user belongs to one or more **workspaces**. All important data (websites, social accounts, brand guides, generated content) is scoped to a workspace.

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│  auth.users │ (Managed by Supabase Auth)
└──────┬──────┘
       │
       │ created_by
       ├──────────────┐
       │              │
       │              ▼
       │         ┌────────────┐
       │         │ workspaces │
       │         └──────┬─────┘
       │                │
       │ user_id        │ workspace_id
       │                │
       ▼                ▼
  ┌──────────────────────┐
  │ workspace_members    │
  └──────────────────────┘
```

### Tables

#### `workspaces`

Represents a workspace (tenant).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `name` | TEXT | Workspace name |
| `created_by` | UUID | User who created the workspace |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

#### `workspace_members`

Junction table for workspace membership.

| Column | Type | Description |
|--------|------|-------------|
| `workspace_id` | UUID | Reference to workspaces.id |
| `user_id` | UUID | Reference to auth.users.id |
| `role` | TEXT | Either 'owner' or 'member' |
| `created_at` | TIMESTAMPTZ | When user was added |

**Primary Key**: `(workspace_id, user_id)` — ensures a user can only be added once per workspace.

### Row-Level Security (RLS)

All tables have RLS enabled with the following policies:

**`workspaces` table:**
- Users can **view** workspaces where they are members
- Users can **create** workspaces (they become the creator)
- Users can **update** workspaces where they are owners
- Users can **delete** workspaces where they are owners

**`workspace_members` table:**
- Users can **view** members of workspaces they belong to
- Owners can **add** members to their workspaces
- Owners can **remove** members from their workspaces

These policies ensure:
1. Users can only access workspaces they belong to
2. Only workspace owners can manage members
3. Database-level security (can't be bypassed by API)

## Application Flow

### User Sign-Up

1. User signs up via `/login`
2. Supabase Auth creates a record in `auth.users`
3. On first redirect to `/app`:
   - `ensureUserHasWorkspace()` checks for workspace membership
   - If none exists, creates a default workspace named "{email}'s Workspace"
   - Adds user as 'owner' in `workspace_members`
4. User is shown the `/app` dashboard with their workspace

### Active Workspace

The **active workspace** is the workspace the user is currently working in.

**Server-side** (Server Components, API routes):
```typescript
import { getActiveWorkspaceFromRequest } from '@/lib/workspaces/getActiveWorkspace'

const context = await getActiveWorkspaceFromRequest()
// context.workspace: WorkspaceWithRole
// context.user: { id, email }
```

**Client-side** (Client Components):
```typescript
import { useActiveWorkspace } from '@/hooks/useActiveWorkspace'

const { data, loading, error } = useActiveWorkspace()
// data.workspace: WorkspaceWithRole
// data.user: { id, email }
```

### Workspace Switching

Currently, the first workspace is always the active workspace. 

**Future Enhancement**: Add a workspace switcher that:
1. Stores active workspace ID in cookies or URL param
2. Updates `getActiveWorkspaceFromRequest` to read from storage
3. Allows users to switch between workspaces

The UI for this is already present in `WorkspaceSwitcher.tsx` (currently shows only current workspace).

## Domain Logic

All workspace-related logic is in `src/lib/workspaces/`:

### Core Functions

**`getUserWorkspaces(userId: string)`**
- Returns all workspaces the user is a member of
- Includes the user's role in each workspace

**`getUserDefaultWorkspace(userId: string)`**
- Returns the user's first workspace (by creation date)
- Used to determine the active workspace

**`createDefaultWorkspaceForUser(userId: string)`**
- Creates a new workspace for the user
- Automatically adds user as 'owner'

**`ensureUserHasWorkspace(userId: string)`**
- Checks if user has any workspaces
- If not, creates a default workspace
- Returns the user's default workspace

**`getWorkspace(workspaceId: string, userId: string)`**
- Gets a specific workspace by ID
- Checks that the user is a member
- Returns null if user doesn't have access

## Future Workspace Features

### Phase 1.5: Workspace Management
- Create additional workspaces
- Rename workspaces
- Delete workspaces (owner only)
- Invite team members via email
- Remove team members
- Change member roles

### Phase 2+: Workspace-scoped Data

All future entities will be scoped to workspaces:

**`websites`**
```sql
CREATE TABLE websites (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  url TEXT,
  ...
);
```

**`social_accounts`**
```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  platform TEXT,
  ...
);
```

**`brand_guides`**
```sql
CREATE TABLE brand_guides (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  content JSONB,
  ...
);
```

**`generated_content`**
```sql
CREATE TABLE generated_content (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  content TEXT,
  ...
);
```

All queries will filter by `workspace_id` and RLS will enforce access.

## Best Practices

1. **Always check workspace membership** before returning data
2. **Use RLS policies** as the primary security mechanism
3. **Filter by workspace_id** in all queries for workspace-scoped data
4. **Server-side validation** even with RLS (defense in depth)
5. **Pass workspace context** from Server Components to Client Components when possible (avoids extra fetch)

## Testing Multi-Tenancy

To test the multi-tenant setup:

1. Create two user accounts
2. Sign in as User A → see Workspace A
3. Sign out, sign in as User B → see Workspace B
4. Verify User A cannot see User B's data (database-level enforcement via RLS)

## Workspace Limits

Current: No limits (each user can have unlimited workspaces)

Future considerations:
- Free tier: 1 workspace per user
- Pro tier: Unlimited workspaces
- Team tier: Shared workspaces with multiple owners

