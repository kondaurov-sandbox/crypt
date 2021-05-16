FROM node:15-alpine

RUN apk add redis curl

RUN curl -f https://get.pnpm.io/v6.js | node - add --global pnpm

WORKDIR app

ADD package.json .
ADD pnpm-lock.yaml .

RUN pnpm i

RUN pnpm i -g pm2

RUN apk add bash

ADD ecosystem.yaml .
ADD dist dist
ADD run.sh .

ENTRYPOINT [ "bash", "run.sh" ]
