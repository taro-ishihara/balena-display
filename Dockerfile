FROM balenalib/raspberrypi4-64-debian-node:19.6-bookworm-build as build
## Build Management API
WORKDIR /build
COPY ./package.json /build/
RUN npm install --omit=dev

FROM balenalib/raspberrypi4-64-debian-node:19.6-bookworm-run
## Install Chromium
WORKDIR /chromium
RUN install_packages \
    chromium \
    chromium-sandbox \
    libgles2-mesa \
    lsb-release \
    mesa-vdpau-drivers \
    scrot \
    x11-xserver-utils \
    xserver-xorg-input-evdev \
    xserver-xorg-legacy \
    xserver-xorg-video-fbdev \
    xserver-xorg xinit \
    xinput \
    xterm
RUN useradd chromium -m -s /bin/bash -G root || true && \
    groupadd -r -f chromium && id -u chromium || true && \
    chown -R chromium:chromium /home/chromium || true
RUN usermod -a -G audio,video,tty chromium
RUN ln -s /usr/bin/chromium /usr/bin/chromium-browser || true

## Setup User Data
RUN mkdir -p ./data
RUN chown -R chromium:chromium ./data

## Setup Scripts
COPY ./scripts/entrypoint.sh ./
COPY ./scripts/start.sh ./
RUN chmod +x ./*.sh

## Install Management API
WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY ./package.json ./
COPY ./src/index.ts ./src/

## Launch
WORKDIR /chromium
CMD ["bash", "/chromium/entrypoint.sh"]