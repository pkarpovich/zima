FROM node:latest AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --only=production

# --------------> The production image
FROM python:slim
RUN apt-get update && \
    apt-get -y install gcc curl sudo dumb-init openssh-server sshpass ansible
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get -y install nodejs
RUN pip3 install pyatv

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
