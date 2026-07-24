-- Replaces every "auth.uid() = user_id" policy with has_account_access(user_id), so a
-- collaborator (account_links.collaborator_id) can read/write the owner's rows exactly as
-- the owner can. has_account_access() already covers the auth.uid() = user_id case, so this
-- is a strict widening, not a behavior change for users with no collaborators.

-- meals
drop policy "meals_select_own" on public.meals;
drop policy "meals_insert_own" on public.meals;
drop policy "meals_update_own" on public.meals;
drop policy "meals_delete_own" on public.meals;

create policy "meals_select_shared"
  on public.meals for select
  using (public.has_account_access(user_id));

create policy "meals_insert_shared"
  on public.meals for insert
  with check (public.has_account_access(user_id));

create policy "meals_update_shared"
  on public.meals for update
  using (public.has_account_access(user_id))
  with check (public.has_account_access(user_id));

create policy "meals_delete_shared"
  on public.meals for delete
  using (public.has_account_access(user_id));

-- drinks
drop policy "drinks_select_own" on public.drinks;
drop policy "drinks_insert_own" on public.drinks;
drop policy "drinks_update_own" on public.drinks;
drop policy "drinks_delete_own" on public.drinks;

create policy "drinks_select_shared"
  on public.drinks for select
  using (public.has_account_access(user_id));

create policy "drinks_insert_shared"
  on public.drinks for insert
  with check (public.has_account_access(user_id));

create policy "drinks_update_shared"
  on public.drinks for update
  using (public.has_account_access(user_id))
  with check (public.has_account_access(user_id));

create policy "drinks_delete_shared"
  on public.drinks for delete
  using (public.has_account_access(user_id));

-- weigh_ins
drop policy "weigh_ins_select_own" on public.weigh_ins;
drop policy "weigh_ins_insert_own" on public.weigh_ins;
drop policy "weigh_ins_update_own" on public.weigh_ins;
drop policy "weigh_ins_delete_own" on public.weigh_ins;

create policy "weigh_ins_select_shared"
  on public.weigh_ins for select
  using (public.has_account_access(user_id));

create policy "weigh_ins_insert_shared"
  on public.weigh_ins for insert
  with check (public.has_account_access(user_id));

create policy "weigh_ins_update_shared"
  on public.weigh_ins for update
  using (public.has_account_access(user_id))
  with check (public.has_account_access(user_id));

create policy "weigh_ins_delete_shared"
  on public.weigh_ins for delete
  using (public.has_account_access(user_id));

-- exercises
drop policy "exercises_select_own" on public.exercises;
drop policy "exercises_insert_own" on public.exercises;
drop policy "exercises_update_own" on public.exercises;
drop policy "exercises_delete_own" on public.exercises;

create policy "exercises_select_shared"
  on public.exercises for select
  using (public.has_account_access(user_id));

create policy "exercises_insert_shared"
  on public.exercises for insert
  with check (public.has_account_access(user_id));

create policy "exercises_update_shared"
  on public.exercises for update
  using (public.has_account_access(user_id))
  with check (public.has_account_access(user_id));

create policy "exercises_delete_shared"
  on public.exercises for delete
  using (public.has_account_access(user_id));

-- weigh_in_images
drop policy "weigh_in_images_select_own" on public.weigh_in_images;
drop policy "weigh_in_images_insert_own" on public.weigh_in_images;
drop policy "weigh_in_images_update_own" on public.weigh_in_images;
drop policy "weigh_in_images_delete_own" on public.weigh_in_images;

create policy "weigh_in_images_select_shared"
  on public.weigh_in_images for select
  using (public.has_account_access(user_id));

create policy "weigh_in_images_insert_shared"
  on public.weigh_in_images for insert
  with check (public.has_account_access(user_id));

create policy "weigh_in_images_update_shared"
  on public.weigh_in_images for update
  using (public.has_account_access(user_id))
  with check (public.has_account_access(user_id));

create policy "weigh_in_images_delete_shared"
  on public.weigh_in_images for delete
  using (public.has_account_access(user_id));

-- user_settings (targets are shared too -- a collaborator managing the account can adjust them)
drop policy "user_settings_select_own" on public.user_settings;
drop policy "user_settings_insert_own" on public.user_settings;
drop policy "user_settings_update_own" on public.user_settings;
drop policy "user_settings_delete_own" on public.user_settings;

create policy "user_settings_select_shared"
  on public.user_settings for select
  using (public.has_account_access(user_id));

create policy "user_settings_insert_shared"
  on public.user_settings for insert
  with check (public.has_account_access(user_id));

create policy "user_settings_update_shared"
  on public.user_settings for update
  using (public.has_account_access(user_id))
  with check (public.has_account_access(user_id));

create policy "user_settings_delete_shared"
  on public.user_settings for delete
  using (public.has_account_access(user_id));

-- Storage: object paths are "<owner_user_id>/<uuid>.<ext>" -- the folder name is always the
-- account owner's id, never the collaborator's, so has_account_access is checked against it.
drop policy "meal_images_select_own" on storage.objects;
drop policy "meal_images_insert_own" on storage.objects;
drop policy "meal_images_update_own" on storage.objects;
drop policy "meal_images_delete_own" on storage.objects;

create policy "meal_images_select_shared"
  on storage.objects for select
  using (bucket_id = 'meal-images' and public.has_account_access(((storage.foldername(name))[1])::uuid));

create policy "meal_images_insert_shared"
  on storage.objects for insert
  with check (bucket_id = 'meal-images' and public.has_account_access(((storage.foldername(name))[1])::uuid));

create policy "meal_images_update_shared"
  on storage.objects for update
  using (bucket_id = 'meal-images' and public.has_account_access(((storage.foldername(name))[1])::uuid));

create policy "meal_images_delete_shared"
  on storage.objects for delete
  using (bucket_id = 'meal-images' and public.has_account_access(((storage.foldername(name))[1])::uuid));

drop policy "body_images_select_own" on storage.objects;
drop policy "body_images_insert_own" on storage.objects;
drop policy "body_images_update_own" on storage.objects;
drop policy "body_images_delete_own" on storage.objects;

create policy "body_images_select_shared"
  on storage.objects for select
  using (bucket_id = 'body-images' and public.has_account_access(((storage.foldername(name))[1])::uuid));

create policy "body_images_insert_shared"
  on storage.objects for insert
  with check (bucket_id = 'body-images' and public.has_account_access(((storage.foldername(name))[1])::uuid));

create policy "body_images_update_shared"
  on storage.objects for update
  using (bucket_id = 'body-images' and public.has_account_access(((storage.foldername(name))[1])::uuid));

create policy "body_images_delete_shared"
  on storage.objects for delete
  using (bucket_id = 'body-images' and public.has_account_access(((storage.foldername(name))[1])::uuid));
