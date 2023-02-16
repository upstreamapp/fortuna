FROM node:lts

WORKDIR /src

EXPOSE 7529

ENV NODE_ENV production

COPY package*.json ./

COPY . .

CMD ["node", "dist/monitoringServer.js"]
