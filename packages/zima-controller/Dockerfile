FROM node:18-alpine AS base

ARG SERVICE_PATH
ARG PACKAGE_NAME
ARG PNPM_VERSION=7.16.1

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS dependencies

WORKDIR /usr/src/app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/shared/package.json packages/shared/pnpm-lock.yaml ./packages/shared/
COPY ${SERVICE_PATH}/package.json ${SERVICE_PATH}/pnpm-lock.yaml ./${SERVICE_PATH}/

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
    pnpm fetch
WORKDIR /usr/src/app/packages/shared
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
    pnpm fetch
WORKDIR /usr/src/app/${SERVICE_PATH}
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
    pnpm fetch --prod

FROM dependencies as build

WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
    pnpm install --offline

WORKDIR /usr/src/app/packages/shared
COPY ./packages/shared .
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
    pnpm install --offline
RUN pnpm run build

WORKDIR /usr/src/app/${SERVICE_PATH}
COPY ./${SERVICE_PATH} .
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
    pnpm install --offline
RUN pnpm run build

WORKDIR /usr/src/app
RUN pnpm prune --prod

WORKDIR /usr/src/app/packages/shared
RUN pnpm prune --prod

WORKDIR /usr/src/app/${SERVICE_PATH}
RUN pnpm prune --prod


FROM node:18-alpine
RUN apk add dumb-init
ENV NODE_ENV production
ARG SERVICE_PATH
ARG PACKAGE_NAME
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/app/${SERVICE_PATH}/node_modules /usr/src/app/${SERVICE_PATH}/node_modules
COPY --chown=node:node --from=build /usr/src/app/packages/shared/node_modules /usr/src/app/packages/shared/node_modules

COPY --chown=node:node --from=build /usr/src/app/packages/shared/dist /usr/src/app/packages/shared/dist
COPY --chown=node:node --from=build /usr/src/app/packages/shared/package.json /usr/src/app/packages/shared

COPY --chown=node:node --from=build /usr/src/app/${SERVICE_PATH}/dist /usr/src/app/${SERVICE_PATH}
COPY --chown=node:node --from=build /usr/src/app/${SERVICE_PATH}/package.json /usr/src/app/${SERVICE_PATH}

WORKDIR /usr/src/app/${SERVICE_PATH}

CMD ["dumb-init", "node", "--experimental-specifier-resolution=node", "index.js"]
