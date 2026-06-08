import { expect, test } from '@playwright/test'
import { mockEdumindApi } from './fixtures'

test.use({ serviceWorkers: 'block' })

test.beforeEach(async ({ page }) => {
  await mockEdumindApi(page)
})

test('flujo alumno: pide ayuda a la IA local, inserta codigo y lo ejecuta en el simulador', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'EDUmind Robotics Lab' })).toBeVisible()
  await page.getByRole('button', { name: /Abrir Laboratorio/ }).click()

  await expect(page.getByText(/IA local y privacidad/)).toBeVisible()
  await expect(page.getByRole('heading', { name: /Tutor EDUmind/ })).toBeVisible()

  await page.getByPlaceholder(/Escribe tu pregunta o solicitud/).fill('Genera un corazon para micro:bit')
  await page.getByPlaceholder(/Escribe tu pregunta o solicitud/).press('Enter')

  await expect(page.getByText(/display\.show\(Image\.HEART\)/)).toBeVisible()
  await page.getByRole('button', { name: /Insertar código/ }).click()
  await page.getByTestId('execute-code').click()

  await expect(page.getByTestId('led-2-2')).toHaveCSS('background-color', 'rgb(255, 51, 51)')
  await expect(page.getByTestId('led-2-2')).toHaveCSS('opacity', '1')
})

test('flujo docente: carga ejemplo, guarda proyecto local y exporta paquete para hardware real', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Abrir Laboratorio/ }).click()

  await page.getByRole('button', { name: /Ejemplos/ }).click()
  await expect(page.getByText('Corazon E2E')).toBeVisible()
  await page.getByText('Corazon E2E').click()
  await page.getByRole('button', { name: /Usar este código/ }).click()

  await page.getByRole('button', { name: 'Proyectos' }).click()
  await page.getByRole('button', { name: /Guardar proyecto actual/ }).click()
  await page.getByPlaceholder(/Nombre del proyecto/).fill('Sesion microbit Nezha')
  await page.locator('.save-modal').getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByText('Sesion microbit Nezha')).toBeVisible()
  await page.getByRole('button', { name: 'Proyectos' }).click()

  await page.getByRole('button', { name: /Exportar/ }).click()
  await page.getByLabel('Hardware objetivo').selectOption('nezha')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Paquete hardware real/ }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe('e2e_hardware_bundle.zip')
})
