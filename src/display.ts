import { launch, killAll } from 'chrome-launcher'
import { spawn } from 'child_process'
import { readFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

interface Display {
  name: string
  number: number
  w: number
  h: number
  p: number
}

const defaultRemoteDebuggingPort = 9222

const formatDisplay = (display: string, index: number): Display | undefined => {
  const sizeRegex = /(\d+)x(\d+)/
  const positionRegex = /\+(\d+)/
  const sizeMatch = display.match(sizeRegex)
  const positionMatch = display.match(positionRegex)
  if (sizeMatch && positionMatch) {
    const number = index + 1
    const width = parseInt(sizeMatch[1])
    const height = parseInt(sizeMatch[2])
    const position = parseInt(positionMatch[1])
    return {
      name: `display${number}`,
      number: number,
      w: width,
      h: height,
      p: position,
    }
  } else {
    return undefined
  }
}

const displayList = ((): Array<Display> => {
  const display_1 = process.env.DISPLAY_1 || ''
  const display_2 = process.env.DISPLAY_2 || ''

  return [display_1, display_2]
    .map((value, index) => formatDisplay(value, index))
    .filter((value) => value !== undefined) as Display[]
})()

const createFlags = (
  display: Display,
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
    '--disable-features=TranslateUI',
    '--disable-dev-shm-usage',
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
        ...corsFlags,
        '--auto-open-devtools-for-tabs',
      ]
    case 'remote':
      return [
        ...positionFlags,
        ...baseFlags,
        ...corsFlags,
        '--headless',
        '--remote-debugging-address=0.0.0.0',
        `--remote-debugging-port=${
          defaultRemoteDebuggingPort + display.number - 1
        }`,
      ]
    default:
      return [...positionFlags, ...baseFlags, ...corsFlags, '--kiosk']
  }
}

const launchDisplay = async (debug?: 'local' | 'remote') => {
  killAll()
  const promises = displayList.map(async (display) => {
    // if you only set LAUNCH_URL_1 and start as dual display, the display will set as mirror mode.
    const url =
      process.env[`LAUNCH_URL_${display.number}`] ||
      process.env.LAUNCH_URL_1 ||
      'https://example.com'
    const startingUrl = debug ? url : `--app=${url}`
    const flags = createFlags(display, debug)
    const remoteDebuggingPortFlag = flags.find((flag) =>
      flag.startsWith('--remote-debugging-port'),
    )
    const chromiumInstance = await launch({
      startingUrl: startingUrl,
      port: remoteDebuggingPortFlag
        ? parseInt(remoteDebuggingPortFlag.split('=')[1])
        : undefined,
      chromeFlags: flags,
      userDataDir: `/chromium/${display.name}`,
      ignoreDefaultFlags: true,
    })
    console.log(`URL: ${url} launched with flags: ${flags}`)
    remoteDebuggingPortFlag
      ? console.log(`Remote debugging port: ${chromiumInstance.port}`)
      : null
    return chromiumInstance.port
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

    const statusCode = await new Promise<number>((resolve) => {
      child.on('close', resolve)
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
