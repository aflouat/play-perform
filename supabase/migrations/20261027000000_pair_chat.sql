-- Chat of a pair during a common project (the weekly pair: open during its ISO week, archived afterwards).
-- Every message is kept and belongs to Play Perform as an audit trail (rules not respected): messages can never be
-- edited nor deleted (trigger), only reported. Learners see the open chat of their pair; the parent company sees all.
-- Service role only (API routes): RLS on, no policy.
create table if not exists public.chat_threads (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  context_kind    text not null check (context_kind in ('pair_week')),
  context_key     text not null,
  members_key     text not null,
  member_ids      text[] not null,
  opens_at        timestamptz not null,
  closes_at       timestamptz not null,
  created_at      timestamptz not null default now(),
  unique (organization_id, context_kind, context_key, members_key)
);

create table if not exists public.chat_messages (
  id                uuid primary key default gen_random_uuid(),
  thread_id         uuid not null references public.chat_threads(id) on delete restrict,
  author_profile_id text not null,
  body              text not null check (char_length(body) between 1 and 1000),
  created_at        timestamptz not null default now(),
  reported_at       timestamptz,
  reported_by       text
);
create index if not exists chat_messages_thread_idx on public.chat_messages (thread_id, created_at);
create index if not exists chat_messages_reported_idx on public.chat_messages (reported_at) where reported_at is not null;

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

-- Audit trail: a message is never deleted and its content never changes (reporting it is the only update).
create or replace function public.chat_messages_guard() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then raise exception 'chat messages are kept as an audit trail'; end if;
  if (new.thread_id, new.author_profile_id, new.body, new.created_at) is distinct from (old.thread_id, old.author_profile_id, old.body, old.created_at)
  then raise exception 'chat messages cannot be edited'; end if;
  return new;
end $$;
drop trigger if exists chat_messages_guard on public.chat_messages;
create trigger chat_messages_guard before update or delete on public.chat_messages for each row execute function public.chat_messages_guard();
