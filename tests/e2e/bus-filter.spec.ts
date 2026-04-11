import { expect, test } from '@playwright/test'

test.describe('Bus page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bus/')
  })

  test('renders bus page title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Bus Map/i)
    await expect(page.locator('h1')).toContainText('London Bus Routes')
  })

  test('marks Bus Filter tab as current page', async ({ page }) => {
    const tab = page.getByRole('tab', { name: 'Bus Filter' })
    await expect(tab).toHaveAttribute('aria-current', 'page')
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  })

  test('shows bus network stats and route filter controls', async ({ page }) => {
    await expect(page.getByTestId('bus-network-stats')).toContainText('routes')
    const filterNav = page.getByRole('navigation', { name: 'Bus route filter' })
    await expect(filterNav).toBeVisible()
    const routeSelect = filterNav.getByRole('combobox', { name: 'Bus route' })
    await expect(routeSelect).toHaveValue('')
    await expect(filterNav).toContainText('Pick one route to overlay it clearly across London.')
    await expect(page.getByTestId('bus-time-filter')).toContainText('Bus Time')
  })

  test('selects a bus route and updates summary state', async ({ page }) => {
    const filterNav = page.getByRole('navigation', { name: 'Bus route filter' })
    const routeSelect = filterNav.getByRole('combobox', { name: 'Bus route' })

    await routeSelect.selectOption({ index: 1 })

    await expect(routeSelect).not.toHaveValue('')
    await expect(page.locator('.bus-route-summary')).toBeVisible()
  })
})