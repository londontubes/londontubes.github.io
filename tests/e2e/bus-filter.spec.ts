import { expect, test } from '@playwright/test'

test.describe('Bus page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bus/')
  })

  test('renders bus page title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Bus Map/i)
    await expect(page.locator('h1')).toContainText('London Bus Routes')
  })

  test('marks Bus Filter link as current page', async ({ page }) => {
    const tab = page.getByRole('link', { name: 'Bus Filter' })
    await expect(tab).toHaveAttribute('aria-current', 'page')
  })

  test('shows bus network stats and route filter controls', async ({ page }) => {
    await expect(page.getByTestId('bus-network-stats')).toContainText('routes')
    const filterNav = page.getByRole('navigation', { name: 'Bus route filter' })
    await expect(filterNav).toBeVisible()
    const routeSelect = filterNav.getByRole('combobox', { name: 'Bus route' })
    await expect(routeSelect).toHaveValue('')
    await expect(page.getByText('Select one route to overlay it clearly across London.')).toBeVisible()
    await expect(page.getByText('Bus Time')).toBeVisible()
  })

  test('selects a bus route and updates summary state', async ({ page }) => {
    const filterNav = page.getByRole('navigation', { name: 'Bus route filter' })
    const routeSelect = filterNav.getByRole('combobox', { name: 'Bus route' })
    const stats = page.getByTestId('bus-network-stats')

    await routeSelect.selectOption({ index: 1 })

    await expect(routeSelect).not.toHaveValue('')
    await expect(stats).toContainText('1 visible')
  })
})