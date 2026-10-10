-- Training path of a learner ("parcours de formation", e.g. technicien-laboratoire, mathematiques).
-- The 4 roadmap phases are generic; their chapters come from this path (catalogue in the app, common to every centre).
-- Null = not chosen yet: the learner picks a first one, then only the centre changes it.
alter table public.students add column if not exists training_path text;
