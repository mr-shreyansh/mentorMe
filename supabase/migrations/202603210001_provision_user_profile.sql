create or replace function public.provision_user_profile(
  p_auth_user_id uuid,
  p_github_id bigint,
  p_email text default null,
  p_full_name text default null,
  p_avatar_url text default null,
  p_username text default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if auth.uid() <> p_auth_user_id then
    raise exception 'auth user mismatch';
  end if;

  if p_github_id is null or p_github_id <= 0 then
    raise exception 'invalid github id';
  end if;

  insert into public.users (id, created_at, email, full_name, avatar_url, username)
  values (p_github_id, now(), p_email, p_full_name, p_avatar_url, p_username)
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.provision_user_profile(uuid, bigint, text, text, text, text) from public;
grant execute on function public.provision_user_profile(uuid, bigint, text, text, text, text) to authenticated;
