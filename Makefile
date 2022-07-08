start-ansible-service:
	cd ./microservices/ansible-service && npm run start

stop-ansible-service:
	cd ./microservices/ansible-service && npm run stop

start-all-docker-services:
	docker-compose up -d --build

stop-all-docker-services:
	docker-compose down

start-all:
	make start-all-docker-services
	make start-ansible-service

stop-all:
	make stop-ansible-service
	make stop-all-docker-services
