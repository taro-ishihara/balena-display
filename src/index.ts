import { Hono } from 'hono'
import { launch, killAll } from 'chrome-launcher'
import { serve } from '@hono/node-server'

const app = new Hono()
app.get('/', (c) => c.text('Hello Hono Dayo!'))
app.get('/launch', async (c) => {
  await launch({
    startingUrl: '--app=https://google.com',
    chromeFlags: ['--window-position=0,0', '--kiosk'],
    userDataDir: '/chromium/display1',
    ignoreDefaultFlags: true,
  })
  await launch({
    startingUrl: '--app=https://google.com',
    chromeFlags: ['--window-position=1024,0', '--kiosk'],
    userDataDir: '/chromium/display2',
    ignoreDefaultFlags: true,
  })
  return c.text('launched')
})
app.get('/kill', (c) => {
  killAll()
  return c.text('killed')
})

serve({
  fetch: app.fetch,
  port: 5678,
})
