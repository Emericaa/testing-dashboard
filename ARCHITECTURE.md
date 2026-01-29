# Architecture

## Overview
This repository is a production-grade, self-hosted VC dashboard composed of a Next.js web app, a Node.js worker, and shared packages. The system is designed for a single tenant today but is structured for multi-tenant org scoping and strict RBAC.

## Key Decisions
- **Frontend**: Next.js (App Router) + TypeScript for server components, route handlers, and fast iteration.
- **UI**: Tailwind + shadcn/ui primitives for a clean, VC-grade interface.
- **Charts**: Recharts for lightweight time series and categorical charts.
- **Auth & DB**: Supabase (Auth + Postgres + Storage) with RLS enforcing org isolation and role access.
- **API Layer**: Next.js Route Handlers to keep the stack cohesive and simple to deploy.
- **Jobs & Sync**: BullMQ + Redis for background jobs (nightly full sync + hourly incremental) with a separate worker service.
- **Caching**: Redis optional cache for news and connector calls.
- **Secrets**: Connector secrets are encrypted at rest with AES-256-GCM using an app-level key from env.

## Services
- **apps/web**: Next.js web app serving UI and API routes.
- **apps/worker**: Node worker processing BullMQ jobs (connectors, news ingestion, metrics precompute).
- **packages/shared**: Shared types, RBAC helpers, and encryption utilities.
- **supabase**: SQL migrations, RLS policies, and seed data.

## Data Flow
1. User authenticates via Supabase Auth.
2. UI calls Next.js Route Handlers for data access and actions.
3. Route handlers query Supabase with org scoping and RBAC.
4. Worker syncs external data sources into Supabase and caches to Redis.
5. n8n integration is called for thesis ingestion and chat responses.

## Tenancy & Security
- Every table includes an `org_id` and RLS policies enforce org isolation.
- Roles: `admin`, `partner`, `analyst`, `viewer` with route-level checks.
- Connector secrets are stored encrypted and never saved in plaintext.

## n8n Integration
- **Iframe mode**: Embed hosted n8n chat URL in the Chat page.
- **Webhook mode**: Custom chat UI sends messages to an n8n webhook.
- `N8N_EMBED_MODE` toggles the active approach.

## Observability
- `/api/health` for web and worker health checks.
- Structured JSON logging (app + worker) with request IDs.

## Deployment
- `docker-compose.yml` orchestrates web, worker, and Redis.
- Supabase can be cloud or self-hosted; configuration is documented in README.

## Extensibility
- Connectors implement a shared interface to support Spectre, Crunchbase, PitchBook.
- News provider is pluggable via RSS list (NewsAPI/GDELT can be added later).
