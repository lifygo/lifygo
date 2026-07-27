.PHONY: dev dev-api dev-web test test-api lint lint-api build build-web migrate-up migrate-down clean


dev:
	@echo "Starting API + Web..."
	@trap 'kill 0' EXIT; \
		$(MAKE) dev-api & \
		$(MAKE) dev-web & \
		wait

dev-api:
	cd apps/api && go run ./cmd/server/main.go

dev-web:
	cd apps/web && npm run dev



test: test-api

test-api:
	cd apps/api && go test ./... -race -count=1



lint: lint-api

lint-api:
	cd apps/api && golangci-lint run ./...


build: build-web

build-web:
	cd apps/web && npm run build


migrate-up:
	cd apps/api && migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	cd apps/api && migrate -path migrations -database "$(DATABASE_URL)" down



clean:
	rm -rf apps/web/.next apps/web/node_modules/.cache