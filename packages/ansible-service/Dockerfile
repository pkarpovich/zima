FROM node:18-alpine AS base

ARG PNPM_VERSION=7.16.1
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS dependencies
WORKDIR /usr/src/app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
    pnpm fetch --prod

FROM python:3.11-alpine
RUN apk update && apk add dumb-init openssh sshpass nodejs npm ansible

ARG PNPM_VERSION=7.16.1
RUN npm install -g pnpm@${PNPM_VERSION}

ENV NODE_ENV production
ARG SSHPASS
ENV SSHPASS=$SSHPASS
ARG SSH_USER
ENV SSH_USER=$SSH_USER
ARG SSH_HOST
ENV SSH_HOST=$SSH_HOST

RUN ssh-keygen -q -t rsa -N '' -f /root/.ssh/id_rsa
RUN sshpass -e ssh-copy-id -f -i /root/.ssh/id_rsa -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST

WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules
COPY . /usr/src/app
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
     pnpm install --frozen-lockfile --prod --filter ansible-service --filter shared
WORKDIR /usr/src/app/microservices/ansible-service
CMD ["dumb-init", "pnpm", "start"]
