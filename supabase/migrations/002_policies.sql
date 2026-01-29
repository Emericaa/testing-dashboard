-- 002_policies.sql
alter table orgs enable row level security;
alter table users enable row level security;
alter table settings enable row level security;
alter table companies enable row level security;
alter table company_metrics enable row level security;
alter table funding_rounds enable row level security;
alter table thesis_docs enable row level security;
alter table news_items enable row level security;
alter table connector_secrets enable row level security;
alter table audit_logs enable row level security;
alter table sector_benchmarks enable row level security;
alter table company_notes enable row level security;
alter table dealflow_submissions enable row level security;

create policy orgs_select on orgs for select using (id = app.current_org_id());

create policy users_select on users for select using (org_id = app.current_org_id());
create policy users_insert on users for insert with check (app.has_role('admin') and org_id = app.current_org_id());
create policy users_update on users for update using (app.has_role('admin')) with check (org_id = app.current_org_id());
create policy users_delete on users for delete using (app.has_role('admin'));

create policy settings_select on settings for select using (org_id = app.current_org_id());
create policy settings_write on settings for insert with check (app.has_role('admin') and org_id = app.current_org_id());
create policy settings_update on settings for update using (app.has_role('admin')) with check (org_id = app.current_org_id());

create policy companies_select on companies for select using (org_id = app.current_org_id());
create policy companies_write on companies for insert with check (app.has_any_role(array['admin','partner','analyst']) and org_id = app.current_org_id());
create policy companies_update on companies for update using (app.has_any_role(array['admin','partner','analyst'])) with check (org_id = app.current_org_id());
create policy companies_delete on companies for delete using (app.has_role('admin'));

create policy company_metrics_select on company_metrics for select using (
  company_id in (select id from companies where org_id = app.current_org_id())
);
create policy company_metrics_write on company_metrics for insert with check (
  company_id in (select id from companies where org_id = app.current_org_id())
);
create policy company_metrics_update on company_metrics for update using (
  company_id in (select id from companies where org_id = app.current_org_id())
) with check (
  company_id in (select id from companies where org_id = app.current_org_id())
);

create policy funding_rounds_select on funding_rounds for select using (
  company_id in (select id from companies where org_id = app.current_org_id())
);
create policy funding_rounds_write on funding_rounds for insert with check (
  company_id in (select id from companies where org_id = app.current_org_id())
);
create policy funding_rounds_update on funding_rounds for update using (
  company_id in (select id from companies where org_id = app.current_org_id())
) with check (
  company_id in (select id from companies where org_id = app.current_org_id())
);

create policy thesis_select on thesis_docs for select using (org_id = app.current_org_id());
create policy thesis_write on thesis_docs for insert with check (app.has_any_role(array['admin','partner','analyst']) and org_id = app.current_org_id());
create policy thesis_update on thesis_docs for update using (app.has_any_role(array['admin','partner'])) with check (org_id = app.current_org_id());

create policy news_select on news_items for select using (org_id = app.current_org_id());

create policy connector_select on connector_secrets for select using (app.has_role('admin') and org_id = app.current_org_id());
create policy connector_write on connector_secrets for insert with check (app.has_role('admin') and org_id = app.current_org_id());
create policy connector_update on connector_secrets for update using (app.has_role('admin')) with check (org_id = app.current_org_id());

create policy audit_select on audit_logs for select using (app.has_any_role(array['admin','partner']) and org_id = app.current_org_id());
create policy audit_insert on audit_logs for insert with check (org_id = app.current_org_id());

create policy benchmarks_select on sector_benchmarks for select using (org_id = app.current_org_id());
create policy benchmarks_write on sector_benchmarks for insert with check (app.has_any_role(array['admin','partner']) and org_id = app.current_org_id());
create policy benchmarks_update on sector_benchmarks for update using (app.has_any_role(array['admin','partner'])) with check (org_id = app.current_org_id());

create policy notes_select on company_notes for select using (org_id = app.current_org_id());
create policy notes_write on company_notes for insert with check (org_id = app.current_org_id());
create policy notes_update on company_notes for update using (app.has_any_role(array['admin','partner']) and org_id = app.current_org_id()) with check (org_id = app.current_org_id());

create policy dealflow_select on dealflow_submissions for select using (org_id = app.current_org_id());
create policy dealflow_write on dealflow_submissions for insert with check (org_id = app.current_org_id());
