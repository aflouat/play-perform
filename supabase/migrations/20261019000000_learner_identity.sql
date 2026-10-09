-- Learner identity: students.name stays the first name; the last name is kept for the diploma only.
-- The pseudonym (students.nickname) is the only name other learners see.
alter table public.students add column if not exists last_name text;
