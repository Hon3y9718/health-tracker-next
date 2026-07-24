-- Meal photos and daily body photos live in Supabase Storage, not the database (base64 in
-- Postgres would burn the 500MB DB quota, which is shared with every logged row, instead of
-- the separate 1GB Storage quota that exists for exactly this). Both buckets are private;
-- the app requests short-lived signed URLs only when a detail page is actually opened, never
-- on every dashboard visit.
insert into storage.buckets (id, name, public)
values
  ('meal-images', 'meal-images', false),
  ('body-images', 'body-images', false);

-- Objects are stored at "<user_id>/<uuid>.jpg" -- ownership is enforced by matching the
-- first path segment against auth.uid(), the same convention Supabase's own docs use.
create policy "meal_images_select_own"
  on storage.objects for select
  using (bucket_id = 'meal-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal_images_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'meal-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal_images_update_own"
  on storage.objects for update
  using (bucket_id = 'meal-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "meal_images_delete_own"
  on storage.objects for delete
  using (bucket_id = 'meal-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "body_images_select_own"
  on storage.objects for select
  using (bucket_id = 'body-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "body_images_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'body-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "body_images_update_own"
  on storage.objects for update
  using (bucket_id = 'body-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "body_images_delete_own"
  on storage.objects for delete
  using (bucket_id = 'body-images' and (storage.foldername(name))[1] = auth.uid()::text);
