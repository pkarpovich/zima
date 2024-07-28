FROM node:20-alpine AS base

ARG SHARED_SERVICE_PATH=packages/shared
ARG SERVICE_PATH
ARG PNPM_VERSION=9.6

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN apk --no-cache add --virtual .builds-deps build-base python3

FROM base AS dependencies

WORKDIR /usr/src/app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY ${SHARED_SERVICE_PATH}/package.json ${SHARED_SERVICE_PATH}/pnpm-lock.yaml ./${SHARED_SERVICE_PATH}/
COPY ${SERVICE_PATH}/package.json ${SERVICE_PATH}/pnpm-lock.yaml ./${SERVICE_PATH}/

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm fetch && \
    pnpm fetch -C ${SHARED_SERVICE_PATH} && \
    pnpm fetch -C ${SERVICE_PATH}

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --offline -r


FROM dependencies as build

WORKDIR /usr/src/app

COPY ./${SHARED_SERVICE_PATH} ./${SHARED_SERVICE_PATH}
COPY ./${SERVICE_PATH} ./${SERVICE_PATH}

RUN pnpm run -C ${SHARED_SERVICE_PATH} build && \
    pnpm run -C ${SERVICE_PATH} build

RUN pnpm prune --prod && \
    pnpm prune --prod -C ${SHARED_SERVICE_PATH} && \
    pnpm prune --prod -C ${SERVICE_PATH}

FROM python:3.11-alpine
RUN apk update && apk add dumb-init openssh sshpass nodejs npm

ARG SSHPASS
ENV SSHPASS=$SSHPASS
ARG SSH_USER
ENV SSH_USER=$SSH_USER
ARG SSH_HOST
ENV SSH_HOST=$SSH_HOST
ENV NODE_ENV production
ARG SHARED_SERVICE_PATH=packages/shared
ARG SHARED_GRPC_SERVICE_PATH=packages/shared-grpc-services
ARG SERVICE_PATH
ARG PNPM_VERSION=9.6
RUN npm install -g pnpm@${PNPM_VERSION}

RUN ssh-keygen -q -t rsa -N '' -f /root/.ssh/id_rsa
RUN sshpass -e ssh-copy-id -f -i /root/.ssh/id_rsa -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules node_modules

COPY --from=build /usr/src/app/${SHARED_SERVICE_PATH}/node_modules ${SHARED_SERVICE_PATH}/node_modules
COPY --from=build /usr/src/app/${SHARED_SERVICE_PATH}/package.json ${SHARED_SERVICE_PATH}
COPY --from=build /usr/src/app/${SHARED_SERVICE_PATH}/dist ${SHARED_SERVICE_PATH}/dist

COPY --from=build /usr/src/app/${SERVICE_PATH}/node_modules ${SERVICE_PATH}/node_modules
COPY --from=build /usr/src/app/${SERVICE_PATH}/package.json ${SERVICE_PATH}
COPY --from=build /usr/src/app/${SERVICE_PATH}/dist ${SERVICE_PATH}

WORKDIR /usr/src/app/${SERVICE_PATH}

CMD ["dumb-init", "node", "index.js"]
