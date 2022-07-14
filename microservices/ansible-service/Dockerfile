FROM node:latest AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --only=production

# --------------> The production image
FROM python:alpine
RUN apk update && apk add dumb-init openssh sshpass nodejs npm ansible

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
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY . /usr/src/app
WORKDIR /usr/src/app/microservices/ansible-service
CMD ["dumb-init", "npm", "start"]
