-- Orals on time slots: an examiner opens slots (30 min by default) in a centre he belongs to;
-- a learner of that centre, enrolled in the skill, books one; afterwards the examiner records the outcome
-- (passed → the level goes up through a corrected skill_evaluations row). Payment of a slot comes in a later migration.
-- Service role only (API routes): RLS on, no policy.
create table if not exists public.exam_slots (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  examiner_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at        timestamptz not null,
  duration_min     smallint not null default 30 check (duration_min in (15, 30, 45, 60)),
  status           text not null default 'available' check (status in ('available', 'booked', 'cancelled')),
  created_at       timestamptz not null default now()
);
-- An examiner cannot open the same start time twice (cancelled slots excepted)
create unique index if not exists exam_slots_examiner_start_idx on public.exam_slots (examiner_user_id, starts_at) where status <> 'cancelled';
create index if not exists exam_slots_open_idx on public.exam_slots (organization_id, starts_at) where status = 'available';

create table if not exists public.exam_bookings (
  id               uuid primary key default gen_random_uuid(),
  slot_id          uuid not null references public.exam_slots(id) on delete cascade,
  profile_id       text not null,
  organization_id  uuid not null references public.organizations(id),
  skill_id         text not null,
  level            smallint not null check (level between 1 and 5),
  status           text not null default 'booked' check (status in ('booked', 'cancelled', 'done')),
  outcome          text check (outcome in ('passed', 'failed', 'no_show')),
  examiner_comment text,
  evaluation_id    uuid references public.skill_evaluations(id),
  cancelled_by     text check (cancelled_by in ('learner', 'examiner')),
  created_at       timestamptz not null default now(),
  cancelled_at     timestamptz,
  completed_at     timestamptz
);
-- One live booking per slot
create unique index if not exists exam_bookings_slot_idx on public.exam_bookings (slot_id) where status <> 'cancelled';
create index if not exists exam_bookings_profile_idx on public.exam_bookings (profile_id, status);

alter table public.exam_slots enable row level security;
alter table public.exam_bookings enable row level security;

-- Atomic booking: the slot goes from available to booked and the booking is created in one transaction (null = slot taken).
create or replace function public.book_exam_slot(p_slot uuid, p_profile text, p_skill text, p_level integer) returns uuid
language plpgsql as $$
declare v_org uuid; v_id uuid;
begin
  update public.exam_slots set status = 'booked' where id = p_slot and status = 'available' returning organization_id into v_org;
  if v_org is null then return null; end if;
  insert into public.exam_bookings (slot_id, profile_id, organization_id, skill_id, level)
  values (p_slot, p_profile, v_org, p_skill, p_level) returning id into v_id;
  return v_id;
end $$;

-- Atomic cancellation: a learner frees the slot for others; an examiner closes it.
create or replace function public.cancel_exam_booking(p_booking uuid, p_by text) returns boolean
language plpgsql as $$
declare v_slot uuid;
begin
  update public.exam_bookings set status = 'cancelled', cancelled_by = p_by, cancelled_at = now()
  where id = p_booking and status = 'booked' returning slot_id into v_slot;
  if v_slot is null then return false; end if;
  update public.exam_slots set status = case when p_by = 'learner' then 'available' else 'cancelled' end where id = v_slot;
  return true;
end $$;

revoke execute on function public.book_exam_slot(uuid, text, text, integer) from public, anon, authenticated;
revoke execute on function public.cancel_exam_booking(uuid, text) from public, anon, authenticated;
grant execute on function public.book_exam_slot(uuid, text, text, integer) to service_role;
grant execute on function public.cancel_exam_booking(uuid, text) to service_role;
