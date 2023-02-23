
.PHONY: migrate
migrate:
	@echo "Migrating..."
	npx sequelize-cli db:migrate

.PHONY: migrate-force
migrate-force:
	@if grep -q "^NODE_ENV=development$$" .env ; then \
		echo "Force migrating from scratch"; \
		npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate; \
	else \
		echo "ERROR: Cannot force migrate: NODE_ENV is not set to 'development'"; \
		exit 1; \
	fi

.PHONY: deploy-lambdas-dev-testnet
deploy-lambdas-dev-testnet:
	npx serverless deploy --stage dev-testnet --region eu-central-1

