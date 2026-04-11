import { test, expect } from '@playwright/test'

test.describe('Home page — line filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders page title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/London Tube/)
    // Use locator('h1') to find the heading regardless of CSS visibility
    // (the header is display:none on mobile ≤640px viewports)
    await expect(page.locator('h1')).toContainText('London Tube')
  })

  test('shows network stats with station and line counts', async ({ page }) => {
    // The stats element is CSS-hidden on mobile (≤640px) but always present in the DOM
    const stats = page.getByTestId('network-stats')
    await expect(stats).toBeAttached()
    await expect(stats).toContainText('stations')
    await expect(stats).toContainText('lines')
  })

  test('renders navigation tabs', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('tab', { name: 'Line Filter' })).toBeVisible()
    await expect(nav.getByRole('tab', { name: 'Universities Filter' })).toBeVisible()
  })

  test('line filter nav is present with All Lines button pressed by default', async ({ page }) => {
    const filterNav = page.getByRole('navigation', { name: 'Line filter' })
    await expect(filterNav).toBeVisible()

    const allLinesBtn = filterNav.getByRole('button', { name: 'All Lines' })
    await expect(allLinesBtn).toBeVisible()
    await expect(allLinesBtn).toHaveAttribute('aria-pressed', 'true')

    // At least one individual line button should exist
    const lineButtons = filterNav.getByRole('button').filter({ hasNotText: 'All Lines' })
    await expect(lineButtons.first()).toBeVisible()
  })

  test('clicking a line button selects it and deactivates All Lines', async ({ page }) => {
    const filterNav = page.getByRole('navigation', { name: 'Line filter' })
    const allLinesBtn = filterNav.getByRole('button', { name: 'All Lines' })
    const firstLine = filterNav.getByRole('button').filter({ hasNotText: 'All Lines' }).first()

    await firstLine.click()

    await expect(firstLine).toHaveAttribute('aria-pressed', 'true')
    await expect(allLinesBtn).toHaveAttribute('aria-pressed', 'false')
  })

  test('network stats summary updates after selecting a line', async ({ page }) => {
    const filterNav = page.getByRole('navigation', { name: 'Line filter' })
    const stats = page.getByTestId('network-stats')

    await expect(stats).toContainText('All lines')

    await filterNav.getByRole('button').filter({ hasNotText: 'All Lines' }).first().click()

    await expect(stats).not.toContainText('All lines')
  })

  test('clicking All Lines resets the filter', async ({ page }) => {
    const filterNav = page.getByRole('navigation', { name: 'Line filter' })
    const allLinesBtn = filterNav.getByRole('button', { name: 'All Lines' })

    await filterNav.getByRole('button').filter({ hasNotText: 'All Lines' }).first().click()
    await expect(allLinesBtn).toHaveAttribute('aria-pressed', 'false')

    await allLinesBtn.click()
    await expect(allLinesBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('network-stats')).toContainText('All lines')
  })

  test('selecting two lines shows "2 lines selected" in stats', async ({ page }) => {
    const filterNav = page.getByRole('navigation', { name: 'Line filter' })
    const lineButtons = filterNav.getByRole('button').filter({ hasNotText: 'All Lines' })

    await lineButtons.nth(0).click()
    await lineButtons.nth(1).click()

    await expect(page.getByTestId('network-stats')).toContainText('2 lines selected')
  })

  test('Line Filter tab is marked as current page', async ({ page }) => {
    const tab = page.getByRole('tab', { name: 'Line Filter' })
    await expect(tab).toHaveAttribute('aria-current', 'page')
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  })
})

test.describe('Universities page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/universities/')
  })

  test('renders page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/universit/i)
  })

  test('Universities Filter tab is marked as current page', async ({ page }) => {
    const tab = page.getByRole('tab', { name: 'Universities Filter' })
    await expect(tab).toHaveAttribute('aria-current', 'page')
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  })

  test('line filter is rendered', async ({ page, viewport }) => {
    // On mobile (≤640px) the line filter is CSS-hidden in university experience
    const filterNav = page.locator('nav[aria-label="Line filter"]')
    await expect(filterNav).toBeAttached()
    if (viewport && viewport.width > 640) {
      await expect(filterNav).toBeVisible()
      await expect(filterNav.getByRole('button', { name: 'All Lines' })).toBeVisible()
    }
  })

  test('shows instruction text before a university is selected', async ({ page }) => {
    await expect(page.getByText('Tap a university to begin.')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('navigates from home to universities page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: 'Universities Filter' }).click()
    await expect(page).toHaveURL('/universities/')
    await expect(page.getByRole('tab', { name: 'Universities Filter' })).toHaveAttribute('aria-current', 'page')
  })

  test('navigates from universities back to home', async ({ page }) => {
    await page.goto('/universities/')
    await page.getByRole('tab', { name: 'Line Filter' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('tab', { name: 'Line Filter' })).toHaveAttribute('aria-current', 'page')
  })

  test('feedback link is present in navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Feedback' })).toBeVisible()
  })
})
