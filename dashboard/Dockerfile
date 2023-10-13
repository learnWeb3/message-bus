FROM --platform=arm64 node:20-alpine3.17 as andrew-management

RUN apk update

RUN apk upgrade

WORKDIR /app 

COPY package*.json ./

RUN npm install --loglevel verbose

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]