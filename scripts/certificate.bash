#!/usr/bin/env bash
#
# Automated private, developer certificate generation for HTTPS 
# serve function of parcel
#
# SEE ALSO
# 1. package.json
#   a) scripts.build

PREFIX_DIR=config

echo FIXME
exit 255

cmd=(
    step ca certificate virgo.home tls.crt tls.key
    --san=scorpio.home --san=192.168.15.113 --san=192.168.15.119 --san=localhost --san=127.0.0.1 --san=virgo.home --san=virgo-wifi.home --not-after=8640h
)

[ -n "$DRY_RUN" ] && echo "DEBUG: $cmd"
$cmd

[ -e "$PREFIX/tls.crt" ] && step certificate inspect "$PREFIX/tls.crt"
