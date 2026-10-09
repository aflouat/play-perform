-- Legal identity of a training centre (personne morale): company (SIREN), establishment (SIRET) and address.
alter table public.organizations
  add column if not exists legal_name  text,
  add column if not exists siren       text check (siren ~ '^[0-9]{9}$'),
  add column if not exists siret       text check (siret ~ '^[0-9]{14}$'),
  add column if not exists address     text,
  add column if not exists postal_code text check (postal_code ~ '^[0-9]{5}$'),
  add column if not exists city        text;

-- One establishment = one centre.
create unique index if not exists organizations_siret_idx on public.organizations (siret) where siret is not null;
