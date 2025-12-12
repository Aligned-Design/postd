> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD — Builder Rules & Development Standards

These rules must be followed for ALL future work in this repository. Cursor, you must read and respect this file before making changes.

## 🔒 1. Do NOT modify core systems unless explicitly asked

Cursor must NOT modify:

### ❌ The database schema

UNLESS the prompt explicitly says: **"Create a new migration"**

Cursor is NOT allowed to:
- Add new tables
- Rename columns
- Change relationships
- Add or remove constraints
- Modify RLS
- Create new functions or triggers

unless directly instructed.

### ❌ Backend API routes

Do NOT create new routes when one already exists. Do NOT rename or restructure routes without explicit instruction.

### ❌ File/folder structure

Do NOT reorganize files, move directories, rename folders, or restructure architecture unless asked.

---

## 📁 2. Use existing patterns. Do NOT invent new ones

Cursor must FIRST search for:
- Existing types
- Existing API clients
- Existing helper functions
- Existing hooks
- Existing context patterns
- Existing components

**Before creating anything new.**

If something exists → **reuse it**.  
If something is similar → **extend it**.  
If something is almost what we need → **refactor it**.

---

## 🧠 3. Ask before creating new abstractions

If a prompt is vague or a pattern is unclear:

Cursor must pause and respond:

> "I need clarification: should I reuse X, modify Y, or create Z?"

**NO assumptions. NO silent architectural changes. NO abstractions "just because."**

---

## 🧱 4. Keep the codebase simple

Cursor must:
- Prefer simple functions over abstractions
- Keep utilities small and focused
- Keep files short and readable
- Use clear naming (no magic)
- Avoid overengineering

If complexity is required, Cursor must explain the tradeoff.

---

## 🧭 5. Consistent directory structure

### Allowed directories:
```
app/
src/components/
src/lib/
supabase/
docs/
```

### `src/lib/` contains:
- `/auth`
- `/supabase`
- `/workspaces`
- `/types`
- `/utils`

**No new folder names unless explicitly requested.**

---

## 🔐 6. Authentication rules

- Always use Supabase **server-side client** in server components.
- Never expose service keys client-side.
- Protect all `/app` routes.
- Redirect unauthenticated users immediately.

---

## 🏢 7. Workspace rules (multi-tenancy)

**POSTD is workspace-first.**

### Cursor must ALWAYS:
- Scope data queries by `workspace_id`
- Respect workspace membership
- Use `ensureUserHasWorkspace()` when loading `/app`
- Provide helper functions ONLY in `src/lib/workspaces/`

### Cursor must NOT:
- Fetch global data
- Mix data across workspaces
- Bypass RLS

---

## 🎨 8. UI Rules

Cursor must:
- Use TailwindCSS
- Use shadcn/ui patterns for components
- Keep styling minimal
- Prefer server components unless interactivity is needed

---

## 🧪 9. Code Quality Rules

- All functions must be typed
- All API calls must check errors
- No console logs in final code
- Add TODOs where further development is expected

---

## 📘 10. Documentation Requirements

For any new feature or major change, Cursor must update:

### `/docs`:
- `ARCHITECTURE.md`
- `RULES.md`
- `MULTI_TENANCY.md` (if workspace-related)

Every major feature must include a `README.md` in its folder explaining:
- What it does
- How to use it
- Any dependencies
- TODOs or future plans

---

## 💬 Developer Contract Summary

### Cursor must ALWAYS:

1. Follow these rules.
2. Use existing patterns.
3. Avoid rewriting or reorganizing without permission.
4. Prefer clarity over cleverness.
5. Ask questions when unsure.
6. Maintain consistency across the entire codebase.
7. Keep everything typed, simple, and modular.
8. Write clean commit messages if generating Git history.

---

**END OF RULES**

