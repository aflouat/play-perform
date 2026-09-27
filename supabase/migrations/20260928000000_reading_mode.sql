-- v0.7.0 : nouveau mode élève « reading » (lecture syllabique, route /lecture)
alter table public.students drop constraint students_mode_check;
alter table public.students add constraint students_mode_check
  check (mode in ('quiz', 'words', 'keyboard', 'reading'));
