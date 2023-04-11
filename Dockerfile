FROM public.ecr.aws/docker/library/node:18.15.0

WORKDIR /var/app

COPY tsconfig.json package.json package-lock.json ./

RUN npm ci --quiet --no-optional && \
  npm cache clean --force

COPY src ./src
