import { launch, killAll } from 'chrome-launcher'
import { spawn } from 'child_process'
import { readFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

const defaultRemoteDebuggingPort = 9222

interface Display {
  w: number
  h: number
  p: number
}

const formatDisplay = (display: string): Display | undefined => {
  const sizeRegex = /(\d+)x(\d+)/
  const positionRegex = /\+(\d+)/
  const sizeMatch = display.match(sizeRegex)
  const positionMatch = display.match(positionRegex)
  if (sizeMatch && positionMatch) {
    const width = parseInt(sizeMatch[1])
    const height = parseInt(sizeMatch[2])
    const position = parseInt(positionMatch[1])
    return { w: width, h: height, p: position }
  } else {
    return undefined
  }
}

const displayList = ((): Array<Display> => {
  const display_1 = process.env.DISPLAY_1 || ''
  const display_2 = process.env.DISPLAY_2 || ''

  return [display_1, display_2]
    .map((value) => formatDisplay(value))
    .filter((value) => value !== undefined) as Display[]
})()

const createFlags = (
  display: Display,
  remoteDebuggingPort,
  debug: 'local' | 'remote' | undefined,
) => {
  const positionFlags = [
    `--window-size=${display.w},${display.h}`,
    `--window-position=${display.p},0`,
  ]
  const baseFlags = [
    '--check-for-update-interval=31536000',
    '--disable-background-mode',
    '--autoplay-policy=no-user-gesture-required',
  ]
  const gpuFlags = [
    '--ignore-gpu-blacklist',
    '--enable-gpu-rasterization',
    '--enable-zero-copy',
  ]
  const corsFlags = [
    '--disable-web-security',
    '--disable-site-isolation-trials',
  ]
  switch (debug) {
    case 'local':
      return [
        ...positionFlags,
        ...baseFlags,
        ...gpuFlags,
        ...corsFlags,
        '--auto-open-devtools-for-tabs',
      ]
    case 'remote':
      return [
        ...positionFlags,
        ...baseFlags,
        ...gpuFlags,
        ...corsFlags,
        '--headless',
        '--remote-debugging-address=0.0.0.0',
        `--remote-debugging-port=${remoteDebuggingPort}`,
      ]
    default:
      return [
        ...positionFlags,
        ...baseFlags,
        ...gpuFlags,
        ...corsFlags,
        '--kiosk',
      ]
  }
}

const launchDisplay = async (debug?: 'local' | 'remote') => {
  killAll()
  const promises = displayList.map(async (display, index) => {
    // if you only set LAUNCH_URL_1 and start as dual display, the display will set as mirror mode
    const url =
      process.env[`LAUNCH_URL_${index + 1}`] ||
      process.env.LAUNCH_URL_1 ||
      'https://example.com'
    const startingUrl = debug ? url : `--app=${url}`
    const remoteDebuggingPort = defaultRemoteDebuggingPort + index
    const flags = createFlags(display, remoteDebuggingPort, debug)
    await launch({
      startingUrl: startingUrl,
      port: debug === 'remote' ? remoteDebuggingPort : undefined,
      chromeFlags: flags,
      userDataDir: `/chromium/display${index + 1}`,
      ignoreDefaultFlags: true,
    })
    console.log(`Chromium launched with flags: ${flags}`)
    debug === 'remote'
      ? console.log(`Remote debugging port: ${remoteDebuggingPort}`)
      : null
    return remoteDebuggingPort
  })
  return await Promise.all(promises)
}
const startKiosk = async () => {
  await launchDisplay()
  return
}
const startLocalDebug = async () => {
  await launchDisplay('local')
  return
}
const startRemoteDebug = async () => {
  return await launchDisplay('remote')
}

const takeScreenshot = async (): Promise<Buffer | undefined> => {
  const fileName = 'screenshot.png'
  const filePath = path.join(os.tmpdir(), fileName)
  try {
    const child = spawn('scrot', [filePath])

    const statusCode = await new Promise((res, rej) => {
      child.on('close', res)
    })
    if (statusCode != 0) {
      console.error('Screenshot command exited with non-zero return code.')
      return
    }

    const fileContents = await readFile(filePath)
    return fileContents
  } catch (e) {
    console.error('Error occurred in screenshot code.', e)
  } finally {
    try {
      await unlink(filePath)
    } catch (e) {
      console.error('Unlink failed.', e)
    }
  }
}

export { startKiosk, startLocalDebug, startRemoteDebug, takeScreenshot }
