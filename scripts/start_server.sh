#!/usr/bin/env bash

## Display Size
display_size=$( xrandr | grep connected | grep -oP '\d+x\d+\+\d+\+\d' )
export DISPLAY_1=$(echo "$display_size" | sed -n '1p')
export DISPLAY_2=$(echo "$display_size" | sed -n '2p')

# these two lines remove the "restore pages" popup on chromium. 
# sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /data/chromium/'Local State' > /dev/null 2>&1 || true 
# sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' /data/chromium/Default/Preferences > /dev/null 2>&1 || true 

## Disable Screen Blank
xset s off -dpms

cd /app
npm run start