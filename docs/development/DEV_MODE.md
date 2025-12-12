> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# Dev Mode - Development Without Authentication

**Date**: December 11, 2025  
**Status**: ✅ Available (Disabled by Default)

---

## 🚨 CRITICAL SAFETY INFORMATION

### Production Protection

Dev mode has **MULTIPLE SAFETY RAILS**:

1. **Disabled by default**: Requires explicit opt-in
2. **Production lockout**: ALWAYS disabled when `NODE_ENV === 'production'`
3. **Dual requirement**: Needs BOTH env vars to activate:
   - `NEXT_PUBLIC_DEV_MODE_ENABLED=true`
   - `NEXT_PUBLIC_DEV_WORKSPACE_ID=<uuid>`

### Before Deploying to Production

**CRITICAL CHECKLIST**:

- [ ] Verify `.env.local` is in `.gitignore` (it is by default)
- [ ] Confirm `NEXT_PUBLIC_DEV_MODE_ENABLED` is NOT in production env vars
- [ ] Check deployment logs for `🔒 Production mode` (NOT `🔓 Dev mode`)
- [ ] Test production build locally with `NODE_ENV=production pnpm build`
- [ ] Verify landing page shows "Get Started" (not "Enter Postd")

### How to Confirm Dev Mode is OFF

Check **ANY** of these indicators:

1. **Server Logs**:
   ```
   [DevMode] Status: 🔒 Production mode - Dev mode disabled
   [Middleware] 🔒 Production mode - enforcing auth
   ```

2. **Landing Page**: No yellow dev mode badge

3. **Environment Check**:
   ```bash
   echo $NEXT_PUBLIC_DEV_MODE_ENABLED
   # Should be empty or "false"
   ```

4. **App Behavior**: Visiting `/app` redirects to `/login`

---

## What is Dev Mode?

Dev Mode allows local development without authentication. It uses a single fixed workspace for all operations.

### Features

- ✅ No login required for local development
- ✅ Single fixed workspace (from env var)
- ✅ Direct `/app` access
- ✅ Full feature parity with production mode
- ✅ Automatic switching (no code changes needed)
- ✅ Production-safe (multiple safety rails)

### Safety Features

- 🔒 **Never** activates in production (`NODE_ENV === 'production'`)
- 🔒 Requires **explicit opt-in** (not on by default)
- 🔒 Logs all dev mode activity
- 🔒 Visual indicators when active (badges)
- 🔒 No code changes needed to switch modes

---

## Setup Instructions

### 1. Create Dev Workspace in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/project/btyczuatitwjduotkcrn)
2. Navigate to **Table Editor** → **workspaces** table
3. Click **Insert row**:
   - Let it auto-generate the `id` (UUID)
   - Set `name` = `Dev Workspace`
   - Set `created_by` = `null`
4. Click **Save**
5. **Copy the UUID** from the `id` column

### 2. Enable Dev Mode

Add **BOTH** lines to your `.env.local`:

```bash
NEXT_PUBLIC_DEV_MODE_ENABLED=true
NEXT_PUBLIC_DEV_WORKSPACE_ID=paste-your-uuid-here
```

**Example**:
```bash
NEXT_PUBLIC_DEV_MODE_ENABLED=true
NEXT_PUBLIC_DEV_WORKSPACE_ID=f7b3c4d1-8e2a-4f9b-a5c6-1d3e5f7g9h1j
```

### 3. Restart Dev Server

```bash
pnpm dev
```

### 4. Verify Dev Mode is Active

Check server logs for:
```
[DevMode] Status: 🔓 Dev mode active
[DevMode] Config: {
  "isProduction": false,
  "devModeEnabled": true,
  "hasDevWorkspace": true,
  "devWorkspaceId": "f7b3...",
  "isActive": true
}
```

---

## How Dev Mode Works

### Architecture

Dev mode uses a central feature flag (`isDevMode()`) that determines behavior throughout the app:

