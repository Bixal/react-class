include .env

.PHONY: up down stop prune ps shell dbdump dbrestore uli cim cex

default: up

up:
	@echo "Starting up containers for for $(PROJECT_NAME)..."
	docker-compose pull --parallel
	docker-compose up -d --remove-orphans

down: stop

stop:
	@echo "Stopping containers for $(PROJECT_NAME)..."
	@docker-compose stop

prune:
	@echo "Removing containers for $(PROJECT_NAME)..."
	@docker-compose down -v

ps:
	@docker ps --filter name='$(PROJECT_NAME)*'

shell:
	docker exec -ti $(shell docker ps --filter name='$(PROJECT_NAME)_php' --format "{{ .ID }}") sh

dbdump:
	@echo "Creating Database Dump for $(PROJECT_NAME)..."
	docker-compose run php drupal database:dump --file=../mariadb-init/restore.sql --gz

dbrestore:
	@echo "Restoring database..."
	docker-compose run php drupal database:connect < mariadb-init/restore.sql.gz

uli:
	@echo "Getting admin login"
	docker-compose run php drush user:login --uri='$(PROJECT_BASE_URL)':8000

cim:
	@echo "Importing Configuration"
	docker-compose run php drupal config:import -y

cex:
	@echo "Exporting Configuration"
	docker-compose run php drupal config:export -y

gm:
	@echo "Displaying Generate Module UI"
	docker-compose run php drupal generate:module

menu-update:
	@echo "Updating site menus"
	docker-compose run php drush cim -y --partial --source=modules/custom/custom_move_mil_menus/config/install/
	docker-compose run php drupal cache:rebuild all

cr:
	@echo "Clearing all caches"
	docker-compose run php drupal cache:rebuild all

composer-install:
	docker-compose run php composer install
