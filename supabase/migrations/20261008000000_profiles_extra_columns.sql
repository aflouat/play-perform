-- /api/students envoie ces colonnes dans l'upsert profiles ; sans elles, profiles (et scores via la FK) n'étaient jamais créés.
alter table public.profiles add column if not exists parent_id uuid references auth.users(id) on delete cascade;
alter table public.profiles add column if not exists gradient  text;
alter table public.profiles add column if not exists tagline   text;
alter table public.profiles add column if not exists age       integer;