```typescript
import { isDevMode } from '@/lib/devMode'

if (isDevMode()) {
  // Dev mode path
} else {
  // Production auth path
}
```

### Decision Logic

```
Is NODE_ENV === 'production'?
  ├─ YES → Dev mode OFF (always)
  └─ NO → Check flags
      ├─ NEXT_PUBLIC_DEV_MODE_ENABLED === 'true'?
      │   ├─ NO → Dev mode OFF
      │   └─ YES → Check workspace
      │       ├─ NEXT_PUBLIC_DEV_WORKSPACE_ID set?
      │       │   ├─ NO → Dev mode OFF
      │       │   └─ YES → Dev mode ON ✅
```

### Component Behavior

| Component | Dev Mode | Production Mode |
|-----------|----------|-----------------|
| **Middleware** | Passes all requests | Enforces auth, redirects |
| **App Layout** | `getDevWorkspace()` | `getActiveWorkspaceFromRequest()` |
| **Dashboard** | Dev workspace, shows badge | User's workspace, no badge |
| **Landing Page** | "Enter Postd" → `/app` | "Get Started" → `/login` |
| **API Routes** | Dev workspace, no auth checks | Full auth + membership checks |

---

## Files & Implementation

### Core Dev Mode Logic

#### `src/lib/devMode.ts` (NEW)
Central feature flag implementation.

**Key Functions**:
- `isDevMode()`: Returns true if dev mode is active
- `assertDevMode()`: Throws if dev mode is not active
- `getDevModeStatus()`: Human-readable status string
- `DEV_MODE_CONFIG`: Config object for debugging

**Safety Rails**:
- Always returns `false` in production
- Requires both env vars to activate
- Logs status on import (server-side)

#### `src/lib/workspaces/devWorkspace.ts` (UPDATED)
Dev workspace provider.

**Changes**:
- Now calls `assertDevMode()` on entry
- Throws if dev mode is not enabled
- Simplified (no need to check env vars)

#### `src/lib/auth/apiAuth.ts` (NEW)
Unified API auth helper.

**Key Functions**:
- `authenticateRequest()`: Dev mode aware authentication
- `verifyWorkspaceMembership()`: Dev mode aware membership check

**Behavior**:
- Dev mode: Returns dev workspace, skips auth
- Production: Enforces real Supabase auth

### Updated Files

#### `src/lib/supabase/middleware.ts`
- Checks `isDevMode()` at runtime
- Dev mode: Bypasses all auth
- Production: Full auth enforcement (no longer commented out)

#### `src/app/app/layout.tsx`
- Conditionally calls `getDevWorkspace()` or `getActiveWorkspaceFromRequest()`
- No more commented code blocks
- Automatic switching based on `isDevMode()`

#### `src/app/app/page.tsx`
- Conditionally renders dev mode badge
- Uses ternary for workspace context
- No more commented code blocks

#### `src/app/page.tsx`
- Marked as `'use client'` to read `DEV_MODE_CONFIG`
- Conditionally shows/hides dev mode badge
- Conditionally sets button text and href

#### API Routes (3 files updated)
- `src/app/api/app/active-workspace/route.ts`
- `src/app/api/workspaces/[workspaceId]/sources/website/route.ts`
- `src/app/api/workspaces/[workspaceId]/crawled-pages/route.ts`

All now use `authenticateRequest()` and `verifyWorkspaceMembership()` helpers.

---

## Disabling Dev Mode

### Quick Method

In `.env.local`, change or remove:
```bash
NEXT_PUBLIC_DEV_MODE_ENABLED=false
# or just delete the line
```

Restart server. Auth is now enforced.

### Verification

After disabling:
1. Restart: `pnpm dev`
2. Check logs: `🔒 Production mode - enforcing auth`
3. Visit `/app`: Redirects to `/login`
4. Landing page: Shows "Get Started" button
5. No yellow dev mode badges

---

## Development Workflow

### Local Development (Dev Mode)

