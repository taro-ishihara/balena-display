FROM balenalib/raspberrypi4-64-debian-node:19.6-bookworm-build as build
## Build Management API
WORKDIR /build
COPY ./package.json /build/
RUN npm install --omit=dev

FROM balenalib/raspberrypi4-64-debian-node:19.6-bookworm-run

## Install Management API
WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY ./package.json ./
COPY ./src/index.ts ./src/

## Install Chromium
WORKDIR /chromium
RUN install_packages chromium
RUN ln -s /usr/bin/chromium /usr/bin/chromium-browser || true

## Launch
WORKDIR /app
CMD ["npm", "run", "start"]