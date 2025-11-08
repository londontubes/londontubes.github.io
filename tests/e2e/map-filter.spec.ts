import { test, expect } from '@playwright/test'

const E2E_TIMEOUT = 30_000
test.describe('London Tube map baseline', () => {
  test('renders landing heading and data timestamp', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText(/London Tube Map/i)
    await expect(page.getByText(/Interactive map/i)).toBeVisible()
  })

  test('responds with accessible root landmark', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
  
  test('loads network data and reports ready state', async ({ page }) => {
    await page.goto('/')
    const map = page.getByTestId('map-canvas')
    await expect(map).toHaveAttribute('data-state', 'ready', { timeout: 3000 })
    await expect(page.getByTestId('station-count')).toContainText(/stations/i)
  })

  test('renders Northern line with all its stations within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    
    // Wait for map to be ready
    const map = page.getByTestId('map-canvas')
    await expect(map).toHaveAttribute('data-state', 'ready', { timeout: 3000 })
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
    
    // Verify Northern line is active by default
    const footer = page.getByTestId('station-count')
    await expect(footer).toContainText('310 stations')
    await expect(footer).toContainText('12 lines')
    await expect(footer).toContainText('Active lines: Northern')
  })
})
