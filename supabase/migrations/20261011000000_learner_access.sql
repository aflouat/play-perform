-- Learner access: a short code given by the teacher lets a student open their own skills.
alter table public.students add column if not exists access_code text unique;
