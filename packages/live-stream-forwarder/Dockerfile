FROM node:20-bookworm AS base

ARG PNPM_VERSION=9.6
ARG SERVICE_PATH

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS dependencies

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY ${SERVICE_PATH}/package.json ${SERVICE_PATH}/pnpm-lock.yaml ./${SERVICE_PATH}/

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm fetch && \
    pnpm fetch -C ${SERVICE_PATH}

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --offline -r


FROM dependencies AS build

WORKDIR /app
COPY ./${SERVICE_PATH} ./${SERVICE_PATH}

RUN pnpm run -C ${SERVICE_PATH} build
RUN pnpm prune -C ${SERVICE_PATH} --prod


FROM node:20-bookworm-slim

ARG SERVICE_PATH

RUN apt-get update && apt-get install -y \
    wget \
    xz-utils \
    streamlink \
    && rm -rf /var/lib/apt/lists/* \
    && wget -O /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY --chown=node:node --from=build /app/${SERVICE_PATH}/node_modules ${SERVICE_PATH}/node_modules
COPY --chown=node:node --from=build /app/${SERVICE_PATH}/package.json ${SERVICE_PATH}
COPY --chown=node:node --from=build /app/${SERVICE_PATH}/dist ${SERVICE_PATH}

WORKDIR /app/${SERVICE_PATH}

EXPOSE 8080

CMD [ "node", "index.js" ]