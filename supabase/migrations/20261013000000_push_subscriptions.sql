-- Web Push: one row per browser/device that accepted notifications, with the reminders to deliver.
-- Access only through the API routes (service role): RLS enabled without policies.
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  profile_id text not null,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  timezone   text not null default 'Europe/Paris',
  reminders  jsonb not null default '[]'::jsonb,
  sent       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_subscriptions_profile_idx on public.push_subscriptions (profile_id);

alter table public.push_subscriptions enable row level security;
