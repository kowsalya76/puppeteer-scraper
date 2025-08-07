FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y wget gnupg curl xdg-utils \
  fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
  libatk1.0-0 libcups2 libdbus-1-3 libnspr4 libnss3 libx11-xcb1 \
  libxcomposite1 libxdamage1 libxrandr2 \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && dpkg -i google-chrome-stable_current_amd64.deb || true \
  && apt-get -fy install \
  && rm google-chrome-stable_current_amd64.deb

WORKDIR /app
COPY . .
RUN npm install

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
EXPOSE 3000
CMD ["node", "scraper.js"]
