> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# 🔓 Dev Mode Setup - Quick Start

**Enable dev mode for local development without authentication**

---

## ⚡ Quick Setup (3 minutes)

### 1. Create Dev Workspace in Supabase

1. Go to: https://app.supabase.com/project/btyczuatitwjduotkcrn/editor
2. Click **Table Editor** → **workspaces** table
3. Click **Insert row**
4. Fill in:
   - `id`: (auto-generated UUID)
   - `name`: `Dev Workspace`
   - `created_by`: `null`
5. Click **Save**
6. **Copy the UUID** from the `id` column

### 2. Enable Dev Mode in `.env.local`

Add these two lines to your `.env.local`:

```bash
NEXT_PUBLIC_DEV_MODE_ENABLED=true
NEXT_PUBLIC_DEV_WORKSPACE_ID=paste-uuid-here
```

**CRITICAL**: Both variables are required for dev mode to activate.

### 3. Restart Dev Server

```bash
pnpm dev
```

### 4. Test It!

1. Go to `http://localhost:3000`
2. Click **"Enter Postd"** button
3. ✅ You should land on `/app` with no login!
4. Check server logs for: `🔓 Dev mode active`

---

## 🚨 SAFETY

### Production Protection

Dev mode is **DISABLED BY DEFAULT** in production:
- ✅ `NODE_ENV === 'production'` → Dev mode is ALWAYS off
- ✅ Missing `NEXT_PUBLIC_DEV_MODE_ENABLED=true` → Dev mode is off
- ✅ Missing `NEXT_PUBLIC_DEV_WORKSPACE_ID` → Dev mode is off

### How to Confirm Dev Mode is OFF

Check any of these:
1. **Server logs**: Look for `🔒 Production mode` (NOT `🔓 Dev mode`)
2. **Landing page**: No dev mode badge visible
3. **Environment**: `NEXT_PUBLIC_DEV_MODE_ENABLED !== 'true'`
4. **Node environment**: `NODE_ENV === 'production'`

### Before Deploying

**ALWAYS** verify:
```bash
# Check .env.local is NOT committed
git status

# Confirm dev mode vars are NOT in production env
# Check your hosting provider's environment variables
# Ensure NEXT_PUBLIC_DEV_MODE_ENABLED is NOT set
```

---

## 🎯 What Changed

| Before (Auth Mode) | Now (Dev Mode) |
|-------------------|----------------|
| `/` → "Get Started" → `/login` | `/` → "Enter Postd" → `/app` |
| Must log in to access `/app` | `/app` publicly accessible |
| User-specific workspaces | Single fixed dev workspace |
| Auth checks everywhere | Auth bypassed everywhere |

---

## 📁 Files Modified

1. ✅ `src/lib/supabase/middleware.ts` - Auth checks disabled
2. ✅ `src/lib/workspaces/devWorkspace.ts` - NEW dev workspace helper
3. ✅ `src/app/app/layout.tsx` - Uses dev workspace, no auth
4. ✅ `src/app/app/page.tsx` - Uses dev workspace, shows dev badge
5. ✅ `src/app/page.tsx` - Button goes to `/app`, shows dev badge

---

## 🔄 How It Works

### Landing Page (`/`)
- Shows "🔓 Dev Mode - No Login Required" badge
- "Enter Postd" button goes to `/app`
- No login prompt

### Dashboard (`/app`)
- Publicly accessible (no auth check)
- Uses `NEXT_PUBLIC_DEV_WORKSPACE_ID` for all operations
- Shows "🔓 Dev Mode - Using workspace: [uuid]" badge
- All features (crawling, sources, etc.) use this workspace

### Middleware
- Passes all requests through
- No auth enforcement
- Auth code preserved in comments

---

## ✅ Expected Behavior

### When You Visit `/`
1. Landing page loads
2. See dev mode badge
3. Click "Enter Postd"
4. Navigate to `/app` (no login)

### When You Visit `/app`
1. Dashboard loads immediately
2. No redirect to login
3. Shows "Dev Workspace"
4. Shows dev mode badge with workspace UUID

### Server Logs
```bash
[AppLayout] 🔓 DEV MODE - Auth disabled
[AppLayout] ✅ Using dev workspace: [your-uuid]
[DevWorkspace] ✅ Using dev workspace: [your-uuid]
```

---

## 🔒 Disabling Dev Mode

To switch back to full authentication:

### Option 1: Just Remove the Flag (Recommended)

In `.env.local`, remove or set to `false`:
```bash
NEXT_PUBLIC_DEV_MODE_ENABLED=false
```

Restart server. Auth is now enforced.

### Option 2: Remove Both Variables

Delete both lines from `.env.local`:
```bash
# NEXT_PUBLIC_DEV_MODE_ENABLED=true
# NEXT_PUBLIC_DEV_WORKSPACE_ID=...
```

### Verify Auth is Active

1. Restart dev server: `pnpm dev`
2. Check logs: Should see `🔒 Production mode`
3. Visit `/app` → Should redirect to `/login`
4. Landing page → Should show "Get Started" (not "Enter Postd")

---

## 🚨 Troubleshooting

### "Dev workspace ID not configured" Error

**Fix**: Add `NEXT_PUBLIC_DEV_WORKSPACE_ID` to `.env.local` and restart server

### Still redirected to /login

**Fix**: Check middleware has `return NextResponse.next()` uncommented

### Wrong workspace showing

**Fix**: Verify UUID in `.env.local` matches workspace in Supabase

---

## 📖 Full Documentation

See `docs/development/DEV_MODE.md` for:
- Complete technical details
- Re-enabling auth instructions
- Troubleshooting guide
- Architecture explanation

---

**Dev Mode Status**: ✅ Active  
**Ready to Develop**: 🚀 Yes  
**Auth Required**: ❌ No

Go build amazing features! 🎉

