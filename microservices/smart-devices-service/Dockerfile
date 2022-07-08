FROM node:latest AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --only=production

# --------------> The production image
FROM python:slim
RUN apt-get update && \
    apt-get -y install gcc curl sudo dumb-init
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get -y install nodejs
RUN pip3 install pyatv
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY . /usr/src/app
WORKDIR /usr/src/app/microservices/smart-devices-service
CMD ["dumb-init", "npm", "start"]
