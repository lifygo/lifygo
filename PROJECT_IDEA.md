# LifyGo Project Context for AI Assistants

This document is a standalone orientation to the LifyGo repository. Read it before changing code. It explains the product, architecture, runtime flows, important files, development modes, conventions, and known caveats so an AI assistant can continue work without first reconstructing the entire project.

## 1. Product idea

LifyGo is an open-source transactional email and job-scheduling platform for developers. It provides one API and one dashboard for:

- Sending transactional emails through a user-owned SMTP server.
- Sending and verifying one-time passwords (OTPs).
- Creating cron or one-time scheduled jobs.
- Executing jobs as webhooks or email deliveries.
- Viewing email logs, job execution history, SMTP configuration, API keys, and dashboard metrics.

The product can be hosted at lifygo.com or self-hosted on a VPS. The primary journey is:

1. Create an account and sign in.
2. Configure SMTP credentials in the dashboard.
3. Generate an API key.
4. Use the API key in X-API-Key requests to send email, send/verify OTPs, or create jobs.
5. Monitor delivery and job activity from the dashboard.

## 2. Repository layout

Generated directories such as node_modules, .next, and build artifacts are not source and should not be edited.

~~~text
lifygo/
├── apps/
│   ├── api/                         Go REST API
│   │   ├── cmd/server/main.go       API composition and HTTP routes
│   │   ├── internal/
│   │   │   ├── config/              Environment loading and validation
│   │   │   ├── database/             PostgreSQL connection helpers
│   │   │   ├── handler/              HTTP handlers and JSON responses
│   │   │   ├── middleware/           Auth, CORS, rate limiting, logging, recovery
│   │   │   ├── model/                Domain entities and request/response types
│   │   │   ├── redis/                Redis connection helpers
│   │   │   ├── repository/            PostgreSQL persistence implementations
│   │   │   └── service/               Business logic and scheduler
│   │   ├── migrations/                Ordered PostgreSQL migrations
│   │   ├── pkg/
│   │   │   ├── crypto/               AES-GCM encryption helpers
│   │   │   ├── mailer/               SMTP client/pool and tests
│   │   │   └── validator/             Shared validation helpers
│   │   ├── tests/                     Integration, unit, and e2e test areas
│   │   ├── go.mod
│   │   └── .env.example               Local API configuration template
│   ├── web/                           Next.js dashboard and marketing site
│   │   ├── src/app/                   App Router pages and layouts
│   │   ├── src/components/            Shared UI, auth, layout, dashboard components
│   │   ├── src/features/              Feature-specific types and service helpers
│   │   ├── src/hooks/                 React hooks
│   │   ├── src/lib/                   API client, endpoint constants, utilities
│   │   ├── src/proxy.ts               Next route protection
│   │   ├── public/                    Static assets
│   │   ├── package.json
│   │   └── .env.local                 Local frontend configuration
│   └── worker/                        Go AWS Lambda worker
│       ├── cmd/main.go                Lambda entry point
│       └── internal/
│           ├── executor/               Job execution logic
│           └── resolver/               Job/data resolution logic
├── infra/
│   ├── docker/docker-compose.yml      Local PostgreSQL and Redis
│   ├── docker/docker-compose.prod.yml Production containers
│   ├── docker/api.Dockerfile          API image
│   ├── nginx/lifygo.conf              Reverse proxy configuration
│   └── cloudformation/scheduler.yml   AWS scheduler/SQS/Lambda infrastructure
├── docs/                              Product and API documentation (MDX)
├── scripts/                           Deployment and server setup scripts
├── logo/                              Brand SVGs
├── Makefile                           Common development commands
├── README.md                          Public project README
├── CONTRIBUTING.md                    Contribution guidance
└── PROJECT_IDEA.md                    This AI handoff document
~~~

## 3. Technology stack

| Area | Technology |
|---|---|
| API | Go, Chi router, pgx v5 |
| Frontend | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn-style components, Radix UI |
| Database | PostgreSQL 16 |
| Cache/coordination | Redis 7 |
| Authentication | Clerk or local email/password JWT |
| Password hashing | bcrypt |
| API key storage | SHA-256 hash; raw key is shown only at creation |
| SMTP secret storage | AES-256-GCM encryption |
| Scheduling | PostgreSQL-backed Go scheduler; optional AWS EventBridge/SQS/Lambda |
| License | AGPL-3.0 |

