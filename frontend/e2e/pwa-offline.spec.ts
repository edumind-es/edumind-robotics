import { expect, test } from '@playwright/test'
import { mockEdumindApi } from './fixtures'

test.beforeEach(async ({ page }) => {
  await mockEdumindApi(page)
})

test('PWA: la aplicacion vuelve a cargar offline despues de una primera visita online', async ({ page, context }) => {
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { name: 'EDUmind Robotics Lab' })).toBeVisible()
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service worker no disponible en este navegador')
    }

    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true })
      })
    }
  })

  await page.reload({ waitUntil: 'networkidle' })
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'EDUmind Robotics Lab' })).toBeVisible()
  await expect(page.getByText(/IA local y privacidad/)).toBeVisible()

  await context.setOffline(false)
})
