-- Both functions are implicitly scoped to auth.uid() -- you only ever see the email of
-- someone already directly linked to your own account (as your collaborator, or as an
-- owner who shared with you), never an open lookup by arbitrary id. That keeps
-- find_user_id_by_email's email->id direction from being paired with an id->email direction
-- that would let anyone probe arbitrary users.
create or replace function public.list_my_collaborators()
returns table (link_id uuid, collaborator_id uuid, collaborator_email text, created_at timestamptz)
language sql
security definer
set search_path = public, auth
stable
as $$
  select al.id, al.collaborator_id, u.email, al.created_at
  from public.account_links al
  join auth.users u on u.id = al.collaborator_id
  where al.owner_id = auth.uid();
$$;

grant execute on function public.list_my_collaborators() to authenticated;

create or replace function public.list_accounts_shared_with_me()
returns table (link_id uuid, owner_id uuid, owner_email text, created_at timestamptz)
language sql
security definer
set search_path = public, auth
stable
as $$
  select al.id, al.owner_id, u.email, al.created_at
  from public.account_links al
  join auth.users u on u.id = al.owner_id
  where al.collaborator_id = auth.uid();
$$;

grant execute on function public.list_accounts_shared_with_me() to authenticated;
