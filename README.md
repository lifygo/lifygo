# LifyGo

![LifyGo banner](apps/web/src/assets/logos/banner.png)

Transactional email, OTP verification, and cron job scheduling. One API. No per-email fees. No lock-in.

**Free hosted.** Set your from address and call `POST /send` in under two minutes. Deliverability is already handled — no DNS records, no domain verification, no SMTP configuration. We run the email infrastructure so you don't have to.

**Self-host anytime.** Clone the repo, connect your own SMTP, run it on your own server. Same API. Full control. AGPL-3.0.

---

## Why LifyGo

Most projects never ship transactional email on day one. Not because they can't write the code — but because configuring an email provider is a distraction. Resend wants you to verify a domain. SendGrid wants you to warm an IP. AWS SES wants you out of the sandbox. Before you've sent a single email, you've spent an afternoon in DNS settings.

LifyGo removes that step entirely.

| You write | You don't write |
|---|---|
| `POST /send` with `to`, `subject`, `body` | SPF records, DKIM keys, DMARC policies |
| `POST /send/otp` and `POST /verify/otp` | Twilio SDK, Redis TTL logic, code generation |
| `POST /jobs` with a cron expression | CloudWatch rules, Lambda triggers, cron daemons |

When your project grows and you need a branded FROM domain — self-host. Until then, `@lifygo.com` handles deliverability while you focus on building.

---

## What it does

LifyGo handles transactional email — OTPs, welcome messages, password resets, reminders, job alerts. Not bulk email. No lists. No campaigns.

### Free hosted

Start in two minutes. Set your from address and send.

- 1,000 emails/month
- 50 OTPs/day
- 3 active cron jobs
- No credit card

### Self-hosted

Bring your own SMTP. Run on your own server.

- Unlimited emails
- Unlimited OTPs
- Unlimited cron jobs
- Full control

---

## Quick start

### Hosted — 2 minutes

Sign up at [lifygo.com](https://lifygo.com), set your from address, copy your API key.

Send a transactional email:

```bash
curl -X POST https://api.lifygo.com/send \
  -H "X-API-Key: lfy_your_key" \
  -H "Content-Type: application/json" \
  -d '{"to": "hello@example.com", "subject": "Welcome", "body": "You are in."}'
```

Generate and send an OTP:

```bash
curl -X POST https://api.lifygo.com/send/otp \
  -H "X-API-Key: lfy_your_key" \
  -d '{"to": "hello@example.com"}'

curl -X POST https://api.lifygo.com/verify/otp \
  -H "X-API-Key: lfy_your_key" \
  -d '{"email": "hello@example.com", "code": "483920"}'
```

Schedule a recurring webhook every Monday at 9am:

```bash
curl -X POST https://api.lifygo.com/jobs \
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

### Self-hosted

```bash
git clone https://github.com/lifygo/lifygo.git
cd lifygo

cp apps/api/.env.example apps/api/.env

docker compose -f infra/docker/docker-compose.yml up -d

cd apps/api && go run ./cmd/server/main.go
```

The dashboard runs on `http://localhost:3000`. Sign in, connect your SMTP, generate an API key.

---

## API

### Email

| Method | Path | Description |
|---|---|---|
| `POST` | `/send` | Send a transactional email |
| `POST` | `/send/otp` | Generate and send a 6-digit OTP |
| `POST` | `/verify/otp` | Verify an OTP (single-use, 10 minute TTL) |
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

| Mode | What it does | When to use |
|---|---|---|
| `clerk` | Google / GitHub OAuth via Clerk | Quick setup, don't want to manage passwords |
| `local` | Email + password, JWT sessions | Full self-hosting, zero external dependencies |

Set `AUTH_PROVIDER=local` and `JWT_SECRET=<32+ chars>` in your env to go fully standalone.

API consumers authenticate with `X-API-Key`. The dashboard uses session tokens (Clerk JWTs or local JWTs).

---

## How jobs execute

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

### Requirements

- Docker and Docker Compose
- Go 1.22+ (if running outside Docker)
- An SMTP account (Gmail, Resend, Brevo, Mailgun — any provider)
- 512 MB RAM, 1 vCPU minimum

### Required env vars

```bash
DATABASE_URL=postgres://user:pass@host:5432/lifygo?sslmode=disable
REDIS_URL=redis://host:6379
ENCRYPTION_KEY=<64-char hex string>
AUTH_PROVIDER=local
JWT_SECRET=<at-least-32-chars>
```

Generate an encryption key:

```bash
openssl rand -hex 32
```

If using Clerk, add `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` instead of `JWT_SECRET`.

### Production deploy

See [`scripts/server-setup.md`](scripts/server-setup.md) for a step-by-step VPS deploy guide — nginx, Let's Encrypt, systemd.

For a branded `From` address through Resend, see the [Resend domain verification guide](docs/guides/resend-domain-verification.mdx).

---

## Development

```bash
make dev       # Start everything
make test      # Run tests
make migrate-up # Run migrations
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
