-- Optional, per rule #2's pattern: a photo is recommended, never required. Stores the
-- Storage object path (bucket 'meal-images'), not the image itself.
alter table public.meals
  add column image_path text;
