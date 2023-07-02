#!/usr/bin/env bash

# these two lines remove the "restore pages" popup on chromium. 
# sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /data/chromium/'Local State' > /dev/null 2>&1 || true 
# sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' /data/chromium/Default/Preferences > /dev/null 2>&1 || true 

# Disable Screen Blank
xset s off -dpms

cd /app
npm run start