# Balena Display

Balena display is a fork of https://github.com/balena-labs-projects/browser.

This is designed for Dual Display Digital Signage System on Raspberry Pi 4.
https://forums.balena.io/t/multi-chromium-instance-on-balena-os/368234

## Designed for Digital Signage System

- No use persistant data, Stateless.
- Plug and play: You don't have to specify your display size by envar.
- Hardware accelerated: use GPU for videos.

## Try it out locally

1. Please set GPU Memory 256MB.
   https://docs.balena.io/reference/OS/advanced/#gpu-memory

1. `balena push <your-device-ip>` with local mode.

## Deploy on production

Delete `ENV UDEV=1` from Dockerfile.template if you don't need to plug mouse and keyboard.

<b style='color:red'>Management API is exposed on internet, I need to fix it but how? I still don't know how Balena blocks work.</b>

## Management APIs

Port: 5678

- `/restart`

  Restart all chromium instances.

- `/localdebug`

  Start local debug mode. (Basically just disable kiosk mode.)

- `/remotedebug`

  Start remote debug mode. You can use <a href=chrome://inspect/#devices>chrome://inspect/#devices</a> to debug your each chromium instances through remote debugging port which is respond from this API.

- `/screenshot`

  Get the image that the display shows now.

## Environment Variables

- LAUNCH_URL_1

  A URL for primary display.

- LAUNCH_URL_2

  A URL for secondry display. If you don't set this but plug 2 displays, then LAUNCH_URL_1 will be displayed on both screen. (mirro mode)

- SHOW_CURSOR

  0 or 1, if you set this 1, mouse cursor will show up on the screen. Mainly for debug with localdebug mode.
