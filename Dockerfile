FROM node:lts

WORKDIR /root/app

COPY tsconfig.json ./

RUN npm i -g npm@latest
COPY package.json package-lock.json ./
RUN npm ci --quiet --no-optional && npm cache clean --force

COPY src ./src