## 4. Backend architecture

The API is composed in apps/api/cmd/server/main.go:

1. Load and validate environment configuration.
2. Connect to PostgreSQL and Redis.
3. Construct repositories.
4. Construct services from repositories.
5. Construct handlers from services.
6. Register middleware and routes.
7. Start the scheduler and HTTP server.

The normal dependency direction is:

~~~text
HTTP request -> middleware -> handler -> service -> repository -> PostgreSQL/Redis/SMTP/AWS
~~~

Handlers should stay thin: parse input, read the authenticated user ID, call a service, and format the response. Business rules belong in services. SQL belongs in repositories. Domain/request/response shapes belong in internal/model.

Important backend packages:

- internal/handler: auth, email, jobs, dashboard, SMTP, API keys, users, and health handlers.
- internal/middleware: FlexibleAuth supports API keys, local JWT cookies, and Clerk JWTs. Other middleware handles CORS, recovery, request IDs, logging, timeout, and rate limiting.
- internal/service: auth, email/OTP, API keys, SMTP, jobs, dashboard aggregation, scheduler, EventBridge integration, and users.
- internal/repository: PostgreSQL implementations for users, API keys, SMTP configs, email logs, jobs, and job executions.
- internal/model: Database/domain structs. JSON tags define API response names.
- pkg/crypto: Encrypts and decrypts sensitive SMTP passwords.
- pkg/mailer: SMTP connection pooling and delivery.

## 5. Authentication modes

Authentication is switchable. The API and web app must use matching provider settings.

### Local development mode

Typical settings:

~~~env
# apps/api/.env
AUTH_PROVIDER=local
JWT_SECRET=some-long-development-secret

# apps/web/.env.local
NEXT_PUBLIC_AUTH_PROVIDER=local
NEXT_PUBLIC_API_URL=http://localhost:8080
~~~

Local signup/login sets an HttpOnly cookie:

~~~text
lifygo_token=<JWT>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800
~~~

The frontend must not read this cookie with document.cookie. API calls send it automatically with credentials: "include". Local routes are:

- POST /auth/signup
- POST /auth/signin
- POST /auth/signout
- GET /auth/me (authenticated)

The Next proxy protects /dashboard by checking whether a cookie exists. The Go API performs real JWT validation. If a stale JWT is rejected, the API clears the cookie and the frontend redirects to /sign-in on an authentication 401.

### Clerk mode

Set AUTH_PROVIDER=clerk in the API and NEXT_PUBLIC_AUTH_PROVIDER=clerk in the web app. The web app wraps the application in ClerkProvider and uses Clerk components for sign-in, sign-up, and the user button. API requests use a Clerk bearer token. The Go API verifies the Clerk JWT and maps the Clerk user ID to the local user record.

Do not use Clerk useAuth() directly in generic API helpers. Use the application abstraction in src/components/auth-provider.tsx and useLifygoAuth() so local mode remains functional.

## 6. API authentication and routes

Programmatic API requests authenticate with:

~~~http
X-API-Key: lfy_your_key
~~~

Dashboard requests authenticate with the current dashboard session. FlexibleAuth checks an API key first, then bearer token/cookie session credentials.

| Method | Route | Purpose |
|---|---|---|
| GET | /health | PostgreSQL/Redis health check |
| POST | /auth/signup | Local signup |
| POST | /auth/signin | Local signin |
| POST | /auth/signout | Clear local session cookie |
| GET | /auth/me | Return current local user |
| POST | /api-keys | Create an API key |
| GET | /api-keys | List the user's API keys |
| DELETE | /api-keys/{id} | Delete an API key |
| POST | /smtp-config | Save SMTP configuration |
| GET | /smtp-config | Read SMTP configuration metadata |
| DELETE | /smtp-config | Remove SMTP configuration |
| POST | /send | Send a transactional email |
| POST | /send/otp | Generate and send an OTP |
| POST | /verify/otp | Verify a single-use OTP |
| GET | /logs | Paginated email logs |
| POST | /jobs | Create a cron or one-time job |
| GET | /jobs | List jobs |
| GET | /jobs/{id} | Read one job |
| DELETE | /jobs/{id} | Delete a job |
| GET | /jobs/{id}/executions | Read job execution history |
| GET | /dashboard/stats | Dashboard aggregate data and recent activity |

