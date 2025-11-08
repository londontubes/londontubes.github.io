import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility audit', () => {
  test('homepage has no critical violations on initial load', async ({ page }) => {
    await page.goto('/')
    
    // Wait for map to be ready
    const map = page.getByTestId('map-canvas')
    await expect(map).toHaveAttribute('data-state', 'ready', { timeout: 5000 })
    
    const accessibilityScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = accessibilityScan.violations.filter(
      violation => violation.impact === 'critical'
    )

    expect(criticalViolations).toEqual([])
  })
  
  test('Northern line map view is keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Wait for map ready
    await expect(page.getByTestId('map-canvas')).toHaveAttribute('data-state', 'ready', { timeout: 5000 })
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Verify focus is within main content
    const focusedElement = await page.evaluateHandle(() => document.activeElement)
    const tagName = await focusedElement.evaluate(el => el?.tagName.toLowerCase())
    
    // Should be able to tab to interactive elements (buttons, links, etc.)
    expect(['button', 'a', 'input']).toContain(tagName)
  })
})
