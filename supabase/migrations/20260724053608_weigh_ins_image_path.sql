-- Optional daily body photo alongside a weigh-in. Stores the Storage object path (bucket
-- 'body-images'), not the image itself.
alter table public.weigh_ins
  add column image_path text;
