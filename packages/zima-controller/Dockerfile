FROM node:18-alpine AS base

ARG PNPM_VERSION=7.16.1
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS dependencies
WORKDIR /usr/src/app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
    pnpm fetch --prod

FROM base
RUN apk add dumb-init
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
     pnpm install --frozen-lockfile --prod --filter zima --filter shared
CMD ["dumb-init", "pnpm", "start"]
