import { Hono } from 'hono/tiny'
import { serve } from '@hono/node-server'
import {
  startKiosk,
  startLocalDebug,
  startRemoteDebug,
  takeScreenshot,
} from './display'

const app = new Hono()
app.get('/', (c) =>
  c.text(
    'Display Server! see: https://github.com/taro-ishihara/balena-display',
  ),
)
app.get('/restart', async (c) => {
  await startKiosk()
  return c.text(`Restarted.`)
})
app.get('/localdebug', async (c) => {
  await startLocalDebug()
  return c.text(`Local debug started.`)
})
app.get('/remotedebug', async (c) => {
  const remoteDebuggingPorts = await startRemoteDebug()
  return c.text(`Remote debugging port(s): ${remoteDebuggingPorts.join(',')}`)
})
app.get('/screenshot', async (c) => {
  const image = await takeScreenshot()
  if (!image) {
    return c.text('Failed to capture.')
  }
  c.header('Content-Type', 'image/png')
  return c.body(image.buffer)
})

await startKiosk()

serve({
  fetch: app.fetch,
  port: 5678,
})

process.on('SIGINT', () => {
  process.exit()
})
