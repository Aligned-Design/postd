> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the POSTD repository.

## Active Workflows

### Documentation Verification (`verify-docs.yml`)

**Purpose**: Automatically verify documentation quality on every push and pull request.

**Triggers**:
- Pushes to `main` or `develop` branches (when markdown files change)
- Pull requests (when markdown files change)
- Changes to verification scripts or workflow itself

**What it checks**:
1. ✅ All markdown files have correct status tags (🟢 CANONICAL or 🔴 ARCHIVED)
2. ✅ No orphaned documents (all files referenced in index documents)
3. ✅ No broken internal links in DOCS_INDEX.md
4. ✅ Full verification suite passes

**Scripts executed**:
```bash
npm run verify:docs:status    # Verify status tags
npm run verify:docs:orphans   # Check for orphaned documents
npm run verify:docs:links     # Validate internal links
npm run verify:docs           # Run all verifications
```

**On failure**:
- ❌ PR check fails
- 💬 Bot comments on PR with failure notice
- 📄 Verification report uploaded as artifact

**Local testing**:
Before pushing changes to documentation, run locally:
```bash
npm run verify:docs
```

**Requirements**:
- Node.js 20
- All dependencies in `package.json`
- Verification scripts in `scripts/verify-*.mjs`

---

### Comprehensive Verification (`verify-comprehensive.yml`)

**Purpose**: Verify database schema, API contracts, and code health consistency.

**Status**: ⏱️ Active (informational check, not blocking)

**Triggers**:
- Pushes to `main` or `develop` branches
- Pull requests
- Changes to:
  - Database migrations (`supabase/migrations/**`)
  - API routes (`src/app/api/**`)
  - Type definitions (`src/lib/types/**`)
  - Components (`src/components/**`)
  - Library code (`src/lib/**`)
  - Verification scripts

**What it checks**:
1. 🗄️ **Schema & RLS Drift** - Database schema matches documentation and types
2. 🔌 **API Contract Compliance** - APIs match documentation and frontend usage
3. 🧹 **Code Health** - No orphaned components or anti-patterns

**Scripts executed**:
```bash
npm run verify:schema   # Database schema verification
npm run verify:api      # API contract verification
npm run verify:code     # Code health check
```

**On failure**:
- ⚠️ PR receives failure comment with details
- 📄 Verification reports uploaded as artifacts
- Note: Currently informational only (doesn't block merges)

**Local testing**:
Before pushing changes:
```bash
npm run verify:schema   # After migration changes
npm run verify:api      # After API changes
npm run verify:code     # Periodic code health check
npm run verify:all      # Run everything
```

**Making it required**:
To make this a blocking check:
1. Go to **Settings** → **Branches** → **Branch protection rules**
2. Edit rule for `main` branch
3. Add required status check: `Schema, API & Code Verification`

---

## Adding New Workflows

When adding new workflows:
1. Create a new `.yml` file in this directory
2. Follow GitHub Actions syntax
3. Document it in this README
4. Test locally if possible
5. Monitor first runs in GitHub Actions tab

---

**Last Updated**: December 12, 2025  
**Maintainer**: POSTD Development Team

