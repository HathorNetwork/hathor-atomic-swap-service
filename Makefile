
.PHONY: migrate
migrate:
	@echo "Migrating..."
	npx sequelize-cli db:migrate
