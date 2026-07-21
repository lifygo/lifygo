# Contributing to LifyGo

Thanks for contributing. This doc covers local setup, architecture conventions, testing, and the PR workflow.

---

## Local setup

**You need:**

- Go 1.22+
- Node.js 20+
- Docker and Docker Compose
- A Clerk account (only if using Clerk auth — skip for local auth)

### 1. Clone and install

```bash
git clone https://github.com/lifygo/lifygo.git
cd lifygo
```

### 2. Start Postgres and Redis

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

### 3. Configure the API

```bash
cd apps/api
cp .env.example .env
```

Fill in the required values. If using local auth (no Clerk):

```bash
AUTH_PROVIDER=local
JWT_SECRET=<at least 32 characters>
DATABASE_URL=postgres://lifygo:lifygo@localhost:5432/lifygo?sslmode=disable
REDIS_URL=redis://localhost:6379
ENCRYPTION_KEY=<output of: openssl rand -hex 32>
```

### 4. Run migrations

```bash
cd apps/api
migrate -path migrations -database "postgres://lifygo:lifygo@localhost:5432/lifygo?sslmode=disable" up
```

### 5. Start the API

```bash
go run ./cmd/server/main.go
```

### 6. Start the frontend

```bash
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev
```

Dashboard at `http://localhost:3000`. API at `http://localhost:8080`.

---

## Project structure

```
apps/
├── api/
│   ├── cmd/server/          Entry point, wiring, router setup
│   ├── internal/
│   │   ├── config/          Env loading and validation
│   │   ├── database/        PostgreSQL connection pool
│   │   ├── handler/         HTTP handlers — no business logic
│   │   ├── middleware/       Auth, rate limiting, logging, CORS
│   │   ├── model/           Domain types, errors, validation
│   │   ├── redis/           Redis connection
│   │   ├── repository/      Database queries only
│   │   └── service/         All business logic
│   ├── migrations/          Numbered up/down SQL files
│   └── pkg/
│       ├── crypto/          AES-256, SHA-256, OTP generation
│       ├── mailer/          SMTP client and connection pool
│       └── validator/       Input validation helpers
├── web/
│   └── src/
│       ├── app/             App Router pages and layouts
│       ├── components/      Shared React components
│       ├── features/        Feature-specific types
│       └── lib/             API client, auth context
└── worker/                  Go Lambda (AWS execution path)
```

### Dependency rule

```
handler → service → repository → model
```

- Handlers translate HTTP to service calls. No logic.
- Services contain all business rules. Call repositories.
- Repositories run database queries. No business logic.
- Models are plain structs and domain errors.

Never go the other direction. `pkg/` has zero internal dependencies.

---

## Testing

### Unit tests

```bash
cd apps/api
go test ./... -race -count=1
```

### Integration tests (needs Docker running)

```bash
go test -tags=integration ./internal/repository/... -v -race -count=1
```

### What we expect

- New service methods get unit tests
- New repository queries get integration tests against a real database
- Tests use transactions that roll back — no cleanup needed

```go
func TestMyRepo_Create(t *testing.T) {
    pool := newTestPool(t)
    tx := beginTx(t, pool)
    defer tx.Rollback(context.Background())

    repo := repository.NewMyRepo(tx)
    // test here
}
```

---

## Migrations

Every schema change gets an up and a down file, numbered sequentially:

```bash
touch apps/api/migrations/000010_description.up.sql
touch apps/api/migrations/000010_description.down.sql
```

Apply:

```bash
migrate -path apps/api/migrations \
  -database "postgres://lifygo:lifygo@localhost:5432/lifygo?sslmode=disable" up
```

Roll back one:

```bash
migrate -path apps/api/migrations \
  -database "postgres://lifygo:lifygo@localhost:5432/lifygo?sslmode=disable" down 1
```

---

## Pull requests

1. Fork and branch off `main`: `git checkout -b feat/my-feature`
2. Make your changes
3. `go test ./... -race -count=1` passes
4. Commit with a clear message: `feat: add natural language scheduling`
5. Push and open a PR

### PR checklist

- [ ] Tests pass locally
- [ ] New code has tests
- [ ] No secrets, keys, or tokens committed
- [ ] Migrations have up and down files
- [ ] New env vars are in `.env.example`

---

## Where to start

Issues tagged [`good first issue`](https://github.com/lifygo/lifygo/issues?q=label%3A%22good+first+issue%22) are ready to pick up.

Ideas that don't need deep codebase knowledge:

- Write an SMTP provider setup guide (Gmail, Resend, Brevo, etc.)
- Add a client SDK in your language of choice
- Improve error messages in the API
- Write integration tests for uncovered repository methods

---

## Style

- **Go:** `gofmt`, exported symbols have doc comments
- **TypeScript:** follow the existing ESLint config, avoid `any`
- **SQL:** lowercase keywords, one concern per migration
- **Commits:** imperative, present tense — `"fix scheduler race"` not `"fixed scheduler race"`
- **PRs:** small and focused. One thing per PR.

---

## Help

Open a [GitHub Discussion](https://github.com/lifygo/lifygo/discussions) or drop an issue.
