-- Full collaborator access: owner_id grants collaborator_id read/write on their data.
-- Both sides are auth.users -- no separate "pending invite" state, per the chosen design
-- (add by email, access is immediate once granted; no email-sending infra to gate on).
create table public.account_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  collaborator_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint account_links_not_self check (owner_id <> collaborator_id),
  constraint account_links_unique unique (owner_id, collaborator_id)
);

alter table public.account_links enable row level security;

create policy "account_links_select_own_or_shared"
  on public.account_links for select
  using (auth.uid() = owner_id or auth.uid() = collaborator_id);

-- Only the owner can grant access to their own account.
create policy "account_links_insert_owner_only"
  on public.account_links for insert
  with check (auth.uid() = owner_id);

-- Either side can end the link: the owner revokes, or the collaborator leaves.
create policy "account_links_delete_owner_or_collaborator"
  on public.account_links for delete
  using (auth.uid() = owner_id or auth.uid() = collaborator_id);

-- Single source of truth for "can auth.uid() act on target_user_id's data" -- reused by
-- every table's RLS policy (next migration) and by the storage bucket policies. SECURITY
-- DEFINER so it reads account_links directly rather than through the caller's own RLS view
-- of that table (avoids recursive policy evaluation), with a pinned search_path per
-- Postgres's guidance for SECURITY DEFINER functions.
create or replace function public.has_account_access(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() = target_user_id
    or exists (
      select 1 from public.account_links
      where owner_id = target_user_id and collaborator_id = auth.uid()
    );
$$;

grant execute on function public.has_account_access(uuid) to authenticated;

-- Looks up a user id by email so an owner can add a collaborator by email without the
-- client ever querying auth.users directly (Supabase doesn't expose that table to
-- PostgREST). Returns null rather than raising if not found; reveals nothing else about
-- the account -- just whether it exists and its id.
create or replace function public.find_user_id_by_email(lookup_email text)
returns uuid
language sql
security definer
set search_path = public, auth
stable
as $$
  select id from auth.users where email = lookup_email limit 1;
$$;

grant execute on function public.find_user_id_by_email(text) to authenticated;