Dashboard stats include counts, SMTP setup status, recent email logs, recent jobs, and recent job executions. The web overview combines email logs and job executions into one chronological activity feed.

## 7. Email and OTP behavior

Email sending uses the user's configured SMTP server. SMTP passwords are encrypted at rest. Each email attempt creates an email log whether it succeeds or fails.

OTP behavior:

- Six-digit code.
- Ten-minute expiration.
- Single-use verification.
- Redis-backed OTP storage and validation.

Email and OTP routes require an API key and use the authenticated API-key owner as the user ID. User IDs must never be accepted from request bodies for authorization decisions.

## 8. Job scheduling behavior

Jobs have two independent dimensions:

- Type: webhook or email.
- Schedule: cron or one_time.

The self-hosted scheduler runs inside the API process. It polls PostgreSQL, claims due jobs using row locking (FOR UPDATE SKIP LOCKED), executes them, records a job_executions row, and updates job state. This is the default local/self-hosted path and does not require AWS.

When AWS configuration is available, job creation can also register an EventBridge Scheduler rule:

~~~text
EventBridge Scheduler -> SQS -> apps/worker Lambda -> job executor
~~~

The self-hosted scheduler remains a fallback. When changing job execution, inspect apps/api/internal/service/scheduler.go and apps/worker/internal/executor.

## 9. Database model summary

Migrations are in apps/api/migrations and must be applied in order.

Core tables include:

- users: local or Clerk-linked application users.
- api_keys: hashed API credentials owned by users.
- smtp_configs: encrypted SMTP configuration per user.
- email_logs: every email send attempt and its result.
- jobs: scheduled webhook/email jobs.
- job_executions: execution attempts and status/details.
- OTP storage uses Redis rather than a primary SQL table.

Use repository methods for data access instead of adding SQL to handlers or frontend code. Preserve user ownership filters in every user-scoped query.

## 10. Frontend architecture

The web app is a Next.js App Router application. The root layout wraps pages with theme and auth providers. LayoutWrapper displays the marketing navbar/footer outside the dashboard and the dashboard shell inside /dashboard.

Important frontend areas:

