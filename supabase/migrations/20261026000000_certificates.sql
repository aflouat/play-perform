-- Registry of certificates (PDF with QR code, public verification at /verifier/<reference>).
-- A certificate is issued automatically once the learner is eligible to the diploma; its printed fields are signed
-- (HMAC, secret on the server) and can never change: Play Perform may only revoke it. Service role only.
create table if not exists public.certificates (
  reference       text primary key,
  profile_id      text not null,
  organization_id uuid references public.organizations(id) on delete set null,
  skill_id        text not null,
  first_name      text not null,
  last_name       text not null,
  skill_name      text not null,
  level_label     text not null,
  centre_name     text,
  issued_on       date not null,
  signature       text not null,
  created_at      timestamptz not null default now(),
  revoked_at      timestamptz,
  revoked_reason  text
);
-- One live certificate per learner and skill
create unique index if not exists certificates_live_idx on public.certificates (profile_id, skill_id) where revoked_at is null;
alter table public.certificates enable row level security;

-- Integrity: signed fields are frozen and rows are never deleted (revocation only).
create or replace function public.certificates_guard() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then raise exception 'certificates are never deleted: revoke instead'; end if;
  if (new.reference, new.profile_id, new.skill_id, new.first_name, new.last_name, new.skill_name, new.level_label, new.centre_name, new.issued_on, new.signature)
     is distinct from
     (old.reference, old.profile_id, old.skill_id, old.first_name, old.last_name, old.skill_name, old.level_label, old.centre_name, old.issued_on, old.signature)
  then raise exception 'signed fields of a certificate cannot change'; end if;
  return new;
end $$;
drop trigger if exists certificates_guard on public.certificates;
create trigger certificates_guard before update or delete on public.certificates for each row execute function public.certificates_guard();
