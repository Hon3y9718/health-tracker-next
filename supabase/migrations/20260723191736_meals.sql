-- Rule (CLAUDE.md #2): calories is the only required field. protein/carbs/fat/fiber are
-- nullable and no form may require them -- the user estimates macros from photos and often
-- won't know fibre or fat. A partially logged meal is strictly better than a missing one.
--
-- Rule (CLAUDE.md #3): meals are independent of drinks and weigh-ins. No foreign key to a
-- "day" -- there is no days table. Aggregation happens later, in views, grouped by log_date.
--
-- Rule (CLAUDE.md #7): log_date is stored, not derived from eaten_at. A meal eaten at 01:00
-- belongs to the previous day in the user's head; computing one from the other reintroduces
-- timezone off-by-one bugs.
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  calories numeric not null,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  -- Free text, not an enum: the source data explicitly allows adding/renaming meal labels
  -- anytime (Meal 1-6, Snack, Pre-workout, Post-workout, or anything the user types).
  meal_label text,
  eaten_at timestamptz not null default now(),
  log_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index meals_user_log_date_idx on public.meals (user_id, log_date);

alter table public.meals enable row level security;

create policy "meals_select_own"
  on public.meals for select
  using (auth.uid() = user_id);

create policy "meals_insert_own"
  on public.meals for insert
  with check (auth.uid() = user_id);

create policy "meals_update_own"
  on public.meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "meals_delete_own"
  on public.meals for delete
  using (auth.uid() = user_id);
