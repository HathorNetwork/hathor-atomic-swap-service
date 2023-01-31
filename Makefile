
.PHONY: migrate
migrate:
	@echo "Migrating..."
	npx sequelize-cli db:migrate

.PHONY: deploy-lambdas-dev-testnet
deploy-lambdas-dev-testnet:
	npx serverless deploy --stage dev-testnet --region eu-central-1
