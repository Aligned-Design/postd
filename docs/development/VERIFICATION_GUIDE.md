>**STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# Comprehensive Verification Guide

**Last Updated**: December 12, 2025  
**Purpose**: Complete guide to all verification tools and drift audits in POSTD

This document explains all verification scripts, when to run them, and how they prevent drift between documentation, code, and database schema.

---

## 🎯 Philosophy: Zero Drift

**POSTD maintains zero drift** between:
- 📖 Documentation ↔ Code
- 🗄️ Database Schema ↔ Code  
- 🔌 API Contracts ↔ Frontend
- 🧹 Code Quality ↔ Standards

All verifications are automated and run in CI/CD as required checks.

---

## 🔍 Verification Categories

### 1️⃣ Documentation Verification

**What it checks:**
- All `.md` files have correct status tags (🟢 CANONICAL or 🔴 ARCHIVED)
- No orphaned documents (all referenced in index files)
- No broken internal links in `DOCS_INDEX.md`
- No deprecated terminology in canonical docs

**Commands:**
```bash
npm run verify:docs          # Run all doc checks
npm run verify:docs:status   # Status tags only
npm run verify:docs:orphans  # Orphan detection only
npm run verify:docs:links    # Link validation only
```

**Scripts:**
- `scripts/verify-doc-status.mjs`
- `scripts/verify-doc-orphans.mjs`
- `scripts/verify-doc-links.mjs`

**When to run:**
- ✅ **REQUIRED** before merging PRs to main (automated)
- ✅ After adding any new documentation
- ✅ After moving or renaming docs
- ✅ Monthly as part of maintenance

**Success criteria:** All pass with 0 errors (warnings acceptable for example code blocks)

---

### 2️⃣ Schema & RLS Drift Audit

**What it checks:**
- Tables in migrations match documentation
- All documented columns exist in schema
- RLS is enabled where required
- TypeScript types match database schema
- Code queries match actual schema

**Command:**
```bash
npm run verify:schema
```

**Script:** `scripts/verify-schema-drift.mjs`

**What it verifies:**
1. **Migrations** (`supabase/migrations/*.sql`)
   - Extracts all CREATE TABLE statements
   - Identifies RLS policies
   - Checks RLS is enabled

2. **Documentation** (`docs/architecture/MULTI_TENANCY.md`, `docs/architecture/ARCHITECTURE.md`)
   - Compares documented tables vs actual tables
   - Verifies documented columns exist
   - Checks RLS requirements match

3. **TypeScript Types** (`src/lib/types/**`)
   - Compares type definitions to schema columns
   - Flags missing fields
   - Identifies nullable mismatches

4. **Code Queries** (`src/lib/**`)
   - Scans for `.from()` queries
   - Checks selected columns exist in schema
   - Validates query patterns

**When to run:**
- ✅ After database migrations
- ✅ After updating type definitions
- ✅ Before major releases
- ✅ When adding new tables/columns
- ⏱️ Consider adding to CI/CD for schema changes

**Expected results:**
- Errors: Critical mismatches (must fix)
- Warnings: Type field mismatches (review and fix)

---

### 3️⃣ API Contract Drift Audit

**What it checks:**
- Documented APIs exist and work
- Auth patterns are consistent
- Frontend code uses APIs correctly
- No undocumented routes exist
- Response shapes match documentation

**Command:**
```bash
npm run verify:api
```

**Script:** `scripts/verify-api-drift.mjs`

**What it verifies:**
1. **API Documentation** (`docs/architecture/API.md`)
   - Parses all documented endpoints
   - Verifies route files exist
   - Checks HTTP methods match

2. **Auth Patterns**
   - Ensures `authenticateRequest()` is used
   - Verifies `verifyWorkspaceMembership()` for workspace routes
   - Detects manual `supabase.auth.getUser()` anti-pattern
   - Recognizes valid dev mode conditionals

3. **Frontend Usage**
   - Scans components/hooks for API calls
   - Identifies unused API routes
   - Validates expected response usage

4. **Route Discovery**
   - Finds all `route.ts` files in `src/app/api`
   - Flags undocumented routes

**When to run:**
- ✅ After adding new API routes
- ✅ After modifying API contracts
- ✅ Before frontend development
- ✅ When documenting APIs
- ⏱️ Consider adding to CI/CD

**Success criteria:** 0 errors (warnings for unused APIs are OK)

---

### 4️⃣ Code Health & Consistency Check

**What it checks:**
- Orphaned components not imported anywhere
- Manual auth anti-patterns in API routes
- Misleading/outdated TODO comments
- Console.log statements in production code
- Unused type definitions

**Command:**
```bash
npm run verify:code
```

**Script:** `scripts/verify-code-health.mjs`

**What it verifies:**
1. **Orphaned Components** (`src/components/**`)
   - Finds `.tsx` files
   - Checks if imported anywhere
   - Flags potential orphans

2. **Auth Anti-Patterns** (`src/app/api/**`)
   - Scans API routes for manual auth
   - Ensures standard helpers are used
   - Detects `supabase.auth.getUser()` without helpers

3. **TODO Comments**
   - Finds all TODO comments
   - Compares against known valid TODOs
   - Flags unexpected/misleading TODOs

