.PHONY: dev test lint seed

dev:
	docker compose up --build

down:
	docker compose down

test-be:
	cd backend && pytest -v

test-fe:
	cd frontend && npm run test

test: test-be test-fe

lint-be:
	cd backend && ruff check . && ruff format --check .

lint-fe:
	cd frontend && npm run lint

lint: lint-be lint-fe

seed:
	docker compose exec api python -m app.seed
