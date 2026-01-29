-- 001_init.sql
create extension if not exists "pgcrypto";

create schema if not exists app;

create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key references auth.users on delete cascade,
  org_id uuid not null references orgs(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin','partner','analyst','viewer')),
  created_at timestamptz not null default now()
);

create table if not exists settings (
  org_id uuid primary key references orgs(id) on delete cascade,
  branding_json jsonb,
  feature_flags_json jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null,
  domain text,
  sector text,
  stage text,
  geo text,
  status text,
  created_at timestamptz not null default now()
);

create table if not exists company_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  date date not null,
  metric_key text not null,
  metric_value numeric not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists funding_rounds (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  round_type text,
  amount numeric,
  announced_at date,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists thesis_docs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  title text not null,
  tags text[],
  storage_path text,
  source_url text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  title text not null,
  url text not null,
  url_hash text not null,
  source text,
  published_at timestamptz,
  summary text,
  tags text[],
  created_at timestamptz not null default now(),
  unique (org_id, url_hash)
);

create table if not exists connector_secrets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  connector_type text not null,
  encrypted_secret_blob text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, connector_type)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  actor_user_id uuid references users(id),
  action text not null,
  entity_type text,
  entity_id text,
  meta_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists sector_benchmarks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  sector text not null,
  metric_key text not null,
  metric_value numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists company_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  org_id uuid not null references orgs(id) on delete cascade,
  author_id uuid references users(id),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists dealflow_submissions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  company_name text not null,
  founder_name text,
  contact_email text,
  sector text,
  stage text,
  notes text,
  score numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_org on users(org_id);
create index if not exists idx_companies_org on companies(org_id);
create index if not exists idx_company_metrics_company on company_metrics(company_id);
create index if not exists idx_company_metrics_date on company_metrics(date);
create index if not exists idx_funding_rounds_company on funding_rounds(company_id);
create index if not exists idx_thesis_org on thesis_docs(org_id);
create index if not exists idx_news_org on news_items(org_id);
create index if not exists idx_connector_org on connector_secrets(org_id);
create index if not exists idx_audit_org on audit_logs(org_id);
create index if not exists idx_notes_company on company_notes(company_id);
create index if not exists idx_benchmarks_org on sector_benchmarks(org_id);

create or replace function app.current_org_id() returns uuid language sql stable as $$
  select org_id from public.users where id = auth.uid();
$$;

create or replace function app.current_role() returns text language sql stable as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function app.has_role(role_name text) returns boolean language sql stable as $$
  select app.current_role() = role_name;
$$;

create or replace function app.has_any_role(role_names text[]) returns boolean language sql stable as $$
  select app.current_role() = any(role_names);
$$;
