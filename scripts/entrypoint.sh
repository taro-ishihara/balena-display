#!/usr/bin/env bash

## XServer Configuration
sed -i -e 's/console/anybody/g' /etc/X11/Xwrapper.config
echo "needs_root_rights=yes" >> /etc/X11/Xwrapper.config
dpkg-reconfigure xserver-xorg-legacy

## Disable CPU Throttling
echo 'performance' > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 

## Pass Environment Values to New Session
environment=$(env | grep -v -w '_' | awk -F= '{ st = index($0,"=");print substr($1,0,st) ","}' | tr -d "\n")
environment="${environment::-1}"

## Change User to "chromium" and startx with start.sh
su -w $environment -c "export DISPLAY=:0 && startx /chromium/start.sh" - chromium
balena-idle
