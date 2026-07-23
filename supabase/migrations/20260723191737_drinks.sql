-- Rule (CLAUDE.md #3): drinks are independent of meals and weigh-ins -- logging water must
-- work on a day with no meals logged. No foreign key to a "day" row.
--
-- Rule (CLAUDE.md #7): log_date is stored independently of drunk_at.
create table public.drinks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_label text,
  amount_l numeric not null,
  -- Free text: source data allows Water, Coffee/Tea, Buttermilk/Lassi, Electrolyte, Other,
  -- and the option list is user-editable.
  drink_type text not null default 'Water',
  drunk_at timestamptz not null default now(),
  log_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index drinks_user_log_date_idx on public.drinks (user_id, log_date);

alter table public.drinks enable row level security;

create policy "drinks_select_own"
  on public.drinks for select
  using (auth.uid() = user_id);

create policy "drinks_insert_own"
  on public.drinks for insert
  with check (auth.uid() = user_id);

create policy "drinks_update_own"
  on public.drinks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "drinks_delete_own"
  on public.drinks for delete
  using (auth.uid() = user_id);
