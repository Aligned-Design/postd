> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# Release Checklist

**Last Updated**: December 12, 2025  
**Purpose**: Comprehensive pre-release verification checklist for POSTD

This checklist ensures every release meets quality standards before deployment to production.

---

## 📋 Pre-Release Verification

Run these checks **before every release** to production or staging environments.

### 1️⃣ Automated Verification Suite

Run all verification scripts to ensure zero drift:

```bash
# Run all verifications at once
npm run verify:all
```

Or run individually for detailed output:

```bash
# Documentation verification
npm run verify:docs

# Database schema & RLS consistency
npm run verify:schema

# API contract compliance
npm run verify:api

# Code health & quality
npm run verify:code
```

**Success Criteria**: All checks must pass with 0 errors (warnings are acceptable if documented)

---

### 2️⃣ Code Quality Checks

Ensure code meets quality standards:

```bash
# TypeScript type checking
npm run typecheck

# ESLint checks
npm run lint

# Code formatting (optional - auto-fix)
npm run format
```

**Success Criteria**: No TypeScript errors, no ESLint errors

---

### 3️⃣ Automated Tests

Run the full test suite:

```bash
# Run all Playwright tests
npm test

# Optional: Run with UI for debugging
npm run test:ui

# Optional: Run headed mode to see browser
npm run test:headed
```

**Success Criteria**: All tests pass

---

### 4️⃣ E2E Smoke Test (Manual)

Perform a manual smoke test of critical paths:

#### Dev Mode Flow
```
1. ✅ Start application: npm run dev
2. ✅ Verify dev mode enabled (check for dev badge)
3. ✅ Navigate to /app (should auto-login in dev mode)
4. ✅ Verify dev workspace shown in header
5. ✅ Verify all pages load without errors
```

#### Authentication Flow
```
1. ✅ Disable dev mode (NEXT_PUBLIC_DEV_MODE_ENABLED=false)
2. ✅ Visit landing page (http://localhost:3000)
3. ✅ Click "Get Started" or "Log In"
4. ✅ Sign up with new email (or login with existing)
5. ✅ Verify redirect to /app after authentication
6. ✅ Verify user email shown in header
7. ✅ Verify workspace name displayed
```

#### Website Ingestion Flow
```
1. ✅ Navigate to /app/ingest
2. ✅ Enter a website URL (e.g., https://example.com)
3. ✅ Click "Connect Website"
4. ✅ Verify crawling starts (loading state)
5. ✅ Wait for completion (should show crawled pages)
6. ✅ Verify pages displayed with titles and URLs
7. ✅ Check console for no errors
```

#### Error Handling
```
1. ✅ Try invalid URL in website ingestion (should show error)
2. ✅ Try accessing /app without auth (should redirect to login)
3. ✅ Verify 404 page works
```

**Success Criteria**: All critical paths work without errors or unexpected behavior

---

### 5️⃣ Environment Variables Check

Verify all required environment variables are set for the target environment:

#### Local Development (`.env.local`)
```bash
# Check these exist and are valid
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ NEXT_PUBLIC_DEV_MODE_ENABLED (true for dev, false for prod)
```

#### Production (Vercel)
```
1. ✅ Go to Vercel project settings
2. ✅ Navigate to Environment Variables
3. ✅ Verify these are set for Production:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_DEV_MODE_ENABLED=false (CRITICAL)
4. ✅ Verify no sensitive keys are exposed as NEXT_PUBLIC_*
```

#### Supabase (Production)
```
1. ✅ Go to Supabase project settings
2. ✅ Verify API keys are valid and not expired
3. ✅ Verify database is accessible
4. ✅ Check RLS policies are enabled (all 4 tables)
5. ✅ Verify auth providers are configured
6. ✅ Check email templates are set (if using magic links)
```

**Success Criteria**: All environment variables correct for target environment

---

### 6️⃣ Database Health Check

Verify database state is production-ready:

```bash
# Check migrations are applied
# Log into Supabase dashboard → SQL Editor

-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: workspaces, workspace_members, sources, crawled_pages

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All should have rowsecurity = true

-- Count policies per table
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename;
-- Should see policies for all tables
```

**Success Criteria**: All tables exist, RLS enabled, policies in place

---

### 7️⃣ Security Audit

Perform a quick security review:

```
✅ Dev mode disabled in production (NEXT_PUBLIC_DEV_MODE_ENABLED=false)
✅ No API keys or secrets in client code
✅ All API routes use authenticateRequest() or dev mode conditionals
✅ All workspace-scoped routes verify membership
✅ No console.log with sensitive data
✅ RLS enabled on all multi-tenant tables
✅ No hardcoded credentials in codebase
✅ .env files in .gitignore
```

**Success Criteria**: All security checks pass

---

### 8️⃣ Performance Check (Optional)

Quick performance verification:

```
✅ Landing page loads in < 2s
✅ App dashboard loads in < 3s
✅ Website crawl completes for 10 pages in < 30s
✅ No console errors or warnings
✅ No memory leaks (use browser dev tools)
```

---

## 🚀 Deployment Steps

### Staging Deployment

