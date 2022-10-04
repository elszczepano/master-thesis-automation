FROM node:16.17.1-alpine

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app
COPY package.json ./
RUN apk add chromium
RUN npm install
COPY tsconfig*.json ./
COPY src src
COPY dev dev
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]