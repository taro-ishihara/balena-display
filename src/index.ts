import { Hono } from 'hono'
import { Launcher } from 'chrome-launcher'
import { serve } from '@hono/node-server'

const app = new Hono()
const launcher = new Launcher({
  startingUrl: 'https://google.com',
})

app.get('/', (c) => c.text('Hello Hono!'))
app.get('/launch', (c) => {
  launcher.launch()
  return c.text('launched')
})

serve({
  fetch: app.fetch,
  port: 5678,
})
