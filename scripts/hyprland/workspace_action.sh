#!/usr/bin/env bash

if [ "$1" == "workspace" ]; then
    wksp=$(hyprctl activeworkspace -j | gojq -r .id)

    if [ $2 -lt $wksp ]; then
        for i in $(seq $wksp -1 $2); do
            echo $i
            hyprctl dispatch "$1" $i
            sleep 0.01
        done
    else
        for i in $(seq $wksp $2); do
            echo $i
            hyprctl dispatch "$1" $i
            sleep 0.01
        done
    fi
fi

hyprctl dispatch "$1" $2
