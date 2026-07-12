-- Beauty Center - correccion final de accesos y ocupacion compartida.
-- Ejecutar una sola vez en Supabase > SQL Editor.

begin;

create schema if not exists private;

grant usage on schema public to authenticated, service_role;
grant usage on schema private to authenticated, service_role;

-- El frontend solo necesita leer su perfil. Las altas y ediciones pasan por la
-- Edge Function con service_role, que nunca se expone al navegador.
grant select on public.app_users to authenticated;
grant select, insert, update, delete on public.app_users to service_role;
grant select, insert, update, delete on public.professionals to service_role;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_users
    where auth_user_id = (select auth.uid())
      and role = 'admin'
      and active is true
  )
$$;

create or replace function private.current_professional_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select professional_id
  from public.app_users
  where auth_user_id = (select auth.uid())
    and active is true
  limit 1
$$;

revoke all on function private.is_admin() from public, anon;
revoke all on function private.current_professional_id() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;
grant execute on function private.current_professional_id() to authenticated, service_role;

drop policy if exists "users_read_own_or_admin" on public.app_users;
create policy "users_read_own_or_admin"
on public.app_users for select
to authenticated
using (
  auth_user_id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists "users_admin_insert" on public.app_users;
create policy "users_admin_insert"
on public.app_users for insert
to authenticated
with check ((select private.is_admin()));

drop policy if exists "users_admin_update" on public.app_users;
create policy "users_admin_update"
on public.app_users for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "users_admin_delete" on public.app_users;
create policy "users_admin_delete"
on public.app_users for delete
to authenticated
using ((select private.is_admin()));

-- Esta vista omite paciente, tratamiento, notas y pagos. Solo informa si un
-- recurso esta ocupado, por quien y en que bloque horario.
create or replace view public.resource_occupancy
with (security_invoker = false, security_barrier = true) as
select
  resource_id,
  professional_id,
  appointment_date,
  appointment_time,
  status
from public.appointments
where resource_id is not null
  and resource_id <> 'res-none'
  and status <> 'cancelled';

revoke all on public.resource_occupancy from public, anon;
grant select on public.resource_occupancy to authenticated, service_role;

commit;

