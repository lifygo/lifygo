# Contributing to LifyGo

Thank you for your interest in contributing. This document explains
how to set up your local environment, run tests, and submit changes.

---

## Local Development Setup

### Prerequisites

- Go 1.26+
- Node.js 20+
- Docker and Docker Compose
- A Clerk account (free) — clerk.com

### 1. Clone the repository

```bash
git clone https://github.com/lifygo/lifygo.git
cd lifygo
```

### 2. Set up the API

```bash
cd apps/api
cp .env.example .env
# Fill in your values — minimum required:
# DATABASE_URL, REDIS_URL, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, ENCRYPTION_KEY
```

Generate an encryption key:

```bash
openssl rand -hex 32
```

### 3. Start the database and cache

```bash
cd /path/to/lifygo
docker compose -f infra/docker/docker-compose.yml up -d
```

### 4. Run database migrations

```bash
cd apps/api
migrate -path migrations -database "postgres://lifygo:lifygo@localhost:5432/lifygo?sslmode=disable" up
```

### 5. Start the API server

```bash
go run ./cmd/server/main.go
```

### 6. Set up the frontend

```bash
cd apps/web
cp .env.local.example .env.local
# Fill in your Clerk keys
npm install
npm run dev
```

---

## Project Structure

```
apps/
├── api/                    Go REST API
│   ├── cmd/server/         Entry point
│   ├── internal/
│   │   ├── config/         Environment variable loading
│   │   ├── database/       PostgreSQL connection pool
│   │   ├── handler/        HTTP handlers (thin, no business logic)
│   │   ├── middleware/      Auth, rate limiting, logging, CORS
│   │   ├── model/          Domain structs and errors
│   │   ├── redis/          Redis connection and helpers
│   │   ├── repository/     All database queries
│   │   └── service/        All business logic
│   ├── migrations/         SQL migration files (up + down)
│   └── pkg/
│       ├── crypto/         AES-256, SHA-256, OTP generation
│       ├── mailer/         SMTP send logic
│       └── validator/      Input validation helpers
├── web/                    Next.js dashboard
│   └── src/
│       ├── app/            App Router pages
│       ├── features/       Feature-based service + type files
│       └── lib/            API client, auth helpers
└── worker/                 Go Lambda function for AWS execution
```

---

## Architecture Rules

These rules keep the codebase clean and consistent:

```
handlers    → only translate HTTP to service calls, no business logic
services    → all business logic lives here, call repositories
repositories → only database queries, no business logic
models      → domain structs and domain errors only
pkg/        → reusable packages with zero internal dependencies
```

Never import `handler` from `service`. Never import `service` from `repository`.
The dependency direction is always: handler → service → repository → model.

---

## Testing

### Run all unit tests

```bash
cd apps/api
go test ./... -race -count=1
```

### Run integration tests (requires Docker running)

```bash
go test -tags=integration ./internal/repository/... -v -race -count=1
```

### Test coverage requirement

All new Go code must maintain at least 80% test coverage.
Every new service method needs unit tests.
Every new repository method needs integration tests.

### Writing repository tests

Integration tests use real PostgreSQL via Docker.
Each test runs inside a transaction that is rolled back after the test —
no cleanup needed, no test data left behind.

```go
func TestMyRepository_Create(t *testing.T) {
    pool := newTestPool(t)

    t.Run("creates successfully", func(t *testing.T) {
        tx := beginTx(t, pool)
        repo := repository.NewMyRepository(tx)
        // test here — transaction rolls back automatically
    })
}
```

---

## Database Migrations

Every schema change needs both an up and a down migration.
Migration files are numbered sequentially.

```bash
# Create a new migration
touch apps/api/migrations/000009_your_change.up.sql
touch apps/api/migrations/000009_your_change.down.sql

# Apply migrations
migrate -path apps/api/migrations \
  -database "postgres://lifygo:lifygo@localhost:5432/lifygo?sslmode=disable" up

# Rollback one step
migrate -path apps/api/migrations \
  -database "postgres://lifygo:lifygo@localhost:5432/lifygo?sslmode=disable" down 1
```

---

## Submitting a Pull Request

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run all tests: `go test ./... -race -count=1`
5. Run the linter: `go vet ./...`
6. Commit with a clear message: `git commit -m "Add natural language scheduling"`
7. Push and open a pull request against `main`

### Pull Request Checklist

- [ ] Tests pass (`go test ./... -race -count=1`)
- [ ] New code has tests
- [ ] No secrets or API keys in the code
- [ ] Migration has both up and down files
- [ ] Environment variables documented in `.env.example`

---

## Good First Issues

Looking for a place to start? Check issues labeled
[`good first issue`](https://github.com/lifygo/lifygo/issues?q=label%3A%22good+first+issue%22)
on GitHub.

Current open contributions welcome:
- `@lifygo/sdk` — JavaScript/TypeScript client SDK
- Natural language scheduling
- MCP server for AI agent integration
- Additional SMTP provider guides
- Paystack payment integration

---

## Code Style

- Go: standard `gofmt` formatting, exported functions have godoc comments
- TypeScript: existing ESLint config, no `any` types
- SQL: lowercase keywords, one statement per migration file
- Commit messages: imperative mood, present tense ("Add feature" not "Added feature")

---

## Questions

Open a GitHub Discussion or file an issue.