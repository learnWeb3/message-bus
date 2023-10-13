FROM node:18.0.0-alpine As production

WORKDIR /usr/share/crawler/

RUN apk update && apk add --no-cache tini 

RUN apk update && apk add --no-cache bash \
        alsa-lib \
        at-spi2-atk \
        atk \
        cairo \
        cups-libs \
        dbus-libs \
        eudev-libs \
        expat \
        flac \
        gdk-pixbuf \
        glib \
        libgcc \
        libjpeg-turbo \
        libpng \
        libwebp \
        libx11 \
        libxcomposite \
        libxdamage \
        libxext \
        libxfixes \
        tzdata \
        libexif \
        udev \
        xvfb \
        zlib-dev \
        chromium=99.0.4844.84-r0 \
        chromium-chromedriver=99.0.4844.84-r0

COPY ./package*.json .

RUN npm install --loglevel verbose

COPY . .

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "main.js"]
