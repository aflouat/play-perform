-- A new training centre asks to open its space; the parent company approves or refuses (SIREN / SIRET are checked by hand).
-- Access only through the API routes (service role): RLS enabled without policies.
create table public.centre_applications (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  legal_name      text not null,
  siren           text not null check (siren ~ '^[0-9]{9}$'),
  siret           text not null check (siret ~ '^[0-9]{14}$'),
  address         text not null,
  postal_code     text not null check (postal_code ~ '^[0-9]{5}$'),
  city            text not null,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  comment         text,
  organization_id uuid references public.organizations(id),
  created_at      timestamptz not null default now(),
  decided_at      timestamptz
);

-- One open application per e-mail, and one open or approved application per establishment.
create unique index centre_applications_email_pending_idx on public.centre_applications (lower(email)) where status = 'pending';
create unique index centre_applications_siret_open_idx on public.centre_applications (siret) where status in ('pending', 'approved');

alter table public.centre_applications enable row level security;
