#!/usr/bin/env bash

## Hosts
echo "127.0.0.1 $HOSTNAME" >> /etc/hosts

## XServer Configuration
sed -i -e 's/console/anybody/g' /etc/X11/Xwrapper.config
dpkg-reconfigure xserver-xorg-legacy

## Disable CPU Throttling
echo 'performance' > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor

## Show Cursor
if [[ -n $SHOW_CURSOR ]] && [[ $SHOW_CURSOR -eq 1 ]]; then
  export CURSOR=''
  echo "Enabling cursor"
else
  export CURSOR='-- -nocursor'
  echo "Disabling cursor"
fi

## Pass Environment Variables to New Session
environment=$(env | grep -v -w '_' | awk -F= '{ st = index($0,"=");print substr($1,0,st) ","}' | tr -d "\n")
environment="${environment::-1}"

## Change User to "chromium" and startx with start_server.sh
su -w $environment -c "export DISPLAY=:0 && startx /app/scripts/start_server.sh $CURSOR" - chromium
balena-idle
