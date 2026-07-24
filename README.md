# LifyGo

Transactional email, OTP verification, and job scheduling in one API.

Start free on our hosted version, or self-host on your own server. Use your SMTP or ours. Either way, no per-email fees and no vendor lock-in.

---

## What it does

Three things every SaaS backend needs, in one API:

- **Send transactional emails** — use your own SMTP or our free hosted version
- **Generate and verify OTP codes** — 6-digit codes, 10-minute TTL, single use
- **Schedule recurring jobs** — cron or one-time, webhooks or emails

**Two ways to start:**

| Free hosted | Self-hosted |
|---|---|
| Sign up at lifygo.com | Clone and run on your server |
| Get an API key instantly | Connect your own SMTP |
| Start sending in 2 minutes | Full control, zero external dependencies |
| No credit card | AGPL-3.0, runs on any VPS |

---

## Quick start

### Free hosted (2 minutes)

1. Go to [lifygo.com/sign-up](https://lifygo.com/sign-up)
2. Create an account
3. Copy your API key
4. Send your first email:

```bash
curl -X POST https://api.lifygo.com/send \
  -H "X-API-Key: lfy_your_key" \
  -H "Content-Type: application/json" \
  -d '{"to": "hello@example.com", "subject": "Test", "body": "It works."}'


```bash
git clone https://github.com/lifygo/lifygo.git
cd lifygo

# Copy and fill in the env file
cp apps/api/.env.example apps/api/.env

# Start Postgres + Redis
docker compose -f infra/docker/docker-compose.yml up -d

# Run the API
cd apps/api && go run ./cmd/server/main.go
```

Dashboard runs on `http://localhost:3000`. Sign in, add your SMTP credentials, generate an API key.

### Send an email

```bash
curl -X POST http://localhost:8080/send \
  -H "X-API-Key: lfy_your_key" \
  -H "Content-Type: application/json" \
  -d '{"to": "hello@example.com", "subject": "Test", "body": "It works."}'
```

### Send and verify an OTP

```bash
curl -X POST http://localhost:8080/send/otp \
  -H "X-API-Key: lfy_your_key" \
  -d '{"to": "hello@example.com"}'

curl -X POST http://localhost:8080/verify/otp \
  -H "X-API-Key: lfy_your_key" \
  -d '{"email": "hello@example.com", "code": "483920"}'
```

### Schedule a job

```bash
curl -X POST http://localhost:8080/jobs \
  -H "X-API-Key: lfy_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "weekly-digest",
    "type": "webhook",
    "schedule_type": "cron",
    "cron_expression": "0 9 * * 1",
    "webhook_url": "https://yourapp.com/webhook"
  }'
```

---

## API

### Email

| Method | Path | Description |
|---|---|---|
| `POST` | `/send` | Send a transactional email |
| `POST` | `/send/otp` | Generate and send a 6-digit OTP |
| `POST` | `/verify/otp` | Verify an OTP (single-use, 10 min TTL) |
| `GET` | `/logs` | Email history with pagination and status filter |

### Jobs

| Method | Path | Description |
|---|---|---|
| `POST` | `/jobs` | Create a cron or one-time job |
| `GET` | `/jobs` | List all jobs |
| `GET` | `/jobs/{id}` | Get a single job |
| `DELETE` | `/jobs/{id}` | Delete a job |
| `GET` | `/jobs/{id}/executions` | Execution history for a job |

Job types: `webhook` (POST to a URL) or `email` (send via your SMTP).  
Schedule types: `cron` (recurring) or `one_time` (runs once at `run_at`).

---

## Authentication

LifyGo supports two auth modes, controlled by `AUTH_PROVIDER`:

| Mode | What it does | When to use |
|---|---|---|
| `clerk` | Google/GitHub OAuth via Clerk | Quick setup, don't want to manage passwords |
| `local` | Email + password, JWT sessions | Full self-hosting, zero external dependencies |

Set `AUTH_PROVIDER=local` and `JWT_SECRET=<32+ chars>` in your env to go fully standalone.

API consumers authenticate with `X-API-Key`. The dashboard uses session tokens (Clerk JWTs or local JWTs depending on mode).

---

## How jobs execute

LifyGo ships with two execution paths. They can run side by side.

### Self-hosted scheduler (default)

A goroutine inside the API process polls PostgreSQL every 60 seconds. Due jobs are picked up with `SELECT ... FOR UPDATE SKIP LOCKED` — safe across multiple API replicas. No AWS needed. Works on a $6 VPS.

### AWS EventBridge (optional)

When AWS credentials are present, job creation also registers an EventBridge Scheduler rule. EventBridge fires → SQS → Lambda → job executes. Survives API restarts. Scales to millions of jobs. The self-hosted scheduler keeps running as a fallback.

---

## Architecture

```
apps/
├── api/          Go REST API (chi, pgx, Redis)
├── web/          Next.js 16 dashboard (Tailwind CSS v4, shadcn/ui)
└── worker/       Go Lambda (AWS execution path)

infra/
├── docker/       Docker Compose for local dev and single-server prod
├── nginx/        Reverse proxy config
└── cloudformation/ SQS, EventBridge, Lambda IAM
```

### Stack

| Layer | Choice |
|---|---|
| API | Go, chi router, pgx v5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Frontend | Next.js 16, Tailwind CSS v4, shadcn/ui |
| Auth | Clerk (OAuth) or local (bcrypt + JWT) |
| Encryption | AES-256-GCM (SMTP passwords), SHA-256 (API keys) |
| Scheduler | PostgreSQL-backed goroutine, EventBridge (optional) |

---

## Self-hosting

### You need

- Docker and Docker Compose
- Go 1.22+ (if running outside Docker)
- An SMTP account (any provider — Gmail, Resend, Brevo, Mailgun)
- 512 MB RAM, 1 vCPU minimum

### Required env vars

```bash
DATABASE_URL=postgres://user:pass@host:5432/lifygo?sslmode=disable
REDIS_URL=redis://host:6379
ENCRYPTION_KEY=<64-char hex string>   # openssl rand -hex 32
AUTH_PROVIDER=local                   # or clerk
JWT_SECRET=<at-least-32-chars>        # only if AUTH_PROVIDER=local
```

If using Clerk, add `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` instead of `JWT_SECRET`.

### Production deploy

See [`scripts/server-setup.md`](scripts/server-setup.md) for a step-by-step VPS deploy guide — nginx, Let's Encrypt, systemd, the works.

---

## Development

```bash
# Start everything
make dev

# Run tests
make test

# Run migrations
make migrate-up
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for local setup, testing conventions, and PR guidelines.

---

## Roadmap

- [ ] MCP server for AI agent integration
- [ ] Natural language scheduling ("every Monday at 9am")
- [ ] Official client SDKs (`@lifygo/sdk`)
- [ ] Email templates with variables
- [ ] Webhook retry with exponential backoff
- [ ] Stripe + Paystack billing integration
- [ ] Multi-region deployment guides

---

## License

AGPL-3.0. See [`LICENSE`](LICENSE).
