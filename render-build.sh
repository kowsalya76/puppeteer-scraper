#!/usr/bin/env bash
set -e

apt-get update
apt-get install -y wget gnupg curl

# Add Google Chrome key and repo
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list'

apt-get update
apt-get install -y google-chrome-stable

# ✅ Copy Chrome binary to a path Render allows
mkdir -p /opt/render/project/.apt/usr/bin
cp -r /usr/bin/google-chrome /opt/render/project/.apt/usr/bin/google-chrome

# Install node modules
npm install

