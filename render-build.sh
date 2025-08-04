#!/usr/bin/env bash
set -e

# Define Puppeteer cache dir
export PUPPETEER_CACHE_DIR=$PWD/.cache/puppeteer-cache

mkdir -p $PUPPETEER_CACHE_DIR

# Restore Puppeteer cache if exists
if [ -d "$PUPPETEER_CACHE_DIR" ]; then
  echo "Restoring Puppeteer cache..."
  cp -r $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME
fi

# Install node_modules and Puppeteer Chromium browsers
npm install

# Save Puppeteer cache for future builds
cp -r $XDG_CACHE_HOME/puppeteer $PUPPETEER_CACHE_DIR
