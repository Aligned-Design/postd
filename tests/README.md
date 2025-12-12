> **STATUS: 🟢 CANONICAL**  
> This document is current and treated as a source of truth.

# POSTD End-to-End Tests

This directory contains Playwright tests for POSTD.

## Setup

1. **Install Playwright**:
```bash
npm install
npx playwright install
```

2. **Start dev server** (if not already running):
```bash
npm run dev
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run specific test file
```bash
npx playwright test tests/landing-page.spec.ts
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

## Test Files

- **`landing-page.spec.ts`** - Tests for the public landing page
  - Verifies landing page loads
  - Checks marketing content is visible
  - Tests navigation to login page
  - Validates feature cards

## Writing Tests

### Structure
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Your test assertions
    await expect(page.getByText('Some Text')).toBeVisible()
  })
})
```

### Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for elements**: Use `await expect(...).toBeVisible()` instead of manual waits
3. **Test user flows**: Test complete user journeys, not just individual elements
4. **Keep tests independent**: Each test should be able to run in isolation
5. **Clean up**: Tests should not leave side effects that affect other tests

## Viewing Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## CI/CD

Tests are configured to:
- Run in headless mode on CI
- Retry failed tests twice on CI
- Generate HTML reports
- Start dev server automatically before tests

## Configuration

See `playwright.config.ts` for:
- Test directory
- Browser configurations
- Timeout settings
- Reporter options
- Web server settings

## Troubleshooting

### "Timeout waiting for http://localhost:3000"
- Ensure dev server is not already running on port 3000
- Or set `reuseExistingServer: true` in config

### "Cannot find module '@playwright/test'"
- Run: `npm install`
- Then: `npx playwright install`

### Tests fail on CI but pass locally
- Check CI environment has necessary permissions
- Verify all dependencies are installed
- Review CI logs for specific errors

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)

