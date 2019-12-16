FROM node:12.13.1

RUN mkdir -p /var/app
WORKDIR /var/app

COPY tsconfig.json /var/app
COPY package.json /var/app
COPY package-lock.json /var/app

RUN npm install

COPY src /var/app/src
