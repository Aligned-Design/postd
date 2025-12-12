import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('Loads the public landing page', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // The page should load with 200 OK
    await expect(page).toHaveURL(/\/$/)

    // It should NOT show the internal app layout
    await expect(page.getByText('Welcome to POSTD', { exact: false })).not.toBeVisible()

    // It SHOULD show the public marketing content
    await expect(page.locator('h1')).toContainText('Marketing content that's')
    await expect(page.locator('h1')).toContainText('always on-brand')

    // Check for POSTD branding
    await expect(page.getByText('POSTD', { exact: true }).first()).toBeVisible()

    // Check for auth buttons
    await expect(page.getByRole('button', { name: /log in|sign up/i })).toBeVisible()

    // Check for Get Started button
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()

    // Check for feature cards
    await expect(page.getByText('Connect Your Website')).toBeVisible()
    await expect(page.getByText('Link Social Accounts')).toBeVisible()
    await expect(page.getByText('Generate On-Brand Content')).toBeVisible()
  })

  test('Get Started button links to login page', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Click the Get Started button
    await page.getByRole('link', { name: /get started/i }).click()

    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('Header Log in button links to login page', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Click the Log in / Sign up button in header
    await page.getByRole('button', { name: /log in.*sign up/i }).click()

    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('Shows all three feature cards', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // All feature cards should be visible
    const featureCards = [
      'Connect Your Website',
      'Link Social Accounts',
      'Generate On-Brand Content',
    ]

    for (const feature of featureCards) {
      await expect(page.getByText(feature)).toBeVisible()
    }
  })

  test('Footer displays copyright', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Footer should show copyright
    await expect(page.getByText(/© 2025 POSTD/)).toBeVisible()
  })
})

