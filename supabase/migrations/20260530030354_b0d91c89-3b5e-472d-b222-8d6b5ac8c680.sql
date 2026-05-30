
-- Set search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Lock down SECURITY DEFINER function execution
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.is_staff(uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;

-- Restrict media bucket listing to staff (still public read by direct URL via public bucket)
drop policy if exists "Media bucket public read" on storage.objects;
create policy "Media bucket authenticated list" on storage.objects for select to authenticated using (bucket_id = 'media');
