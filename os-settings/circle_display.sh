#!/bin/bash

# `cvt 1080 1080 60` を実行してパラメータを作成する
xrandr --newmode "1080x1080_60" 97.25 1080 1152 1264 1448 1080 1083 1093 1120 -hsync +vsync

TARGET=`xrandr | grep "1080mm x 1080mm" | awk '{print $1}'`

echo "TARGET: $TARGET"

if [ -n $TARGET ] ; then
        xrandr --addmode $TARGET 1080x1080_60
        xrandr --output $TARGET --mode 1080x1080_60
fi

