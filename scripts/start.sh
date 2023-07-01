#!/usr/bin/env bash

# these two lines remove the "restore pages" popup on chromium. 
# sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /data/chromium/'Local State' > /dev/null 2>&1 || true 
# sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' /data/chromium/Default/Preferences > /dev/null 2>&1 || true 

# stop the screen blanking
xset s off -dpms

chromium-browser ----enable-zero-copy --num-raster-threads=4 --ignore-gpu-blacklist --enable-gpu-rasterization --window-position=0,0 --kiosk --user-data-dir=/chromium/data/display1 &
chromium-browser ----enable-zero-copy --num-raster-threads=4 --ignore-gpu-blacklist --enable-gpu-rasterization --window-position=1024,0 --kiosk --user-data-dir=/chromium/data/display2 &