FROM balenalib/raspberrypi4-64-debian-node:19.6-bookworm-run
## Install Chromium
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

WORKDIR /app

## Setup User Data
RUN mkdir -p /chromium/display1
RUN mkdir -p /chromium/display2
RUN chown -R chromium:chromium /chromium/display1
RUN chown -R chromium:chromium /chromium/display2

## Setup Scripts
COPY ./scripts ./scripts
RUN chmod +x ./scripts/*.sh

## Install Display Server
COPY ./package.json ./
RUN npm install --omit=dev
COPY ./src/index.ts ./src/

## Launch
CMD ["bash", "/app/scripts/entrypoint.sh"]