-- 003_storage.sql
insert into storage.buckets (id, name, public)
values ('thesis', 'thesis', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

create policy thesis_select on storage.objects for select using (
  bucket_id = 'thesis' and auth.role() = 'authenticated'
);

create policy thesis_insert on storage.objects for insert with check (
  bucket_id = 'thesis' and auth.role() = 'authenticated'
);

create policy branding_select on storage.objects for select using (
  bucket_id = 'branding' and auth.role() = 'authenticated'
);

create policy branding_insert on storage.objects for insert with check (
  bucket_id = 'branding' and auth.role() = 'authenticated'
);
