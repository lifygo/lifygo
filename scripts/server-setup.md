# LifyGo Server Setup Guide

## Prerequisites
- DigitalOcean droplet (Ubuntu 24.04, 1GB RAM, Singapore SGP1)
- Domain DNS configured:
  - api.lifygo.com → droplet IP (A record)
  - lifygo.com → Vercel (handled separately)

## Step 1 — SSH into the server

```bash
ssh root@YOUR_DROPLET_IP
```

## Step 2 — Run the deployment script

```bash
curl -fsSL https://raw.githubusercontent.com/lifygo/lifygo/main/scripts/deploy.sh | bash
```

## Step 3 — Create the production environment file

```bash
nano /opt/lifygo/.env.prod
```

Add all variables from `.env.example`. Critical ones:

```bash
DATABASE_URL=postgres://lifygo:STRONG_PASSWORD@postgres:5432/lifygo?sslmode=disable
REDIS_URL=redis://redis:6379/0
POSTGRES_PASSWORD=STRONG_PASSWORD
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
ENCRYPTION_KEY=your_64_char_hex_key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SQS_QUEUE_URL=https://sqs.ap-southeast-1.amazonaws.com/101166217760/lifygo-jobs-production
SQS_QUEUE_ARN=arn:aws:sqs:ap-southeast-1:101166217760:lifygo-jobs-production
SCHEDULER_ROLE_ARN=arn:aws:iam::101166217760:role/lifygo-scheduler-role-production
```

## Step 4 — Build the Docker image

```bash
cd /opt/lifygo
docker build -f infra/docker/api.Dockerfile -t lifygo-api:latest .
```

## Step 5 — Start all containers

```bash
docker compose -f infra/docker/docker-compose.prod.yml --env-file .env.prod up -d
```

## Step 6 — Get SSL certificate

```bash
certbot --nginx -d api.lifygo.com
```

Follow the prompts. Certbot automatically updates nginx config with SSL.

## Step 7 — Verify everything is running

```bash
docker compose -f infra/docker/docker-compose.prod.yml ps
curl https://api.lifygo.com/health
```

Expected response:
```json
{"status":"ok","services":{"postgres":"healthy","redis":"healthy"}}
```

## Step 8 — Update Lambda DATABASE_URL

```bash
aws lambda update-function-configuration \
  --function-name lifygo-job-executor \
  --environment Variables="{
    DATABASE_URL=postgres://lifygo:STRONG_PASSWORD@YOUR_DROPLET_IP:5432/lifygo?sslmode=disable,
    ENCRYPTION_KEY=your_64_char_hex_key
  }" \
  --region ap-southeast-1
```

## Useful commands

```bash
# View logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f api

# Restart API only
docker compose -f infra/docker/docker-compose.prod.yml restart api

# Pull latest code and redeploy
cd /opt/lifygo
git pull origin main
docker build -f infra/docker/api.Dockerfile -t lifygo-api:latest .
docker compose -f infra/docker/docker-compose.prod.yml up -d --no-deps api

# Run migrations manually
docker compose -f infra/docker/docker-compose.prod.yml run --rm migrate
```