```bash
# .env.local
NEXT_PUBLIC_DEV_MODE_ENABLED=true
NEXT_PUBLIC_DEV_WORKSPACE_ID=abc-123-def
```

**Experience**:
- Open browser → Click "Enter Postd" → Start coding
- No login, no auth, no delays
- All features work with dev workspace

### Testing Auth Flow (Production Mode)

```bash
# .env.local
NEXT_PUBLIC_DEV_MODE_ENABLED=false
# or just remove the line
```

**Experience**:
- `/app` requires login
- Test signup/login flows
- Test workspace creation
- Test multi-user scenarios

### Production Deploy

**DO NOT** set `NEXT_PUBLIC_DEV_MODE_ENABLED` in production env vars.

Dev mode will automatically be disabled due to `NODE_ENV === 'production'`.

---

## Troubleshooting

### Issue: Dev mode not activating

**Check**:
1. Both env vars set?
   ```bash
   NEXT_PUBLIC_DEV_MODE_ENABLED=true
   NEXT_PUBLIC_DEV_WORKSPACE_ID=<uuid>
   ```
2. Server restarted after adding vars?
3. Check logs: `[DevMode] Status: ...`

### Issue: Still seeing dev mode in production

**This should be impossible**, but check:
1. `NODE_ENV` value: `echo $NODE_ENV`
2. Production env vars: Remove `NEXT_PUBLIC_DEV_MODE_ENABLED`
3. Build logs: Should show `🔒 Production mode`

### Issue: "Dev mode is not enabled" error

**Cause**: Code tried to call `getDevWorkspace()` when dev mode is off.

**Fix**: Dev mode is properly disabled. This is expected behavior.

### Issue: API calls failing in dev mode

**Cause**: API route not using new auth helpers.

**Fix**: Update API route to use:
```typescript
import { authenticateRequest, verifyWorkspaceMembership } from '@/lib/auth/apiAuth'
```

---

## Testing Checklist

### Dev Mode Active

- [ ] Server logs: `🔓 Dev mode active`
- [ ] Landing page: Yellow dev mode badge visible
- [ ] Landing page: "Enter Postd" button → `/app`
- [ ] Dashboard: Dev mode badge with workspace UUID
- [ ] `/app`: Loads without redirect
- [ ] API calls: Work without authentication

### Dev Mode Inactive

- [ ] Server logs: `🔒 Production mode`
- [ ] Landing page: No dev mode badge
- [ ] Landing page: "Get Started" button → `/login`
- [ ] Dashboard: No dev mode badge
- [ ] `/app` (not logged in): Redirects to `/login`
- [ ] API calls: Require authentication

### Production Build

```bash
NODE_ENV=production pnpm build
pnpm start
```

- [ ] Build logs: No dev mode messages
- [ ] Server logs: `🔒 Production mode`
- [ ] `/app`: Requires login
- [ ] No dev mode badges anywhere

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Node environment |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | - | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | - | Supabase anon key |
| `NEXT_PUBLIC_DEV_MODE_ENABLED` | No | `false` | Enable dev mode (must be `'true'`) |
| `NEXT_PUBLIC_DEV_WORKSPACE_ID` | No* | - | Dev workspace UUID (*required if dev mode enabled) |

---

## Summary

### What Dev Mode Provides

- 🚀 **Faster Development**: No login flow
- 🔓 **Easy Testing**: Single workspace for all features
- 🔄 **Automatic Switching**: No code changes needed
- 🛡️ **Production Safe**: Multiple safety rails
- 📊 **Full Parity**: Same features as production mode

### Safety Guarantees

✅ **Never active in production** (`NODE_ENV === 'production'` → always off)  
✅ **Requires explicit opt-in** (not on by default)  
✅ **Visible when active** (badges, logs)  
✅ **Easy to disable** (remove env var)  
✅ **No code changes needed** (automatic switching)

---

**Dev Mode Status**: ⚠️ Disabled by Default  
**Production Safety**: ✅ Multiple Rails Active  
**Ready for Use**: 🚀 Yes (opt-in required)
