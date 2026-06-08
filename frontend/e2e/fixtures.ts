import type { Page } from '@playwright/test'

const heartGrid = [
  [0, 9, 0, 9, 0],
  [9, 9, 9, 9, 9],
  [9, 9, 9, 9, 9],
  [0, 9, 9, 9, 0],
  [0, 0, 9, 0, 0],
]

export const generatedCode = `from microbit import *

display.show(Image.HEART)
sleep(500)
display.clear()
`

export const mockEdumindApi = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.clear()
  })

  await page.route('**/api/system/policy', async (route) => {
    await route.fulfill({
      json: {
        mode: 'local-first',
        privacy: 'privacy-first',
        ai: {
          mode: 'local',
          privacy: 'privacy-first',
          ai_endpoint_local: true,
          model: 'phi3:latest',
          prompts_persisted: false,
        },
      },
    })
  })

  await page.route('**/api/simulator/session/create', async (route) => {
    await route.fulfill({
      json: {
        session_id: 'e2e-session',
        platform: 'micro:bit',
      },
    })
  })

  await page.route('**/api/simulator/execute', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        output_log: ['display.show(Image.HEART)'],
        error_log: [],
        state: {
          microbit: {
            display: { grid: heartGrid },
            buttons: {
              a: { state: 'released', pressed: false },
              b: { state: 'released', pressed: false },
            },
            sensors: {
              temperature: 22,
              light_level: 128,
              accelerometer: { x: 0, y: 0, z: -1024 },
            },
          },
        },
      },
    })
  })

  await page.route('**/api/code/templates**', async (route) => {
    await route.fulfill({
      json: {
        total: 1,
        templates: [
          {
            id: 'heart-e2e',
            title: 'Corazon E2E',
            description: 'Muestra un corazon en la matriz LED del micro:bit.',
            difficulty: 'beginner',
            platform: 'microbit',
            code: generatedCode,
            tags: ['display', 'led', 'microbit'],
            explanation: 'El alumnado revisa el codigo, lo ejecuta y observa la matriz.',
          },
        ],
      },
    })
  })

  await page.route('**/api/export/hardware-bundle', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'application/zip',
        'content-disposition': 'attachment; filename=e2e_hardware_bundle.zip',
      },
      body: 'PK-e2e-hardware-bundle',
    })
  })

  await page.route('**/api/chat/message/stream', async (route) => {
    const response = [
      `data: ${JSON.stringify(`Claro, revisa este codigo antes de ejecutarlo:\n\n\`\`\`python\n${generatedCode}\`\`\``)}`,
      'data: [DONE]',
      '',
    ].join('\n\n')

    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
      },
      body: response,
    })
  })
}
