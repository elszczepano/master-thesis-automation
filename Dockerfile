FROM node:18.12.0-alpine

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app
COPY package.json ./

RUN apk add --no-cache \
    g++ \
    gcc \
    jpeg-dev \
    zlib-dev \
    libxml2-dev \
    libxslt-dev \
    libffi-dev \
    freetype-dev \
    chromium \
    python3-dev \
    py3-pip
RUN pip3 install maigret
RUN npm install
COPY tsconfig*.json ./
COPY src src
COPY dev dev
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]