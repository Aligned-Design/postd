> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD Testing Setup

**Date**: November 19, 2025  
**Status**: ✅ **COMPLETE**

---

## 📋 Overview

End-to-end testing has been added to POSTD using Playwright. The landing page test suite verifies that public pages load correctly for logged-out users.

---

## 🎯 What Was Added

### Files Created

| File | Purpose |
|------|---------|
| `tests/landing-page.spec.ts` | Landing page test suite |
| `playwright.config.ts` | Playwright configuration |
| `tests/README.md` | Testing documentation |

### Files Modified

| File | Changes |
|------|---------|
| `package.json` | Added Playwright dependency + test scripts |
| `.gitignore` | Added Playwright output directories |
| `README.md` | Added testing section |

---

## 🧪 Test Coverage

### Landing Page Tests

**File**: `tests/landing-page.spec.ts`

1. **"Loads the public landing page"**
   - Verifies page loads at `/`
   - Checks that internal app content (Welcome to POSTD) is NOT visible
   - Confirms marketing content is present
   - Validates POSTD branding
   - Checks auth buttons exist
   - Verifies Get Started button
   - Confirms all three feature cards are visible

2. **"Get Started button links to login page"**
   - Clicks the Get Started button
   - Verifies navigation to `/login`

3. **"Header Log in button links to login page"**
   - Clicks the Log in / Sign up button in header
   - Verifies navigation to `/login`

4. **"Shows all three feature cards"**
   - Iterates through expected features
   - Confirms each is visible:
     - Connect Your Website
     - Link Social Accounts
     - Generate On-Brand Content

5. **"Footer displays copyright"**
   - Checks for copyright text
   - Verifies footer is visible

---

## 🚀 Running Tests

### First Time Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run Tests

```bash
# Run all tests (headless)
npm test

# Run with UI (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test tests/landing-page.spec.ts

# Debug mode
npx playwright test --debug
```

### View Reports

```bash
# After tests run, open HTML report
npx playwright show-report
```

---

## ⚙️ Configuration

### Playwright Config (`playwright.config.ts`)

**Key Settings**:
- **Test Directory**: `./tests`
- **Base URL**: `http://localhost:3000`
- **Browser**: Chromium (default)
- **Parallel**: Tests run in parallel
- **Retries**: 2 retries on CI, 0 locally
- **Web Server**: Automatically starts dev server before tests
- **Timeout**: 120 seconds to start server

**Web Server Auto-Start**:
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```

This means:
- Tests automatically start the dev server
- No need to run `npm run dev` separately
- Server is reused if already running (locally)
- Fresh server on CI

---

## 📝 Writing New Tests

### Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Navigate
    await page.goto('http://localhost:3000/some-page')
    
    // Interact
    await page.getByRole('button', { name: 'Click Me' }).click()
    
    // Assert
    await expect(page).toHaveURL(/\/result/)
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

### Best Practices

1. **Use Semantic Selectors**
   ```typescript
   // Good
   page.getByRole('button', { name: 'Submit' })
   page.getByLabel('Email')
   page.getByText('Welcome')
   
   // Avoid
   page.locator('.btn-submit')
   page.locator('#email-input')
   ```

2. **Wait Properly**
   ```typescript
   // Good
   await expect(page.getByText('Loaded')).toBeVisible()
   
   // Avoid
   await page.waitForTimeout(5000)
   ```

3. **Test User Journeys**
   - Test complete flows, not just isolated elements
   - Example: Login → Dashboard → Feature → Logout

4. **Keep Tests Independent**
   - Each test should set up its own state
   - Don't rely on order of execution

---

## 🔍 Selector Guide

### Priority (Most to Least Preferred)

1. **By Role**: `getByRole('button', { name: 'Submit' })`
2. **By Label**: `getByLabel('Email address')`
3. **By Placeholder**: `getByPlaceholder('Enter email')`
4. **By Text**: `getByText('Welcome back')`
5. **By Test ID**: `getByTestId('submit-button')`
6. **CSS Selector**: `locator('.btn-primary')` (last resort)

### Examples

```typescript
// Buttons
await page.getByRole('button', { name: /submit/i }).click()

// Links
await page.getByRole('link', { name: 'Learn More' }).click()

// Text inputs
await page.getByLabel('Email').fill('user@example.com')

// Checkboxes
await page.getByRole('checkbox', { name: 'Remember me' }).check()

// Headings
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

// Any text
await expect(page.getByText('Welcome back')).toBeVisible()
```

---

## 🎨 Test Organization

### Directory Structure

```
tests/
├── README.md                    # Testing documentation
├── landing-page.spec.ts         # Landing page tests
├── login.spec.ts               # (future) Login flow tests
├── dashboard.spec.ts           # (future) Dashboard tests
└── fixtures/                   # (future) Test fixtures
```

### Naming Conventions

- **Files**: `feature-name.spec.ts`
- **Test suites**: `test.describe('Feature Name', () => {...})`
- **Tests**: `test('should do specific thing', async ({ page }) => {...})`

---

## 🚦 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module '@playwright/test'"

**Solution**:
```bash
npm install
npx playwright install
```

#### "Timeout waiting for http://localhost:3000"

**Causes**:
- Dev server not starting
- Port 3000 already in use
- Environment variables missing

**Solutions**:
```bash
# Kill existing process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in playwright.config.ts
baseURL: 'http://localhost:3001'
```

#### "Tests pass locally but fail on CI"

**Common causes**:
- Missing environment variables
- Different screen sizes
- Race conditions
- CI-specific permissions

**Solutions**:
- Add environment variables to CI
- Set explicit viewport size
- Add proper waits
- Review CI logs for specific errors

#### "Browser not installed"

**Solution**:
```bash
npx playwright install chromium
```

---

## 📊 Current Test Results

### Landing Page Suite

- ✅ Loads the public landing page
- ✅ Get Started button links to login page
- ✅ Header Log in button links to login page
- ✅ Shows all three feature cards
- ✅ Footer displays copyright

**Total**: 5 tests  
**Status**: All passing ✅

---

## 🎯 Future Test Coverage

### Planned Test Suites

1. **Authentication** (`login.spec.ts`)
   - Email/password login
   - Magic link flow
   - Sign up
   - Logout
   - Session persistence

2. **Dashboard** (`dashboard.spec.ts`)
   - Loads for authenticated users
   - Shows workspace name
   - Displays feature cards
   - Navigation works

3. **Website Connection** (`website-connector.spec.ts`)
   - Add website form
   - Triggers crawl
   - Shows crawled pages
   - Error handling

4. **Multi-tenancy** (`workspaces.spec.ts`)
   - Create workspace
   - Switch workspace
   - Workspace isolation

5. **Error Handling** (`errors.spec.ts`)
   - No database migrations
   - Invalid URLs
   - Network failures
   - Session expiration

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Test Reporters](https://playwright.dev/docs/test-reporters)

---

## ✅ Summary

**Testing Framework**: Playwright  
**Test Suites**: 1 (Landing Page)  
**Total Tests**: 5  
**Status**: ✅ All passing  
**CI Ready**: Yes  
**Documentation**: Complete

The testing infrastructure is production-ready and can be extended to cover more features as they're developed!

---

**Report Generated**: November 19, 2025  
**All Tests Passing**: ✅  
**Ready for CI/CD**: ✅

