-- New log type, independent of meals/drinks/weigh-ins (rule #3) -- no FK to a "day" table,
-- no dependency on any other log existing for the same date.
--
-- Only exercise_type is required (the equivalent of rule #2's "only calories is required" --
-- "what did you do" is the one thing that must not block submission). Duration and notes are
-- optional so logging a workout stays low-friction.
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_type text not null,
  duration_minutes numeric,
  notes text,
  logged_at timestamptz not null default now(),
  log_date date not null,
  created_at timestamptz not null default now()
);

create index exercises_user_log_date_idx on public.exercises (user_id, log_date);

alter table public.exercises enable row level security;

create policy "exercises_select_own"
  on public.exercises for select
  using (auth.uid() = user_id);

create policy "exercises_insert_own"
  on public.exercises for insert
  with check (auth.uid() = user_id);

create policy "exercises_update_own"
  on public.exercises for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "exercises_delete_own"
  on public.exercises for delete
  using (auth.uid() = user_id);
