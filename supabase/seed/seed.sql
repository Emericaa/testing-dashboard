-- seed.sql
DO $$
DECLARE
  org_id uuid := gen_random_uuid();
  user_id uuid := gen_random_uuid();
BEGIN
  insert into orgs (id, name) values (org_id, 'Demo Ventures');

  insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values (user_id, 'admin@demo.local', crypt('password123', gen_salt('bf')), now(), now(), now());

  insert into users (id, org_id, email, role)
  values (user_id, org_id, 'admin@demo.local', 'admin');

  insert into settings (org_id, branding_json, feature_flags_json)
  values (
    org_id,
    '{"brand-500": "43 91 191", "brand-700": "19 54 126"}'::jsonb,
    '{"FEATURE_NEWS": true, "FEATURE_CHAT": true, "FEATURE_THESIS": true}'::jsonb
  );

  insert into companies (id, org_id, name, domain, sector, stage, geo, status)
  values
    (gen_random_uuid(), org_id, 'Atlas AI', 'atlas.ai', 'AI', 'Series A', 'US', 'active'),
    (gen_random_uuid(), org_id, 'SignalForge', 'signalforge.io', 'Fintech', 'Seed', 'UK', 'active'),
    (gen_random_uuid(), org_id, 'Helix Cloud', 'helixcloud.com', 'Cloud', 'Series B', 'US', 'active'),
    (gen_random_uuid(), org_id, 'Flowdesk', 'flowdesk.io', 'SaaS', 'Seed', 'EU', 'at-risk'),
    (gen_random_uuid(), org_id, 'NovaBio', 'novabio.com', 'Health', 'Series A', 'US', 'active'),
    (gen_random_uuid(), org_id, 'MarketPulse', 'marketpulse.ai', 'AI', 'Seed', 'US', 'active'),
    (gen_random_uuid(), org_id, 'QuantumLeaf', 'quantumleaf.io', 'Climate', 'Series A', 'EU', 'active'),
    (gen_random_uuid(), org_id, 'GridWorks', 'gridworks.co', 'Energy', 'Series B', 'US', 'active'),
    (gen_random_uuid(), org_id, 'AxisPay', 'axispay.com', 'Fintech', 'Series A', 'LATAM', 'active'),
    (gen_random_uuid(), org_id, 'Luma Health', 'lumahealth.ai', 'Health', 'Seed', 'US', 'active');

  insert into sector_benchmarks (org_id, sector, metric_key, metric_value)
  values
    (org_id, 'AI', 'arr_growth_median', 0.55),
    (org_id, 'SaaS', 'gross_margin_median', 0.72),
    (org_id, 'Fintech', 'burn_multiple_median', 1.8),
    (org_id, 'Health', 'runway_median', 12);

  insert into funding_rounds (company_id, round_type, amount, announced_at, source)
  select id, 'Seed', 2500000, (current_date - interval '18 months')::date, 'seed'
  from companies where companies.org_id = org_id limit 4;

  insert into funding_rounds (company_id, round_type, amount, announced_at, source)
  select id, 'Series A', 12000000, (current_date - interval '8 months')::date, 'seed'
  from companies where companies.org_id = org_id offset 4 limit 3;

  insert into news_items (org_id, title, url, url_hash, source, published_at, summary)
  values
    (org_id, 'Global VC funding rebounds in Q4', 'https://example.com/vc-q4', encode(digest('https://example.com/vc-q4', 'sha256'), 'hex'), 'DemoWire', now(), 'Sample news item seeded for demo.'),
    (org_id, 'AI infrastructure raises mega round', 'https://example.com/ai-round', encode(digest('https://example.com/ai-round', 'sha256'), 'hex'), 'DemoWire', now(), 'Another sample news item.');

  insert into thesis_docs (org_id, title, tags, storage_path, created_by)
  values
    (org_id, 'AI Infrastructure Thesis', array['AI','Infrastructure'], 'https://example.com/thesis.pdf', user_id),
    (org_id, 'Fintech Platform Thesis', array['Fintech','B2B'], 'https://example.com/thesis-fintech.pdf', user_id);

  insert into company_notes (company_id, org_id, author_id, content)
  select id, org_id, user_id, 'Initial memo and diligence notes.' from companies where companies.org_id = org_id limit 3;

  insert into dealflow_submissions (org_id, company_name, founder_name, contact_email, sector, stage, notes, score)
  values (org_id, 'Vertex Labs', 'Jamie Lee', 'jamie@vertexlabs.ai', 'AI', 'Seed', 'Inbound dealflow submission.', 7.8);

  -- Metrics seed: 12 months of MRR/ARR/Burn/Runway/Headcount
  insert into company_metrics (company_id, date, metric_key, metric_value, source)
  select c.id,
         (date_trunc('month', now()) - (interval '1 month' * gs))::date,
         'mrr',
         (10000 + c_idx * 1200 + gs * 250),
         'seed'
  from (select id, row_number() over () as c_idx from companies where companies.org_id = org_id) c
  cross join generate_series(0, 11) gs;

  insert into company_metrics (company_id, date, metric_key, metric_value, source)
  select c.id,
         (date_trunc('month', now()) - (interval '1 month' * gs))::date,
         'arr',
         (10000 + c_idx * 1200 + gs * 250) * 12,
         'seed'
  from (select id, row_number() over () as c_idx from companies where companies.org_id = org_id) c
  cross join generate_series(0, 11) gs;

  insert into company_metrics (company_id, date, metric_key, metric_value, source)
  select c.id,
         (date_trunc('month', now()) - (interval '1 month' * gs))::date,
         'burn',
         (500 + c_idx * 60 + gs * 20),
         'seed'
  from (select id, row_number() over () as c_idx from companies where companies.org_id = org_id) c
  cross join generate_series(0, 11) gs;

  insert into company_metrics (company_id, date, metric_key, metric_value, source)
  select c.id,
         (date_trunc('month', now()) - (interval '1 month' * gs))::date,
         'runway',
         greatest(3, 18 - gs),
         'seed'
  from (select id, row_number() over () as c_idx from companies where companies.org_id = org_id) c
  cross join generate_series(0, 11) gs;

  insert into company_metrics (company_id, date, metric_key, metric_value, source)
  select c.id,
         (date_trunc('month', now()) - (interval '1 month' * gs))::date,
         'headcount',
         (20 + c_idx * 3 + gs),
         'seed'
  from (select id, row_number() over () as c_idx from companies where companies.org_id = org_id) c
  cross join generate_series(0, 11) gs;
END $$;
