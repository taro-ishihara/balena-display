import { launch, killAll } from 'chrome-launcher'
import { spawn } from 'child_process'
import { readFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

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

  return [display_1, display_2].map((value) => formatDisplay(value)).filter((value) => value !== undefined) as Display[]
})()

const launchDisplay = async (debug: boolean) => {
  killAll()

  const baseFlags = [
    '--check-for-update-interval=31536000',
    '--disable-background-mode',
    '--autoplay-policy=no-user-gesture-required',
    '--kiosk',
  ]
  const gpuFlags = ['--ignore-gpu-blacklist', '--enable-gpu-rasterization', '--enable-zero-copy']
  const corsFlags = ['--disable-web-security', '--disable-site-isolation-trials']
  const defaultRemoteDebuggingPort = 9222

  const promises = displayList.map(async (value, index) => {
    // if you only set LAUNCH_URL_1 and start as dual display, the display will set as mirror mode
    const url = process.env[`LAUNCH_URL_${index + 1}`] || process.env.LAUNCH_URL_1 || 'https://example.com'
    const startingUrl = debug ? url : `--app=${url}`
    const positionFlags = [`--window-size=${value.w},${value.h}`, `--window-position=${value.p},0`]
    const remoteDebuggingPort = defaultRemoteDebuggingPort + index
    const flags = debug
      ? [
          ...positionFlags,
          ...baseFlags.filter((value) => value !== '--kiosk'),
          ...gpuFlags,
          ...corsFlags,
          '--headless',
          '--remote-debugging-address=0.0.0.0',
          `--remote-debugging-port=${remoteDebuggingPort}`,
        ]
      : [...positionFlags, ...baseFlags, ...gpuFlags, ...corsFlags]
    await launch({
      startingUrl: startingUrl,
      port: debug ? remoteDebuggingPort : undefined,
      chromeFlags: flags,
      userDataDir: `/chromium/display${index + 1}`,
      ignoreDefaultFlags: true,
    })
    console.log(`Chromium launched with flags: ${flags}`)
    debug ? console.log(`Remote debugging port: ${remoteDebuggingPort}`) : null
    return remoteDebuggingPort
  })
  return await Promise.all(promises)
}
const startKiosk = async () => {
  await launchDisplay(false)
  return
}
const startDebug = async () => {
  return await launchDisplay(true)
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

export { startKiosk, startDebug, takeScreenshot }
