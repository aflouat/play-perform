-- Anonymous access (visitors, demo profiles) stays, but only on rows of the parent company.
-- Learners and teachers of other centres save their progress through the API (service role, ownership checked).
drop policy anon_all_profiles on public.profiles;
drop policy anon_all_scores   on public.scores;
drop policy anon_all_badges   on public.badges;
drop policy anon_all_quiz     on public.quiz_answers;
drop policy anon_all_keyboard on public.keyboard_progress;

create policy anon_parent_profiles on public.profiles for all to anon
  using (organization_id = '00000000-0000-4000-8000-000000000001')
  with check (organization_id = '00000000-0000-4000-8000-000000000001');

create policy anon_parent_scores on public.scores for all to anon
  using (exists (select 1 from public.profiles p where p.id = scores.profile_id and p.organization_id = '00000000-0000-4000-8000-000000000001'))
  with check (exists (select 1 from public.profiles p where p.id = scores.profile_id and p.organization_id = '00000000-0000-4000-8000-000000000001'));

create policy anon_parent_badges on public.badges for all to anon
  using (exists (select 1 from public.profiles p where p.id = badges.profile_id and p.organization_id = '00000000-0000-4000-8000-000000000001'))
  with check (exists (select 1 from public.profiles p where p.id = badges.profile_id and p.organization_id = '00000000-0000-4000-8000-000000000001'));

create policy anon_parent_quiz on public.quiz_answers for all to anon
  using (exists (select 1 from public.profiles p where p.id = quiz_answers.profile_id and p.organization_id = '00000000-0000-4000-8000-000000000001'))
  with check (exists (select 1 from public.profiles p where p.id = quiz_answers.profile_id and p.organization_id = '00000000-0000-4000-8000-000000000001'));

create policy anon_parent_keyboard on public.keyboard_progress for all to anon
  using (exists (select 1 from public.profiles p where p.id = keyboard_progress.profile_id and p.organization_id = '00000000-0000-4000-8000-000000000001'))
  with check (exists (select 1 from public.profiles p where p.id = keyboard_progress.profile_id and p.organization_id = '00000000-0000-4000-8000-000000000001'));
