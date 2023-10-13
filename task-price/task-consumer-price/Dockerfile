FROM node:16-alpine As production

RUN apk update && apk add --no-cache tini

WORKDIR /usr/share/app

COPY ./package*.json .

RUN npm install --loglevel verbose

COPY . .

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "main.js"]