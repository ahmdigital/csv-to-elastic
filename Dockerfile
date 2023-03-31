FROM node:19

WORKDIR /var/app

COPY tsconfig.json package.json package-lock.json ./

RUN npm ci --quiet --no-optional && \
  npm cache clean --force

COPY src ./src