4. **Console Logs**
   - Scans for `console.log()`
   - Allows structured logging patterns
   - Flags debug statements

5. **Type Usage**
   - Checks if exported types are used
   - Identifies potentially unused definitions

**When to run:**
- ✅ Before releases
- ✅ During refactoring
- ✅ Monthly maintenance
- ✅ After deleting features

**Expected results:** Warnings are OK (review before production)

---

## 🚀 Running All Verifications

### Run Everything at Once

```bash
npm run verify:all
```

This runs all verification scripts in sequence:
1. Documentation verification
2. Schema drift audit
3. API contract audit
4. Code health check

**Exit code:**
- `0` = All passed (warnings OK)
- `1` = Errors found (must fix)

---

## 🤖 CI/CD Integration

### Current CI/CD Status

✅ **Documentation Verification** - ENABLED
- Workflow: `.github/workflows/verify-docs.yml`
- Triggers: PRs to `main` with `.md` changes
- **REQUIRED CHECK** - blocks merges if failing

⏱️ **Schema/API/Code** - Optional (not yet in CI/CD)
- Can be added as pre-release checks
- Recommended for production deployments

### Making Schema/API Required (Optional)

To add schema and API checks to CI/CD:

1. Create `.github/workflows/verify-all.yml`:
```yaml
name: Full Verification Suite

on:
  pull_request:
    branches: [main]
  push:
    branches: [main, develop]

jobs:
  verify-everything:
    name: Run All Verifications
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run verify:all
```

2. Enable as required check in GitHub settings

---

## 📋 Pre-Release Checklist

Before deploying to production:

```bash
# 1. Verify documentation
npm run verify:docs

# 2. Check schema consistency
npm run verify:schema

# 3. Audit API contracts
npm run verify:api

# 4. Code health check
npm run verify:code

# 5. Run tests
npm test

# 6. Lint check
npm run lint

# 7. All verifications at once
npm run verify:all && npm test && npm run lint
```

---

## 🔧 Troubleshooting

### Documentation Verification Fails

**Issue:** Status tag missing
- **Fix:** Add status tag to top of file:
  ```markdown
  > **STATUS: 🟢 CANONICAL**  
  > This document is current and treated as a source of truth.
  ```

**Issue:** Orphaned document
- **Fix:** Add reference in `DOCS_INDEX.md` or appropriate index

**Issue:** Broken link
- **Fix:** Update link path or create missing document

### Schema Verification Warnings

**Issue:** Type missing DB column
- **Fix:** Add field to TypeScript interface in `src/lib/types/`

**Issue:** RLS not enabled
- **Fix:** Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` to migration

### API Verification Errors

**Issue:** Missing authenticateRequest()
- **Fix:** Update route to use standard helpers:
  ```typescript
  import { authenticateRequest, verifyWorkspaceMembership } from '@/lib/auth/apiAuth'
  
  const auth = await authenticateRequest()
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  ```

**Issue:** Undocumented route
- **Fix:** Add to `docs/architecture/API.md` or remove route if unused

### Code Health Warnings

**Issue:** Orphaned component
- **Fix:** Either use the component or delete it

**Issue:** Misleading TODO
- **Fix:** Complete the TODO or update comment to match reality

---

## 📊 Maintenance Schedule

### Daily (Automated)
- ✅ Documentation verification on PRs

### Before Each Release
- ✅ Full verification suite (`npm run verify:all`)
- ✅ Review all warnings
- ✅ Fix any errors

### Monthly
- ✅ Run `npm run verify:code`
- ✅ Clean up orphaned files
- ✅ Update TODO comments
- ✅ Review verification script effectiveness

### Quarterly
- ✅ Review verification scripts themselves
- ✅ Update expected values if architecture changes
- ✅ Add new checks for new patterns

---

## 🎓 Understanding Drift

**What is drift?**
Drift occurs when different parts of the system fall out of sync:
- Docs say one thing, code does another
- Database has fields code doesn't know about
- APIs return shapes frontend doesn't expect
- Types don't match actual data

**Why it matters:**
- 🐛 Causes bugs (code assumes wrong schema)
- 📚 Misleads developers (docs lie)
- 🔧 Makes maintenance harder (unclear truth)
- 💥 Breaks at runtime (type mismatches)

**How we prevent it:**
- ✅ Automated verification scripts
- ✅ Required CI/CD checks
- ✅ Documentation as code
- ✅ Schema-first development
- ✅ Regular audits

---

## 🚦 Quick Reference

| Check                     | Command                  | Required | Frequency        |
|---------------------------|--------------------------|----------|------------------|
| Documentation             | `npm run verify:docs`    | ✅ Yes   | Every PR         |
| Schema consistency        | `npm run verify:schema`  | ⏱️ Soon  | After migrations |
| API contracts             | `npm run verify:api`     | ⏱️ Soon  | After API changes|
| Code health               | `npm run verify:code`    | ❌ No    | Monthly          |
| Everything                | `npm run verify:all`     | ❌ No    | Pre-release      |

---

**For questions or to add new verifications, see the scripts in `/scripts/verify-*.mjs`**

---

*This guide is maintained alongside the verification scripts. Last verified: December 12, 2025*

