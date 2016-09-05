#!/bin/bash
export GEOMETRY="$SCREEN_WIDTH""x""$SCREEN_HEIGHT""x""$SCREEN_DEPTH"
DEBUG_TESTS=true xvfb-run --server-args="$DISPLAY -screen 0 $GEOMETRY -ac +extension RANDR" \
  ./node_modules/.bin/grunt connect:test protractor