- src/app/page.tsx: marketing homepage.
- src/app/sign-in/[[...sign-in]]/page.tsx: local form or Clerk sign-in.
- src/app/sign-up/[[...sign-up]]/page.tsx: local form or Clerk sign-up.
- src/app/dashboard/layout.tsx: sidebar, header, navigation, and shell.
- src/app/dashboard/page.tsx: overview metrics, setup checklist, and unified recent activity.
- src/app/dashboard/logs/page.tsx: full email/job log views.
- src/app/dashboard/jobs/page.tsx: create/delete jobs and inspect executions.
- src/app/dashboard/smtp/page.tsx: configure SMTP.
- src/app/dashboard/api-keys/page.tsx: create/list/delete API keys.
- src/lib/api.ts: low-level fetch wrapper, API URL, JSON parsing, credentials, and auth redirects.
- src/lib/use-api.ts: authenticated API hook using the app auth abstraction.
- src/lib/endpoints.ts: endpoint constants.
- src/features/*: feature types and reusable service functions.
- src/components/ui/*: shared UI primitives.

Dashboard pages should use:

~~~ts
const { call } = useApi()
const data = await call<Type>(ENDPOINT, options)
~~~

Do not hard-code authentication behavior in individual pages. Do not pass user IDs from the browser as authority; the API derives the user from the session or API key.

## 11. Local development

Prerequisites:

- Go 1.22 or newer.
- Node.js/npm compatible with the installed Next.js version.
- Docker and Docker Compose.
- PostgreSQL and Redis, normally started through Docker.

Start local dependencies:

~~~bash
docker compose -f infra/docker/docker-compose.yml up -d
~~~

Run migrations:

~~~bash
make migrate-up
~~~

Run the API and web app separately:

~~~bash
cd apps/api && go run ./cmd/server/main.go
cd apps/web && npm run dev
~~~

Or run both through the root Makefile:

~~~bash
make dev
~~~

Default local URLs:

- Web dashboard: http://localhost:3000
- Go API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

Useful checks:

~~~bash
cd apps/web && npx tsc --noEmit
cd apps/web && npm run lint
cd apps/api && go test ./...
~~~

Some SMTP tests open local sockets and may fail in restricted sandboxes even when code is correct. A production Next build may also need network access to download next/font Google Font assets.

## 12. Environment variables

API required values:

~~~env
PORT=8080
DATABASE_URL=postgres://...
REDIS_URL=redis://...
ENCRYPTION_KEY=<64 hex characters / 32 bytes>
AUTH_PROVIDER=local              # or clerk
JWT_SECRET=<long secret>         # required for local
CLERK_SECRET_KEY=...             # required for Clerk
CLERK_WEBHOOK_SECRET=...         # required for Clerk
~~~

Optional AWS values enable the EventBridge/SQS path. See apps/api/.env.example, README.md, and docs/guides/self-hosting.mdx for deployment settings.

Frontend values:

~~~env
NEXT_PUBLIC_AUTH_PROVIDER=local  # must match API AUTH_PROVIDER
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...  # needed in Clerk mode
~~~

Never commit real secrets. Treat secret-looking values in local environment files as sensitive and do not repeat them in documentation or responses.

## 13. Change and debugging guidelines

When fixing a bug, trace the request end to end:

~~~text
browser page
  -> frontend API helper
  -> CORS/session/API-key credentials
  -> Go middleware
  -> handler
  -> service
  -> repository/query
  -> database or external service
~~~

For dashboard problems, inspect both src/app/dashboard and the backend dashboard service/handler. The overview is an aggregate endpoint, so a missing field often requires a backend model/service/repository change plus a frontend type/render change.

For auth problems, verify:

1. AUTH_PROVIDER and NEXT_PUBLIC_AUTH_PROVIDER match.
2. API and web point to the expected ports.
3. Local JWT cookies are sent with credentials: "include".
4. The API uses the same JWT_SECRET that issued the cookie.
5. CORS allows the exact frontend origin and credentials.
6. Clerk code is not called from local mode.

Preserve the local/Clerk dual-mode design. Prefer shared interfaces and provider abstractions over mode-specific conditionals in every page.

Before editing, inspect git status and preserve unrelated user changes. Use apply_patch for source edits. After editing, run focused tests/type checks and report environment-related limitations separately from code failures.

## 14. Current product state and likely next areas

Already implemented:

- Transactional email and OTP APIs.
- Local and Clerk authentication paths.
- API key management.
- Encrypted SMTP configuration.
- Cron/one-time webhook and email jobs.
- Self-hosted scheduler and optional AWS worker path.
- Email logs and job execution logs.
- Dashboard metrics and unified recent activity feed.
- Marketing site and documentation pages.

Potential future work includes natural-language scheduling, SDKs, templates, retry policies, billing, multi-region deployment, and an MCP server for AI-agent integration. New features should fit the existing handler/service/repository layering and support the selected authentication mode.

## 15. AI handoff checklist

When asked to modify this project, an AI assistant should:

1. Identify whether the task affects apps/api, apps/web, apps/worker, infrastructure, or docs.
2. Read relevant local instructions: apps/web/AGENTS.md, apps/web/CLAUDE.md, and nearer project guidance.
3. Inspect the current implementation and git status before editing.
4. Trace related API, auth, model, repository, and UI code instead of changing only the visible symptom.
5. Preserve local and Clerk modes.
6. Keep secrets out of output and commits.
7. Run focused tests/type checks and distinguish code failures from sandbox/network limitations.
8. Summarize changed files, behavior, and verification results when handing work back.

