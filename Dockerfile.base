FROM node:18-alpine AS base

ARG SHARED_SERVICE_PATH
ARG SERVICE_PATH
ARG PACKAGE_NAME
ARG PNPM_VERSION=7.16.1

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

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

RUN pnpm run -C ${SHARED_SERVICE_PATH} build && pnpm run -C ${SERVICE_PATH} build

RUN pnpm prune --prod && \
    pnpm prune --prod -C ${SHARED_SERVICE_PATH} && \
    pnpm prune --prod -C ${SERVICE_PATH}

FROM node:18-alpine

ENV NODE_ENV production
ARG SHARED_SERVICE_PATH
ARG SERVICE_PATH
ARG PACKAGE_NAME

WORKDIR /usr/src/app
RUN apk add dumb-init

USER node

COPY --chown=node:node --from=build /usr/src/app/node_modules node_modules

COPY --chown=node:node --from=build /usr/src/app/${SHARED_SERVICE_PATH}/node_modules ${SHARED_SERVICE_PATH}/node_modules
COPY --chown=node:node --from=build /usr/src/app/${SHARED_SERVICE_PATH}/package.json ${SHARED_SERVICE_PATH}
COPY --chown=node:node --from=build /usr/src/app/${SHARED_SERVICE_PATH}/dist ${SHARED_SERVICE_PATH}/dist

COPY --chown=node:node --from=build /usr/src/app/${SERVICE_PATH}/node_modules ${SERVICE_PATH}/node_modules
COPY --chown=node:node --from=build /usr/src/app/${SERVICE_PATH}/package.json ${SERVICE_PATH}
COPY --chown=node:node --from=build /usr/src/app/${SERVICE_PATH}/dist ${SERVICE_PATH}

WORKDIR /usr/src/app/${SERVICE_PATH}

CMD ["dumb-init", "node", "--experimental-specifier-resolution=node", "index.js"]
