-- Rule (CLAUDE.md #3): weigh-ins are independent of meals and drinks.
-- Rule (CLAUDE.md #7): log_date is stored independently of weighed_at.
create table public.weigh_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric not null,
  entry_label text,
  weighed_at timestamptz not null default now(),
  log_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index weigh_ins_user_log_date_idx on public.weigh_ins (user_id, log_date);

alter table public.weigh_ins enable row level security;

create policy "weigh_ins_select_own"
  on public.weigh_ins for select
  using (auth.uid() = user_id);

create policy "weigh_ins_insert_own"
  on public.weigh_ins for insert
  with check (auth.uid() = user_id);

create policy "weigh_ins_update_own"
  on public.weigh_ins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weigh_ins_delete_own"
  on public.weigh_ins for delete
  using (auth.uid() = user_id);
