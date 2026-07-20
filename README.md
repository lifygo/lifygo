# LifyGo

Self-hostable transactional email, OTP verification, and job scheduling API built in Go.

One API key. Send emails via your own SMTP. Schedule recurring or one-time jobs. No per-email fees. No vendor lock-in.

---

## Why LifyGo

Every developer building a SaaS needs to:
- Send transactional emails (welcome, receipts, alerts)
- Verify users with OTP codes
- Schedule recurring jobs (weekly digests, reminders, webhooks)

Most solutions charge per email, require adopting an entire platform, or need complex infrastructure. LifyGo is a single self-hosted API that does all three — using your own SMTP server, so you pay nothing for email volume.

---

## Quick Start

### 1. Clone and start

```bash
git clone https://github.com/lifygo/lifygo.git
cd lifygo
cp apps/api/.env.example apps/api/.env
# Fill in your values in apps/api/.env
docker compose -f infra/docker/docker-compose.yml up -d
cd apps/api && go run ./cmd/server/main.go
```

### 2. Sign in and set up

```
http://localhost:3000
```

- Sign in with Google or GitHub
- Add your SMTP credentials
- Generate an API key

### 3. Send your first email

```bash
curl -X POST http://localhost:8080/send \
  -H "X-API-Key: lfy_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello from LifyGo",
    "body": "Your LifyGo instance is working."
  }'
```

### 4. Send an OTP

```bash
# Send
curl -X POST http://localhost:8080/send/otp \
  -H "X-API-Key: lfy_your_key_here" \
  -d '{"to": "user@example.com"}'

# Verify
curl -X POST http://localhost:8080/verify/otp \
  -H "X-API-Key: lfy_your_key_here" \
  -d '{"email": "user@example.com", "code": "483920"}'
```

### 5. Schedule a job

```bash
# Hit a webhook every Monday at 9am
curl -X POST http://localhost:8080/jobs \
  -H "X-API-Key: lfy_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "weekly-report",
    "type": "webhook",
    "schedule_type": "cron",
    "cron_expression": "0 9 * * 1",
    "webhook_url": "https://yourapp.com/webhook"
  }'
```

---

## Features

### Notify — Free

| Feature | Description |
|---|---|
| `POST /send` | Send a transactional email |
| `POST /send/otp` | Generate and send a 6-digit OTP |
| `POST /verify/otp` | Verify an OTP code (single-use, 10 min TTL) |
| `GET /logs` | Email send history with pagination and filters |

### Schedule — Paid (upgrade planned)

| Feature | Description |
|---|---|
| `POST /jobs` | Create a recurring or one-time scheduled job |
| `GET /jobs` | List all jobs |
| `DELETE /jobs/{id}` | Delete a job |
| `GET /jobs/{id}/executions` | Execution history per job |

Job types: `webhook` (HTTP POST to any URL) or `email` (send via your SMTP)  
Schedule types: `cron` (recurring) or `one_time` (single execution)

### Security

- API keys hashed with SHA-256 — never stored in plain text
- SMTP passwords encrypted with AES-256-GCM at rest
- OTP generated with `crypto/rand` — never `math/rand`
- Clerk webhook signature verified with svix
- Dual auth: `X-API-Key` for API consumers, Clerk Bearer token for dashboard
- Rate limiting via Redis (100 requests/hour per API key)

---

## Architecture

```
apps/
├── api/          Go REST API (chi router, pgx, Redis)
├── web/          Next.js 16 dashboard (shadcn/ui, Clerk auth)
└── worker/       Go Lambda function (AWS execution path)

infra/
├── docker/       Docker Compose (local + production)
├── nginx/        Reverse proxy config
└── cloudformation/ SQS + EventBridge + Lambda IAM roles
```

### Execution Paths

LifyGo has two job execution modes:

**Self-hosted (default)**
```
Scheduler goroutine polls PostgreSQL every minute
→ Executes due jobs directly
→ Zero AWS dependency
→ Works on any server with Docker
```

**AWS EventBridge (optional, production)**
```
POST /jobs → creates EventBridge Scheduler rule
EventBridge fires → SQS → Lambda → executes job
→ Survives API server restarts
→ Scales to millions of jobs
→ Requires AWS credentials in environment
```

Both paths run simultaneously when AWS is configured — EventBridge for reliability, self-hosted as fallback.

### Tech Stack

| Layer | Technology |
|---|---|
| API | Go 1.26, chi router, pgx v5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | Clerk (Google + GitHub OAuth) |
| Frontend | Next.js 16, Tailwind CSS v4, shadcn/ui |
| Scheduling | AWS EventBridge + SQS + Lambda (optional) |
| Encryption | AES-256-GCM (SMTP passwords), SHA-256 (API keys) |
| Deployment | Docker Compose, nginx, Let's Encrypt |

---

## Self-Hosting

### Prerequisites

- Docker and Docker Compose
- Go 1.26+ (for local development)
- A Clerk account (free) for dashboard auth
- An SMTP account (Gmail, Resend, Brevo, or any provider)

### Production Deployment

See [scripts/server-setup.md](scripts/server-setup.md) for the complete guide to deploying on a $6/month VPS.

### Environment Variables

See [apps/api/.env.example](apps/api/.env.example) for all required and optional variables.

Required:
```bash
DATABASE_URL        # PostgreSQL connection string
REDIS_URL           # Redis connection string
CLERK_SECRET_KEY    # From Clerk dashboard
CLERK_WEBHOOK_SECRET # From Clerk webhook settings
ENCRYPTION_KEY      # 64-char hex string: openssl rand -hex 32
```

Optional (enables AWS execution path):
```bash
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
SQS_QUEUE_URL
SQS_QUEUE_ARN
SCHEDULER_ROLE_ARN
```

---

## Testing

```bash
# Unit tests
cd apps/api
go test ./... -race -count=1

# Integration tests (requires PostgreSQL running)
go test -tags=integration ./internal/repository/... -v -race -count=1
```

---

## Roadmap

Community contributions welcome on these planned features:

- [ ] MCP server — use LifyGo tools natively from Claude and other AI agents
- [ ] Natural language scheduling — "every Monday at 9am" instead of cron syntax
- [ ] Agent API keys — dedicated keys for AI agents with audit logging
- [ ] `@lifygo/sdk` — JavaScript/TypeScript client SDK
- [ ] Stripe integration — paid tier enforcement
- [ ] Paystack integration — African market payments
- [ ] Email campaign support — bulk sending with list management
- [ ] Email templates — reusable templates with variables
- [ ] Webhook retry with exponential backoff
- [ ] Multi-region Lambda deployment

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up your local environment, run tests, and submit pull requests.

---

## License

[AGPL-3.0](LICENSE)

---

Built with Go and Next.js.