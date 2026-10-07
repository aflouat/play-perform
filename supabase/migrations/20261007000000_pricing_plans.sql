-- Subscription plans (1 month, 1 year, lifetime), editable in /admin/pricing.
-- Prices are stored in cents. Public read; writes only through the API (service role + admin check).
create table public.pricing_plans (
  id           text primary key check (id in ('monthly', 'yearly', 'lifetime')),
  label        text not null,
  price_cents  integer not null check (price_cents >= 0),
  currency     text not null default 'EUR',
  description  text not null default '',
  features     text[] not null default '{}',
  highlighted  boolean not null default false,
  active       boolean not null default true,
  sort_order   smallint not null default 0,
  updated_at   timestamptz not null default now()
);

alter table public.pricing_plans enable row level security;
create policy pricing_plans_public_read on public.pricing_plans for select using (true);

-- Default prices (placeholders, to be adjusted in the admin area)
insert into public.pricing_plans (id, label, price_cents, description, features, highlighted, sort_order) values
  ('monthly',  '1 mois', 500,  'Sans engagement, résiliable à tout moment.',
   array['Toutes les compétences', 'Tests de niveau illimités', 'Suivi parent'], false, 1),
  ('yearly',   '1 an',   4900, 'Le meilleur rapport qualité-prix pour l''année scolaire.',
   array['Tout l''abonnement mensuel', 'Révisions anti-oubli', 'Badges et récompenses'], true, 2),
  ('lifetime', 'À vie',  9900, 'Un seul paiement, accès pour toujours.',
   array['Tout l''abonnement annuel', 'Nouvelles compétences incluses', 'Accès à vie'], false, 3);