1. **Merge to `develop` branch**
   ```bash
   git checkout develop
   git merge feature-branch
   git push origin develop
   ```

2. **Verify CI/CD passes**
   - Check GitHub Actions tab
   - Ensure all workflows pass

3. **Deploy to staging** (if configured)
   - Trigger Vercel preview deployment
   - Run smoke tests on staging URL

4. **Review and test**
   - Manual QA on staging
   - Verify all checklist items

### Production Deployment

1. **Merge to `main` branch**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Verify CI/CD passes**
   - All required checks must pass
   - Documentation verification ✅
   - Comprehensive verification ✅

3. **Tag release**
   ```bash
   git tag -a v1.2.0 -m "Release v1.2.0: Website ingestion feature"
   git push origin v1.2.0
   ```

4. **Monitor deployment**
   - Check Vercel deployment status
   - Monitor logs for errors
   - Verify production URL loads

5. **Post-deployment verification**
   - Run smoke tests on production
   - Check Supabase logs
   - Verify no error spikes in monitoring

---

## 📊 Release Sign-Off

Before declaring release complete, confirm:

- [ ] All automated verifications passed
- [ ] All tests passed
- [ ] Manual smoke test completed successfully
- [ ] Environment variables verified for production
- [ ] Database health checked
- [ ] Security audit completed
- [ ] No console errors in production
- [ ] Performance acceptable
- [ ] CI/CD workflows all passed
- [ ] Documentation updated (if needed)
- [ ] Release notes prepared (if needed)

---

## 🐛 What If Something Fails?

### Automated Verification Fails

**Problem**: `npm run verify:all` fails

**Solution**:
1. Check which specific verification failed
2. Run that verification individually for details
3. See `docs/development/VERIFICATION_GUIDE.md` for troubleshooting
4. Fix the issue and re-run
5. Do NOT deploy until all verifications pass

### Tests Fail

**Problem**: `npm test` fails

**Solution**:
1. Run `npm run test:headed` to see what's failing
2. Fix the failing test or the code
3. Ensure test reflects expected behavior
4. Re-run until all pass
5. Do NOT deploy with failing tests

### Smoke Test Fails

**Problem**: Manual testing reveals issues

**Solution**:
1. Document the exact reproduction steps
2. Create a bug report
3. Fix the issue
4. Re-run full checklist
5. Do NOT deploy until smoke test passes

### Environment Variable Issue

**Problem**: Wrong env vars in production

**Solution**:
1. Update Vercel environment variables
2. Redeploy (Vercel will pick up new vars)
3. Verify via deployment logs
4. Re-run smoke tests

### Database Issue

**Problem**: Missing migrations or RLS problems

**Solution**:
1. Check migration status in Supabase
2. Run missing migrations manually
3. Verify RLS policies with SQL queries
4. Test with real user account
5. See `supabase/README.md` for troubleshooting

---

## 📅 Release Schedule

**Recommended Cadence**:
- **Bug fixes**: As needed (hotfix process)
- **Minor features**: Weekly or bi-weekly
- **Major features**: Monthly or per phase completion

**Best Practices**:
- Release early in the week (Monday-Wednesday)
- Avoid Friday deployments
- Have monitoring in place
- Have rollback plan ready

---

## 🔄 Rollback Procedure

If a release causes critical issues:

1. **Immediate**: Revert in Vercel
   - Go to Vercel dashboard → Deployments
   - Find previous stable deployment
   - Click "Promote to Production"

2. **Git**: Revert the merge
   ```bash
   git revert -m 1 <merge-commit-hash>
   git push origin main
   ```

3. **Notify**: Inform team of rollback

4. **Fix**: Address issue in develop branch

5. **Re-release**: Follow full checklist again

---

## 📝 Release Notes Template

```markdown
## Release vX.Y.Z - YYYY-MM-DD

### New Features
- Feature 1 description
- Feature 2 description

### Bug Fixes
- Fix 1 description
- Fix 2 description

### Improvements
- Improvement 1
- Improvement 2

### Database Changes
- Migration XXX: Description

### Breaking Changes (if any)
- Breaking change description
- Migration path

### Known Issues
- Issue 1 (workaround if available)
```

---

## 🎓 Tips for Smooth Releases

1. **Run checklist early** - Don't wait until release day
2. **Fix issues incrementally** - Address verification failures as they appear
3. **Test in staging first** - Catch issues before production
4. **Monitor after deploy** - Watch logs for first 30 minutes
5. **Keep rollback ready** - Know how to revert quickly
6. **Document changes** - Update docs with new features
7. **Communicate** - Let team know about releases

---

## 📞 Support

**Questions about checklist**: See `docs/development/VERIFICATION_GUIDE.md`  
**Deployment issues**: Check Vercel dashboard and logs  
**Database issues**: See `supabase/README.md`  
**CI/CD issues**: Check `.github/workflows/README.md`

---

**Last Verified**: December 12, 2025  
**Checklist Version**: 1.0  
**Maintained By**: POSTD Development Team

---

*This checklist ensures consistent, high-quality releases. Follow it every time, no exceptions.*

