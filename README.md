# VC Dashboard (Self-hosted)

Production-grade VC dashboard built with Next.js + Supabase and a BullMQ worker. Includes portfolio metrics, thesis management, VC news, n8n chat, and backoffice tooling.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind + shadcn-style UI primitives
- Recharts
- Supabase (Auth, Postgres, Storage, RLS)
- BullMQ + Redis worker

## Quick start
## Prerequisites and setup (Debian 13 via terminal)
Install Git, Docker Engine, and Docker Compose plugin using `apt`.

### Git (Debian 13)
```bash
sudo apt-get update
sudo apt-get install -y git
git --version
```

### Docker Engine + Docker Compose (Debian 13)
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
docker --version
docker compose version
```

Optional (run Docker without sudo):
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Get the repository files (GitHub)
Clone the repository from GitHub and enter the project folder:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd testing-dashboard
```

1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Configure Supabase (cloud or self-host). Update `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Run database migrations + seed:
   ```bash
   supabase db reset
   ```
   Or apply SQL manually from `supabase/migrations` and `supabase/seed/seed.sql`.
4. Start services:
   ```bash
   docker compose up --build
   ```
5. Open the app: `http://localhost:3000`
   - Seed user: `admin@demo.local` / `password123`

## Services
- `apps/web`: Next.js UI + API routes
- `apps/worker`: BullMQ background jobs (connectors + news)
- `packages/shared`: shared types + metrics utilities

## Health checks
- Web: `GET /api/health`
- Worker: `GET http://localhost:4001/health`

## Supabase setup
Tables + RLS are defined in `supabase/migrations`:
- `001_init.sql` tables and helper functions
- `002_policies.sql` RLS policies
- `003_storage.sql` storage bucket policies

Seed data in `supabase/seed/seed.sql`:
- Org + admin user
- 10 companies
- 12 months of metrics
- sample news + thesis

## n8n integration
Environment variables:
- `N8N_EMBED_MODE=iframe|webhook`
- `NEXT_PUBLIC_N8N_CHAT_URL` (iframe mode)
- `N8N_WEBHOOK_URL` (webhook mode)
- `N8N_SHARED_SECRET` (optional header shared secret)

Iframe mode requirements:
- Configure n8n to allow embedding: set CSP `frame-ancestors` to include your dashboard origin.
- Remove/adjust `X-Frame-Options` if present.

Webhook mode:
- Dashboard sends `{ action, message, context, orgId, userId }` to `N8N_WEBHOOK_URL`.
- Add CORS for your dashboard origin if the n8n webhook is external.

Thesis ingestion:
- Upload calls n8n webhook with `{ docId, storageUrl, tags, orgId }`.

## Connectors
Backoffice lets admins store connector secrets (encrypted at rest):
- Crunchbase
- PitchBook
- Spectre (generic REST)

Worker jobs:
- Hourly news sync
- Nightly connector sync
- Manual sync/test via Backoffice (queues BullMQ jobs)

## Feature flags
Store flags in `settings.feature_flags_json`. Example:
```json
{ "FEATURE_NEWS": true, "FEATURE_CHAT": true }
```

## Nice-to-haves implemented
- Alerts: at-risk flags on company list (runway/burn multiple/ARR decline)
- Benchmarking: sector medians displayed on company profiles

## Env var reference
See `.env.example` for full list.
Generate an encryption key with:
```bash
openssl rand -base64 32
```

## Development
From repo root (non-docker):
```bash
npm install
npm run dev
```

## Notes
- Connector integrations are stubbed until real API access is provided.
- Secrets are encrypted using `APP_ENCRYPTION_KEY` (base64-encoded 32-byte key).
- RLS enforces org-level isolation and role-based access.

