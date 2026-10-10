-- Information requests left on a centre's public page (/centres/[slug]): the centre recruits, the back office stays central.
-- Personal data of prospects (often minors' families): service role only (RLS on, no policy), consent recorded.
create table if not exists public.centre_leads (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name      text not null,
  contact         text not null,
  training_path   text,
  message         text not null default '',
  consent_at      timestamptz not null default now(),
  status          text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists centre_leads_org_idx on public.centre_leads (organization_id, created_at desc);
alter table public.centre_leads enable row level security;
