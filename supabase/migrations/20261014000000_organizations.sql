-- Multi-organisation (franchise): the parent company, training centres (personnes morales) and their members.
-- Everything that exists today, and every anonymous record, belongs to the parent company.
create table public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  kind       text not null default 'center' check (kind in ('parent', 'center')),
  created_at timestamptz not null default now()
);

insert into public.organizations (id, name, slug, kind)
values ('00000000-0000-4000-8000-000000000001', 'Play Perform', 'play-perform', 'parent');

-- A person can belong to several centres (an examiner often does) with one or more roles.
create table public.memberships (
  user_id         uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role            text not null check (role in ('org_admin', 'teacher', 'examiner')),
  email           text not null,
  created_at      timestamptz not null default now(),
  primary key (user_id, organization_id, role)
);
create index memberships_org_idx on public.memberships (organization_id);

-- Super admins of the platform (ADMIN_EMAILS stays a bootstrap super admin list).
create table public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.students          add column organization_id uuid not null default '00000000-0000-4000-8000-000000000001' references public.organizations(id);
alter table public.profiles          add column organization_id uuid not null default '00000000-0000-4000-8000-000000000001' references public.organizations(id);
alter table public.skill_enrollments add column organization_id uuid not null default '00000000-0000-4000-8000-000000000001' references public.organizations(id);
alter table public.skill_evaluations add column organization_id uuid not null default '00000000-0000-4000-8000-000000000001' references public.organizations(id);

create index students_org_idx          on public.students (organization_id);
create index skill_enrollments_org_idx on public.skill_enrollments (organization_id, status);
create index skill_evaluations_org_idx on public.skill_evaluations (organization_id, status);

-- Access only through the API routes (service role). Existing anon policies on profiles/scores/... are unchanged.
alter table public.organizations   enable row level security;
alter table public.memberships     enable row level security;
alter table public.platform_admins enable row level security;
