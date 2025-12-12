> **STATUS: 🔴 ARCHIVED**  
> This document is kept for historical reference and is not actively maintained.

# POSTD — Phase 0 & 1 Verification Checklist

**Historical Checklist** - This checklist was used to verify Phase 0 (foundation) and Phase 1 (auth + workspaces) completion. Both phases are now complete as of December 2025.

Run through these steps in order and check them off.

---

## 1. Local Setup & Env

- [ ] Repo has been created and initialized as a git repo.

- [ ] `package.json` exists and includes scripts for:

  - [ ] `dev`

  - [ ] `build`

  - [ ] `lint` (optional but preferred)

- [ ] Tailwind config files exist:

  - [ ] `tailwind.config.*`

  - [ ] `postcss.config.*`

  - [ ] Global Tailwind CSS is imported (e.g. in `app/layout.tsx`).

- [ ] Supabase environment variables are defined (locally via `.env.local`):

  - [ ] `NEXT_PUBLIC_SUPABASE_URL`

  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Base App Behavior (Phase 0)

### 2.1 Dev server

1. Run `pnpm dev` (or `npm run dev`).

2. Open `http://localhost:3000`.

- [ ] App starts without TypeScript or runtime errors.

### 2.2 Public landing page (`/`)

As a **logged-out** user:

- [ ] Visiting `/` shows a public landing screen.

- [ ] The page mentions POSTD (or similar branding).

- [ ] There is a clear **"Log in / Sign up"** button or link to `/login`.

### 2.3 Auth page (`/login`)

- [ ] Visiting `/login` shows a sign-in/sign-up UI.

- [ ] The form uses Supabase auth (email/password or magic link).

- [ ] Submitting valid credentials:

  - [ ] Logs you in.

  - [ ] Redirects you to `/app`.

### 2.4 Protected `/app` area

As a **logged-out** user:

- [ ] Visiting `/app` redirects back to `/` or `/login`.

As a **logged-in** user:

- [ ] Visiting `/app` loads without redirecting away.

- [ ] The page shows a placeholder dashboard (e.g. "Welcome to POSTD v2").

---

## 3. Database & Workspaces (Phase 1)

### 3.1 Tables in Supabase

In the Supabase dashboard or via SQL inspector:

- [ ] `workspaces` table exists with columns:

  - [ ] `id` (UUID, PK)

  - [ ] `name` (text)

  - [ ] `created_by` (UUID, references `auth.users.id`)

  - [ ] `created_at` (timestamptz)

- [ ] `workspace_members` table exists with columns:

  - [ ] `workspace_id` (UUID, FK to `workspaces.id`)

  - [ ] `user_id` (UUID, FK to `auth.users.id`)

  - [ ] `role` (text, limited to `owner` or `member`)

  - [ ] `created_at` (timestamptz)

- [ ] Composite primary key on `(workspace_id, user_id)` is configured on `workspace_members`.

- [ ] Row Level Security (RLS) is enabled on both `workspaces` and `workspace_members`.

- [ ] At least basic policies exist (even if marked TODO) to restrict access to members.

### 3.2 First login creates a workspace

1. Create a **brand new user** in the app via the normal login/signup flow.

2. Let the app redirect you to `/app`.

Verify in Supabase:

- [ ] A new row exists in `workspaces` for this user.

- [ ] `workspaces.created_by` matches the user's ID.

- [ ] A new row exists in `workspace_members` with:

  - [ ] `workspace_id` = that workspace

  - [ ] `user_id` = that user

  - [ ] `role` = `owner`.

### 3.3 Workspace helpers (code-level)

Open `src/lib/workspaces` (or the equivalent path):

- [ ] `getUserWorkspaces(userId)` exists and returns all workspaces for that user.

- [ ] `createDefaultWorkspaceForUser(userId)` exists and:

  - [ ] Creates a new workspace.

  - [ ] Adds `workspace_members` row with `role = 'owner'`.

- [ ] `ensureUserHasWorkspace(userId)` exists and:

  - [ ] Returns an existing workspace if one exists.

  - [ ] Creates a default workspace if none exist.

---

## 4. Active Workspace in the UI

### 4.1 Server-side helper

- [ ] There is a helper like `getActiveWorkspaceFromRequest` (or similarly named) that:

  - [ ] Reads the authenticated user via Supabase server client.

  - [ ] Calls `ensureUserHasWorkspace(user.id)`.

  - [ ] Returns `{ user, workspace }`.

### 4.2 `/app` layout + page

Open `app/app/layout.tsx`:

- [ ] It is a server component.

- [ ] It uses the server-side helper to get the current user and active workspace (or is wired to receive them).

- [ ] It redirects if there is no authenticated user.

Open `app/app/page.tsx`:

- [ ] It is a server component.

- [ ] It receives and uses the active workspace.

- [ ] It renders text like:

  - [ ] "Welcome to POSTD v2" (or similar)

  - [ ] "Workspace: {workspace.name}"

### 4.3 Workspace switcher (basic)

In the app header (or navbar):

- [ ] The current workspace name is visible somewhere in the UI.

- [ ] There is at least a placeholder for a workspace switcher:

  - [ ] This may be a simple dropdown or list.

  - [ ] Even if it doesn't fully switch contexts yet, the **intent** is clear and tied to `getUserWorkspaces`.

---

## 5. Dev Experience & Rules

### 5.1 RULES file

- [ ] `docs/RULES.md` exists.

- [ ] It describes:

  - [ ] What Cursor is allowed and not allowed to do.

  - [ ] Rules about DB schema modifications.

  - [ ] Rules about using existing patterns.

  - [ ] Rules about multi-tenancy and `workspace_id`.

  - [ ] UI & code quality expectations.

- [ ] You have committed this file and will reference it in future Cursor prompts.

### 5.2 Architecture docs

- [ ] `docs/ARCHITECTURE.md` exists and includes:

  - [ ] Basic stack overview (Next.js, Supabase, Tailwind, etc.).

  - [ ] Directory structure.

  - [ ] Auth flow overview.

  - [ ] Summary of workspaces and multi-tenancy.

(If present:)

- [ ] `docs/MULTI_TENANCY.md` or a multi-tenancy section explains:

  - [ ] `workspaces` and `workspace_members` relationship.

  - [ ] How active workspace is determined.

  - [ ] Where workspace helpers live.

---

## 6. Final Sanity Pass

As a user:

- [ ] I can sign up or log in.

- [ ] I am redirected to `/app` upon successful authentication.

- [ ] `/app` shows my workspace name.

- [ ] If I log out (or clear auth) and hit `/app`, I get redirected away.

- [ ] No obvious TypeScript errors, runtime exceptions, or crashes occur in these flows.

If all of the above are checked, **Phase 0 & 1 are verified** and we are ready to move on to:

- Phase 2: Website ingestion (crawler)

- Phase 3: Social connectors

- Phase 4: Brand Guide generation

- Phase 5: On-brand content generator

- Phase 6: Analytics + AI feedback loop

