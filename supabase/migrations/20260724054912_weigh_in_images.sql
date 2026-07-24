-- Weight log entries can carry more than one photo (front/side, or more later), so this is a
-- proper one-to-many table rather than a fixed image_path column. Independent of meals
-- (rule #3 spirit extended): deleting a weigh-in cascades its images, but images never
-- gate creating or editing the weigh-in itself.
create table public.weigh_in_images (
  id uuid primary key default gen_random_uuid(),
  weigh_in_id uuid not null references public.weigh_ins (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Free text, not an enum, same reasoning as meal_label/drink_type: "Front", "Side", or
  -- whatever the user wants to call an angle, without a migration to add options.
  label text,
  image_path text not null,
  created_at timestamptz not null default now()
);

create index weigh_in_images_weigh_in_id_idx on public.weigh_in_images (weigh_in_id);

alter table public.weigh_in_images enable row level security;

create policy "weigh_in_images_select_own"
  on public.weigh_in_images for select
  using (auth.uid() = user_id);

create policy "weigh_in_images_insert_own"
  on public.weigh_in_images for insert
  with check (auth.uid() = user_id);

create policy "weigh_in_images_update_own"
  on public.weigh_in_images for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weigh_in_images_delete_own"
  on public.weigh_in_images for delete
  using (auth.uid() = user_id);

-- Carry forward any photo already uploaded under the old single-image_path column before
-- dropping it, so nothing already saved is lost.
insert into public.weigh_in_images (weigh_in_id, user_id, label, image_path)
select id, user_id, 'Front', image_path
from public.weigh_ins
where image_path is not null;

alter table public.weigh_ins
  drop column image_path;
