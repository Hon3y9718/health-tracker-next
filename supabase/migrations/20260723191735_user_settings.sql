-- user_settings holds every target and reference number the rest of the schema reads from.
-- Rule (CLAUDE.md #1): no calorie/protein/fiber/water/weight number is ever hardcoded
-- anywhere else -- SQL views and app code both read it from here. Changing a value here
-- must recompute history, not just future days, because views join against it live
-- rather than snapshotting it onto each log row.
--
-- Defaults match the user's real plan (Notion "Dashboard" page): 2000 kcal, 150g protein,
-- 30g fiber, 3L water, 101kg starting weight, 70-75kg goal band.
create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  calorie_target integer not null default 2000,
  protein_target_g numeric not null default 150,
  fiber_target_g numeric not null default 30,
  water_target_l numeric not null default 3.0,
  starting_weight_kg numeric not null default 101,
  goal_weight_low_kg numeric not null default 70,
  goal_weight_high_kg numeric not null default 75,
  -- Not part of the original Notion tracker (which hardcoded height into its BMI formula).
  -- Nullable: BMI is only computable once this is set, and it's not one of the core targets.
  height_cm numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goal_band_valid check (goal_weight_high_kg >= goal_weight_low_kg)
);

alter table public.user_settings enable row level security;

create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_settings_delete_own"
  on public.user_settings for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- Every new auth user gets a settings row immediately so the app never has to special-case
-- "no settings yet" -- forms and views can always assume one row exists per user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
